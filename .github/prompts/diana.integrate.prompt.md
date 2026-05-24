---
agent: diana.integrate
description: Define perfil de integracion temprano y genera/valida/regenera el handoff oficial entre Diana y un engine SDD objetivo como SpecKit, OpenSpec o Generic-SDD.
---

# /diana.integrate — Handoff Multi-Framework Diana

## Uso

/diana.integrate action="bootstrap" engine="speckit" orchestration="manual" topology="multi_team"
/diana.integrate action="generate" engine="speckit"
/diana.integrate action="validate" engine="speckit"
/diana.integrate action="regenerate" engine="speckit"
/diana.integrate action="run" engine="speckit" run_only="plan"
/diana.integrate action="run" engine="speckit" run_only="tasks"
/diana.integrate action="all" engine="speckit" project="diana-inversions" initiative="001-inversions"
/diana.integrate action="all" engine="speckit" project="diana-inversions" initiative="001-inversions" team="TEAM-01" until="specify"
/diana.integrate action="all" engine="speckit" project="diana-inversions" initiative="001-inversions" team="TEAM-01" until="tasks"
/diana.integrate action="all" engine="speckit" project="diana-inversions" initiative="001-inversions" team="TEAM-01" until="specify" language="es"
/diana.integrate action="all" engine="speckit" project="diana-inversions" initiative="001-inversions" team="TEAM-01" from="plan" until="plan"
/diana.integrate action="all" engine="speckit" project="diana-inversions" initiative="001-inversions" team="TEAM-01" from="tasks" until="tasks"

Modo recomendado multi-proyecto:

/diana.integrate action="generate" scope="project" project="diana-inversions" initiative="001-inversions" engine="speckit" stage="implement"

## Argumentos

| Argumento | Valores | Default | Descripcion |
|-----------|---------|---------|-------------|
| action | bootstrap \| generate \| validate \| regenerate \| run \| all | generate | Operacion sobre perfil/handoff |
| scope | project | initiative | sdk | project | Nivel de ejecucion |
| project | id en projects-knowledge-radar | diana-inversions | Proyecto objetivo |
| initiative | id de iniciativa | 001-inversions | Iniciativa objetivo |
| engine | speckit | openspec | generic_sdd | speckit | Framework SDD objetivo |
| stage | specify | clarify | plan | tasks | implement | refine | design | breakdown | build | discovery | architecture | decomposition | delivery | implement | Etapa objetivo dentro del engine |
| run_only | specify | clarify | plan | tasks | implement | refine | design | breakdown | build | discovery | architecture | decomposition | delivery | implement | (vacío) | Etapa unica a ejecutar cuando action="run" |
| from | specify | clarify | plan | tasks | implement | (vacío) | Etapa inicial para un pipeline parcial cuando action="all" |
| team | TEAM-01..TEAM-99 | all | Equipo objetivo para ejecucion puntual en `action=all` |
| until | specify \| plan \| tasks \| implement | implement | Limite de etapa para `action=all` |
| language | es \| en | es | Idioma de salida de artefactos generados por el engine |
| orchestration | manual | automatic | manual | Politica de ejecucion entre Diana y engine |
| topology | single_dev | multi_team | multi_team | Topologia de desarrollo humano |
| sync_mode | disabled | on_merge | scheduled | on_merge | Modo de sincronizacion automatica de tareas |

## Fuentes Oficiales Obligatorias

1. `.drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml`
2. `.drfic/diana-sdk/projects/<project>/inv-constitution.md`
3. Fuente de spec segun topologia:
   - `single_person`: `.drfic/diana-sdk/projects/<project>/initiatives/<initiative>/001-inv-spec.md`
   - `multi_team`: `.drfic/diana-sdk/projects/<project>/initiatives/<initiative>/teams/TEAM-XX/spec.md`
4. Fuente de plan segun topologia:
   - `single_person`: `.drfic/diana-sdk/projects/<project>/initiatives/<initiative>/001-inv-plan.md`
   - `multi_team`: `.drfic/diana-sdk/projects/<project>/initiatives/<initiative>/teams/TEAM-XX/plan.md`
