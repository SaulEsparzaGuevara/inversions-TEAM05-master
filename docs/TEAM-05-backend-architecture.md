# Backend TEAM-05 — TurboPapus

## Arquitectura General

Express.js en `src/index.ts` monta **3 grupos de rutas**:

| Ruta | Handler | Módulo |
|------|---------|--------|
| `GET /api/institutional/analysis` | `institutionalAnalysis.ts` | `InstitutionalDataService` + `InstitutionalZonesEngine` |
| `GET /api/institutional/positions` | `regulatoryPositions.ts` | Misma tubería que analysis |
| `POST /api/coverage/analyze` | `analyze.ts` | `ProtectivePutEngine` + `CollarEngine` + `CoveredStraddleEngine` |
| `POST /api/coverage/compare` | `compare.ts` | `CoverageComparator` |
| `POST /api/coverage/simulate` | `simulate.ts` | `CoverageSimulationEngine` |
| `POST /api/ai/institutional-chat` | `institutionalCopilot.ts` | `InstitutionalCopilotChat` → Gemini API |
| `GET /api/ai/institutional-chat/poll/:responseId` | `institutionalCopilot.ts` | Polling en memoria del resultado de Gemini |

---

## 1. Institutional — Fuentes Reales y Degradación

### Bootstrap (`routes/institutional/bootstrap.ts`)

La función `getInstitutionalRouteContext()` arranca toda la tubería con `globalThis.fetch` directo:

```
getInstitutionalRouteContext()
  → InstitutionalDataService(fetchImpl: globalThis.fetch)
  → InstitutionalZonesEngine(candles: sintéticas sinusoidales)
```

### Fuentes de datos reales

Las 4 fuentes configuradas apuntan a APIs reales:

| sourceId | API | Parser | Cache TTL |
|----------|-----|--------|-----------|
| `sec-edgar-13f` | EFTS + SEC.gov XML | `parseSecEdgar13fReal()` | 600s |
| `finra-short-interest` | FINRA API REST | `parseFinraShortInterestReal()` | 300s |
| `yahoo-options-flow` | Yahoo v7 Finance Options | `parseYahooOptionsFlow()` | 120s |
| `yahoo-institutional` | Yahoo v10 Quote Summary | `parseYahooInstitutional()` | 600s |

### Parsers Yahoo Finance

#### `yahooOptionsParser.ts` — Options Flow (T338)

Obtiene la cadena de opciones desde la API v7 de Yahoo Finance:
- Autenticación vía crumb (cookie + token) con flujo de 3 pasos
- Detección de strikes "unusual" (volumen > 2× open interest)
- Put/Call ratio por strike
- Confidence scoring basado en: expiraciones detectadas, strikes inusuales, volumen total, OI total
- Fallback sintético con `confidence = 0.3` cuando la API no responde

#### `yahooInstitutionalParser.ts` — Institutional Holdings (T339)

Obtiene tenencias institucionales desde la API v10 de Yahoo Finance:
- Extrae `institutionOwnership.ownershipList` (holders individuales)
- Extrae `majorHoldersBreakdown` (% held por instituciones)
- Calcula `fundsOwnershipPct` y flujos netos (inflows/outflows)
- Confidence scoring basado en: holders count, breakdown disponible, flujos calculados
- Fallback sintético con `confidence = 0.3` cuando la API no responde

### Degradación Gradual (T214)

El `InstitutionalDataService.resolve()` nunca lanza error. Cada fuente produce un `sourceReport` individual con su resultado:

```
sourceReports: Array<{
  sourceId: string;
  status: "ok" | "error" | "cached" | "rate_limited" | "skipped";
  latencyMs: number;
  error?: string;
}>
```

El `overallStatus` se computa automáticamente:
- **`"ok"`** — todas las fuentes retornaron datos
- **`"partial"`** — algunas fuentes fallaron, pero al menos una retornó datos
- **`"all_failed"`** — ninguna fuente retornó datos utilizables → HTTP 503

### Motor de Zonas

`InstitutionalZonesEngine` recibe velas sintéticas (generadas con ondas sinusoidales), corre detección de pivotes y clustering por precio para producir zonas de soporte y resistencia. Las observaciones del `InstitutionalDataService` alimentan la confianza, volumen y liquidez de cada zona.

### InstitutionalDataService — Arquitectura

El servicio (en `institutionalDataService.ts`) está diseñado para producción con fuentes reales:

- **Caché en memoria** con TTL configurable y evicción LRU (`Map<string, CacheEntry>`)
- **Rate limiting** por fuente con sliding window de 60 segundos
- **Fallback** entre fuentes ordenadas por prioridad
- **Parsers normalizados** por tipo de fuente (`parseSecEdgar13f`, `parseFinraShortInterest`, `parseYahooOptionsFlow`, `parseYahooInstitutional`)
- **Merge de observaciones**: promedia ownership, suma flujos, toma el máximo volumen, elige la liquidez más alta
- **Timeouts** con `AbortController` (default 12s)
- **API Key** soportada vía `source.apiKey` → header `Authorization: Bearer`
- **Manejo de errores** con tipos normalizados (`InstitutionalSourceError`)
- **Degradación gradual**: `overallStatus: "ok" | "partial" | "all_failed"` + HTTP 503

---

## 2. Coverage — Cálculos Reales

### POST /api/coverage/analyze

**Input:**
```json
{ "ticker": "SPY", "currentPrice": 450.50, "shares": 100, "strikes": [440, 460] }
```

