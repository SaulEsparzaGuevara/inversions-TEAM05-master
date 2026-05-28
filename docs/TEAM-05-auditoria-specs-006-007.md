# Auditoría Técnica — Specs 006 y 007

**Proyecto:** Inversions Team 05  
**Fecha:** 2026-05-28  
**Revisor:** Claude (auditor de sistema — expertise en inversiones y derivados)  
**Alcance:** Módulo de análisis institucional (Spec 006) y estrategias de cobertura (Spec 007)

---

## Contexto

Antes del merge de las ramas de Spec 006 y Spec 007 al repositorio principal (`main`), se realizó una auditoría técnica completa de la lógica financiera implementada. El objetivo fue verificar la corrección matemática, la fidelidad financiera y la coherencia del sistema antes de exponerlo al entorno de producción.

Se revisaron los siguientes archivos core:

- `src/modules/strategies/coverage/protectivePutEngine.ts`
- `src/modules/strategies/coverage/collarEngine.ts`
- `src/modules/strategies/coverage/coveredStraddleEngine.ts`
- `src/modules/strategies/coverage/coverageTypes.ts`
- `src/modules/institutional/institutionalTrendEngine.ts`
- `src/modules/institutional/institutionalZonesEngine.ts`
- `src/modules/institutional/expirationAnalysisEngine.ts`
- `src/modules/institutional/institutionalDataService.ts`

---

## Resumen ejecutivo

La arquitectura es sólida y el conocimiento de opciones financieras es correcto en la mayoría de los casos. La implementación de payoff para las tres estrategias de cobertura (protective put, collar, covered strangle) es matemáticamente válida.

Sin embargo, se encontraron **3 bugs críticos** y **4 problemas importantes** que deben corregirse antes del merge. Adicionalmente se documentan varias limitaciones de diseño para tratarse como deuda técnica.

---

## PARTE 1 — Estrategias de cobertura (Spec 007)

### 1.1 Lo que está correcto

#### Protective Put / Married Put

| Cálculo | Fórmula implementada | Evaluación |
|---------|---------------------|------------|
| Payoff por escenario | `stockPnL + putPayoff - optionCost` | ✅ Correcto |
| Max loss | `max(0, currentPrice - strike + netPremium) × shares` | ✅ Correcto |
| Protection floor | `strike - netPremium` | ✅ Correcto |
| Break-even | `currentPrice + netPremium` | ✅ Correcto |
| Exercise risk | 70% distancia ITM + 30% cercanía a expiración | ✅ Razonable |
| Ventana early exercise | 21 días antes de expiración | ✅ Estándar de industria |

El payoff del protective put es correcto en todos los escenarios. Para cualquier precio `S` al vencimiento:

```
Si S < strike:  PnL = (S - cp)×n + (strike - S)×n - premium×n  = (strike - cp - premium)×n  → piso fijo
Si S ≥ strike:  PnL = (S - cp)×n - premium×n                                                → upside ilimitado
```

#### Collar

El payoff a 3 tramos también es correcto:

```
Si S < putStrike:           PnL = (putStrike - cp - netPremium)×n       → piso fijo
Si putStrike ≤ S ≤ callStrike: PnL = (S - cp - netPremium)×n           → lineal
Si S > callStrike:          PnL = (callStrike - cp - netPremium)×n      → techo fijo
```

#### Covered Strangle

- `riskProfile: "unlimited"` es correcto — el short put expone al inversor a pérdidas ilimitadas a la baja.
- La ecuación de payoff (`stockPnL + premiumIncome + shortPutPnL + shortCallPnL`) es correcta.
- Las alertas de margin stress están bien calibradas.

---

### 1.2 Bug Crítico #1 — Black-Scholes CDF implementada incorrectamente

**Archivo:** `src/modules/strategies/coverage/coverageTypes.ts`, líneas 202–213  
**Función:** `normalCdf(x: number)`

#### Descripción del problema

La aproximación de Abramowitz & Stegun para la CDF normal estándar (fórmula 26.2.17) está mal construida. El código multiplica `(1 - φ(x))` por el polinomio cuando debería multiplicar `φ(x)`.

**Código incorrecto (estado actual):**
```typescript
function normalCdf(x: number): number {
  const k = 1 / (1 + STANDARD_NORMAL_CDF_DIVISOR * Math.abs(x));
  let cdf = 1 - Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI); // ← 1 - φ(x)
  cdf *= k * a[0] + k**2 * a[1] + k**3 * a[2] + k**4 * a[3] + k**5 * a[4];
  return x >= 0 ? 1 - cdf : cdf;
}
```

