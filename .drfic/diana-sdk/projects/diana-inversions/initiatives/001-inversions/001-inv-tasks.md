# Backlog Canónico Diana
## Plataforma de Inversiones con IA

Identificador: 001-INV-TASKS
Proyecto: DIANA Inversions
Iniciativa: 001-inversions
Version de generacion: 2026-05-03
Accion: /diana.tasks action="generate" scope="project" project="diana-inversions" initiative="001-inversions"

---

## Autoridad

Este backlog canónico está subordinado a:
1. inv-constitution.md
2. 001-inv-spec.md
3. 001-inv-plan.md

Ante conflicto, prevalece la constitución del proyecto.

---

## Entradas Oficiales Consumidas

Fuentes canónicas:
- .drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml
- .drfic/diana-sdk/projects/diana-inversions/inv-constitution.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-spec.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-plan.md

Fuentes operativas derivadas:
- specs/001-plataforma-inversiones-ia/spec.md
- specs/001-plataforma-inversiones-ia/plan.md
- specs/001-plataforma-inversiones-ia/tasks.md

Skills y knowledge first:
- .drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/skills-manifest.yaml
- .drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/agent-skill-matrix.yaml
- .drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/sdd-engine-matrix.yaml

---

## Política de Derivación hacia Speckit

- Este archivo es la fuente canónica del backlog de la iniciativa.
- specs/001-plataforma-inversiones-ia/tasks.md se considera backlog operativo derivado para ejecución con SpecKit.
- Los IDs T000-T059 deben permanecer estables entre ambos artefactos.
- Si existe divergencia futura, debe registrarse aquí primero y luego sincronizar el derivado operativo.

---

## Cobertura Canónica

- Fase 1: Preparación de plataforma
- Fase 2: Fundacional bloqueante
- Fase 3: User Story 1, evaluación de oportunidades
- Fase 4: User Story 2, control humano en ejecución
- Fase 5: User Story 3, auditoría y resultados
- Fase 6: Cierre, hardening y validación transversal
- Fase 7: TEAM-01 Dashboard e Integración Broker
- Fase 8: TEAM-02 Indicadores técnicos y chat IA
- Fase 9: TEAM-03 Análisis fundamental y estrategias básicas de opciones
- Fase 10: TEAM-04 Estructura técnica y estrategia Wheel
- Fase 11: TEAM-05 Análisis institucional y estrategias de cobertura
- Fase 12: TEAM-06 Noticias y spreads
- Fase 13: TEAM-07 Core AI multi-agente y estrategias long/short volatility
- Fase 14: TEAM-08 Estrategias complejas
- Fase 15: TEAM-09 Estrategias Calendar y Diagonal
- Fase 16: Estandarización transversal de estrategias

---

## Fase 1: Preparación

Objetivo:
Establecer estructura monorepo base del portafolio, frontend, backend y convenciones de calidad.

Tareas:
- [ ] T000 Definir y documentar la estructura canónica del monorepo bajo `projects/packages`, `projects/pwa` y `projects/rest-api`, incluyendo criterios de reutilización y ownership por categoría
- [x] T001 Crear carpetas base y README inicial en frontend/README.md y backend/README.md
- [x] T002 [P] Inicializar workspace frontend y scripts en frontend/package.json
- [x] T003 [P] Inicializar workspace backend y scripts en backend/package.json
- [x] T004 [P] Agregar scripts raíz de calidad en package.json
- [x] T005 [P] Crear plantilla compartida de entorno en backend/.env.example
- [ ] T059 Definir y generar esquema inicial de base de datos operativa en Supabase (tablas, índices y relaciones para Usuario, ActivoInversion, FuenteAnalitica, SenalInversion, EvidenciaAnalitica, PropuestaOperativa, DecisionHumana, IntentoEjecucion y RegistroAuditoria), incluyendo migración baseline y política de versionado de cambios en backend/src/database/supabase/

---

## Fase 2: Fundacional

Objetivo:
Cerrar prerrequisitos de seguridad, gobernanza, auditoría, concurrencia y observabilidad.

Tareas:
- [x] T006 Implementar middleware JWT y contexto de autenticación en backend/src/middleware/authContext.ts
- [x] T007 [P] Implementar guard RBAC en backend/src/middleware/rbac.ts
- [x] T008 [P] Implementar guard MFA en backend/src/middleware/mfaGuard.ts
- [x] T009 Definir tipos y transiciones del ciclo canónico de orden en backend/src/domain/orderLifecycle.ts
- [x] T010 [P] Definir esquema de eventos de auditoría en backend/src/domain/auditEvent.ts
- [x] T011 [P] Implementar helper de disclaimer en backend/src/domain/disclaimer.ts
- [x] T012 Implementar rate limiting para endpoints sensibles en backend/src/middleware/rateLimit.ts
- [x] T013 [P] Implementar optimistic locking en backend/src/domain/versioning.ts
- [x] T014 [P] Implementar métricas base de market data en backend/src/observability/marketFreshness.ts
- [x] T015 Crear configuración de retención y partición en backend/src/config/dataGovernance.ts
- [x] T016 Crear política de resiliencia de dependencias en backend/src/config/dependencySlo.ts

---

## Fase 3: US1

Objetivo:
Generar señales explicables por confluencia con evidencia trazable.

Tareas:
- [x] T017 [P] [US1] Configuración de fuentes en backend/src/modules/signals/sourceConfig.ts
- [x] T018 [P] [US1] Servicio de confluencia en backend/src/modules/signals/confluenceEngine.ts
- [x] T019 [P] [US1] Ensamblador de explicabilidad en backend/src/modules/signals/explainability.ts
- [x] T020 [US1] Endpoint de evaluación de señales en backend/src/routes/signals/evaluate.ts
- [x] T021 [US1] Endpoint de detalle de señal en backend/src/routes/signals/details.ts
- [x] T022 [P] [US1] Página frontend de evaluación en frontend/src/features/signals/SignalEvaluationPage.tsx
- [x] T023 [P] [US1] Panel frontend de evidencia en frontend/src/features/signals/SignalEvidencePanel.tsx
- [x] T024 [US1] Servicios frontend de señales en frontend/src/services/signals/signalApi.ts
- [x] T025 [US1] Auditoría de SIGNAL_GENERATED en backend/src/modules/signals/signalAudit.ts