**Flujo en `routes/coverage/analyze.ts`:**

1. **Validación**: ticker requerido, currentPrice > 0, shares entero positivo
2. **`buildContracts()`** (línea 21): genera 4 contratos (uno por estrategia)
3. Si el body trae `strikes[]`, se genera la leg correspondiente por tipo de estrategia:
   - `protective_put` / `married_put` → put long con strike = strikes[0]
   - `collar_put` → put long + call short (strikes[0] y strikes[last])
   - `covered_straddle` → put short + call short
4. Cada contrato se pasa al motor correspondiente:
   - `protective_put` / `married_put` → **ProtectivePutEngine.analyze()**
   - `collar_put` → **CollarEngine.analyze()**
   - `covered_straddle` → **CoveredStraddleEngine.analyze()**

**Cada motor ejecuta matemática pura:**

- Payoff en 9 puntos de precio (-20% a +20%)
- Breakeven price
- Max profit / Max loss
- Riesgo limitado vs ilimitado
- Protección máxima y precio piso
- Prima neta y costo/beneficio
- Stop-loss automático
- Alertas de ejercicio anticipado (ventana de 21 días)
- Alertas de margen (covered straddle)

No hay llamadas externas, no hay mock. Todo se deriva de los inputs del usuario.

### POST /api/coverage/compare

Crea un `CoverageComparator` que internamente usa `CoverageSimulationEngine`, `CoverageRiskService` y `CoverageReportService`. Ejecuta simulaciones para los 4 tipos de estrategia, las puntúa por PnL, eficiencia de costo, riesgo y context fit, y recomienda la mejor.

### POST /api/coverage/simulate

Usa `CoverageSimulationEngine` para ejecutar:
- Escenarios deterministas (subida/bajada porcentual)
- Simulación Monte Carlo con RNG con semilla
- Backtesting (si se proporcionan velas históricas)

---

## 3. AI Chat — Gemini API Real

### POST /api/ai/institutional-chat

**Input:**
```json
{
  "ticker": "SPY",
  "currentPrice": 450,
  "zones": { ... },
  "question": "¿Cuál es la mejor cobertura para SPY?"
}
```

**Flujo en `institutionalCopilot.ts`:**

1. Valida campos requeridos (ticker, currentPrice, zones, question)
2. Infiere rol: `admin`/`trader` → `analyst`, `viewer` → `risk_manager`
3. Crea `contextId` único
4. Llama a `InstitutionalCopilotChat.submit(context)` (línea 68)

**`InstitutionalCopilotChat.submit()`** (módulo `institutionalCopilotChat.ts`):

1. Construye un prompt combinando el contexto institucional y la pregunta
2. Llama a `runGeminiWorkflow()` (línea ~191) que:
   - Lee `GEMINI_API_KEY` de `process.env`
   - Hace POST a `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
   - Parsea la respuesta como JSON
3. Extrae del JSON: `narrative`, `reasoning[]`, `scenarioAnalysis[]`, `recommendation`
4. Calcula SHA256 hash de la respuesta serializada
5. Almacena el resultado en un `Map<string, InstitutionalCopilotJob>` en memoria
6. Devuelve `{ status: "pending", responseId, pollingUrl }` → HTTP 202

### GET /api/ai/institutional-chat/poll/:responseId

1. Busca el `responseId` en el Map de jobs en memoria
2. Si el job está `completed` → devuelve 200 con el resultado completo
3. Si el job está `pending` → devuelve 202
4. Si el job expiró o no existe → `ai_unavailable: true`
5. Timeout del lado del frontend: 15 intentos × 2s = 30s

**Degradación controlada**: si Gemini falla (timeout, 503, API key faltante), el servicio devuelve `{ ai_unavailable: true }` y el frontend muestra un banner con botón de reintento y link a AI Studio.

---

## Resumen Fuentes

| Feature | Backend | Fuente de Datos | Tipo |
|---------|---------|-----------------|------|
| SEC EDGAR 13F | `parseSecEdgar13fReal()` | EFTS + SEC.gov XML | **Real** |
| FINRA Short Interest | `parseFinraShortInterestReal()` | FINRA API REST (caché completa) | **Real** |
| Yahoo Options Flow | `parseYahooOptionsFlow()` | Yahoo v7 Finance (crumb auth) | **Real** |
| Yahoo Institutional | `parseYahooInstitutional()` | Yahoo v10 Quote Summary | **Real** |
| Análisis Institucional | `InstitutionalDataService` + `InstitutionalZonesEngine` | 4 fuentes reales + degradación gradual | **Real** |
| Posiciones Regulatorias | Misma tubería que analysis | Idem + sourceReports individuales | **Real** |
| Zonas S/R | `InstitutionalZonesEngine` | Velas sinusoidales sintéticas | **Sintético** |
| Estrategias Cobertura | `ProtectivePutEngine` / `CollarEngine` / `CoveredStraddleEngine` | Matemática pura sobre inputs del usuario | **Real** |
| Comparador Estrategias | `CoverageComparator` | Simulación + scoring determinista | **Real** |
| Simulación (Monte Carlo) | `CoverageSimulationEngine` | RNG con semilla + escenarios | **Real** |
| Chat IA | `InstitutionalCopilotChat` | Google Gemini API (`gemini-2.5-flash`) | **Real** |
| Polling IA | Mapa en memoria | Resultado de Gemini | **Real** |