5. Fuente de tasks segun topologia:
   - `single_person`: `.drfic/diana-sdk/projects/<project>/initiatives/<initiative>/001-inv-tasks.md`
   - `multi_team`: `.drfic/diana-sdk/projects/<project>/initiatives/<initiative>/teams/TEAM-XX/tasks.md`
6. `.drfic/diana-sdk/projects/<project>/knowledge/indexes/sdd-engine-matrix.yaml`
7. `.drfic/diana-sdk/projects/<project>/knowledge/indexes/skills-manifest.yaml`
8. `.drfic/diana-sdk/projects/<project>/knowledge/indexes/agent-skill-matrix.yaml`
9. `.drfic/diana-sdk/projects/<project>/initiatives/<initiative>/speckit/team-task-allocation.md` (si existe trabajo multi-equipo)
10. `.drfic/diana-sdk/projects/<project>/initiatives/<initiative>/speckit/team-agent-bootstrap.md` (si existe trabajo multi-equipo)
11. `.drfic/diana-sdk/projects/<project>/initiatives/<initiative>/integrations/integration-profile.md` (si existe)

## Template Core Obligatoria

1. `.drfic/diana-sdk/sdk/diana/templates/engine-handoff.md`
2. `.drfic/diana-sdk/sdk/diana/templates/integration-profile.md`

## Salidas Obligatorias

1. `.drfic/diana-sdk/projects/<project>/initiatives/<initiative>/integrations/<engine>-handoff.md`
2. `.drfic/diana-sdk/projects/<project>/initiatives/<initiative>/integrations/integration-profile.md`
2. Resumen de readiness por stage/engine
3. Lista de artefactos Diana que el engine debe consumir sin reinterpretar el canon

## Regla de Entrada Canonica y No-Omision (Obligatoria)

Aplica a cualquier ejecucion de Speckit desde `diana.integrate` para `specify`, `plan` y `tasks`.

Principios:
- El artefacto Diana del `TEAM-XX` correspondiente es la entrada canonica base por etapa.
- Speckit puede optimizar, ampliar, mejorar o complementar el contenido.
- Speckit NO puede omitir requisitos, decisiones o alcance ya validados por Diana.
- Si Speckit reestructura contenido, debe conservar trazabilidad semantica 1:1 con el canon fuente.

Matriz minima de entradas canonicas por etapa:
- `speckit.specify`: usar `teams/TEAM-XX/spec.md` como descripcion base obligatoria.
- `speckit.plan`: usar `teams/TEAM-XX/plan.md` como base de plan, mas el `spec.md` del feature Speckit vigente.
- `speckit.tasks`: usar `teams/TEAM-XX/tasks.md` como backlog base, mas `plan.md` y `spec.md` vigentes del feature Speckit.

Validacion de cobertura obligatoria al finalizar cada etapa:
- Confirmar cobertura de items canonicos de entrada en el artefacto Speckit resultante.
- Reportar tres categorias: `preserved`, `expanded`, `merged`.
- Si existe `dropped` no justificado, detener ejecucion y marcar `GAP` (no completar exitosamente la etapa).

## Action=bootstrap (Fase 0 obligatoria)

- Crear o actualizar `integration-profile.md` al inicio de cada ciclo de cambio.
- Registrar decisiones obligatorias:
	- engine SDD
	- orchestration (manual/automatic)
	- topology (single_dev/multi_team)
	- policy de autoridad (Diana canon strict)
- Regla de autoridad de topologia:
   - `integration-profile.md` es la fuente de verdad para la topologia humana.
   - `/diana.teams action="topology"` debe leer esta decision y materializarla en la iniciativa (`meta.md`, `scope_primario.md`, `teams/TEAM-XX/`).
   - Solo se permite override si el usuario lo solicita explicitamente o si existe inconsistencia detectada.
- Definir politicas de automatizacion por etapa y sincronizacion de tareas.
- Esta accion se recomienda justo despues de `/diana.change` y antes de `/diana.constitution`.

## Action=generate

