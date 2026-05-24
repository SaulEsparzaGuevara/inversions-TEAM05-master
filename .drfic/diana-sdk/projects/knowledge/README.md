# Projects Knowledge Hub — Cross-Project Layer

## Proposito

Este directorio concentra conocimiento y skills a nivel raiz de projects para que cada proyecto pueda reutilizar contexto de otros proyectos sin duplicar todo.

Esta capa es obligatoria en radar para Speckit y Diana junto con la capa del proyecto activo.

## Estructura

```text
projects/knowledge/
├── indexes/
│   ├── master-index.md
│   └── projects-knowledge-radar.yaml
└── skills/
    └── README.md
```

## Regla operativa

Para cualquier etapa SDD (`specify`, `clarify`, `plan`, `tasks`):
1. Cargar `projects/knowledge/indexes/projects-knowledge-radar.yaml`.
2. Cargar knowledge del proyecto activo.
3. Resolver reusable skills entre proyectos.

Guia de ejecucion de comandos:
- `.drfic/diana-sdk/projects/knowledge/indexes/command-routing.md`

## Convencion de IDs para skills de proyecto

Formato obligatorio:
- `<NNN>-inv-<skill-name-predictivo-en-minusculas>`
- Usar guiones entre palabras clave.
- Evitar abreviaturas opacas; preferir nombres completos si no son excesivos.