---

## Fase 4: US2

Objetivo:
Garantizar control humano explícito para aprobación y ejecución asistida.

Tareas:
- [x] T026 [P] [US2] Servicio de aprobación MFA en backend/src/modules/execution/approvalService.ts
- [x] T027 [P] [US2] Orquestador de ejecución asistida en backend/src/modules/execution/executionService.ts
- [x] T028 [P] [US2] Contrato adaptador broker en backend/src/modules/brokers/brokerAdapter.ts
- [x] T029 [P] [US2] Adaptador IBKR en backend/src/modules/brokers/ibkrAdapter.ts
- [x] T030 [P] [US2] Adaptador Alpaca en backend/src/modules/brokers/alpacaAdapter.ts
- [x] T031 [US2] Endpoint de aprobación en backend/src/routes/execution/approve.ts
- [x] T032 [US2] Endpoint de ejecución en backend/src/routes/execution/execute.ts
- [x] T033 [US2] Recuperación fail-fast en backend/src/modules/execution/failureRecovery.ts
- [x] T034 [P] [US2] Flujo UI de aprobación en frontend/src/features/execution/ApprovalFlow.tsx
- [x] T035 [P] [US2] Panel UI de ejecución en frontend/src/features/execution/ExecutionPanel.tsx
- [x] T036 [US2] Eventos de auditoría de ejecución en backend/src/modules/execution/executionAudit.ts

---

## Fase 5: US3

Objetivo:
Exponer historial auditable completo de señal, decisión y ejecución.

Tareas:
- [x] T037 [P] [US3] Servicio de historial de auditoría en backend/src/modules/audit/historyService.ts
- [x] T038 [P] [US3] Analítica de portafolio auditable en backend/src/modules/analytics/portfolioService.ts
- [x] T039 [US3] Endpoint de historial en backend/src/routes/audit/history.ts
- [x] T040 [US3] Endpoint de detalle operativo en backend/src/routes/audit/operationDetail.ts
- [x] T041 [P] [US3] Dashboard frontend de historial en frontend/src/features/audit/AuditHistoryPage.tsx
- [x] T042 [P] [US3] Timeline operativo en frontend/src/features/audit/OperationTimeline.tsx
- [x] T043 [US3] Métricas de historial en backend/src/observability/historyMetrics.ts

---

## Fase 6: Cierre y Aspectos Transversales

Objetivo:
Cerrar trazabilidad contractual, hardening, SLOs, runbooks y cumplimiento documental.

Tareas:
- [x] T044 [P] Actualizar contrato broker en specs/001-plataforma-inversiones-ia/contracts/broker-adapter.md
- [x] T045 [P] Actualizar contrato de ciclo de vida en specs/001-plataforma-inversiones-ia/contracts/signal-lifecycle.md
- [x] T046 [P] Actualizar contrato de auth en specs/001-plataforma-inversiones-ia/contracts/auth-context.md
- [x] T047 Agregar matriz de trazabilidad en specs/001-plataforma-inversiones-ia/plan.md
- [x] T048 Ejecutar validación de quickstart en specs/001-plataforma-inversiones-ia/quickstart.md
- [x] T049 [P] Definir SLI/SLO de disponibilidad en backend/src/observability/availabilitySlo.ts
- [x] T050 Consolidación mensual de disponibilidad en backend/src/jobs/monthlyAvailabilityReport.ts
- [x] T051 [P] Definir runbook de recuperación en specs/001-plataforma-inversiones-ia/quickstart.md
- [x] T052 Ejecutar simulacro RTO/RPO en specs/001-plataforma-inversiones-ia/quickstart.md
- [x] T053 [P] Verificador de cobertura MFA en backend/src/observability/mfaCoverageAudit.ts
- [x] T054 Reporte de cobertura MFA en backend/src/observability/mfaCoverageReport.ts
- [x] T055 [P] Checklist de ownership por raíz en specs/001-plataforma-inversiones-ia/checklists/plan-quality.md
- [x] T056 Gate de no-regresión estructural en scripts/validate-structure.ps1
- [x] T057 [P] Normalizar redacción a español técnico en specs/001-plataforma-inversiones-ia/tasks.md
- [x] T058 Checklist de comentarios FIC bilingües en backend/src/config/ficCommentPolicy.ts

---

## Fase 7: TEAM-01 Dashboard e Integración Broker

Objetivo:
Implementar el dashboard principal de confluencia de señales, configuración operativa de BD y wiring completo de brokers para TEAM-01.

Tareas:
- [ ] T060 Configurar cliente de Supabase en backend/src/database/supabase/client.ts y crear base repositories pattern en backend/src/repositories/
- [ ] T061 Crear migraciones versionadas de esquema baseline (Usuario, ActivoInversion, FuenteAnalitica, SenalInversion, etc.) en backend/src/database/supabase/migrations/ con changelog y rollback scripts
- [ ] T062 Validador de .env en backend/src/config/envValidator.ts que asegure credenciales obligatorias (SUPABASE_URL, SUPABASE_KEY, IBKR_ACCOUNT, ALPACA_API_KEY) están presentes en startup
- [ ] T063 Integrar dashboard frontend principal en frontend/src/features/dashboard/MainDashboard.tsx con selector de instrumentos, temporalidad y rango de fechas
- [ ] T064 Panel de activación de cores en frontend/src/features/dashboard/CoreSelector.tsx (Technical, News, Fundamental, Institutional, AI Advisor, Strategies) con toggle por core
- [ ] T065 Overlay de señales en gráfico en frontend/src/features/dashboard/SignalOverlay.tsx mostrando señales por core y confluencia con controles de visibilidad
- [ ] T066 Tabla de explicabilidad en frontend/src/features/dashboard/ExplainabilityTable.tsx listando atributos de detonación, desglose de cálculo, score/confidence/source
- [ ] T067 API orchestrador en backend/src/routes/dashboard/orchestrator.ts que consume resultados de otros equipos y consolida en vista única
- [ ] T068 Wiring de integración broker en backend/src/modules/brokers/brokerIntegration.ts cableando IBKR + Alpaca APIs y validación en sandbox