- Generar handoff oficial para el engine objetivo.
- Resolver equivalencia de etapas usando `sdd-engine-matrix.yaml`.
- Declarar orden de ejecución recomendado y artefactos de entrada obligatorios.
- Declarar si el engine puede ejecutar implementación directa o requiere reparto multi-equipo previo.
- Respetar `integration-profile.md` cuando exista.
- En `multi_team`, no exigir artefactos globales `001-inv-spec/plan/tasks.md` si existen los artefactos por equipo.

## Action=validate

Verificar:
- Que el engine objetivo tenga mapeo válido en `sdd-engine-matrix.yaml`.
- Que el stage objetivo tenga required_skills resolubles.
- Que el handoff referencia artefactos canónicos vigentes.
- Que, si existe trabajo multi-equipo, el handoff apunte a `/diana.teams` antes de implementación distribuida.
- Que las reglas de `integration-profile.md` sean coherentes con el flujo seleccionado.

Devolver resumen:
- OK: [n]
- GAPS: [n]
- Lista de acciones recomendadas.

## Action=regenerate

- Releer canon, knowledge y matrix por engine.
- Recalcular handoff desde cero.
- Mantener continuidad semántica cuando sea posible.
- Reportar cambios significativos frente a la versión previa.

## Action=run (Ejecucion de una sola etapa)

Ejecuta exactamente una etapa de Speckit sin correr el pipeline completo.

Reglas:
- `run_only` define la etapa unica a ejecutar.
- `stage` puede usarse como alias de `run_only` cuando la intención sea inequívoca.
- `run_only="specify"` ejecuta solo `speckit.specify`.
- `run_only="plan"` ejecuta solo `speckit.plan`.
- `run_only="tasks"` ejecuta solo `speckit.tasks`.
- `run_only="implement"` ejecuta solo `speckit.implement`.
- Para `run_only="specify"|"plan"|"tasks"`, cargar SIEMPRE el artefacto canonico `teams/TEAM-XX/<etapa>.md` antes de invocar Speckit.
- Para `run_only="plan"` y `run_only="tasks"`, preservar y ampliar el canon del equipo; no omitir contenido ya validado por Diana.
- Toda ejecucion `run_only` debe incluir reporte de cobertura canonica (`preserved|expanded|merged|dropped`).

Ejemplos operativos:
- Solo plan para TEAM-01:
   `/diana.integrate action="run" engine="speckit" project="diana-inversions" initiative="001-inversions" team="TEAM-01" run_only="plan"`
- Solo tasks para TEAM-01:
   `/diana.integrate action="run" engine="speckit" project="diana-inversions" initiative="001-inversions" team="TEAM-01" run_only="tasks"`

---

## Action=all (Pipeline Multi-Team Completo o Parcial)

Ejecuta el pipeline de integracion para TODOS los equipos o para un equipo especifico,
con posibilidad de limitar la ejecucion hasta una etapa (`until`).

Regla de idioma:
- `language="es"` (default): generar artefactos en espanol tecnico.
- `language="en"`: generar artefactos en ingles tecnico.
- Si la constitucion del proyecto define idioma oficial, ese idioma prevalece ante overrides.

**Precondicion**: `diana.teams action="topology"` completado y `scope_primario.md` existente.

Validacion previa obligatoria:
- Verificar que la topologia en `integration-profile.md` sea `multi_team`.
- Si no coincide con `meta.md`, detener y pedir confirmacion de override antes de continuar.

Procedimiento:

1. Resolver equipos objetivo:
   - Si `team=all` o no se envia `team`, leer `scope_primario.md` para obtener lista de equipos (TEAM-01..TEAM-NN).
   - Si se envia `team=TEAM-XX`, ejecutar SOLO para ese equipo.
   - Si el equipo no existe en `scope_primario.md`, detener con error accionable.
2. Por cada equipo, verificar que existan los artefactos canonicos:
   - `teams/TEAM-XX/spec.md`
   - `teams/TEAM-XX/plan.md`
   - `teams/TEAM-XX/tasks.md`
