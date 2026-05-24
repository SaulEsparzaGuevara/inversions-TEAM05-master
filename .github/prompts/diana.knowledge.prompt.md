---
agent: diana.knowledge
description: Genera conocimiento profundo para Diana SDK. Úsalo cuando necesites investigar un tema y guardarlo como conocimiento local o registrar fuentes remotas.
---

# /diana.knowledge — Generador de Conocimiento Profundo Diana

## Uso

```
/diana.knowledge topic="[tema-opcional]" scope="[sdk|project|initiative]" type="[local|remote|both]"
```

Modo multi-proyecto recomendado:

```
/diana.knowledge topic="[tema-opcional]" scope="project" project="[project-id]" layer="[general|project|both]" type="[local|remote|both]"
```

Prerequisito recomendado:

```
/diana.skills action="generate"
```

### Argumentos

| Argumento | Valores | Default | Descripción |
|-----------|---------|---------|-------------|
| `topic` | cualquier string \| `all` | `all` | Tema a investigar (e.g., "ibkr-tws-api", "order-lifecycle"). Si se omite, se procesa `all` |
| `scope` | `sdk` \| `project` \| `initiative` | `project` | Nivel donde guardar el conocimiento |
| `project` | id de proyecto en projects-knowledge-radar | `diana-inversions` | Proyecto objetivo cuando `scope=project` o `scope=initiative` |
| `layer` | `general` \| `project` \| `both` | `both` | `general` guarda/reutiliza en `projects/knowledge`; `project` guarda en `projects/<project>/knowledge`; `both` genera en ambas capas |
| `type` | `local` \| `remote` \| `both` | `both` | Tipo de conocimiento a generar |
| `source` | URL o nombre | opcional | Fuente remota específica a documentar |

### Comportamiento por default (si omites argumentos)

- Si omites `type`, se usa `type="both"`.
- Si `scope="project"` y omites `layer`, se usa `layer="both"`.
- Si omites `topic`, se usa `topic="all"`.
- Resultado por default en proyecto: conocimiento local y remoto en capa general + capa proyecto.

### Resolución automática de tópicos cuando `topic="all"`

Orden de prioridad para construir la lista de tópicos:
1. Tópicos obligatorios declarados en **Fase 0** de este prompt (baseline mínimo).
2. Skills del proyecto en `skills-manifest.yaml` (mapear cada skill a su/ sus `knowledge_docs`).
3. Índices maestros disponibles (proyecto, projects-root y sdk) para detectar huecos y evitar duplicados.

Si un tópico aparece en más de una fuente, procesarlo una sola vez.

### Ejemplos

```bash
# Conocimiento técnico de IBKR para el proyecto de inversiones
/diana.knowledge topic="ibkr-tws-api" scope="project" type="local"

# Core técnico (soportes, resistencias, tendencias)
/diana.knowledge topic="technical-analysis-core" scope="project" type="local"

# Core fundamental
/diana.knowledge topic="fundamental-analysis-core" scope="project" type="local"

# Core de señales buy/sell
/diana.knowledge topic="buy-sell-signals-core" scope="project" type="local"

# Core de opciones (Wheel, Straddle, Iron Condor)
/diana.knowledge topic="options-strategies-core" scope="project" type="local"

# Core flujo institucional opciones
/diana.knowledge topic="institutional-options-flow-core" scope="project" type="local"

# Core noticias en tiempo real
/diana.knowledge topic="realtime-news-core" scope="project" type="local"

# Core confluencia IA
/diana.knowledge topic="ai-confluence-orchestrator-core" scope="project" type="local"

# Metodología SDD para el SDK (cross-proyecto)
/diana.knowledge topic="sdd-lifecycle" scope="sdk" type="local"

# Conocimiento general compartido entre proyectos
/diana.knowledge topic="risk-taxonomy" scope="project" project="diana-inversions" layer="general" type="local"

# Conocimiento particular del proyecto activo
/diana.knowledge topic="ibkr-tws-api" scope="project" project="diana-inversions" layer="project" type="local"

# Default recomendado sin especificar type/layer (usa both/both)
/diana.knowledge topic="order-lifecycle" scope="project" project="diana-inversions"

# Generación en lote de todos los tópicos obligatorios y mapeados
/diana.knowledge scope="project" project="diana-inversions"

# Registrar y resumir una fuente remota
/diana.knowledge topic="alpaca-api" scope="project" type="remote" source="https://docs.alpaca.markets/"

# Ambos: generar conocimiento local + registrar fuentes
/diana.knowledge topic="order-lifecycle" scope="project" type="both"
```

