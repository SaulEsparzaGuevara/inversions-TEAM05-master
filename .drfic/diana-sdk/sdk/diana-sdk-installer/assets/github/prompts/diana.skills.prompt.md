---
agent: diana.skills
description: Genera o sincroniza skills canónicas del proyecto Diana a partir de control de cambios, ticket, constitución y especificaciones. Úsalo antes de /diana.knowledge para asegurar cobertura completa.
---

# /diana.skills — Generador de Skills Canónicas Diana

## Uso

/diana.skills action="generate"
/diana.skills action="validate"
/diana.skills action="regenerate"

Opcional recomendado para multi-proyecto:

/diana.skills action="generate" scope="project" project="diana-inversions" layer="both"

## Argumentos

| Argumento | Valores | Default | Descripción |
|-----------|---------|---------|-------------|
| action | generate | validate | regenerate | generate | Operación sobre skills |
| scope | project | initiative | sdk | project | Nivel de generación |
| project | id de proyecto en projects-knowledge-radar | diana-inversions | Proyecto objetivo para enrutar fuentes y salidas |
| layer | general | project | both | both | `project` genera skills del proyecto activo; `general` genera skills reutilizables en `projects/knowledge`; `both` hace ambos |

## Comportamiento por default (si omites argumentos)

- Si omites `scope`, se usa `scope="project"`.
- Si omites `project`, se usa `project="diana-inversions"`.
- Si omites `layer`, se usa `layer="both"`.
- Resultado por default: generación de skills específicas de proyecto + habilidades reutilizables de capa general.

## Objetivo

Crear una capa intermedia de habilidades (skills) derivadas de fuentes oficiales, que luego guíe la generación de conocimiento profundo y el consumo por agentes Diana/Speckit.

## Fuentes Oficiales Obligatorias

Para scope=project, resolver primero `project` desde:
- `.drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml`

Luego leer fuentes del proyecto objetivo en este orden (ejemplo diana-inversions):
1. .drfic/diana-sdk/projects/<project>/inv-constitution.md
2. .drfic/diana-sdk/projects/<project>/initiatives/001-inversions/001-inv-spec.md
3. specs/001-plataforma-inversiones-ia/spec.md
4. .drfic/diana-sdk/projects/<project>/governance/change-requests/001-inv-ucc.md
5. .drfic/diana-sdk/projects/<project>/governance/tickets/001-inv-tkt.md
6. .drfic/diana-sdk/projects/<project>/initiatives/001-inversions/meta.md

## Salidas Obligatorias

1. skills manifest:
   - .drfic/diana-sdk/projects/<project>/knowledge/indexes/skills-manifest.yaml

2. matriz agente-skill:
   - .drfic/diana-sdk/projects/<project>/knowledge/indexes/agent-skill-matrix.yaml

3. skills modulares (1 archivo por skill):
   - .drfic/diana-sdk/projects/<project>/knowledge/skills/

4. matriz de engines SDD:
   - .drfic/diana-sdk/projects/<project>/knowledge/indexes/sdd-engine-matrix.yaml

5. trazabilidad de IDs:
   - .drfic/diana-sdk/projects/<project>/knowledge/indexes/skills-traceability.md

6. skills compartidas SDK (cuando aplique):
   - .drfic/diana-sdk/sdk/diana/knowledge/indexes/shared-skills-manifest.yaml

7. radar cross-project en raiz de projects:
   - .drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml

## Reglas de Generación

1. Toda skill debe trazarse a fuente canónica (source_of_truth).
2. Toda skill debe enlazar knowledge_docs existentes o por crear.
3. Toda etapa Speckit debe definir required_skills mínimas:
   - speckit.specify
   - speckit.clarify
   - speckit.plan
   - speckit.tasks
   - speckit.implement
4. Todo agente Diana debe declarar primary_skills y secondary_skills.
5. Si una skill canónica no existe, crearla.
6. Si una skill existe pero sin knowledge_doc completo, marcar gap y recomendar /diana.knowledge topic="...".
7. Toda skill debe tener `skill_doc` en `knowledge/skills/<NNN>-inv-<skill-name-predictivo-en-minusculas>.md`.
8. Registrar required_skills por engine/etapa para Speckit, OpenSpec y Generic-SDD.
9. Convención obligatoria de IDs de skill: `<NNN>-inv-<skill-name-predictivo-en-minusculas>`.
10. Usar palabras clave completas cuando no hagan el nombre excesivo; evitar abreviaturas opacas.
11. Mantener tabla de trazabilidad cuando cambien IDs (old_id -> new_id).

## Reuso Cross-Proyecto (obligatorio cuando aplique)

Antes de crear skill nueva de proyecto, validar si ya existe skill compartida en SDK:
- `.drfic/diana-sdk/sdk/diana/knowledge/indexes/shared-skills-manifest.yaml`

Y validar tambien en el radar cross-project:
- `.drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml`

Regla de resolución:
1. Cargar skill reusable de `projects/knowledge` cuando exista.
2. Cargar skill compartida del SDK.
3. Extender/override en proyecto solo si hay diferencias de dominio.
4. Evitar duplicar skills de frameworks/metodologías generales por proyecto.

## Action=generate

- Crear o actualizar skills-manifest.yaml.
- Crear o actualizar agent-skill-matrix.yaml.
- Crear o actualizar skill docs modulares en `knowledge/skills/`.
- Crear o actualizar `sdd-engine-matrix.yaml`.
- Sincronizar IDs, nombres, criticality y referencias de fuente.
- Si `layer=general` o `layer=both`, generar o actualizar skills reutilizables en:
   - `.drfic/diana-sdk/projects/knowledge/skills/`
   - y registrar su disponibilidad en `.drfic/diana-sdk/projects/knowledge/indexes/master-index.md`.
- Si `layer=project` o `layer=both`, mantener salidas del proyecto activo en:
   - `.drfic/diana-sdk/projects/<project>/knowledge/indexes/`
   - `.drfic/diana-sdk/projects/<project>/knowledge/skills/`

## Action=validate

Verificar:
- Que cada required_skill de Speckit exista en skills-manifest.
- Que cada required_skill de OpenSpec exista en skills-manifest.
- Que cada required_skill de Generic-SDD exista en skills-manifest.
- Que cada skill tenga al menos un knowledge_doc.
- Que cada skill tenga un skill_doc modular existente.
- Que cada knowledge_doc exista.
- Que no existan skills huérfanas sin agente/etapa usuaria.

Devolver resumen:
- OK: [n]
- GAPS: [n]
- Lista de acciones recomendadas.

## Action=regenerate

- Releer todas las fuentes oficiales.
- Recalcular skills desde cero.
- Reescribir skills-manifest.yaml, agent-skill-matrix.yaml y sdd-engine-matrix.yaml manteniendo compatibilidad con IDs existentes cuando sea posible.
- Regenerar skill docs modulares en `knowledge/skills/`.

## Integración con /diana.knowledge

Flujo recomendado:
1. /diana.skills action="generate"
2. /diana.knowledge topic="..." scope="project" type="local"
3. /diana.plan action="generate" scope="project"
4. /speckit.plan

/diana.knowledge debe usar skills-manifest.yaml y agent-skill-matrix.yaml como entrada obligatoria de contexto antes de investigación profunda.
