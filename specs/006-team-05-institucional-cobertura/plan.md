# Plan de Implementación: 006-team-05-institucional-cobertura

## 1) Contexto y Autoridad

- **Feature**: `specs/006-team-05-institucional-cobertura/`
- **Equipo**: TEAM-05 (TurboPapus)
- **Iniciativa**: `001-inversions`
- **Engine**: Speckit (`stage=plan`)
- **Idioma**: es
- **Política de autoridad**: `diana_canon_strict`

Este plan está subordinado a:
1. `.drfic/diana-sdk/projects/diana-inversions/inv-constitution.md`
2. `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-05/plan.md`
3. `specs/006-team-05-institucional-cobertura/spec.md`
4. `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/integrations/integration-profile.md`

Ante conflicto, prevalece el canon Diana.

## 2) Entradas Canónicas Cargadas

- Plan canónico de equipo: `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-05/plan.md`
- Spec de feature vigente: `specs/006-team-05-institucional-cobertura/spec.md`
- Matriz de engine/skills: `.drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/sdd-engine-matrix.yaml`
- Perfil de integración: `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/integrations/integration-profile.md`

## 3) Objetivo del Plan

Traducir el alcance de TEAM-05 en un plan técnico ejecutable para construir análisis institucional y estrategias de cobertura (Protective Put, Married Put, Collar Put, Covered Straddle), con trazabilidad operativa completa, degradación controlada de IA y salidas integrables con Speckit sin reinterpretar el canon.

## 4) Skills Requeridas (Speckit `plan`)

Desde `engines.speckit.plan.required_skills`:
- `001-inv-technical-analysis-structure`
- `002-inv-indicator-signal-logic`
- `004-inv-options-strategy-engine`
- `005-inv-institutional-options-flow`
- `006-inv-realtime-news-impact`
- `007-inv-ai-confluence-orchestration`
- `008-inv-market-data-and-realtime`
- `010-inv-broker-integration-ibkr-alpaca`
- `011-inv-portfolio-and-performance-analytics`

## 5) Diseño de Ejecución por Flujos

### Flujo A — Contexto Institucional

**Objetivo**: exponer lectura institucional útil para evaluar coberturas (RF-001, RF-002).

Entregables:
- Normalización de señales institucionales (entradas, supuestos, score/contexto).
- Contrato de salida institucional estructurado para consumo interno.
- Evidencia asociada por resultado (`context_id`, fuentes, timestamp).

Inputs / Outputs (implementable):
- Inputs: raw event feeds (`institutional_trades`, `13F_filings`, `block_trades`), normalized market snapshot (`price`, `volume`, `implied_volatility`), enrichment signals (`news_sentiment`, `earnings_dates`).
- Outputs: `institutional_context` JSON with `{context_id, symbols[], score, raw_sources[], computed_signals[], timestamp}` and `evidence_bundle` reference (storage path / id).

### Flujo B — Motor de Estrategias de Cobertura

**Objetivo**: modelar estrategias y expresar riesgo/recompensa con claridad (RF-003, criterio de éxito).

Entregables:
- Cálculo de payoff/riesgo para Protective Put, Married Put, Collar Put y Covered Straddle.
- Reglas de elegibilidad y sensibilidad por escenario.
- Salida estandarizada de estrategia con trazabilidad al contexto institucional.

Parameterización y reglas de elegibilidad (cuantificadas):
- `strike_selection`: default ATM ±5% buckets; candidate strikes considered within [ATM-20%, ATM+20%].
- `tenor`: prefer expiries 7–90 days for tactical hedges; 91–365 days for strategic hedges; reject tenors <7 days unless liquidity > `strategy_policy.min_liquidity`.
- `premium_budget`: max premium as % of notional (default `0.5%` per leg, configurable in `strategy_policy.max_premium_pct`).
- `liquidity_filter`: minimum ADV threshold (e.g., ADV >= 100000) or options OI >= 500 contracts for strike eligibility.
- `sensitivity_targets`: require delta-reduction >= 60% (configurable) and vega reduction targets defined per strategy.

Notas: Estos valores son defaults para MVP y deben exponerse en la `strategy_policy` contract para que los equipos de configuración los ajusten.

### Flujo C — Chat IA Explicativo (No-Trade)

**Objetivo**: explicar escenarios sin ejecutar operaciones (RF-004, RNF-001).

Entregables:
- Servicio de explicación para roles `analyst` y `risk_manager`.
- Persistencia de trazabilidad completa por respuesta IA:
  `context_id`, estrategia, evidencia usada, timestamp, versión de modelo, hash de salida.
- Política de degradación: si IA falla, devolver cálculo estructurado + `ai_unavailable`.

Inputs / Outputs (implementable):
- Inputs: `institutional_context` id, `strategy_proposal` id, evidence references, user role and request parameters.
- Outputs: `explanation_response` JSON {`response_id`,`context_id`,`strategy_id`,`narrative`,`traceability`:{`evidence_ids[]`,`model_version`,`response_hash`},`ai_unavailable`?}.