---

## Fase 8: TEAM-02 Core Indicadores Técnicos + Chat IA

Objetivo:
Implementar el cerebro API de indicadores técnicos parametrizados, confluencia operativa de señales y chat IA con analítica/reportes sobre datos en Supabase.

Tareas:
- [ ] T069 Definir contrato de parámetros por indicador técnico en backend/src/modules/indicators/indicatorParams.ts para EMA, MACD, ADX, RSI, Bollinger Bands y extensibles
- [ ] T070 Implementar motor de ejecución multi-indicador en backend/src/modules/indicators/indicatorEngine.ts que procese ticket/instrumento, temporalidad, rango de velas y parámetros por indicador
- [ ] T071 Implementar API de evaluación de indicadores seleccionados en backend/src/routes/indicators/evaluateIndicators.ts retornando zonas/series por indicador para overlay en gráfico
- [ ] T072 Implementar servicio de confluencia estricta en backend/src/modules/indicators/confluenceSignals.ts que devuelva solo coincidencias BUY/SELL entre todos los indicadores seleccionados
- [ ] T073 Implementar explicabilidad por señal en backend/src/modules/indicators/signalExplainability.ts con motivo, parámetros efectivos y evidencia de cálculo por indicador
- [ ] T074 Implementar chat IA de indicadores en backend/src/modules/ai/indicatorCopilotChat.ts con acceso de solo lectura a Supabase sobre tablas analíticas de indicadores
- [ ] T075 Implementar generador de reportes HTML descargables en backend/src/modules/reports/indicatorReportService.ts desde resultados de indicadores y consultas del chat IA
- [ ] T076 Implementar servicio de visualizaciones analíticas en backend/src/modules/reports/indicatorChartService.ts para construir gráficas solicitadas por el usuario desde datos de indicadores

---

## Fase 9: TEAM-03 Análisis Fundamental + Estrategias Básicas de Opciones + Chat IA

Objetivo:
Implementar el core de análisis fundamental con scraping/integración a fuentes externas (Finviz, Yahoo Finance), scoring de viabilidad por empresa, screener del S&P500, cores de estrategias Long Call / Long Put / Short Call / Short Put con simulación temporal, stop-loss y alertas, motor comparador de estrategias y chat IA sobre datos fundamentales.

Tareas:

### Análisis Fundamental
- [ ] T077 Definir contrato de parámetros de análisis fundamental en backend/src/modules/fundamental/fundamentalSourceContract.ts incluyendo campos clave: Market Cap, Sales, Dividendos, Precio, ROE, P/E, Empleados, Beta, EPS, Sector, país y metadata de fuente
- [ ] T078 Implementar servicio de integración con fuentes externas (Finviz, Yahoo Finance, Alphavantage u otras gratuitas/de paga) en backend/src/modules/fundamental/fundamentalDataService.ts con manejo de rate limits, caché y fallback entre fuentes
- [ ] T079 Implementar motor de viabilidad de inversión fundamental en backend/src/modules/fundamental/viabilityEngine.ts que puntúa cada empresa con scorecard ponderado y retorna recomendación (viable / neutral / no viable) con justificación por atributo
- [ ] T080 Implementar API REST de perfil fundamental por empresa en backend/src/routes/fundamental/companyProfile.ts retornando todos los atributos, score de viabilidad y datos de contexto para modal/apartado en interfaz principal
- [ ] T081 Implementar API de screener S&P500 en backend/src/routes/fundamental/sp500Screener.ts que rankea empresas del índice por tipo de estrategia y viabilidad fundamental, retornando top N candidatos con justificación

### Estrategias Básicas de Opciones
- [ ] T082 Definir contrato base de parámetros de estrategias de opciones en backend/src/modules/strategies/optionsStrategyContract.ts con campos: ticker, tipo de opción, strike, fecha expiración, prima, cantidad, dirección, capital disponible, tolerancia al riesgo y metadatos de simulación
- [ ] T083 Implementar core de estrategia Long Call en backend/src/modules/strategies/options/longCall.ts con cálculo de P&L, break-even, máximo beneficio/pérdida, simulación temporal por escenarios de precio, integración de stop-loss y emisión de alertas
- [ ] T084 Implementar core de estrategia Long Put en backend/src/modules/strategies/options/longPut.ts con las mismas capacidades que T083
- [ ] T085 Implementar core de estrategia Short Call en backend/src/modules/strategies/options/shortCall.ts con las mismas capacidades que T083 y lógica de margen requerido
- [ ] T086 Implementar core de estrategia Short Put en backend/src/modules/strategies/options/shortPut.ts con las mismas capacidades que T083 y lógica de margen requerido
- [ ] T087 Implementar motor de simulación temporal de estrategias en backend/src/modules/strategies/simulationEngine.ts que proyecta P&L a lo largo del tiempo considerando theta decay, movimiento del subyacente y volatilidad implícita
- [ ] T088 Implementar servicio de alertas en tiempo real y ejecución de stop-loss en backend/src/modules/strategies/alertService.ts que monitorea posiciones abiertas, emite alertas configurables y puede solicitar cierre de operación vía broker
- [ ] T089 Implementar motor comparador de estrategias en backend/src/modules/strategies/strategyComparator.ts que evalúa P&L esperado, riesgo y contexto de todos los cores activos para recomendar la estrategia más adecuada

### Chat IA
- [ ] T090 Implementar chat IA de análisis fundamental y estrategias en backend/src/modules/ai/fundamentalCopilotChat.ts con acceso de solo lectura a Supabase sobre tablas de empresas, métricas fundamentales y posiciones de estrategias

---

## Fase 10: TEAM-04 Análisis Técnico Estructural + Estrategia Wheel + Chat IA

