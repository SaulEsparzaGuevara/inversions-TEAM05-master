# Checklist: Plan Quality — 006-team-05-institucional-cobertura

Purpose: Unit-test the quality of the implementation plan (`specs/006-team-05-institucional-cobertura/plan.md`).
Created: 2026-05-19
Source: specs/006-team-05-institucional-cobertura/plan.md

## Requirement Completeness
- [X] CHK001 - Are all execution flows (A: Contexto, B: Estrategias, C: Chat IA, D: Contratos/Observabilidad) explicitly described with their required inputs and outputs? [Completeness, Plan §5] ✅ Flujo A inputs/outputs (L56-57), Flujo B (L63-75), Flujo C (L81-91), Flujo D (L97-132)
- [X] CHK002 - Are the concrete deliverables for the strategy engine (payoff calculation, eligibility rules, standardized strategy output) fully specified? [Completeness, Plan §5] ✅ Payoff (L64), eligibility (L68-73), contracts (L124-125)
- [X] CHK003 - Are the rules of eligibility and parameterization for each options strategy (Protective Put, Married Put, Collar, Covered Straddle) quantified and unambiguous? [Clarity, Plan §5] ✅ strike_selection, tenor, premium_budget, liquidity_filter, sensitivity_targets (L68-73)
- [X] CHK004 - Is the SLO and asynchronous fallback behavior (polling every 2s, timeout 30s, max 15 attempts) described in actionable terms for implementation and instrumentation? [Clarity, Plan §5] ✅ p95<=5s (L155), métricas y alertas (L101-116)
- [X] CHK005 - Do the API contract requirements align with the traceability requirements (context_id, evidence, model version, hash) and are naming/field conventions consistent across sections? [Consistency, Plan §4, §5] ✅ Traza fields (L124), contract alignment (L91)
- [X] CHK006 - Are success criteria for strategy outputs (risk vs reward, payoff matrices) measurable with clear acceptance thresholds or example fixtures? [Acceptance Criteria, Plan §5] ✅ Payoff matrices (L169), Fixture D (L165), thresholds (L167-169)
- [X] CHK007 - Are extreme market scenario catalogs (stress, tail events, zero-liquidity) required and referenced, or is their omission intentional? [Coverage, Plan §9] [Gap] ✅ Fixture B y C (L163-164), gap documentado (L210), catálogo en catalogs/market-scenarios.md
- [X] CHK008 - Are alternate and recovery flows defined (partial data, partial evidence, stale inputs) and mapped to expected outputs? [Coverage, Plan §5] ✅ Degradación fuentes (L158), IA unavailable (L85), 503 si todas fallan
- [X] CHK009 - Are partial IA-failure and degraded-mode results specified (exact fields returned, `ai_unavailable` flag semantics, fallbacks)? [Edge Case, Plan §5] ✅ `ai_unavailable` flag + respuesta estructurada sin narrativa (L85)
- [X] CHK010 - Is the retention policy (365 days) specified with operational details (storage tier, encryption, purge process)? [Non-Functional, Plan §4] ✅ 365d + tiering hot/warm/cold (L119), KMS/TLS (L120), purge diario (L121)
- [X] CHK011 - Is the latency target (p95 <= 5s) instrumented with explicit metrics names, measurement points, and alerting thresholds? [Non-Functional, Plan §5] ✅ 4 métricas (L103-106), 5 puntos (L107-112), 3 alertas (L113-116)
- [X] CHK012 - Are external data sources (SEC EDGAR, FINRA, Unusual Whales, market feeds) and their assumed SLAs/available fields documented and testable? [Dependency, Plan §2] ✅ 4 fuentes con SLA (L127-132)
- [X] CHK013 - Are access control and role semantics (`analyst`, `risk_manager`) unambiguous across API/UX/observability requirements? [Ambiguity, Plan §1] ✅ Roles definidos (L82, L156), sin ejecución (L137)
- [X] CHK014 - Can every strategy/explanation be reconstructed from persisted traces (context_id → evidence → model inputs → hash) and is a reconstruction procedure documented? [Traceability, Plan §5] ✅ Procedimiento completo 6 pasos (L188-195)
- [X] CHK015 - Are JSON contract versioning and backward-compatibility rules defined for integration consumers? [Completeness, Plan §4] ✅ Semver, 90d deprecation, JSON Schema CI (L199-203)
- [X] CHK016 - Are concrete test fixtures and unit/integration test plans defined for institutional scenarios, including sensitivity analyses for eligibility and payoff calculations? [Coverage, Plan §7] ✅ Fixtures A/B/C/D (L162-165), tests unitarios/integración/contratos/NF (L147-159)

---
Meta: Items prioritize high-risk gaps (traceability, SLOs, external dependencies). If more than 40 items are needed, group low-impact edge cases together.
