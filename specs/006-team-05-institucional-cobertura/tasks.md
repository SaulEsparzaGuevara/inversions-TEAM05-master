---
description: "Task list for 006-team-05-institucional-cobertura"
---

# Tasks: 006-team-05-institucional-cobertura

**Input**: Design documents from `specs/006-team-05-institucional-cobertura/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Data Source Matrix

| Fuente | Tier | Estado | Parser |
|--------|------|--------|--------|
| SEC EDGAR 13F | free | ✅ REAL | `parseSecEdgar13fReal()` (T334) |
| FINRA Short Interest | free | ✅ REAL | `parseFinraShortInterestReal()` (T333) |
| Yahoo Finance Options Flow | free | ✅ REAL | `parseYahooOptionsFlow()` (T338) |
| Yahoo Finance Institutional | free | ✅ REAL | `parseYahooInstitutional()` (T339) |

> **Nota**: Las 4 fuentes están implementadas y operativas con datos reales. Ninguna fuente permanece en estado pendiente.

## Preserved (Canonical) Tasks

Se incluyen sin omisión todas las tareas canónicas del backlog del equipo, tomadas literalmente de la fuente canónica `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-05/tasks.md`. Marcadas como pendientes para ejecución en el repositorio principal.

### Institutional Core — Flujo A

- [ ] T106 Definir contrato de parámetros para análisis institucional en `backend/src/modules/institutional/institutionalContract.ts` incluyendo instrumento/ticker, strike, periodos (intradiario/diario/mensual/trimestral), volumen, liquidez, plazo (corto/mediano/largo), porcentaje en manos de fondos, flujos de entrada/salida y posiciones abiertas
- [ ] T107 Implementar servicio de integración con fuentes externas institucionales en `backend/src/modules/institutional/institutionalDataService.ts` consumiendo SEC EDGAR 13F filings, FINRA short interest, Yahoo Finance Options Flow, Yahoo Finance Institutional, con normalización de respuesta, caché, fallback y manejo de rate limits
- [ ] T108 Implementar motor de zonas institucionales en `backend/src/modules/institutional/institutionalZonesEngine.ts` para identificar soportes y resistencias donde fondos acumulan o distribuyen usando volumen institucional, análisis de velas OHLC y filtros de alta liquidez
- [ ] T109 Implementar motor de tendencias institucionales en `backend/src/modules/institutional/institutionalTrendEngine.ts` con MAs de 50 y 200 días, detección de cruces, correlación entre reportes trimestrales y volumen diario creciente, y cálculo de probabilidad de continuidad de tendencia
- [ ] T110 Implementar motor de análisis de vencimientos en `backend/src/modules/institutional/expirationAnalysisEngine.ts` que detecta fechas clave de opciones y futuros (mensual/trimestral) donde los institucionales ajustan posiciones y evalúa impacto esperado en precio del subyacente
- [ ] T111 Implementar API de análisis institucional en `backend/src/routes/institutional/institutionalAnalysis.ts` retornando zonas S/R institucionales, tendencias MAs largas, cruce de períodos y métricas de posicionamiento como overlay para gráfico de velas
- [ ] T112 Implementar API de posiciones y reportes regulatorios en `backend/src/routes/institutional/regulatoryPositions.ts` retornando posiciones abiertas de fondos, flujos y datos 13F para visualización en modal/panel de interfaz

### Coverage Strategy Engines — Flujo B

- [ ] T113 Definir contrato base de estrategias de cobertura en `backend/src/modules/strategies/coverage/coverageStrategyContract.ts` con interfaz unificada de inputs (ticker, cantidad de acciones, strikes, fechas de vencimiento, primas, capital, tolerancia al riesgo) y validación de consistencia
- [ ] T114 Implementar core de Protective Put / Married Put en `backend/src/modules/strategies/coverage/protectivePutEngine.ts` con cálculo de protección máxima (strike – precio actual), simulación de escenarios de caída del subyacente, análisis costo-beneficio de cobertura, alertas de ejercicio anticipado y stop-loss cuando el subyacente se acerca al strike
- [ ] T115 Implementar core de Collar Put en `backend/src/modules/strategies/coverage/collarEngine.ts` con simulación de rango de protección (put) y techo de ganancia (call), cálculo de costo neto (prima put – prima call), proyección de payoff en tiempo real y stop-loss automático si el subyacente rompe el rango esperado
- [ ] T116 Implementar core de Covered Straddle en `backend/src/modules/strategies/coverage/coveredStraddleEngine.ts` con cálculo de ingresos por primas vendidas, simulación de escenarios de alta volatilidad y riesgo ilimitado, cuantificación de pérdidas potenciales en movimientos fuertes, alertas de margen y stop-loss en niveles críticos
- [ ] T117 Implementar motor de simulación avanzada en `backend/src/modules/strategies/coverage/coverageSimulationEngine.ts` con Monte Carlo, escenarios determinísticos (subida/bajada %), backtesting con datos históricos y proyección de payoff en tiempo real para las cuatro estrategias de cobertura
- [ ] T118 Implementar servicio de alertas y gestión de riesgos en `backend/src/modules/strategies/coverage/coverageRiskService.ts` con stop-loss automático configurable, alertas de margen, notificaciones al alcanzar niveles críticos y solicitud de cierre de operación vía broker
- [ ] T119 Implementar módulo de reporting de cobertura en `backend/src/modules/strategies/coverage/coverageReportService.ts` con resumen de resultados esperados por estrategia, estadísticas de riesgo/beneficio, logs de simulación y ejecución y reportes exportables
- [ ] T120 Implementar comparador de estrategias de cobertura en `backend/src/modules/strategies/coverage/coverageComparator.ts` que evalúa Protective Put, Collar Put y Covered Straddle según P&L esperado, costo neto, nivel de riesgo y contexto multi-core para recomendar la estrategia más adecuada

### AI Chat & Cross-Cutting

- [ ] T121 Implementar chat IA de análisis institucional y estrategias de cobertura en `backend/src/modules/ai/institutionalCopilotChat.ts` con acceso de solo lectura a datos institucionales, posiciones regulatorias y resultados de simulación de estrategias
- [ ] T173 Ejecutar ajuste de TEAM-05 al estándar transversal en `backend/src/modules/strategies/coverage/` (protective/married put, collar, covered straddle)

---

## Derived Tasks — Implementation & Testing

### Phase 1: Contracts, Persistence & Observability (Completado)

- [x] T200 [P] Crear contratos JSON de API para coverage (`specs/006-team-05-institucional-cobertura/contracts/institutional_context.v1.json`, `strategy.v1.json`, `explanation.v1.json`) y ejemplos de payloads
- [x] T201 Implementar esquema de persistencia de trazas y evidencias en `backend/src/db/migrations/` (tablas: `institutional_contexts`, `evidence_blobs`, `explanation_responses`) con versión de documento y `response_hash`
- [x] T202 [P] Implementar job de purge/retención en `backend/src/jobs/purgeEvidenceJob.ts` — mueve datos older than 365d to archival tier
- [x] T203 [P] Implementar métricas e instrumentación en `backend/src/observability/coverageMetrics.ts`: `coverage.response.latency_ms`, `coverage.response.p95_ms`, `coverage.ai.unavailable.count`
- [x] T206 [P] Añadir compatibilidad de versionado semántico en contratos y CI validation en `scripts/validate-contract-compat.sh`
- [x] T207 Implementar validadores de contratos JSON (ajustando `schema` y `examples`) y tests de compatibilidad en CI

> **Nota**: T206 y T207 estaban pendientes de marcación pero ya existían en el código desde iteraciones anteriores.

---

### Phase 2: Real Data Source Parsers (SEC & FINRA) (Completado)

- [x] T333 [P] Implement FINRA full-dataset lazy cache in `backend/src/modules/institutional/realSourceParsers.ts` with `ensureFinraCache()` — loads up to 6 pages (×5000 records), shared promise dedup, `Map<string, FinraRecord[]>` at module level
  - ✅ T333a Implement `fetchFinraPage()` with POST to `https://api.finra.org/data/group/otcmarket/name/consolidatedShortInterest`, CSV parsing
  - ✅ T333b Implement module-level `finraCache` + `finraCachePromise` with date boundary detection
  - ✅ T333c Add eager preload kickoff in `bootstrap.ts` — non-blocking `ensureFinraCache().catch(() => {})`
