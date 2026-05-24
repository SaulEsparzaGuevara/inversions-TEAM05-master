# Plan de Implementacion: Plataforma de Inversiones con IA

**Branch**: `003-run-git-feature` | **Date**: 2026-04-28 | **Spec**: `specs/001-plataforma-inversiones-ia/spec.md`  
**Input**: `--input .drfic\diana-sdk\projects\diana-inversions\initiatives\001-inversions\001-inv-plan.md`

## Resumen

Implementar una plataforma web de inversiones asistida por IA con modelo semi-automatico estricto: la IA analiza y recomienda, pero toda ejecucion requiere aprobacion humana explicita. La arquitectura objetivo separa `frontend` (PWA React) y `backend` (REST API Express), con Supabase como store operacional primario, adaptadores desacoplados para IBKR/Alpaca, y trazabilidad completa de senales, decisiones, ejecuciones, auditoria y cumplimiento.

## Contexto Tecnico

**Language/Version**: TypeScript 5.x en frontend y backend; Node.js 22 LTS en API  
**Primary Dependencies**: React 18, Vite, Zustand, TailwindCSS, Express, Supabase JS client, TradingView Lightweight Charts, SDKs IBKR y Alpaca, cliente Claude API  
**Storage**: Supabase primario; MongoDB opcional para historicos/archivos de contexto IA  
**Testing**: `npm test`; lint con `npm run lint`; pruebas unitarias/integracion/contrato por capa  
**Target Platform**: Web (PWA) + servidor Node.js  
**Project Type**: Aplicacion web con frontend + backend separados  
**Performance Goals**: `SC-006` p95 <= 1s para frescura de market data activa; `SC-003` >=98% de consultas historicas <3s; disponibilidad mensual >=99.5%  
**Constraints**: Control humano obligatorio (`FR-004`,`FR-005`,`FR-009`), no auto-trading (`FR-010`), retencion >=365 dias (`FR-007`), rate limiting con `429` (`FR-015`), optimistic locking (`FR-016`), MFA para trader/admin (`FR-019`)  
**Scale/Scope**: v1 enfocado en acciones y opciones US, brokers IBKR+Alpaca, señales BUY/SELL/HOLD explicables

## Plan Requirement IDs (PL)

- **PL-001**: Toda restriccion constitucional debe mapearse a actividades verificables y evidencia de cierre.
- **PL-002**: Las dependencias externas deben declarar SLO minimo, timeout, politica de reintento y modo degradado.
- **PL-003**: Debe existir una particion explicita de datos por responsabilidad entre Supabase (operacional) y MongoDB (historico/contexto IA).
- **PL-004**: La estructura del proyecto debe incluir ownership por raiz y limites entre codigo ejecutable y gobierno/documentacion.
- **PL-005**: El rate limiting para acciones sensibles debe definir ventana, umbral, cooldown y respuesta uniforme.
- **PL-006**: La trazabilidad operativa completa debe definir campos minimos obligatorios por evento.
- **PL-007**: Todo criterio de exito (`SC-*`) debe mapearse a componente responsable y evidencia esperada.
- **PL-008**: La estructura debe cumplir reglas minimas de conformidad de dos capas para evitar regresiones por cambios manuales.
- **PL-009**: Los conflictos de concurrencia deben tener resultado deterministico y codigos de error estandar.
- **PL-010**: Deben existir escenarios de degradacion por dependencia (broker, market data, IA) con continuidad operativa.
- **PL-011**: Las metricas de frescura y observabilidad deben tener metodologia de medicion, etiquetas y periodicidad.
- **PL-012**: El disclaimer de no-asesoria debe listarse por superficie UI/API donde aplica visualizacion y registro.

## Matriz Restriccion -> Actividad -> Evidencia

