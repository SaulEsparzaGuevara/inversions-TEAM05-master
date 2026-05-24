---
agent: diana.plan
description: Genera, valida o regenera el plan tecnico Diana a partir de constitucion, spec canonica y spec operativa, usando skills y knowledge como contexto obligatorio antes de /speckit.plan.
---

# /diana.plan — Generador de Plan Tecnico Diana

## Uso

/diana.plan action="generate"
/diana.plan action="validate"
/diana.plan action="regenerate"

Modo recomendado multi-proyecto:

/diana.plan action="generate" scope="project" project="diana-inversions"

## Argumentos

| Argumento | Valores | Default | Descripcion |
|-----------|---------|---------|-------------|
| action | generate | validate | regenerate | generate | Operacion sobre el plan tecnico |
| scope | project | initiative | sdk | project | Nivel de ejecucion |
| project | id en projects-knowledge-radar | diana-inversions | Proyecto objetivo |
| initiative | id de iniciativa | 001-inversions | Iniciativa objetivo cuando aplique |

## Comportamiento por default (si omites argumentos)

- Si omites `scope`, se usa `scope="project"`.
- Si omites `project`, se usa `project="diana-inversions"`.
- Si omites `initiative`, se usa `initiative="001-inversions"`.
- Resultado default: plan tecnico Diana del proyecto/initiative activo, listo para alimentar `/speckit.plan`.

## Objetivo

Producir un plan tecnico consistente y trazable, subordinado a constitucion + spec canonica + spec operativa, enriquecido por skills y knowledge del proyecto.

## Fuentes Oficiales Obligatorias

Para `scope=project`:
1. `.drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml`
2. `.drfic/diana-sdk/projects/<project>/inv-constitution.md`
3. `.drfic/diana-sdk/projects/<project>/initiatives/<initiative>/001-inv-spec.md`
4. `specs/001-plataforma-inversiones-ia/spec.md`
5. `.drfic/diana-sdk/projects/<project>/governance/change-requests/001-inv-ucc.md`
6. `.drfic/diana-sdk/projects/<project>/governance/tickets/001-inv-tkt.md`
7. `.drfic/diana-sdk/projects/<project>/initiatives/<initiative>/meta.md`

## Skills + Knowledge First (obligatorio)

Antes de generar o validar plan:

1. Cargar skills:
- `.drfic/diana-sdk/projects/<project>/knowledge/indexes/skills-manifest.yaml`
- `.drfic/diana-sdk/projects/<project>/knowledge/indexes/agent-skill-matrix.yaml`
- `.drfic/diana-sdk/projects/<project>/knowledge/indexes/sdd-engine-matrix.yaml`
- `.drfic/diana-sdk/sdk/diana/knowledge/indexes/shared-skills-manifest.yaml` (si existe)

2. Cargar knowledge (orden):
- `.drfic/diana-sdk/projects/knowledge/indexes/master-index.md`
- `.drfic/diana-sdk/projects/<project>/knowledge/indexes/master-index.md`
- `.drfic/diana-sdk/sdk/diana/knowledge/indexes/master-index.md` (si aplica)

3. Resolver required_skills para etapa de planificacion:
- `speckit.plan`
- En engines alternos: etapa equivalente (`design`, `architecture`).

4. Si falta skill o knowledge:
- No bloquear.
- Degradar con metodologia estandar.
- Reportar gap y comando recomendado `/diana.knowledge ...`.

## Salidas Obligatorias

1. Plan tecnico canonico del proyecto:
- `.drfic/diana-sdk/projects/<project>/initiatives/<initiative>/001-inv-plan.md`

2. Evidencia de consistencia plan/spec (en validate):
- reporte en salida con OK/GAPS + acciones sugeridas.

3. Trazabilidad hacia Speckit:
- confirmar que el plan queda listo para `/speckit.plan`.

## Action=generate

- Generar o actualizar `001-inv-plan.md` subordinado a constitucion y specs.
- Incluir arquitectura, fases, riesgos y criterios de validacion tecnica.
- Mantener alineacion con FR/SC de spec operativa.

## Action=validate

Verificar:
- Que el plan no contradiga constitucion/spec.
- Que cada fase del plan tenga trazabilidad con requisitos de spec.
- Que se consideren skills requeridas para `speckit.plan`.
- Que haya cobertura minima de seguridad, resiliencia, observabilidad y cumplimiento.

Devolver resumen:
- OK: [n]
- GAPS: [n]
- Lista de acciones recomendadas.

## Action=regenerate

- Releer todas las fuentes oficiales.
- Recalcular el plan desde cero.
- Reescribir `001-inv-plan.md` manteniendo continuidad semantica cuando sea posible.
- Reportar cambios significativos vs version previa.

## Integracion con Speckit

Flujo recomendado:
1. `/diana.skills action="validate" scope="project" project="diana-inversions"`
2. `/diana.knowledge scope="project" project="diana-inversions"`
3. `/diana.plan action="generate" scope="project" project="diana-inversions"`
4. `/speckit.plan`

## Notas de agente (Diana)

Roles conceptuales durante esta accion:
- BULMA: plan-architect (principal)
- VEGETA: canon-reviewer (validacion)
- KRILIN: task-readiness (preparacion de descomposicion)

Estos roles guian la accion, pero la seleccion de agente ejecutor depende de la configuracion del prompt/agent en VS Code.
