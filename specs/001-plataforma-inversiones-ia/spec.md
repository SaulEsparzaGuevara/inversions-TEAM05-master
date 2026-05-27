# Feature Specification: Plataforma de Inversiones con IA

**Feature Branch**: `003-run-git-feature`  
**Created**: 2026-04-27  
**Status**: Draft  
**Input**: User description: "--input .drfic\\diana-sdk\\projects\\diana-inversions\\initiatives\\001-inversions\\"

## Clarifications

### Session 2026-04-27

- Q: Cual sera el mecanismo oficial de autenticacion para v1? -> A: JWT Bearer firmado y validado por backend.
- Q: Que debe pasar en v1 si una operacion aprobada falla durante la ejecucion asistida? -> A: Marcar FALLIDA y exigir nueva aprobacion humana para reintentar.
- Q: Que brokers deben ser obligatorios en la version 1 inicial? -> A: Interactive Brokers (IBKR) y Alpaca.
- Q: Cual sera la retencion minima de evidencia operativa y trazas de auditoria en v1? -> A: 365 dias.
- Q: Que postura regulatoria debe declarar v1 respecto a asesoria financiera? -> A: Plataforma informativa/no-asesoria con disclaimer explicito obligatorio.
- Q: Que tipos de orden deben estar en alcance obligatorio para v1? -> A: Market y Limit.
- Q: Que objetivo de frescura de market data debe exigirse en v1 para senales activas? -> A: p95 <= 1 segundo.
- Q: Que politica de rate limiting aplicara v1 para acciones operativas sensibles? -> A: Limite por usuario y endpoint con respuesta 429 y cooldown.

### Session 2026-04-28

- Q: Como debe resolverse la concurrencia en acciones simultaneas sobre la misma orden? -> A: Optimistic locking con version de orden y rechazo de acciones sobre version obsoleta.
- Q: Que politica aplicar cuando falle una ejecucion asistida en broker? -> A: Fail-fast: marcar FALLIDA y exigir nueva aprobacion humana antes de cualquier reintento.
- Q: Que modelo de autorizacion debe usar v1 para controlar acceso a funciones y datos? -> A: RBAC por roles (viewer, trader, admin) con permisos predefinidos.
- Q: Que objetivo de recuperacion debe cumplir v1 ante incidentes en servicios criticos? -> A: RTO <= 30 minutos y RPO <= 5 minutos.
- Q: Que politica de MFA debe aplicar v1 para operaciones sensibles? -> A: MFA obligatorio para roles trader y admin en aprobacion y ejecucion.

## Canonical Registration

- **Tipo de SPEC:** Canonica fundacional (001-DIANA-INVERSIONS-SPEC)
- **Fuente canonica:** `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-spec.md`
- **Relación con esta spec:** Esta especificacion operativa deriva de la canonica para ejecucion Speckit.
- **Regla de autoridad:** La spec operativa NO sustituye la canonica; ante conflicto, prevalecen `inv-constitution.md` y la spec canonica.

## Contexto Rector Heredado (Canónico)

### 0. Autoridad Constitucional

La iniciativa esta subordinada a la constitucion del proyecto como fuente de verdad primaria.

Reglas no negociables heredadas:
- Modelo semi-automatico obligatorio.
- La IA no ejecuta operaciones.
- Control humano explicito en toda ejecucion.
- Arquitectura por cores desacoplados.
- Senales explicables y trazables.

### 1. Objetivo General

Disenar y operar una plataforma web profesional de inversiones asistida por IA para acciones y opciones US, con senales BUY/SELL/HOLD de alta confianza, confluencia multi-core, integracion con brokers reales y control humano obligatorio.

### 2. Filosofia del Sistema

- No existe auto-trading en v1.0.
- La IA actua como confirmador y evaluador de riesgo; no decide ni ejecuta.
- Los cores (Market Data, Indicators, Structure, Institutional Flow, News, Options, Confluence, AI Advisor) son independientes y activables por el usuario.

### 3. Alcance Funcional v1.0

Incluye: senales para acciones/opciones US, dashboard profesional, integracion IBKR/Alpaca, persistencia y trazabilidad con evidencia por ticket.

Excluye: auto-trading, IA como fuente unica, senales black-box y crypto.

### 4. Restricciones Tecnicas Heredadas

