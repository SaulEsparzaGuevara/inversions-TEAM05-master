# Diana Integration Profile Template
## <nombre-de-la-iniciativa>

Identificador: <NNN-INV-INTEGRATION-PROFILE>
Proyecto:
Iniciativa:
Version de perfil:
Accion: /diana.integrate action="bootstrap"

---

## Decisiones Obligatorias de Integracion

1. motor_sdd:
- diana_only
- speckit
- openspec
- hybrid

2. orquestacion:
- manual
- automatic

3. topologia_desarrollo:
- single_dev
- multi_team

4. politica_autoridad:
- diana_canon_strict

---

## Politica de Automatizacion por Etapa

- auto_on_constitution:
- auto_on_specify:
- auto_on_plan:
- auto_on_tasks:
- auto_on_teams:
- auto_on_implement:

Regla:
- Si topologia_desarrollo=multi_team, nunca disparar implementacion distribuida hasta completar /diana.teams.
- Si topologia_desarrollo=single_dev, se permite pipeline continuo por etapa.

---

## Politica de Sincronizacion de Tareas

- sync_trigger_automatico:
  - on_merge
  - scheduled
  - disabled
- sync_manual_habilitado: true
- comando_manual_recomendado: /diana.sync action="tasks"
- regla_cierre_global: all_slices_completed
- conflicto_sin_mapeo: block_global_close

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