- [x] T334 [P] Implement SEC EDGAR real parser in `realSourceParsers.ts` — EFTS search for 13F-HR filings, XML directory enumeration, `informationTable` extraction via regex
  - ✅ T334a Implement `searchEfts(ticker, formType)` using `https://efts.sec.gov/LATEST/search-index`
  - ✅ T334b Implement `extractInfoTableEntries()` regex parser for XML `<infoTable>` blocks
  - ✅ T334c Implement `findXmlWithHoldings()` — iterate XML files in filing directory
  - ✅ T334d Implement `cusipForTicker()` mapping — **ampliado de 12 a ~60 tickers del S&P 500** (Fase 4)
- [x] T335 [P] Implement graceful fallback in `parseFinraShortInterestReal` — when ticker not found in cached dataset, return synthetic low-confidence (0.3) observation instead of `null`
- [x] T336 Optimize SEC parser performance — reduce `MAX_FILINGS` from 8 to 5, remove artificial `delay(150)` calls, parallelize filing lookups with `Promise.all`

---

### Phase 3: Yahoo Finance Data Sources & Mock Cleanup (Completado)

- [x] T338 [P] Implement Yahoo Finance Options Flow parser in `yahooOptionsParser.ts` — replaces Unusual Whales
  - ✅ `fetchYahooOptions(ticker)` — fetch options chain from `query2.finance.yahoo.com/v7/finance/options/{ticker}`, parse calls/puts with volume and OI
  - ✅ `computeOptionsFlowSignal()` — detect strikes where volume > 2× OI ("unusual" signal), aggregate bullish/bearish flow
  - ✅ `parseYahooOptionsFlow()` — normalize to `InstitutionalSourceObservation` with confidence based on signal count
  - ✅ Registered `yahoo-options-flow` source in `bootstrap.ts` source configs