Objetivo:
Implementar el core técnico para soportes, resistencias y tendencias con opción de cálculo interno o proveedor externo; generar pronóstico de velas futuras con explicación y viabilidad de inversión usando contexto multi-core; y desarrollar estrategias Wheel (Covered Call y Cash-Secured Put) con simulación, alertas, stop-loss y comparador.

Tareas:

### Análisis Técnico Estructural
- [ ] T091 Definir contrato de entrada/salida para análisis técnico estructural en backend/src/modules/technical/structureContract.ts incluyendo instrumento, temporalidad, rango de velas, modo de cálculo (interno/externo) y payload para dibujar líneas en gráfico
- [ ] T092 Implementar algoritmo interno de soportes/resistencias en backend/src/modules/technical/supportResistanceEngine.ts usando historial OHLC, zonas de acumulación y reglas configurables de pivotes
- [ ] T093 Implementar algoritmo interno de tendencias en backend/src/modules/technical/trendLineEngine.ts con reglas de agrupación por bloques de velas (por ejemplo ventanas de 5) y validación de consistencia de apertura/cierre
- [ ] T094 Implementar integración con proveedores externos de análisis técnico en backend/src/modules/technical/externalTechnicalProvider.ts (gratuitos y de paga) con normalización de respuesta para overlay de gráfico
- [ ] T095 Implementar selector de modo técnico en backend/src/modules/technical/technicalModeSelector.ts para decidir en runtime entre cálculo interno y proveedor externo según preferencia del usuario
- [ ] T096 Implementar API de estructura técnica en backend/src/routes/technical/marketStructure.ts que retorne soportes, resistencias y tendencias listos para graficar en la interfaz principal

### Pronóstico de Velas y Viabilidad
- [ ] T097 Implementar motor de pronóstico de velas en backend/src/modules/technical/forecastEngine.ts que proyecte horas/días/semanas según temporalidad, usando soportes, resistencias, tendencias y estado reciente del precio
- [ ] T098 Implementar enriquecedor de contexto multi-core en backend/src/modules/technical/forecastContextAggregator.ts que incorpore señales de fundamental, indicadores, noticias e institucional para robustecer el pronóstico
- [ ] T099 Implementar API de pronóstico explicable en backend/src/routes/technical/forecast.ts retornando velas futuras proyectadas, explicación del motivo, régimen esperado (rango/alcista/bajista) y bandera de viabilidad de inversión

### Estrategia Wheel
- [ ] T100 Definir contrato base de estrategia Wheel en backend/src/modules/strategies/wheel/wheelContract.ts con parámetros de Covered Call y Cash-Secured Put (ticker, strike, expiry, prima, capital, riesgo, reglas de asignación)
- [ ] T101 Implementar core de Covered Call en backend/src/modules/strategies/wheel/coveredCallEngine.ts con cálculo de payoff, break-even, retorno esperado y simulación temporal
- [ ] T102 Implementar core de Cash-Secured Put en backend/src/modules/strategies/wheel/cashSecuredPutEngine.ts con cálculo de payoff, break-even, retorno esperado y simulación temporal
- [ ] T103 Implementar orquestador Wheel en backend/src/modules/strategies/wheel/wheelOrchestrator.ts para gestionar transición entre etapas, generar alertas, aplicar stop-loss y coordinar acciones de cierre
- [ ] T104 Implementar comparador de estrategias para Wheel en backend/src/modules/strategies/wheel/wheelComparator.ts para contrastar Covered Call vs Cash-Secured Put y recomendar opción según contexto de todos los cores

### Chat IA
- [ ] T105 Implementar chat IA de análisis técnico y estrategia Wheel en backend/src/modules/ai/technicalWheelCopilotChat.ts con acceso de solo lectura a Supabase para métricas técnicas, pronósticos y resultados de estrategias

---

## Fase 11: TEAM-05 Análisis Institucional + Estrategias de Cobertura + Chat IA

Objetivo:
Implementar el core de análisis institucional con integración a fuentes externas regulatorias y de mercado (13F, SEC EDGAR, FINRA, alternativas gratuitas/de paga), identificación de zonas de acumulación/distribución, análisis de MAs largas (50/200 días) y vencimientos de opciones/futuros; y desarrollar los cores de estrategias Protective Put/Married Put, Collar Put y Covered Straddle con simulación Monte Carlo, backtesting, alertas, stop-loss automático, reporting y comparador multi-estrategia.

Tareas:

### Análisis Institucional
- [x] T106 Definir contrato de parámetros para análisis institucional en backend/src/modules/institutional/institutionalContract.ts incluyendo instrumento/ticker, strike, periodos (intradiario/diario/mensual/trimestral), volumen, liquidez, plazo (corto/mediano/largo), porcentaje en manos de fondos, flujos de entrada/salida y posiciones abiertas
- [x] T107 Implementar servicio de integración con fuentes externas institucionales en backend/src/modules/institutional/institutionalDataService.ts consumiendo SEC EDGAR 13F filings, FINRA short interest, Unusual Whales, Finviz institutional y alternativas gratuitas/de paga configurables, con normalización de respuesta, caché, fallback y manejo de rate limits
- [x] T108 Implementar motor de zonas institucionales en backend/src/modules/institutional/institutionalZonesEngine.ts para identificar soportes y resistencias donde fondos acumulan o distribuyen usando volumen institucional, análisis de velas OHLC y filtros de alta liquidez
- [x] T109 Implementar motor de tendencias institucionales en backend/src/modules/institutional/institutionalTrendEngine.ts con MAs de 50 y 200 días, detección de cruces, correlación entre reportes trimestrales y volumen diario creciente, y cálculo de probabilidad de continuidad de tendencia
- [x] T110 Implementar motor de análisis de vencimientos en backend/src/modules/institutional/expirationAnalysisEngine.ts que detecta fechas clave de opciones y futuros (mensual/trimestral) donde los institucionales ajustan posiciones y evalúa impacto esperado en precio del subyacente
- [x] T111 Implementar API de análisis institucional en backend/src/routes/institutional/institutionalAnalysis.ts retornando zonas S/R institucionales, tendencias MAs largas, cruce de períodos y métricas de posicionamiento como overlay para gráfico de velas
- [x] T112 Implementar API de posiciones y reportes regulatorios en backend/src/routes/institutional/regulatoryPositions.ts retornando posiciones abiertas de fondos, flujos y datos 13F para visualización en modal/panel de interfaz

