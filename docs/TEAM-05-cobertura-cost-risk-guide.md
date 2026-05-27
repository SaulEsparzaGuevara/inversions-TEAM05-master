# Guía de Indicadores Cost/Risk — Estrategias de Cobertura

**Versión**: 1.0 | **Fecha**: 2026-05-21 | **Feature**: `007-team-05-frontend-cobertura`

---

## 1. Propósito

Esta guía explica la semántica de los indicadores de costo y riesgo que aparecen en el panel derecho de las tarjetas de estrategia de cobertura en la página `/coverage/strategies`. Está dirigida a:

- **Desarrolladores** que mantienen o extienden los motores de cobertura
- **QA/Testers** que validan la corrección de los valores mostrados
- **Presentadores** que necesitan defender el significado de cada indicador ante stakeholders

---

## 2. Arquitectura del flujo de datos

```
Usuario ingresa ticker, precio, shares, strikes
        │
        ▼
POST /api/coverage/analyze
        │
        ▼
routes/coverage/analyze.ts (ruta delgada)
        │
        ▼
Motores de cobertura (coverageEngine.ts)
  ├── protectivePutEngine.ts
  ├── marriedPutEngine.ts
  ├── collarEngine.ts
  └── coveredStraddleEngine.ts
        │
        ▼
Cada engine calcula:
  1. PayoffSimulation (array price→PnL)
  2. RiskMetrics (objeto con todos los indicadores)
  3. Alerts (array de alertas)
        │
        ▼
coverageStrategyAdapter.ts transforma a StrategyOutput estándar
  ├── Calcula score compuesto (0-1)
  ├── Mapea score → ConfidenceLevel (ALTA≥0.7, MEDIA≥0.4, BAJA<0.4)
  └── Engrosa RiskMetrics con formatos estándar
        │
        ▼
Respuesta JSON → CoverageStrategiesPage.tsx
  ├── PayoffChart (lado izquierdo)
  ├── RiskMetrics (lado derecho, lista de indicadores)
  └── Badge de confianza (ALTA/MEDIA/BAJA en encabezado)
```

---

## 3. Indicadores uno por uno

### 3.1 Prima neta (`netPremium`)

| Atributo | Valor |
|----------|-------|
| **¿Qué es?** | Flujo de caja neto para abrir la posición completa |
| **Fórmula** | `Σ(leg.premium × legScale × side_sign)` donde long=+1, short=−1 |
| **Unidad** | Dólares ($) |
| **Ejemplo Collar** | Long Put $2.50 + Short Call −$2.50 = **$0.00** |
| **Zero-Cost** | **$0.00** cuando las primas se cancelan |
| **¿Qué NO es?** | ❌ Comisión del broker ❌ Margen requerido ❌ Prima de una sola leg |

**Caso concreto**: Si ves `Prima neta: $250.00` en un Protective Put, significa que pagaste $250 por el put protector. Es un **costo de entrada** (debito).

### 3.2 Downside (`downsideRisk`)

| Atributo | Valor |
|----------|-------|
| **¿Qué es?** | Pérdida máxima posible en el peor escenario de mercado |
| **Fórmula** | `max(0, (currentPrice − putStrike + netPremiumPerShare)) × shares` |
| **Unidad** | Dólares ($) |
| **Ejemplo** | AAPL $200, Put $180, prima neta $2/share: `(200 − 180 + 2) × 100 = $2,200` |
| **Zero-Cost Collar** | `(currentPrice − putStrike) × shares` (sin prima neta) |
| **¿Qué NO es?** | ❌ Prima pagada ❌ Margen requerido ❌ VaR |

### 3.3 Protección (`protectionFloorPrice`)

| Atributo | Valor |
|----------|-------|
| **¿Qué es?** | Precio piso: el strike del put donde comienza la protección |
| **Fórmula** | `strike del put` |
| **Unidad** | Dólares por acción ($) |
| **Ejemplo** | En AAPL $200 con Put $180: protección = **$180.00** |
| **Interpretación** | Si AAPL cae a $150, el put te paga la diferencia hasta $180. Tu pérdida máxima está acotada |

### 3.4 Tope (`protectionCeilingPrice`)

| Atributo | Valor |
|----------|-------|
| **¿Qué es?** | Precio techo: el strike del call corto que limita el upside (solo Collar) |
| **Fórmula** | `strike del call` |
| **Unidad** | Dólares por acción ($) |
| **¿Cuándo aparece?** | Solo en estrategia `collar_put` |
| **Ejemplo** | AAPL $200 con Call $220: tope = **$220.00**. Si AAPL sube a $250, igual vendes a $220 |

### 3.5 Break-even (`breakevenPrice`)

| Atributo | Valor |
|----------|-------|
| **¿Qué es?** | Precio del subyacente donde PnL = $0 |
| **Fórmula** | `currentPrice + netPremiumPerShare` |
| **Unidad** | Dólares por acción ($) |
| **Ejemplo** | AAPL $200, prima neta $2.50 (pagada): break-even = **$202.50** |
| **Nota** | No incluye comisiones, slippage, ni financing costs |