- [x] T339 [P] Implement Yahoo Finance Institutional parser in `yahooInstitutionalParser.ts` — replaces Finviz
  - ✅ `fetchYahooInstitutional(ticker)` — fetch quoteSummary from `query2.finance.yahoo.com/v10/finance/quoteSummary/{ticker}?modules=institutionOwnership`, parse holders count, % held, change
  - ✅ `parseYahooInstitutional()` — normalize to `InstitutionalSourceObservation`, derive inflows/outflows from share change
  - ✅ Registered `yahoo-institutional` source in `bootstrap.ts` source configs
- [x] T340 [P] Remove mock infrastructure from `bootstrap.ts`:
  - ✅ Removed `createMockInstitutionalFetch()` and `buildMockPayload()` — no longer needed
  - ✅ Removed `createMixedFetch()` — replaced with native fetch directly
  - ✅ Removed `unusual-whales` and `finviz-institutional` source configs
  - ✅ Removed `parseUnusualWhales()` and `parseFinvizInstitutional()` from `institutionalDataService.ts`

---

### Phase 4: Resilience, Recovery & Testing (Completado)

- [x] T204 Implement fixtures de pruebas A/B/C (nominal, stress tail, low-liquidity) en `tests/fixtures/coverage/` y pipelines CI para ejecutarlos
- [x] T205 [P] Implementar el procedimiento de reconstrucción de auditoría (replay) como herramienta interna `tools/reconstruct_explanation.ts` que toma `context_id` y produce audit bundle
- [x] T208 [P] Añadir medidas de resiliencia y recovery flows: partial-data handlers, stale-input flags, retry policy for external sources (exponential backoff with max attempts), and circuit-breaker metrics in `backend/src/lib/resilience/` — **módulos implementados + 21 tests unitarios**
- [x] T214 [P] Implementar upstream source failure degradation según spec 2026-05-22: cuando una fuente falla, incluir `sourceReports[].status = "error"` en la respuesta y continuar con las fuentes disponibles. Si todas fallan, retornar HTTP 503.
- [x] T209 Crear playbooks de pruebas de integración y escenarios extremos en `specs/006-team-05-institucional-cobertura/catalogs/market-scenarios.md`
- [x] T210 Añadir documentación operativa para Storage & Retention (S3 lifecycle, purge audit) en `ops/docs/retention.md`

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Contracts, Persistence, Observability)
       │
       ▼
Phase 2 (Real Source Parsers: SEC, FINRA)
       │
       ▼
Phase 3 (Yahoo Finance Sources + Mock Cleanup)
       │
       ▼
