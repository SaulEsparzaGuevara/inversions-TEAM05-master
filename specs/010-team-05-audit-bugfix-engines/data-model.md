# Data Model: 010-team-05-audit-bugfix-engines

## Cambios al Modelo de Datos

Esta spec introduce únicamente cambios internos en lógica de engines y un campo opcional en `RiskMetrics`. No se modifican contratos JSON públicos, rutas de API, ni esquemas de base de datos.

---

### Cambios en `RiskMetrics` (coverageTypes.ts)

| Campo | Tipo | Antes | Después | Nota |
|-------|------|-------|---------|------|
| `stopLossLowPrice` | `number` (opcional) | No existía | `putStrike × (1 - bufferPct)` | Bug T1001 — banda inferior del collar |
| `stopLossHighPrice` | `number` (opcional) | No existía | `callStrike × (1 + bufferPct)` | Bug T1001 — banda superior del collar |
| `stopLossPrice` | `number` | `min(low, high)` = siempre `low` | `stopLossLow` (retrocompatibilidad) | Preservado para consumers existentes |

Los campos `stopLossLowPrice` y `stopLossHighPrice` solo se establecen en `CollarEngine`. `ProtectivePutEngine` y `CoveredStraddleEngine` no los establecen (quedan `undefined`).

---

### Cambios en lógica interna `normalCdf` (coverageTypes.ts)

| Función | Campo afectado | Antes | Después |
|---------|---------------|-------|---------|
| `normalCdf(x)` | cálculo de `cdf` | `(1 - φ(x)) × poly` → incorrecto | `φ(x) × poly` → correcto |
| `estimateOptionPremium()` | primas Black-Scholes | Valores incorrectos (ej. N(0)≈0.247) | Valores correctos (N(0)≈0.500) |

No se modifica la firma pública de `estimateOptionPremium`. Ningún contrato JSON referencia valores de primas calculadas internamente.

---

### Cambios en outputs de `InstitutionalTrendEngine` (institutionalTrendEngine.ts)

| Campo | Antes | Después | Nota |
|-------|-------|---------|------|
| Candles de fallback | No determinísticos (`Math.random()`) | Determinísticos (seeded LCG) | Bug T1002 |
| `trend` resultado | Puede variar entre llamadas | Consistente para mismo ticker | Bug T1002 |

No se modifica la interfaz `InstitutionalOhlcCandle` ni el tipo de retorno del análisis.

---

### Cambios en outputs de `ExpirationAnalysisEngine` (expirationAnalysisEngine.ts)

| Campo | Antes | Después | Nota |
|-------|-------|---------|------|
| Evento CPI (`type:"cpi"`) | `date = 2do miércoles` | `date = 2do martes` | Bug T1003 |
| Eventos Triple Witching | Puede haber 2 `quarterly_opex` por fecha | Exactamente 1 por fecha | Bug T1004 |
| `directionalBias` (sep) | `"neutral"` | `"bearish"` | Bug T1005 |
| `directionalBias` (oct) | `"bearish"` | `"neutral"` | Bug T1005 |
| `directionalBias` (nov) | `"bearish"` | `"bullish"` | Bug T1005 |
| `directionalBias` (dic) | `"bearish"` | `"bullish"` | Bug T1005 |

No se modifican las interfaces `ExpirationEvent`, `MacroWindow` ni contratos públicos del módulo institucional.

---

### Sin cambios en interfaces TypeScript públicas

- `RiskMetrics` — se agregan dos campos opcionales (`stopLossLowPrice?`, `stopLossHighPrice?`). Los campos existentes no se modifican ni se eliminan.
- `CoverageStrategyResult` — sin cambios.
- `InstitutionalAnalysisResult` — sin cambios.
- `InstitutionalOhlcCandle` — sin cambios.
- Todos los contratos JSON (`strategy.v1.json`, `institutional_context.v1.json`, `explanation.v1.json`) — sin cambios.

### Sin cambios en entidades de persistencia

- No se agregan ni modifican tablas de base de datos.
- No se agregan ni modifican migraciones.
- No se agregan ni modifican jobs de purge o retención.