| Restriccion | Actividad verificable | Evidencia de cierre |
|---|---|---|
| `FR-004` / `FR-005` | Implementar guardas de aprobacion previa en backend y estado `PENDIENTE_APROBACION` en ciclo operativo | Contrato `signal-lifecycle.md` y pruebas de contrato de rechazo sin aprobacion |
| `FR-009` | Aplicar politica fail-fast con transicion a `FALLIDA` y bloqueo de reintento sin nueva aprobacion | Registro de auditoria con evento `execution.failed` y regla de reintento validada |
| `FR-010` | Limitar IA a recomendaciones, sin endpoint de ejecucion directa | Inventario de endpoints y evidencia de ausencia de ejecucion automatica |
| `FR-013` | Mostrar y registrar disclaimer en puntos de decision/ejecucion | Evidencia de eventos `disclaimer.shown` y `disclaimer.acknowledged` |
| `FR-015` | Enforzar rate limit por usuario+endpoint sensible con respuesta `429` uniforme | Dashboard de observabilidad de `429` y pruebas de limite por ventana |
| `FR-016` | Enforzar optimistic locking por version de orden | Respuesta deterministica `409` en version obsoleta y auditoria de colision |
| `FR-018` | Definir runbooks para RTO/RPO y pruebas de recuperacion | Evidencia de simulacros con cumplimiento de umbrales |

## Dependencias Externas y SLO Minimos

| Dependencia | Uso principal | SLO minimo | Timeout/reintento | Modo degradado |
|---|---|---|---|---|
| IBKR adapter | Ejecucion asistida y estado de orden | >= 99.5% disponibilidad mensual | Timeout 5s, 2 reintentos con backoff exponencial | Bloquear nuevas ejecuciones y mantener evaluacion/consulta historica |
| Alpaca adapter | Ejecucion asistida y estado de orden | >= 99.5% disponibilidad mensual | Timeout 5s, 2 reintentos con backoff exponencial | Igual a IBKR, con fallback a cola manual de revision |
| Market data provider | Cotizaciones para senales activas | p95 <= 1s en instrumentos activos | Timeout 2s, 1 reintento rapido | Congelar nueva senal y marcar `DATA_STALE` visible al usuario |
| Claude API | Explicabilidad y enriquecimiento IA | >= 99.0% disponibilidad mensual | Timeout 8s, 1 reintento | Continuar con explicacion deterministica sin enriquecimiento IA |

## Particion de Datos y Responsabilidad de Stores

| Tipo de dato | Store primario | Retencion | Razon de diseno |
|---|---|---|---|
| Identidad, sesion, rol, MFA | Supabase | Ciclo de vida de cuenta + auditoria | Operacion transaccional y seguridad |
| Senal, propuesta operativa, decision humana, estado de ejecucion | Supabase | >= 365 dias (`FR-007`) | Soporte operacional y consultas en linea |
| Registro de auditoria operacional | Supabase | >= 365 dias (`FR-007`) | Trazabilidad legal y operativa |
| Historicos analiticos de alto volumen | MongoDB (opcional) | Politica de analitica definida por negocio | Coste/escala para analitica no critica en tiempo real |
| Contexto IA extendido / archivos de soporte | MongoDB (opcional) | Segun politica de cumplimiento | Separar archivo de contexto del camino transaccional |

## Trazabilidad Operativa Completa (campos minimos)

Para que una operacion se considere con "trazabilidad completa" (`SC-003`, `FR-006`, `FR-011`), cada evento debe registrar al menos:

- `event_id` (UUID), `timestamp_utc`, `correlation_id`
- `signal_id`, `proposal_id`, `order_id` (si aplica)
- `user_id`, `role`, `mfa_context_id` (si aplica)
- `action_type`, `previous_state`, `new_state`
- `broker`, `instrument`, `order_type`, `quantity`, `price` (si aplica)
- `outcome_code`, `error_code` (si aplica), `evidence_ref`

## Matriz de Trazabilidad SC -> Componente Responsable

| SC | Componente principal | Componente secundario | Evidencia esperada |
|---|---|---|---|
| `SC-001` | Backend `signals` | Frontend `signals` | Respuesta de senal con explicacion y evidencia enlazada |
| `SC-002` | Backend `execution-governance` | Frontend `approval-flow` | 100% de ejecuciones con aprobacion humana previa |
| `SC-003` | Backend `audit-history` | DB `supabase` | Consultas de historial <3s y campos de trazabilidad completos |
| `SC-004` | Frontend `decision-flow` | Backend `signals` | Telemetria de finalizacion del flujo evaluar-revisar-decidir |
| `SC-005` | Plataforma (SRE/ops) | Backend core services | Reporte mensual de disponibilidad >=99.5% |
| `SC-006` | Backend `market-data` | Observabilidad | Metricas p95 de frescura por instrumento activo |
| `SC-007` | Plataforma (ops) | Backups/restore | Evidencia de simulacros RTO/RPO en umbral |
| `SC-008` | Backend `auth-context` | Frontend `approval-flow` | Eventos de MFA validos en aprobacion y ejecucion |

