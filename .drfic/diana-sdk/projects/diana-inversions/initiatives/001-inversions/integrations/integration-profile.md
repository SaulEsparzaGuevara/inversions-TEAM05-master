# Diana Integration Profile
## Plataforma de Inversiones con IA

Identificador: 001-INV-INTEGRATION-PROFILE
Proyecto: diana-inversions
Iniciativa: 001-inversions
Version de perfil: 2026-05-08
Accion: /diana.integrate action="bootstrap" scope="project" project="diana-inversions" initiative="001-inversions" engine="speckit" orchestration="manual" topology="multi_team"

---

## Decisiones Obligatorias de Integracion

1. motor_sdd:
- speckit

2. orquestacion:
- manual

3. topologia_desarrollo:
- multi_team

4. politica_autoridad:
- diana_canon_strict

---

## Politica de Automatizacion por Etapa

- auto_on_constitution: false
- auto_on_specify: false
- auto_on_plan: false
- auto_on_tasks: false
- auto_on_teams: false
- auto_on_implement: false

Regla:
- Si topologia_desarrollo=multi_team, nunca disparar implementacion distribuida hasta completar /diana.teams.
- Si topologia_desarrollo=single_dev, se permite pipeline continuo por etapa.

---

## Politica de Sincronizacion de Tareas

- sync_trigger_automatico:
  - on_merge
- sync_manual_habilitado: true
- comando_manual_recomendado: /diana.sync action="tasks"
- regla_cierre_global: all_slices_completed
- conflicto_sin_mapeo: block_global_close
- extension_policy: mirror_team_without_global_id_creation
- global_close_policy: canonical_ids_only

Regla adicional:
- Las tareas extendidas por Speckit en features de equipo se mantienen en la feature y se sincronizan al backlog TEAM mediante mapeo explícito.
- La sincronizacion nunca crea IDs canónicos globales nuevos durante /diana.sync.

---

## Politica de Derivacion de Features Speckit

- `specs/001-plataforma-inversiones-ia/` se conserva como feature umbrella de la iniciativa.
- La feature umbrella solo debe concentrar alcance fundacional y compartido: Fase 1 a Fase 6, contratos comunes, quickstart, checklists y lineamientos operativos base.
- Las fases por equipo `TEAM-01` a `TEAM-09` no deben agregarse masivamente al `tasks.md` de `specs/001-plataforma-inversiones-ia/`.
- Cuando la topologia sea `multi_team`, cada bloque de equipo debe derivarse a una feature operativa separada bajo `specs/`, manteniendo trazabilidad al backlog canonico Diana.
- La Fase 16 se trata como gate transversal de estandarizacion y sincronizacion entre features de equipo; no debe usarse para reinyectar todo el backlog extendido dentro de la umbrella `001`.

Estructura objetivo de derivacion:
- `specs/001-plataforma-inversiones-ia/` -> umbrella/base compartida
- `specs/002-team-01-dashboard-brokers/`
- `specs/003-team-02-indicadores-chat-ia/`
- `specs/004-team-03-fundamental-opciones-basicas/`
- `specs/005-team-04-estructura-wheel/`
- `specs/006-team-05-institucional-cobertura/`
- `specs/007-team-06-noticias-spreads/`
- `specs/008-team-07-ai-volatility/`
- `specs/009-team-08-estrategias-complejas/`
- `specs/010-team-09-calendar-diagonal/`

Regla:
- Nunca sincronizar `T060-T177` dentro de `specs/001-plataforma-inversiones-ia/tasks.md` mientras la iniciativa permanezca en modo `multi_team`.

---

## Artefactos Diana Relacionados

- constitucion
- spec canonica
- plan canonico
- backlog canonico
- artifacts de teams y slices (si aplica)

---

## Estado

Este perfil gobierna la orquestacion entre Diana y el engine SDD seleccionado durante todo el ciclo de cambio.