Contract alignment: The `explanation_response` fields above must match `/api/contracts/coverage/explanation.v1.json` and use the same field names and types for seamless integration.

### Flujo D — Contratos, API y Observabilidad

**Objetivo**: asegurar integración Speckit + auditabilidad (RF-005, RF-006, RNF-002).

Entregables:
- Contratos API para resultados institucionales, estrategias y explicación.
 - Contratos API para resultados institucionales, estrategias y explicación.

Observability, Metrics & Alerts (concrete):
- Metric names:
  - `coverage.response.latency_ms` (histogram), tags: `flow`, `endpoint`, `region`.
  - `coverage.response.p95_ms` (derived metric)
  - `coverage.ai.unavailable.count` (counter)
  - `coverage.polling.attempts` (counter)
- Measurement points:
  - `request_received` (API gateway ingress)
  - `pre_ai_invoke` (before LLM call)
  - `post_ai_invoke` (after LLM returns)
  - `strategy_ready` (strategy engine complete)
  - `response_sent` (response emitted)
- Alerting thresholds:
  - P95 latency > 5000ms sustained for 5m -> PagerDuty (SEV-2)
  - AI unavailable rate > 5% over 15m -> ops alert
  - Polling attempt failure rate > 1% over 1h -> investigate

Storage & Retention (365 days):
- Storage tiering: hot (0–30d) on low-latency DB/cache, warm (31–180d) on cost-optimized object storage, cold (181–365d) on archival tier.
- Encryption: KMS-managed keys for at-rest encryption; TLS 1.2+ for in-transit.
- Purge process: daily secure deletion job that enqueues records older than 365d; deletion operations logged and verifiable for compliance.

Contract Alignment & Traceability fields:
- Required trace fields in contracts: `context_id` (UUID), `strategy_id` (UUID), `evidence_ids` (array of UUIDs), `model_version` (semver string), `response_hash` (SHA256 hex string), `timestamp` (ISO8601).
- Ensure `/api/contracts/coverage/*.v1.json` declare these fields and their types exactly.

External Sources & Assumed SLAs:
- SEC EDGAR (13F): daily batch updates; availability 99.5%, update latency up to 24h.
- FINRA TRACE: intraday trade reports; availability 99.8%, ingestion delay ~5–15m.
- Yahoo Finance Options Flow: options chain data (free, no API key); availability ~99.5%, may have unannounced rate limits.
- Yahoo Finance Institutional: institutional holders data (free, no API key); availability ~99.5%, no formal SLA.
- Market data feeds (primary price/quotes): assume 99.9% SLA for primary vendors; fallback to consolidated delayed feeds on partial outage.

## 6) Restricciones y Guardrails

- Arquitectura semi-automática constitucional (obligatoria).
- Prohibido ejecutar órdenes desde este módulo.
- Estrategias desacopladas de broker y frontend.
- No invadir dominios técnico/noticias/ejecución fuera del alcance TEAM-05.
- No modificar artefactos canónicos globales `001-inv-spec.md`, `001-inv-plan.md`, `001-inv-tasks.md`.
- Escala canónica `confidence`: todos los campos `confidence` usan rango decimal [0.00, 1.00]. Ninguna fuente o servicio retorna valores 0-100.
- Códigos de error estandarizados en fuentes upstream: `HTTP_ERROR`, `TIMEOUT`, `RATE_LIMITED`, `EMPTY_RESPONSE`, `PARSE_ERROR`.
- Componentes frontend: implementar 3 estados (loading skeleton, error con mensaje, vacío explicativo) y usar optional chaining en accesos anidados.

## 7) Estrategia de Pruebas

- Unitarias con aserciones numéricas: fórmulas de payoff, validaciones de parámetros, reglas de elegibilidad. Incluir 3 escenarios fijos con valores esperados:
  - Protective Put precio=$450.50, shares=100, strike=$440 → pérdida máxima ~$1,050 (detecta error de scaling 100×)
  - Collar Put mismo precio/strike → rango acotado superior e inferior
  - Covered Straddle → ingresos por primas vs riesgo ilimitado
- Integración: flujo contexto -> estrategia -> explicación, incluidos errores de IA.
- Contratos: validación de esquema de respuestas estructuradas. Validar que `confidence` usa escala [0.00, 1.00].
- No funcionales:
  - Cobertura mínima 80% en rutas críticas.
  - Prueba de latencia p95 <= 5s con fallback asíncrono (polling cada 2s, timeout 30s, máximo 15 intentos).
  - Prueba de autorización por rol (`analyst`, `risk_manager`) y bloqueo de ejecución.
  - Prueba de retención y recuperación de trazas a 365 días.
  - Prueba de degradación de fuentes: verificar que cada fuente fallida reporta `error.code` estandarizado y no bloquea las demás.
  - Prueba frontend: verificar 3 estados (loading, error, vacío) en cada componente.

