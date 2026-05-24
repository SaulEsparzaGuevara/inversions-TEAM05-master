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

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T300 Install `react-router-dom` in `projects/pwa/inversions_app/package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [ ] T301 Update routing in `projects/pwa/inversions_app/src/main.tsx` to use `BrowserRouter` and wrap routes
- [ ] T302 [P] Create `projects/pwa/inversions_app/src/layouts/MainLayout.tsx` for shared navigation sidebar + Top Navbar
- [ ] T303 [P] Implement `ChatState` & `useSyncExternalStore` store in `projects/pwa/inversions_app/src/store/chat.ts` for session persistence

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: [US1] Backend Coverage Endpoints Exposure (RF-301)

**Goal**: Exponer los motores de estrategia existentes como endpoints REST delegados listos para consumo del frontend.

**Independent Test**: Lanzar curl/Postman contra los endpoints `/api/coverage/*` retornando JSON válidos.

### Implementation for User Story 1

- [ ] T304 [P] [US1] Create thin route POST `/api/coverage/analyze` in `projects/rest-api/inversions_api/src/routes/coverage/analyze.ts`
- [ ] T305 [P] [US1] Create thin route POST `/api/coverage/compare` in `projects/rest-api/inversions_api/src/routes/coverage/compare.ts`
- [ ] T306 [US1] Create thin route POST `/api/coverage/simulate` in `projects/rest-api/inversions_api/src/routes/coverage/simulate.ts`
  - [ ] T306b Mount coverage router (`app.use("/api/coverage", coverageRouter)`) in `projects/rest-api/inversions_api/src/index.ts`

**Checkpoint**: Backend coverage features exposed via REST.

---

## Phase 4: [US2] Institutional Analysis Page (RF-302)

**Goal**: Permitir consulta estructurada mediante Ticker, Período y Horizonte visualizando tendencias/zonas S-R.

⚠️ **Dependencia**: US2 consume datos de las fuentes en Phase 8 (T333-T334) y Phase 9 (T338-T339). Implementar en orden o en paralelo con asignación separada.

**Independent Test**: La ruta `/institutional/analysis` permite buscar un ticker con dropdowns predefinidos, y grafica estado S/R exitosamente.

### Implementation for User Story 2

- [ ] T307 [P] [US2] Export API functions for `InstitutionalAnalysisPage` in `projects/pwa/inversions_app/src/services/institutional/institutionalApi.ts` using native fetch and `getAuthHeaders()`
- [ ] T308 [US2] Implement `projects/pwa/inversions_app/src/pages/institutional/InstitutionalAnalysisPage.tsx` with predefined period/horizon dropdowns
- [ ] T309 [US2] Link InstitutionalAnalysisPage to `projects/pwa/inversions_app/src/main.tsx` router

---

## Phase 5: [US3] Regulatory Positions Page (RF-303)

**Goal**: Tabla 13F consolidada, Flujos, Inflows/Outflows, y métricas de Cache.

⚠️ **Dependencia**: US3 consume datos de las fuentes en Phase 8 (T333-T334) y Phase 9 (T338-T339). Implementar en orden o en paralelo con asignación separada.

**Independent Test**: La ruta `/institutional/positions` renderiza la tabla de posiciones con los flujos de dinero institucionales correctos.

### Implementation for User Story 3

- [ ] T310 [P] [US3] Add Regulatory Positions fetch methods in `projects/pwa/inversions_app/src/services/institutional/institutionalApi.ts`
- [ ] T311 [US3] Implement `projects/pwa/inversions_app/src/pages/institutional/RegulatoryPositionsPage.tsx` featuring 13F positions table and flow displays
- [ ] T312 [US3] Link RegulatoryPositionsPage to `projects/pwa/inversions_app/src/main.tsx` router

---

## Phase 6: [US4] Coverage Strategies & Comparisons (RF-304)

**Goal**: Proveer el explorador y payload visualizador de estrategias de cobertura institucionales.

**Independent Test**: La vista `/coverage/strategies` renderiza los gráficos de payoffs de opciones sin errores en navegadores.

### Implementation for User Story 4

- [ ] T313 [P] [US4] Export coverage API methods (analyze, compare, simulate) in `projects/pwa/inversions_app/src/services/coverage/coverageApi.ts`
- [ ] T314 [US4] Implement `projects/pwa/inversions_app/src/components/coverage/PayoffChart.tsx` utilizing `lightweight-charts`
- [ ] T315 [US4] Implement `projects/pwa/inversions_app/src/pages/coverage/CoverageStrategiesPage.tsx`, checking edge-case "Option Chains Missing" rendering fallback instead of chart
- [ ] T316 [US4] Link CoverageStrategiesPage to `projects/pwa/inversions_app/src/main.tsx` router

---

## Phase 7: [US5] AI Institutional Chat (RF-305)

**Goal**: Panel de chat con AI que preserve historial persistente bajo la misma sesión de la pestaña actual.

**Independent Test**: Chat IA envía prompts, realiza polling progresivo visualmente, retiene historial al cambiar de vista y regresar, y tiene estado de degrado controlable.

### Implementation for User Story 5

- [ ] T317 [P] [US5] Implement AI Chat endpoints interactions locally in `projects/pwa/inversions_app/src/services/ai/aiChatApi.ts`
- [ ] T318 [P] [US5] Create `projects/pwa/inversions_app/src/components/ai/ChatHistory.tsx` wrapping the `src/store/chat.ts` `useSyncExternalStore` context
- [ ] T319 [P] [US5] Create `projects/pwa/inversions_app/src/components/ai/ScenarioAnalysisCards.tsx`
- [ ] T320 [US5] Implement `projects/pwa/inversions_app/src/pages/ai/AIChatPage.tsx` unifying ChatHistory, polling attempts up to 15 max with `ai_unavailable` manual-retry degradation logic
- [ ] T321 [US5] Link AIChatPage to `projects/pwa/inversions_app/src/main.tsx` router

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

## Parallel Example: Backend / Frontend Split
```bash
# Can run simultaneously by different assignees
[US1] T304 (Analyze backend endpoint)
[Phase 8/9] T333-T339 (Real data source parsers)
[US5] T317 (AI API services frontend)
```
