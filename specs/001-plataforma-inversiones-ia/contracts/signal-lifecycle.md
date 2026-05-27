# Contract: Signal Lifecycle

## Proposito

Definir ciclo de vida compartido entre evidencia analitica, senal, propuesta operativa, decision humana y ejecucion asistida.

## Lifecycle Stages

1. Ingestion de market data y evaluacion de fuentes analiticas activas.
2. Generacion de evidencia por core con rationale trazable.
3. Confluencia y emision de senal (`BUY|SELL|HOLD`) con confianza.
4. Enriquecimiento opcional IA (explicacion/riesgo) sin autoridad de ejecucion.
5. Creacion de propuesta operativa en `PENDING_APPROVAL`.
6. Decision humana (`APPROVE|REJECT`) con MFA cuando aplique.
7. Submission a broker solo si estado `APPROVED` y version vigente.
8. Registro de resultado (`FILLED|PARTIALLY_FILLED|CANCELLED|REJECTED|FAILED`).
9. Si hay `FAILED`, transicion obligatoria a `PENDING_APPROVAL` para reintento.

## Invariants

- Toda senal debe ser explicable y auditable (`FR-002`,`FR-006`).
- IA nunca es base unica de ejecucion (`FR-010`).
- No existe ejecucion sin aprobacion valida (`FR-004`,`FR-005`).
- Se aplica optimistic locking por version de propuesta (`FR-016`).
- Evidencia y auditoria se retienen al menos 365 dias (`FR-007`).

## Campos Obligatorios de Traza por Evento

Todo evento del ciclo debe registrar al menos:

- `event_id`
- `timestamp_utc`
- `correlation_id`
- `signal_id`
- `proposal_id`
- `user_id`
- `role`
- `action_type`
- `previous_state`
- `new_state`

Campos condicionales (cuando aplique):

- `broker`
- `instrument`
- `order_type`
- `quantity`
- `price`
- `outcome_code`
- `error_code`
- `mfa_context_id`
- `evidence_ref`

## Eventos Auditables Minimos

- `SIGNAL_GENERATED`
- `PROPOSAL_CREATED`
- `HUMAN_APPROVED`
- `HUMAN_REJECTED`
- `EXECUTION_SUBMITTED`
- `EXECUTION_FAILED`
- `EXECUTION_FILLED`
- `EXECUTION_CANCELLED`
- `DISCLAIMER_ACKNOWLEDGED`

## Eventos de Disclaimer Obligatorios

- `DISCLAIMER_SHOWN`: cuando la UI muestra el disclaimer previo a aprobacion/ejecucion.
- `DISCLAIMER_ACKNOWLEDGED`: cuando el usuario confirma explicitamente el disclaimer.

Regla contractual:

- No se permite `HUMAN_APPROVED` sin evidencia previa de `DISCLAIMER_ACKNOWLEDGED` para la misma `proposal_id`/`correlation_id`.