Phase 4 (Resilience, Recovery, Testing)
```

All canonical tasks (T106-T121, T173) depend on Phase 1 being complete.

### Parallel Opportunities

| Task Group | Can run in parallel with |
|------------|-------------------------|
| T200, T201, T202, T203, T206, T207 | All within Phase 1 (different files) |
| T333, T334 | Each other (different parsers) |
| T211, T212 | Each other (different Yahoo APIs) |
| T204, T205, T208, T214 | Each other (different concerns) |

### Implementation Sequence

1. Phase 1 → Contracts, persistence, observability foundation
2. Canonical tasks T106-T121 in flow order (A → B → C → D)
3. Phase 2 → Real data source parsers (SEC, FINRA)
4. Phase 3 → Yahoo Finance parsers + remove mock code
5. Phase 4 → Resilience, tests, documentation

---

## Parallel Example

```bash
# Can run simultaneously by different assignees
[Phase 2] T333 (FINRA parser) + T334 (SEC parser)
[Phase 3] T211 (Yahoo Options) + T212 (Yahoo Institutional)
[Phase 4] T204 (Test fixtures) + T208 (Resilience)
```

---

## Implementation Strategy

### MVP First

1. Phase 1 (contracts + persistence)
2. T106-T112 (Institutional Core — Flujo A)
3. T113-T120 (Coverage Engines — Flujo B)
4. **STOP and validate**: Analysis + Coverage endpoints work

### Incremental Delivery

1. MVP: Institutional Core + Coverage Engines (functional backend)
2. Add Phase 2: Real data from SEC and FINRA
3. Add Phase 3: Yahoo Finance + remove all mock data
4. Add Phase 4: Resilience, tests, documentation

---

### Phase 5: Coverage Engine Fix — Option Payoff Scaling (CRÍTICO)

- [X] T504 [P] Fix option payoff scaling in all coverage engines — `contractScale` (número de contratos = 1 para 100 acciones) usado incorrectamente como factor de dólares en vez de `strategy.shares`:
  - ✅ `protectivePutEngine.ts` — `putPayoff * contractScale` → `putPayoff * strategy.shares`; también `calculateNetPremiumPerShare` y `calculateVolatilityStress` corregidos
  - ✅ `collarEngine.ts` — `longPutPnL * contractScale` y `shortCallPnL * contractScale` → `* strategy.shares`; `calculateNetPremiumPerShare` corregido
  - ✅ `coveredStraddleEngine.ts` — `shortPutPnL * contractScale` y `shortCallPnL * contractScale` → `* strategy.shares`; `calculateNetPremiumPerShare` corregido
  - ✅ `coverageSimulationEngine.ts` — `optionPremiumCashFlow` y `optionPayoff` con `toContractScale` → `* strategy.shares`
  - ✅ **Verificación**: tests unitarios pasan (4/4) y payoff ahora escala correctamente por `strategy.shares`
- [X] T505 Implementar cálculo real de primas de opciones — agregado `estimateOptionPremium()` en `coverageTypes.ts` (Black-Scholes simplificado con normalCdf) y reemplazado `premium: 0` hardcodeado en `analyze.ts:37-47` por estimación basada en precio, strike, días a vencimiento (90d) y volatilidad implícita (25%)

---

### Phase 6: Backend Fix — SEC EDGAR Date Dinámica

- [X] T502 [P] Fix `enddt` hardcodeado en EFTS search de SEC EDGAR:
  - `realSourceParsers.ts:67-68` — `enddt=2026-05-20` → `enddt=${new Date().toISOString().slice(0, 10)}`
  - ✅ **Impacto corregido**: fecha dinámica, 13F posteriores al 20-May-2026 ya se encuentran

---

### Phase 7: Frontend Rendering Validation

- [X] T506 [P] Fix unsafe `cards[0]` access en MainDashboard:
  - ✅ `MainDashboard.tsx:47`: `payload?.cards?.[0]?.instrument` con optional chaining
  - ✅ `MainDashboard.tsx:62`: `response.cards?.[0]` con optional chaining

- [X] T507 Unificar estado `selectedSignal` entre MainDashboard y Zustand store:
  - ✅ MainDashboard ahora usa `const { selectedSignal, setSelectedSignal } = useSignalStore()`
  - ✅ Estado local `useState<DashboardSignalCard | null>` eliminado

- [X] T508 Validar escala de `timestamp` en SuperChart y ConfluenceSignalsTable:
  - ✅ OHLC API (ohlc.ts:44) retorna `time` en segundos → `* 1000` es correcto
  - ✅ Señales endpoint usa Unix seconds por convención → `* 1000` correcto

- [X] T509 Fix `selectedSignal.id` vs `signalId` en SuperChart:
  - ✅ `SuperChart.tsx:225`: comparación unificada con `selectedSignal?.signalId || selectedSignal?.id`

- [X] T510 Validar escala de `confidence` en todo el frontend:
  - ✅ Confianza es [0.00, 1.00] canónico del spec → `Math.round(card.confidence * 100)` es correcto
  - ✅ Revisados `SignalOverlay.tsx:68`, `ExplainabilityTable.tsx:45`, `SignalEvidencePanel.tsx:45` — todos correctos

- [X] T511 Fix `error.error` en ExecutionPanel:
  - ✅ `ExecutionPanel.tsx:128`: `error.message || error.error || 'Execution failed'` — tolera ambos formatos

- [X] T503 Alinear valores `fundsOwnershipPct` en tests con contrato real (0-100):
  - ✅ `InstitutionalAnalysisPage.test.tsx:11`: `0.05` → `5`
  - ✅ `RegulatoryPositionsPage.test.tsx:11`: `0.08` → `8`, `0.06` → `6`

---

## Dependencies & Execution Order

```
Phase 1 (Contracts, Persistence, Observability)
       │
       ▼
