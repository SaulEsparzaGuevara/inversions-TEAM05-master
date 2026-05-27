---
applyTo: "specs/**"
---

# Speckit Knowledge Enrichment — Diana SDK

## Instrucción para Speckit

Antes de ejecutar generación en `/speckit.specify`, clarificación en `/speckit.clarify`, planificación en `/speckit.plan` y descomposición en `/speckit.tasks`, enriquece tu contexto con el conocimiento profundo de Diana siguiendo este protocolo:

### Paso 0: Skills y Mapeo de Agentes (obligatorio)

Leer primero:
1. `.drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml` (obligatorio)
2. `.drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/skills-manifest.yaml` (obligatorio)
3. `.drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/agent-skill-matrix.yaml`
4. `.drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/sdd-engine-matrix.yaml`
5. `.drfic/diana-sdk/sdk/diana/knowledge/indexes/shared-skills-manifest.yaml` (si existe)

Aplicar la lista de `required_skills` para la etapa activa (`speckit.specify`, `speckit.clarify`, `speckit.plan`, `speckit.tasks`).

Luego, para cada skill requerida, cargar su `skill_doc` modular en:
`.drfic/diana-sdk/projects/diana-inversions/knowledge/skills/`

Radar obligatorio permanente por etapa:
- Fuente 1: `projects/knowledge` (cross-project)
- Fuente 2: `projects/diana-inversions/knowledge` (proyecto activo)

Si la skill requerida existe como skill reusable cross-project o SDK, cargar primero reusable y luego aplicar override de proyecto (si existe).

Si falta una skill requerida o su documento de knowledge no esta completo:
- Continuar con metodologia estandar (fallback)
- Reportar explicitamente el gap
- Recomendar comando `/diana.knowledge` puntual para cerrar la brecha

## Prioridad de conocimiento por fase

### En `/speckit.specify`

Objetivo: producir una especificación inicial más precisa, con terminología de dominio correcta y menos ambigüedad desde el arranque.

1. Cargar primero knowledge de iniciativa (si existe)
2. Cargar después knowledge de proyecto (dominio)
3. Cargar al final knowledge SDK (metodología base)

Si falta conocimiento local, continuar la especificación con metodología estándar y razonamiento propio.

### En `/speckit.clarify`

Objetivo: hacer preguntas de alta calidad y específicas del dominio (por ejemplo inversiones).

1. Cargar primero knowledge de iniciativa (si existe)
2. Cargar después knowledge de proyecto (dominio)
3. Cargar al final knowledge SDK (metodología base)

Si falta conocimiento local, continuar la clarificación con metodología estándar y razonamiento propio.

### En `/speckit.plan`

Objetivo: enriquecer arquitectura y decisiones técnicas con contexto profundo.

1. Cargar primero knowledge de iniciativa (si existe)
2. Cargar después knowledge de proyecto (dominio)
3. Cargar al final knowledge SDK (metodología base)

### Paso 1: Leer el Knowledge Index de la Iniciativa

Si existe `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/knowledge/index.md`, leerlo primero.
Identifica los documentos marcados como 🔴 Crítico para esta iniciativa.

### Paso 2: Leer los Knowledge Indexes del Proyecto y SDK

Leer en orden:
1. `.drfic/diana-sdk/projects/knowledge/indexes/master-index.md`
2. `.drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/master-index.md`
3. `.drfic/diana-sdk/sdk/diana/knowledge/indexes/master-index.md`

**Solo cargar documentos marcados como 🟢 Completo**. Los documentos 🟡 Esqueleto no tienen contenido útil aún.

### Paso 3: Cargar Documentos Relevantes

Para cada documento 🟢 Completo relevante a la feature activa:
- Leer su contenido completo
- Usar como contexto de dominio experto durante specify, clarify y plan

Durante `/speckit.specify` este contexto debe influir directamente en:
- Definición de alcance funcional y no funcional con lenguaje de dominio correcto
- Redacción de requisitos y criterios de éxito más concretos y medibles
- Identificación temprana de supuestos críticos para evitar re-trabajo en clarify

Durante `/speckit.clarify` este contexto debe influir directamente en:
- Priorización de ambigüedades de alto impacto del dominio
- Formulación de preguntas más específicas y accionables
- Validación de supuestos técnicos/regulatorios antes de proponer opciones

### Paso 4: Identificar Gaps y Continuar

Si hay áreas de la feature no cubiertas por el knowledge local:
- **Continuar con tu metodología normal de Phase 0** (razonamiento, conocimiento del modelo)
- NO bloquear ni degradar la calidad de specify/clarify/plan por falta de conocimiento local
- Mencionar en los artefactos qué áreas se investigaron con conocimiento local vs metodología propia

### Paso 5: Recomendar Gaps de Knowledge

Al final del plan, si detectas áreas importantes sin cobertura en el knowledge local, agregar una sección:

```markdown
## Recomendaciones de Knowledge

Los siguientes temas mejorarían el knowledge base con `/diana.knowledge`:
- `/diana.knowledge topic="[tema]" scope="project"` — [por qué es importante]
```

---

## Principio

> El knowledge local es un acelerador, no un requisito.
> Speckit siempre produce specify, clarificación y plan de calidad, con o sin knowledge local.
> Con knowledge local: más rápido, más preciso, más experto.
> Sin knowledge local: metodología estándar, igual de válida.