## Matriz de Trazabilidad FR/SC/PL por Tarea Implementada

| Tarea | Artefacto principal | FR/SC cubiertos | PL cubiertos |
|---|---|---|---|
| T026 | `backend/src/modules/execution/approvalService.ts` | `FR-004`,`FR-005`,`FR-019` | `PL-001`,`PL-006` |
| T027 | `backend/src/modules/execution/executionService.ts` | `FR-004`,`FR-005`,`FR-009` | `PL-001`,`PL-010` |
| T028 | `backend/src/modules/brokers/brokerAdapter.ts` | `FR-008`,`FR-014` | `PL-002` |
| T029 | `backend/src/modules/brokers/ibkrAdapter.ts` | `FR-008` | `PL-002`,`PL-010` |
| T030 | `backend/src/modules/brokers/alpacaAdapter.ts` | `FR-008` | `PL-002`,`PL-010` |
| T031 | `backend/src/routes/execution/approve.ts` | `FR-013`,`FR-019` | `PL-012`,`PL-006` |
| T032 | `backend/src/routes/execution/execute.ts` | `FR-015`,`FR-016` | `PL-005`,`PL-009` |
| T033 | `backend/src/modules/execution/failureRecovery.ts` | `FR-009` | `PL-010` |
| T034 | `frontend/src/features/execution/ApprovalFlow.tsx` | `FR-004`,`FR-013` | `PL-012` |
| T035 | `frontend/src/features/execution/ExecutionPanel.tsx` | `FR-015`,`FR-016` | `PL-005`,`PL-009` |
| T036 | `backend/src/modules/execution/executionAudit.ts` | `FR-006`,`SC-002` | `PL-006` |
| T037 | `backend/src/modules/audit/historyService.ts` | `FR-011`,`SC-003` | `PL-006` |
| T038 | `backend/src/modules/analytics/portfolioService.ts` | `FR-011` | `PL-007` |
| T039 | `backend/src/routes/audit/history.ts` | `FR-011`,`SC-003` | `PL-006` |
| T040 | `backend/src/routes/audit/operationDetail.ts` | `FR-009`,`FR-011` | `PL-006`,`PL-010` |
| T041 | `frontend/src/features/audit/AuditHistoryPage.tsx` | `SC-003`,`FR-011` | `PL-007` |
| T042 | `frontend/src/features/audit/OperationTimeline.tsx` | `FR-011` | `PL-006` |
| T043 | `backend/src/observability/historyMetrics.ts` | `SC-003` | `PL-011` |
| T044 | `specs/001-plataforma-inversiones-ia/contracts/broker-adapter.md` | `FR-015`,`FR-016` | `PL-009` |
| T045 | `specs/001-plataforma-inversiones-ia/contracts/signal-lifecycle.md` | `FR-006`,`FR-013` | `PL-006` |
| T046 | `specs/001-plataforma-inversiones-ia/contracts/auth-context.md` | `FR-019`,`SC-008` | `PL-001` |
| T047 | `specs/001-plataforma-inversiones-ia/plan.md` | `SC-002`,`SC-003`,`SC-008` | `PL-001`,`PL-007` |
| T048 | `specs/001-plataforma-inversiones-ia/quickstart.md` | `FR-018`,`SC-005`,`SC-007` | `PL-008` |

## Criterios de Conformidad Estructural (No-regresion)

La estructura se considera conforme si cumple simultaneamente:

1. Existe separacion de codigo ejecutable entre `frontend/` y `backend/`.
2. Existe carpeta `specs/` para artefactos de feature y contratos.
3. La carpeta `.drfic/` se usa para gobierno, conocimiento y metodologia; no para runtime de producto.
4. Existe separacion clara entre codigo de producto (`frontend/`, `backend/`) y artefactos de soporte (`tests/`, `specs/`, `.drfic/`).
5. Todo cambio manual de estructura actualiza este plan y su mapa de ownership.

## Ownership y Proposito por Raiz

| Raiz | Ownership | Proposito |
|---|---|---|
| `frontend/` | Equipo Frontend | Experiencia PWA, decision flow, visualizacion de senales |
| `backend/` | Equipo Backend | API REST, gobernanza de ejecucion, integraciones broker |
| `specs/` | Producto + Arquitectura | Spec, plan, contratos, data model y checklists |
| `.drfic/` | Arquitectura/Gobernanza | Conocimiento, constitucion, lineamientos y trazabilidad metodologica |