### Estrategias de Cobertura
- [x] T113 Definir contrato base de estrategias de cobertura en backend/src/modules/strategies/coverage/coverageStrategyContract.ts con interfaz unificada de inputs (ticker, cantidad de acciones, strikes, fechas de vencimiento, primas, capital, tolerancia al riesgo) y validación de consistencia
- [x] T114 Implementar core de Protective Put / Married Put en backend/src/modules/strategies/coverage/protectivePutEngine.ts con cálculo de protección máxima (strike – precio actual), simulación de escenarios de caída del subyacente, análisis costo-beneficio de cobertura, alertas de ejercicio anticipado y stop-loss cuando el subyacente se acerca al strike
- [x] T115 Implementar core de Collar Put en backend/src/modules/strategies/coverage/collarEngine.ts con simulación de rango de protección (put) y techo de ganancia (call), cálculo de costo neto (prima put – prima call), proyección de payoff en tiempo real y stop-loss automático si el subyacente rompe el rango esperado
- [x] T116 Implementar core de Covered Straddle en backend/src/modules/strategies/coverage/coveredStraddleEngine.ts con cálculo de ingresos por primas vendidas, simulación de escenarios de alta volatilidad y riesgo ilimitado, cuantificación de pérdidas potenciales en movimientos fuertes, alertas de margen y stop-loss en niveles críticos
- [x] T117 Implementar motor de simulación avanzada en backend/src/modules/strategies/coverage/coverageSimulationEngine.ts con Monte Carlo, escenarios determinísticos (subida/bajada %), backtesting con datos históricos de Supabase y proyección de payoff en tiempo real para las tres estrategias de cobertura
- [x] T118 Implementar servicio de alertas y gestión de riesgos en backend/src/modules/strategies/coverage/coverageRiskService.ts con stop-loss automático configurable, alertas de margen, notificaciones push/email al alcanzar niveles críticos y solicitud de cierre de operación vía broker
- [x] T119 Implementar módulo de reporting de cobertura en backend/src/modules/strategies/coverage/coverageReportService.ts con resumen de resultados esperados por estrategia, estadísticas de riesgo/beneficio, logs de simulación y ejecución y reportes exportables
- [x] T120 Implementar comparador de estrategias de cobertura en backend/src/modules/strategies/coverage/coverageComparator.ts que evalúa Protective Put, Collar Put y Covered Straddle según P&L esperado, costo neto, nivel de riesgo y contexto multi-core para recomendar la estrategia más adecuada

### Chat IA
- [x] T121 Implementar chat IA de análisis institucional y estrategias de cobertura en backend/src/modules/ai/institutionalCopilotChat.ts con acceso de solo lectura a Supabase sobre tablas de datos institucionales, posiciones regulatorias y resultados de simulación de estrategias

---

## Fase 12: TEAM-06 Análisis de Noticias + Spreads (Debit/Credit) + Chat IA

Objetivo:
Implementar el core de noticias para ingestar eventos reales de mercado y regulatorios por instrumento, clasificar su impacto y devolver anotaciones listas para overlay en velas; y desarrollar los cores de estrategias Protective Debit Spread (Bull Call/Bear Put) y Credit Spread (Bull Put/Bear Call) con simulación temporal, gestión de riesgo, alertas, reporting y comparador contextual.

Tareas:

### Core de Noticias
- [ ] T122 Definir contrato de parámetros de noticias en backend/src/modules/news/newsContract.ts incluyendo instrumento/ticker/empresa, periodos relevantes (earnings y macro), open interest/flujos institucionales, reportes regulatorios y formato de salida para overlay en velas
- [ ] T123 Implementar servicio de integración de noticias y mercado en backend/src/modules/news/newsDataService.ts consumiendo Finnhub, NewsAPI, Alpha Vantage, Polygon, SEC EDGAR y CFTC COT con normalización, deduplicación, fallback, caché y control de rate limits
- [ ] T124 Implementar clasificador de impacto de noticias en backend/src/modules/news/newsImpactEngine.ts para etiquetar eventos positivo/negativo/neutro, calcular score de impacto y confianza por instrumento
- [ ] T125 Implementar correlador de noticias con estructura técnica en backend/src/modules/news/newsTechnicalCorrelation.ts para relacionar noticias con soportes/resistencias/tendencias y detectar continuidad o reversión probable
- [ ] T126 Implementar API de noticias para confluencia en backend/src/routes/news/newsConfluence.ts retornando eventos, sentimiento, impacto y anotaciones listas para graficar sobre velas
- [ ] T127 Implementar API de contexto regulatorio e institucional en backend/src/routes/news/regulatoryInstitutionalContext.ts retornando señales de SEC 13F, CFTC COT y open interest para enriquecer decisiones de estrategia