**Verificación del error:** En `x = 0` la CDF debe retornar exactamente `0.5`. El código actual retorna `≈0.247`.

**Cálculo:**
- `φ(0) = exp(0) / √(2π) = 1/√(2π) ≈ 0.3989`
- Código: `cdf = 1 - 0.3989 = 0.6011`
- Polinomio en k=1: `0.31938 - 0.35656 + 1.78148 - 1.82126 + 1.33027 = 1.25331`
- `cdf = 0.6011 × 1.25331 = 0.7533`
- Resultado: `1 - 0.7533 = 0.2467` ❌ (debe ser 0.5)

**Código corregido:**
```typescript
function normalCdf(x: number): number {
  if (x < -10) return 0;
  if (x > 10) return 1;
  const k = 1 / (1 + STANDARD_NORMAL_CDF_DIVISOR * Math.abs(x));
  const pdf = Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI); // ← φ(x) directamente
  const poly =
    k    * STANDARD_NORMAL_CDF_COEFFICIENTS[0] +
    k**2 * STANDARD_NORMAL_CDF_COEFFICIENTS[1] +
    k**3 * STANDARD_NORMAL_CDF_COEFFICIENTS[2] +
    k**4 * STANDARD_NORMAL_CDF_COEFFICIENTS[3] +
    k**5 * STANDARD_NORMAL_CDF_COEFFICIENTS[4];
  const cdf = pdf * poly;
  return x >= 0 ? 1 - cdf : cdf;
}
```

**Verificación post-fix:** `pdf(0) × poly(k=1) = 0.3989 × 1.25331 ≈ 0.4999 ≈ 0.5` ✅

**Impacto:** La función `estimateOptionPremium()` usa `normalCdf` para calcular primas Black-Scholes. Los engines de payoff no están directamente afectados (usan las primas del contrato — user input), pero cualquier módulo que calcule primas como fallback produce valores incorrectos.

---

### 1.3 Bug Crítico #2 — `stopLossPrice` del Collar ignora la banda superior

**Archivo:** `src/modules/strategies/coverage/collarEngine.ts`, línea 61

#### Descripción del problema

Un collar tiene dos bandas de alerta: un nivel inferior (protección del put) y un nivel superior (cap del call). El código colapsa ambos en un único número tomando el mínimo, lo que siempre retorna la banda inferior y descarta por completo la superior.

**Código incorrecto:**
```typescript
const stopLossLow  = putLeg.strike  * (1 - this.stopLossBufferPct); // ej: put * 0.96
const stopLossHigh = callLeg.strike * (1 + this.stopLossBufferPct); // ej: call * 1.04
// ...
stopLossPrice: round(Math.min(stopLossLow, stopLossHigh), 2),
// Math.min() SIEMPRE retorna stopLossLow — el nivel alto nunca se expone
```

**Corrección:** Separar en dos campos distintos en los `riskMetrics`:

```typescript
// En riskMetrics del collar:
stopLossLowPrice:  round(putLeg.strike  * (1 - this.stopLossBufferPct), 2),
stopLossHighPrice: round(callLeg.strike * (1 + this.stopLossBufferPct), 2),
```

Esto requiere actualizar también el tipo `RiskMetrics` en `coverageTypes.ts` y los contratos de la API.

**Impacto:** Los usuarios reciben un único precio de stop-loss para el collar cuando en realidad existen dos zonas de alerta críticas. La banda superior (call ceiling) nunca se muestra, lo que es engañoso para quien gestiona la posición.

---

### 1.4 Bug Crítico #3 — Fallback candles no determinístico en TrendEngine

**Archivo:** `src/modules/institutional/institutionalTrendEngine.ts`, línea 529

#### Descripción del problema

Cuando no se proveen candles reales, el `InstitutionalTrendEngine` genera velas sintéticas usando `Math.random()`. Esto significa que dos llamadas idénticas con el mismo contrato producen señales de tendencia diferentes.

**Código problemático:**
```typescript
private buildFallbackCandles(...): InstitutionalOhlcCandle[] {
  for (let index = 0; index < totalCandles; index++) {
    const noise = (Math.random() - 0.5) * basePrice * 0.015; // ← no determinístico
    // ...
  }
}
```

