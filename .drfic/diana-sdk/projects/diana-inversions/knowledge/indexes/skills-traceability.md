# Skills Traceability — diana-inversions

## Convención activa

Formato de ID de skill: `<NNN>-<proyecto>-<skill-name-predictivo>`

- `NNN`: consecutivo de skill dentro del proyecto.
- `proyecto`: codigo corto en minusculas (`inv`).
- `skill-name-predictivo`: nombre amplio y legible en minusculas con guiones.

## Migración de IDs

| Legacy ID | New ID | Skill Doc |
|-----------|--------|-----------|
| SK-INV-001 | 001-inv-technical-analysis-structure | skills/001-inv-technical-analysis-structure.md |
| SK-INV-002 | 002-inv-indicator-signal-logic | skills/002-inv-indicator-signal-logic.md |
| SK-INV-003 | 003-inv-fundamental-analysis | skills/003-inv-fundamental-analysis.md |
| SK-INV-004 | 004-inv-options-strategy-engine | skills/004-inv-options-strategy-engine.md |
| SK-INV-005 | 005-inv-institutional-options-flow | skills/005-inv-institutional-options-flow.md |
| SK-INV-006 | 006-inv-realtime-news-impact | skills/006-inv-realtime-news-impact.md |
| SK-INV-007 | 007-inv-ai-confluence-orchestration | skills/007-inv-ai-confluence-orchestration.md |
| SK-INV-008 | 008-inv-market-data-and-realtime | skills/008-inv-market-data-and-realtime.md |
| SK-INV-009 | 009-inv-execution-governance-human-control | skills/009-inv-execution-governance-human-control.md |
| SK-INV-010 | 010-inv-broker-integration-ibkr-alpaca | skills/010-inv-broker-integration-ibkr-alpaca.md |
| SK-INV-011 | 011-inv-portfolio-and-performance-analytics | skills/011-inv-portfolio-and-performance-analytics.md |
| SK-INV-012 | 012-inv-compliance-audit-retention | skills/012-inv-compliance-audit-retention.md |

## Regla de compatibilidad

Durante periodo de transición, cualquier referencia legacy debe migrarse al New ID antes de cerrar PR.

Compatibilidad historica contemplada:
- `SK-INV-XXX` -> `NNN-inv-skill-name-predictivo`
- `NNN-DINV-ABREV` -> `NNN-inv-skill-name-predictivo`
