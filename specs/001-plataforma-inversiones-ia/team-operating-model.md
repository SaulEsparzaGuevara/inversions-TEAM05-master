# Modelo Operativo Multi-equipo (SpecKit + Diana)

## Objetivo

Definir una forma profesional para coordinar 8 equipos (5 integrantes por equipo) trabajando en paralelo sobre este proyecto, con trazabilidad por tareas, ramas, PRs, agentes de SpecKit y conocimiento profundo de Diana.

## Regla de Derivacion de Features

Este documento no convierte a `specs/001-plataforma-inversiones-ia/` en el backlog operativo total de todos los equipos.

Reglas obligatorias:
- `specs/001-plataforma-inversiones-ia/` se mantiene como feature umbrella/base compartida de la iniciativa.
- La umbrella `001` conserva alcance fundacional y compartido: Fase 1-Fase 6, contratos, quickstart, checklists y artefactos base.
- Las fases por equipo del backlog canonico (`TEAM-01` a `TEAM-09`) deben derivarse a features separadas bajo `specs/` antes de ejecutar `speckit.specify`, `speckit.plan`, `speckit.tasks` o `speckit.implement` por slice.
- Las asignaciones de este documento para `T001-T058` describen la base compartida actual; para `T060-T177` manda la asignacion canonica en `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/speckit/team-task-allocation.md`.

Estructura objetivo de features por TEAM:
- `specs/002-team-01-dashboard-brokers/`
- `specs/003-team-02-indicadores-chat-ia/`
- `specs/004-team-03-fundamental-opciones-basicas/`
- `specs/005-team-04-estructura-wheel/`
- `specs/006-team-05-institucional-cobertura/`
- `specs/007-team-06-noticias-spreads/`
- `specs/008-team-07-ai-volatility/`
- `specs/009-team-08-estrategias-complejas/`
- `specs/010-team-09-calendar-diagonal/`

Regla dura:
- No agregar `T060-T177` al `tasks.md` de la feature `001`.

## 0) Punto de Partida Obligatorio: Fase 0 + Diana Core + /diana.teams + /diana.integrate

Primero se define el perfil de integracion del ciclo activo (Fase 0), antes de constitution/spec/plan/tasks.

Perfil obligatorio (decision de gobernanza):
- engine SDD objetivo (diana_only, speckit, openspec, hybrid)
- orquestacion (manual o automatic)
- topologia de desarrollo (single_dev o multi_team)
- politica de autoridad (Diana canónica)

Comando recomendado:

- `/diana.integrate action="bootstrap" scope="project" project="diana-inversions" initiative="001-inversions" engine="speckit" orchestration="manual" topology="multi_team"`

Artefacto esperado:

- `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/integrations/integration-profile.md`

Antes de ejecutar etapas de SpecKit, la configuracion de equipos y su relacion con tareas debe generarse primero en Diana core mediante `/diana.teams`, usando las plantillas canonicas del SDK:

- [diana.teams.prompt.md](../../.github/prompts/diana.teams.prompt.md)
- [diana.teams.agent.md](../../.github/agents/diana.teams.agent.md)
- [team-roster.md](../../.drfic/diana-sdk/sdk/diana/templates/team-roster.md)
- [team-task-allocation.md](../../.drfic/diana-sdk/sdk/diana/templates/team-task-allocation.md)
- [team-agent-bootstrap.md](../../.drfic/diana-sdk/sdk/diana/templates/team-agent-bootstrap.md)

Archivos de salida esperados (instanciados por el coordinador):

- [team-roster.md](../../.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/speckit/team-roster.md)
- [team-task-allocation.md](../../.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/speckit/team-task-allocation.md)
- [team-agent-bootstrap.md](../../.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/speckit/team-agent-bootstrap.md)

Solo despues de generar y validar esos tres artefactos con `/diana.teams` se deben enlazar y ejecutar fases Speckit.

Handoff obligatorio hacia engine:

