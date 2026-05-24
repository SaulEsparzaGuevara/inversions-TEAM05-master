# Specification Quality Checklist: Dashboard de Brokers TEAM-01

**Purpose**: Validar completitud y calidad de la especificacion antes de planificacion
**Created**: 2026-05-12
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [ ] No implementation details leak into specification

## Notes

- La especificacion fue extendida intencionalmente con detalles de arquitectura UI y routing de datos para evitar ambiguedades de implementacion en superchart/watchlist multi-broker.
- Gap de knowledge no bloqueante detectado en SDK (documentos en estado esqueleto) y registrado en recomendaciones dentro de spec.md.
- Existe bloqueo operativo externo: el hook automatico speckit.git.feature no pudo ejecutarse en este entorno.

---

## Phase 8 Professional Workspace Checklist

**Purpose**: Validar que el dashboard profesional estilo superchart quede implementado de forma completa y no solo visualmente parcial.

### Watchlist Tree + Catalogos

- [ ] El control principal de instrumentos es un arbol por categorias (Indices, Stocks, Futures, Forex, Cripto, Bonos, References IDX), no un input de texto libre.
- [ ] El usuario puede agregar y quitar simbolos de su watchlist y los cambios persisten por usuario.
- [ ] Los instrumentos y categorias se cargan desde catalogo dinamico (API online o Supabase local), no hardcoded.

### Superchart + Temporalidad

- [ ] El dashboard incluye superchart de velas OHLC con zoom/pan, crosshair y overlays de senales.
- [ ] La temporalidad y periodo son dinamicos segun capacidades de la fuente activa e incluyen opcion ALL.
- [ ] Al cambiar simbolo/periodo/temporalidad se refrescan velas y overlays con la nueva consulta.

### Menu Indicadores + Overflow

- [ ] Existe toolbar con patron 3 acciones visibles + menu overflow (tres puntos).
- [ ] El menu incluye como minimo: Indicadores, Alertas, Ordenes, Configuracion Broker/API y Configuracion Cores/Estrategias.
- [ ] El modal de indicadores soporta busqueda y seleccion multiple con carga dinamica online/offline.

### Modos Operativos + Brokers

- [ ] El dashboard incluye switch ONLINE/OFFLINE con estado visual claro y fallback a cache local.
- [ ] El dashboard incluye switch DEMO/OPERATIVA REAL y conmuta cuentas/credenciales de broker por modo.
- [ ] Existen catalogos en Supabase para broker_configurations y broker_accounts.
- [ ] El catalogo de brokers incluye IBKR, Alpaca, Capital.com, BlackBull Markets, Forex.com, Blueberry Markets y TradeStation.

### Tabla de Confluencia Avanzada

- [ ] La tabla de confluencia muestra columnas extendidas (senal, direccion, precio, tiempo, griegas, checklist, estrategia, rendimiento esperado, perdida maxima, motivos, fuente).
- [ ] La tabla filtra por core individual, subconjunto de cores y confluencia total.
- [ ] Al seleccionar una fila, el chart resalta la senal correspondiente con marcador visual de alta prioridad.
- [ ] La tabla incluye campos operativos detallados: timing_d/timing_h, pre-senal, senal real activada, stop, objetivo, divergencia, z extrema, cantidad sugerida, vencimiento, precio ejercicio, tipo opcion (call/put), duracion, bid, ask, zona exacta de apertura/cierre, stoploss sugerido, alerta configurada, referencias maximos/minimos, variantes de ataque, recolocacion stoploss, liquidez, riesgo, retorno/perdida maxima.
- [ ] El tooltip flotante en chart al hover refleja de forma consistente los mismos campos criticos de la fila de tabla seleccionada.
- [ ] La tabla es metadata-driven: columnas, etiquetas, orden y visibilidad se leen desde catalogo de configuracion y no desde una lista fija en codigo.
- [ ] Al agregar o retirar un campo en configuracion, la UI se adapta sin redeploy y sin error en runtime.
- [ ] Existen presets de vista por rol/usuario y pueden aplicarse/cambiarse sin afectar otras vistas.

### Validacion End-to-End

