# Tareas: Plataforma de Inversiones con IA

**Entrada**: Artefactos de diseno desde `/specs/001-plataforma-inversiones-ia/`
**Prerequisitos**: `plan.md` (obligatorio), `spec.md` (obligatorio), `research.md`, `data-model.md`, `contracts/`

**Autoridad Diana**: Este archivo es un backlog operativo derivado del backlog canónico de Diana en [001-inv-tasks.md](../../.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-tasks.md). Ante divergencia, primero se actualiza Diana con `/diana.tasks` y luego se sincroniza este artefacto.

**Pruebas**: No se agregan tareas de test-first porque la spec no pide enfoque TDD explicito. Cada historia conserva criterio de prueba independiente para validacion funcional.

**Organizacion**: Las tareas se agrupan por historia de usuario para implementacion y validacion independientes.

## Operacion Multi-equipo (8 equipos x 5 integrantes)

- Modelo operativo, aliases de equipo, registro de integrantes, flujo de agentes/skills Diana y asignacion completa T001-T058: [team-operating-model.md](team-operating-model.md)
- Backlog canónico Diana de la iniciativa: [001-inv-tasks.md](../../.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-tasks.md)
- Estandar core de Diana para configurar equipos antes de Speckit: [diana.teams.prompt.md](../../.github/prompts/diana.teams.prompt.md)
- Esta asignacion es la fuente de verdad para trabajo paralelo en maquinas locales con trazabilidad via SpecKit y Git.
- Ningun equipo debe implementar fuera de su lote asignado sin PR de contrato aprobado.

## Formato: `[ID] [P?] [Historia] Descripcion`

- **[P]**: Tarea paralelizable (archivos distintos, sin dependencia pendiente)
- **[Historia]**: Mapeo a historia de usuario (`US1`, `US2`, `US3`)
- Incluir rutas de archivo exactas en cada tarea

## Fase 1: Preparacion (Infraestructura Compartida)

**Proposito**: Preparar estructura base y convenciones de trabajo para frontend/backend/tests.

- [x] T001 Crear carpetas base de aplicacion y README inicial en frontend/README.md y backend/README.md (PL-004, PL-008)
- [x] T002 [P] Inicializar esqueleto del workspace frontend y scripts en frontend/package.json (PL-004)
- [x] T003 [P] Inicializar esqueleto del workspace backend y scripts en backend/package.json (PL-004)
- [x] T004 [P] Agregar scripts raiz de calidad (lint/test) en package.json (PL-008)
- [x] T005 [P] Crear plantilla compartida de entorno para auth, brokers y observabilidad en backend/.env.example (FR-012, PL-002)

---

## Fase 2: Fundacional (Prerequisitos Bloqueantes)

**Proposito**: Cimientos obligatorios para todas las historias (auth, gobernanza, auditoria, contratos, observabilidad).

**CRITICO**: No iniciar historias hasta cerrar esta fase.

- [x] T006 Implementar middleware de verificacion JWT y contexto de autenticacion en backend/src/middleware/authContext.ts (FR-012, PL-001)
- [x] T007 [P] Implementar guard de autorizacion RBAC para viewer/trader/admin en backend/src/middleware/rbac.ts (FR-017, PL-001)
- [x] T008 [P] Implementar middleware de verificacion MFA para acciones sensibles en backend/src/middleware/mfaGuard.ts (FR-019, PL-001)
- [x] T009 Definir tipos y transiciones del ciclo canonico de orden en backend/src/domain/orderLifecycle.ts (FR-009, FR-016, PL-009)
- [x] T010 [P] Definir esquema de eventos de auditoria con campos de traza obligatorios en backend/src/domain/auditEvent.ts (FR-006, FR-011, PL-006)
- [x] T011 [P] Implementar helper contractual de registro de disclaimer en backend/src/domain/disclaimer.ts (FR-013, PL-012)
- [x] T012 Implementar politica de rate limiting para endpoints sensibles con payload de cooldown en backend/src/middleware/rateLimit.ts (FR-015, PL-005)
- [x] T013 [P] Implementar utilidad de optimistic locking con mapeo ORDER_VERSION_STALE en backend/src/domain/versioning.ts (FR-016, PL-009)
- [x] T014 [P] Implementar metricas base de frescura de market data (p50/p95/p99) en backend/src/observability/marketFreshness.ts (SC-006, PL-011)
- [x] T015 Crear configuracion de retencion y mapa de particion de stores en backend/src/config/dataGovernance.ts (FR-007, PL-003)
- [x] T016 Crear politica de resiliencia de dependencias (timeouts, retries, modo degradado) en backend/src/config/dependencySlo.ts (FR-018, PL-002, PL-010)

**Checkpoint**: Base lista, las historias de usuario pueden comenzar.

---