3. Si faltan artefactos de un equipo, reportar gap y omitir ese equipo (no bloquear los demas).
4. Por cada equipo con artefactos completos, ejecutar segun rango `from`/`until` (o solo `until` si `from` no se envia):
   ```
   until=specify  -> speckit.specify  (input: teams/TEAM-XX/spec.md, language)
   until=plan     -> speckit.specify  -> speckit.plan  (language)
   until=tasks    -> speckit.specify  -> speckit.plan -> speckit.tasks (language)
   until=implement-> speckit.specify  -> speckit.plan -> speckit.tasks -> speckit.implement (language)
   ```
   Regla de entrada canonica por etapa:
   - `speckit.specify` debe cargar `teams/TEAM-XX/spec.md` como fuente base obligatoria.
   - `speckit.plan` debe cargar `teams/TEAM-XX/plan.md` y el `spec.md` vigente del feature Speckit.
   - `speckit.tasks` debe cargar `teams/TEAM-XX/tasks.md` y el `plan.md/spec.md` vigentes del feature Speckit.
   Regla de no-omision:
   - Permitir optimizacion/ampliacion/complemento, pero prohibir omision de contenido canonico ya validado.
   - Si hay omision no justificada, marcar `GAP` y detener avance de etapa para ese equipo.
5. Al terminar todos los equipos, generar reporte de ejecucion:
   - Equipos completados: [n]
   - Equipos con gaps: [n] + detalle
   - Etapa limite aplicada (`until`)
   - Artefactos Speckit generados por equipo
   - Resumen de cobertura canonica por equipo y etapa (`preserved|expanded|merged|dropped`)

## Pipeline Parcial con from/until

Permite definir un rango de etapas dentro de `action="all"`.

Reglas:
- `from` define la primera etapa a ejecutar.
- `until` define la última etapa a ejecutar.
- Si `from` no se especifica, se conserva el inicio por defecto del pipeline actual.
- Si `from="plan"` y `until="plan"`, se ejecuta solo `speckit.plan`.
- Si `from="tasks"` y `until="tasks"`, se ejecuta solo `speckit.tasks`.
- Si `from="specify"` y `until="plan"`, se ejecutan `speckit.specify` y `speckit.plan`.
- Si `from` es posterior a `until`, detener con error de configuración.

Ejemplos operativos:
- Solo specify para TEAM-01:
  `/diana.integrate action="all" engine="speckit" project="diana-inversions" initiative="001-inversions" team="TEAM-01" until="specify"`
- Solo specify para TEAM-01 en espanol:
   `/diana.integrate action="all" engine="speckit" project="diana-inversions" initiative="001-inversions" team="TEAM-01" until="specify" language="es"`
- Hasta tasks para TEAM-03:
  `/diana.integrate action="all" engine="speckit" project="diana-inversions" initiative="001-inversions" team="TEAM-03" until="tasks"`
- Solo plan para TEAM-01:
   `/diana.integrate action="all" engine="speckit" project="diana-inversions" initiative="001-inversions" team="TEAM-01" from="plan" until="plan"`
- Solo tasks para TEAM-01:
   `/diana.integrate action="all" engine="speckit" project="diana-inversions" initiative="001-inversions" team="TEAM-01" from="tasks" until="tasks"`
- Flujo completo para todos:
  `/diana.integrate action="all" engine="speckit" project="diana-inversions" initiative="001-inversions" team="all" until="implement"`

**Regla**: Speckit lee los artefactos Diana en `teams/TEAM-XX/` como INPUT BASE canónico.
No los descarta ni los reinterpreta — los optimiza con su lógica SDD.

---

## Flujo Recomendado

### Single-Person

1. `/diana.change ...`
2. `/diana.integrate action="bootstrap" engine="speckit" orchestration="manual" topology="single_dev"`
3. `/diana.constitution action="generate"`
4. `/diana.teams action="topology"` — aplicar topology=single_person desde integration-profile.md
5. `/diana.skills action="validate"`
6. `/diana.knowledge`
7. `/diana.specify` → `/diana.plan` → `/diana.tasks`
8. `/diana.integrate action="generate" engine="speckit" stage="implement"`
9. `speckit.specify` → `speckit.plan` → `speckit.tasks` → `speckit.implement`

### Multi-Team