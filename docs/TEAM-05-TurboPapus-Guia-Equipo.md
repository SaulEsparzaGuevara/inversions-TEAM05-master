# TEAM-05 "TurboPapus" — Guía Completa del Equipo

**Versión**: 1.0 | **Fecha**: 2026-05-22 | **Autor**: TurboPapus

---

## Índice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Pipeline de Trabajo](#2-pipeline-de-trabajo)
3. [Arquitectura General](#3-arquitectura-general)
4. [Backend — Completado](#4-backend--completado)
5. [Frontend — Completado](#5-frontend--completado)
6. [Fuentes de Datos Reales](#6-fuentes-de-datos-reales)
7. [Lo que Está Pendiente](#7-lo-que-está-pendiente)
8. [Problemas Técnicos Resueltos](#8-problemas-técnicos-resueltos)
9. [Cómo Ejecutar el Proyecto](#9-cómo-ejecutar-el-proyecto)
10. [Checklist de Tareas Pendientes](#10-checklist-de-tareas-pendientes)
11. [Glosario](#11-glosario)

---

## 1. Resumen Ejecutivo

Somos **TEAM-05 "TurboPapus"** y hemos implementado el feature de **análisis institucional y estrategias de cobertura** (Protective Put, Married Put, Collar Put, Covered Straddle) con Chat IA explicativo vía Google Gemini.

El proyecto es un **monorepo (npm workspaces)** con 5 paquetes:

| Paquete | Ruta | Tecnología |
|---------|------|-----------|
| `@inversions/rest-api` | `projects/rest-api/inversions_api/` | Express.js + TypeScript + Supabase |
| `@inversions/pwa` | `projects/pwa/inversions_app/` | React 18 + Vite + TypeScript |
| `@inversions/types` | `projects/packages/types/` | Tipos compartidos |
| `@inversions/utils` | `projects/packages/utils/` | Utilidades compartidas |
| `@inversions/ui-library` | `projects/packages/ui-library/` | Componentes UI compartidos |

**Logros clave**:
- 14 tareas canónicas + 8 derivadas + 3 transversales + tests completados
- Motores de cobertura con matemática pura (sin APIs externas)
- Parsers reales para SEC EDGAR 13F y FINRA Short Interest
- Chat IA con Gemini 2.5-flash con polling asíncrono y degradación controlada
- Frontend PWA con 4 páginas nuevas, gráficos interactivos y navegación SPA
- Cobertura de tests: 23 suites, 70 tests, 0 fallos
- Lint: 0 errores (`tsc --noEmit`)

---

## 2. Pipeline de Trabajo

Usamos el pipeline **Diana → Speckit** para todo el desarrollo:

```
Diana Canon
    │
    ▼
speckit.specify → specs/006-team-05-institucional-cobertura/spec.md
    │
    ▼
speckit.clarify → 5 preguntas resueltas (trazabilidad, latencia, roles, degradación, retención)
    │
    ▼
speckit.checklist → 16 ítems de calidad validados
    │
    ▼
speckit.plan → specs/006-team-05-institucional-cobertura/plan.md
    │
    ▼
speckit.tasks → specs/006-team-05-institucional-cobertura/tasks.md
    │
    ▼
speckit.implement → Código en projects/rest-api/inversions_api/
```

### Decisiones de Clarificación

| # | Pregunta | Decisión |
|---|----------|----------|
| Q1 | ¿Trazabilidad del Chat IA? | Completa: `context_id`, estrategia, evidencia, timestamp, model_version, hash |
| Q2 | ¿Latencia del flujo completo? | p95 ≤ 5s con fallback async (polling 2s, timeout 30s, max 15 intentos) |
| Q3 | ¿Roles de acceso? | Solo `analyst` y `risk_manager` |
| Q4 | ¿Degradación ante falla IA? | Devolver cálculo + flag `ai_unavailable` |
| Q5 | ¿Retención de trazas? | 365 días |

---

## 3. Arquitectura General

```
Frontend (React PWA) :3001       Backend (Express) :3000
┌──────────────────────┐         ┌──────────────────────────┐
│  BrowserRouter       │  fetch  │  index.ts                │
│  MainLayout          │ ──────→ │  ├─ /api/institutional/* │
│  ├─ Institutional    │         │  ├─ /api/coverage/*      │
│  ├─ Regulatory       │ ←────── │  ├─ /api/ai/*            │
│  ├─ Coverage         │  JSON   │  └─ /health              │
│  └─ AI Chat          │         │                          │
│  store/chat.ts       │         │  Módulos:                │
│  services/           │         │  ├─ institutional/       │
└──────────────────────┘         │  ├─ strategies/coverage/ │
                                 │  ├─ ai/                  │
  Vite proxy :3001 → :3000       │  └─ lib/resilience/      │
  (configurado en vite.config.ts) └──────────────────────────┘
```

### Endpoints Activos

| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| GET | `/health` | Health check | ✅ |
| GET | `/api/institutional/analysis` | Análisis institucional con zonas S/R | ✅ |
| GET | `/api/institutional/positions` | Posiciones regulatorias 13F | ✅ |
| POST | `/api/coverage/analyze` | Ejecuta los 4 motores de cobertura | ✅ |
| POST | `/api/coverage/compare` | Compara estrategias y recomienda la mejor | ✅ |
| POST | `/api/coverage/simulate` | Simulación Monte Carlo / determinista | ✅ |
| POST | `/api/ai/institutional-chat` | Chat IA vía Gemini (202 + polling) | ✅ |
| GET | `/api/ai/institutional-chat/poll/:id` | Polling de respuesta Gemini | ✅ |

---

## 4. Backend — Completado

### 4.1 Flujo A — Contexto Institucional (T106–T112)

| Tarea | Archivo | Descripción |
|-------|---------|-------------|
| T106 | `src/modules/institutional/institutionalContract.ts` | Contrato de parámetros: tipos `InstitutionalAnalysisPeriod`, `InstitutionalHorizon`, `InstitutionalLiquidity`, factory con validación |
| T107 | `src/modules/institutional/institutionalDataService.ts` | Servicio multi-fuente con caché, rate limiting, fallback, parsers normalizados (1162 líneas) |
| T108 | `src/modules/institutional/institutionalZonesEngine.ts` | Motor de zonas S/R: detección de pivotes, clustering (tolerance 1.25%), scoring de fortaleza |
| T111 | `src/routes/institutional/institutionalAnalysis.ts` | GET `/api/institutional/analysis?ticker=SPY&period=daily&horizon=medium` |
| T112 | `src/routes/institutional/regulatoryPositions.ts` | GET `/api/institutional/positions?ticker=SPY&period=daily&horizon=medium` |

### 4.2 Flujo B — Estrategias de Cobertura (T113–T120)

Todos los archivos están en `projects/rest-api/inversions_api/src/modules/strategies/coverage/`:

| Tarea | Archivo | Descripción |
|-------|---------|-------------|
| T113 | `coverageStrategyContract.ts` | Contrato base: `CoverageStrategyKind`, `CoverageOptionLeg`, validadores |
| T114 | `protectivePutEngine.ts` | Protective Put + Married Put: payoff 9 puntos, breakeven, max profit/loss, alertas |
| T115 | `collarEngine.ts` | Collar Put: rango protección/techo, costo neto, zero-cost collar, stop-loss |
| T116 | `coveredStraddleEngine.ts` | Covered Straddle: primas, margen (Regla T), riesgo ilimitado, stop-loss |
| T117 | `coverageSimulationEngine.ts` | Simulación: Monte Carlo (10k iteraciones), determinista, backtesting |
| T118 | `coverageRiskService.ts` | Alertas: stop-loss, margen, notificaciones |
| T119 | `coverageReportService.ts` | Reporting: resumen, estadísticas, exportación (json, md, csv) |
| T120 | `coverageComparator.ts` | Comparador: scoring 4 dimensiones (pnl, costEfficiency, risk, contextFit), ranking |
| — | `coverageTypes.ts` | Tipos compartidos (641 líneas): 15+ interfaces, type guards, factories |
| — | `coverageStrategyAdapter.ts` | Adaptador al estándar transversal `StrategyOutput` (T173) |

### 4.3 Flujo C — Chat IA con Gemini (T121)

| Archivo | Descripción |
|---------|-------------|
| `src/modules/ai/institutionalCopilotChat.ts` | Servicio de chat con Gemini 2.5-flash, polling asíncrono, degradación |
| `src/routes/ai/institutionalCopilot.ts` | Router: POST (submit) + GET (polling) |

**Modelo**: `gemini-2.5-flash` con `responseMimeType: "application/json"` y `maxOutputTokens: 8192`

**Flujo**:
1. POST → `submit()` → si Gemini responde en ≤5s → respuesta directa
2. Si tarda >5s → HTTP 202 con `pollingUrl`
3. GET `/poll/:responseId` cada 2s (máx 15 intentos = 30s)
4. Si expira → `ai_unavailable: true`

### 4.4 Flujo D — Contratos, API y Observabilidad (T200–T210, T173)

| Tarea | Archivo( s) | Descripción |
|-------|-------------|-------------|
| T200 | `specs/006-team-05-institucional-cobertura/contracts/*.v1.json` | 3 contratos JSON: `institutional_context`, `strategy`, `explanation` |
| T201 | `src/database/supabase/migrations/008_institutional_copilot.sql` | 3 tablas: `institutional_contexts`, `evidence_blobs`, `explanation_responses` |
| T202 | `src/jobs/purgeEvidenceJob.ts` | Purge job: retención configurable (default 365 días) |
| T203 | `src/observability/coverageMetrics.ts` | Métricas: latencia, P95, AI unavailable count, polling attempts |
| T204 | `tests/fixtures/coverage/` | 3 fixtures: nominal (SPY), stress tail (25% drop), low-liquidity |
| T205 | `tools/reconstruct_explanation.ts` | CLI: `npx tsx tools/reconstruct_explanation.ts <context_id>` |
| T206 | `scripts/validate-contract-compat.sh` | Script bash de validación de contratos |
| T207 | `tests/unit/contracts/coverageContract.test.ts` | Tests de contratos JSON |
| T208 | `src/lib/resilience/` | `retryWithBackoff.ts`, `staleInput.ts`, `partialDataHandler.ts` |
| T209 | `specs/006-team-05-institucional-cobertura/catalogs/market-scenarios.md` | 7 escenarios extremos (ST-01 a ST-07) |
| T210 | `ops/docs/retention.md` | Documentación de retención y storage tiering |
| T173 | `coverageStrategyAdapter.ts` | Adaptador al estándar transversal |

### 4.5 Endpoints REST de Cobertura (T304–T306)

| Tarea | Archivo | Descripción |
|-------|---------|-------------|
| T304 | `src/routes/coverage/analyze.ts` | POST: ejecuta los 4 motores, retorna resultados |
| T305 | `src/routes/coverage/compare.ts` | POST: ejecuta comparador, retorna ranking |
| T306 | `src/routes/coverage/simulate.ts` | POST: ejecuta simulación Monte Carlo/determinista |

---

## 5. Frontend — Completado

Todos los archivos están en `projects/pwa/inversions_app/`.

### 5.1 Infraestructura (T300–T303)

| Tarea | Archivo | Descripción |
|-------|---------|-------------|
| T300 | `package.json` | Instalación de `react-router-dom` |
| T301 | `src/main.tsx` | `BrowserRouter` con 4 rutas nuevas |
| T302 | `src/layouts/MainLayout.tsx` | Layout compartido con sidebar de navegación |
| T303 | `src/store/chat.ts` | `ChatState` con `useSyncExternalStore` para historial del chat |

### 5.2 Institutional Analysis Page (T307–T309)

| Tarea | Archivo | Descripción |
|-------|---------|-------------|
| T307 | `src/services/institutional/institutionalApi.ts` | Funciones fetch para análisis y posiciones |
| T308 | `src/pages/institutional/InstitutionalAnalysisPage.tsx` | Inputs: ticker, dropdowns período/horizonte. Muestra zonas S/R, tendencias, métricas |
| T309 | `src/main.tsx` | Ruta `/institutional/analysis` |

### 5.3 Regulatory Positions Page (T310–T312)

| Tarea | Archivo | Descripción |
|-------|---------|-------------|
| T310 | `src/services/institutional/institutionalApi.ts` | Métodos fetch para posiciones regulatorias |
| T311 | `src/pages/institutional/RegulatoryPositionsPage.tsx` | Tabla 13F, flujos (inflows/outflows), ownership, cache indicator |
| T312 | `src/main.tsx` | Ruta `/institutional/positions` |

### 5.4 Coverage Strategies Page (T313–T316)

| Tarea | Archivo | Descripción |
|-------|---------|-------------|
| T313 | `src/services/coverage/coverageApi.ts` | Funciones fetch para analyze, compare, simulate |
| T314 | `src/components/coverage/PayoffChart.tsx` | Gráfico interactivo con `lightweight-charts` |
| T315 | `src/pages/coverage/CoverageStrategiesPage.tsx` | Formulario, tabla comparativa, payoff charts, risk metrics, ranking |
| T316 | `src/main.tsx` | Ruta `/coverage/strategies` |

### 5.5 AI Chat Page (T317–T321)

| Tarea | Archivo | Descripción |
|-------|---------|-------------|
| T317 | `src/services/ai/aiChatApi.ts` | Funciones fetch para submit y polling |
| T318 | `src/components/ai/ChatHistory.tsx` | Historial de preguntas/respuestas con store |
| T319 | `src/components/ai/ScenarioAnalysisCards.tsx` | Tarjetas de análisis de escenarios |
| T320 | `src/pages/ai/AIChatPage.tsx` | Chat completo: contexto, pregunta, polling, narrativa, degradación |
| T321 | `src/main.tsx` | Ruta `/ai/chat` |

---

## 6. Fuentes de Datos Reales

### 6.1 FINRA Short Interest (T333) — ✅ COMPLETADO

**Archivo**: `projects/rest-api/inversions_api/src/modules/institutional/realSourceParsers.ts`

**Cómo funciona**:
- `ensureFinraCache()` carga el dataset completo al arrancar (hasta 6 páginas × 5000 registros)
- Almacena en `Map<string, FinraRecord[]>` a nivel de módulo
- Promise compartida para deduplicar inicios concurrentes
- Primer llamado: ~4.6s. Llamados subsecuentes: ~0.06ms
- **Fallback**: si el ticker no está en caché, retorna observación sintética con confianza 0.3

**Eager preload** en `bootstrap.ts`:
```typescript
ensureFinraCache().catch(() => {});
```

### 6.2 SEC EDGAR 13F (T334) — ✅ COMPLETADO

**Archivo**: `projects/rest-api/inversions_api/src/modules/institutional/realSourceParsers.ts`

**Cómo funciona**:
1. Busca en EFTS (SEC Elasticsearch) filing 13F-HR que mencionen el ticker objetivo
2. Para los primeros 5 resultados, lista el directorio y encuentra el XML con la tabla de holdings
3. Extrae posiciones por `nameOfIssuer` o CUSIP
4. Paralelizado con `Promise.all` (~3.4s vs 19s original)

### 6.3 Yahoo Finance Options Flow (T338) — ⬜ PENDIENTE

**Archivo**: `projects/rest-api/inversions_api/src/modules/institutional/realSourceParsers.ts`

**Qué falta implementar**:
- `fetchYahooOptions(ticker)` — obtener cadena de opciones desde `query1.finance.yahoo.com/v7/finance/options/{ticker}`
- `computeOptionsFlowSignal()` — detectar strikes donde volumen > 2× OI (señal "unusual")
- `parseYahooOptionsFlow()` — normalizar a `InstitutionalSourceObservation`
- Registrar source `yahoo-options-flow` en `bootstrap.ts`

### 6.4 Yahoo Finance Institutional (T339) — ⬜ PENDIENTE

**Archivo**: `projects/rest-api/inversions_api/src/modules/institutional/realSourceParsers.ts`

**Qué falta implementar**:
- `fetchYahooInstitutional(ticker)` — obtener `quoteSummary.institutionOwnership` desde `query1.finance.yahoo.com/v10/finance/quoteSummary/{ticker}?modules=institutionOwnership`
- `parseYahooInstitutional()` — extraer holders count, % held, change → derivar inflows/outflows
- Registrar source `yahoo-institutional` en `bootstrap.ts`

### 6.5 Eliminación de Mocks (T340) — ⬜ PENDIENTE

**⚠️ IMPORTANTE**: No eliminar los mocks hasta que T338 y T339 estén completos y funcionales.

**Qué archivos modificar**:
- `src/routes/institutional/bootstrap.ts`:
  - Eliminar `createMockInstitutionalFetch()`
  - Eliminar `buildMockPayload()`
  - Eliminar `createMixedFetch()` — reemplazar por `globalThis.fetch` directo
  - Eliminar configs `unusual-whales` y `finviz-institutional`
  - Agregar configs `yahoo-options-flow` y `yahoo-institutional`
- `src/modules/institutional/institutionalDataService.ts`:
  - Eliminar `parseUnusualWhales()` (línea 609)
  - Eliminar `parseFinvizInstitutional()` (línea 634)

---

## 7. Lo que Está Pendiente

### 7.1 Alta Prioridad — Yahoo Finance + Mock Cleanup

```
FASE 1 (en paralelo)     FASE 2          FASE 3
┌──────────────┐        ┌──────────────┐ ┌──────────────┐
│ T338: Yahoo  │        │ T340: Elim.  │ │ T341: Data   │
│ Options Flow │───────→│ Mock Infra   │─→│ Source Docs  │
└──────────────┘        └──────────────┘ └──────────────┘
┌──────────────┐
│ T339: Yahoo  │───────→
│ Inst. Owners│
└──────────────┘
```

#### T338: Yahoo Finance Options Flow Parser

**Archivo**: `projects/rest-api/inversions_api/src/modules/institutional/realSourceParsers.ts`

Implementar:

```typescript
// 1. Obtener cadena de opciones
async function fetchYahooOptions(ticker: string): Promise<{
  calls: Array<{ strike: number; volume: number; openInterest: number }>;
  puts: Array<{ strike: number; volume: number; openInterest: number }>;
  underlyingPrice: number;
}> {
  const url = `https://query1.finance.yahoo.com/v7/finance/options/${ticker}`;
  const resp = await fetch(url);
  const json = await resp.json();
  // Parsear json.optionChain.result[0].options[0]
}

// 2. Detectar señales "unusual"
function computeOptionsFlowSignal(options: OptionsChain): {
  bullishCount: number;
  bearishCount: number;
  signals: Array<{ strike: number; type: "call" | "put"; volumeRatio: number }>;
} {
  // Volumen > 2× OI = señal "unusual"
  // Call con volumen inusual = bullish
  // Put con volumen inusual = bearish
}

// 3. Normalizar a InstitutionalSourceObservation
export async function parseYahooOptionsFlow(
  _payload: unknown,
  request: InstitutionalAnalysisContract,
  source: InstitutionalSourceConfig
): Promise<InstitutionalSourceObservation | null> {
  // Usa fetchYahooOptions + computeOptionsFlowSignal
  // confidence basado en cantidad de señales detectadas
}
```

Registrar en `bootstrap.ts` → `buildDefaultSourceConfigs()`:
```typescript
{
  sourceId: "yahoo-options-flow",
  kind: "yahoo_options_flow",
  label: "Yahoo Finance Options Flow",
  enabled: true,
  tier: "free",
  baseUrl: "https://query1.finance.yahoo.com",
  path: "/v7/finance/options",
  priority: 3, // reemplaza unusual-whales
  cacheTtlMs: 120_000,
  rateLimitPerMinute: 30,
  parser: parseYahooOptionsFlow
}
```

#### T339: Yahoo Finance Institutional Parser

**Archivo**: `projects/rest-api/inversions_api/src/modules/institutional/realSourceParsers.ts`

Implementar:

```typescript
// 1. Obtener ownership institucional
async function fetchYahooInstitutional(ticker: string): Promise<{
  holders: Array<{ name: string; shares: number; change: number }>;
  totalHolders: number;
  pctHeld: number;
}> {
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=institutionOwnership`;
  const resp = await fetch(url);
  const json = await resp.json();
  // Parsear json.quoteSummary.result[0].institutionOwnership
}

// 2. Normalizar a InstitutionalSourceObservation
export async function parseYahooInstitutional(
  _payload: unknown,
  request: InstitutionalAnalysisContract,
  source: InstitutionalSourceConfig
): Promise<InstitutionalSourceObservation | null> {
  // Extraer holders, % held, change → inflows/outflows
}
```

Registrar en `bootstrap.ts`:
```typescript
{
  sourceId: "yahoo-institutional",
  kind: "yahoo_institutional",
  label: "Yahoo Finance Institutional",
  enabled: true,
  tier: "free",
  baseUrl: "https://query1.finance.yahoo.com",
  path: "/v10/finance/quoteSummary",
  priority: 4, // reemplaza finviz-institutional
  cacheTtlMs: 600_000,
  rateLimitPerMinute: 10,
  parser: parseYahooInstitutional
}
```

#### T340: Eliminar Mock Infrastructure

**⚠️ NO HACER hasta que T338 y T339 estén funcionando correctamente.**

Archivo `projects/rest-api/inversions_api/src/routes/institutional/bootstrap.ts`:
1. Eliminar función `createMockInstitutionalFetch()` (~línea 312)
2. Eliminar función `buildMockPayload()` (~línea 337)
3. Eliminar función `createMixedFetch()` (~línea 300)
4. En `getInstitutionalRouteContext()` (~línea 86), cambiar:
   ```typescript
   // Antes:
   fetchImpl: createMixedFetch()
   // Después:
   fetchImpl: globalThis.fetch.bind(globalThis)
   ```
5. Eliminar `parseUnusualWhales()` y `parseFinvizInstitutional()` de `institutionalDataService.ts`
6. Eliminar configs `unusual-whales` y `finviz-institutional` de `buildDefaultSourceConfigs()`

#### T341: Data Source Matrix Documentation

Actualizar la Data Source Matrix en estos archivos cuando T338-T340 estén completos:
- `specs/006-team-05-institucional-cobertura/tasks.md`
- `specs/006-team-05-institucional-cobertura/spec.md`
- `specs/006-team-05-institucional-cobertura/plan.md`
- `specs/007-team-05-frontend-cobertura/tasks.md`
- `specs/007-team-05-frontend-cobertura/spec.md`
- `specs/007-team-05-frontend-cobertura/plan.md`

Cambiar el estado de Yahoo Finance Options Flow e Institutional de ⬜ PENDIENTE a ✅ REAL.

### 7.2 Prioridad Media

| Tarea | Descripción | Archivos |
|-------|-------------|----------|
| T214 | Upstream source failure degradation: cuando una fuente falla, incluir `sourceReports[].status = "error"` en la respuesta. Si todas fallan, retornar HTTP 503. | `institutionalDataService.ts`, `institutionalAnalysis.ts`, `regulatoryPositions.ts` |
| — | Ampliar mapa CUSIP en `cusipForTicker()` — solo tiene 12 tickers (AAPL, MSFT, GOOGL, GOOG, AMZN, META, TSLA, NVDA, JPM, V, SPY, QQQ) | `realSourceParsers.ts` |
| — | Tests de integración para fuentes reales (SEC, FINRA) | `tests/integration/institutional/` |

### 7.3 Issues Conocidos

| Issue | Archivo | Descripción |
|-------|---------|-------------|
| Mocks activos | `bootstrap.ts` | Institutional analysis usa datos sintéticos (mock) hasta T338-T340 |
| Yahoo parsers | `realSourceParsers.ts` | No implementados — el único reemplazo gratuito para Unusual Whales y Finviz |
| Gemini API key | `.env` | Requiere `GEMINI_API_KEY` configurada manualmente en cada entorno |
| FINRA preload | `bootstrap.ts` | `ensureFinraCache()` corre al arrancar — si falla, las fuentes FINRA devuelven null |
| SEC parsing | `realSourceParsers.ts` | Depende de `cusipForTicker()` — solo 12 tickers mapeados. Puede fallar para tickers sin CUSIP |

---

## 8. Problemas Técnicos Resueltos

| Problema | Síntoma | Solución |
|----------|---------|----------|
| npm fallaba en WSL | Errores de permisos en `/mnt/c/` | Mover proyecto a filesystem nativo WSL (`/home/...`) |
| ts-node no soporta NodeNext | `MODULE_NOT_FOUND` con imports `.js` | Reemplazar `ts-node` por `tsx` en script `dev` |
| `.env` propiedad de root | `EACCES: permission denied` al editar | `rm` + crear archivo nuevo |
| Gemini 2.0-flash quota excedido | HTTP 429 | Cambiar a `gemini-2.5-flash` |
| Gemini-flash-latest no devuelve JSON | Markdown en vez de JSON | No soporta `responseMimeType`, migrar a 2.5-flash |
| Respuesta truncada | JSON inválido, `finishReason: MAX_TOKENS` | Aumentar `maxOutputTokens` de 2048 a 8192 |
| Archivos en directorio incorrecto | Lint pasaba pero archivos en raíz | Mover a `projects/rest-api/inversions_api/` |
| SEC buscaba 13F de la empresa incorrecta | Datos vacíos | Buscar en EFTS filings 13F-HR que mencionen el ticker |
| FINRA report 404 | Archivos CSV ya no existen | Usar API POST con paginación (5000 reg/pág, 6 págs) |

### Migración NodeNext

El `tsconfig.json` usa `module: "NodeNext"` y `moduleResolution: "NodeNext"`. **Todos los imports relativos deben incluir extensión `.js`**:

```typescript
// ✅ Correcto
import { algo } from "./modulo.js";

// ❌ Incorrecto
import { algo } from "./modulo";
```

---

## 9. Cómo Ejecutar el Proyecto

### Requisitos

- Node.js ≥ 18
- npm ≥ 9
- PowerShell (para scripts de dev)
- Google Gemini API Key (para chat IA)

### Inicialización

```bash
# Instalar dependencias (desde la raíz)
npm install

# Configurar API key de Gemini
cp projects/rest-api/inversions_api/.env.example projects/rest-api/inversions_api/.env
# Editar .env y agregar: GEMINI_API_KEY=AIzaSy...
```

### Arrancar

```bash
# Opción 1: Backend y frontend por separado (recomendado para desarrollo)
npm run -w @inversions/rest-api dev   # Backend en :3000
npm run -w @inversions/pwa dev        # Frontend en :3001

# Opción 2: Scripts PowerShell
npm run dev:clean-start               # Arranca ambos
npm run dev:status                    # Ver estado
npm run dev:clean-stop                # Detener
```

### Tests y Lint

```bash
# Todos los tests
npm test

# Solo backend
npm run -w @inversions/rest-api test

# Solo frontend
npm run -w @inversions/pwa test

# Lint completo (TypeScript check)
npm run lint
```

### Pruebas Manuales con curl

```bash
# Análisis institucional
curl "http://localhost:3000/api/institutional/analysis?ticker=AAPL&period=daily&horizon=medium"

# Posiciones regulatorias
curl "http://localhost:3000/api/institutional/positions?ticker=SPY&period=monthly&horizon=long"

# Analizar cobertura
curl -X POST http://localhost:3000/api/coverage/analyze \
  -H "Content-Type: application/json" \
  -d '{"ticker":"AAPL","currentPrice":192.25,"shares":100,"strikes":[180,190,200]}'

# Comparar estrategias
curl -X POST http://localhost:3000/api/coverage/compare \
  -H "Content-Type: application/json" \
  -d '{"ticker":"AAPL","currentPrice":192.25,"shares":100,"strikes":[180,190,200],"capital":20000,"riskTolerancePct":0.1}'

# Chat IA (requiere GEMINI_API_KEY en .env)
curl -X POST http://localhost:3000/api/ai/institutional-chat \
  -H "Content-Type: application/json" \
  -d '{"ticker":"SPY","currentPrice":450,"zones":{"all":[],"support":[],"resistance":[]},"question":"¿Qué riesgo tiene esta posición?","userRole":"analyst"}'

# Polling del chat (usar responseId del POST anterior)
curl "http://localhost:3000/api/ai/institutional-chat/poll/<responseId>"
```

---

## 10. Checklist de Tareas Pendientes

### Alta Prioridad

- [ ] **T338**: Yahoo Finance Options Flow parser → `realSourceParsers.ts`, `bootstrap.ts`
- [ ] **T339**: Yahoo Finance Institutional parser → `realSourceParsers.ts`, `bootstrap.ts`
- [ ] **T340**: Eliminar mock infrastructure → `bootstrap.ts`, `institutionalDataService.ts` (solo después de T338+T339)
- [ ] **T341**: Data Source Matrix documentation → specs 006 y 007

### Prioridad Media

- [ ] **T214**: Upstream source failure degradation (status error + HTTP 503)
- [ ] Ampliar mapa CUSIP en `cusipForTicker()` (solo 12 tickers actualmente)
- [ ] Tests de integración para fuentes reales (SEC, FINRA)

### Prioridad Baja

- [ ] Dashboard de monitoreo de fuentes
- [ ] UI para estado de caché de fuentes
- [ ] Documentación operativa adicional

---

## 11. Glosario

| Término | Significado |
|---------|-------------|
| **Protective Put** | Comprar acciones + comprar put (protección contra caídas, riesgo limitado) |
| **Married Put** | Mismo que Protective Put (sinónimo) |
| **Collar Put** | Comprar put + vender call → rango acotado protección/techo, puede ser zero-cost |
| **Covered Straddle** | Tener acciones + vender put + vender call → ingreso por primas, riesgo ilimitado |
| **Zero-Cost Collar** | Collar donde prima del put y prima del call se cancelan → netPremium ≈ $0 |
| **ATM** | At-The-Money: strike ≈ precio actual |
| **OI** | Open Interest: contratos de opciones abiertos |
| **IV** | Implied Volatility: volatilidad implícita |
| **VaR95** | Value at Risk 95%: pérdida máxima esperada en el 95% de escenarios |
| **Confianza ALTA** | Score compuesto ≥ 0.70 — fuerte confluencia entre indicadores |
| **Confianza MEDIA** | Score ≥ 0.40 — señales mixtas o acuerdo moderado |
| **Confianza BAJA** | Score < 0.40 — alta incertidumbre o señales débiles |
| **netPremium** | Flujo neto de caja para abrir la posición. NO es comisión ni margen |
| **RNF** | Requisito No Funcional |
| **RF** | Requisito Funcional |
| **S/R** | Soporte y Resistencia |
| **13F** | Reporte trimestral de tenencias institucionales (SEC) |
| **FINRA** | Financial Industry Regulatory Authority (datos de short interest) |

---

## Documentación Relacionada

| Archivo | Descripción |
|---------|-------------|
| `docs/TEAM-05-TurboPapus-implementacion.md` | Informe detallado de implementación (724 líneas) |
| `docs/TEAM-05-backend-architecture.md` | Arquitectura del backend (mock vs real, flujos) |
| `docs/TEAM-05-cobertura-cost-risk-guide.md` | Guía semántica de indicadores cost/risk |
| `specs/006-team-05-institucional-cobertura/` | Specs del feature institucional-cobertura |
| `specs/007-team-05-frontend-cobertura/` | Specs del feature frontend-cobertura |
| `ops/docs/retention.md` | Documentación de retención de datos |