## Fase 3: User Story 1 - Evaluar Oportunidades con Confluencia (Priority: P1) 🎯 MVP

**Objetivo**: Generar señales explicables por confluencia de fuentes activas con evidencia trazable.

**Prueba Independiente**: Usuario selecciona instrumentos y fuentes activas, ejecuta evaluacion, recibe señal BUY/SELL/HOLD con confianza y evidencia por fuente sin tocar ejecucion operativa.

### Implementacion para User Story 1

- [x] T017 [P] [US1] Implementar agregado de configuracion de fuentes (enable/disable y peso) en backend/src/modules/signals/sourceConfig.ts (FR-003, PL-001)
- [x] T018 [P] [US1] Implementar servicio de confluencia para recomendacion BUY/SELL/HOLD en backend/src/modules/signals/confluenceEngine.ts (FR-001, FR-010)
- [x] T019 [P] [US1] Implementar ensamblador de explicabilidad vinculando evidencia y rationale en backend/src/modules/signals/explainability.ts (FR-002, SC-001)
- [x] T020 [US1] Implementar endpoint de evaluacion de senales y contrato de respuesta en backend/src/routes/signals/evaluate.ts (FR-001, FR-002, FR-003)
- [x] T021 [US1] Implementar endpoint de detalle de senal con desglose de evidencia en backend/src/routes/signals/details.ts (FR-002, FR-006)
- [x] T022 [P] [US1] Implementar pagina frontend de evaluacion de senales y filtros en frontend/src/features/signals/SignalEvaluationPage.tsx (SC-004)
- [x] T023 [P] [US1] Implementar panel frontend de evidencia por fuente en frontend/src/features/signals/SignalEvidencePanel.tsx (FR-002, SC-001)
- [x] T024 [US1] Conectar servicios frontend de senales con contratos API en frontend/src/services/signals/signalApi.ts (FR-001, FR-002)
- [x] T025 [US1] Agregar emision de auditoria para SIGNAL_GENERATED y campos de traza en backend/src/modules/signals/signalAudit.ts (FR-006, PL-006)

**Checkpoint**: US1 funcional e independientemente validable.

---

## Fase 4: User Story 2 - Mantener Control Humano en la Ejecucion (Priority: P1)

**Objetivo**: Garantizar que ninguna ejecucion ocurra sin aprobacion humana explicita, MFA valida y control de concurrencia.

**Prueba Independiente**: Propuesta operativa no se ejecuta sin aprobacion; con aprobacion valida y version vigente se habilita envio asistido a broker; en fallo regresa a aprobacion obligatoria.

### Implementacion para User Story 2

- [x] T026 [P] [US2] Implementar servicio de aprobacion/rechazo con validacion MFA en backend/src/modules/execution/approvalService.ts (FR-004, FR-005, FR-019)
- [x] T027 [P] [US2] Implementar orquestador de ejecucion asistida forzando transiciones solo aprobadas en backend/src/modules/execution/executionService.ts (FR-004, FR-005, FR-009)
- [x] T028 [P] [US2] Implementar interfaces de adaptador broker y normalizacion de estados en backend/src/modules/brokers/brokerAdapter.ts (FR-008, FR-014, PL-002)
- [x] T029 [P] [US2] Implementar adaptador IBKR con idempotencia y mapeo de errores en backend/src/modules/brokers/ibkrAdapter.ts (FR-008, PL-002)
- [x] T030 [P] [US2] Implementar adaptador Alpaca con idempotencia y mapeo de errores en backend/src/modules/brokers/alpacaAdapter.ts (FR-008, PL-002)
- [x] T031 [US2] Implementar endpoint de aprobacion con captura de disclaimer y evidencia MFA en backend/src/routes/execution/approve.ts (FR-013, FR-019, PL-012)
- [x] T032 [US2] Implementar endpoint de ejecucion con rate limit y optimistic locking en backend/src/routes/execution/execute.ts (FR-015, FR-016, PL-005, PL-009)
- [x] T033 [US2] Implementar transicion de intento fallido hacia PENDING_APPROVAL en backend/src/modules/execution/failureRecovery.ts (FR-009, PL-010)
- [x] T034 [P] [US2] Implementar flujo UI frontend de aprobacion con confirmacion de disclaimer en frontend/src/features/execution/ApprovalFlow.tsx (FR-004, FR-013)
- [x] T035 [P] [US2] Implementar panel frontend de ejecucion con manejo de conflicto y cooldown en frontend/src/features/execution/ExecutionPanel.tsx (FR-015, FR-016)
- [x] T036 [US2] Emitir eventos de auditoria HUMAN_APPROVED, EXECUTION_SUBMITTED y EXECUTION_FAILED en backend/src/modules/execution/executionAudit.ts (FR-006, SC-002, PL-006)

**Checkpoint**: US2 funcional e independientemente validable.