### Estrategias Spread
- [ ] T128 Definir contrato base de estrategias Spread en backend/src/modules/strategies/spreads/spreadStrategyContract.ts con validaciones de strikes, vencimiento, primas, cantidad de contratos, capital y tolerancia de riesgo
- [ ] T129 Implementar core de Protective Debit Spread (Bull Call/Bear Put) en backend/src/modules/strategies/spreads/debitSpreadEngine.ts con cálculo de costo neto, P&L esperado, break-even, simulación de escenarios subida/bajada y stop-loss por niveles
- [ ] T130 Implementar core de Credit Spread (Bull Put/Bear Call) en backend/src/modules/strategies/spreads/creditSpreadEngine.ts con cálculo de ingreso neto por primas, riesgo limitado, pérdida máxima, alertas de margen y stop-loss en ruptura de niveles críticos
- [ ] T131 Implementar motor de simulación transversal de spreads en backend/src/modules/strategies/spreads/spreadSimulationEngine.ts con backtesting histórico, Monte Carlo/escenarios determinísticos y proyección de payoff en tiempo real
- [ ] T132 Implementar servicio de riesgo y alertas para spreads en backend/src/modules/strategies/spreads/spreadRiskService.ts con stop-loss automático, alertas push/email y gatillos de cierre operativo
- [ ] T133 Implementar módulo de reporting de spreads en backend/src/modules/strategies/spreads/spreadReportingService.ts con estadísticas riesgo/beneficio, logs de simulación/ejecución y resumen exportable por estrategia
- [ ] T134 Implementar comparador de estrategias spread en backend/src/modules/strategies/spreads/spreadComparator.ts para recomendar Debit vs Credit según contexto multi-core, volatilidad e impacto noticioso
- [ ] T135 Implementar orquestador noticias-estrategias en backend/src/modules/strategies/spreads/newsDrivenSpreadOrchestrator.ts para ajustar parámetros de spread en tiempo real según eventos noticiosos y contexto regulatorio

### Chat IA
- [ ] T136 Implementar chat IA de noticias y spreads en backend/src/modules/ai/newsSpreadCopilotChat.ts con acceso de solo lectura a Supabase sobre noticias procesadas, señales regulatorias y resultados de simulación

---

## Fase 13: TEAM-07 Core AI Multi-Agente + Estrategias Long/Short Volatility

Objetivo:
Implementar un core de orquestación AI multi-agente (Copilot/Gemini/Claude/otros) que consolide resultados de todos los cores, ejecute investigación local/remota y en nube con verificación de fuentes, genere reportes profesionales con gráficas y determine viabilidad real de señales; además de los cores de estrategias Long/Short Volatility (Straddle/Strangle) con simulación avanzada, riesgo y ejecución.

Tareas:

### Core AI de Orquestación
- [ ] T137 Definir contrato de orquestación AI en backend/src/modules/ai/orchestration/orchestrationContract.ts con Request Envelope común (agente, estrategia, inputs, constraints, modo, formato de reporte), versionado y trazabilidad end-to-end por request_id
- [ ] T138 Implementar Strategy Registry en backend/src/modules/ai/orchestration/strategyRegistry.ts con catálogo de cores/estrategias, capacidades/skills declaradas, dependencias de datos, límites de riesgo y versionado semántico reproducible (ej. straddle_core@x.y.z)
- [ ] T139 Implementar Agent Router en backend/src/modules/ai/orchestration/agentRouter.ts para Copilot/Gemini/Claude/otros normalizando prompts y separando cálculo financiero crítico (motor determinístico) de narrativa (LLM)
- [ ] T140 Implementar Policy Engine en backend/src/modules/ai/orchestration/policyEngine.ts con reglas de investigación en tiempo real, whitelist de fuentes, evaluación de confiabilidad, resolución de conflictos entre fuentes y bloqueo de contenido no verificable
- [ ] T141 Implementar pipeline de investigación híbrida en backend/src/modules/ai/research/researchPipeline.ts que combine conocimiento local/remoto, consulta en nube en tiempo real, validación cruzada mínima de fuentes y scoring de confianza por evidencia
- [ ] T142 Implementar Report Engine profesional en backend/src/modules/ai/reports/reportEngine.ts para salida HTML/PDF/JSON con plantilla institucional (resumen ejecutivo, contexto, calidad de datos, escenarios, riesgos, viabilidad) y gráficas obligatorias (payoff, heatmap P&L, velas anotadas, drawdown)
- [ ] T143 Implementar Viability Evaluator multi-core en backend/src/modules/ai/orchestration/viabilityEvaluator.ts que clasifique señales viables/no viables, scoree confianza y produzca explicación auditada de por qué sí y por qué no
- [ ] T144 Implementar API de orquestación AI en backend/src/routes/ai/orchestratedIntelligence.ts que exponga investigación, reporte estructurado, viabilidad y trazabilidad de fuentes/versiones para la interfaz principal

### Estrategias Long/Short Volatility (Straddle/Strangle)
- [ ] T145 Definir contrato de estrategias de volatilidad en backend/src/modules/strategies/volatility/volatilityStrategyContract.ts con inputs (ticker, strikes, vencimiento, primas, contratos), validadores de consistencia y flag de estilo de opción (americano/europeo) para riesgo de ejercicio/asignación
- [ ] T146 Implementar core Long Straddle en backend/src/modules/strategies/volatility/longStraddleEngine.ts con costo neto, break-even dinámico, payoff/P&L temporal, sensibilidad a theta/IV y alertas operativas
- [ ] T147 Implementar core Long Strangle en backend/src/modules/strategies/volatility/longStrangleEngine.ts con costo neto, break-even, payoff/P&L temporal, sensibilidad a theta/IV y reglas de salida por DTE
- [ ] T148 Implementar core Short Straddle en backend/src/modules/strategies/volatility/shortStraddleEngine.ts con ingresos por primas, pérdida potencial ilimitada, margin stress, riesgo de asignación temprana y guardrails estrictos
- [ ] T149 Implementar core Short Strangle en backend/src/modules/strategies/volatility/shortStrangleEngine.ts con ingresos por primas, escenarios extremos de gap + IV expansion, riesgo de asignación y controles de defensa/roll
- [ ] T150 Implementar motor cuantitativo de volatilidad en backend/src/modules/strategies/volatility/volatilitySimulationEngine.ts con backtesting, Monte Carlo/escenarios determinísticos, shocks precio/IV, griegas (Delta/Gamma/Vega/Theta/Rho), costos reales (slippage/comisiones/spread) y proyección en tiempo real
- [ ] T151 Implementar Risk Engine de volatilidad en backend/src/modules/strategies/volatility/volatilityRiskEngine.ts con hard limits por estrategia/ticker, kill-switch diario/semanal, stop-loss automático, alertas push/email y hooks de cierre de operación vía broker
- [ ] T152 Implementar APIs dedicadas y comparador de volatilidad en backend/src/routes/strategies/volatility/ (longStraddle.ts, longStrangle.ts, shortStraddle.ts, shortStrangle.ts, volatilityComparator.ts) para exponer escenarios, viabilidad y recomendación contextual

