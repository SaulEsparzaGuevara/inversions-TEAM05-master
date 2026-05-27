# Diana Engine Handoff
## Plataforma de Inversiones con IA

Identificador: 001-INV-HANDOFF-SPECKIT
Proyecto: DIANA Inversions
Iniciativa: 001-inversions
Engine objetivo: speckit
Stage objetivo: implement
Version de generacion: 2026-05-04
Accion: /diana.integrate action="generate" scope="project" project="diana-inversions" initiative="001-inversions" engine="speckit" stage="implement"

---

## Autoridad

Este handoff está subordinado a:
1. .drfic/diana-sdk/projects/diana-inversions/inv-constitution.md
2. .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-spec.md
3. .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-plan.md
4. .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-tasks.md

Ante conflicto, prevalece el canon Diana.

---

## Objetivo

Definir exactamente qué debe consumir Speckit para ejecutar implementación sin reinterpretar el canon Diana.

---

## Engine y Stage Objetivo

- engine: speckit
- stage: implement
- etapa_equivalente_en_sdd_engine_matrix: engines.speckit.implement
- required_skills:
  - 008-inv-market-data-and-realtime
  - 010-inv-broker-integration-ibkr-alpaca
  - 011-inv-portfolio-and-performance-analytics
  - 012-inv-compliance-audit-retention

---

## Artefactos Diana de Entrada Obligatoria

- .drfic/diana-sdk/projects/diana-inversions/inv-constitution.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-spec.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-plan.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-tasks.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/speckit/team-roster.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/speckit/team-task-allocation.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/speckit/team-agent-bootstrap.md
- .drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/skills-manifest.yaml
- .drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/agent-skill-matrix.yaml
- .drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/sdd-engine-matrix.yaml
- specs/001-plataforma-inversiones-ia/tasks.md como backlog operativo derivado base/umbrella

---

## Orden de Ejecución Recomendado

### Pipeline Single-Person

1. /diana.teams action="topology" → registrar topology=single_person en meta.md
2. /diana.skills action="validate"
3. /diana.knowledge
4. /diana.specify → genera 001-inv-spec.md
5. /diana.plan → genera 001-inv-plan.md
6. /diana.tasks → genera 001-inv-tasks.md
7. /diana.integrate generate engine="speckit" stage="implement"
8. speckit.specify → speckit.plan → speckit.tasks → speckit.implement (lee artefactos Diana)

### Pipeline Multi-Team (topologia activa)

1. /diana.teams action="topology" → registrar topology=multi_team + crear scope_primario.md
2. /diana.skills action="validate"
3. /diana.knowledge
4. /diana.specify → lee scope_primario.md + 001-inv-spec.md → genera teams/TEAM-XX/spec.md por equipo
5. /diana.plan → lee teams/TEAM-XX/spec.md + 001-inv-plan.md → genera teams/TEAM-XX/plan.md por equipo
6. /diana.tasks → lee teams/TEAM-XX/plan.md + 001-inv-tasks.md → genera teams/TEAM-XX/tasks.md por equipo
7. /diana.teams action="generate" → roster + team-task-allocation + team-agent-bootstrap
8. /diana.integrate action="all" engine="speckit" → Por cada equipo:
   - speckit.specify (lee teams/TEAM-XX/spec.md como base)
   - speckit.plan (lee teams/TEAM-XX/plan.md como base)
   - speckit.tasks (lee teams/TEAM-XX/tasks.md como base)
   - speckit.implement (ejecuta sobre specs/<feature-slug>/)

**Regla critica**: Speckit lee los artefactos canonicos de Diana en teams/TEAM-XX/ como INPUT BASE y los optimiza/complementa con su logica SDD. Nunca los ignora ni los reemplaza sin trazabilidad.

**Artefactos protegidos (NO modificar)**: 001-inv-spec.md, 001-inv-plan.md, 001-inv-tasks.md, inv-constitution.md

---

## Reglas de Consumo por Engine

- Speckit puede estructurar y ejecutar el backlog operativo derivado.
- Speckit no puede redefinir constitución, spec canónica, plan canónico ni backlog canónico.
- Si detecta contradicción o ambigüedad, debe detenerse y pedir intervención humana o de Diana.
- En implementación distribuida, Speckit debe respetar ownership y límites definidos por team-task-allocation.md.
- Speckit no debe expandir `specs/001-plataforma-inversiones-ia/tasks.md` con `T060-T177` cuando la topología activa sea `multi_team`.

---

## Politica de Particion de Features

Regla de particion:
- `specs/001-plataforma-inversiones-ia/` es umbrella de iniciativa y base compartida.
- `T000-T059` pueden seguir representados en la umbrella `001` por corresponder a setup, foundation, historias base y cierres compartidos.
- `T060-T169` deben vivir en features separadas por equipo para evitar mezclar slices operativas dentro de la umbrella.
- `T170-T177` se gestionan como gate transversal posterior a las features de equipo, sin convertir la umbrella `001` en backlog total de toda la iniciativa.

Estructura objetivo de features derivadas por equipo:
- `specs/002-team-01-dashboard-brokers/` -> T060-T068
- `specs/003-team-02-indicadores-chat-ia/` -> T069-T076
- `specs/004-team-03-fundamental-opciones-basicas/` -> T077-T090
- `specs/005-team-04-estructura-wheel/` -> T091-T105
- `specs/006-team-05-institucional-cobertura/` -> T106-T121
- `specs/007-team-06-noticias-spreads/` -> T122-T136
- `specs/008-team-07-ai-volatility/` -> T137-T152
- `specs/009-team-08-estrategias-complejas/` -> T153-T161
- `specs/010-team-09-calendar-diagonal/` -> T162-T169

Restricciones operativas:
- Ninguna feature derivada de equipo debe reescribir la autoridad de `001-inv-spec.md`, `001-inv-plan.md` o `001-inv-tasks.md`.
- Los contratos compartidos siguen referenciandose desde la umbrella `001` hasta que exista una decision canonica de particion de contratos.
- La creacion de estas features es posterior; este handoff solo fija la politica para que no se vuelque el backlog multi-team dentro de `001`.

---

## Multi-equipo

- requiere_diana_teams: true
- archivos_de_equipo_obligatorios:
  - team-roster.md
  - team-task-allocation.md
  - team-agent-bootstrap.md
- política_de_ownership:
  - cada task_id tiene un solo equipo owner
  - contratos compartidos requieren contract-first review
  - ningún equipo implementa fuera de su lote sin autorización explícita

---

## Ready / Gaps

- ready_status: READY_FOR_SPECKIT_IMPLEMENT
- gaps:
  - no existe aún validación automática de drift entre canon Diana, handoff y backlog operativo
- acciones_recomendadas:
  - agregar validador de congruencia Diana <-> engine
  - usar este handoff como archivo de entrada de gobernanza antes de cada /speckit.implement

---

## Estado

Este documento constituye el Handoff Oficial entre Diana y Speckit para la iniciativa 001-inversions.
