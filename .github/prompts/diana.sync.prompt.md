---
agent: diana.sync
description: Reconciliacion manual de estados de tareas entre features de SpecKit y artefactos Diana (slices + backlog global).
---

# /diana.sync - Reconciliacion de Tareas Diana <-> SpecKit

## Uso

/diana.sync action="tasks" mode="dry-run"
/diana.sync action="tasks" mode="apply"
/diana.sync action="tasks" mode="apply" team="TEAM-02"
/diana.sync action="tasks" mode="dry-run" feature="003-team-dashboard"

## Argumentos

| Argumento | Valores | Default | Descripcion |
|-----------|---------|---------|-------------|
| action | tasks | tasks | Tipo de reconciliacion |
| mode | dry-run | apply | dry-run | Simulacion o aplicacion real |
| scope | project | initiative | project | Nivel de ejecucion |
| project | id en projects-knowledge-radar | diana-inversions | Proyecto objetivo |
| initiative | id de iniciativa | 001-inversions | Iniciativa objetivo |
| team | TEAM-XX | null | Filtra reconciliacion por equipo |
| feature | slug o carpeta specs/* | null | Filtra reconciliacion por feature Speckit |
| since | fecha ISO8601 | null | Reconciliacion incremental desde fecha |
| extension_policy | mirror-team | conflict-on-unmapped | mirror-team | Politica para tareas Speckit extendidas no canonicas |
| global_close_policy | canonical-only | canonical-only | El global solo cierra por IDs canonicos |

## Objetivo

Permitir una accion manual y controlada para actualizar estado de tareas en:

1. Backlog canonico global Diana (`001-*-tasks.md`).
2. Slices por equipo (`speckit/team-task-allocation.md` y derivados).

La reconciliacion se basa en estados observados en features de SpecKit, preservando como autoridad de IDs al canon Diana.

## Reglas Obligatorias

1. Los IDs canonicos (`T001`, `T002`, ...) son la llave de mapeo obligatoria.
2. Si no existe mapeo canonico, no cerrar tarea global y reportar conflicto.
3. En `mode=dry-run` nunca se escriben cambios.
4. En `mode=apply` actualizar primero slices, luego recalcular global.
5. El cierre de una tarea global agregada requiere todas sus subtareas/slices completadas.

## Regla de Espejo Speckit -> TEAM (obligatoria)

1. Speckit puede optimizar/ampliar y crear tareas adicionales en `specs/*/tasks.md`; esas tareas NO deben eliminarse.
2. Las tareas extendidas se reflejan en el team mediante mapeo explicito `Speckit Txxx -> Diana Tyyy[, Tzzz]` en `teams/TEAM-XX/tasks.md`.
3. El estado del team se sincroniza desde Speckit por mapeo (many-to-one y one-to-many permitidos).
4. El backlog global solo considera IDs canonicos existentes (`T000-T177` o el rango vigente del canon); nunca se crean IDs canonicos nuevos por sync.
5. Si una tarea Speckit no tiene mapeo y `extension_policy=mirror-team`, se reporta en `unmapped` sin bloquear la feature; si `extension_policy=conflict-on-unmapped`, se reporta conflicto bloqueante.

## Ejecucion Operativa Recomendada (local)

Para sincronizar estado Speckit -> TEAM de forma reproducible:

1. Dry-run

`pwsh scripts/diana-sync-team.ps1 -Team TEAM-01 -Feature 002-team-01-dashboard-brokers -Mode dry-run`

2. Apply

`pwsh scripts/diana-sync-team.ps1 -Team TEAM-01 -Feature 002-team-01-dashboard-brokers -Mode apply`

Notas:
- El script aplica cierre de checkboxes en team tasks solo cuando todas las tareas Speckit mapeadas al ID canonico estan en `[x]`.
- El script no elimina tareas Speckit extendidas.

## Fuentes Oficiales Obligatorias

1. `.drfic/diana-sdk/projects/<project>/initiatives/<initiative>/001-inv-tasks.md`
2. `.drfic/diana-sdk/projects/<project>/initiatives/<initiative>/speckit/team-task-allocation.md`
3. `specs/*/tasks.md` (features Speckit de equipos)
4. `.drfic/diana-sdk/projects/<project>/initiatives/<initiative>/integrations/integration-profile.md`

## Salidas Obligatorias

1. Resumen de reconciliacion con:
   - tareas sincronizadas
   - tareas pendientes
   - conflictos de mapeo
2. En `mode=apply`, actualizacion de estado en backlog global y slices.

## Flujo Recomendado

1. Ejecutar `/diana.sync action="tasks" mode="dry-run"`.
2. Revisar conflictos y mapeos faltantes.
3. Ejecutar `/diana.sync action="tasks" mode="apply"`.
4. Confirmar que Diana global/slices quedaron alineados con features de SpecKit.