- Arquitectura: PWA + REST API.
- Stack base: React + TypeScript + Vite en frontend; Node.js + Express en backend.
- Persistencia: Supabase principal y MongoDB opcional para historicos/logs de senales.
- Integraciones: IBKR, Alpaca y AI Advisor.

### 5. Gobierno y Operacion

- Backend responsable de conectividad broker, sincronizacion de portafolio, persistencia server-side, ingesta de market data, ejecucion asistida, seguridad y observabilidad.
- Gobierno de agentes oficial: Picoro -> (Goku || Krilin) -> (Vegeta || Bulma) -> Dr.FIC.
- Criterios globales heredados: respeto constitucional, IA no ejecutora, senales explicables, brokers desacoplados, credenciales en `.env`, evidencia funcional y trazabilidad activa.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Evaluar Oportunidades con Confluencia (Priority: P1)

Como inversionista, quiero recibir señales de compra, venta o espera sustentadas por la confluencia de múltiples fuentes (core/algoritmos) analíticas para decidir con mayor confianza y menor sesgo.

**Why this priority**: Entrega el valor central de la plataforma al transformar datos dispersos en decisiones accionables y explicables.

**Independent Test**: Un usuario puede seleccionar instrumentos, ejecutar evaluación y obtener señales de diferentes fuentes (core) con explicación verificable sin depender de la ejecución operativa.

**Acceptance Scenarios**:

1. **Given** un conjunto de instrumentos configurados y fuentes analíticas activas, **When** el usuario solicita evaluación, **Then** el sistema entrega una señal con nivel de confianza y razonamiento comprensible.
2. **Given** una señal emitida, **When** el usuario consulta su detalle, **Then** puede ver la evidencia aportada por las fuentes que participaron en la decisión.

---

### User Story 2 - Mantener Control Humano en la Ejecución (Priority: P1)

Como inversionista, quiero aprobar o rechazar explícitamente cada propuesta de operación para conservar control total antes de cualquier acción de mercado.

**Why this priority**: Es un requisito constitucional del producto y un control crítico de riesgo operacional.

**Independent Test**: Se valida cuando una propuesta puede existir y ser revisada, pero nunca ejecutarse sin una aprobación humana explícita registrada.

**Acceptance Scenarios**:

1. **Given** una propuesta operativa derivada de una señal, **When** el usuario no aprueba, **Then** la propuesta permanece sin ejecución.
2. **Given** una propuesta operativa pendiente, **When** el usuario aprueba explícitamente, **Then** el sistema permite continuar al flujo de ejecución asistida.

---

### User Story 3 - Auditar Decisiones y Resultados (Priority: P2)

Como responsable operativo, quiero consultar el historial completo de señales, aprobaciones e intentos de ejecución para auditar resultados y detectar oportunidades de mejora.

**Why this priority**: Garantiza trazabilidad, cumplimiento y capacidad de análisis post-evento.

**Independent Test**: Se valida cuando un usuario recupera el ciclo completo de una operación, desde señal inicial hasta resultado final, en una sola vista de historial.

**Acceptance Scenarios**:

1. **Given** operaciones ya procesadas, **When** el usuario abre historial, **Then** visualiza estados, evidencia y decisiones humanas relacionadas.
2. **Given** un intento fallido, **When** el usuario revisa el caso, **Then** identifica claramente causa, momento y estado de recuperación.

---

### Edge Cases

