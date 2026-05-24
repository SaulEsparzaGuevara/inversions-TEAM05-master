# Plan Tecnico de Equipo: TEAM-01 DIANArchiTEC

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-01
**Alias**: DIANArchiTEC
**Version**: 1.0
**Estado**: Draft
**Fuente**: 001-inv-plan.md + TEAM-01/spec.md + scope_primario.md + integration-profile.md

## Autoridad

Este plan de equipo esta subordinado a:
1. inv-constitution.md
2. 001-inv-spec.md
3. 001-inv-plan.md
4. TEAM-01/spec.md
5. scope_primario.md

Ante conflicto, prevalece la constitucion y luego el canon global.

## Entradas Oficiales Consumidas

Fuentes canonicas:
- .drfic/diana-sdk/projects/diana-inversions/inv-constitution.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-spec.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-plan.md
- .drfic/diana-sdk/projects/diana-inversions/governance/change-requests/001-inv-ucc.md
- .drfic/diana-sdk/projects/diana-inversions/governance/tickets/001-inv-tkt.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/meta.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/scope_primario.md

Fuentes de equipo:
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-01/spec.md

Skills y knowledge first cargados como contexto:
- .drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/skills-manifest.yaml
- .drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/agent-skill-matrix.yaml
- .drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/sdd-engine-matrix.yaml
- .drfic/diana-sdk/projects/knowledge/indexes/master-index.md
- .drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/master-index.md

## Objetivo del Plan

Definir el como tecnico para implementar el slice de plataforma de TEAM-01, cubriendo base de datos operativa, integracion broker, wiring backend-frontend y dashboard principal de confluencia, manteniendo alineacion con el plan global y sin introducir requisitos nuevos fuera del canon aprobado.

## Alcance y Exclusiones

Incluye:
- Modelo de datos operativo y baseline de persistencia del dominio principal.
- Contratos desacoplados para integracion con IBKR y Alpaca.
- Wiring backend/frontend para consumo de señales y estado operativo.
- Dashboard principal, UX operativa y trazabilidad de evidencia.
- Guardrails de seguridad, auditabilidad, observabilidad y aprobacion humana.

Excluye:
- Auto-trading o ejecucion sin humano en el loop.
- Reinterpretar o renumerar el backlog canonico global.
- Cubrir responsabilidades funcionales de otros equipos.
- Modificar spec o plan globales como parte de este slice.

## Skills Requeridas para la Etapa de Plan

Required skills de speckit.plan relevantes al slice TEAM-01:
- 008-inv-market-data-and-realtime
- 010-inv-broker-integration-ibkr-alpaca
- 011-inv-portfolio-and-performance-analytics

Skills compartidos de apoyo:
- 001-SDK-SDDCORE
- 002-SDK-TSSTACK

## Arquitectura Tecnica del Equipo

### Vista de capas del slice TEAM-01

1. Capa de datos operativos
- Modelo persistente para usuarios, activos, senales, decisiones, evidencias e intentos de ejecucion.
- Esquema baseline versionado y migraciones controladas en Supabase.

2. Capa de integracion broker
- Contratos desacoplados para IBKR y Alpaca.
- Adaptadores aislados de la logica de UI y de la logica de persistencia.

3. Capa de orquestacion backend/frontend
- Servicios REST para evaluar, consumir y presentar la informacion del dominio principal.
- Wiring estable entre backend y frontend para dashboard y evidencia.

4. Capa de experiencia operativa
- Dashboard principal de confluencia de senales.
- UX para aprobacion, seguimiento y auditoria humana.

### Controles tecnicos obligatorios del equipo

- Seguridad: credenciales solo en .env, aprobacion humana obligatoria y RBAC en contratos sensibles.
- Resiliencia: fail-fast en adaptadores broker y manejo de fallos de integracion.
- Observabilidad: logs estructurados, evidencias y trazabilidad de decisiones.
- Cumplimiento: respetar disclaimer, auditabilidad y retencion definida por el canon global.
- Determinismo: la logica de datos y senales debe ser reproducible; la IA solo narra o explica.

## Fases Tecnicas de Implementacion del Equipo

### Fase T01-1: Base de plataforma y persistencia

Backlog alineado:
- T060-T062

Objetivo:
- Establecer la base de cliente Supabase, repositories y validacion de entorno para el slice de plataforma.

Entregables:
- Cliente Supabase y repositorios base.
- Migraciones versionadas en lugar.
- Validador de .env activo en startup.

Trazabilidad a requisitos:
- RF-001, RF-006
- SC-005, SC-006

### Fase T01-2: Dashboard principal y paneles de operacion

Backlog alineado:
- T063-T066

Objetivo:
- Construir la experiencia principal de TEAM-01 para visualizar confluencia, activar core y explicar resultados.

Entregables:
- Dashboard principal funcional.
- Panel de activacion de cores.
- Overlay de senales y tabla de explicabilidad.

Trazabilidad a requisitos:
- RF-004, RF-005, RF-006
- SC-001, SC-004

### Fase T01-3: Orquestacion de APIs y wiring operativo

Backlog alineado:
- T067-T068

Objetivo:
- Consolidar el orquestador API y el wiring con brokers sobre contratos estables.

Entregables:
- Orquestador API consolidado.
- Integracion broker wiring completado.

Trazabilidad a requisitos:
- RF-002, RF-003, RF-006
- SC-002, SC-008

### Fase T01-4: Validacion, hardening y alineacion con el canon

Backlog alineado:
- Cierre de slice TEAM-01 y validaciones transversales aplicables

Objetivo:
- Verificar que el slice quede listo para Speckit sin romper la autoridad canonica.

Entregables:
- Evidencia de trazabilidad y cumplimiento.
- Contratos estables entre API, dashboard y adaptadores.
- Checklist de readiness para Speckit.

Trazabilidad a requisitos:
- FR-001, FR-002, FR-003, FR-004, FR-005, FR-006
- SC-001, SC-002, SC-004, SC-005, SC-008

## Riesgos y Mitigaciones

- Riesgo: desalineacion entre dashboard y contratos de broker.
  - Mitigacion: contratos desacoplados y validacion de integracion por fase.
- Riesgo: romper la trazabilidad de evidencia.
  - Mitigacion: modelar evidencia e intentos de ejecucion desde el inicio.
- Riesgo: invadir responsabilidades de otros equipos.
  - Mitigacion: respetar scope_primario y limitar el slice al dominio de plataforma.
- Riesgo: introducir automatizacion no permitida.
  - Mitigacion: mantener humano en el loop y aprobar toda accion sensible.

## Criterios de Validacion Tecnica

- El plan de TEAM-01 cubre el alcance funcional de su spec sin salir del canon global.
- El dashboard principal puede consumir y mostrar senales de forma trazable.
- Los adaptadores broker quedan desacoplados y listos para integracion controlada.
- La persistencia baseline y el wiring backend/frontend quedan listos para el delivery.
- La salida queda preparada para ser refinada por `/speckit.plan`.

## Integracion con Speckit

Flujo recomendado para este equipo:
1. `/diana.plan action="generate" project="diana-inversions" initiative="001-inversions" team="TEAM-01"`
2. `/speckit.plan` sobre el slice derivado de TEAM-01

## Notas de agente (Diana)

Roles conceptuales durante esta accion:
- BULMA: plan-architect
- VEGETA: canon-reviewer
- KRILIN: task-readiness