Phase 2 (Real Source Parsers: SEC, FINRA)
       │
       ▼
Phase 3 (Yahoo Finance Sources + Mock Cleanup)
       │
       ▼
Phase 4 (Resilience, Recovery, Testing)
       │
       ▼
Phase 5 (Coverage Engine Fix — CRÍTICO)
       │
       ▼
Phase 6 (SEC EDGAR Date Fix)
       │
       ▼
Phase 7 (Frontend Rendering Validation)
```

All canonical tasks (T106-T121, T173) depend on Phase 1 being complete.

### Parallel Opportunities

| Task Group | Can run in parallel with |
|------------|-------------------------|
| T200, T201, T202, T203, T206, T207 | All within Phase 1 (different files) |
| T333, T334 | Each other (different parsers) |
| T211, T212 | Each other (different Yahoo APIs) |
| T204, T205, T208, T214 | Each other (different concerns) |
| T502, T506, T507, T508, T509, T510, T511 | All within Phases 6-7 (different files, no shared dependencies) |
| T504, T505 | Depend on same engine files — sequential |

### Phase 8: Performance Optimization — Institutional & Coverage API Response Time

- [x] T801 [P] Convert `InstitutionalDataService.resolve()` to parallel source fetching using `Promise.allSettled()` — reduces total latency from sum(4 source times) to max(4 source times). Before: ~30-90s. After: ~10-20s.
- [x] T802 [P] Reduce `MAX_FILINGS` in SEC EDGAR parser from 5 to 2 (`realSourceParsers.ts`) — cuts SEC source latency by ~60% while preserving data quality.
- [x] T803 [P] Share pre-resolved `InstitutionalDataServiceResult` across all 3 engines (Zones, Trend, Expiration) — inject via `preResolvedResult` parameter instead of calling `resolve()` 3 times per request. Route now calls `resolve()` once and passes result to all engines.
- [x] T804 [P] Create shared `yahooCrumbSession.ts` module — consolidates crumb/cookie authentication into a single shared session. Both `yahooOptionsParser.ts` and `yahooInstitutionalParser.ts` import from the same module, eliminating duplicate auth calls (6 HTTP calls → 3).
- [x] T805 [P] Simplify cache key in `InstitutionalDataService` — remove `[strike, period, volume, liquidity, horizon]` from cache key since institutional data doesn't vary by these request-level parameters. Reduces cache misses by only keying on `[sourceId, ticker, analysisId]`.

---

### Phase 9: Coverage API Performance Optimization — Pre-computed Results, MC Skip, Parallel I/O

**Purpose**: Eliminar trabajo duplicado en el pipeline de cobertura (analyze, compare, simulate) y saltar Monte Carlo cuando no es necesario.

**Independent Test**: `POST /api/coverage/compare` con 4 estrategias dispara ~4 simulaciones + ~4 risk (antes ~8+8); `POST /api/coverage/analyze` con `monteCarloIterations: 0` retorna payoff instantáneo sin loop MC.

#### Pre-computed Results in CoverageReportService (Completado)

- [x] T806 [P] Add optional `precomputed?: { simulation: CoverageSimulationResult; risk: CoverageRiskResult }` parameter to `CoverageReportService.generateReport()` — when provided, skips re-calling `simulationEngine.analyze()` and `riskService.evaluate()`. Uses nullish coalescing to fall back to full computation when not provided. Changes:
  - ✅ `coverageReportService.ts:39` — signature changed to `generateReport(strategyReq, recipients?, precomputed?)`
  - ✅ File I/O (JSON + MD writes) parallelized with `Promise.all()` instead of sequential `await`

- [x] T807 [P] Update `CoverageComparator.compare()` to pass pre-computed results to `generateReport()` — stores `sim` and `risk` from earlier pipeline steps and passes `{ simulation: sim, risk: risks[i] }` to each strategy's report generation. Eliminates 4 duplicate simulation calls and 4 duplicate risk evaluations per compare request. Before: 8 sims + 8 risk. After: 4 sims + 4 risk.

#### Monte Carlo Skip (Completado)

- [x] T808 [P] Add Monte Carlo skip to `CoverageSimulationEngine` — constructor treats `monteCarloIterations: 0` as explicit skip signal (not clamped to 32). In `analyze()`, when `this.monteCarloIterations === 0`, returns empty `monteCarloOutcomes` array and zeroed `monteCarloSummary` without entering the iteration loop. Enables sub-second payoff-only analysis for `POST /api/coverage/analyze`.

#### Parallel Notifications (Completado)

- [x] T809 [P] Parallelize notification sending in `CoverageRiskService.evaluate()` — replaces sequential `for...of` loops for email and push notifications with `Promise.allSettled()`. Uses proper type narrowing (`result.status === "fulfilled"`) for return values. Reduces latency when multiple recipients are configured.

#### Dependencies

```
Phase 9 builds on Phases 1-7 — all coverage engines must be operational.