## Politica de Rate Limiting Operacional

Para endpoints sensibles (`approve`, `execute`, `retry-execution`, `cancel-order`):

- Ventana: 60 segundos
- Umbral: 10 solicitudes por `user_id + endpoint`
- Cooldown: 120 segundos tras superar umbral
- Respuesta uniforme: `429` con payload `{ code: "RATE_LIMITED", retryAfterSeconds: 120 }`
- Observabilidad: metricas por endpoint, usuario anonimizado y tasa de bloqueos

## Concurrencia y Resolucion Deterministica

- Modelo: optimistic locking con `order_version` (`FR-016`).
- Si la version recibida no coincide con la version persistida, la accion se rechaza con `409 CONFLICT` y `error_code=ORDER_VERSION_STALE`.
- No se aplican side-effects parciales en conflicto de version.
- El cliente debe refrescar estado y solicitar nueva accion humana cuando aplique.

## Recuperacion y Modos Degradados por Dependencia

| Escenario | Comportamiento esperado | Continuidad |
|---|---|---|
| Caida IBKR o Alpaca | No ejecutar ordenes nuevas en broker afectado; registrar incidencia y mantener aprobaciones pendientes | Continuar analisis, historial y auditoria |
| Latencia o caida de market data | Marcar instrumentos con `DATA_STALE`; pausar nuevas senales para instrumentos afectados | Continuar consultas historicas y gestion no dependiente de tick realtime |
| Caida de IA (Claude API) | Usar explicacion fallback basada en reglas y evidencia de cores | Mantener flujo de evaluacion sin bloqueo total |

## Observabilidad y Frescura de Datos

- Medicion de frescura (`SC-006`): `now_utc - market_tick_timestamp_utc` por instrumento activo.
- Segmentacion minima: por proveedor de datos, tipo de instrumento y sesion de mercado.
- Agregacion: p50/p95/p99 cada 1 minuto; reporte consolidado cada 15 minutos.
- Alertas: disparar alerta operativa si p95 > 1s por 3 ventanas consecutivas.
- Metrica de cobertura: porcentaje de instrumentos activos con metrica valida por ventana.

## Superficies Obligatorias para Disclaimer No-Asesoria

El disclaimer debe mostrarse y registrarse en:

1. Vista de detalle de senal antes de "aprobar".
2. Modal/pantalla de aprobacion operativa.
3. Confirmacion previa a envio de orden al broker.
4. Endpoint backend de aprobacion (registro server-side de aceptacion).
5. Endpoint backend de ejecucion (registro server-side de contexto de cumplimiento).

## Constitution Check

*GATE: Debe pasar antes de Phase 0 research. Revalidar despues de Phase 1 design.*

### Check Inicial (Pre-Phase 0)

- Idioma oficial en espanol: **PASS** (artefactos de plan en espanol).
- Modelo semi-automatico y control humano obligatorio: **PASS** (`FR-004`,`FR-005`,`FR-009`,`FR-010`).
- Separacion PWA y REST API: **PASS** (estructura `frontend/` + `backend/`).
- Seguridad minima (JWT, RBAC, MFA): **PASS** (`FR-012`,`FR-017`,`FR-019`).
- Auditoria, disclaimer y retencion: **PASS** (`FR-007`,`FR-013`).
- Broker scope constitucional v1 (IBKR/Alpaca, Market/Limit): **PASS** (`FR-008`,`FR-014`).
- Resiliencia y recuperacion operativa (RTO/RPO): **PASS** (`FR-018`).

Resultado del gate inicial: **PASS (sin violaciones)**.

### Re-check Post-Phase 1

- Data model y contratos mantienen aprobacion humana como condicion previa de ejecucion: **PASS**.
- Contratos mantienen trazabilidad y auditoria de extremo a extremo: **PASS**.
- Quickstart y diseno no introducen auto-trading ni bypass de gobernanza: **PASS**.

Resultado del re-check: **PASS (sin excepciones constitucionales)**.

## Project Structure

### Documentacion de la feature