---

## Instrucciones para el Agente

Cuando el usuario ejecute este comando:

### Fase 0: Barrido Canónico Obligatorio (no omitir)

Antes de generar cualquier documento, cargar y resumir cobertura desde estas fuentes oficiales:

1. Control de Cambios (necesidad de negocio):
   - `.drfic/diana-sdk/projects/diana-inversions/governance/change-requests/001-inv-ucc.md`
2. Ticket de Usuario (dolor y objetivos de negocio):
   - `.drfic/diana-sdk/projects/diana-inversions/governance/tickets/001-inv-tkt.md`
3. Constitución del Proyecto (reglas no negociables):
   - `.drfic/diana-sdk/projects/diana-inversions/inv-constitution.md`
4. Spec Canónica (fuente funcional completa):
   - `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-spec.md`
5. Meta de iniciativa (trazabilidad de origen):
   - `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/meta.md`
6. Spec operativa activa (clarificaciones vigentes):
   - `.specify/feature.json` -> `specs/001-plataforma-inversiones-ia/spec.md`

Construir una matriz temporal `tema -> cobertura actual` y detectar gaps obligatorios.

Temas obligatorios de cobertura minima para este proyecto:
- Analisis tecnico (soportes, resistencias, tendencia)
- Analisis fundamental
- Senales buy/sell
- Estrategias de opciones (Wheel, Straddle, Iron Condor)
- Flujo institucional por strike/expiracion
- Noticias en tiempo real
- Confluencia IA entre cores activos por usuario

Si falta cualquiera de estos temas, generar/actualizar los documentos correspondientes antes de terminar.

### Fase 0.5: Skills First (obligatorio)

Antes de generar o actualizar conocimiento profundo, validar y sincronizar skills en:

- `.drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml`
- `.drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/skills-manifest.yaml`
- `.drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/agent-skill-matrix.yaml`
- `.drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/sdd-engine-matrix.yaml`
- `.drfic/diana-sdk/projects/diana-inversions/knowledge/skills/` (skill docs modulares)

Reglas:
1. Derivar skills desde fuentes canonicas (no desde opinion ad-hoc).
2. Para cada skill, enlazar al menos un `knowledge_doc`.
3. Si un tema canonico no tiene skill asociada, crear skill nueva.
4. Si una skill no tiene documento de conocimiento completo, generarlo/actualizarlo.
5. Mantener mapeo de skills requeridas por agente Diana y por etapa Speckit.
6. Mantener mapeo por engine SDD (Speckit, OpenSpec, Generic-SDD).

Si los archivos de skills no existen, generarlos primero con:

```
/diana.skills action="generate"
```

### Fase 1: Cargar Contexto

1. Leer la **constitución del proyecto activo**:
   - Si `scope=project` o `initiative`: leer `.drfic/diana-sdk/projects/diana-inversions/inv-constitution.md`
   - Si `scope=sdk`: leer `.drfic/diana-sdk/sdk/diana/constitution.md`

2. Leer el **spec activo** (si existe): `.specify/feature.json` → cargar `spec.md` correspondiente

3. Leer el **índice maestro** del nivel correspondiente:
   - `scope=project`: `.drfic/diana-sdk/projects/knowledge/indexes/master-index.md` y `.drfic/diana-sdk/projects/<project>/knowledge/indexes/master-index.md`
   - `scope=sdk`: `.drfic/diana-sdk/sdk/diana/knowledge/indexes/master-index.md`
   - `scope=initiative`: `.drfic/diana-sdk/projects/<project>/initiatives/001-inversions/knowledge/index.md`

