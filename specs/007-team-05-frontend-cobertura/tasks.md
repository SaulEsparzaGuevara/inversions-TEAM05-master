---
description: "Task list template for feature implementation"
---

# Tasks: 007-team-05-frontend-cobertura

**Input**: Design documents from `/specs/007-team-05-frontend-cobertura/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Data Source Matrix

Estado actual de las fuentes de datos que alimentan las páginas de Análisis Institucional (US2) y Posiciones Regulatorias (US3):

| Fuente | Tier | Estado | Implementada en | Parser |
|--------|------|--------|-----------------|--------|
| SEC EDGAR 13F | free | ✅ REAL | T334 | `parseSecEdgar13fReal()` |
| FINRA Short Interest | free | ✅ REAL | T333 | `parseFinraShortInterestReal()` |
| Yahoo Finance Options Flow | free | ✅ REAL | T338 | `parseYahooOptionsFlow()` |
| Yahoo Finance Institutional | free | ✅ REAL | T339 | `parseYahooInstitutional()` |

> **Nota**: Unusual Whales y Finviz Institutional fueron reemplazados por fuentes gratuitas de Yahoo Finance. Migración T338-T340 completada.

## Phase 1: Setup (Shared Infrastructure) (Completado)

**Purpose**: Project initialization and basic structure

- [x] T300 Install `react-router-dom` in `projects/pwa/inversions_app/package.json`

---

## Phase 2: Foundational (Blocking Prerequisites) (Completado)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T301 Update routing in `projects/pwa/inversions_app/src/main.tsx` to use `BrowserRouter` and wrap routes
- [x] T302 [P] Create `projects/pwa/inversions_app/src/layouts/MainLayout.tsx` for shared navigation sidebar + Top Navbar
- [x] T303 [P] Implement `ChatState` & `useSyncExternalStore` store in `projects/pwa/inversions_app/src/store/chat.ts` for session persistence

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: [US1] Backend Coverage Endpoints Exposure (RF-301) (Completado)

**Goal**: Exponer los motores de estrategia existentes como endpoints REST delegados listos para consumo del frontend.

**Independent Test**: Lanzar curl/Postman contra los endpoints `/api/coverage/*` retornando JSON válidos.

### Implementation for User Story 1

- [x] T304 [P] [US1] Create thin route POST `/api/coverage/analyze` in `projects/rest-api/inversions_api/src/routes/coverage/analyze.ts`
- [x] T305 [P] [US1] Create thin route POST `/api/coverage/compare` in `projects/rest-api/inversions_api/src/routes/coverage/compare.ts`
- [x] T306 [US1] Create thin route POST `/api/coverage/simulate` in `projects/rest-api/inversions_api/src/routes/coverage/simulate.ts`
  - [x] T306b Mount coverage router (`app.use("/api/coverage", coverageRouter)`) in `projects/rest-api/inversions_api/src/index.ts`

**Checkpoint**: Backend coverage features exposed via REST.

---

## Phase 4: [US2] Institutional Analysis Page (RF-302) (Completado)

**Goal**: Permitir consulta estructurada mediante Ticker, Período y Horizonte visualizando tendencias/zonas S-R.

⚠️ **Dependencia**: US2 consume datos de las fuentes en Phase 8 (T333-T334) y Phase 9 (T338-T339). Implementar en orden o en paralelo con asignación separada.

**Independent Test**: La ruta `/institutional/analysis` permite buscar un ticker con dropdowns predefinidos, y grafica estado S/R exitosamente.

### Implementation for User Story 2

- [x] T307 [P] [US2] Export API functions for `InstitutionalAnalysisPage` in `projects/pwa/inversions_app/src/services/institutional/institutionalApi.ts` using native fetch and `getAuthHeaders()`
- [x] T308 [US2] Implement `projects/pwa/inversions_app/src/pages/institutional/InstitutionalAnalysisPage.tsx` with predefined period/horizon dropdowns
- [x] T309 [US2] Link InstitutionalAnalysisPage to `projects/pwa/inversions_app/src/main.tsx` router

---

## Phase 5: [US3] Regulatory Positions Page (RF-303) (Completado)

**Goal**: Tabla 13F consolidada, Flujos, Inflows/Outflows, y métricas de Cache.

⚠️ **Dependencia**: US3 consume datos de las fuentes en Phase 8 (T333-T334) y Phase 9 (T338-T339). Implementar en orden o en paralelo con asignación separada.

**Independent Test**: La ruta `/institutional/positions` renderiza la tabla de posiciones con los flujos de dinero institucionales correctos.

### Implementation for User Story 3

- [x] T310 [P] [US3] Add Regulatory Positions fetch methods in `projects/pwa/inversions_app/src/services/institutional/institutionalApi.ts`
- [x] T311 [US3] Implement `projects/pwa/inversions_app/src/pages/institutional/RegulatoryPositionsPage.tsx` featuring 13F positions table and flow displays
- [x] T312 [US3] Link RegulatoryPositionsPage to `projects/pwa/inversions_app/src/main.tsx` router

---

## Phase 6: [US4] Coverage Strategies & Comparisons (RF-304) (Completado)

**Goal**: Proveer el explorador y payload visualizador de estrategias de cobertura institucionales.

**Independent Test**: La vista `/coverage/strategies` renderiza los gráficos de payoffs de opciones sin errores en navegadores.

### Implementation for User Story 4

- [x] T313 [P] [US4] Export coverage API methods (analyze, compare, simulate) in `projects/pwa/inversions_app/src/services/coverage/coverageApi.ts`
- [x] T314 [US4] Implement `projects/pwa/inversions_app/src/components/coverage/PayoffChart.tsx` utilizing `lightweight-charts`
- [x] T315 [US4] Implement `projects/pwa/inversions_app/src/pages/coverage/CoverageStrategiesPage.tsx`, checking edge-case "Option Chains Missing" rendering fallback instead of chart
- [x] T316 [US4] Link CoverageStrategiesPage to `projects/pwa/inversions_app/src/main.tsx` router

---

## Phase 7: [US5] AI Institutional Chat (RF-305) (Completado)

**Goal**: Panel de chat con AI que preserve historial persistente bajo la misma sesión de la pestaña actual.

**Independent Test**: Chat IA envía prompts, realiza polling progresivo visualmente, retiene historial al cambiar de vista y regresar, y tiene estado de degrado controlable.

### Implementation for User Story 5

- [x] T317 [P] [US5] Implement AI Chat endpoints interactions locally in `projects/pwa/inversions_app/src/services/ai/aiChatApi.ts`
- [x] T318 [P] [US5] Create `projects/pwa/inversions_app/src/components/ai/ChatHistory.tsx` wrapping the `src/store/chat.ts` `useSyncExternalStore` context
- [x] T319 [P] [US5] Create `projects/pwa/inversions_app/src/components/ai/ScenarioAnalysisCards.tsx`
- [x] T320 [US5] Implement `projects/pwa/inversions_app/src/pages/ai/AIChatPage.tsx` unifying ChatHistory, polling attempts up to 15 max with `ai_unavailable` manual-retry degradation logic
- [x] T321 [US5] Link AIChatPage to `projects/pwa/inversions_app/src/main.tsx` router

---

## Phase 8: Real Data Sources — SEC EDGAR & FINRA (Cross-Cutting) (Completado)

**Purpose**: Integrar fuentes de datos reales (SEC EDGAR, FINRA) y documentar semántica de indicadores.

### Real Source Parsers

- [x] T333 [P] Implement FINRA full-dataset lazy cache in `realSourceParsers.ts` with `ensureFinraCache()` — loads up to 6 pages (×5000 records), shared promise dedup, `Map<string, FinraRecord[]>` at module level
  - ✅ T333a Implement `fetchFinraPage()` with POST to `https://api.finra.org/data/group/otcmarket/name/consolidatedShortInterest`, CSV parsing
  - ✅ T333b Implement module-level `finraCache` + `finraCachePromise` with date boundary detection
  - ✅ T333c Add eager preload kickoff in `bootstrap.ts` — non-blocking `ensureFinraCache().catch(() => {})`
- [x] T334 [P] Implement SEC EDGAR real parser in `realSourceParsers.ts` — EFTS search for 13F-HR filings, XML directory enumeration, `informationTable` extraction via regex
  - ✅ T334a Implement `searchEfts(ticker, formType)` using `https://efts.sec.gov/LATEST/search-index`
  - ✅ T334b Implement `extractInfoTableEntries()` regex parser for XML `<infoTable>` blocks
  - ✅ T334c Implement `findXmlWithHoldings()` — iterate XML files in filing directory
  - ✅ T334d Implement `cusipForTicker()` mapping — **ampliado de 12 a ~60 tickers**
- [x] T335 [P] Implement graceful fallback in `parseFinraShortInterestReal` — when ticker not found in cached dataset, return synthetic low-confidence (0.3) observation instead of `null`
- [x] T336 Optimize SEC parser performance — reduce `MAX_FILINGS` from 8 to 5, remove artificial `delay(150)` calls, parallelize filing lookups with `Promise.all`

### Documentation & Semantics

- [x] T337 [P] Document cost/risk indicator semantics across spec docs:
  - ✅ T337a Add "Indicadores Cost/Risk — Semántica" section to `spec.md`
  - ✅ T337b Add "Real Data Sources" section to `plan.md`
  - ✅ T337c Add `RiskMetrics` conceptual table to `data-model.md`
  - ✅ T337d Add semantic `description` fields to `coverage-compare.schema.json`
  - ✅ T337e Add CHK023 checklist item for cost/risk indicator validation
  - ✅ T337f Create `docs/TEAM-05-cobertura-cost-risk-guide.md` — full explanatory guide

---

## Phase 9: Yahoo Finance Data Sources & Mock Cleanup (Completado)

**Purpose**: Reemplazar las fuentes mock (Unusual Whales, Finviz) por parsers reales gratuitos de Yahoo Finance. Limpiar código legacy de mock.

### Yahoo Finance Parsers (Completado)

- [x] T338 [P] Implement Yahoo Finance Options Flow parser in `yahooOptionsParser.ts` — replaces Unusual Whales
  - ✅ `fetchYahooOptions(ticker)` — fetch options chain from `query2.finance.yahoo.com/v7/finance/options/{ticker}`, parse calls/puts with volume and OI
  - ✅ `computeOptionsFlowSignal()` — detect strikes where volume > 2× OI ("unusual" signal), aggregate bullish/bearish flow
  - ✅ `parseYahooOptionsFlow()` — normalize to `InstitutionalSourceObservation` with confidence based on signal count
  - ✅ Registered `yahoo-options-flow` source in `bootstrap.ts` source configs

- [x] T339 [P] Implement Yahoo Finance Institutional parser in `yahooInstitutionalParser.ts` — replaces Finviz
  - ✅ `fetchYahooInstitutional(ticker)` — fetch quoteSummary from `query2.finance.yahoo.com/v10/finance/quoteSummary/{ticker}?modules=institutionOwnership`, parse holders count, % held, change
  - ✅ `parseYahooInstitutional()` — normalize to `InstitutionalSourceObservation`, derive inflows/outflows from share change
  - ✅ Registered `yahoo-institutional` source in `bootstrap.ts` source configs

### Mock Cleanup (Completado)

- [x] T340 [P] Remove mock infrastructure from `bootstrap.ts`:
  - ✅ Removed `createMockInstitutionalFetch()` and `buildMockPayload()` — no longer needed
  - ✅ Removed `createMixedFetch()` — replaced with native fetch directly
  - ✅ Removed `parseUnusualWhales()` and `parseFinvizInstitutional()` from `institutionalDataService.ts`
  - ✅ Removed `unusual-whales` and `finviz-institutional` source configs from `buildDefaultSourceConfigs()`

### Documentation (Completado)

- [x] T341 Document Data Source Matrix across spec docs:
  - ✅ T341a Add/update "Data Source Matrix" section in `tasks.md`
  - ✅ T341b Add/update "Data Source Matrix" section in `spec.md`
  - ✅ T341c Add/update "Data Source Matrix" section in `plan.md`
  - ✅ T341d Create `docs/TEAM-05-data-sources.md` — architecture doc with URLs, rate limits, cache TTL, API key requirements

---

## Dependencies & Execution Order

- **US1** can be executed natively in Backend independent of all Frontend.
- **US2, US3** consume data from Phase 8 (SEC EDGAR, FINRA) and Phase 9 (Yahoo Finance). Implement phases 8+9 before or in parallel with US2/US3.
- **US4, US5** depend only on Phase 2 being complete (routing, layout, store).
- **Phase 10** (Frontend API Performance) is additive on top of Phases 1-7 — all pages and API services must already exist. Can be implemented after any of Phases 2-7.

## Phase 10: Frontend API Performance Optimization (Cache, Retry, AbortController)

**Purpose**: Reducir latencia percibida, eliminar llamadas duplicadas y prevenir race conditions en las páginas que consumen APIs lentas (coverage, institutional).

**Independent Test**: Navegar entre páginas del mismo ticker no dispara requests repetidas; cambiar de ticker aborta la request en vuelo; errores 5xx/429 hacen retry automático visible en consola.

### In-Memory Cache Layer (Completado)

- [x] T342 [P] Create `apiCache.ts` in `projects/pwa/inversions_app/src/services/apiCache.ts` — module-level in-memory cache with configurable TTL (default 5 min), generic `getCached<T>()` / `setCache()` / `clearCache()` / `invalidateCache()` API. Cache key is built from URL + JSON-stringified body. Used via import singleton; no React dependency.

### Cache + Retry + AbortSignal in Coverage API (Completado)

- [x] T343 [P] Add cache-before-fetch in `coverageApi.ts` — `postCoverageAnalyze()`, `postCoverageCompare()`, `postCoverageSimulate()` check `getCached()` before fetch, store result via `setCache()` on success. Add `signal?: AbortSignal` parameter to all 3 functions, passed through to native `fetch()`.

- [x] T344 [P] Add `fetchWithRetry()` helper in `coverageApi.ts` — wraps `fetch()` with up to 2 retries on 5xx/429 responses, exponential backoff (1s, 2s), tracks `lastResponse` to avoid extra fetch at loop end. Non-500/429 errors and 2xx propagate immediately.

### Cache + Retry + AbortSignal in Institutional API (Completado)

- [x] T345 [P] Add same cache-before-fetch pattern + `fetchWithRetry()` in `institutionalApi.ts` — `getInstitutionalAnalysis()`, `getRegulatoryPositions()` benefit from in-memory cache across page navigations (eliminates ~90% of repeat calls). Both accept `signal?: AbortSignal`.

### Memoized Auth Headers (Completado)

- [x] T346 [P] Memoize `getAuthHeaders()` in `signalApi.ts` — cache `authToken` (from `localStorage.getItem("inversions.dev.token")` and `import.meta.env`) in module-level variable. Add `invalidateAuthCache()` exported function to reset on logout. Eliminates repeated synchronous localStorage reads on every API call.

### AbortController Integration in Pages (Completado)

- [x] T347 [P] Add AbortController to `InstitutionalAnalysisPage.tsx` — `useRef<AbortController>` stores current controller; `useEffect` cleanup aborts on unmount; new fetch aborts previous in-flight request to prevent race conditions when user changes ticker mid-request.

- [x] T348 [P] Add AbortController to `RegulatoryPositionsPage.tsx` — same pattern: persists controller across re-renders, aborts stale requests on re-fetch and cleanup on unmount.

- [x] T349 [P] Add AbortController to `CoverageStrategiesPage.tsx` — same pattern with `signal` passed to `postCoverageAnalyze()` / `postCoverageCompare()` / `postCoverageSimulate()`.

### Refreshing Overlay UX (Completado)

- [x] T350 [P] Add animated "refreshing" bar to `InstitutionalAnalysisPage.tsx` — when re-fetching with existing data displayed, show a thin animated bar at the top (CSS animation) instead of hiding results. `isRefreshing` state derived from `loading && data !== null`.

- [x] T351 [P] Add same refreshing bar pattern to `RegulatoryPositionsPage.tsx` — consistent UX: skeleton on first load, thin animated bar on subsequent refreshes.

### Test Isolation Fix (Completado)

- [x] T352 [P] Add `clearCache()` call in `beforeEach` of `coverageApi.test.ts` — prevents cross-test pollution from the module-level in-memory cache. All 6 tests pass (3 success + 3 error scenarios).

### Dependencies

```
Phase 10 is additive on top of Phases 1-9 — all pages and API services must already exist.

Tasks can be implemented in this order:
1. T342 (apiCache.ts) — prerequisite for T343, T345
2. T346 (memoized auth) — independent, can run in parallel with T342
3. T343, T344 (coverageApi.ts) — depends on T342
4. T345 (institutionalApi.ts) — depends on T342
5. T347, T348, T349 (AbortController in pages) — depends on T343, T345
6. T350, T351 (refreshing overlay) — depends on T347, T348
7. T352 (test isolation) — depends on T342, T343
```

## Parallel Example: Backend / Frontend Split
```bash
# Can run simultaneously by different assignees
[US1] T304 (Analyze backend endpoint)
[Phase 8/9] T333-T339 (Real data source parsers)
[US5] T317 (AI API services frontend)
```