- Fuentes (core) analíticas activas producen conclusiones incompatibles para el mismo instrumento.
- Una propuesta aprobada falla durante la fase operativa y requiere nueva decisión humana.
- No hay datos suficientes para sostener una señal con confianza mínima.
- El usuario reintenta acciones por latencia y el sistema debe evitar duplicidades.
- Acciones concurrentes sobre la misma orden con versiones desfasadas deben rechazarse de forma deterministica.
- Acciones operativas sensibles exceden el rate limit por usuario y endpoint.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST generar señales de inversión basadas en confluencia de fuentes (core) analíticas activas.
- **FR-002**: El sistema MUST presentar explicación trazable del razonamiento detrás de cada señal.
- **FR-003**: El sistema MUST permitir al usuario configurar, activar y desactivar fuentes analíticas.
- **FR-004**: El sistema MUST requerir aprobación humana explícita previa a cualquier ejecución.
- **FR-005**: El sistema MUST impedir ejecución cuando no exista aprobación válida.
- **FR-006**: El sistema MUST registrar el ciclo de vida de cada señal y su propuesta operativa asociada.
- **FR-007**: El sistema MUST conservar evidencia operativa y trazas de auditoria durante un minimo de 365 dias.
- **FR-008**: El sistema MUST soportar ejecucion asistida mediante Interactive Brokers (IBKR) y Alpaca en la version inicial.
- **FR-009**: El sistema MUST registrar fallos operativos como eventos observables en estado FALLIDA y exigir nueva aprobacion humana antes de cualquier reintento.
- **FR-010**: El sistema MUST mantener a la IA como asistente analítico sin autonomía de ejecución.
- **FR-011**: El sistema MUST permitir consulta histórica por operación, señal y decisión humana.
- **FR-012**: El sistema MUST restringir acceso a funciones y datos mediante JWT Bearer firmado y validado por backend.
- **FR-013**: El sistema MUST mostrar y registrar un disclaimer explicito de no-asesoria financiera en los puntos de decision y ejecucion del usuario.
- **FR-014**: El sistema MUST soportar ordenes de tipo Market y Limit como alcance obligatorio de ejecucion asistida en v1.
- **FR-015**: El sistema MUST aplicar rate limiting por usuario y endpoint en acciones operativas sensibles, respondiendo con 429 y un cooldown definido.
- **FR-016**: El sistema MUST aplicar optimistic locking por version de orden y rechazar acciones sobre versiones obsoletas para evitar conflictos de concurrencia.
- **FR-017**: El sistema MUST aplicar RBAC por roles (viewer, trader, admin) con permisos predefinidos para funciones operativas y acceso a datos.
- **FR-018**: El sistema MUST cumplir objetivos de recuperacion para servicios criticos con RTO <= 30 minutos y RPO <= 5 minutos.
- **FR-019**: El sistema MUST requerir MFA para roles trader y admin en acciones de aprobacion y ejecucion operativa.

### Key Entities *(include if feature involves data)*

- **Usuario**: Actor autenticado que configura análisis, revisa señales y decide aprobación operativa.
- **Fuente Analítica**: Componente que emite evidencia especializada para la confluencia.
- **Señal de Inversión**: Resultado evaluado con acción sugerida por confluencia de uno o varios cores activados por usuario, confianza y explicación.
- **Propuesta Operativa**: Acción candidata derivada de una señal como resultado de una confluencia de señales, pendiente de decisión humana.
- **Decisión Humana**: Registro de aprobación o rechazo con contexto y marca temporal.
- **Intento de Ejecución**: Evento operativo con resultado final y detalle de incidencias.
- **Registro de Auditoría**: Historial inmutable de eventos, decisiones y evidencias.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Al menos 95% de señales visibles para el usuario incluyen explicación y evidencia trazable completa.
- **SC-002**: 100% de ejecuciones registradas cuentan con aprobación humana explícita previa.
- **SC-003**: Al menos 98% de consultas de historial devuelven trazabilidad completa en menos de 3 segundos.
- **SC-004**: Al menos 90% de usuarios piloto completan el flujo evaluar-revisar-decidir sin asistencia externa.
- **SC-005**: La disponibilidad mensual de capacidades críticas de evaluación y control humano alcanza como mínimo 99.5%.
- **SC-006**: Para instrumentos activos en seguimiento, la frescura de market data utilizada para generar senales cumple p95 <= 1 segundo.
- **SC-007**: En simulacros o incidentes reales de servicios criticos, la recuperacion operativa cumple RTO <= 30 minutos y no pierde mas de 5 minutos de datos (RPO <= 5 minutos).
- **SC-008**: El 100% de acciones de aprobacion y ejecucion realizadas por roles trader y admin se registran con MFA valido.

## Assumptions

- El alcance inicial cubre instrumentos del mercado estadounidense en categorías de acciones y opciones.
- La operación inicial es semi-automática con control humano obligatorio para ejecución.
- El usuario objetivo posee conocimiento básico para interpretar señales y riesgo.
- Existen servicios externos disponibles para datos y ejecución asistida del flujo.
- Las políticas de retención de evidencia y auditoría aplican según el marco de gobierno vigente.
