# Backlog de Equipo: TEAM-06

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-06
**Fuente**: 001-inv-tasks.md + team-task-allocation.md

## Tareas (literal del canon, con checkbox)

- [x] T009 Definir tipos y transiciones del ciclo canónico de orden en backend/src/domain/orderLifecycle.ts
- [x] T010 [P] Definir esquema de eventos de auditoría en backend/src/domain/auditEvent.ts
- [x] T011 [P] Implementar helper de disclaimer en backend/src/domain/disclaimer.ts
- [x] T014 [P] Implementar métricas base de market data en backend/src/observability/marketFreshness.ts
- [x] T045 [P] Actualizar contrato de ciclo de vida en specs/001-plataforma-inversiones-ia/contracts/signal-lifecycle.md
- [ ] T122 Definir contrato de parámetros de noticias en backend/src/modules/news/newsContract.ts incluyendo instrumento/ticker/empresa, periodos relevantes (earnings y macro), open interest/flujos institucionales, reportes regulatorios y formato de salida para overlay en velas
- [ ] T123 Implementar servicio de integración de noticias y mercado en backend/src/modules/news/newsDataService.ts consumiendo Finnhub, NewsAPI, Alpha Vantage, Polygon, SEC EDGAR y CFTC COT con normalización, deduplicación, fallback, caché y control de rate limits
- [ ] T124 Implementar clasificador de impacto de noticias en backend/src/modules/news/newsImpactEngine.ts para etiquetar eventos positivo/negativo/neutro, calcular score de impacto y confianza por instrumento
- [ ] T125 Implementar correlador de noticias con estructura técnica en backend/src/modules/news/newsTechnicalCorrelation.ts para relacionar noticias con soportes/resistencias/tendencias y detectar continuidad o reversión probable
- [ ] T126 Implementar API de noticias para confluencia en backend/src/routes/news/newsConfluence.ts retornando eventos, sentimiento, impacto y anotaciones listas para graficar sobre velas
- [ ] T127 Implementar API de contexto regulatorio e institucional en backend/src/routes/news/regulatoryInstitutionalContext.ts retornando señales de SEC 13F, CFTC COT y open interest para enriquecer decisiones de estrategia
- [ ] T128 Definir contrato base de estrategias Spread en backend/src/modules/strategies/spreads/spreadStrategyContract.ts con validaciones de strikes, vencimiento, primas, cantidad de contratos, capital y tolerancia de riesgo
- [ ] T129 Implementar core de Protective Debit Spread (Bull Call/Bear Put) en backend/src/modules/strategies/spreads/debitSpreadEngine.ts con cálculo de costo neto, P&L esperado, break-even, simulación de escenarios subida/bajada y stop-loss por niveles
- [ ] T130 Implementar core de Credit Spread (Bull Put/Bear Call) en backend/src/modules/strategies/spreads/creditSpreadEngine.ts con cálculo de ingreso neto por primas, riesgo limitado, pérdida máxima, alertas de margen y stop-loss en ruptura de niveles críticos
- [ ] T131 Implementar motor de simulación transversal de spreads en backend/src/modules/strategies/spreads/spreadSimulationEngine.ts con backtesting histórico, Monte Carlo/escenarios determinísticos y proyección de payoff en tiempo real
- [ ] T132 Implementar servicio de riesgo y alertas para spreads en backend/src/modules/strategies/spreads/spreadRiskService.ts con stop-loss automático, alertas push/email y gatillos de cierre operativo
- [ ] T133 Implementar módulo de reporting de spreads en backend/src/modules/strategies/spreads/spreadReportingService.ts con estadísticas riesgo/beneficio, logs de simulación/ejecución y resumen exportable por estrategia
- [ ] T134 Implementar comparador de estrategias spread en backend/src/modules/strategies/spreads/spreadComparator.ts para recomendar Debit vs Credit según contexto multi-core, volatilidad e impacto noticioso
- [ ] T135 Implementar orquestador noticias-estrategias en backend/src/modules/strategies/spreads/newsDrivenSpreadOrchestrator.ts para ajustar parámetros de spread en tiempo real según eventos noticiosos y contexto regulatorio
- [ ] T136 Implementar chat IA de noticias y spreads en backend/src/modules/ai/newsSpreadCopilotChat.ts con acceso de solo lectura a Supabase sobre noticias procesadas, señales regulatorias y resultados de simulación
- [ ] T174 Ejecutar ajuste de TEAM-06 al estándar transversal en backend/src/modules/strategies/spreads/ (debit/credit spread)

## Tareas de Tests Automatizados

- [ ] T187 [P] Tests unitarios para newsImpactEngine, newsTechnicalCorrelation y newsDataService en tests/unit/news/
- [ ] T188 [P] Tests unitarios para debitSpreadEngine, creditSpreadEngine y spreadComparator en tests/unit/strategies/spreads/
- [ ] T189 [P] Tests de integracion para routes/news/newsConfluence y routes/news/regulatoryInstitutionalContext en tests/integration/news/
