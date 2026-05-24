# Data Model: 006-team-05-institucional-cobertura

## Entities

### InstitutionalContext

Representa el análisis de contexto institucional para un ticker en un período y horizonte dados.

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `context_id` | `string` (UUID) | sí | Identificador único del contexto |
| `ticker` | `string` | sí | Símbolo del instrumento (ej. "AAPL") |
| `instrument` | `string` | no | Nombre del instrumento |
| `strike` | `number` | no | Strike price (si aplica) |
| `period` | `enum` | sí | `"intraday"` \| `"daily"` \| `"weekly"` \| `"monthly"` \| `"quarterly"` |
| `volume` | `number` ≥ 0 | sí | Volumen de negociación |
| `liquidity` | `enum` | sí | `"low"` \| `"medium"` \| `"high"` |
| `horizon` | `enum` | sí | `"short"` \| `"medium"` \| `"long"` |
| `funds_ownership_pct` | `number` [0, 100] | sí | Porcentaje en manos de fondos |
| `flows` | `object` | sí | `{ inflows: number, outflows: number, as_of: string }` |
| `open_positions` | `object` | sí | `{ count: integer ≥ 0, notional?: number ≥ 0 }` |
| `source_ids` | `string[]` | no | Fuentes que contribuyeron al análisis |
| `requested_at` | `string` (ISO 8601) | sí | Timestamp de la solicitud |

### SourceReport

Reporte individual por fuente de datos externa.

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `source_id` | `string` | sí | Identificador de la fuente |
| `kind` | `string` | sí | Tipo de fuente |
| `label` | `string` | sí | Nombre legible |
| `status` | `enum` | sí | `"ok"` \| `"error"` \| `"cached"` |
| `took_ms` | `number` | sí | Tiempo de respuesta en ms |
| `observation` | `object?` | no | Datos observados si status = ok |
| `observation.as_of` | `string` | no | Timestamp de la observación |
| `observation.confidence` | `number` [0, 1] | no | Confianza del parser |
| `observation.volume` | `number` | no | Volumen reportado |
| `observation.funds_ownership_pct` | `number` | no | Ownership porcentual |
| `observation.open_positions` | `object` | no | Posiciones abiertas |

### CoverageStrategy

Representa una estrategia de cobertura calculada.

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `strategy_id` | `string` (UUID) | sí | Identificador único de la estrategia |
| `kind` | `enum` | sí | `"protective_put"` \| `"married_put"` \| `"collar_put"` \| `"covered_straddle"` |
| `ticker` | `string` | sí | Símbolo del subyacente |
| `shares` | `integer` ≥ 1 | sí | Cantidad de acciones |
| `underlying_price` | `number` ≥ 0 | no | Precio actual del subyacente |
| `legs` | `array` | sí | Array de objetos Leg |
| `capital` | `number` ≥ 0 | sí | Capital disponible |
| `risk_tolerance_pct` | `number` [0, 1] | sí | Tolerancia al riesgo |
| `target_move_pct` | `number` | no | Movimiento esperado del subyacente |
| `scenario` | `string` | no | Escenario de simulación |
| `requested_at` | `string` (ISO 8601) | sí | Timestamp de la solicitud |

#### Leg

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `side` | `enum` | sí | `"long"` \| `"short"` |
| `type` | `enum` | sí | `"call"` \| `"put"` |
| `strike` | `number` ≥ 0 | sí | Strike price |
| `premium` | `number` ≥ 0 | sí | Prima por acción |
| `expiration` | `string` (ISO 8601) | sí | Fecha de expiración |
| `multiplier` | `integer` ≥ 1 | no | Multiplicador del contrato (default: 100) |

### Explanation

Representa una explicación generada por IA para una estrategia.

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `response_id` | `string` (UUID) | sí | Identificador único de la respuesta |
| `context_id` | `string` (UUID) | sí | Referencia al InstitutionalContext |
| `strategy_id` | `string` (UUID) | sí | Referencia a la CoverageStrategy |
| `narrative` | `string` | sí | Narrativa explicativa |
| `traceability` | `object` | sí | Ver Traceability |
| `ai_unavailable` | `boolean` | no | Flag de indisponibilidad de IA |
| `requested_at` | `string` (ISO 8601) | sí | Timestamp de la solicitud |

#### Traceability

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `evidence_ids` | `string[]` | sí | IDs de evidencia usada |
| `model_version` | `string` | sí | Versión del modelo de IA |
| `response_hash` | `string` | sí | SHA256 hash de la respuesta |

### Evidence

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `evidence_id` | `string` | Identificador único |
| `context_id` | `string` | Referencia al contexto |
| `source_id` | `string` | Fuente de origen |
| `raw_data` | `object` | Datos originales |
| `normalized_at` | `string` | Timestamp de normalización |
| `retention_expires_at` | `string` | Fecha de expiración (+365 días) |

## State Transitions

### Analysis Request Lifecycle

```
Request ─► Fetch sources ─► Normalize ─► Merge ─► Return response
                │
                ▼
         Partial failure ─► Skip failed sources ─► Continue with rest
                │
                ▼
         All fail ─► HTTP 503
```

### AI Chat Polling Lifecycle

```
Request ─► p95 ≤ 5s? ─► Sí ─► Return synchronous response
                │
                No
                ▼
         Return async ─► Client polls /poll/:id each 2s
                │
                ├─ completed ─► Return response
                ├─ pending ─► Continue polling
                └─ timeout (30s / 15 attempts) ─► ai_unavailable = true
```

## Relationships

```
Evidence ──► InstitutionalContext (many-to-one)
                 │
                 ▼
         CoverageStrategy (one-to-many per context)
                 │
                 ▼
         Explanation (one-to-one per strategy)
                 │
                 ▼
         Traceability (embedded in Explanation)
```
