# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [e.g., library/cli/web-service/mobile-app/compiler/desktop-app or NEEDS CLARIFICATION]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

## UX Architecture & Control Strategy

<!--
  ACTION REQUIRED (UI-heavy features): Specify component strategy and interaction model.
-->

- **Target Experience**: [reference interaction model]
- **Critical Controls**: [control type per key business attribute]
- **State Strategy**: [client state vs server state boundaries]
- **Performance Boundaries**: [rendering thresholds, virtualization, pagination/streaming]

### Example (Trading Workspace)

- **Target Experience**: superchart + watchlist tree + tabla de confluencia avanzada
- **Critical Controls**:
  - instrumento: watchlist tree por categorias (indices/stocks/futures/forex/cripto)
  - visualizacion: chart de velas OHLC + overlays
  - filtros: temporalidad y periodo dinamicos por capacidades de fuente
  - analitica: tabla metadata-driven con columnas configurables
- **Performance Boundaries**: virtualizacion de filas/columnas y render incremental en chart

## Data Source Routing & Runtime Modes

<!--
  ACTION REQUIRED: Specify source routing before implementation tasks are generated.
-->

- **Source Domains**: [e.g., symbols, OHLC, indicators, alerts]
- **Routing Rules**: [domain -> source priority/fallback]
- **Runtime Modes**: [e.g., online/offline/demo/real]
- **Credential/Account Strategy**: [how mode affects account/secret selection]

### Example (Routing Matrix)

- **symbols**: broker catalog -> fallback local catalog
- **ohlc**: broker historical API -> fallback local ohlc cache
- **indicators**: broker/engine -> fallback local compute cache
- **runtime modes**:
  - online+demo
  - online+real
  - offline+demo
  - offline+real (solo si politicas lo permiten)

## Dynamic Schema Governance

<!--
  ACTION REQUIRED: Use for features with evolving columns/catalogs/fields.
-->

- **Registry Model**: [config entities/tables]
- **Runtime Adaptation**: [how UI/API adapts to added/removed fields]
- **Preset Strategy**: [role defaults and user custom views]
- **Validation Rules**: [required/optional fields, formatting, color rules]

### Example (Confluence Columns)

- registry: `confluence_column_configs`
- presets: `confluence_view_presets` (por rol/usuario)
- formatting: reglas por tipo (price, percent, risk, datetime)
- color rules: compra=verde, venta=rojo, neutral=amarillo

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