**Contraste:** El `InstitutionalZonesEngine` genera su fallback con funciones trigonométricas determinísticas (`Math.sin`, `Math.cos`) — la asimetría entre engines es inconsistente.

**Corrección:** Reemplazar `Math.random()` con un generador pseudoaleatorio determinístico seeded con el ticker o un hash del contrato:

```typescript
// PRNG determinístico (xoshiro128 simplificado o LCG):
private seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

private buildFallbackCandles(analysis, result): InstitutionalOhlcCandle[] {
  const seed = analysis.ticker.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rand = this.seededRandom(seed);
  for (let index = 0; index < totalCandles; index++) {
    const noise = (rand() - 0.5) * basePrice * 0.015; // ← ahora determinístico
    // ...
  }
}
```

**Impacto:** En un sistema de trading, la no-reproducibilidad de señales es un defecto grave. El mismo ticker puede retornar `"bullish"` en una llamada y `"bearish"` en la siguiente sin cambio de datos.

---

### 1.5 Problema de diseño — Nomenclatura `covered_straddle` vs covered strangle

**Archivo:** `src/modules/strategies/coverage/coveredStraddleEngine.ts`, líneas 1–11 y contratos

El engine mismo reconoce el error en su comentario técnico:

> "NOTA TÉCNICA: Aunque el `kind` se mantiene como `covered_straddle` por compatibilidad de contratos, la estructura implementada es un **covered strangle**"

Un **straddle** usa el mismo strike para put y call. Un **strangle** usa strikes diferentes. La estrategia implementada (short put en strike A + short call en strike B, donde A ≠ B) es definitivamente un **strangle**.

**Corrección:** Actualizar el `kind` en el contrato de `"covered_straddle"` a `"covered_strangle"` y renombrar el engine. Requiere migración del contrato si ya existe data en Supabase.

---

### 1.6 Inconsistencia de convención de signos entre engines

Los engines usan convenciones de signo opuestas para las primas:

| Engine | Long premium | Short premium |
|--------|-------------|---------------|
| `protectivePutEngine` | `+leg.premium` (costo) | `-leg.premium` (ingreso) |
| `collarEngine` | `+leg.premium` (costo) | `-leg.premium` (ingreso) |
| `coveredStraddleEngine` | `-leg.premium` (costo) | `+leg.premium` (ingreso) |

Ambas convenciones producen resultados correctos, pero la inconsistencia es un riesgo para el mantenimiento. Se recomienda unificar en una sola convención documentada en `coverageTypes.ts`.

---

## PARTE 2 — Análisis Institucional (Spec 006)

### 2.1 Lo que está correcto

| Componente | Evaluación |
|-----------|------------|
| Pivot detection para support/resistance | ✅ Técnica estándar de análisis técnico |
| Volume-weighted clustering de zonas | ✅ Correcto |
| Merge strategy del DataService (avg ownership, sum flows, max volume) | ✅ Justificado |
| Degradación graceful `ok/partial/all_failed` | ✅ Correcto |
| Tercer viernes del mes para mensual OpEx | ✅ Correcto (US equity options) |
| Triple Witching en meses 3/6/9/12 | ✅ Correcto |
| Ventanas 13F en feb/may/ago/nov | ✅ Correcto (45 días post-cierre de trimestre) |
| Regímenes theta/gamma (far/near/at_expiration) | ✅ Correcto en concepto |
| Fallback candles en ZonesEngine (sin Math.random) | ✅ Determinístico |

---

### 2.2 Problema Importante #4 — FOMC y CPI asignados a la misma fecha

**Archivo:** `src/modules/institutional/expirationAnalysisEngine.ts`, líneas 713 y 731

**Código problemático:**
```typescript
const fomcDate = this.findNthWeekday(targetYear, targetMonth, 2, 3); // 2do miércoles
// ...
const cpiDate  = this.findNthWeekday(targetYear, targetMonth, 2, 3); // 2do miércoles — ¡IGUAL!
```

En realidad:
- CPI se publica generalmente el **martes o miércoles de la 2da semana** (varía por mes, lo anuncia el Bureau of Labor Statistics con anticipación)
- FOMC se reúne en **8 ocasiones al año** y no sigue un patrón de "2do miércoles"; concluye típicamente un miércoles pero en semanas variables

