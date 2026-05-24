---
agent: diana.teams
description: Orquesta /diana.teams para definir topologia de trabajo (single-person o multi-team), registrar equipos con scope_primario, y generar configuracion canonica multi-equipo. La topologia debe definirse ANTES de diana.specify, diana.plan y diana.tasks.
---

# /diana.teams — Topologia y Coordinacion Multi-equipo Diana

## Uso

/diana.teams action="topology"
/diana.teams action="generate"
/diana.teams action="validate"
/diana.teams action="regenerate"

Modo recomendado:

/diana.teams action="topology" project="diana-inversions" initiative="001-inversions"
/diana.teams action="generate" project="diana-inversions" initiative="001-inversions"

## Argumentos

| Argumento   | Valores                              | Default          | Descripcion                                              |
|-------------|--------------------------------------|------------------|----------------------------------------------------------|
| action      | topology \| generate \| validate \| regenerate | topology | Operacion a ejecutar                             |
| project     | id en projects-knowledge-radar       | diana-inversions | Proyecto objetivo                                        |
| initiative  | id de iniciativa                     | 001-inversions   | Iniciativa objetivo                                      |
| team        | TEAM-01..TEAM-09 \| all              | all              | Equipo especifico (para acciones que lo admiten)         |

## Precondiciones Obligatorias

1. `/diana.ticket` completado (ticket de servicio registrado)
2. `/diana.change` completado (UCC generado)
3. `/diana.integrate action="bootstrap"` completado (engine/metodologia y topologia humana declarados)
4. `/diana.constitution` completado (constitucion creada/actualizada)
5. `action="topology"` debe ejecutarse ANTES de `/diana.specify`, `/diana.plan` y `/diana.tasks`

## Fuentes Oficiales Obligatorias

1. `.drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml`
2. `.drfic/diana-sdk/projects/<project>/inv-constitution.md`
3. `.drfic/diana-sdk/projects/<project>/governance/change-requests/<NNN>-inv-ucc.md`
4. `.drfic/diana-sdk/projects/<project>/initiatives/<initiative>/meta.md` (si existe)

---

## Action=topology

**Este es el primer paso antes de cualquier especificacion, plan o tareas.**

Topologia fuente de verdad:
- La decision primaria de topologia humana (`single_dev` o `multi_team`) se define en
  `/diana.integrate action="bootstrap"` y queda persistida en `integration-profile.md`.
- `/diana.teams action="topology"` NO debe volver a pedir esa decision como si fuera nueva;
  debe leerla y aplicarla en la iniciativa.
- Solo pedir confirmacion si hay inconsistencia entre `integration-profile.md` y `meta.md`,
  o si el usuario solicita override explicito.

Pregunta interactivamente al usuario:

1. Si no hay topologia registrada en `integration-profile.md`:
   "Trabaja un solo desarrollador o hay equipos? (single / multi)"
2. Si ya hay topologia registrada:
   "Se detecto topologia <valor>. Confirmas usarla? (si/no, con override opcional)"

Si `single`:
- Registrar `topology: single_person` en meta.md de la iniciativa.
- No crear estructura de equipos.
- Los comandos `diana.specify`, `diana.plan`, `diana.tasks` operaran en modo unico:
  - `<NNN>-inv-spec.md`, `<NNN>-inv-plan.md`, `<NNN>-inv-tasks.md`

Si `multi`:
- Preguntar: "Cuantos equipos? Indica nombre/alias y scope_primario de cada uno."
  - `scope_primario`: descripcion breve de que area o funcionalidad cubre ese equipo
    (basado en la constitucion y el UCC, no en detalle tecnico aun)
- Registrar `topology: multi_team` en meta.md.
- Crear estructura de carpetas en Diana:
  ```
  .drfic/diana-sdk/projects/<project>/initiatives/<initiative>/teams/
    TEAM-01/   (carpeta del equipo)
    TEAM-02/
    ...
  ```
- Generar `scope_primario.md` en la raiz de la iniciativa:
  ```
  .drfic/diana-sdk/projects/<project>/initiatives/<initiative>/scope_primario.md
  ```

Nota de ubicacion:
- `scope_primario.md` vive en la raiz de la iniciativa, NO en `speckit/`.
- `speckit/team-roster.md` se genera despues, en `action="generate"`.

### Estructura de scope_primario.md

```markdown
# Scope Primario por Equipo
## Iniciativa: <initiative>
## Fuente: constitucion + UCC <NNN>
## Fecha: <fecha>

| team_id  | team_alias | scope_primario                              | carpeta_diana                     |
|----------|------------|---------------------------------------------|-----------------------------------|
| TEAM-01  | <alias>    | <descripcion breve del area funcional>      | teams/TEAM-01/                    |
| TEAM-02  | <alias>    | <descripcion breve del area funcional>      | teams/TEAM-02/                    |

## Notas de Division
- Division basada en: <resumen de criterio de division desde constitucion/UCC>
- Documentos canonicos base: <NNN>-inv-spec.md, <NNN>-inv-plan.md, <NNN>-inv-tasks.md
- Estos documentos son la fuente que diana.specify, diana.plan y diana.tasks
  leeran para generar los artefactos por equipo.
```

