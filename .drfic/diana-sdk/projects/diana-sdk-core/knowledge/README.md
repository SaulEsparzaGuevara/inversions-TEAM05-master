# Diana SDK Core Knowledge — Nivel Proyecto Dashboard

## Propósito

Este directorio contiene el conocimiento profundo sobre el **Diana SDK Dashboard** — el proyecto que desarrolla la interfaz administrativa y de demostración del SDK Diana by DRFIC.

> **NO poner aquí**: conocimiento del motor Diana genérico (va en `sdk/diana/knowledge/`).
> **SÍ poner aquí**: UI del dashboard, flujos de admin, cómo desarrollar con Diana+Speckit, componentes del SDK.

## Estructura

```
knowledge/
├── local/
│   ├── domain/       → Qué es el dashboard, propósito, usuarios objetivo
│   ├── ui-patterns/  → Componentes, flujos de admin, design system
│   └── dev/          → Cómo desarrollar features nuevas con Diana+Speckit en este proyecto
├── remote/
│   └── sources.md
└── indexes/
    └── master-index.md
```

## Cómo generar conocimiento

```
/diana.knowledge topic="sdk-dashboard-overview" scope="project" type="local"
/diana.knowledge topic="admin-panel-patterns" scope="project" type="local"
/diana.knowledge topic="developing-with-diana" scope="project" type="local"
```