- [diana.integrate.prompt.md](../../.github/prompts/diana.integrate.prompt.md)
- [diana.integrate.agent.md](../../.github/agents/diana.integrate.agent.md)
- [engine-handoff.md](../../.drfic/diana-sdk/sdk/diana/templates/engine-handoff.md)
- [speckit-handoff.md](../../.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/integrations/speckit-handoff.md)

Regla: `/diana.integrate action="bootstrap"` se ejecuta al inicio del ciclo; `/diana.integrate action="generate"` se ejecuta despues de `/diana.tasks` y, si hay trabajo multi-equipo, despues de `/diana.teams`; su salida es el handoff oficial que debe consumir el framework SDD objetivo.

## 1) Registro de Equipos y Alias

| Team ID | Alias            | Scope Primario                              | Branch Prefix | Owner de Integracion |
| ------- | ---------------- | ------------------------------------------- | ------------- | -------------------- |
| TEAM-01 | CRUD-X           | CRUD fullstack (backend+frontend operativo) | team01/       | Lead de Plataforma   |
| TEAM-02 | CF-DASH          | Dashboard principal de confluencia          | team02/       | Lead Frontend        |
| TEAM-03 | STRAT-WHEEL      | Core estrategia Wheel                       | team03/       | Lead Quant           |
| TEAM-04 | STRAT-STRADDLE   | Core estrategia Straddle                    | team04/       | Lead Quant           |
| TEAM-05 | STRAT-IRONCONDOR | Core estrategia Iron Condor                 | team05/       | Lead Quant           |
| TEAM-06 | CORE-INDICATORS  | Core de indicadores reutilizables           | team06/       | Lead Data            |
| TEAM-07 | ANALYSIS-TECH    | Motor de analisis tecnico                   | team07/       | Lead Data            |
| TEAM-08 | ANALYSIS-FUND    | Motor de analisis fundamental               | team08/       | Lead Data            |

## 2) Registro de Integrantes por Equipo

Recomendacion profesional: registrar alias + usuario Git de cada integrante es obligatorio. Nombre real es opcional para administracion academica.

Campos obligatorios por integrante:
- alias_personal
- github_user
- rol_tecnico (frontend, backend, qa, data, lead)

Campos opcionales:
- nombre_completo
- correo

Plantilla por equipo:

| Team ID | alias_personal | github_user | rol_tecnico | nombre_completo (opcional) |
| ------- | -------------- | ----------- | ----------- | -------------------------- |
| TEAM-XX | dev-alias-01   | user01      | lead        |                            |
| TEAM-XX | dev-alias-02   | user02      | backend     |                            |
| TEAM-XX | dev-alias-03   | user03      | frontend    |                            |
| TEAM-XX | dev-alias-04   | user04      | qa          |                            |
| TEAM-XX | dev-alias-05   | user05      | data        |                            |

## 3) Asignacion Completa de Tareas T001-T058

Cobertura obligatoria de todas las tareas del proyecto (sin huecos).

### TEAM-01 (CRUD-X)
- T001, T003, T005, T006, T007, T008, T012, T013, T015, T016
- T026, T027, T031, T032, T033, T036
- T044, T046, T056

### TEAM-02 (CF-DASH)
- T002, T004
- T017, T020, T021, T022, T023, T024, T025, T034, T035
- T041, T042
- T047, T048, T057

### TEAM-03 (STRAT-WHEEL)
- T018, T019
- T028
- T049, T050

### TEAM-04 (STRAT-STRADDLE)
- T029
- T053

### TEAM-05 (STRAT-IRONCONDOR)
- T030
- T054

### TEAM-06 (CORE-INDICATORS)
- T009, T010, T011, T014
- T045

### TEAM-07 (ANALYSIS-TECH)
- T037, T039, T043
- T051, T052

### TEAM-08 (ANALYSIS-FUND)
- T038, T040
- T055, T058

Nota: Los scopes de estrategias (Wheel, Straddle, Iron Condor) estan preparados como streams de expansion. Las tareas actuales asignadas mantienen cobertura total del backlog vigente T001-T058; T034 y T035 quedan en TEAM-02 para conservar ownership frontend de US2.

