# Backlog de Equipo: TEAM-08

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-08
**Fuente**: 001-inv-tasks.md + team-task-allocation.md

## Tareas (literal del canon, con checkbox)

- [x] T038 [P] [US3] Analítica de portafolio auditable en backend/src/modules/analytics/portfolioService.ts
- [x] T040 [US3] Endpoint de detalle operativo en backend/src/routes/audit/operationDetail.ts
- [x] T055 [P] Checklist de ownership por raíz en specs/001-plataforma-inversiones-ia/checklists/plan-quality.md
- [x] T058 Checklist de comentarios FIC bilingües en backend/src/config/ficCommentPolicy.ts
- [ ] T153 Definir contrato base de estrategias complejas en backend/src/modules/strategies/complex/complexStrategyContract.ts con inputs validados (ticker, expiración, strikes por pata, primas, contratos, tipo de alas, tolerancia de riesgo, estilo de opción)
- [ ] T154 Implementar core de Iron Condor (short/wide/delta) en backend/src/modules/strategies/complex/ironCondorEngine.ts con construcción multi-leg, crédito neto, break-evens, pérdida/ganancia máximas y perfiles por configuración
- [ ] T155 Implementar core de Iron Butterfly (short/broken) en backend/src/modules/strategies/complex/ironButterflyEngine.ts con variantes short y broken wing, cálculo de payoff/P&L temporal y sensibilidad a desplazamiento del subyacente
- [ ] T156 Implementar core de Butterfly Spread (call/put) en backend/src/modules/strategies/complex/butterflySpreadEngine.ts con cálculo de débito/crédito neto, ventanas óptimas de beneficio y escenarios por volatilidad implícita
- [ ] T157 Implementar core de Condor (call/put) en backend/src/modules/strategies/complex/condorEngine.ts con estructura por patas, riesgos por anchura de alas, payoff/P&L temporal y reglas de ajuste
- [ ] T158 Implementar motor de simulación para estrategias complejas en backend/src/modules/strategies/complex/complexSimulationEngine.ts con backtesting, Monte Carlo/escenarios determinísticos, shocks de precio/IV y costos reales (slippage/comisiones/spread)
- [ ] T159 Implementar Risk Engine para estrategias complejas en backend/src/modules/strategies/complex/complexRiskEngine.ts con límites duros, alertas de margen, stop-loss automático, riesgo de asignación temprana y kill-switch
- [ ] T160 Implementar módulo de visualización y reporting de estrategias complejas en backend/src/modules/strategies/complex/complexReportEngine.ts con payoff curves, heatmaps P&L, velas anotadas, drawdown y resumen riesgo/beneficio
- [ ] T161 Implementar APIs dedicadas y comparador de estrategias complejas en backend/src/routes/strategies/complex/ (ironCondor.ts, ironButterfly.ts, butterflySpread.ts, condor.ts, complexComparator.ts) para exponer escenarios, viabilidad y recomendación
- [ ] T176 Ejecutar ajuste de TEAM-08 al estándar transversal en backend/src/modules/strategies/complex/ (iron condor, iron butterfly, butterfly, condor)

## Tareas de Tests Automatizados

- [ ] T193 [P] Tests unitarios para ironCondorEngine, ironButterflyEngine y butterflySpreadEngine en tests/unit/strategies/complex/
- [ ] T194 [P] Tests unitarios para complexSimulationEngine y complexRiskEngine con escenarios Monte Carlo en tests/unit/strategies/complex/
- [ ] T195 [P] Tests de integracion para routes/strategies/complex/ (ironCondor, ironButterfly, butterflySpread, condor) en tests/integration/strategies/complex/
