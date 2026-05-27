# Diana Team Task Allocation Template
## <initiative-or-project-name>

---

## Objetivo

Asignar de forma canónica las tareas del backlog a equipos de trabajo, preservando dependencia, ownership, trazabilidad y compatibilidad con Diana, SpecKit y Git.

---

## Reglas

- Toda tarea debe tener exactamente un equipo owner.
- Si una tarea toca contratos compartidos, marcar `contract_review_required=true`.
- Si dos tareas comparten archivo, no pueden asignarse en paralelo sin acuerdo explícito.
- La cobertura debe ser total para el backlog activo.

---

## Matriz de Asignación

| team_id | team_alias | task_id | stream | priority | blocked_by | contract_review_required | acceptance_note |
| ------- | ---------- | ------- | ------ | -------- | ---------- | ------------------------ | --------------- |
| TEAM-01 |            | T001    | Setup  | High     |            | false                    |                 |
| TEAM-01 |            | T002    | Setup  | High     | T001       | false                    |                 |

---

## Vista por Equipo

### TEAM-01
- alias:
- tasks:
- blocked_by:
- contracts_owned:
- contracts_consumed:

### TEAM-02
- alias:
- tasks:
- blocked_by:
- contracts_owned:
- contracts_consumed:

### TEAM-03
- alias:
- tasks:
- blocked_by:
- contracts_owned:
- contracts_consumed:

### TEAM-04
- alias:
- tasks:
- blocked_by:
- contracts_owned:
- contracts_consumed:

### TEAM-05
- alias:
- tasks:
- blocked_by:
- contracts_owned:
- contracts_consumed:

### TEAM-06
- alias:
- tasks:
- blocked_by:
- contracts_owned:
- contracts_consumed:

### TEAM-07
- alias:
- tasks:
- blocked_by:
- contracts_owned:
- contracts_consumed:

### TEAM-08
- alias:
- tasks:
- blocked_by:
- contracts_owned:
- contracts_consumed:

---

## Estado

Este documento constituye la **Asignación Canónica Equipo-Tarea** para ejecución distribuida.