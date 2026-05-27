# Backlog de Equipo: TEAM-09

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-09
**Fuente**: 001-inv-tasks.md + team-task-allocation.md

## Tareas (literal del canon, con checkbox)

- [ ] T162 Definir contrato base Calendar/Diagonal en backend/src/modules/strategies/term/termStrategyContract.ts con inputs por pata (strikes, expiraciones cercanas/lejana, primas, contratos), validación de consistencia temporal y estilo de opción
- [ ] T163 Implementar core de Calendar Spread (call/put) en backend/src/modules/strategies/term/calendarSpreadEngine.ts con modelado de theta, vencimiento corto/largo, impacto de term structure IV y escenarios de precio
- [ ] T164 Implementar core de Diagonal Spread (call/put) en backend/src/modules/strategies/term/diagonalSpreadEngine.ts con combinación strike+tiempo, sensibilidad de griegas, perfiles de riesgo y ventanas de ajuste
- [ ] T165 Implementar motor de simulación temporal para Calendar/Diagonal en backend/src/modules/strategies/term/termSimulationEngine.ts con backtesting, Monte Carlo/escenarios determinísticos y proyección de payoff/P&L en tiempo real
- [ ] T166 Implementar Risk Engine Calendar/Diagonal en backend/src/modules/strategies/term/termRiskEngine.ts con límites por vencimiento, riesgo de asignación, reglas de stop-loss y alertas push/email
- [ ] T167 Implementar módulo de visualización y reporting Calendar/Diagonal en backend/src/modules/strategies/term/termReportEngine.ts con curvas de payoff, superficies tiempo-precio-IV y métricas riesgo/beneficio auditables
- [ ] T168 Implementar APIs dedicadas y comparador Calendar vs Diagonal en backend/src/routes/strategies/term/ (calendarSpread.ts, diagonalSpread.ts, termComparator.ts) para recomendar estrategia según contexto multi-core
- [ ] T169 Implementar orquestador de gestión temporal en backend/src/modules/strategies/term/termRollOrchestrator.ts para reglas de roll/ajuste, cierre anticipado y control de deterioro temporal
- [ ] T177 Ejecutar ajuste de TEAM-09 al estándar transversal en backend/src/modules/strategies/term/ (calendar/diagonal)

## Tareas de Tests Automatizados

- [ ] T196 [P] Tests unitarios para calendarSpreadEngine y diagonalSpreadEngine en tests/unit/strategies/term/
- [ ] T197 [P] Tests unitarios para termSimulationEngine y termRollOrchestrator en tests/unit/strategies/term/
- [ ] T198 [P] Tests de integracion para routes/strategies/term/ (calendarSpread, diagonalSpread, termComparator) en tests/integration/strategies/term/
