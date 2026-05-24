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

## 1. Institutional — Mock Data

### Bootstrap (`routes/institutional/bootstrap.ts`)

La función `getInstitutionalRouteContext()` (línea 80) arranca toda la tubería:

```
getInstitutionalRouteContext()
  → InstitutionalDataService(fetchImpl: createMockInstitutionalFetch())
  → InstitutionalZonesEngine(candles: sintéticas sinusoidales)
```

### Contracto desde request

`buildInstitutionalAnalysisContractFromRequest()` (línea 102) genera datos sintéticos a partir del ticker, periodo y horizonte:

```ts
const seed = buildTickerSeed(ticker);
// buildTickerSeed("SPY") = 83('S') + 80('P') + 89('Y') = 252

const volume     = Math.round(900_000 + seed * 850 * periodFactor * horizonFactor);
const ownership  = Math.min(96, 18 + (seed % 34) + ((horizonFactor - 1) * 14));
const inflows    = volume * (0.34 + (seed % 5) * 0.03);
const outflows   = volume * (0.18 + (periodFactor - 1) * 0.05);
const positions  = Math.max(3, Math.round(seed / 11 + periodFactor * 4 + horizonFactor * 3));
```

Los **factores** varían según periodo y horizonte:

| Periodo | Factor | Horizonte | Factor |
|---------|--------|-----------|--------|
| intraday | 0.75 | short | 0.9 |
| daily | 1.0 | medium | 1.0 |
| weekly | 1.18 | long | 1.12 |
| monthly | 1.38 | | |
| quarterly | 1.58 | | |

Esto hace que el mismo ticker produzca **siempre los mismos números** (determinista), y tickers distintos produzcan datos distintos (porque cambia la suma de charCodes).

### Mock Fetch

`createMockInstitutionalFetch()` (línea 288) intercepta TODAS las URLs de fuentes. Sin importar si el path es `sec-edgar-13f`, `finra-short-interest`, `unusual-whales` o `finviz-institutional`, `buildMockPayload()` (línea 313) devuelve JSON sintético.

Las 4 fuentes configuradas en `buildDefaultSourceConfigs()` (línea 235) **todas** apuntan a `https://institutional.mock` — nunca se contacta un API real:

```ts
{
  sourceId: "sec-edgar-13f",
  kind: "sec_edgar_13f",
  label: "SEC EDGAR 13F",
  baseUrl: "https://institutional.mock",
  // ...
}
```

El mock fetch recibe el `input` (URL), lo parsea, extrae ticker/period/horizon de los query params y llama a `buildMockPayload()`.

### Motor de Zonas

`InstitutionalZonesEngine` recibe velas sintéticas (generadas con ondas sinusoidales), corre detección de pivotes y clustering por precio para producir zonas de soporte y resistencia. Las observaciones del `InstitutionalDataService` alimentan la confianza, volumen y liquidez de cada zona.

### InstitutionalDataService — Arquitectura

El servicio (1162 líneas en `institutionalDataService.ts`) está diseñado para producción, aunque el fetch actual sea mock:

- **Caché en memoria** con TTL configurable y evicción LRU (`Map<string, CacheEntry>`)
- **Rate limiting** por fuente con sliding window de 60 segundos
- **Fallback** entre fuentes ordenadas por prioridad
- **Parsers normalizados** por tipo de fuente (`parseSecEdgar13f`, `parseFinraShortInterest`, `parseUnusualWhales`, `parseFinvizInstitutional`)
- **Merge de observaciones**: promedia ownership, suma flujos, toma el máximo volumen, elige la liquidez más alta
- **Timeouts** con `AbortController` (default 12s)
- **API Key** soportada vía `source.apiKey` → header `Authorization: Bearer`
- **Manejo de errores** con tipos normalizados (`InstitutionalSourceError`)

Para conectar fuentes reales solo hay que cambiar el `fetchImpl` en `bootstrap.ts:87` — el resto del servicio ya soporta URLs reales, API keys, timeouts, parsers custom, etc.

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

## Resumen Mock vs Real

| Feature | Backend | Fuente de Datos | Real/Mock |
|---------|---------|-----------------|-----------|
| Análisis Institucional | `createMockInstitutionalFetch()` | `buildTickerSeed()` + factores | **Mock** |
| Posiciones Regulatorias | Misma tubería que analysis | `buildTickerSeed()` + factores | **Mock** |
| Zonas S/R | `InstitutionalZonesEngine` | Velas sinusoidales sintéticas | **Mock** |
| Estrategias Cobertura | `ProtectivePutEngine` / `CollarEngine` / `CoveredStraddleEngine` | Matemática pura sobre inputs del usuario | **Real** |
| Comparador Estrategias | `CoverageComparator` | Simulación + scoring determinista | **Real** |
| Simulación (Monte Carlo) | `CoverageSimulationEngine` | RNG con semilla + escenarios | **Real** |
| Chat IA | `InstitutionalCopilotChat` | Google Gemini API (`gemini-2.5-flash`) | **Real** |
| Polling IA | Mapa en memoria | Resultado de Gemini | **Real** |
