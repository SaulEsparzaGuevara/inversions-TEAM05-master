# Backlog de Equipo: TEAM-05

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-05
**Fuente**: 001-inv-tasks.md + team-task-allocation.md

## Tareas (literal del canon, con checkbox)

- [x] T030 [P] [US2] Adaptador Alpaca en backend/src/modules/brokers/alpacaAdapter.ts
- [x] T054 Reporte de cobertura MFA en backend/src/observability/mfaCoverageReport.ts
- [x] T106 Definir contrato de parámetros para análisis institucional en backend/src/modules/institutional/institutionalContract.ts incluyendo instrumento/ticker, strike, periodos (intradiario/diario/mensual/trimestral), volumen, liquidez, plazo (corto/mediano/largo), porcentaje en manos de fondos, flujos de entrada/salida y posiciones abiertas
- [x] T107 Implementar servicio de integración con fuentes externas institucionales en backend/src/modules/institutional/institutionalDataService.ts consumiendo SEC EDGAR 13F filings, FINRA short interest, Unusual Whales, Finviz institutional y alternativas gratuitas/de paga configurables, con normalización de respuesta, caché, fallback y manejo de rate limits
- [x] T108 Implementar motor de zonas institucionales en backend/src/modules/institutional/institutionalZonesEngine.ts para identificar soportes y resistencias donde fondos acumulan o distribuyen usando volumen institucional, análisis de velas OHLC y filtros de alta liquidez
- [x] T109 Implementar motor de tendencias institucionales en backend/src/modules/institutional/institutionalTrendEngine.ts con MAs de 50 y 200 días, detección de cruces, correlación entre reportes trimestrales y volumen diario creciente, y cálculo de probabilidad de continuidad de tendencia
- [x] T110 Implementar motor de análisis de vencimientos en backend/src/modules/institutional/expirationAnalysisEngine.ts que detecta fechas clave de opciones y futuros (mensual/trimestral) donde los institucionales ajustan posiciones y evalúa impacto esperado en precio del subyacente
- [x] T111 Implementar API de análisis institucional en backend/src/routes/institutional/institutionalAnalysis.ts retornando zonas S/R institucionales, tendencias MAs largas, cruce de períodos y métricas de posicionamiento como overlay para gráfico de velas
- [x] T112 Implementar API de posiciones y reportes regulatorios en backend/src/routes/institutional/regulatoryPositions.ts retornando posiciones abiertas de fondos, flujos y datos 13F para visualización en modal/panel de interfaz
- [x] T113 Definir contrato base de estrategias de cobertura en backend/src/modules/strategies/coverage/coverageStrategyContract.ts con interfaz unificada de inputs (ticker, cantidad de acciones, strikes, fechas de vencimiento, primas, capital, tolerancia al riesgo) y validación de consistencia
- [x] T114 Implementar core de Protective Put / Married Put en backend/src/modules/strategies/coverage/protectivePutEngine.ts con cálculo de protección máxima (strike – precio actual), simulación de escenarios de caída del subyacente, análisis costo-beneficio de cobertura, alertas de ejercicio anticipado y stop-loss cuando el subyacente se acerca al strike
- [x] T115 Implementar core de Collar Put en backend/src/modules/strategies/coverage/collarEngine.ts con simulación de rango de protección (put) y techo de ganancia (call), cálculo de costo neto (prima put – prima call), proyección de payoff en tiempo real y stop-loss automático si el subyacente rompe el rango esperado
- [x] T116 Implementar core de Covered Straddle en backend/src/modules/strategies/coverage/coveredStraddleEngine.ts con cálculo de ingresos por primas vendidas, simulación de escenarios de alta volatilidad y riesgo ilimitado, cuantificación de pérdidas potenciales en movimientos fuertes, alertas de margen y stop-loss en niveles críticos
- [x] T117 Implementar motor de simulación avanzada en backend/src/modules/strategies/coverage/coverageSimulationEngine.ts con Monte Carlo, escenarios determinísticos (subida/bajada %), backtesting con datos históricos de Supabase y proyección de payoff en tiempo real para las tres estrategias de cobertura
- [x] T118 Implementar servicio de alertas y gestión de riesgos en backend/src/modules/strategies/coverage/coverageRiskService.ts con stop-loss automático configurable, alertas de margen, notificaciones push/email al alcanzar niveles críticos y solicitud de cierre de operación vía broker
- [x] T119 Implementar módulo de reporting de cobertura en backend/src/modules/strategies/coverage/coverageReportService.ts con resumen de resultados esperados por estrategia, estadísticas de riesgo/beneficio, logs de simulación y ejecución y reportes exportables
- [x] T120 Implementar comparador de estrategias de cobertura en backend/src/modules/strategies/coverage/coverageComparator.ts que evalúa Protective Put, Collar Put y Covered Straddle según P&L esperado, costo neto, nivel de riesgo y contexto multi-core para recomendar la estrategia más adecuada
- [x] T121 Implementar chat IA de análisis institucional y estrategias de cobertura en backend/src/modules/ai/institutionalCopilotChat.ts con acceso de solo lectura a Supabase sobre tablas de datos institucionales, posiciones regulatorias y resultados de simulación de estrategias
- [x] T173 Ejecutar ajuste de TEAM-05 al estándar transversal en backend/src/modules/strategies/coverage/ (protective/married put, collar, covered straddle)

## Tareas de Tests Automatizados

- [ ] T184 [P] Tests unitarios para institutionalZonesEngine, institutionalTrendEngine y expirationAnalysisEngine en tests/unit/institutional/
- [x] T185 [P] Tests unitarios para protectivePutEngine, collarEngine, coveredStraddleEngine y coverageComparator en tests/unit/strategies/coverage/
- [x] T186 [P] Tests de integracion para routes/institutional/institutionalAnalysis y routes/institutional/regulatoryPositions en tests/integration/institutional/

## Mapeos Speckit -> Diana
- Speckit T030 -> Diana T030
- Speckit T054 -> Diana T054
- Speckit T106 -> Diana T106
- Speckit T107 -> Diana T107
- Speckit T108 -> Diana T108
- Speckit T109 -> Diana T109
- Speckit T110 -> Diana T110
- Speckit T111 -> Diana T111
- Speckit T112 -> Diana T112
- Speckit T113 -> Diana T113
- Speckit T114 -> Diana T114
- Speckit T115 -> Diana T115
- Speckit T116 -> Diana T116
- Speckit T117 -> Diana T117
- Speckit T118 -> Diana T118
- Speckit T119 -> Diana T119
- Speckit T120 -> Diana T120
- Speckit T121 -> Diana T121
- Speckit T173 -> Diana T173
- Speckit T200 -> Diana T113
- Speckit T201 -> Diana T119
- Speckit T202 -> Diana T119
- Speckit T203 -> Diana T054
- Speckit T204 -> Diana T185
- Speckit T205 -> Diana T119
- Speckit T206 -> Diana T113
- Speckit T207 -> Diana T113
- Speckit T208 -> Diana T107
- Speckit T209 -> Diana T186
- Speckit T210 -> Diana T119