Test Fixtures (concrete):
- Fixture A (Nominal): SPY-like market, normal volatility, liquidity high. Use sample 30-day time series + sample institutional flows. Expect strategy selection: Protective Put at ATM+/-5%.
- Fixture B (Stress tail): sudden 25% drop in underlying, IV spike; low liquidity. Validate strategy shows increased hedge size and rejects low-OI strikes.
- Fixture C (Low-liquidity): low ADV, wide spreads; validate system rejects certain strikes and marks `low_liquidity` in evidence.
- Fixture D (Payoff precision): 3 escenarios con valores numéricos fijos para Protective Put, Collar Put, Covered Straddle. Verificar que payoff de opciones escala correctamente contra número de acciones.

Sensitivity & Acceptance thresholds:
- Risk/Reward thresholds: define `target_risk_reduction_pct` (default 60%) and `min_expected_return_pct` (e.g., 0.5% over horizon) for strategy acceptance; measurable in unit tests.
- Payoff matrices: include example spreadsheets for each strategy with expected P/L at key price points (-20%, -10%, 0%, +10%, +20%).

## 8) Dependencias y Secuenciación

Dependencias:
- Datos normalizados y evidencia operativa compartida.
- Contratos transversales de persistencia/auditoría.

Secuencia recomendada:
1. Contratos y modelo de datos de contexto/estrategias.
2. Core institucional + core de estrategias.
3. Servicio de explicación IA + degradación controlada.
4. Endpoints, observabilidad, pruebas y hardening.
5. Corrección de payoff en motores de cobertura (T504, T505) — escalado de opciones usa `strategy.shares` en vez de `contractScale`.
6. Corrección de `enddt` hardcodeado en SEC EDGAR (T502) — fecha dinámica en EFTS search.
7. Validación de renderizado frontend (T506-T511, T503) — crashes, estados faltantes, tipos incorrectos.
8. **Phase 8** — Performance Optimization Institutional: parallel fetch, shared crumb session, cache key simplification (T801-T805).
9. **Phase 9** — Performance Optimization Coverage: pre-computed results, MC skip, parallel I/O, parallel notifications (T806-T809).

## Reconstruction Procedure (traceability)

- Objective: permitir reconstruir cualquier `explanation_response` desde persisted traces.
- Procedure:
  1. Given `context_id`, lookup `institutional_context` and `evidence_bundle` references in persistence.
  2. Retrieve `evidence_ids[]` and associated raw artifacts (stored immutably or via versioned object keys).
  3. Reconstruct model inputs: normalize evidence into the same pre-processing pipeline used in production (document pipeline version must be recorded in trace).
  4. Re-run deterministic parts of strategy engine using same `strategy_policy` and `model_version` recorded in trace.
  5. Compute `response_hash` (SHA256) over canonical serialization (JSON canonicalization) and compare with stored `response_hash` to validate integrity.
  6. Produce audit bundle containing: `{context_snapshot, evidence_bundle, strategy_policy_version, model_version, response_hash, reconstruction_steps_log}`.

## API Contract Versioning & Backward Compatibility

- Rules:
  - Contracts are versioned with MAJOR.MINOR.PATCH (semver). Breaking changes => MAJOR++.
  - Consumers must declare supported major versions; providers keep older MAJOR endpoints for at least 90 days after deprecation notice.
  - Additive, non-breaking fields use MINOR++ and are optional for older clients.
  - Schema validation: use JSON Schema with `$schema` and `examples` embedded; CI validates new contract versions against a compatibility test suite.


## 9) Ready / Gaps

- **Ready**: READY_FOR_SPECKIT_TASKS
- **Gaps**:
  - Pendiente materializar catálogos de escenarios de prueba extremos por mercado.

**Resueltos desde la versión anterior del plan**:
  - ✅ T504-T505: Payoff scaling corregido (usa `strategy.shares` en vez de `contractScale`) + cálculo real de primas Black-Scholes.
  - ✅ T502: `enddt` ahora dinámico en EFTS search de SEC EDGAR.
  - ✅ T506-T511: Frontend rendering validation — crashes, estados, tipos corregidos.
  - ✅ T801-T805 (Phase 8): Parallel source fetching, shared crumb session, cache key simplification.
  - ✅ T806-T809 (Phase 9): Pre-computed results, MC skip, parallel I/O, parallel notifications.

## 10) Siguiente Paso

Ejecutar las tareas priorizadas del `tasks.md`: las tareas pendientes (canónicas T106-T121, T173) permanecen como backlog. Las optimizaciones de rendimiento Phase 8 y Phase 9 están completadas. Próximo paso recomendado: implementar tests de performance para medir la mejora real en latencia.