## Fase 14: TEAM-08 Estrategias Complejas (Iron Condor/Butterfly/Condor)

Objetivo:
Implementar exclusivamente estrategias complejas de opciones (Iron Condor short/wide/delta, Iron Butterfly short/broken, Butterfly Spread y Condor call/put) con APIs dedicadas, simulación avanzada, visualización profesional, riesgo y reporting bajo el estándar transversal de estrategias.

Tareas:

### Core de Estrategias Complejas
- [ ] T153 Definir contrato base de estrategias complejas en backend/src/modules/strategies/complex/complexStrategyContract.ts con inputs validados (ticker, expiración, strikes por pata, primas, contratos, tipo de alas, tolerancia de riesgo, estilo de opción)
- [ ] T154 Implementar core de Iron Condor (short/wide/delta) en backend/src/modules/strategies/complex/ironCondorEngine.ts con construcción multi-leg, crédito neto, break-evens, pérdida/ganancia máximas y perfiles por configuración
- [ ] T155 Implementar core de Iron Butterfly (short/broken) en backend/src/modules/strategies/complex/ironButterflyEngine.ts con variantes short y broken wing, cálculo de payoff/P&L temporal y sensibilidad a desplazamiento del subyacente
- [ ] T156 Implementar core de Butterfly Spread (call/put) en backend/src/modules/strategies/complex/butterflySpreadEngine.ts con cálculo de débito/crédito neto, ventanas óptimas de beneficio y escenarios por volatilidad implícita
- [ ] T157 Implementar core de Condor (call/put) en backend/src/modules/strategies/complex/condorEngine.ts con estructura por patas, riesgos por anchura de alas, payoff/P&L temporal y reglas de ajuste
- [ ] T158 Implementar motor de simulación para estrategias complejas en backend/src/modules/strategies/complex/complexSimulationEngine.ts con backtesting, Monte Carlo/escenarios determinísticos, shocks de precio/IV y costos reales (slippage/comisiones/spread)
- [ ] T159 Implementar Risk Engine para estrategias complejas en backend/src/modules/strategies/complex/complexRiskEngine.ts con límites duros, alertas de margen, stop-loss automático, riesgo de asignación temprana y kill-switch
- [ ] T160 Implementar módulo de visualización y reporting de estrategias complejas en backend/src/modules/strategies/complex/complexReportEngine.ts con payoff curves, heatmaps P&L, velas anotadas, drawdown y resumen riesgo/beneficio
- [ ] T161 Implementar APIs dedicadas y comparador de estrategias complejas en backend/src/routes/strategies/complex/ (ironCondor.ts, ironButterfly.ts, butterflySpread.ts, condor.ts, complexComparator.ts) para exponer escenarios, viabilidad y recomendación

---

## Fase 15: TEAM-09 Estrategias Calendar y Diagonal

Objetivo:
Implementar estrategias Calendar Spread (call/put) y Diagonal Spread (call/put) con enfoque en estructura temporal, term structure de IV, simulación, riesgo, ajustes (roll) y comparación contextual bajo estándar transversal.

Tareas:

### Core Calendar/Diagonal
- [ ] T162 Definir contrato base Calendar/Diagonal en backend/src/modules/strategies/term/termStrategyContract.ts con inputs por pata (strikes, expiraciones cercanas/lejana, primas, contratos), validación de consistencia temporal y estilo de opción
- [ ] T163 Implementar core de Calendar Spread (call/put) en backend/src/modules/strategies/term/calendarSpreadEngine.ts con modelado de theta, vencimiento corto/largo, impacto de term structure IV y escenarios de precio
- [ ] T164 Implementar core de Diagonal Spread (call/put) en backend/src/modules/strategies/term/diagonalSpreadEngine.ts con combinación strike+tiempo, sensibilidad de griegas, perfiles de riesgo y ventanas de ajuste
- [ ] T165 Implementar motor de simulación temporal para Calendar/Diagonal en backend/src/modules/strategies/term/termSimulationEngine.ts con backtesting, Monte Carlo/escenarios determinísticos y proyección de payoff/P&L en tiempo real
- [ ] T166 Implementar Risk Engine Calendar/Diagonal en backend/src/modules/strategies/term/termRiskEngine.ts con límites por vencimiento, riesgo de asignación, reglas de stop-loss y alertas push/email
- [ ] T167 Implementar módulo de visualización y reporting Calendar/Diagonal en backend/src/modules/strategies/term/termReportEngine.ts con curvas de payoff, superficies tiempo-precio-IV y métricas riesgo/beneficio auditables
- [ ] T168 Implementar APIs dedicadas y comparador Calendar vs Diagonal en backend/src/routes/strategies/term/ (calendarSpread.ts, diagonalSpread.ts, termComparator.ts) para recomendar estrategia según contexto multi-core
- [ ] T169 Implementar orquestador de gestión temporal en backend/src/modules/strategies/term/termRollOrchestrator.ts para reglas de roll/ajuste, cierre anticipado y control de deterioro temporal

---

## Fase 16: Estandarización Transversal de Estrategias (Revisión Equilibrada)

Objetivo:
Alinear todos los teams con estrategias (TEAM-03 a TEAM-09) al mismo estándar de contrato, outputs, simulación, riesgo, reporting y trazabilidad para garantizar comparabilidad y calidad homogénea.

