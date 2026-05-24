# Checklist: Plan Quality — 006-team-05-institucional-cobertura

Purpose: Unit-test the quality of the implementation plan (`specs/006-team-05-institucional-cobertura/plan.md`).
Created: 2026-05-19
Source: specs/006-team-05-institucional-cobertura/plan.md

## Requirement Completeness
- [ ] CHK001 - Are all execution flows (A: Contexto, B: Estrategias, C: Chat IA, D: Contratos/Observabilidad) explicitly described with their required inputs and outputs? [Completeness, Plan §5]
- [ ] CHK002 - Are the concrete deliverables for the strategy engine (payoff calculation, eligibility rules, standardized strategy output) fully specified? [Completeness, Plan §5]

## Requirement Clarity
- [ ] CHK003 - Are the rules of eligibility and parameterization for each options strategy (Protective Put, Married Put, Collar, Covered Straddle) quantified and unambiguous? [Clarity, Plan §5]
- [ ] CHK004 - Is the SLO and asynchronous fallback behavior (polling every 2s, timeout 30s, max 15 attempts) described in actionable terms for implementation and instrumentation? [Clarity, Plan §5]

## Requirement Consistency
- [ ] CHK005 - Do the API contract requirements align with the traceability requirements (context_id, evidence, model version, hash) and are naming/field conventions consistent across sections? [Consistency, Plan §4, §5]

## Acceptance Criteria Quality
- [ ] CHK006 - Are success criteria for strategy outputs (risk vs reward, payoff matrices) measurable with clear acceptance thresholds or example fixtures? [Acceptance Criteria, Plan §5]

## Scenario Coverage
- [ ] CHK007 - Are extreme market scenario catalogs (stress, tail events, zero-liquidity) required and referenced, or is their omission intentional? [Coverage, Plan §9] [Gap]
- [ ] CHK008 - Are alternate and recovery flows defined (partial data, partial evidence, stale inputs) and mapped to expected outputs? [Coverage, Plan §5]

## Edge Case Coverage
- [ ] CHK009 - Are partial IA-failure and degraded-mode results specified (exact fields returned, `ai_unavailable` flag semantics, fallbacks)? [Edge Case, Plan §5]

## Non-Functional Requirements
- [ ] CHK010 - Is the retention policy (365 days) specified with operational details (storage tier, encryption, purge process)? [Non-Functional, Plan §4]
- [ ] CHK011 - Is the latency target (p95 <= 5s) instrumented with explicit metrics names, measurement points, and alerting thresholds? [Non-Functional, Plan §5]

## Dependencies & Assumptions
- [ ] CHK012 - Are external data sources (SEC EDGAR, FINRA, Unusual Whales, market feeds) and their assumed SLAs/available fields documented and testable? [Dependency, Plan §2]

## Ambiguities & Conflicts
- [ ] CHK013 - Are access control and role semantics (`analyst`, `risk_manager`) unambiguous across API/UX/observability requirements? [Ambiguity, Plan §1]

## Traceability & Measurability
- [ ] CHK014 - Can every strategy/explanation be reconstructed from persisted traces (context_id → evidence → model inputs → hash) and is a reconstruction procedure documented? [Traceability, Plan §5]
- [ ] CHK015 - Are JSON contract versioning and backward-compatibility rules defined for integration consumers? [Completeness, Plan §4]

## Tests & Validation
- [ ] CHK016 - Are concrete test fixtures and unit/integration test plans defined for institutional scenarios, including sensitivity analyses for eligibility and payoff calculations? [Coverage, Plan §7]

---
Meta: Items prioritize high-risk gaps (traceability, SLOs, external dependencies). If more than 40 items are needed, group low-impact edge cases together.