### 3.6 Max Profit / Max Loss

| Indicador | Fórmula | Ejemplo AAPL $200, Put $180, Call $220 |
|-----------|---------|--------------------------------------|
| **Max Profit** | `(callStrike − currentPrice + netPremiumPerShare) × shares` (si es finito) o `∞` | ($220 − $200 + $0) × 100 = **$2,000** |
| **Max Loss** | `(currentPrice − putStrike + netPremiumPerShare) × shares` (si es finito) o `∞` | ($200 − $180 + $0) × 100 = **$2,000** |

### 3.7 Margen (`marginRequirement`)

| Atributo | Valor |
|----------|-------|
| **¿Qué es?** | Colateral estimado requerido por el broker para mantener la posición |
| **Fórmula** | Basado en Regla T + margen de mantenimiento (estimación) |
| **Unidad** | Dólares ($) |
| **Precisión** | ⚠️ **Estimado**. No es un cálculo exacto de broker. Cada broker tiene sus propias reglas |
| **¿Qué NO es?** | ❌ Costo de entrada ❌ Prima pagada |

### 3.8 Cost-Benefit Ratio (`costBenefitRatio`)

| Atributo | Valor |
|----------|-------|
| **¿Qué es?** | Relación entre el beneficio (protección/upside limitado) y el costo (prima neta) |
| **Fórmula** | Collar: `(callStrike − putStrike) / |netPremiumPerShare|` |
| **Interpretación** | Mayor = mejor relación costo-beneficio |
| **Zero-Cost Collar** | Tiende a ∞ (prima neta ~0 divide por casi 0). Se capotea a `costEfficiencyScore = 1.0` en el score compuesto |

---

## 4. Confianza: ALTA / MEDIA / BAJA

### 4.1 Score compuesto

La confianza se calcula en `coverageStrategyAdapter.ts` con un score ponderado 0-1:

```typescript
const protectionScore = Math.min(1, rm.maxProtection / (currentPrice × shares) / 0.5);
const costEfficiencyScore = Math.min(1, Math.max(0, 1 − rm.costBenefitRatio / 0.5));
const riskScore = rm.riskProfile === "limited" ? 0.8 : 0.3;
const totalScore = protectionScore × 0.4 + costEfficiencyScore × 0.3 + riskScore × 0.3;
```

### 4.2 Mapeo a niveles

| Nivel | Score | Interpretación |
|-------|-------|----------------|
| **ALTA** | ≥ 0.70 | Estrategia bien balanceada: alta protección, costo eficiente, riesgo limitado |
| **MEDIA** | ≥ 0.40 | Señales mixtas: puede tener buena protección pero costo alto, o riesgo ilimitado |
| **BAJA** | < 0.40 | Estrategia poco recomendable: baja protección, costo ineficiente, riesgo ilimitado |

### 4.3 Relación con los montos en dólares

```
NO CONFUNDIR:
  ┌──────────────────────────────────────────────┐
  │  "ALTA $20.00" NO significa "ALTA cuesta $20" │
  └──────────────────────────────────────────────┘

  ALTA    = Confianza en la estrategia (ensoberbadura aparte)
  $20.00  = netPremium (prima neta, indicador independiente)
```

Son dos conceptos **ortogonales** que aparecen en distintas secciones de la UI:
- El **badge** ALTA/MEDIA/BAJA está en el **encabezado** de la tarjeta de estrategia
- Los **montos** ($20.00, $250.00, etc.) están en el **panel derecho** de métricas

---

## 5. Zero-Cost Collar

### 5.1 Concepto

Un **Zero-Cost Collar** es un Collar normal (`collar_put`) donde la prima del put que compras y la prima del call que vendes se cancelan mutuamente:

```
netPremium = putPremium (long, pagas) + (−callPremium) (short, recibes)
           = $2.50 + (−$2.50)
           = $0.00 ✅
```

### 5.2 No es un tipo de estrategia separado

En el código **no existe** `ZeroCostCollar` como `CoverageStrategyKind`. Es simplemente un `collar_put` donde `netPremiumPerShare ≈ 0.0`. El engine de collar (`collarEngine.ts`) lo calcula naturalmente cuando los strikes y primas ingresados resultan en cancelación.

### 5.3 Implicaciones en los indicadores

| Indicador | Collar normal ($2 prima neta) | Zero-Cost Collar |
|-----------|------------------------------|-------------------|
| netPremium | $200 (pagaste) | **$0.00** |
| netPremiumPerShare | $2.00 | **$0.00** |
| breakEvenPrice | $202.00 | $200.00 (mismo que current price) |
| costBenefitRatio | ($220 − $180) / $2 = 20 | ∞ (se capotea a 1.0) |
| costEfficiencyScore | 0.96 | 1.0 |

### 5.4 ¿Por qué podría ver $20.00 en un zero-cost collar?

Si el usuario ingresa strikes que NO cancelan exactamente las primas, el collar NO es zero-cost. Por ejemplo:

