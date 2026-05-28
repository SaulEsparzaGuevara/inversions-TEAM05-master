# Data Model: 011-team-05-full-migration

## Entidades Nuevas del Backend

### `InstitutionalAnalysisContract`

Input principal para todos los engines institucionales.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `analysisId` | string | UUID del análisis |
| `ticker` | string | Símbolo del activo (ej: "AAPL") |
| `instrument` | string? | Nombre del instrumento |
| `strike` | number? | Strike de referencia |
| `period` | `InstitutionalAnalysisPeriod` | `"intraday"\|"daily"\|"weekly"\|"monthly"\|"quarterly"` |
| `volume` | number | Volumen estimado |
| `liquidity` | `"low"\|"medium"\|"high"` | Nivel de liquidez |
| `horizon` | `"short"\|"medium"\|"long"` | Horizonte de inversión |
| `fundsOwnershipPct` | number | Porcentaje en manos de fondos (0-100) |
| `flows` | `InstitutionalFlowSnapshot` | `{ inflows, outflows, asOf }` |
| `openPositions` | `InstitutionalOpenPositionsSnapshot` | `{ count, notional? }` |
| `sourceIds` | string[]? | IDs de fuentes usadas |
| `requestedAt` | string | ISO timestamp |

### `InstitutionalSourceObservation`

Output normalizado de cada fuente de datos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `sourceId` | string | ID de la fuente |
| `confidence` | number | Score [0.00, 0.95] — nunca 1.0 |
| `fundsOwnershipPct` | number? | % en manos de fondos |
| `volume` | number? | Volumen institucional |
| `flows` | `InstitutionalFlowSnapshot?` | Flujos de entrada/salida |
| `openPositions` | `InstitutionalOpenPositionsSnapshot?` | Posiciones abiertas |

### `CoverageStrategyContract`

Input para engines de cobertura.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `strategyId` | string | ID de la estrategia |
| `kind` | `CoverageStrategyKind` | `"protective_put"\|"married_put"\|"collar_put"\|"covered_straddle"` |
| `ticker` | string | Símbolo del subyacente |
| `shares` | number | Cantidad de acciones |
| `underlyingPrice` | number | Precio actual del subyacente |
| `legs` | `CoverageOptionLeg[]` | Patas de opciones (long/short, call/put, strike, premium, expiry) |
| `capital` | number | Capital total de la posición |
| `riskTolerancePct` | number | Tolerancia al riesgo (0-1, ej: 0.05=5%) |
| `requestedAt` | string | ISO timestamp |

### `RiskMetrics` (modificado — campos nuevos opcionales)

| Campo | Tipo | Descripción | Novedad |
|-------|------|-------------|---------|
| `stopLossPrice` | number | Stop-loss principal (retrocompatibilidad) | Existente |
| `stopLossLowPrice` | number? | Banda inferior del collar | **NUEVO** |
| `stopLossHighPrice` | number? | Banda superior del collar | **NUEVO** |

Los demás campos de `RiskMetrics` no cambian:
`riskProfile`, `maxProtection`, `protectionFloorPrice`, `protectionCeilingPrice?`, `netPremium`, `netPremiumPerShare`, `costBenefitRatio`, `downsideRisk`, `upsideCap`, `breakEvenPrice`, `marginRequirement`, `exerciseRiskScore`, `volatilityStressLoss`

---

## Reglas de Negocio Críticas

### normalCdf (Black-Scholes)

```
Φ(x) = 1 - φ(x) · poly(k)   para x ≥ 0
φ(x) = exp(-x²/2) / √(2π)   // PDF normal estándar
k = 1 / (1 + 0.2316419 · |x|)
poly(k) = 0.31938·k - 0.35656·k² + 1.78148·k³ - 1.82126·k⁴ + 1.33027·k⁵
```

Verificación: `normalCdf(0) ≈ 0.500`, error máximo `|ε| < 7.5×10⁻⁸`

### Stop-Loss Buffer (ProtectivePut)

```
buffer = clamp(riskTolerancePct × 0.5, 0.01, 0.10)
buffer = 0.03  cuando riskTolerancePct === 0 (fallback)
stopLossPrice = putStrike × (1 - buffer)
```

### Collar Stop-Loss Bands

```
stopLossLow  = putStrike  × (1 - bufferPct)   // default bufferPct=0.04
stopLossHigh = callStrike × (1 + bufferPct)
stopLossPrice = stopLossLow   // retrocompatibilidad
```

### Confidence Scoring (InstitutionalDataService)

```
señales = [fundsOwnershipPct, volume, flows.inflows, flows.outflows, openPositions.count]
score = count(señales_significativas) ≥ 4 → 0.95
                                       3 → 0.85
                                       2 → 0.70
                                    else → 0.55
score = min(score, 0.95)   // nunca 1.0
```

### Merge de Observaciones Múltiples

| Campo | Estrategia | Razón |
|-------|-----------|-------|
| `fundsOwnershipPct` | PROMEDIO | Dos fuentes pueden overlappear en los mismos fondos |
| `volume` | MÁXIMO | La fuente con más granularidad gana |
| `flows.inflows/outflows` | SUMA | Flows son aditivos entre fuentes |
| `openPositions.count` | MÁXIMO | La fuente más completa domina |
| Campos categóricos | FIRST por confidence desc | La fuente más confiable gana |
| `liquidity` | HIGHEST (`high > medium > low`) | Conservar estimación más favorable |

### Estacionalidad Mensual (ExpirationAnalysisEngine)

| Mes | Bias | Evidencia |
|-----|------|-----------|
| Enero | neutral | Variable, "January effect" inconsistente |
| Febrero | neutral | Variable |
| Marzo | neutral | OpEx trimestral, volátil |
| Abril | bullish | Primavera alcista histórica |
| Mayo | neutral | "Sell in May" parcialmente respaldado |
| Junio | neutral | OpEx trimestral, mixto |
| Julio | bullish | Rally de verano histórico |
| Agosto | neutral | Verano, bajo volumen |
| Septiembre | **bearish** | Peor mes del año históricamente |
| Octubre | neutral | Volátil pero cierra positivo en promedio |
| Noviembre | **bullish** | "Santa rally" comienza |
| Diciembre | **bullish** | Mejor mes del año por retorno promedio |

---

## Entidades Frontend

### `ApiCache` (módulo `apiCache.ts`)

Cache in-memory con TTL, sin persistencia:

```typescript
type CacheEntry<T> = { value: T; expiresAt: number }
type Cache = Map<string, CacheEntry<unknown>>
cacheKey = URL + JSON.stringify(body)
defaultTTL = 300_000  // 5 minutos
```

### `ChatState` (store `chat.ts`)

Persistido en memoria de sesión (no localStorage):

```typescript
type ChatMessage = {
  id: string
  question: string
  narrative?: string
  reasoning?: string[]
  scenarioAnalysis?: ScenarioItem[]
  recommendation?: string
  status: "loading" | "completed" | "error"
  ai_unavailable?: boolean
  pollingAttempts?: number
  timestamp: string
}
```

---

## Sin Cambios en Persistencia

- No se agregan ni modifican tablas de base de datos.
- No se agregan migraciones de Supabase.
- No se modifican contratos JSON (`strategy.v1.json`, `institutional_context.v1.json`, `explanation.v1.json`).
- El cache FINRA persiste en `/tmp/inversions-api-finra-cache.json` (efímero, se regenera al restart).
