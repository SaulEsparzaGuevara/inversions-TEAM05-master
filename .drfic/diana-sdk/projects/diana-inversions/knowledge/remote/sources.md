# Fuentes Remotas — Diana Inversiones Knowledge (Proyecto Level)

> Catálogo de fuentes externas específicas del dominio de inversiones.

## Cómo usar este catálogo

1. Para capturar un snapshot: `/diana.knowledge topic="[tema]" scope="project" type="remote" source="[URL]"`
2. Los snapshots se guardan en las subcarpetas correspondientes
3. Formato recomendado: markdown exportado o resumen estructurado

---

## Fuentes Registradas

### Documentación de Brokers

| ID | Fuente | URL / Referencia | Tipo | Snapshot |
|----|--------|-----------------|------|---------|
| REM-B-001 | IBKR TWS API Docs | https://interactivebrokers.github.io/tws-api/ | Web | Pendiente |
| REM-B-002 | IBKR Client Portal API | https://www.interactivebrokers.com/api/doc.html | Web | Pendiente |
| REM-B-003 | Alpaca API Docs | https://docs.alpaca.markets/ | Web | Pendiente |

### Regulación y Compliance

| ID | Fuente | URL / Referencia | Tipo | Snapshot |
|----|--------|-----------------|------|---------|
| REM-C-001 | LFPDPPP México | DOF 2010-07-05 | Legal | Pendiente |
| REM-C-002 | CNBV Marco Regulatorio | https://www.cnbv.gob.mx | Web | Pendiente |

### Noticias y Macro (Realtime)

| ID | Fuente | URL / Referencia | Tipo | Snapshot |
|----|--------|-----------------|------|---------|
| REM-N-001 | SEC Newsroom | https://www.sec.gov/newsroom | Web | Pendiente |
| REM-N-002 | Federal Reserve Press Releases | https://www.federalreserve.gov/newsevents/pressreleases.htm | Web | Pendiente |

### Notion / Evernote / NotebookLM

| ID | Fuente | Descripción | Exportado |
|----|--------|-------------|----------|
| — | — | — | — |

---

## Agregar una Fuente

```
/diana.knowledge topic="[descripción]" scope="project" type="remote" source="[URL o nombre]"
```