- [ ] Flujo completo validado: watchlist -> seleccion simbolo -> carga OHLC -> overlay senales -> click fila tabla -> resaltado en chart.
- [ ] Validacion funcional realizada en modo ONLINE y en modo OFFLINE.
- [ ] Validacion funcional realizada en modo DEMO y en modo OPERATIVA REAL (segun entorno habilitado).

---

## Operational Validation Checklist

<!-- FIC: Operational validation items to verify at implementation time, per task closure.
     Must be reviewed before marking any task [X]. FR-018 blocks closure if FIC: comments absent.
     Ítems de validación operativa a verificar en tiempo de implementación, por cierre de tarea.
     Deben revisarse antes de marcar cualquier tarea [X]. FR-018 bloquea cierre sin comentarios FIC:. -->

**Purpose**: Validar criterios operativos durante y al final de la implementacion. Cada item debe resolverse antes del cierre de la feature.

### Gobernanza y Acceso

- [ ] Los roles operador, aprobador y auditor se distinguen exclusivamente por Supabase RLS con JWT claims (FR-013); no existe logica de permisos custom en frontend ni middleware separado.
- [x] El campo `version` esta presente en `SenalConfluente` y el optimistic lock rechaza de forma atomica decisiones con version desactualizada (FR-014).
- [x] El bloqueo de ejecucion sin decision humana valida esta activo y verificado en al menos un test de integracion (FR-006).

### Estandar de Codigo FIC

- [ ] Todos los archivos nuevos de la feature (servicios, endpoints, componentes React, middlewares, modulos de observabilidad) incluyen comentarios `FIC:` en formato bilingue ingles/espanol cubriendo modulos, hooks publicos, logica critica e integraciones con broker (FR-018).
- [x] La revision de comentarios `FIC:` fue completada mediante checklist antes del cierre de cada tarea (T049).

### Cobertura de Tests

- [x] La cobertura de tests automatizados alcanza como minimo 80% en rutas de decision, concurrencia y auditoria (FR-017, T045).
- [x] Tests unitarios completos para `confluenceEngine`, `signalApi`, `approvalService`, `executionAudit`, `executionService` y `failureRecovery` (T039, T041, T046).
- [x] Tests de integracion completos para `routes/execution/approve` y `routes/execution/execute` (T042).
- [x] Test de SLA de observabilidad verifica actualizacion de metricas en ciclos de maximo 60 segundos (T047, SC-005).

### Observabilidad y Auditoria

- [ ] Cada transicion de estado de `SenalConfluente` emite `trace_id` y `senal_id` en el log estructurado (FR-015).
- [ ] Las metricas `decision_latency_ms`, `decision_conflict_count` y `broker_sync_lag_ms` son visibles en el tablero operativo con actualizacion maxima de 60 segundos (SC-005).
- [x] La evidencia operativa y de auditoria tiene configurada una politica de retencion minima de 365 dias (FR-011, T034).
- [x] El campo `context_snapshot` esta disponible en `SenalConfluente` para reconstruir decisiones pasadas (FR-009, T048).

### Modo Degradado

- [ ] Ante caida, timeout o lag critico de broker, el sistema muestra estado degradado visible en la UI en menos de 30 segundos (FR-016, SC-006).
- [ ] Las nuevas decisiones sobre senales afectadas quedan bloqueadas durante el modo degradado hasta recuperacion o timeout operacional (FR-016, SC-006).
- [ ] Los reintentos automaticos y la alerta operativa estan activos ante degradacion de broker (FR-016).

### Criterios de Exito Verificables

- [ ] SC-001: Al menos un operador completa revision y emision de decision en menos de 3 minutos en entorno de prueba.
- [ ] SC-002: Trazabilidad completa senal→evidencia→decision→ejecucion verificada en al menos 3 flujos de prueba end-to-end.
- [ ] SC-003: Consulta de historial de auditoria no presenta campos faltantes en la cadena de eventos para operaciones de prueba.
- [x] SC-004: Cero intentos de ejecucion no autorizada pasan en suite de tests de gobernanza.
- [x] SC-005: Test de integracion de SLA de observabilidad pasa con metricas actualizadas en ciclos de maximo 60 segundos.
- [ ] SC-006: Test de modo degradado confirma visibilidad en menos de 30 segundos y bloqueo de decisiones nuevas.