**Corrección mínima:** Al menos usar días distintos para separar los eventos visualmente:
```typescript
// CPI: 2do martes del mes (más aproximado al patrón real del BLS)
const cpiDate = this.findNthWeekday(targetYear, targetMonth, 2, 2); // 2do MARTES

// FOMC: 2do miércoles (aproximación)
const fomcDate = this.findNthWeekday(targetYear, targetMonth, 2, 3); // 2do MIÉRCOLES
```

**Corrección ideal:** Incorporar un calendario hardcodeado de fechas FOMC (publicado por la Fed con un año de anticipación) y fechas CPI reales. Esto elimina la ambigüedad por completo.

---

### 2.3 Problema Importante #5 — Triple Witching genera eventos duplicados

**Archivo:** `src/modules/institutional/expirationAnalysisEngine.ts`, líneas 575-616

En los meses de triple witching (marzo, junio, septiembre, diciembre), `detectExpirationEvents()` agrega DOS eventos para la misma fecha y tipo:

1. Un `quarterly_opex` por el bloque de "Monthly OpEx" (línea 578)
2. Un segundo `quarterly_opex` por el bloque de "Triple Witching" (línea 606)

Ambos usan `findNthWeekday(year, month, 3, OPEX_WEEKDAY)` — exactamente la misma fecha.

**Corrección:** En el bloque de triple witching, verificar que el evento no exista ya en el array antes de insertarlo, o usar `type: "triple_witching"` exclusivamente para ese bloque (sin reusar `quarterly_opex`):

```typescript
// Reemplazar el segundo push en el bloque de triple witching:
events.push({
  type: "quarterly_opex",   // ← cambiar a un type único
  // ...
});
// Por:
if (!events.some((e) => e.date === tripleWitch && e.type === "quarterly_opex")) {
  events.push({ type: "triple_witching_opex", ... });
}
```

O bien, usar un Set de fechas para deduplicar antes del sort final.

---

### 2.4 Problema Importante #6 — Sesgo estacional octubre-diciembre incorrecto

**Archivo:** `src/modules/institutional/expirationAnalysisEngine.ts`, líneas 1009–1014

```typescript
private estimateExpiryBias(month: number): "bullish" | "bearish" | "neutral" {
  if (month >= 1 && month <= 3) return "neutral";
  if (month >= 4 && month <= 6) return "bullish";
  if (month >= 7 && month <= 9) return "neutral";
  return "bearish"; // ← octubre, noviembre, diciembre como BEARISH
}
```

