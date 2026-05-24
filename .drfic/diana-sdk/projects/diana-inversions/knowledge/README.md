# Diana Inversiones Knowledge — Nivel Proyecto

## Propósito

Este directorio contiene el conocimiento profundo sobre el **dominio de inversiones** para el proyecto `diana-inversions`.
Su contenido aplica a **todas las iniciativas** de este proyecto.

> **NO poner aquí**: conocimiento del motor Diana, patrones genéricos de SDD, glosario del SDK.
> **SÍ poner aquí**: finanzas, mercados, brokers (IBKR/Alpaca), compliance, órdenes, portfolios, datos de mercado.

## Estructura

```
knowledge/
├── local/
│   ├── domain/      → Conceptos del dominio de inversiones (finanzas, mercados, instrumentos)
│   ├── brokers/     → Integración técnica profunda con cada broker
│   ├── compliance/  → Regulación, disclaimers, retención de datos
│   ├── patterns/    → Patrones técnicos específicos de esta app (auth, realtime, etc.)
│   └── cores/       → Motores analíticos avanzados (técnico, fundamental, opciones, noticias, IA)
├── remote/
│   ├── sources.md   → Catálogo de fuentes externas (APIs docs, regulación, research)
│   ├── notion/      → Snapshots exportados de Notion
│   ├── evernote/    → Exports de Evernote
│   └── notebooklm/  → Exports de NotebookLM
├── skills/
│   └── NNN-inv-skill-name-predictivo.md → Skill modular (un archivo por habilidad)
└── indexes/
    ├── master-index.md         → Índice principal de conocimiento profundo
    ├── by-topic.md             → Índice por área temática
    ├── skills-manifest.yaml    → Catálogo global de skills canónicas
    ├── skills-traceability.md  → Trazabilidad de IDs de skills (histórico y migraciones)
    ├── agent-skill-matrix.yaml → Relación de skills por agente/etapa
    └── sdd-engine-matrix.yaml  → Relación de skills por engine SDD
```

## Cómo generar conocimiento

```
/diana.skills action="generate"
/diana.knowledge topic="ibkr-tws-api" scope="project" type="local"
/diana.knowledge topic="alpaca-trading-api" scope="project" type="local"
/diana.knowledge topic="order-lifecycle" scope="project" type="local"
/diana.knowledge topic="compliance-mx" scope="project" type="remote"
```

Flujo recomendado:
1. Generar/sincronizar skills canónicas con `/diana.skills`.
2. Generar o actualizar conocimiento profundo con `/diana.knowlege` o `/diana.knowledge`.
3. Ejecutar Speckit (specify/clarify/plan) con consumo de skills + knowledge.

Estandar operativo (hibrido y portable):
1. `indexes/*.yaml` para gobierno, validación y automatización.
2. `skills/*.md` para ejecución granular por habilidad.
3. `local/*.md` para conocimiento profundo de dominio y arquitectura.
4. Fallback obligatorio: si faltan skills o knowledge, el engine SDD continúa con su metodología propia.

Herencia recomendada para evitar duplicación entre proyectos:
1. Cargar siempre `projects/knowledge` (capa cross-project en raiz de projects).
2. Cargar siempre `projects/<proyecto>/knowledge` (capa del proyecto activo).
3. Cargar `sdk/diana/knowledge` como capa adicional de metodologia compartida.
4. Si hay conflicto, prevalece la skill del proyecto activo por contexto de dominio.

Regla obligatoria para Speckit y Diana:
- Mantener en radar en todo momento dos fuentes: `projects/knowledge` y `projects/<proyecto>/knowledge`.

## Convenciones

- Archivos: `NNN-nombre-descriptivo.md`
- Encabezado obligatorio: `# [Tema] — Diana Inversiones Knowledge`
- Estado: 🟢 Completo · 🟡 Esqueleto · 🔴 Faltante

Convencion de skills:
- ID/archivo: `NNN-inv-skill-name-predictivo.md`
- `inv` siempre en minusculas.
- Nombre de skill en minusculas con guiones.
- Preferir palabras clave completas sobre abreviaturas compactas.

## Fuentes Oficiales para `/diana.knowledge`

El comando debe basarse en este orden de autoridad y trazabilidad:

1. `projects/diana-inversions/inv-constitution.md` (reglas no negociables)
2. `projects/diana-inversions/initiatives/001-inversions/001-inv-spec.md` (spec canónica)
3. `specs/001-plataforma-inversiones-ia/spec.md` (spec operativa + clarificaciones)
4. `projects/diana-inversions/governance/change-requests/001-inv-ucc.md` (necesidad de negocio)
5. `projects/diana-inversions/governance/tickets/001-inv-tkt.md` (objetivo y alcance de usuario)
6. `projects/diana-inversions/initiatives/001-inversions/meta.md` (trazabilidad de origen)

Si hay conflicto entre documentos, prevalecen constitución y spec canónica.
