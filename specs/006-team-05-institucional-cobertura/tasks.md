---
description: "Task list for 006-team-05-institucional-cobertura"
---

# Tasks: 006-team-05-institucional-cobertura

**Input**: Design documents from `specs/006-team-05-institucional-cobertura/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Data Source Matrix

| Fuente | Tier | Estado | Parser |
|--------|------|--------|--------|
| SEC EDGAR 13F | free | ⬜ PENDIENTE | `parseSecEdgar13fReal()` (T334) |
| FINRA Short Interest | free | ⬜ PENDIENTE | `parseFinraShortInterestReal()` (T333) |
| Yahoo Finance Options Flow | free | ⬜ PENDIENTE | `parseYahooOptionsFlow()` (T211) |
| Yahoo Finance Institutional | free | ⬜ PENDIENTE | `parseYahooInstitutional()` (T212) |

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

### Phase 1: Contracts, Persistence & Observability

- [ ] T200 [P] Crear contratos JSON de API para coverage (`specs/006-team-05-institucional-cobertura/contracts/institutional_context.v1.json`, `strategy.v1.json`, `explanation.v1.json`) y ejemplos de payloads
- [ ] T201 Implementar esquema de persistencia de trazas y evidencias en `backend/src/db/migrations/` (tablas: `institutional_contexts`, `evidence_blobs`, `explanation_responses`) con versión de documento y `response_hash`
- [ ] T202 [P] Implementar job de purge/retención en `backend/src/jobs/purgeEvidenceJob.ts` — mueve datos older than 365d to archival tier
- [ ] T203 [P] Implementar métricas e instrumentación en `backend/src/observability/coverageMetrics.ts`: `coverage.response.latency_ms`, `coverage.response.p95_ms`, `coverage.ai.unavailable.count`
- [ ] T206 [P] Añadir compatibilidad de versionado semántico en contratos y CI validation en `scripts/validate-contract-compat.sh`
- [ ] T207 Implementar validadores de contratos JSON (ajustando `schema` y `examples`) y tests de compatibilidad en CI

---

### Phase 2: Real Data Source Parsers (SEC & FINRA)

- [ ] T333 [P] Implement FINRA full-dataset lazy cache in `backend/src/modules/institutional/realSourceParsers.ts` with `ensureFinraCache()` — loads up to 6 pages (×5000 records), shared promise dedup, `Map<string, FinraRecord[]>` at module level
  - T333a Implement `fetchFinraPage()` with POST to `https://api.finra.org/data/group/otcmarket/name/consolidatedShortInterest`, CSV parsing
  - T333b Implement module-level `finraCache` + `finraCachePromise` with date boundary detection
  - T333c Add eager preload kickoff in `bootstrap.ts` — non-blocking `ensureFinraCache().catch(() => {})`
- [ ] T334 [P] Implement SEC EDGAR real parser in `realSourceParsers.ts` — EFTS search for 13F-HR filings, XML directory enumeration, `informationTable` extraction via regex
  - T334a Implement `searchEfts(ticker, formType)` using `https://efts.sec.gov/LATEST/search-index`
  - T334b Implement `extractInfoTableEntries()` regex parser for XML `<infoTable>` blocks
  - T334c Implement `findXmlWithHoldings()` — iterate XML files in filing directory
  - T334d Implement `cusipForTicker()` mapping for common tickers
- [ ] T335 [P] Implement graceful fallback in `parseFinraShortInterestReal` — when ticker not found in cached dataset, return synthetic low-confidence (0.3) observation instead of `null`
- [ ] T336 Optimize SEC parser performance — reduce `MAX_FILINGS` from 8 to 5, remove artificial `delay(150)` calls, parallelize filing lookups with `Promise.all`

---

### Phase 3: Yahoo Finance Data Sources & Mock Cleanup

- [ ] T211 [P] Implement Yahoo Finance Options Flow parser in `realSourceParsers.ts` — replaces Unusual Whales
  - T211a Implement `fetchYahooOptions(ticker)` — fetch options chain from `query1.finance.yahoo.com/v7/finance/options/{ticker}`, parse calls/puts with volume and OI
  - T211b Implement `computeOptionsFlowSignal()` — detect strikes where volume > 2× OI ("unusual" signal), aggregate bullish/bearish flow
  - T211c Implement `parseYahooOptionsFlow()` — normalize to `InstitutionalSourceObservation` with confidence based on signal count
  - T211d Register `yahoo-options-flow` source in `bootstrap.ts` source configs
- [ ] T212 [P] Implement Yahoo Finance Institutional parser in `realSourceParsers.ts` — replaces Finviz
  - T212a Implement `fetchYahooInstitutional(ticker)` — fetch quoteSummary from `query1.finance.yahoo.com/v10/finance/quoteSummary/{ticker}?modules=institutionOwnership`, parse holders count, % held, change
  - T212b Implement `parseYahooInstitutional()` — normalize to `InstitutionalSourceObservation`, derive inflows/outflows from share change
  - T212c Register `yahoo-institutional` source in `bootstrap.ts` source configs
- [ ] T213 [P] Remove mock infrastructure from `bootstrap.ts`:
  - T213a Remove `createMockInstitutionalFetch()` and `buildMockPayload()` — no longer needed
  - T213b Remove `createMixedFetch()` — replace with native fetch directly
  - T213c Remove `unusual-whales` and `finviz-institutional` source configs
  - T213d Remove `parseUnusualWhales()` and `parseFinvizInstitutional()` from `institutionalDataService.ts`

---

### Phase 4: Resilience, Recovery & Testing

- [ ] T204 Implement fixtures de pruebas A/B/C (nominal, stress tail, low-liquidity) en `tests/fixtures/coverage/` y pipelines CI para ejecutarlos
- [ ] T205 [P] Implementar el procedimiento de reconstrucción de auditoría (replay) como herramienta interna `tools/reconstruct_explanation.ts` que toma `context_id` y produce audit bundle
- [ ] T208 [P] Añadir medidas de resiliencia y recovery flows: partial-data handlers, stale-input flags, retry policy for external sources (exponential backoff with max attempts), and circuit-breaker metrics in `backend/src/lib/resilience/`
- [ ] T214 [P] Implementar upstream source failure degradation según spec 2026-05-22: cuando una fuente falla, incluir `sourceReports[].status = "error"` en la respuesta y continuar con las fuentes disponibles. Si todas fallan, retornar HTTP 503.
- [ ] T209 Crear playbooks de pruebas de integración y escenarios extremos en `specs/006-team-05-institucional-cobertura/catalogs/market-scenarios.md`
- [ ] T210 Añadir documentación operativa para Storage & Retention (S3 lifecycle, purge audit) en `ops/docs/retention.md`

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

### Notes

- Canonical tasks T106-T121 must be preserved literally as specified by the Diana canon
- Tasks T030 and T054 from the original canon are excluded from this spec's scope (broker integration and MFA reporting)
- All tasks are marked [ ] — pending execution in the main repository