4. Verificar si ya existe un documento sobre este `topic` en el índice. Si existe y está 🟢 Completo, notificar al usuario y preguntar si quiere regenerar.

   Si `topic="all"`:
   - Construir lista consolidada de tópicos con la sección "Resolución automática de tópicos".
   - Iterar tema por tema aplicando la misma lógica de existencia/regeneración.

5. Verificar cobertura contra la matriz de Fase 0:
   - Si el `topic` solicitado depende de otros temas obligatorios no cubiertos, sugerir generarlos en lote.
   - Si el usuario pidió generación completa de proyecto, producir todos los temas obligatorios faltantes.

### Fase 2: Investigación Profunda

Para `type=local` o `type=both`:

1. **Investigar el tema** usando:
   - Tu conocimiento del modelo (conocimiento interno profundo)
   - El contexto de la constitución y spec cargados
   - Razonamiento sobre el dominio específico del proyecto

2. **Generar un documento completo** con estructura estándar:

```markdown
# [Tema Capitalizado] — Diana [Nivel] Knowledge

> **ID**: [ID según convención del índice]
> **Generado**: [fecha actual]
> **Scope**: [scope indicado]
> **Estado**: 🟢 Completo
> **Fuente**: Investigación profunda + contexto Diana

## TL;DR

[2-3 oraciones: qué es, por qué importa, cuándo usar]

## Conceptos Clave

[lista de conceptos fundamentales con definición breve]

## [Sección Principal 1]

[contenido detallado]

## [Sección Principal 2]

[contenido detallado]

## Integración con el Proyecto

[cómo aplica específicamente a diana-inversions o al scope indicado]

## Decisiones de Diseño

[tradeoffs conocidos, alternativas consideradas]

## Referencias y Fuentes

[URLs, documentación oficial, papers]

## Siguiente Paso

[qué investigar o generar a continuación]
```

3. **Determinar la ruta de guardado**:
   - `scope=sdk, type=local`: `.drfic/diana-sdk/sdk/diana/knowledge/local/[categoría]/[NNN-topic].md`
   - `scope=project, layer=general, type=local`: `.drfic/diana-sdk/projects/knowledge/[...]/[NNN-topic].md`
   - `scope=project, layer=project, type=local`: `.drfic/diana-sdk/projects/<project>/knowledge/local/[categoría]/[NNN-topic].md`
   - `scope=project, layer=both, type=local`: guardar en ambas rutas (general y project)
   - Categoría: detectar automáticamente (domain | brokers | compliance | patterns | methodology | agents | etc.)

4. **Guardar el documento** en la ruta correspondiente.

5. **Actualizar el master-index.md**:
   - Agregar fila al índice con ID, archivo, descripción y estado 🟢 Completo
   - Actualizar la tabla de Estado de Cobertura

Para `type=remote` o `type=both`:

1. Si se proporciona `source`: documentar la fuente en `remote/sources.md`
2. Generar un resumen estructurado de la fuente como snapshot en `snapshots/`
3. Si no se proporciona `source`: sugerir fuentes relevantes y registrarlas en `remote/sources.md`
4. Si `scope=project` y `layer=both`: registrar fuente y snapshot en capa general y capa proyecto.

### Fase 3: Confirmación

Reportar al usuario:
- Documento(s) generado(s) y su ruta
- ID asignado
- Topicos procesados (generados, actualizados y omitidos por ya estar completos)
- Secciones del índice actualizadas
- Lista de temas obligatorios cubiertos vs pendientes
- Skills creadas/actualizadas y agentes afectados
- Siguiente comando sugerido (e.g., siguiente documento a generar o `/speckit.plan`)

---

## Principio Fundamental

> El conocimiento generado por `/diana.knowledge` **enriquece** la metodología de Speckit.
> **No la reemplaza.** Si Speckit encuentra gaps no cubiertos en el knowledge local,
> debe continuar con su propia investigación y razonamiento (Phase 0 normal).
> El objetivo es que Speckit llegue al plan con más contexto experto, más rápido.
