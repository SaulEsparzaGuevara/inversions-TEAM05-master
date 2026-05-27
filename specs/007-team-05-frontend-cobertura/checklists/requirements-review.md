# Unit Tests for Requirements: Comprehensive Review

**Purpose**: Formal Quality Review Gate
**Target**: `specs/007-team-05-frontend-cobertura/spec.md`
**Focus**: Comprehensive coverage with heavy emphasis on resilience edge cases (AI timeouts, partial data, state persistence).

## Requirement Completeness
- [ ] CHK001 - Are the specific request and response payload structures defined for the 3 new backend endpoints (`/api/coverage/*`)? [Completeness, Spec §Entregables]
- [ ] CHK002 - Are the explicit fields to be displayed in the 13F table detailed in the requirements? [Completeness, Spec §Frontend (páginas nuevas) - 2]
- [ ] CHK003 - Are loading state requirements defined for asynchronous page transitions and component mounting? [Completeness]
- [ ] CHK004 - Are the exact risk metrics to be displayed on the Coverage Strategies page explicitly enumerated? [Completeness, Spec §Frontend (páginas nuevas) - 3]

## Requirement Clarity
- [ ] CHK005 - Does the spec define the exact visual feedback for the "spinner + tiempo transcurrido" in the AI Chat polling? [Clarity, Spec §Frontend (páginas nuevas) - 4]

## Requirement Consistency
- [ ] CHK006 - Do the predefined dropdown selectors for period and horizon perfectly map to the constraints in the `006` backend spec? [Consistency, Spec §Frontend (páginas nuevas) - 1]
- [ ] CHK007 - Are the `fetch` API error handling requirements consistent with the existing `services/signals/signalApi.ts` pattern? [Consistency, Spec §Restricciones]
- [ ] CHK008 - Do the service API types (`institutionalApi`, `coverageApi`, `aiChatApi`) align 1:1 with the backend contract schemas (`institutional_context.v1.json`, `strategy.v1.json`, `explanation.v1.json`)? [Consistency, Spec §Frontend (servicios API)]

## Scenario Coverage & Edge Cases (Resilience Focus)
- [ ] CHK009 - Is it clearly specified what alternative action a user can take when the "Reintento manual" button fails repeatedly in the AI Chat? [Coverage, AI Fallback, Spec §Frontend (páginas nuevas) - 4]
- [ ] CHK010 - Are the exact warning copies or visual markers defined for when option chains are completely unavailable? [Edge Case, Spec §Riesgos y Mitigaciones]
- [ ] CHK011 - Is it explicitly defined how the UI should visually indicate that the data shown is partial if `partialDataHandler.ts` returns a subset of strikes? [Coverage, Partial Data, Spec §Riesgos y Mitigaciones]
- [ ] CHK012 - Does the specification detail a memory limit or eviction policy for persisting very long AI Chat histories in the tab session store? [Edge Case, Store Limits, Spec §Notas de Implementación]
- [ ] CHK013 - Are requirements explicitly defined for zero-state scenarios on the institutional analysis page (e.g. invalid ticker)? [Coverage, Spec §Frontend (páginas nuevas) - 1]
- [ ] CHK014 - Does the spec define what happens if the AI narrative polling succeeds but returns poorly formatted data that cannot be parsed into ScenarioAnalysis cards? [Edge Case, Exception Flow]
- [ ] CHK015 - Are fallback requirements specified if the backend simulator endpoint (`/api/coverage/simulate`) timeouts or fails? [Exception Flow, Spec §Entregables]
- [ ] CHK016 - Is the required behavior defined if the user closes and reopens the tab (which clears the memory store)? [Edge Case, State Persistence]
- [ ] CHK017 - Are the new React Router routes verified to not collide with existing components (e.g. `MainDashboard` at `/`)? [Edge Case, Routing]

## Non-Functional Requirements & Measurability
- [ ] CHK018 - Can the >80% test coverage requirement be objectively measured specifically on the bounding boxes of the new pages and API services? [Measurability, Spec §RNF-305]
- [ ] CHK019 - Are the specific existing CSS Variables intended for reuse referenceable for a PR review checklist? [Traceability, Spec §Riesgos y Mitigaciones]

## Cost/Risk Indicator Semantics
- [ ] CHK020 - Does the spec clearly distinguish between confidence levels (ALTA/MEDIA/BAJA) and monetary amounts (netPremium, downsideRisk)? [Clarity, Spec §Indicadores Cost/Risk]
- [ ] CHK021 - Is it clear that `netPremium` represents net cash flow, NOT broker commission or margin requirement? [Semantics, Spec §Indicadores Cost/Risk]
- [ ] CHK022 - Is the Zero-Cost Collar explained as a regular Collar where premiums cancel, not a separate strategy type? [Concept, Spec §Indicadores Cost/Risk]
- [ ] CHK023 - Does the data model include semantic descriptions for each RiskMetrics field clarifying what it represents and what it does NOT represent? [Traceability, data-model.md §RiskMetrics]