---

## Fase 5: User Story 3 - Auditar Decisiones y Resultados (Priority: P2)

**Objetivo**: Exponer historial completo y auditable del ciclo senal -> decision -> ejecucion con tiempos de consulta objetivo.

**Prueba Independiente**: Usuario consulta historial por operacion/senal y obtiene eventos, evidencia y causas de fallo dentro del objetivo de rendimiento.

### Implementacion para User Story 3

- [x] T037 [P] [US3] Implementar servicio de consulta de historial de auditoria con filtros de correlacion en backend/src/modules/audit/historyService.ts (FR-011, PL-006)
- [x] T038 [P] [US3] Implementar agregacion de analitica de portafolio para resultados auditables en backend/src/modules/analytics/portfolioService.ts (FR-011, PL-007)
- [x] T039 [US3] Implementar endpoint API de historial con paginacion y metadata de completitud de traza en backend/src/routes/audit/history.ts (FR-011, SC-003)
- [x] T040 [US3] Implementar endpoint API de detalle operativo para diagnostico de fallos en backend/src/routes/audit/operationDetail.ts (FR-009, FR-011)
- [x] T041 [P] [US3] Implementar dashboard frontend de historial de auditoria con filtros e indicadores de latencia en frontend/src/features/audit/AuditHistoryPage.tsx (SC-003)
- [x] T042 [P] [US3] Implementar vista frontend de timeline operativo para eventos de decision y ejecucion en frontend/src/features/audit/OperationTimeline.tsx (FR-011, PL-006)
- [x] T043 [US3] Implementar instrumentacion de metricas de servicio para latencia y completitud de historial en backend/src/observability/historyMetrics.ts (SC-003, PL-011)

**Checkpoint**: US3 funcional e independientemente validable.

---

## Fase 6: Cierre y Aspectos Transversales

**Proposito**: Cerrar trazabilidad documental FR/SC/PL, hardening operativo y validacion final.

- [x] T044 [P] Actualizar contrato broker con 409 ORDER_VERSION_STALE y payload 429 de cooldown en specs/001-plataforma-inversiones-ia/contracts/broker-adapter.md (FR-015, FR-016, PL-009)
- [x] T045 [P] Actualizar contrato de ciclo de vida con campos de traza obligatorios y eventos de disclaimer en specs/001-plataforma-inversiones-ia/contracts/signal-lifecycle.md (FR-006, FR-013, PL-006)
- [x] T046 [P] Actualizar contrato de auth con invariantes de evidencia MFA para trader/admin en specs/001-plataforma-inversiones-ia/contracts/auth-context.md (FR-019, SC-008)
- [x] T047 Agregar matriz de trazabilidad FR/SC/PL por tarea implementada en specs/001-plataforma-inversiones-ia/plan.md (PL-001, PL-007)
- [x] T048 Ejecutar validacion de quickstart y documentar evidencia en specs/001-plataforma-inversiones-ia/quickstart.md (PL-008)
- [x] T049 [P] Definir SLI/SLO de disponibilidad mensual y tablero de evidencias en backend/src/observability/availabilitySlo.ts (SC-005, PL-011)
- [x] T050 Implementar job de consolidacion mensual de disponibilidad y export de reporte en backend/src/jobs/monthlyAvailabilityReport.ts (SC-005)
- [x] T051 [P] Definir runbook de simulacro de recuperacion RTO/RPO en specs/001-plataforma-inversiones-ia/quickstart.md (SC-007, FR-018)
- [x] T052 Ejecutar simulacro controlado y registrar evidencia de cumplimiento RTO/RPO en specs/001-plataforma-inversiones-ia/quickstart.md (SC-007)
- [x] T053 [P] Implementar verificador de cobertura MFA al 100% para acciones sensibles en backend/src/observability/mfaCoverageAudit.ts (SC-008, FR-019)
- [x] T054 Implementar reporte de cobertura MFA por rol y endpoint en backend/src/observability/mfaCoverageReport.ts (SC-008)
- [x] T055 [P] Crear checklist de ownership por raiz para cumplimiento estructural en specs/001-plataforma-inversiones-ia/checklists/plan-quality.md (PL-004)
- [x] T056 Implementar gate de no-regresion estructural en scripts/validate-structure.ps1 (PL-008)
- [x] T057 [P] Normalizar redaccion de artefactos operativos a espanol tecnico en specs/001-plataforma-inversiones-ia/tasks.md (Constitucion-Idioma)
- [x] T058 Implementar checklist de cumplimiento de comentarios `FIC:` bilingues en backend/src/config/ficCommentPolicy.ts (Constitucion-FIC)

---

## Dependencias y Orden de Ejecucion

### Dependencias por Fase

