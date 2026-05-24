---
agent: diana.new
description: Inicializa un nuevo proyecto Diana dentro de projects, normaliza prefijo diana-<project>, valida que no exista, crea estructura base y registra el proyecto en projects-knowledge-radar.
---

# /diana.new - Inicializador de Proyecto Diana

## Uso

/diana.new project="inversions"
/diana.new project="diana-inversions"
/diana.new project="market-lab" initiative="001-market-lab"
/diana.new project="risk-engine" alias="rsk"

## Argumentos

| Argumento | Valores | Default | Descripcion |
|-----------|---------|---------|-------------|
| action | create | validate | create | `create` inicializa estructura; `validate` revisa estructura esperada |
| project | string | requerido | Nombre del proyecto. Se normaliza a `diana-<project>` |
| initiative | string | `001-<project-sin-prefijo>` | Iniciativa inicial a crear |
| alias | string corto lowercase | auto | Alias corto para archivos canonicos (`inv`, `rsk`, etc.) |
| force | true | false | false | Si `true`, permite completar faltantes sin sobrescribir archivos existentes |

## Objetivo

Crear la estructura base canonica de un proyecto nuevo dentro de:
- `.drfic/diana-sdk/projects/diana-<project>/`

con validacion de no colision y registro automatico en:
- `.drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml`

## Reglas Canonicas

1. Normalizacion de id de proyecto:
- Si `project` no inicia con `diana-`, anteponer `diana-`.
- Si ya inicia con `diana-`, conservarlo.

2. Validacion de existencia (obligatoria):
- Si existe carpeta `.drfic/diana-sdk/projects/diana-<project>/`, detener con error.
- Si existe `id` en `projects-knowledge-radar.yaml`, detener con error.
- No crear duplicados.

3. Alias corto (`alias`) para archivos:
- Si se pasa `alias`, usarlo.
- Si no se pasa, autoderivar desde `<project-sin-prefijo>`:
  - tomar primeras 3 letras alfanumericas en minuscula.
  - si hay menos de 3, completar con `x`.
- El alias final resuelto MUST persistirse en `projects-knowledge-radar.yaml` para reutilizarse por default en acciones Diana posteriores.

4. Principio de no sobrescritura:
- En `action=create`, no sobrescribir archivos existentes.
- En `force=true`, solo completar faltantes.

## Estructura Base Obligatoria

Crear SOLO carpetas y archivos estructurales minimos:

- `.drfic/diana-sdk/projects/diana-<project>/README.md` (titulo y descripcion del proyecto)

- `.drfic/diana-sdk/projects/diana-<project>/governance/decision-log.md` (vacio)
- `.drfic/diana-sdk/projects/diana-<project>/governance/change-requests/.gitkeep`
- `.drfic/diana-sdk/projects/diana-<project>/governance/tickets/.gitkeep`

- `.drfic/diana-sdk/projects/diana-<project>/initiatives/<initiative>/.gitkeep`

- `.drfic/diana-sdk/projects/diana-<project>/knowledge/README.md` (indice basico)
- `.drfic/diana-sdk/projects/diana-<project>/knowledge/indexes/.gitkeep`

- `.drfic/diana-sdk/projects/diana-<project>/knowledge/skills/README.md` (vacio)
- `.drfic/diana-sdk/projects/diana-<project>/knowledge/local/.gitkeep`
- `.drfic/diana-sdk/projects/diana-<project>/knowledge/remote/sources.md` (vacio)
- `.drfic/diana-sdk/projects/diana-<project>/knowledge/snapshots/.gitkeep`

## Registro en Radar (obligatorio)

Actualizar `projects-knowledge-radar.yaml` agregando entrada:

- `id: diana-<project>`
- `alias: <alias-resuelto>`
- `enabled: true`
- `knowledge_index: null` (sera poblado por /diana.knowledge)
- `skills_manifest: null` (sera poblado por /diana.skills)
- `agent_skill_matrix: null` (sera poblado por /diana.skills)
- `sdd_engine_matrix: null` (sera poblado por /diana.skills)

## Nota sobre Archivos Canonicos

Los archivos canonicos se crean con acciones especificas despues de bootstrap:
- `<alias>-constitution.md` -> `/diana.constitution`
- `./governance/change-requests/NNN-<alias>-ucc.md` -> `/diana.change`
- `./governance/tickets/NNN-<alias>-tkt.md` -> `/diana.change` o `/diana.ticket`
- `./initiatives/<initiative>/001-<alias>-spec.md` -> `/diana.constitution` o `/speckit.specify`
- `./initiatives/<initiative>/001-<alias>-plan.md` -> `/diana.plan` o `/speckit.plan`
- `./initiatives/<initiative>/meta.md` -> usuario crea con extension
- `./knowledge/indexes/*.yaml` -> `/diana.skills` y `/diana.knowledge`

## Action=create

- Resolver id final de proyecto (`diana-<project>`).
- Resolver alias final (`alias` explicito o autoderivado).
- Validar inexistencia en carpeta y radar.
- Crear estructura base y archivos minimos.
- Registrar proyecto en radar incluyendo `alias` persistido.
- Reportar rutas creadas y comandos siguientes.

## Action=validate

Verificar:
- Estructura base completa.
- Presencia de archivos estructurales minimos (README/.gitkeep).
- Entrada correcta en radar.
- Coherencia entre `id` y rutas.

Devolver:
- `OK: [n]`
- `GAPS: [n]`
- Acciones sugeridas.

## Hooks de Extension

Antes de inicializar, revisar `.specify/extensions.yml` en `hooks.before_new`.
Despues de inicializar, revisar `.specify/extensions.yml` en `hooks.after_new`.
Manejar `optional` y `enabled` igual que otras acciones Diana/Speckit.

## Integracion Recomendada

Flujo sugerido para proyecto nuevo:
1. `/diana.new project="<project>"`
2. `/diana.change project="diana-<project>" title="<cambio-inicial>" description="<contexto>"`
3. `/diana.constitution project="diana-<project>"`
4. `/diana.skills action="generate" scope="project" project="diana-<project>"`
5. `/diana.knowledge scope="project" project="diana-<project>"`
6. `/diana.plan action="generate" scope="project" project="diana-<project>"`