Históricamente, el período octubre-diciembre es el **más alcista del año** en mercados de renta variable (Hirsch, *Stock Trader's Almanac*; estudio de LPL Financial sobre estacionalidad S&P 500 1950-2023). Octubre suele ser volátil pero con cierre positivo; noviembre y diciembre son los meses con mayor retorno promedio.

**Corrección:**
```typescript
private estimateExpiryBias(month: number): "bullish" | "bearish" | "neutral" {
  if (month === 9) return "bearish";          // Septiembre: históricamente el peor mes
  if (month === 10) return "neutral";         // Octubre: volátil, sesgo mixto
  if (month === 11 || month === 12) return "bullish"; // Nov-Dic: "Santa rally"
  if (month >= 4 && month <= 6) return "bullish";     // Abr-Jun: primavera alcista
  if (month >= 7 && month <= 8) return "neutral";     // Jul-Ago: verano mixto
  return "neutral";                           // Ene-Mar: variable
}
```

---

### 2.5 Limitación de diseño — Correlación Pearson con señales sintéticas

**Archivo:** `src/modules/institutional/institutionalTrendEngine.ts`, líneas 699–731

La función `computeVolumeCorrelation` calcula un `correlationCoefficient` de Pearson entre volumen diario y señales trimestrales. Sin embargo, las "señales trimestrales" se sintetizan a partir de `fundsOwnershipPct` y `flows` del contrato — no de datos reales de filings SEC.

El propio código lo reconoce:
```typescript
// In production, this would use real quarterly filing data
```

**Estado actual:** El número reportado como `correlationCoefficient` no tiene validez estadística. Es una métrica generada a partir de datos circulares (la señal trimestral se deriva del mismo input que el análisis).

**Corrección a largo plazo:** Integrar datos de filings 13F reales (via SEC EDGAR API) y calcular la correlación contra volúmenes históricos reales. En el corto plazo, marcar el campo como `"synthetic"` en los metadatos del resultado para evitar que sea interpretado como una correlación real.

---

### 2.6 Limitación técnica — ATR calculado como Average Range, no True Range

**Archivo:** `src/modules/institutional/institutionalZonesEngine.ts`, línea 507

```typescript
private calculateAtr(candles: InstitutionalOhlcCandle[]): number {
  const ranges = candles.map((candle) => candle.high - candle.low);
  return this.average(ranges);
}
```

El ATR estándar (Wilder, 1978) usa el **True Range**: `max(high-low, |high-prevClose|, |low-prevClose|)`. El código omite los gaps entre sesiones.

**Impacto:** La tolerancia de clustering de zonas puede ser ligeramente subestimada en activos con gaps frecuentes (earnings, noticias). El impacto es menor para la detección de zonas, pero el nombre `calculateAtr` es incorrecto.

**Corrección mínima:** Renombrar a `calculateAverageRange` para reflejar lo que realmente hace, o implementar el True Range completo.

---

## PARTE 3 — Tabla consolidada de hallazgos

| # | Severidad | Archivo | Descripción | Estado |
|---|-----------|---------|-------------|--------|
| 1 | 🔴 CRÍTICO | `coverageTypes.ts:202` | CDF Black-Scholes: `1 - φ(x)` en lugar de `φ(x)` — retorna valores incorrectos | Pendiente fix |
| 2 | 🔴 CRÍTICO | `collarEngine.ts:61` | `stopLossPrice = min(low, high)` — banda superior del collar siempre ignorada | Pendiente fix |
| 3 | 🔴 CRÍTICO | `institutionalTrendEngine.ts:529` | Fallback candles con `Math.random()` — no determinístico, mismas señales distintas por llamada | Pendiente fix |
| 4 | 🟡 IMPORTANTE | `expirationAnalysisEngine.ts:713,731` | FOMC y CPI asignados a la misma fecha (2do miércoles) | Pendiente fix |
| 5 | 🟡 IMPORTANTE | `expirationAnalysisEngine.ts:605` | Triple Witching duplica eventos `quarterly_opex` para la misma fecha | Pendiente fix |
| 6 | 🟡 IMPORTANTE | `expirationAnalysisEngine.ts:1009` | Sesgo estacional oct-dic marcado como `bearish` — contrario a la evidencia histórica | Pendiente fix |
| 7 | 🟠 DISEÑO | `coveredStraddleEngine.ts:kind` | `covered_straddle` en el contrato pero implementa un covered strangle (strikes distintos) | Deuda técnica |
| 8 | 🟠 DISEÑO | `institutionalTrendEngine.ts:699` | Correlación Pearson calculada con señales sintéticas — no tiene validez estadística real | Deuda técnica |
| 9 | 🟠 DISEÑO | `coverageTypes.ts / engines` | Convención de signo de primas invertida entre engines (inconsistencia interna) | Deuda técnica |
| 10 | 🟠 DISEÑO | `institutionalZonesEngine.ts:507` | `calculateAtr` implementa Average Range, no True Range (nombre incorrecto) | Deuda técnica |

---

## PARTE 4 — Veredicto y recomendación

### Para el merge al main

**Bugs 1, 2 y 3 deben corregirse antes del merge.** Son defectos que afectan outputs directamente visibles y/o comprometen la reproducibilidad del sistema de señales.

**Bugs 4, 5 y 6 deben corregirse también antes del merge.** Generan datos financieramente incorrectos que el frontend mostrará a usuarios.

**Hallazgos 7-10** pueden ir en tickets de deuda técnica post-merge si hay presión de tiempo, siempre que se documenten en el backlog.

### Para la implementación de los fixes

Los bugs 1-6 son cambios quirúrgicos y aislados. Ninguno requiere refactoring de la arquitectura. El orden recomendado de implementación es:

1. **Bug 1** — `normalCdf` en `coverageTypes.ts` (cambio de una línea, alto impacto)
2. **Bug 2** — Separar `stopLossPrice` del collar en dos campos
3. **Bug 3** — PRNG seeded en `buildFallbackCandles` del TrendEngine
4. **Bug 4** — Separar FOMC y CPI a días distintos
5. **Bug 5** — Deduplicar triple witching en `detectExpirationEvents`
6. **Bug 6** — Corregir mapa de sesgo estacional mensual

---

*Documento generado post-auditoría de Spec 006 y Spec 007 — Team 05.*