- **Fase 1 (Setup)**: inicia de inmediato.
- **Fase 2 (Foundational)**: depende de la Fase 1 y bloquea todas las historias.
- **Fase 3 (US1)**: depende de la Fase 2; candidata a MVP.
- **Fase 4 (US2)**: depende de la Fase 2; puede correr en paralelo con US1 tras la base, pero la liberacion debe incluir primero US1.
- **Fase 5 (US3)**: depende de la Fase 2 y de eventos/datos de US1+US2.
- **Fase 6 (Polish)**: depende del cierre de las historias objetivo.

### Dependencias entre Historias

- **US1 (P1)**: sin dependencia de otras historias despues de la fase foundational.
- **US2 (P1)**: puede iniciar tras la fase foundational; integra salidas de senales pero sigue siendo independiente para validacion.
- **US3 (P2)**: requiere emisiones de auditoria de US1 y US2 para entregar valor completo.

### Dependencias Clave entre Tareas

- T006 -> T007/T008 -> T026/T031/T032.
- T009 + T013 -> T032/T033.
- T010 -> T025/T036/T037.
- T014 -> T043.
- T016 -> T028/T029/T030/T033.
- T018/T019 -> T020/T021 -> T024.
- T049 -> T050.
- T051 -> T052.
- T053 -> T054.
- T055 -> T056.
- T046 + T053 -> T054.

---

## Oportunidades de Paralelismo

- Preparacion: T002, T003, T004, T005 en paralelo tras T001.
- Fundacional: T007, T008, T010, T011, T013, T014, T015, T016 en paralelo tras prerequisitos T006/T009.
- US1: T017, T018, T019, T022, T023 in parallel; then T020/T021; then T024/T025.
- US2: T026, T028, T029, T030, T034, T035 in parallel; then T031/T032; then T033/T036.
- US3: T037, T038, T041, T042 in parallel; then T039/T040; then T043.
- SLO/Resiliencia: T049/T051/T053/T055/T057 en paralelo; luego T050/T052/T054/T056/T058.

## Ejemplo de Paralelismo: User Story 1

```bash
# Lote paralelo A (nucleo US1)
Task: "T017 [US1] source config service in backend/src/modules/signals/sourceConfig.ts"
Task: "T018 [US1] confluence engine in backend/src/modules/signals/confluenceEngine.ts"
Task: "T019 [US1] explainability assembler in backend/src/modules/signals/explainability.ts"
Task: "T022 [US1] evaluation page in frontend/src/features/signals/SignalEvaluationPage.tsx"
Task: "T023 [US1] evidence panel in frontend/src/features/signals/SignalEvidencePanel.tsx"

# Secuencia posterior
Task: "T020 [US1] evaluate endpoint"
Task: "T021 [US1] details endpoint"
Task: "T024 [US1] frontend API wiring"
Task: "T025 [US1] signal audit emission"
```

## Ejemplo de Paralelismo: User Story 2

```bash
# Lote paralelo A (adaptadores y UX de aprobacion US2)
Task: "T026 [US2] approval service"
Task: "T028 [US2] broker adapter contract"
Task: "T029 [US2] IBKR adapter"
Task: "T030 [US2] Alpaca adapter"
Task: "T034 [US2] approval flow UI"
Task: "T035 [US2] execution panel UI"

# Secuencia posterior
Task: "T031 [US2] approve endpoint"
Task: "T032 [US2] execute endpoint"
Task: "T033 [US2] fail-fast recovery"
Task: "T036 [US2] execution audit events"
```

## Ejemplo de Paralelismo: User Story 3

```bash
# Lote paralelo A (read models y UI de US3)
Task: "T037 [US3] history service"
Task: "T038 [US3] portfolio analytics"
Task: "T041 [US3] audit history page"
Task: "T042 [US3] operation timeline"

# Secuencia posterior
Task: "T039 [US3] history endpoint"
Task: "T040 [US3] operation detail endpoint"
Task: "T043 [US3] history metrics"
```

---

## Estrategia de Implementacion

### MVP Primero (US1)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1) fully.
3. Validar la prueba independiente de US1.
4. Demostrar/desplegar capacidad MVP de evaluacion de senales.

### Entrega Incremental

1. Add US2 for human approval and assisted execution governance.
2. Add US3 for full audit and operational analytics.
3. Finish with Phase 6 cross-cutting updates and quickstart validation.

### Alcance MVP Sugerido

- **MVP scope**: Phase 1 + Phase 2 + Phase 3 (T001-T025).
- **Rationale**: entrega valor central de confluencia explicable sin depender de ejecucion asistida completa.

## Notas

- Trazabilidad de cierre: cada tarea clave incluye referencia FR/SC/PL en descripcion.
- Evitar cambiar misma ruta en paralelo fuera de tareas marcadas [P].
- Commit recomendado por bloque logico de tareas completadas.
