# Backlog de Equipo: TEAM-02

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-02
**Fuente**: 001-inv-tasks.md + team-task-allocation.md

## Tareas (literal del canon, con checkbox)

- [x] T002 [P] Inicializar workspace frontend y scripts en frontend/package.json
- [x] T004 [P] Agregar scripts raíz de calidad en package.json
- [x] T017 [P] [US1] Configuración de fuentes en backend/src/modules/signals/sourceConfig.ts
- [x] T018 [P] [US1] Servicio de confluencia en backend/src/modules/signals/confluenceEngine.ts
- [x] T019 [P] [US1] Ensamblador de explicabilidad en backend/src/modules/signals/explainability.ts
- [x] T020 [US1] Endpoint de evaluación de señales en backend/src/routes/signals/evaluate.ts
- [x] T021 [US1] Endpoint de detalle de señal en backend/src/routes/signals/details.ts
- [x] T025 [US1] Auditoría de SIGNAL_GENERATED en backend/src/modules/signals/signalAudit.ts
- [ ] T069 Definir contrato de parámetros por indicador técnico en backend/src/modules/indicators/indicatorParams.ts para EMA, MACD, ADX, RSI, Bollinger Bands y extensibles
- [ ] T070 Implementar motor de ejecución multi-indicador en backend/src/modules/indicators/indicatorEngine.ts que procese ticket/instrumento, temporalidad, rango de velas y parámetros por indicador
- [ ] T071 Implementar API de evaluación de indicadores seleccionados en backend/src/routes/indicators/evaluateIndicators.ts retornando zonas/series por indicador para overlay en gráfico
- [ ] T072 Implementar servicio de confluencia estricta en backend/src/modules/indicators/confluenceSignals.ts que devuelva solo coincidencias BUY/SELL entre todos los indicadores seleccionados
- [ ] T073 Implementar explicabilidad por señal en backend/src/modules/indicators/signalExplainability.ts con motivo, parámetros efectivos y evidencia de cálculo por indicador
- [ ] T074 Implementar chat IA de indicadores en backend/src/modules/ai/indicatorCopilotChat.ts con acceso de solo lectura a Supabase sobre tablas analíticas de indicadores
- [ ] T075 Implementar generador de reportes HTML descargables en backend/src/modules/reports/indicatorReportService.ts desde resultados de indicadores y consultas del chat IA
- [ ] T076 Implementar servicio de visualizaciones analíticas en backend/src/modules/reports/indicatorChartService.ts para construir gráficas solicitadas por el usuario desde datos de indicadores
