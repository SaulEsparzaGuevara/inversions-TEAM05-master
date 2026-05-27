# Estrategias de Cobertura — Guía Completa

**Equipo:** TEAM-05 (TurboPapus)
**Módulo:** `projects/rest-api/inversions_api/src/modules/strategies/coverage/`
**Frontend API:** `projects/pwa/inversions_app/src/services/coverage/coverageApi.ts`
**Última actualización:** 2026-05-26

---

## Índice

1. [Arquitectura General](#1-arquitectura-general)
2. [Contrato de Entrada: CoverageStrategyContract](#2-contrato-de-entrada-coveragestrategycontract)
3. [Las 4 Estrategias](#3-las-4-estrategias)
   - [Protective Put](#31-protective-put)
   - [Married Put](#32-married-put)
   - [Collar Put](#33-collar-put)
   - [Covered Straddle](#34-covered-straddle)
4. [Contrato de Salida: CoverageStrategyResult](#4-contrato-de-salida-coveragestrategyresult)
   - [PayoffSimulation](#41-payoffsimulation)
   - [RiskMetrics](#42-riskmetrics)
   - [Alertas](#43-alertas)
5. [Simulación: CoverageSimulationEngine](#5-simulación-coveragesimulationengine)
6. [Comparador: CoverageComparator](#6-comparador-coveragesimulatorcom)
7. [Servicios de Riesgo y Reportes](#7-servicios-de-riesgo-y-reportes)
8. [Endpoints REST](#8-endpoints-rest)
9. [Flujo Completo: Request → Response](#9-flujo-completo)
10. [Preguntas Frecuentes](#10-preguntas-frecuentes)

---

## 1. Arquitectura General

```
USUARIO (Frontend PWA)
    │
    ▼  POST /api/coverage/{analyze,compare,simulate}
┌─────────────────────────────────────────────────┐
│              coverage routes                    │
│  (analyze.ts, compare.ts, simulate.ts)          │
└────┬──────────────┬────────────────┬────────────┘
     │              │                │
     ▼              ▼                ▼
┌──────────┐ ┌──────────┐ ┌──────────────────┐
│Strategy  │ │Comparator│ │SimulationEngine   │
│Engines   │ │T120      │ │T117              │
│T114-T116 │ └──────────┘ └──────────────────┘
└────┬─────┘
     │
     ├── ProtectivePutEngine  (protective_put + married_put)
     ├── CollarEngine         (collar_put)
     └── CoveredStraddleEngine (covered_straddle)
          │
          ▼
┌──────────────────┐
│coverageStrategy  │
│Adapter (T173)    │  ──► StrategyOutput (formato estándar)
└──────────────────┘
          │
          ▼
┌──────────────────┐
│coverageRiskService│
│(T118)            │
└──────────────────┘
          │
          ▼
┌──────────────────┐
│coverageReport    │
│Service (T119)    │  ──► JSON / MD / CSV
└──────────────────┘
```

### Dependencias entre archivos

```
coverageStrategyContract.ts  ← Define tipos base, usado por TODOS
coverageTypes.ts             ← Define resultados, validadores, helpers
    ↑
protectivePutEngine.ts       ← ProtectivePut + MarriedPut
collarEngine.ts              ← Collar
coveredStraddleEngine.ts     ← Covered Straddle
    ↑
coverageSimulationEngine.ts  ← Usa los 3 engines + Monte Carlo + backtest
    ↑
coverageComparator.ts        ← Usa SimulationEngine + RiskService + ReportService
coverageRiskService.ts       ← Evalúa stop-loss, margen, notificaciones
coverageReportService.ts     ← Combina todo en reportes exportables
coverageStrategyAdapter.ts   ← Convierte a StrategyOutput estándar
```

---

## 2. Contrato de Entrada: `CoverageStrategyContract`

**Archivo:** `coverageStrategyContract.ts`

Todas las estrategias reciben **exactamente el mismo contrato de entrada**:

```typescript
interface CoverageStrategyContract {
  strategyId: string;           // ID único (ej: "cov-protective_put-1712345678-a1b2c3")
  kind: CoverageStrategyKind;   // "protective_put" | "married_put" | "collar_put" | "covered_straddle"
  ticker: string;               // Ticker base (ej: "AAPL", "SPY")
  shares: number;               // Número de acciones (entero > 0)
  underlyingPrice?: number;     // Precio de referencia (opcional, default: promedio de strikes)
  legs: CoverageOptionLeg[];    // Patas de opciones (1 o más, según estrategia)
  capital: number;              // Capital asignado (para cálculos de %)
  riskTolerancePct: number;     // Tolerancia al riesgo 0..1
  targetMovePct?: number;       // Movimiento objetivo en % (opcional, para simulaciones)
  scenario?: string;            // Nombre de escenario (opcional)
  requestedAt: string;          // ISO-8601 timestamp
}
```

### `CoverageOptionLeg`

```typescript
interface CoverageOptionLeg {
  side: "long" | "short";
  type: "call" | "put";
  strike: number;          // Strike price
  premium: number;         // Prima por acción (NO por contrato)
  expiration: string;      // ISO-8601 (ej: "2026-08-22")
  multiplier?: number;     // Multiplicador del contrato (default: 100)
}
```

### Reglas de validación

- `strategyId`: string no vacío
- `kind`: debe ser uno de los 4 valores
- `ticker`: string no vacío
- `shares`: entero positivo
- `capital`: ≥ 0
- `riskTolerancePct`: 0..1
- `legs`: array no vacío, cada leg validado
- `requestedAt`: string ISO-8601 no vacío

---

## 3. Las 4 Estrategias

### 3.1 Protective Put

**Engine:** `ProtectivePutEngine` (T114)
**kind:** `"protective_put"`
**Descripción:** Tienes acciones + compras un put para protegerte contra caídas.

#### Composición

| Componente | Side | Tipo | Propósito |
|-----------|------|------|-----------|
| Acciones | long | — | Exposición direccional al alza |
| Put | long | put | Protección contra caídas por debajo del strike |

#### Cálculos clave

**Pérdida máxima por acción:**
```
currentPrice - (putStrike - netPremiumPerShare)
```

**Ganancia máxima:** Ilimitada (el upside de las acciones no tiene techo).

**Precio break-even:**
```
currentPrice + netPremiumPerShare
```
> ✅ **Corrección:** La fórmula antigua (`currentPrice - maxProtectionPerShare + netPremiumPerShare`) solo era correcta cuando el put está OTM (`maxProtectionPerShare = 0`). Cuando el put está ITM (`putStrike > currentPrice`), producía un resultado incorrecto. La fórmula simplificada `currentPrice + netPremiumPerShare` es correcta para puts OTM, ATM e ITM, ya que el break-even es el precio al que la ganancia de la acción cubre exactamente el costo de la prima pagada.

**Prima neta por acción:**
```
sumatoria de (premium * signo) para todas las legs
// long = positivo, short = negativo
```

**exerciseRiskScore:**
```
deepITM = max(0, strike - currentPrice) / max(1, strike)
nearExpiry = daysToExpiration <= 21 ? 1 : 0
score = clamp01(deepITM * 0.7 + nearExpiry * 0.3)
```

#### Alertas posibles

| Código | Severidad | Cuándo ocurre |
|--------|-----------|---------------|
| `STOP_LOSS_TRIGGERED` | critical | Precio ≤ stopLossPrice (calculado dinámicamente desde riskTolerancePct con buffer 1-10%) |
| `STOP_LOSS_NEAR_STRIKE` | warning | Precio cerca del strike + buffer |
| `EARLY_EXERCISE_RISK` | warning | Exercise risk score ≥ 0.6 |

#### Opciones del motor

| Parámetro | Default | Explicación |
|-----------|---------|-------------|
| `stopLossBufferPct` | 0.03 (3%) | Buffer por debajo del strike antes de alertar (fallback cuando `riskTolerancePct` del contrato es 0 o no está presente) |
| `earlyExerciseWindowDays` | 21 | Días antes de expiración para alerta de ejercicio |

---

### 3.2 Married Put

**Engine:** `ProtectivePutEngine` (T114b)
**kind:** `"married_put"`
**Descripción:** Compras acciones y un put **simultáneamente** (a diferencia del protective put donde ya tenías las acciones). El cálculo es idéntico al protective put, con una única diferencia: se genera una alerta adicional:
   ```typescript
   { code: "MARRIED_PUT_BASIS_CHECK", severity: "info", message: "Married put activo..." }
   ```

**En la práctica**, el married put suele tener una prima neta más baja que el protective put porque el put out-of-the-money es más barato al comprarse junto con la acción.

---

### 3.3 Collar Put

**Engine:** `CollarEngine` (T115)
**kind:** `"collar_put"`
**Descripción:** Acciones + put largo (protección) + call corto (financia la protección). Rango acotado en ambos lados.

#### Composición

| Componente | Side | Tipo | Propósito |
|-----------|------|------|-----------|
| Acciones | long | — | Exposición direccional |
| Put | long | put | Piso de protección |
| Call | short | call | Techo de ganancia (financia la prima del put) |

#### Cálculos clave

**Rango de protección:**
```
Piso:   protectionFloorPrice = putStrike - netPremiumPerShare
Techo:  protectionCeilingPrice = callStrike + netPremiumPerShare
```

**Precio break-even:**
```
currentPrice + netPremiumPerShare
```

> **Nota:** Protective put y married put comparten la misma fórmula de break-even. La diferencia semántica está en el momento de compra: protective put ya tenía las acciones, married put las compra simultáneamente.

**Pérdida máxima:**
```
max(0, currentPrice - (putStrike - netPremiumPerShare)) × shares
```

**Ganancia máxima:**
```
max(0, callStrike - currentPrice + netPremiumPerShare) × shares
```

**exerciseRiskScore** (score combinado, ambos lados):
```
downside = max(0, putStrike - currentPrice) / max(1, putStrike)
upside   = max(0, currentPrice - callStrike) / max(1, callStrike)
score    = clamp01(downside * 0.5 + upside * 0.5)
// Cada lado contribuye hasta 0.5 (50%) → score máximo 1.0 cuando ambos lados están en estrés máximo
// (Antes: 0.6 + 0.6 = 1.2 pre-clamp, lo cual ocultaba un error matemático)
```

**costBenefitRatio:**
```
(callStrike - putStrike) / max(0.01, abs(netPremiumPerShare))
```

#### Zero-Cost Collar

No es un tipo de estrategia separado. Es un **collar normal** donde las primas se cancelan:
```
prima_put (long, pagas) ≈ prima_call (short, recibes crédito)
→ netPremiumPerShare ≈ $0.0
```
Ocurre naturalmente cuando el usuario elige strikes que equilibran las primas.

#### Alertas posibles

| Código | Severidad | Cuándo ocurre |
|--------|-----------|---------------|
| `COLLAR_LOWER_BAND_BROKEN` | critical | Precio ≤ putStrike × 0.96 |
| `COLLAR_UPPER_BAND_BROKEN` | warning | Precio ≥ callStrike × 1.04 |
| `COLLAR_RANGE_STRESS` | warning | exerciseRiskScore ≥ 0.55 |
| `COLLAR_TARGET_MOVE` | info | targetMovePct está definido |

---

### 3.4 Covered Straddle

**Engine:** `CoveredStraddleEngine` (T116)
**kind:** `"covered_straddle"`
**Descripción:** Acciones long + put short + call short (estructura de **covered strangle**, no un straddle tradicional). Generas ingresos por primas con perfil de riesgo asimétrico.

> ⚠️ **Nota técnica:** Aunque el `kind` es `"covered_straddle"` por compatibilidad, la estructura real es un **covered strangle** (opciones en strikes distintos). Un straddle puro requeriría ambas opciones al mismo strike.

#### Composición

| Componente | Side | Tipo | Propósito |
|-----------|------|------|-----------|
| Acciones | long | — | Base de la estructura. El call short está **parcialmente cubierto** por las acciones long, limitando el riesgo al alza en la práctica. |
| Put | short | put | Ingreso por prima. **Riesgo ilimitado real**: si el subyacente cae fuerte, el put short pierde sin límite. |
| Call | short | call | Ingreso por prima. El riesgo al alza está contenido por las acciones long (no es verdaderamente ilimitado). |

#### Perfil de riesgo asimétrico

| Dirección | Riesgo real | Explicación |
|-----------|-------------|------------|
| ALZA (precio sube) | **Limitado en la práctica** | Las acciones long suben de valor, compensando la pérdida del call short. La ganancia de las acciones cubre la prima perdida. |
| BAJA (precio cae) | **Ilimitado** | El put short pierde valor a medida que el subyacente cae, y las acciones long también pierden. No hay cobertura en este lado. |

#### Cálculos clave

**Perfil de riesgo:** `"unlimited"` (el valor del enum se mantiene, pero en la práctica el riesgo al alza es limitado por las acciones long).

**Ganancia máxima por acción:**
```
max(0, callStrike - currentPrice + netPremiumPerShare)
```

**Pérdida máxima:** Ilimitada a la baja vía el put short (aunque el call short está cubierto por las acciones).

**Precio break-even:**
```
currentPrice - netPremiumPerShare
```

**Margen requerido:**
```
base = capital × 0.25
volatilityBuffer = currentPrice × shares × 0.15
shortExposure = max(putStrike, callStrike) × shares × 0.2
premiumOffset = max(0, netPremiumPerShare × shares)
margin = max(0, base + volatilityBuffer + shortExposure - premiumOffset)
```

#### Puntos críticos de la simulación

El payoff se evalúa en 11 puntos desde -70% hasta +70% para capturar la asimetría del riesgo ilimitado. Los puntos > 18% de desviación se marcan como `"critical_volatility"`.

#### Alertas posibles

| Código | Severidad | Cuándo ocurre |
|--------|-----------|---------------|
| `STRADDLE_STOP_LOSS` | critical | Precio ≤ stopLossPrice |
| `STRADDLE_RANGE_BREAK` | warning | Precio fuera del rango central ±5% |
| `MARGIN_STRESS` | critical | marginRequirement > capital × 0.8 |
| `HIGH_VOLATILITY_PROFILE` | info | Siempre se emite |

---

## 4. Contrato de Salida: `CoverageStrategyResult`

**Archivo:** `coverageTypes.ts`

```typescript
interface CoverageStrategyResult {
  engineId: string;              // Ej: "protective_put_engine"
  strategy: CoverageStrategyContract;  // El contrato original
  strategyKind: CoverageStrategyKind;
  ticker: string;
  shares: number;
  currentPrice: number;
  payoff: PayoffSimulation;
  riskMetrics: RiskMetrics;
  alerts: Alert[];
  generatedAt: string;           // ISO-8601
}
```

### 4.1 PayoffSimulation

```typescript
interface PayoffSimulation {
  baselinePrice: number;         // Precio actual de referencia
  breakevenPrice: number;        // Precio donde PnL = $0
  maxProfit: number | null;      // null = ilimitado
  maxLoss: number | null;        // null = ilimitado
  description: string;           // Descripción textual del perfil
  points: PayoffPoint[];         // Puntos de la curva
}
```

Cada `PayoffPoint`:

```typescript
interface PayoffPoint {
  label: string;                 // "-50.0%", "0.0%", "+5.0%", etc.
  movePct: number;               // Movimiento en decimal (-0.5, 0, 0.05)
  underlyingPrice: number;       // Precio del subyacente en ese escenario
  pnl: number;                   // PnL en dólares
  pnlPct: number;                // PnL como % del capital
  notes: string[];               // Etiquetas: "downside_stress", "upside_follow_through", etc.
}
```

### 4.2 RiskMetrics

```typescript
interface RiskMetrics {
  riskProfile: "limited" | "unlimited";

  // Protección
  maxProtection: number;                 // $ total de protección
  protectionFloorPrice: number;          // Precio piso
  protectionCeilingPrice?: number;       // Precio techo (solo collar/straddle)

  // Costo
  netPremium: number;                    // Prima neta TOTAL ($)
  netPremiumPerShare: number;            // Prima neta por acción ($)
  costBenefitRatio: number;              // Relación costo/beneficio

  // Riesgo
  downsideRisk: number;                  // Riesgo a la baja ($)
  upsideCap: number | null;              // Tope al alza ($), null si ilimitado
  breakEvenPrice: number;                // Precio break-even
  stopLossPrice: number;                 // Precio de stop-loss
  marginRequirement: number;             // Colateral requerido ($)

  // Métricas avanzadas
  exerciseRiskScore: number;             // Riesgo de ejercicio anticipado (0..1)
  volatilityStressLoss: number;          // Pérdida estimada en estrés de volatilidad ($)
}
```

### 4.3 Alertas

```typescript
interface Alert {
  code: string;                 // Código único (ej: "STOP_LOSS_TRIGGERED")
  severity: "info" | "warning" | "critical";
  message: string;              // Descripción del problema
  recommendation: string;       // Acción recomendada
  triggerPrice?: number;        // Precio que activó la alerta
  triggerPct?: number;          // Porcentaje que activó la alerta
}
```

---

## 5. Simulación: `CoverageSimulationEngine`

**Archivo:** `coverageSimulationEngine.ts` (T117)
**Propósito:** Toma un contrato de estrategia y genera artefactos de simulación.

### Salida

```typescript
interface CoverageSimulationResult {
  engineId: "coverage_simulation_engine";
  strategy: CoverageStrategyContract;
  strategyKind: CoverageStrategyKind;
  currentPrice: number;

  // Resultado base (el engine específico se llama internamente)
  baseResult: CoverageStrategyResult;

  // Escenarios deterministas (6 escenarios fijos)
  deterministicScenarios: CoverageScenarioOutcome[];
  // Ej: [-35%, -18%, 0%, +8%/+12%, +24%/+30%, +40%/+30%]

  // Monte Carlo
  monteCarlo: CoverageMonteCarloSummary;
  monteCarloOutcomes: CoverageScenarioOutcome[];

  // Backtest (con velas históricas)
  backtest: CoverageBacktestSummary;
  backtestObservations: CoverageBacktestObservation[];

  historicalCandles: CoverageHistoricalCandle[];
  generatedAt: string;
}
```

### Monte Carlo

- **Iteraciones:** 256 por defecto (mínimo 32, configurable)
  > ⚠️ **Limitación estadística:** 256 iteraciones es adecuado para demo y visualización rápida. Para análisis de riesgo de producción se recomienda mínimo 10,000 iteraciones. El VaR y Expected Shortfall con 256 muestras tienen un margen de error estadístico no despreciable.
- **Distribución:** Gaussiana (Box-Muller transform), volatilidad estimada desde velas históricas
- **VaR 95%:** Percentil 5 de los PnL ordenados
- **Expected Shortfall 95%:** Promedio del peor 5% de outcomes
- **Win/Loss rate:** % de outcomes con PnL ≥ 0 / < 0
- **Seed:** Determinístico basado en strategyId + ticker + kind + timestamp

### Escenarios deterministas

Sin `targetMovePct`:
| Escenario | Movimiento | Probabilidad |
|-----------|-----------|--------------|
| deep_drawdown | -35% | 10% |
| moderate_drawdown | -18% | 14% |
| flat | 0% | 26% |
| mild_upside | +8% | 18% |
| target_move | +12% | 16% |
| breakout | +30% | 10% |

Con `targetMovePct`:
| Escenario | Movimiento | Probabilidad |
|-----------|-----------|--------------|
| deep_drawdown | -35% | 8% |
| moderate_drawdown | -18% | 12% |
| flat | 0% | 22% |
| target_move | targetMovePct | 18% |
| upside_extension | +24% | 14% |
| breakout | +40% | 10% |

### Backtest

Requiere velas históricas (`CoverageHistoricalCandle[]`). Calcula PnL punto a punto aplicando la estrategia a cada vela y reporta:
- Average/Best/Worst PnL
- Win rate histórico
- Max drawdown
- Profit factor

### Determinación de precios (cuando no hay `underlyingPrice`)

```
currentPrice = max(0.01, average(strikes))
// Si no hay strikes:  max(0.01, capital / shares)
```

### Estimación de prima (Black-Scholes simplificado)

Usado en el route `analyze.ts` cuando el usuario no provee legs. Implementa Black-Scholes con:
- Volatilidad implícita default: 25%
- Tasa libre de riesgo default: 5%
- Días a expiración default: 90

La función `estimateOptionPremium` está en `coverageTypes.ts`.

---

## 6. Comparador: `CoverageComparator`

**Archivo:** `coverageComparator.ts` (T120)
**Propósito:** Evalúa las 4 estrategias y recomienda la mejor según un score compuesto.

### Flujo

```
1. Toma el contrato base
2. Crea 4 variantes (una por cada kind)
3. Ejecuta simulación para cada variante (Promise.all ← paralelo)
4. Evalúa riesgo para cada simulación (Promise.all ← paralelo)
5. Genera reportes para cada una (Promise.all ← paralelo)
6. Normaliza métricas y calcula scores
7. Rankea por score total descendente
8. Retorna ranking + estrategia recomendada
```

### Score compuesto

| Factor | Peso | Fórmula |
|--------|------|---------|
| PnL | 50% | `normalize(expectedPnL)` entre min/max de las 4 |
| Costo | 20% | `1 - normalize(abs(netPremium))` — menor costo = mejor |
| Riesgo | 20% | `1 - min(1, abs(worstPnL) / capital)` — menor riesgo = mejor |
| Context Fit | 10% | `winRate` de Monte Carlo |

**Total = PnL × 0.50 + Costo × 0.20 + Riesgo × 0.20 + Context × 0.10**

### Salida

```typescript
interface CoverageComparisonResult {
  engineId: "coverage_comparator";
  ticker: string;
  currentPrice: number;
  entries: CoverageComparisonEntry[];  // Las 4 estrategias rankeadas
  recommendedKind: CoverageStrategyKind;
  multiCoreContext: {
    executionMode: "parallel" | "serial";
    runners: number;
  };
  generatedAt: string;
}
```

---

## 7. Servicios de Riesgo y Reportes

### CoverageRiskService (T118)

Evalúa riesgos post-simulación:

1. **Stop-loss automático:** Si hay alertas críticas en `strategyResult.alerts`, genera acción `stop_loss`
2. **Margen stress:** Si worst PnL Monte Carlo excede capital × 1.5, genera `margin_alert`
3. **Notificaciones:** Envía email/push a destinatarios configurados

### CoverageReportService (T119)

Combina `StrategyResult` + `Simulation` + `Risk`, genera:

- **Summary** con expectedPnL, winRate, R/R ratio, alert count
- **Exportación** a JSON y Markdown en `reports/coverage/`
- **Caché de simulación:** acepta resultados precomputados para evitar recalcular

### CoverageStrategyAdapter (T173)

Convierte `CoverageStrategyResult` → `StrategyOutput` (formato estándar transversal):

- Mapea `kind` → `RecommendationType.COBERTURAS`
- Construye evidencia desde alertas + payoff simulation
- Calcula score breakdown (protectionScore 40% + costEfficiencyScore 30% + riskScore 30%)
- Asigna nivel de confianza: ≥ 0.70 → ALTA, ≥ 0.40 → MEDIA, < 0.40 → BAJA

---

## 8. Endpoints REST

### `POST /api/coverage/analyze`

**Body:**
```json
{
  "ticker": "AAPL",
  "currentPrice": 450,
  "shares": 100,
  "capital": 100000,
  "riskTolerancePct": 0.05,
  "strikes": [427.50, 472.50]    // Opcional: [putStrike, callStrike]
  // "legs": [...]                // Opcional: legs explícitos
}
```

**Respuesta:** `{ results: CoverageStrategyResult[], generatedAt: string }`

Ejecuta los 4 motores en serie y retorna un array con los 4 resultados. Si no se envían legs, el route **estima primas** usando Black-Scholes con 90 días a expiración y 25% IV.

### `POST /api/coverage/compare`

**Body:** Mismo formato que analyze.

**Respuesta:** `CoverageComparisonResult` (ranking de las 4 + recomendada)

Ejecuta `CoverageComparator.compare()`, que corre simulaciones en paralelo para las 4 estrategias.

### `POST /api/coverage/simulate`

**Body:** Mismo formato (pero solo ejecuta para `protective_put` como estrategia por defecto).

**Respuesta:** `CoverageSimulationResult` (Monte Carlo + determinista + backtest)

### Roles autorizados

Todos los endpoints requieren autenticación (JWT) con roles:
- `analyst`
- `risk_manager`
- `trader`

---

## 9. Flujo Completo

### Ejemplo: Usuario quiere evaluar coberturas para AAPL

```
1. Frontend envía POST /api/coverage/analyze
   Body: { ticker: "AAPL", currentPrice: 450, shares: 100, ... }

2. Route coverage/analyze.ts:
   a. Valida auth (rol analyst/risk_manager/trader)
   b. Valida body (ticker, price, shares requeridos)
   c. Construye 4 CoverageStrategyContract (uno por kind)
   d. Estima primas con Black-Scholes si no hay legs
   e. Ejecuta ProtectivePutEngine.analyze() para protective_put y married_put
   f. Ejecuta CollarEngine.analyze() para collar_put
   g. Ejecuta CoveredStraddleEngine.analyze() para covered_straddle
   h. Retorna { results: [4 CoverageStrategyResult], generatedAt }

3. Cada engine:
   a. Valida el contrato (createCoverageStrategyContract)
   b. Resuelve currentPrice (strike promedio si no hay underlyingPrice)
   c. Encuentra legs requeridos (put, call según estrategia)
   d. Calcula prima neta, protección, break-even, stop-loss
   e. Construye payoff simulation (8-11 puntos de escenario)
   f. Calcula risk metrics completos
   g. Evalúa alertas (stop-loss, exercise risk, margen)
   h. Retorna CoverageStrategyResult validado

4. Frontend recibe y muestra:
   - Tabla comparativa de las 4 estrategias
   - Payoff charts con lightweight-charts
   - Risk metrics en panel derecho
   - Badges de alerta (info/warning/critical)
```

### Ejemplo numérico: Protective Put para AAPL

```
Input:
  ticker = "AAPL", currentPrice = $450, shares = 100
  put strike = $427.50, put premium = $3.50, capital = $100,000

Cálculos:
  netPremiumPerShare = $3.50 (solo un put long)
  maxProtectionPerShare = max(0, 427.50 - 450) = $0 (put OTM actualmente)
  protectionFloorPrice = 427.50 - 3.50 = $424.00
  breakEvenPrice = 450 + 3.50 = $453.50
  stopLossPrice = 427.50 × (1 - 0.025) = $416.81  // riskTolerancePct=0.05 → buffer = clamp(0.01, 0.10, 0.05 × 0.5) = 0.025
  // Nota: Si riskTolerancePct no estuviera presente, se usa el fallback stopLossBufferPct=0.03:
  //   427.50 × (1 - 0.03) = $414.68
  maxLoss = (450 - (427.50 - 3.50)) × 100 = $2,600.00

Output:
  riskProfile: "limited"
  maxProtection: $0 (si el precio sube, no hay protección activa)
  netPremium: $350.00
  downsideRisk: $2,600.00
  upsideCap: null (ilimitado)
  marginRequirement: $10,000.00 (10% de $100,000)
```

---

## 10. Preguntas Frecuentes

### ¿Qué diferencia hay entre Protective Put y Married Put?

Ambos usan el mismo engine. La diferencia es semántica:
- **Protective Put:** Ya tienes las acciones y compras un put para protegerlas
- **Married Put:** Compras acciones y put simultáneamente como una transacción

Ambos usan la misma fórmula de break-even (`currentPrice + netPremiumPerShare`). La diferencia semántica está en el momento de compra y la alerta informativa adicional `MARRIED_PUT_BASIS_CHECK`.

### ¿Qué es un Zero-Cost Collar?

Un collar normal donde la prima del put (long, pagas) y la prima del call (short, recibes crédito) se cancelan mutuamente: `netPremiumPerShare ≈ $0`. No es un tipo separado de estrategia.

### ¿Qué significa que `maxProfit` o `maxLoss` sean `null`?

Significa que el perfil es **ilimitado** en esa dirección. Ejemplo:
- Protective put: `maxProfit = null` (el subyacente puede subir sin límite)
- Covered strangle: `maxLoss = null` (el riesgo es ilimitado a la baja vía el put short; el alza está contenido por las acciones long)

### ¿Cómo se estiman las primas cuando el usuario no envía legs?

El route `analyze.ts` usa `estimateOptionPremium()` en `coverageTypes.ts`, que implementa **Black-Scholes** con parámetros default:
- Volatilidad implícita: 25%
- Tasa libre de riesgo: 5%
- Días a expiración: 90
- Multiplicador: 100

### ¿Qué datos necesita el frontend para funcionar?

- ticker (string)
- currentPrice (number > 0)
- shares (entero > 0)
- Opcional: strikes[], legs[], capital, riskTolerancePct

### ¿Qué pasa si la IA de explicación falla?

El sistema de coberturas **no depende de la IA**. Los cálculos (payoff, risk metrics, simulación) son puramente determinísticos y funcionan offline. La IA es solo para explicaciones narrativas.

### ¿Cuánto tarda una simulación Monte Carlo?

~50-200ms para 256 iteraciones. El engine usa un PRNG determinístico (no `Math.random`) y Box-Muller para generar normales. El comparador ejecuta 4 simulaciones en paralelo via `Promise.all`.

> ⚠️ **Nota sobre escalabilidad:** 256 iteraciones es suficiente para demo y prototipado rápido. Para análisis de producción con 10,000+ iteraciones, el tiempo escala linealmente (~2-8 segundos). Se recomienda aumentar las iteraciones solo cuando se requiera precisión estadística en VaR y Expected Shortfall.

### ¿Los resultados son reproducibles?

Sí. El seed de Monte Carlo es determinístico:
```
seed = hash(strategyId + ":" + ticker + ":" + kind + ":" + requestedAt)
```
Misma entrada → mismos resultados siempre.

### ¿Hay caché?

Sí, el frontend cachea respuestas en memoria por payload (vía `buildCacheKey` en `apiCache.js`). El backend no tiene caché explícita pero los cálculos son rápidos (< 200ms por engine).
