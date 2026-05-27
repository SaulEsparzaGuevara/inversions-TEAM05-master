# Command Routing Guide — Diana + Speckit

## Objetivo

Definir como indicar proyecto objetivo y capa de conocimiento al ejecutar comandos de Diana y Speckit.

## Regla base de enrutamiento

1. Seleccionar `project` desde:
   - `.drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml`
2. Mantener siempre en radar:
   - `projects/knowledge` (general cross-project)
   - `projects/<project>/knowledge` (particular del proyecto)
3. Opcional:
   - `sdk/diana/knowledge` (metodologia compartida)

## Comandos Diana

### 1) Skills por proyecto

```text
/diana.skills action="generate" scope="project" project="diana-inversions" layer="both"
/diana.skills action="validate" scope="project" project="diana-inversions"
```

Default recomendado (sin layer):

```text
/diana.skills action="generate" scope="project" project="diana-inversions"
```

Comportamiento default: `layer="both"`.

### 2) Knowledge general (cross-project)

```text
/diana.knowledge topic="risk-taxonomy" scope="project" project="diana-inversions" layer="general" type="local"
```

### 3) Knowledge particular del proyecto

```text
/diana.knowledge topic="ibkr-tws-api" scope="project" project="diana-inversions" layer="project" type="local"
```

### 3.1) Knowledge por default en ambas capas y ambos tipos

```text
/diana.knowledge topic="order-lifecycle" scope="project" project="diana-inversions"
```

Comportamiento default: `layer="both"` y `type="both"`.

### 3.2) Knowledge en lote sin topic

```text
/diana.knowledge scope="project" project="diana-inversions"
```

Comportamiento default: `topic="all"`.

Fuentes para resolver "todos los tópicos":
1. Baseline obligatorio definido en `.github/prompts/diana.knowledge.prompt.md` (Fase 0).
2. Mapeo de skills en `.drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/skills-manifest.yaml`.
3. Verificación de cobertura en índices maestros para evitar duplicados.

### 4) Knowledge de metodologia SDK

```text
/diana.knowledge topic="sdd-lifecycle" scope="sdk" type="local"
```

### 5) Plan tecnico Diana (previo a Speckit)

```text
/diana.plan action="generate" scope="project" project="diana-inversions"
/diana.plan action="validate" scope="project" project="diana-inversions"
/diana.plan action="regenerate" scope="project" project="diana-inversions"
```

### 6) Tareas canonicas Diana (despues de plan)

```text
/diana.tasks action="generate" scope="project" project="diana-inversions" initiative="001-inversions"
/diana.tasks action="validate" scope="project" project="diana-inversions" initiative="001-inversions"
/diana.tasks action="regenerate" scope="project" project="diana-inversions" initiative="001-inversions"
```

Nota recomendada:
- Ejecutar `/diana.tasks` antes de `/speckit.tasks` para que el backlog operativo derive del backlog canónico de Diana.

### 7) Coordinacion multi-equipo Diana (despues de tasks)

```text
/diana.teams action="generate" scope="project" project="diana-inversions" initiative="001-inversions"
/diana.teams action="validate" scope="project" project="diana-inversions" initiative="001-inversions"
```

Nota recomendada:
- Ejecutar `/diana.teams` despues de `/diana.tasks` y antes de `/speckit.implement` cuando haya ejecucion distribuida por equipos.

### 8) Handoff Diana hacia engine SDD

```text
/diana.integrate action="bootstrap" scope="project" project="diana-inversions" initiative="001-inversions" engine="speckit" orchestration="manual" topology="multi_team"
/diana.integrate action="generate" scope="project" project="diana-inversions" initiative="001-inversions" engine="speckit" stage="implement"
/diana.integrate action="validate" scope="project" project="diana-inversions" initiative="001-inversions" engine="speckit" stage="implement"
```

Notas recomendadas:
- Ejecutar `/diana.integrate action="bootstrap"` en Fase 0 del ciclo (despues de `/diana.change` y antes de `/diana.constitution`).
- Ejecutar `/diana.integrate action="generate"` despues de `/diana.tasks`.
- Si hay ejecucion multi-equipo, ejecutar `/diana.teams` antes de `/diana.integrate`.
- El engine objetivo consume el handoff generado, no reinterpreta el canon Diana.

### 9) Sincronizacion manual de tareas Diana <-> SpecKit

```text
/diana.sync action="tasks" mode="dry-run" scope="project" project="diana-inversions" initiative="001-inversions"
/diana.sync action="tasks" mode="apply" scope="project" project="diana-inversions" initiative="001-inversions"
```

Notas recomendadas:
- Usar `dry-run` antes de `apply` para detectar conflictos de mapeo.
- `apply` actualiza primero slices y luego el backlog global canónico.
- Mantener IDs Diana (`T0XX`) como llave de sincronizacion obligatoria.

## Comandos Speckit

> Speckit corre sobre la iniciativa activa del repo/branch. Para controlar proyecto/iniciativa usa el input de ruta de iniciativa cuando aplique.

### 1) Specify

```text
/speckit.specify --input .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/
```

### 2) Clarify

```text
/speckit.clarify
```

### 3) Plan

```text
/speckit.plan
```

Nota recomendada:
- Ejecutar `/diana.plan action="generate" ...` antes de `/speckit.plan` para prealinear plan con constitucion, specs, skills y knowledge.

### 4) Tasks

```text
/speckit.tasks
```

## Como decidir entre knowledge general vs particular

Usa `layer="general"` cuando el conocimiento:
- Es reusable por 2+ proyectos.
- No depende de reglas de un solo dominio/proyecto.
- Sirve como baseline transversal.

Usa `layer="project"` cuando el conocimiento:
- Depende de constitucion/spec del proyecto.
- Tiene restricciones de dominio, compliance o integraciones especificas.
- Solo aplica al flujo de ese proyecto.

## Nota de viabilidad

La capa general en raiz de projects SI es viable y ya esta activa en:
- `.drfic/diana-sdk/projects/knowledge/`