## 4) Flujo Profesional por Equipo con SpecKit

Cada equipo trabaja en su maquina local, pero sigue el mismo flujo:

Pre-condicion obligatoria (Diana):

1. Ejecutar `/diana.integrate action="bootstrap"`
2. Ejecutar `/diana.tasks action="generate"`
3. Ejecutar `/diana.teams action="generate"`
4. Validar `team-roster.md`
5. Validar `team-task-allocation.md` con cobertura total de T001-T058
6. Validar `team-agent-bootstrap.md` para la fase activa
7. Ejecutar `/diana.integrate action="generate" engine="speckit" stage="implement"`
8. Validar `speckit-handoff.md`

1. Crear rama del equipo:
   - /speckit.git.feature
   - Convencion: teamXX/<feature-slug>
2. Definir o ajustar alcance:
   - /speckit.specify
3. Plan tecnico y contratos:
   - /speckit.plan
4. Descomponer tareas:
   - /speckit.tasks
5. Implementar lote asignado:
   - /speckit.implement
6. Analizar consistencia y calidad:
   - /speckit.analyze
7. Commit del equipo:
   - /speckit.git.commit
8. PR a rama de integracion (no directo a main).

## 5) Momento Exacto donde Entran Agentes, Skills y Knowledge Diana

### Entrada de Agentes SpecKit
- Entran desde /speckit.specify y continúan en /speckit.plan, /speckit.tasks, /speckit.implement.

### Entrada de Skills y Knowledge Diana
- Deben cargarse antes de /speckit.specify, /speckit.plan y /speckit.tasks.
- Referencia normativa: [.github/instructions/speckit-knowledge-enrichment.instructions.md](../../.github/instructions/speckit-knowledge-enrichment.instructions.md)

### Orden operativo recomendado (obligatorio por equipo)
1. Confirmar radar y manifiestos de skills:
   - .drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml
   - .drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/skills-manifest.yaml
2. Cargar skills requeridas para la etapa activa (specify/plan/tasks).
3. Cargar knowledge de iniciativa/proyecto relevante al scope del equipo.
4. Ejecutar comando Speckit de la etapa.

## 6) Reglas de Integracion entre Equipos

- Regla 1: Contract-first. Si cambia contrato, el PR de contrato se aprueba antes de implementar consumidores.
- Regla 2: Un equipo no modifica archivos fuera de su lote sin acuerdo de lead + PR etiquetado cross-team.
- Regla 3: PR minimo por equipo debe incluir:
  - evidencia de lint
  - evidencia de pruebas del lote
  - evidencia de trazabilidad a IDs de tarea
- Regla 4: Integracion semanal con ventana fija y checklist de regresion.

## 7) Convenciones de Trazabilidad

- Etiquetas en commits: [TEAM-XX], [TASK-T0XX]
- Etiquetas en PR: team:TEAM-XX, task:T0XX, stream:US1|US2|US3|Cross
- En descripcion de PR incluir:
  - tareas cubiertas
  - contratos tocados
  - riesgos de integracion

## 8) Gate de Calidad por Equipo

Antes de abrir PR:

1. npm run lint
2. npm test
3. Validacion funcional del lote (manual o automatizada)
4. Verificar que no se rompieron contratos compartidos

## 9) Cadencia Recomendada para 8 Equipos

- Daily por equipo: 15 min
- Sync de leads cross-team: 20 min diario
- Review de contratos: 2 veces por semana
- Integracion de rama comun: 2 veces por semana
- Demo de avance: semanal

## 10) Reconciliacion de Estado de Tareas (manual controlada)

Adicional al disparador automatico, se habilita reconciliacion manual al cierre de sprint o cuando haya desalineacion.

Comando recomendado:

- `/diana.sync action="tasks" mode="dry-run"`
- `/diana.sync action="tasks" mode="apply"`

Reglas:
- IDs canónicos Diana (`T0XX`) son obligatorios para cerrar global.
- Primero se actualizan slices; luego se recalcula global.
- Si falta mapeo canónico, la tarea global no se cierra hasta resolver conflicto.
