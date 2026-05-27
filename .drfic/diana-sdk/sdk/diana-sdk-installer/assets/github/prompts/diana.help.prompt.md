---
agent: diana.help
description: Centro de ayuda para sintaxis de comandos Diana, flujo SDD y tutorial operativo por etapas.
---

# /diana.help - Centro de Ayuda Diana

## Uso

/diana.help
/diana.help topic="commands"
/diana.help topic="sdd"
/diana.help topic="sync"
/diana.help topic="new-project"
/diana.help topic="troubleshoot"

## Argumentos

| Argumento | Valores | Default | Descripcion |
|-----------|---------|---------|-------------|
| topic | commands \| sdd \| sync \| new-project \| troubleshoot \| all | all | Seccion de ayuda a mostrar |
| mode | quick \| detailed | quick | Nivel de detalle |
| topology | single_dev \| multi_team | multi_team | Adapta el flujo recomendado |

## Objetivo

Entregar ayuda accionable y consistente para:
1. Sintaxis de comandos Diana.
2. Ciclo SDD completo con orden recomendado.
3. Flujo de sincronizacion Speckit -> Diana.
4. Tutorial rapido por escenarios (proyecto nuevo, evolucion, bugfix).

## Reglas de Respuesta

1. Priorizar comandos listos para ejecutar.
2. Si `topic=sdd`, mostrar pipeline end-to-end con checkpoints.
3. Si `topic=sync`, incluir dry-run y apply, y aclarar cierre canonico global.
4. Si `mode=detailed`, incluir ejemplos por topologia.

## Catalogo Base de Comandos Diana

- /diana.new
- /diana.change
- /diana.ticket
- /diana.integrate
- /diana.constitution
- /diana.skills
- /diana.knowledge
- /diana.specify
- /diana.plan
- /diana.tasks
- /diana.teams
- /diana.sync

## Tutorial SDD Recomendado

### Multi-team

1. /diana.new
2. /diana.change
3. /diana.integrate action="bootstrap"
4. /diana.constitution
5. /diana.teams
6. /diana.specify
7. /diana.plan
8. /diana.tasks
9. /speckit.implement
10. /diana.sync action="tasks" mode="dry-run"
11. /diana.sync action="tasks" mode="apply"

### Single-dev

1. /diana.new
2. /diana.change
3. /diana.integrate action="bootstrap" topology="single_dev"
4. /diana.constitution
5. /diana.specify
6. /diana.plan
7. /diana.tasks
8. /speckit.implement
9. /diana.sync (opcional)

## Tutorial de Sync (Speckit -> Diana TEAM)

1. Mantener mapeo explicito en `teams/TEAM-XX/tasks.md`:
   - Speckit T046 -> Diana T027, T033
2. Ejecutar dry-run:
   - pwsh .drfic/diana-sdk/sdk/diana/scripts/powershell/diana-sync-team.ps1 -Team TEAM-01 -Feature 002-team-01-dashboard-brokers -Mode dry-run
3. Resolver conflictos/unmapped si aplica.
4. Ejecutar apply:
   - pwsh .drfic/diana-sdk/sdk/diana/scripts/powershell/diana-sync-team.ps1 -Team TEAM-01 -Feature 002-team-01-dashboard-brokers -Mode apply

Regla:
- Speckit puede ampliar tareas; no se eliminan.
- El cierre global permanece canonico por IDs Diana existentes.
