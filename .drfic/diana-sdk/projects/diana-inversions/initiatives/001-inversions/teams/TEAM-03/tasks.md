# Backlog de Equipo: TEAM-03

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-03
**Fuente**: 001-inv-tasks.md + team-task-allocation.md

## Tareas (literal del canon, con checkbox)

- [x] T049 [P] Definir SLI/SLO de disponibilidad en backend/src/observability/availabilitySlo.ts
- [x] T050 Consolidación mensual de disponibilidad en backend/src/jobs/monthlyAvailabilityReport.ts
- [ ] T077 Definir contrato de parámetros de análisis fundamental en backend/src/modules/fundamental/fundamentalSourceContract.ts incluyendo campos clave: Market Cap, Sales, Dividendos, Precio, ROE, P/E, Empleados, Beta, EPS, Sector, país y metadata de fuente
- [ ] T078 Implementar servicio de integración con fuentes externas (Finviz, Yahoo Finance, Alphavantage u otras gratuitas/de paga) en backend/src/modules/fundamental/fundamentalDataService.ts con manejo de rate limits, caché y fallback entre fuentes
- [ ] T079 Implementar motor de viabilidad de inversión fundamental en backend/src/modules/fundamental/viabilityEngine.ts que puntúa cada empresa con scorecard ponderado y retorna recomendación (viable / neutral / no viable) con justificación por atributo
- [ ] T080 Implementar API REST de perfil fundamental por empresa en backend/src/routes/fundamental/companyProfile.ts retornando todos los atributos, score de viabilidad y datos de contexto para modal/apartado en interfaz principal
- [ ] T081 Implementar API de screener S&P500 en backend/src/routes/fundamental/sp500Screener.ts que rankea empresas del índice por tipo de estrategia y viabilidad fundamental, retornando top N candidatos con justificación
- [ ] T082 Definir contrato base de parámetros de estrategias de opciones en backend/src/modules/strategies/optionsStrategyContract.ts con campos: ticker, tipo de opción, strike, fecha expiración, prima, cantidad, dirección, capital disponible, tolerancia al riesgo y metadatos de simulación
- [ ] T083 Implementar core de estrategia Long Call en backend/src/modules/strategies/options/longCall.ts con cálculo de P&L, break-even, máximo beneficio/pérdida, simulación temporal por escenarios de precio, integración de stop-loss y emisión de alertas
- [ ] T084 Implementar core de estrategia Long Put en backend/src/modules/strategies/options/longPut.ts con las mismas capacidades que T083
- [ ] T085 Implementar core de estrategia Short Call en backend/src/modules/strategies/options/shortCall.ts con las mismas capacidades que T083 y lógica de margen requerido
- [ ] T086 Implementar core de estrategia Short Put en backend/src/modules/strategies/options/shortPut.ts con las mismas capacidades que T083 y lógica de margen requerido
- [ ] T087 Implementar motor de simulación temporal de estrategias en backend/src/modules/strategies/simulationEngine.ts que proyecta P&L a lo largo del tiempo considerando theta decay, movimiento del subyacente y volatilidad implícita
- [ ] T088 Implementar servicio de alertas en tiempo real y ejecución de stop-loss en backend/src/modules/strategies/alertService.ts que monitorea posiciones abiertas, emite alertas configurables y puede solicitar cierre de operación vía broker
- [ ] T089 Implementar motor comparador de estrategias en backend/src/modules/strategies/strategyComparator.ts que evalúa P&L esperado, riesgo y contexto de todos los cores activos para recomendar la estrategia más adecuada
- [ ] T090 Implementar chat IA de análisis fundamental y estrategias en backend/src/modules/ai/fundamentalCopilotChat.ts con acceso de solo lectura a Supabase sobre tablas de empresas, métricas fundamentales y posiciones de estrategias
- [ ] T171 Ejecutar ajuste de TEAM-03 al estándar transversal en backend/src/modules/strategies/options/ y backend/src/modules/strategies/strategyComparator.ts (long/short call-put)