### Reglas de Topology

1. Si ya existe un `scope_primario.md` o meta.md con topology registrado, preguntar si se desea redefinir.
2. El scope_primario NO es una especificacion tecnica detallada — es una guia de division funcional.
3. La division se basa en la constitucion y el UCC, no se inventa.
4. Si la iniciativa ya tiene `<NNN>-inv-spec.md`, ese archivo es el canon base para dividir — no se reemplaza.

---

## Action=generate

Genera o actualiza roster, asignacion equipo-tarea y bootstrap de agentes por equipo.

**Precondicion**: `action="topology"` ya completado.

- Leer `scope_primario.md` para conocer equipos y division.
- Generar roster con aliases, branch_prefix y roles.
- Generar `team-task-allocation.md` con asignacion de tareas por equipo.
- Generar `team-agent-bootstrap.md` con skills, contratos y knowledge requeridos por equipo.
- Verificar que no haya huecos en cobertura de backlog.

Salidas:
1. `.drfic/diana-sdk/projects/<project>/initiatives/<initiative>/speckit/team-roster.md`
2. `.drfic/diana-sdk/projects/<project>/initiatives/<initiative>/speckit/team-task-allocation.md`
3. `.drfic/diana-sdk/projects/<project>/initiatives/<initiative>/speckit/team-agent-bootstrap.md`

---

## Action=validate

Verificar:
- Existencia y coherencia de `scope_primario.md`.
- Cobertura completa del backlog canonico por equipos.
- Existencia de alias y lead tecnico por equipo.
- Coherencia entre tareas asignadas y skills/knowledge requeridos.
- Coherencia entre `scope_primario` y artefactos generados por equipo en `teams/`.

Devolver:
- OK: [n]
- GAPS: [n]
- Lista de acciones recomendadas.

---

## Action=regenerate

- Releer constitucion, UCC, scope_primario, artefactos existentes por equipo.
- Recalcular asignacion y bootstrap desde cero.
- Mantener continuidad semantica cuando sea posible.
- Reportar cambios vs version previa.

---

## Flujo Recomendado

### Modo single-person (un solo desarrollador)

```
/diana.ticket → /diana.change → /diana.integrate action="bootstrap" → /diana.constitution
/diana.teams action="topology"  ← topology=single_person
/diana.skills action="validate"
/diana.knowledge
/diana.specify    → <NNN>-inv-spec.md
/diana.plan       → <NNN>-inv-plan.md
/diana.tasks      → <NNN>-inv-tasks.md
/diana.integrate  → especkit lee artefactos diana
speckit.specify → speckit.plan → speckit.tasks → speckit.implement
```

### Modo multi-team (1 o mas equipos)

```
/diana.ticket → /diana.change → /diana.integrate action="bootstrap" → /diana.constitution
/diana.teams action="topology"  ← define equipos + scope_primario
/diana.skills action="validate"
/diana.knowledge
/diana.specify    → genera teams/TEAM-01/spec.md, teams/TEAM-02/spec.md...
/diana.plan       → genera teams/TEAM-01/plan.md, teams/TEAM-02/plan.md...
/diana.tasks      → genera teams/TEAM-01/tasks.md, teams/TEAM-02/tasks.md...
/diana.teams action="generate"  ← roster + allocation + bootstrap
/diana.integrate  ← apunta speckit a carpeta teams/TEAM-NN/ por equipo
Por cada equipo:
  speckit.specify → speckit.plan → speckit.tasks → speckit.implement
```

---

## Integracion con Speckit (multi-team)

Cuando Speckit ejecuta para un equipo:
- `speckit.specify` lee `teams/TEAM-01/spec.md` (canonico Diana) y genera/mejora `specs/<folder-slug>/spec.md`
- `speckit.plan` lee `teams/TEAM-01/plan.md` (canonico Diana) y genera/mejora `specs/<folder-slug>/plan.md`
- `speckit.tasks` lee `teams/TEAM-01/tasks.md` (canonico Diana) y genera/mejora/complementa `specs/<folder-slug>/tasks.md`

Regla: Speckit no ignora ni descarta los artefactos canonicos de Diana — los toma como base y los optimiza con su logica SDD.

---

## Notas de agente (Diana)

Roles conceptuales durante esta accion:
- BULMA: team-architect (estructura, scope_primario y ownership)
- VEGETA: dependency-reviewer (dependencias, riesgos y cobertura)
- KRILIN: execution-readiness (bootstrap de agentes y entrega a Speckit)