Tareas:
- [ ] T170 Definir estándar transversal de contratos y outputs de estrategias en backend/src/modules/strategies/standards/strategyOutputStandard.ts (request envelope, payoff_data, scenario_table, risk_metrics, signals, audit)
- [ ] T171 Ejecutar ajuste de TEAM-03 al estándar transversal en backend/src/modules/strategies/options/ y backend/src/modules/strategies/strategyComparator.ts (long/short call-put)
- [ ] T172 Ejecutar ajuste de TEAM-04 al estándar transversal en backend/src/modules/strategies/wheel/ (covered call/cash-secured put/wheel comparator)
- [x] T173 Ejecutar ajuste de TEAM-05 al estándar transversal en backend/src/modules/strategies/coverage/ (protective/married put, collar, covered straddle)
- [ ] T174 Ejecutar ajuste de TEAM-06 al estándar transversal en backend/src/modules/strategies/spreads/ (debit/credit spread)
- [ ] T175 Ejecutar ajuste de TEAM-07 al estándar transversal en backend/src/modules/strategies/volatility/ (straddle/strangle)
- [ ] T176 Ejecutar ajuste de TEAM-08 al estándar transversal en backend/src/modules/strategies/complex/ (iron condor, iron butterfly, butterfly, condor)
- [ ] T177 Ejecutar ajuste de TEAM-09 al estándar transversal en backend/src/modules/strategies/term/ (calendar/diagonal)

---

## Dependencias y Restricciones

Dependencias por fase:
- Fase 1 inicia con T000 y luego habilita el resto del setup.
- Fase 2 depende de Fase 1 y bloquea las historias.
- Fase 3 y Fase 4 dependen de Fase 2.
- Fase 5 depende de Fase 2 y de emisiones de US1 y US2.
- Fase 6 depende del cierre de las historias objetivo.
- Fase 7 (TEAM-01) depende de Fase 2 y T059 completado, habilita dashboard y brokers.
- Fase 8 (TEAM-02) depende de Fase 2 y del baseline de datos T059/T060 para consumo analítico y chat IA.
- Fase 9 (TEAM-03) depende de Fase 2 para estrategias y puede correr en paralelo con T059 para fuentes externas fundamentales.
- Fase 10 (TEAM-04) depende de Fase 2 para estrategia Wheel y del contexto multi-core para pronóstico explicable.
- Fase 11 (TEAM-05) depende de Fase 2 para estrategias de cobertura y de T059/T060 para acceso a Supabase con datos institucionales.
- Fase 12 (TEAM-06) depende de Fase 2 para motor de noticias y de T059/T060 para persistencia y consumo analítico de eventos/regulatorio.
- Fase 13 (TEAM-07) depende de Fase 2 para orquestación AI y estrategias de volatilidad, y de T059/T060 para trazabilidad y persistencia analítica.
- Fase 14 (TEAM-08) depende de Fase 2 para estrategias complejas y de T059/T060 para persistencia analítica.
- Fase 15 (TEAM-09) depende de Fase 2 para estrategias calendar/diagonal y de T059/T060 para persistencia analítica.
- Fase 16 (Estandarización) depende del cierre funcional de fases de estrategias TEAM-03 a TEAM-09.

Dependencias críticas:
- T000 -> T001/T002/T003/T004/T005
- T005 -> T059 -> T006/T009/T010/T015/T017/T026/T037
- T059 -> T060 -> T061/T062 -> T063/T064/T065/T066 -> T067 -> T068
- T017 -> T069 -> T070 -> T071/T072/T073
- T071/T072/T073 -> T063/T065/T066/T067
- T060 -> T074 -> T075/T076
- T006 -> T007/T008 -> T026/T031/T032
- T009 + T013 -> T032/T033
- T010 -> T025/T036/T037
- T014 -> T043
- T016 -> T028/T029/T030/T033 (y ahora también T068)
- T018/T019 -> T020/T021 -> T024
- T059 -> T077 -> T078 -> T079 -> T080/T081
- T082 -> T083/T084/T085/T086 -> T087 -> T088
- T083/T084/T085/T086/T087 -> T089
- T060 -> T090
- T059 -> T091 -> T092/T093/T094 -> T095 -> T096
- T096 -> T097 -> T098 -> T099
- T100 -> T101/T102 -> T103 -> T104
- T071/T072/T073 + T079/T081 + T037/T038 -> T098
- T060 -> T105
- T059 -> T106 -> T107 -> T108/T109/T110 -> T111/T112
- T113 -> T114/T115/T116 -> T117 -> T118
- T114/T115/T116/T117 -> T119/T120
- T060 -> T121
- T059 -> T122 -> T123 -> T124/T125 -> T126/T127
- T128 -> T129/T130 -> T131 -> T132
- T129/T130/T131 -> T133/T134
- T126/T127 + T129/T130 -> T135
- T060 -> T136
- T137 -> T138/T139/T140 -> T141 -> T142/T143 -> T144
- T145 -> T146/T147/T148/T149 -> T150 -> T151 -> T152
- T141 + T150/T151 -> T152
- T060 -> T144/T152
- T153 -> T154/T155/T156/T157 -> T158 -> T159 -> T160 -> T161
- T162 -> T163/T164 -> T165 -> T166 -> T167 -> T168
- T163/T164/T166 -> T169
- T170 -> T171/T172/T173/T174/T175/T176/T177
- T060 -> T161/T168
- T049 -> T050
- T051 -> T052
- T053 -> T054
- T055 -> T056
- T046 + T053 -> T054

---

## Congruencia con Speckit

backlog_operativo:
- specs/001-plataforma-inversiones-ia/tasks.md

estado_congruencia:
- Pendiente de resincronización con backlog operativo derivado.
- Diana conserva la autoridad del backlog canónico.
- SpecKit no debe consumir el nuevo alcance estructural hasta ejecutar la sincronización posterior.

Diferencias relevantes:
- Diana incorpora T000 para alinear la arquitectura monorepo del portafolio antes de reactivar integración con SpecKit.
- Diana incorpora T059 para explicitar la generación de esquema/migraciones de base de datos en Supabase antes de consolidar fases fundacionales y de historias.
- specs/.../tasks.md incluye formato operativo detallado para implementación diaria y paralelismo.
- 001-inv-tasks.md preserva la autoridad y la derivación constitucional-planificada.

acción_recomendada:
- Cualquier nueva tarea debe nacer aquí con /diana.tasks.
- Luego debe sincronizarse a specs/.../tasks.md para ejecución con SpecKit cuando el backlog quede validado.
- Después puede distribuirse con /diana.teams.

---

## Estado

Este documento constituye el Backlog Canónico de la Iniciativa 001-inversions.