```text
C:.
+---.drfic
|   |   readme.md
|   \---diana-sdk
|       +---memory
|       +---projects
|       |   +---diana-inversions
|       |   |   |   inv-constitution.md
|       |   |   |   README.md
|       |   |   +---governance
|       |   |   |   |   decision-log.md
|       |   |   |   +---change-requests
|       |   |   |   |       001-inv-ucc.md
|       |   |   |   \---tickets
|       |   |   |           001-inv-tkt.md
|       |   |   +---initiatives
|       |   |   |   \---001-inversions
|       |   |   |       |   001-inv-plan.md
|       |   |   |       |   001-inv-spec.md
|       |   |   |       |   meta.md
|       |   |   |       \---speckit
|       |   |   \---knowledge
|       |   |       |   README.md
|       |   |       +---indexes
|       |   |       |       agent-skill-matrix.yaml
|       |   |       |       by-topic.md
|       |   |       |       master-index.md
|       |   |       |       sdd-engine-matrix.yaml
|       |   |       |       skills-manifest.yaml
|       |   |       |       skills-traceability.md
|       |   |       +---local
|       |   |       |   +---brokers
|       |   |       |   |       001-ibkr-tws-api.md
|       |   |       |   |       002-ibkr-client-portal.md
|       |   |       |   |       003-alpaca-api.md
|       |   |       |   +---compliance
|       |   |       |   |       001-non-advisory-disclaimer.md
|       |   |       |   |       002-data-retention-mx.md
|       |   |       |   +---cores
|       |   |       |   |       001-technical-analysis-core.md
|       |   |       |   |       002-fundamental-analysis-core.md
|       |   |       |   |       003-buy-sell-signals-core.md
|       |   |       |   |       004-options-strategies-core.md
|       |   |       |   |       005-institutional-options-flow-core.md
|       |   |       |   |       006-realtime-news-core.md
|       |   |       |   |       007-ai-confluence-orchestrator-core.md
|       |   |       |   +---domain
|       |   |       |   |       001-order-lifecycle.md
|       |   |       |   |       002-market-data.md
|       |   |       |   |       003-portfolio-analytics.md
|       |   |       |   \---patterns
|       |   |       |           001-jwt-supabase-auth.md
|       |   |       |           002-realtime-market-feed.md
|       |   |       +---remote
|       |   |       |   |   sources.md
|       |   |       |   |
|       |   |       |   +---evernote
|       |   |       |   |       .gitkeep
|       |   |       |   |
|       |   |       |   +---notebooklm
|       |   |       |   |       .gitkeep
|       |   |       |   |
|       |   |       |   \---notion
|       |   |       |           .gitkeep
|       |   |       +---skills
|       |   |       |       001-inv-technical-analysis-structure.md
|       |   |       |       002-inv-indicator-signal-logic.md
|       |   |       |       003-inv-fundamental-analysis.md
|       |   |       |       004-inv-options-strategy-engine.md
|       |   |       |       005-inv-institutional-options-flow.md
|       |   |       |       006-inv-realtime-news-impact.md
|       |   |       |       007-inv-ai-confluence-orchestration.md
|       |   |       |       008-inv-market-data-and-realtime.md
|       |   |       |       009-inv-execution-governance-human-control.md
|       |   |       |       010-inv-broker-integration-ibkr-alpaca.md
|       |   |       |       011-inv-portfolio-and-performance-analytics.md
|       |   |       |       012-inv-compliance-audit-retention.md
|       |   |       |       README.md
|       |   |       \---snapshots
|       |   |               .gitkeep
|       |   +---diana-sdk-core
|       |   |   |   dianacore-constitution.md
|       |   |   +---governance
|       |   |   |   |   decision-log.md
|       |   |   |   |
|       |   |   |   +---change-requests
|       |   |   |   |       001-dianacore-cc.md
|       |   |   |   |
|       |   |   |   \---tickets
|       |   |   |           001-dianacore-tkt.md
|       |   |   +---initiatives
|       |   |   |   \---001-dianacore
|       |   |   |           001-dianacore-plan.md
|       |   |   |           001-dianacore-spec.md
|       |   |   |           meta.md
|       |   |   \---knowledge
|       |   |       |   README.md
|       |   |       +---indexes
|       |   |       |       master-index.md
|       |   |       +---local
|       |   |       |   +---dev
|       |   |       |   |       001-developing-with-diana.md
|       |   |       |   +---domain
|       |   |       |   |       001-sdk-dashboard-overview.md
|       |   |       |   |
|       |   |       |   \---ui-patterns
|       |   |       |           001-admin-panel-patterns.md
|       |   |       \---remote
|       |   |               sources.md
|       |   \---knowledge
|       |       |   README.md
|       |       +---indexes
|       |       |       command-routing.md
|       |       |       master-index.md
|       |       |       projects-knowledge-radar.yaml
|       |       +---local
|       |       |   \---cores
|       |       |           001-technical-analysis-baseline.md
|       |       |           002-fundamental-analysis-baseline.md
|       |       |           003-buy-sell-signals-baseline.md
|       |       |           004-options-strategies-baseline.md
|       |       |           005-institutional-options-flow-baseline.md
|       |       |           006-realtime-news-impact-baseline.md
|       |       |           007-ai-confluence-baseline.md
|       |       +---remote
|       |       |       sources.md
|       |       |
|       |       +---skills
|       |       |       001-fin-risk-taxonomy-baseline.md
|       |       |       002-fin-human-approval-trade-governance.md
|       |       |       003-fin-realtime-market-data-slo.md
|       |       |       README.md
|       |       \---snapshots
|       |               .gitkeep
|       \---sdk
|           \---diana
|               |   constitution.md
|               +---checklists
|               |       checklists.md
|               |       initiative-audit-checklist.md
|               |       plan-quality-checklist.md
|               |       sdd-quality-gate.md
|               |       spec-quality-checklist.md
|               |       tasks-quality-checklist.md
|               +---knowledge
|               |   |   README.md
|               |   +---indexes
|               |   |       by-agent.md
|               |   |       master-index.md
|               |   |       shared-skills-manifest.yaml
|               |   +---local
|               |   |   +---agents
|               |   |   |       001-agent-roles-deep.md
|               |   |   +---glossaries
|               |   |   |       001-diana-terms.md
|               |   |   +---methodology
|               |   |   |       001-sdd-lifecycle.md
|               |   |   \---patterns
|               |   |           001-speckit-integration-patterns.md
|               |   +---remote
|               |   |       sources.md
|               |   \---skills
|               |           001-SDK-SDDCORE.md
|               |           002-SDK-TSSTACK.md
|               |           README.md
|               +---prompts
|               |       agent-copilot.md
|               |       agent-plan-architect.md
|               |       agent-qa-validator.md
|               |       agent-reviewer.md
|               |       agent-spec-writer.md
|               |       agent-task-generator.md
|               +---rules
|               |       agents.md
|               |       governance-and-naming.md
|               |       lifecycle.md
|               |       naming-conventions.md
|               |       sdd-quality-metrics.md
|               |       spec-versioning.md
|               |       speckit-integration.md
|               \---templates
|                       constitution.md
|                       initiative-readme.md
|                       meta.md
|                       spec.md
+---.github
|   |   copilot-instructions.md
|   +---agents
|   |       diana.knowledge.agent.md
|   |       diana.plan.agent.md
|   |       diana.skills.agent.md
|   |       speckit.analyze.agent.md
|   |       speckit.checklist.agent.md
|   |       speckit.clarify.agent.md
|   |       speckit.constitution.agent.md
|   |       speckit.git.commit.agent.md
|   |       speckit.git.feature.agent.md
|   |       speckit.git.initialize.agent.md
|   |       speckit.git.remote.agent.md
|   |       speckit.git.validate.agent.md
|   |       speckit.implement.agent.md
|   |       speckit.plan.agent.md
|   |       speckit.specify.agent.md
|   |       speckit.tasks.agent.md
|   |       speckit.taskstoissues.agent.md
|   +---instructions
|   |       speckit-knowledge-enrichment.instructions.md
|   \---prompts
|           diana.knowledge.prompt.md
|           diana.plan.prompt.md
|           diana.skills.prompt.md
|           speckit.analyze.prompt.md
|           speckit.checklist.prompt.md
|           speckit.clarify.prompt.md
|           speckit.constitution.prompt.md
|           speckit.git.commit.prompt.md
|           speckit.git.feature.prompt.md
|           speckit.git.initialize.prompt.md
|           speckit.git.remote.prompt.md
|           speckit.git.validate.prompt.md
|           speckit.implement.prompt.md
|           speckit.plan.prompt.md
|           speckit.specify.prompt.md
|           speckit.tasks.prompt.md
|           speckit.taskstoissues.prompt.md
+---.specify
|   |   extensions.yml
|   |   feature.json
|   |   init-options.json
|   |   integration.json
|   +---extensions
|   |   |   .registry
|   |   \---git
|   |       |   config-template.yml
|   |       |   extension.yml
|   |       |   git-config.yml
|   |       |   README.md
|   |       +---commands
|   |       |       speckit.git.commit.md
|   |       |       speckit.git.feature.md
|   |       |       speckit.git.initialize.md
|   |       |       speckit.git.remote.md
|   |       |       speckit.git.validate.md
|   |       \---scripts
|   |           +---bash
|   |           |       auto-commit.sh
|   |           |       create-new-feature.sh
|   |           |       git-common.sh
|   |           |       initialize-repo.sh
|   |           \---powershell
|   |                   auto-commit.ps1
|   |                   create-new-feature.ps1
|   |                   git-common.ps1
|   |                   initialize-repo.ps1
|   +---integrations
|   |   |   copilot.manifest.json
|   |   |   speckit.manifest.json
|   |   \---copilot
|   |       \---scripts
|   |               update-context.ps1
|   |               update-context.sh
|   +---memory
|   |       constitution.md
|   +---scripts
|   |   \---powershell
|   |           check-prerequisites.ps1
|   |           common.ps1
|   |           create-new-feature.ps1
|   |           setup-plan.ps1
|   |           update-agent-context.ps1
|   +---templates
|   |       agent-file-template.md
|   |       checklist-template.md
|   |       constitution-template.md
|   |       plan-template.md
|   |       spec-template.md
|   |       tasks-template.md
|   \---workflows
|       |   workflow-registry.json
|       \---speckit
|               workflow.yml
+---.vscode
|       settings.json
\---specs
    \---001-plataforma-inversiones-ia
        |   data-model.md
        |   plan.md
        |   quickstart.md
        |   research.md
        |   spec.md
        +---checklists
        |       requirements.md
        \---contracts
                auth-context.md
                broker-adapter.md
                signal-lifecycle.md
```

