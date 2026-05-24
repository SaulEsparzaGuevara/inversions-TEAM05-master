# Diana SDK Knowledge — Nivel Motor (Cross-Proyecto)

## Propósito

Este directorio contiene el conocimiento profundo sobre **Diana como motor SDD** (Software-Driven Development).
Su contenido aplica a **todos los proyectos** gobernados por Diana, sin importar el dominio de negocio.

> **NO poner aquí**: conocimiento de inversiones, fintech, brokers, compliance, ni nada específico de un proyecto.
> **SÍ poner aquí**: metodología SDD, cómo funcionan los agentes, patrones genéricos, glosario del SDK.

## Estructura

```
knowledge/
├── local/
│   ├── methodology/     → Cómo funciona SDD, el ciclo de vida de Diana, fases de Speckit
│   ├── agents/          → Capacidades profundas de cada agente Diana
│   ├── patterns/        → Patrones genéricos aplicables a cualquier dominio
│   └── glossaries/      → Glosario canónico del SDK (términos Diana/Speckit)
├── remote/
│   └── sources.md       → Catálogo de fuentes externas sobre SDD, AI agents, metodología
├── skills/
│   └── NNN-SDK-ABREV.md → Skills compartidas reutilizables entre proyectos
└── indexes/
    ├── master-index.md  → Índice principal (Speckit lee esto en Phase 0)
    ├── by-agent.md      → Qué agente usa qué documento de conocimiento
    └── shared-skills-manifest.yaml → Catálogo de skills compartidas SDK
```

## Reuso Cross-Proyecto

Las skills generales (frameworks, metodologías, prácticas transversales) deben vivir en este nivel SDK.

Regla de consumo:
1. Cargar skills compartidas SDK.
2. Aplicar override de proyecto solo si hay restricciones de dominio.
3. Registrar trazabilidad de overrides en el manifest del proyecto.

## Cómo usa Speckit este conocimiento

Durante `/speckit.plan` Phase 0, Speckit:
1. Lee `indexes/master-index.md`
2. Carga los documentos referenciados relevantes para la feature activa
3. Identifica gaps no cubiertos por el conocimiento local
4. Para los gaps: ejecuta su propia investigación (razonamiento + fuentes)
5. El conocimiento local **enriquece** pero nunca **reemplaza** la metodología de Speckit

## Cómo generar conocimiento

Usa el comando `/diana.knowledge` desde VS Code Copilot Chat:

```
/diana.knowledge topic="sdd-lifecycle" scope="sdk" type="local"
```

Ver `.github/prompts/diana.knowledge.prompt.md` para documentación completa.

## Convenciones de nombres

- Archivos: `NNN-nombre-descriptivo.md` (NNN = número de orden 001, 002...)
- Idioma: inglés para términos técnicos, español para explicaciones (bilingual-friendly)
- Encabezado obligatorio: `# [Tema] — Diana SDK Knowledge`
