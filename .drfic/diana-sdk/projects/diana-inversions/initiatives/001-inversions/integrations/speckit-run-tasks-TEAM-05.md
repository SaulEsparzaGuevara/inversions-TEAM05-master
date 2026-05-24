# Speckit Run Report: tasks — TEAM-05

Command: `/diana.integrate action="run" engine="speckit" project="diana-inversions" initiative="001-inversions" team="TEAM-05" run_only="tasks" language="es"`

Date: 2026-05-19

Summary:
- Inputs loaded (canonical):
  - `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-05/tasks.md` (team backlog)
  - `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-05/plan.md` (team plan)
  - `specs/006-team-05-institucional-cobertura/plan.md` (feature plan — Speckit)

- Action: Generated `specs/006-team-05-institucional-cobertura/tasks.md` by merging canonical backlog and derived Speckit tasks. Preserved canonical items and added implementation/test artifacts required by the plan.

Coverage Report (canonical preservation):
- preserved: T030, T054, T106..T121, T173, T184..T186 (all canonical IDs found in team tasks) — preserved 100%.
- expanded: T200..T210 (new Speckit-derived implementation, testing, ops and contract tasks).
- merged: none.
- dropped: none.

Readiness:
- Overall status: READY_FOR_IMPLEMENTATION_PREP
- Blockers: T209 (materializar catálogos de escenarios extremos por mercado) — requires domain SME mappings and scenario catalog input.
- Recommended next actions:
  1. Assign owners for T200..T210 and schedule T204 (fixtures) in CI to validate acceptance thresholds.
  2. Execute `scripts/validate-contract-compat.sh` after T200/T206/T207 complete.
  3. Run CI integration tests against fixtures and measure `coverage.response.p95_ms` to validate SLO.

Traceability:
- This run preserved canonical team backlog; all new tasks include explicit references to the plan sections and contract artifacts for traceability.

Notes:
- No canonical items were dropped. Any future change that omits a canonical task must be flagged as `GAP` and requires an explicit justification per Diana canon rules.
