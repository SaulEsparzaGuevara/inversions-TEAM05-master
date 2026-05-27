# Data Model: Plataforma de Inversiones con IA

## Resumen

El modelo cubre entidades operativas para analisis, confluencia, aprobacion humana, ejecucion asistida, auditoria y cumplimiento. Esta version esta alineada a `FR-001..FR-019` y `SC-001..SC-008`.

## Entidades

### Usuario

- Campos:
  - `id` (UUID)
  - `email` (string)
  - `status` (`ACTIVE` | `INACTIVE`)
  - `role` (`viewer` | `trader` | `admin`)
  - `mfa_enabled` (boolean)
  - `created_at` (timestamp)
- Reglas:
  - Solo `trader` y `admin` pueden aprobar/ejecutar.
  - Aprobacion y ejecucion de `trader`/`admin` requieren MFA valido (`FR-019`).

### ActivoInversion

- Campos:
  - `id` (UUID)
  - `symbol` (string)
  - `asset_type` (`EQUITY` | `OPTION`)
  - `market` (`US`)
  - `status` (`ACTIVE` | `INACTIVE`)
- Reglas:
  - v1 admite solo acciones/opciones del mercado US.

### FuenteAnalitica

- Campos:
  - `id` (UUID)
  - `name` (string)
  - `category` (`TECHNICAL` | `FUNDAMENTAL` | `OPTIONS` | `FLOW` | `NEWS` | `AI`)
  - `enabled` (boolean)
  - `weight` (decimal)
- Reglas:
  - La IA no puede ser fuente unica para ejecucion (`FR-010`).

### SenalInversion

- Campos:
  - `id` (UUID)
  - `activo_id` (UUID -> ActivoInversion)
  - `signal` (`BUY` | `SELL` | `HOLD`)
  - `confidence` (0..1)
  - `confluence_score` (0..100)
  - `status` (`GENERATED` | `REVIEWED` | `EXPIRED`)
  - `created_at` (timestamp)
  - `expires_at` (timestamp, nullable)
- Reglas:
  - Debe existir explicacion trazable para cada senal (`FR-002`).

### EvidenciaAnalitica

- Campos:
  - `id` (UUID)
  - `senal_id` (UUID -> SenalInversion)
  - `fuente_id` (UUID -> FuenteAnalitica)
  - `verdict` (`BUY` | `SELL` | `HOLD` | `NEUTRAL`)
  - `rationale` (text)
  - `confidence` (0..1)
  - `captured_at` (timestamp)
- Reglas:
  - Rationale obligatorio para auditabilidad.

### PropuestaOperativa

- Campos:
  - `id` (UUID)
  - `senal_id` (UUID -> SenalInversion)
  - `broker_target` (`IBKR` | `ALPACA`)
  - `order_type` (`MARKET` | `LIMIT`)
  - `side` (`BUY` | `SELL`)
  - `qty` (decimal)
  - `limit_price` (decimal, nullable)
  - `status` (`PENDING_APPROVAL` | `APPROVED` | `REJECTED` | `SUBMITTED` | `PARTIALLY_FILLED` | `FILLED` | `CANCELLED` | `FAILED`)
  - `version` (integer)
  - `created_at` (timestamp)
- Reglas:
  - No se permite `SUBMITTED` sin aprobacion previa valida (`FR-004`,`FR-005`).
  - `version` aplica optimistic locking (`FR-016`).
  - Tras `FAILED`, cualquier reintento debe volver a `PENDING_APPROVAL` (`FR-009`).

### DecisionHumana

- Campos:
  - `id` (UUID)
  - `propuesta_id` (UUID -> PropuestaOperativa)
  - `user_id` (UUID -> Usuario)
  - `decision` (`APPROVE` | `REJECT`)
  - `mfa_session_id` (string, nullable)
  - `reason` (text, nullable)
  - `created_at` (timestamp)
- Reglas:
  - `APPROVE` para `trader/admin` requiere `mfa_session_id` valido.

### IntentoEjecucion

- Campos:
  - `id` (UUID)
  - `propuesta_id` (UUID -> PropuestaOperativa)
  - `broker` (`IBKR` | `ALPACA`)
  - `broker_order_id` (string, nullable)
  - `attempt_status` (`SUBMITTED` | `PARTIALLY_FILLED` | `FILLED` | `CANCELLED` | `FAILED` | `REJECTED`)
  - `error_code` (string, nullable)
  - `error_message` (text, nullable)
  - `retryable` (boolean)
  - `attempted_at` (timestamp)
- Reglas:
  - Fallos deben quedar normalizados y auditados.

### RegistroAuditoria

- Campos:
  - `id` (UUID)
  - `entity_type` (string)
  - `entity_id` (UUID)
  - `event_type` (string)
  - `actor_type` (`USER` | `SYSTEM` | `BROKER`)
  - `payload` (JSON)
  - `occurred_at` (timestamp)
  - `retain_until` (date)
- Reglas:
  - Retencion minima de 365 dias (`FR-007`).

## Relaciones

- Un `Usuario` puede emitir muchas `DecisionHumana`.
- Un `ActivoInversion` puede tener muchas `SenalInversion`.
- Una `SenalInversion` tiene muchas `EvidenciaAnalitica` y puede originar muchas `PropuestaOperativa`.
- Una `PropuestaOperativa` tiene muchas `DecisionHumana` (historial) y muchos `IntentoEjecucion`.
- Todas las entidades operativas emiten `RegistroAuditoria`.

## Transiciones de Estado

### PropuestaOperativa

- `PENDING_APPROVAL` -> `APPROVED`
- `PENDING_APPROVAL` -> `REJECTED`
- `APPROVED` -> `SUBMITTED`
- `SUBMITTED` -> `PARTIALLY_FILLED`
- `SUBMITTED` -> `FILLED`
- `SUBMITTED` -> `CANCELLED`
- `SUBMITTED` -> `FAILED`
- `PARTIALLY_FILLED` -> `FILLED`
- `PARTIALLY_FILLED` -> `CANCELLED`
- `PARTIALLY_FILLED` -> `FAILED`
- `FAILED` -> `PENDING_APPROVAL`

### SenalInversion

- `GENERATED` -> `REVIEWED`
- `REVIEWED` -> `EXPIRED`

## Notas de Persistencia

- Supabase: entidades operativas y relaciones principales.
- MongoDB opcional: historicos analiticos y payloads extensos de contexto IA.
- Todo acceso de escritura se realiza server-side en backend.
