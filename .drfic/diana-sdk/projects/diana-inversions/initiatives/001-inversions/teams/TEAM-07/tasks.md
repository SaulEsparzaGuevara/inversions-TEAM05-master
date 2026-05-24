# Backlog de Equipo: TEAM-07

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-07
**Fuente**: 001-inv-tasks.md + team-task-allocation.md

## Tareas (literal del canon, con checkbox)

- [x] T037 [P] [US3] Servicio de historial de auditoría en backend/src/modules/audit/historyService.ts
- [x] T039 [US3] Endpoint de historial en backend/src/routes/audit/history.ts
- [x] T043 [US3] Métricas de historial en backend/src/observability/historyMetrics.ts
- [x] T051 [P] Definir runbook de recuperación en specs/001-plataforma-inversiones-ia/quickstart.md
- [x] T052 Ejecutar simulacro RTO/RPO en specs/001-plataforma-inversiones-ia/quickstart.md
- [ ] T137 Definir contrato de orquestación AI en backend/src/modules/ai/orchestration/orchestrationContract.ts con Request Envelope común (agente, estrategia, inputs, constraints, modo, formato de reporte), versionado y trazabilidad end-to-end por request_id
- [ ] T138 Implementar Strategy Registry en backend/src/modules/ai/orchestration/strategyRegistry.ts con catálogo de cores/estrategias, capacidades/skills declaradas, dependencias de datos, límites de riesgo y versionado semántico reproducible (ej. straddle_core@x.y.z)
- [ ] T139 Implementar Agent Router en backend/src/modules/ai/orchestration/agentRouter.ts para Copilot/Gemini/Claude/otros normalizando prompts y separando cálculo financiero crítico (motor determinístico) de narrativa (LLM)
- [ ] T140 Implementar Policy Engine en backend/src/modules/ai/orchestration/policyEngine.ts con reglas de investigación en tiempo real, whitelist de fuentes, evaluación de confiabilidad, resolución de conflictos entre fuentes y bloqueo de contenido no verificable
- [ ] T141 Implementar pipeline de investigación híbrida en backend/src/modules/ai/research/researchPipeline.ts que combine conocimiento local/remoto, consulta en nube en tiempo real, validación cruzada mínima de fuentes y scoring de confianza por evidencia
- [ ] T142 Implementar Report Engine profesional en backend/src/modules/ai/reports/reportEngine.ts para salida HTML/PDF/JSON con plantilla institucional (resumen ejecutivo, contexto, calidad de datos, escenarios, riesgos, viabilidad) y gráficas obligatorias (payoff, heatmap P&L, velas anotadas, drawdown)
- [ ] T143 Implementar Viability Evaluator multi-core en backend/src/modules/ai/orchestration/viabilityEvaluator.ts que clasifique señales viables/no viables, scoree confianza y produzca explicación auditada de por qué sí y por qué no
- [ ] T144 Implementar API de orquestación AI en backend/src/routes/ai/orchestratedIntelligence.ts que exponga investigación, reporte estructurado, viabilidad y trazabilidad de fuentes/versiones para la interfaz principal
- [ ] T145 Definir contrato de estrategias de volatilidad en backend/src/modules/strategies/volatility/volatilityStrategyContract.ts con inputs (ticker, strikes, vencimiento, primas, contratos), validadores de consistencia y flag de estilo de opción (americano/europeo) para riesgo de ejercicio/asignación
- [ ] T146 Implementar core Long Straddle en backend/src/modules/strategies/volatility/longStraddleEngine.ts con costo neto, break-even dinámico, payoff/P&L temporal, sensibilidad a theta/IV y alertas operativas
- [ ] T147 Implementar core Long Strangle en backend/src/modules/strategies/volatility/longStrangleEngine.ts con costo neto, break-even, payoff/P&L temporal, sensibilidad a theta/IV y reglas de salida por DTE
- [ ] T148 Implementar core Short Straddle en backend/src/modules/strategies/volatility/shortStraddleEngine.ts con ingresos por primas, pérdida potencial ilimitada, margin stress, riesgo de asignación temprana y guardrails estrictos
- [ ] T149 Implementar core Short Strangle en backend/src/modules/strategies/volatility/shortStrangleEngine.ts con ingresos por primas, escenarios extremos de gap + IV expansion, riesgo de asignación y controles de defensa/roll
- [ ] T150 Implementar motor cuantitativo de volatilidad en backend/src/modules/strategies/volatility/volatilitySimulationEngine.ts con backtesting, Monte Carlo/escenarios determinísticos, shocks precio/IV, griegas (Delta/Gamma/Vega/Theta/Rho), costos reales (slippage/comisiones/spread) y proyección en tiempo real
- [ ] T151 Implementar Risk Engine de volatilidad en backend/src/modules/strategies/volatility/volatilityRiskEngine.ts con hard limits por estrategia/ticker, kill-switch diario/semanal, stop-loss automático, alertas push/email y hooks de cierre de operación vía broker
- [ ] T152 Implementar APIs dedicadas y comparador de volatilidad en backend/src/routes/strategies/volatility/ (longStraddle.ts, longStrangle.ts, shortStraddle.ts, shortStrangle.ts, volatilityComparator.ts) para exponer escenarios, viabilidad y recomendación contextual
- [ ] T175 Ejecutar ajuste de TEAM-07 al estándar transversal en backend/src/modules/strategies/volatility/ (straddle/strangle)

## Tareas de Tests Automatizados

- [ ] T190 [P] Tests unitarios para agentRouter, policyEngine y viabilityEvaluator en tests/unit/ai/orchestration/
- [ ] T191 [P] Tests unitarios para longStraddleEngine, longStrangleEngine, shortStraddleEngine y shortStrangleEngine en tests/unit/strategies/volatility/
- [ ] T192 [P] Tests de integracion para routes/ai/orchestratedIntelligence en tests/integration/ai/
