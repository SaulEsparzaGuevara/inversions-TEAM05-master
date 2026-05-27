# Backlog de Equipo: TEAM-04

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-04
**Fuente**: 001-inv-tasks.md + team-task-allocation.md

## Tareas (literal del canon, con checkbox)

- [x] T029 [P] [US2] Adaptador IBKR en backend/src/modules/brokers/ibkrAdapter.ts
- [x] T053 [P] Verificador de cobertura MFA en backend/src/observability/mfaCoverageAudit.ts
- [ ] T091 Definir contrato de entrada/salida para análisis técnico estructural en backend/src/modules/technical/structureContract.ts incluyendo instrumento, temporalidad, rango de velas, modo de cálculo (interno/externo) y payload para dibujar líneas en gráfico
- [ ] T092 Implementar algoritmo interno de soportes/resistencias en backend/src/modules/technical/supportResistanceEngine.ts usando historial OHLC, zonas de acumulación y reglas configurables de pivotes
- [ ] T093 Implementar algoritmo interno de tendencias en backend/src/modules/technical/trendLineEngine.ts con reglas de agrupación por bloques de velas (por ejemplo ventanas de 5) y validación de consistencia de apertura/cierre
- [ ] T094 Implementar integración con proveedores externos de análisis técnico en backend/src/modules/technical/externalTechnicalProvider.ts (gratuitos y de paga) con normalización de respuesta para overlay de gráfico
- [ ] T095 Implementar selector de modo técnico en backend/src/modules/technical/technicalModeSelector.ts para decidir en runtime entre cálculo interno y proveedor externo según preferencia del usuario
- [ ] T096 Implementar API de estructura técnica en backend/src/routes/technical/marketStructure.ts que retorne soportes, resistencias y tendencias listos para graficar en la interfaz principal
- [ ] T097 Implementar motor de pronóstico de velas en backend/src/modules/technical/forecastEngine.ts que proyecte horas/días/semanas según temporalidad, usando soportes, resistencias, tendencias y estado reciente del precio
- [ ] T098 Implementar enriquecedor de contexto multi-core en backend/src/modules/technical/forecastContextAggregator.ts que incorpore señales de fundamental, indicadores, noticias e institucional para robustecer el pronóstico
- [ ] T099 Implementar API de pronóstico explicable en backend/src/routes/technical/forecast.ts retornando velas futuras proyectadas, explicación del motivo, régimen esperado (rango/alcista/bajista) y bandera de viabilidad de inversión
- [ ] T100 Definir contrato base de estrategia Wheel en backend/src/modules/strategies/wheel/wheelContract.ts con parámetros de Covered Call y Cash-Secured Put (ticker, strike, expiry, prima, capital, riesgo, reglas de asignación)
- [ ] T101 Implementar core de Covered Call en backend/src/modules/strategies/wheel/coveredCallEngine.ts con cálculo de payoff, break-even, retorno esperado y simulación temporal
- [ ] T102 Implementar core de Cash-Secured Put en backend/src/modules/strategies/wheel/cashSecuredPutEngine.ts con cálculo de payoff, break-even, retorno esperado y simulación temporal
- [ ] T103 Implementar orquestador Wheel en backend/src/modules/strategies/wheel/wheelOrchestrator.ts para gestionar transición entre etapas, generar alertas, aplicar stop-loss y coordinar acciones de cierre
- [ ] T104 Implementar comparador de estrategias para Wheel en backend/src/modules/strategies/wheel/wheelComparator.ts para contrastar Covered Call vs Cash-Secured Put y recomendar opción según contexto de todos los cores
- [ ] T105 Implementar chat IA de análisis técnico y estrategia Wheel en backend/src/modules/ai/technicalWheelCopilotChat.ts con acceso de solo lectura a Supabase para métricas técnicas, pronósticos y resultados de estrategias
- [ ] T172 Ejecutar ajuste de TEAM-04 al estándar transversal en backend/src/modules/strategies/wheel/ (covered call/cash-secured put/wheel comparator)

## Tareas de Tests Automatizados

- [ ] T181 [P] Tests unitarios para supportResistanceEngine, trendLineEngine y forecastEngine en tests/unit/technical/
- [ ] T182 [P] Tests unitarios para coveredCallEngine, cashSecuredPutEngine y wheelOrchestrator en tests/unit/strategies/wheel/
- [ ] T183 [P] Tests de integracion para routes/technical/marketStructure y routes/technical/forecast en tests/integration/technical/