### Disclaimer y UX

- [x] El disclaimer de naturaleza no asesora de las recomendaciones es visible en puntos criticos de decision en la UI (FR-012, T037).

### Cierre de Feature

- [ ] Todos los items de esta checklist estan completos antes del cierre de la feature.
- [ ] La gate constitucional fue re-validada tras Phase 1 y todos los resultados son PASS (plan.md Constitucion Check Re-check).

### Evidencia de Validacion (2026-05-14)

- Cobertura backend ejecutada con `npm run -w @inversions/rest-api test -- --coverage`: **All files 81.03% statements / 81.6% lines**, cumpliendo T045.
- Integracion de `approve/execute` validada en `tests/integration/execution/executionRoutes.test.ts` con escenarios de permiso, MFA, stale version, bloqueo y rate-limit/error mapping.
- Validacion SLA de observabilidad confirmada en `tests/integration/observability/availabilitySlo.test.ts`.
- Revision de comentarios y convencion FIC cerrada en checklist para T049; no se detectaron bloqueos adicionales en lint operativo (`npm run lint`).
- Politica de retencion de 365 dias validada en `src/config/dataGovernance.ts` para `audit_event` y `signal_operational`.
- Campo `context_snapshot` validado en migracion `src/database/supabase/migrations/002_context_snapshot.sql`.
- Disclaimer visible en puntos criticos de aprobacion/MFA validado en `projects/pwa/inversions_app/src/features/execution/ApprovalFlow.tsx`.
- FR-014 validado con columna `version` en `src/database/supabase/migrations/001_baseline_operativa.sql` y conflictos de version cubiertos en `tests/unit/execution/approvalService.test.ts` + `tests/integration/execution/executionRoutes.test.ts`.
- Suite unitaria de `signalApi` agregada y validada en `projects/pwa/inversions_app/tests/services/signals/signalApi.test.ts`.
- FR-013 (validacion estatica): `scripts/validate-rls-policies.ps1` ejecutado en PASS contra `003_canonical_schema.sql` (enable RLS + policies requeridas detectadas).

### Pendientes de Aceptacion Final

- Validar RLS end-to-end en Supabase (FR-013) y evidencia de `trace_id/senal_id` por transicion (FR-015).
- Cerrar pruebas funcionales/manuales de SC-001, SC-002, SC-003 y SC-006 en entorno operativo.
- Confirmar visibilidad de metricas operativas en tablero productivo (no solo en pruebas de servicio).

Nota: La validacion estatica de RLS ya esta automatizada por script, pero FR-013 permanece pendiente hasta ejecutar pruebas E2E con JWT reales por rol.

### Runbook de Cierre Final (Operativo)

1. FR-013 (RLS): ejecutar pruebas con tres perfiles JWT (operador, aprobador, auditor) y registrar evidencia de acceso permitido/denegado por tabla endpoint.
2. FR-015 (trazabilidad): ejecutar un flujo completo de propuesta y verificar en logs estructurados que cada transicion contiene `trace_id` y `senal_id`.
3. SC-001: cronometrar al menos un flujo real de revision+decision y validar tiempo total menor a 3 minutos.
4. SC-002: ejecutar 3 flujos end-to-end y capturar cadena completa señal -> evidencia -> decision -> ejecucion.
5. SC-003: consultar historial en escenarios de prueba y verificar que la cadena no presenta campos nulos/faltantes.
6. SC-006: simular degradacion broker y validar visibilidad en menos de 30 segundos + bloqueo de nuevas decisiones.
7. SC-005 en tablero: corroborar que `decision_latency_ms`, `decision_conflict_count` y `broker_sync_lag_ms` se visualizan en entorno operativo.
8. Al completar los pasos 1-7, marcar los checks restantes y cerrar la seccion Cierre de Feature.

### Evidencia Minima Requerida por Item Pendiente

- FR-013: capturas/logs de respuestas por rol y matriz de permisos resultante.
- FR-015: extracto de logs por transicion con `trace_id` + `senal_id`.
- SC-001 a SC-003 y SC-006: acta breve de ejecucion de prueba con timestamp, resultado y responsable.
- SC-005 (tablero operativo): captura del panel con timestamps dentro de ventana esperada.