### Estructura de codigo (repo)

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── store/
│   ├── styles/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   └── e2e/
├── index.html
├── package.json
└── tsconfig.json

backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── domain/
│   ├── jobs/
│   ├── middleware/
│   ├── modules/
│   ├── observability/
│   └── routes/
├── .env.example
├── package.json
└── tsconfig.json

tests/
└── integration/
```

**Decision de Estructura**: La estructura oficial de implementacion para esta feature es de dos capas (`frontend/` + `backend/`) con `tests/` transversal. Cualquier reorganizacion futura distinta a este esquema requiere actualizar primero este plan y sus tareas derivadas.

## Phase 0: Outline y Research

### Unknowns y Resolucion

No quedaron `NEEDS CLARIFICATION` abiertos en el contexto tecnico. Se consolidaron decisiones y mejores practicas en `research.md` para:
- confluencia de cores y explicabilidad,
- market data realtime p95<=1s,
- integracion desacoplada de brokers,
- gobernanza de ejecucion human-in-the-loop,
- observabilidad y recuperacion operativa.

## Phase 1: Design y Contracts

### Artefactos de diseno generados

- `data-model.md`: entidades, relaciones, validaciones y transiciones de estado.
- `contracts/auth-context.md`: contrato de autenticacion/autorizacion (JWT+RBAC+MFA).
- `contracts/broker-adapter.md`: contrato de adaptadores IBKR/Alpaca, estados e idempotencia.
- `contracts/signal-lifecycle.md`: contrato de ciclo de vida de señal/aprobacion/ejecucion.
- `quickstart.md`: secuencia de implementacion recomendada para iniciar desarrollo.

### Actualizacion de contexto de agente

Accion requerida por workflow: ejecutar `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot`.

## Complejidad y Excepciones

No se registran violaciones constitucionales ni excepciones de complejidad que requieran justificacion.

## Recomendaciones de Knowledge

Los siguientes temas mejorarian el knowledge base con `/diana.knowledge`:
- `/diana.knowledge topic="sdd-lifecycle-sdk" scope="sdk"` - Actualmente el indice SDK reporta metodologia SDD como esqueleto; enriquecerlo reduce ambiguedad operativa multi-proyecto.
- `/diana.knowledge topic="diana-agent-roles-sdk" scope="sdk"` - Completar roles profundos de agentes en SDK fortaleceria trazabilidad de responsabilidades en flujos Speckit.