| Leg | Prima/share | Contribución |
|-----|-------------|-------------|
| Put $180 | $2.50 | +$2.50 |
| Call $225 | $1.50 | −$1.50 |
| **netPremiumPerShare** | | **$1.00** |
| **netPremium** (100 shares) | | **$100.00** |

Esto es un **collar con costo**, no zero-cost. Para lograr zero-cost, el usuario debe ajustar los strikes hasta que las primas se cancelen.

---

## 6. Fuentes de datos reales

### 6.1 FINRA Short Interest

| Aspecto | Detalle |
|---------|---------|
| **API** | `POST https://api.finra.org/data/group/otcmarket/name/consolidatedShortInterest` |
| **Caching** | `ensureFinraCache()` carga hasta 6 páginas (×5000 registros) de la fecha más reciente |
| **Almacenamiento** | `Map<string, FinraRecord[]>` a nivel de módulo |
| **Primer llamado** | ~4.6s (carga todas las páginas) |
| **Llamados subsecuentes** | ~0.06ms (cache hit) |
| **Eager preload** | Se dispara en `bootstrap.ts` al arrancar el servidor (no bloquea) |
| **Fallback** | Si ticker no está en caché, se retorna observación sintética con confianza 0.3 |

**Datos disponibles**: Históricos desde 2019 hasta ~2020-04-15 (fecha más reciente en el dataset público). Cada registro incluye: short position actual, short position anterior, volumen diario promedio, días para cubrir, cambio porcentual, fecha de liquidación.

### 6.2 SEC EDGAR 13F

| Aspecto | Detalle |
|---------|---------|
| **Búsqueda** | EFTS (Elasticsearch) en `https://efts.sec.gov/LATEST/search-index?q=TICKER&forms=13F-HR` |
| **Procesamiento** | XML parsing con regex de `<infoTable>` blocks |
| **Paralelismo** | `Promise.all` para hasta 5 filings concurrentes |
| **Tiempo típico** | ~3.4s para completar |
| **Datos obtenidos** | Instituciones que poseen el ticker, shares, valor en dólares |

**Limitación**: Solo los primeros 5 resultados de la búsqueda EFTS se procesan. No se obtienen todas las instituciones que poseen el ticker, solo una muestra.

---

## 7. Preguntas frecuentes (FAQ)

### ¿Por qué `netPremium` no es cero aunque estoy en un Collar?

Porque las primas del put y del call no se cancelan exactamente. Ajusta los strikes: sube el call strike (prima menor) o baja el put strike (prima menor) hasta que `putPremium ≈ callPremium`.

### ¿"ALTA" significa que la estrategia es cara/barata?

**No**. `ALTA` es la **confianza** en la estrategia (protección eficiente + riesgo limitado). El costo en dólares es `netPremium`, que es independiente.

### ¿`marginRequirement` es lo mismo que `netPremium`?

**No**. `netPremium` es el costo de entrada (lo que pagas/recibes por las opciones). `marginRequirement` es el colateral que el broker te pide mantener en la cuenta. Son conceptos distintos.

### ¿Por qué el break-even no es igual al current price?

En cualquier estrategia con prima neta distinta de cero, el break-even se desplaza. Solo en un Zero-Cost Collar (`netPremium = 0`) el break-even coincide con el current price.

### ¿Los valores de stop-loss son órdenes reales?

**No**. `stopLossPrice` es una **sugerencia** basada en el put strike + margen de tolerancia. No se envía ninguna orden al broker. Es responsabilidad del usuario gestionar sus stops.

### ¿El downside risk incluye comisiones?

**No**. Los cálculos de PnL no modelan comisiones de broker, slippage, ni financing costs. Todos los valores son "pre-comisiones".

---

## 8. Trazabilidad

| Concepto | Archivo | Líneas clave |
|----------|---------|-------------|
| RiskMetrics interface | `src/modules/strategies/coverage/coverageTypes.ts` | 39-54 |
| ConfidenceLevel enum | `src/modules/strategies/standards/strategyOutputStandard.ts` | 48-52 |
| Score compuesto | `src/modules/strategies/coverage/coverageStrategyAdapter.ts` | 61-86 |
| Cálculo netPremiumPerShare | `collarEngine.ts`, `protectivePutEngine.ts`, `coveredStraddleEngine.ts` | ~100 |
| FINRA cache | `src/modules/institutional/realSourceParsers.ts` | `ensureFinraCache()`, `parseFinraShortInterestReal()` |
| SEC EDGAR parser | `src/modules/institutional/realSourceParsers.ts` | `parseSecEdgar13fReal()` |
| Eager preload | `src/routes/institutional/bootstrap.ts` | `ensureFinraCache().catch(() => {})` |
| UI render panel derecho | `projects/pwa/inversions_app/src/pages/coverage/CoverageStrategiesPage.tsx` | 67-84 |
| Spec semántica | `specs/007-team-05-frontend-cobertura/spec.md` | §Indicadores Cost/Risk |
| Data model semántica | `specs/007-team-05-frontend-cobertura/data-model.md` | §RiskMetrics |