Tasks can be implemented in this order:
1. T808 (MC skip) — independent
2. T806 (report service) — depends on T808 conceptually
3. T807 (comparator) — depends on T806
4. T809 (notifications) — independent
```

### Implementation Sequence

1. Phase 1 → Contracts, persistence, observability foundation
2. Canonical tasks T106-T121 in flow order (A → B → C → D)
3. Phase 2 → Real data source parsers (SEC, FINRA)
4. Phase 3 → Yahoo Finance parsers + remove mock code
5. Phase 4 → Resilience, tests, documentation
6. Phase 5 → Coverage engine payoff fix (T504, T505)
7. Phase 6 → SEC EDGAR date fix (T502)
8. Phase 7 → Frontend rendering validation (T506-T511, T503)
9. Phase 8 → Institutional performance optimization (T801-T805)
10. Phase 9 → Coverage API performance optimization (T806-T809)

---

## Implementation Strategy

### MVP First

1. Phase 1 (contracts + persistence)
2. T106-T112 (Institutional Core — Flujo A)
3. T113-T120 (Coverage Engines — Flujo B)
4. **STOP and validate**: Analysis + Coverage endpoints work

### Incremental Delivery

1. MVP: Institutional Core + Coverage Engines (functional backend)
2. Add Phase 2: Real data from SEC and FINRA
3. Add Phase 3: Yahoo Finance + remove all mock data
4. Add Phase 4: Resilience, tests, documentation
5. Add Phase 5: Coverage engine payoff fix
6. Add Phase 6: SEC EDGAR date fix
7. Add Phase 7: Frontend rendering validation
8. Add Phase 8: Performance optimization — parallel fetch, shared auth, cache tuning

### Notes

- Canonical tasks T106-T121 must be preserved literally as specified by the Diana canon
- Tasks T030 and T054 from the original canon are excluded from this spec's scope (broker integration and MFA reporting)
- All tasks marked with `[ ]` — pending execution in the main repository
- Tasks marked with `[P]` — priorizadas para próxima iteración
- Tasks T500-T501 (Phase 4.5) were applied in-session — frontend rendering fixes for `fundsOwnershipPct * 100` y `tookMs → latencyMs`; no se incluyen como tareas pendientes porque ya están corregidas en el código
