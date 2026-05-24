# Data Model: 007-team-05-frontend-cobertura

Este archivo define los modelos de estado principales desde la perspectiva Frontend (la interfaz hacia las vistas). Las estructuras se corresponden directamente con las respuestas de la REST API (TEAM-05).

## Store: AIChatStore (useSyncExternalStore)

Ubicación: `src/store/chat.ts`
Patrón: `useSyncExternalStore` (mismo que `src/store/signals.ts`)

```typescript
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  status: 'pending' | 'success' | 'error';
  responseId?: string;
  pollingAttempts?: number;
}

export interface ScenarioAnalysisItem {
  label: string;
  description: string;
  protectionLevel: 'low' | 'medium' | 'high';
  potentialPnL: number;
}

export interface ChatState {
  ticker: string | null;
  history: ChatMessage[];
  scenarios: ScenarioAnalysisItem[];
  isAiUnavailable: boolean;

  // Actions
  setContext: (ticker: string) => void;
  addMessage: (msg: ChatMessage) => void;
  updateMessageStatus: (id: string, status: ChatMessage['status'], content?: string) => void;
  incrementPolling: (id: string) => void;
  setAiUnavailable: (state: boolean) => void;
  clearHistory: () => void;
}
```

## RiskMetrics — Semántica Conceptual

El objeto `RiskMetrics` en cada `CoverageStrategyResult` contiene los indicadores de costo/riesgo. Cada campo tiene un significado financiero específico:

| Campo Backend | Tipo | Semántica | Fórmula conceptual | Zero-Cost Collar | Notas |
|--------------|------|-----------|-------------------|-------------------|-------|
| `riskProfile` | `"limited" \| "unlimited"` | Perfil de riesgo de la estrategia | Si maxLoss es finito → limited | limited | Determina color del badge (verde/rojo) |
| `netPremium` | `number` | **Prima neta total**: flujo de caja neto para abrir todas las legs | `Σ(leg.premium × legScale × signo)`, long=+, short=− | **$0.00** | NO es comisión, NO es margen. Es el costo/ingreso neto |
| `netPremiumPerShare` | `number` | Prima neta por acción | `netPremium / shares` | **$0.00** | Útil para comparar entre estrategias |
| `protectionFloorPrice` | `number` | **Precio piso**: precio donde termina la protección del put | strike del put | Put strike | Debajo de este precio, el put protege |
| `protectionCeilingPrice` | `number \| undefined` | **Precio techo**: solo en Collar, límite del upside | strike del call corto | Call strike | Solo presente en `collar_put` |
| `downsideRisk` | `number` | **Pérdida máxima posible** en el peor escenario | Si riskProfile=limited: `(currentPrice - putStrike + netPremiumPerShare) × shares` | `(currentPrice - putStrike) × shares` | Si es unlimited, el riesgo es ∞ |
| `upsideCap` | `number \| null` | **Ganancia máxima posible** | Si riskProfile=limited: `(callStrike - currentPrice + netPremiumPerShare) × shares` | `(callStrike - currentPrice) × shares` | Si es unlimited, es null |
| `maxProtection` | `number` | **Valor monetario de la protección** | `(currentPrice - putStrike) × shares` | Igual | Cuánto downside cubre el put |
| `costBenefitRatio` | `number` | **Relación costo/beneficio** | Collar: `(callStrike - putStrike) / \|netPremiumPerShare\|` | **~0.00** | Ratio alto = mejor relación |
| `breakEvenPrice` | `number` | **Precio de equilibrio**: PnL = $0 | `currentPrice + netPremiumPerShare` (sin incluir comisiones) | **currentPrice** | Difiera del current price por la prima neta |
| `stopLossPrice` | `number` | **Precio de stop-loss recomendado** | Basado en `protectionFloorPrice` + margen de tolerancia | Put strike | Nota: no es una orden real, es sugerencia |
| `marginRequirement` | `number` | **Colateral requerido** por el broker (estimado) | Regla T + margen de mantenimiento | Depende del broker | Es un estimado, no un cálculo exacto de broker |
| `exerciseRiskScore` | `number` | **Score de riesgo de ejercicio** (0-1) | Basado en volatilidad y tiempo hasta expiración | Variable | Más alto = más riesgo de asignación anticipada |
| `volatilityStressLoss` | `number` | **Pérdida estimada bajo estrés de volatilidad** | Simulación de +2 desviaciones en IV | Variable | Modelo de estrés |

### Diferencias clave entre conceptos similares

| Concepto | ¿Qué es? | ¿Qué NO es? |
|----------|---------|-------------|
| `netPremium` | Flujo de caja neto para abrir la posición | Comisión del broker, margen requerido, ni prima de una sola leg |
| `downsideRisk` | Pérdida máxima en el peor escenario | Prima pagada, ni margen |
| `marginRequirement` | Colateral estimado requerido | Costo de entrada, ni prima |
| `protectionFloorPrice` | Precio donde el put comienza a proteger | Stop-loss automático |

### Cálculo de prima neta por estrategia

| Estrategia | Legs | Cálculo de `netPremium` |
|-----------|------|------------------------|
| **Protective Put** | Long Put (pagas) | `+ putPremium × shares` |
| **Married Put** | Long Put ATM (pagas más) | `+ putPremiumATM × shares` |
| **Collar Put** | Long Put (pagas) + Short Call (recibes) | `+ putPremium × shares − callPremium × shares` |
| **Covered Straddle** | Short Put (recibes) + Short Call (recibes) | `− putPremium × shares − callPremium × shares` |

### Ejemplo numérico: Collar en AAPL a $200

| Leg | Side | Strike | Prima/share | Contribución |
|-----|------|--------|-------------|-------------|
| Put protector | Long | $180 | $2.50 | +$2.50 × 100 = +$250 |
| Call cubierto | Short | $220 | $2.50 | −$2.50 × 100 = −$250 |
| **Total netPremium** | | | | **$0.00** ✅ Zero-Cost |

## API Interfaces

### Institutional Analysis API
Ubicación: `src/services/institutional/institutionalApi.ts`

```typescript
export interface InstitutionalAnalysisRequest {
  ticker: string;
  period: 'intraday' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  horizon: 'short' | 'medium' | 'long';
}

export interface InstitutionalAnalysisResponse {
  request: {
    ticker: string;
    period: string;
    horizon: string;
    analysisId: string;
  };
  analysis: {
    analysisId: string;
    ticker: string;
    instrument?: string;
    strike?: number;
    period: string;
    volume: number;
    liquidity: 'low' | 'medium' | 'high';
    horizon: string;
    fundsOwnershipPct: number;
    flows: { inflows: number; outflows: number; asOf: string };
    openPositions: { count: number; notional?: number };
  };
  zones: {
    all: InstitutionalZone[];
    support: InstitutionalZone[];
    resistance: InstitutionalZone[];
  };
  trends: {
    direction: 'bullish' | 'bearish' | 'neutral';
    score: number;
    confidence: number;
    rationale: string;
    supportStrength: number;
    resistanceStrength: number;
    flowBias: number;
  };
  metrics: {
    candlesAnalyzed: number;
    zoneCount: number;
    supportZoneCount: number;
    resistanceZoneCount: number;
    averageZoneStrength: number;
    maxZoneStrength: number;
    averageZoneConfidence: number;
    sourceCount: number;
    liquidity: string;
    volume: number;
    openPositions: number;
    fundsOwnershipPct: number;
    netFlow: number;
  };
  sourceReports: InstitutionalSourceReport[];
  generatedAt: string;
}

export interface InstitutionalZone {
  type: 'support' | 'resistance';
  price: number;
  strength: number;
  accumulatedVolume: number;
  confidence: number;
  confirmingSources: number;
  touches: number;
  liquidity: 'low' | 'medium' | 'high';
  asOf: string;
  notes: string[];
}

export interface InstitutionalSourceReport {
  sourceId: string;
  kind: string;
  label: string;
  status: 'ok' | 'error' | 'cached';
  tookMs: number;
  observation?: {
    asOf: string;
    confidence: number;
    volume?: number;
    fundsOwnershipPct?: number;
    openPositions?: { count: number; notional?: number };
  };
}
```

### Regulatory Positions API
Ubicación: `src/services/institutional/institutionalApi.ts`

```typescript
export interface RegulatoryPositionsResponse {
  request: {
    ticker: string;
    period: string;
    horizon: string;
    analysisId: string;
  };
  analysis: {
    ticker: string;
    period: string;
    horizon: string;
    fundsOwnershipPct: number;
    flows: { inflows: number; outflows: number; asOf: string };
    openPositions: { count: number; notional?: number };
  };
  positions13F: Array<{
    sourceId: string;
    asOf: string;
    count: number;
    notional?: number;
    fundsOwnershipPct?: number;
    volume?: number;
    confidence: number;
  }>;
  flows: {
    inflows: number;
    outflows: number;
    netFlow: number;
    asOf: string;
  };
  sourceReports: InstitutionalSourceReport[];
  cacheHit: boolean;
  usedSourceIds: string[];
}
```

### Coverage API
Ubicación: `src/services/coverage/coverageApi.ts`

```typescript
export interface CoverageAnalyzeRequest {
  ticker: string;
  currentPrice: number;
  shares: number;
  strikes: number[];
  capital: number;
  riskTolerancePct: number;
}

export interface CoverageStrategyResult {
  strategyId: string;
  kind: 'protective_put' | 'married_put' | 'collar_put' | 'covered_straddle';
  label: string;
  shares: number;
  legs: Array<{
    side: 'long' | 'short';
    type: 'call' | 'put';
    strike: number;
    premium: number;
    expiration: string;
  }>;
  netCost: number;
  breakeven: number;
  maxProfit: number;
  maxLoss: number;
  riskProfile: 'limited' | 'unlimited';
  protectionLevel: 'low' | 'medium' | 'high';
  payoffSimulation: Array<{ price: number; pnl: number; notes?: string }>;
  riskMetrics: {
    profile: string;
    protectionLevel: string;
    netPremiumPaid: number;
    stopLossPrice?: number;
    marginRequired?: number;
  };
  alerts: Array<{
    code: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    recommendation: string;
  }>;
  recommended: boolean;
}

export interface CoverageAnalyzeResponse {
  results: CoverageStrategyResult[];
  generatedAt: string;
}

export interface CoverageCompareRequest {
  ticker: string;
  currentPrice: number;
  shares: number;
  strikes: number[];
  capital: number;
  riskTolerancePct: number;
  horizon: 'short' | 'medium' | 'long';
}

export interface CoverageCompareResponse {
  ranking: CoverageStrategyResult[];
  recommendedKind: string;
  available: boolean;
  partialData: boolean;
  generatedAt: string;
}

export interface CoverageSimulateRequest {
  ticker: string;
  currentPrice: number;
  shares: number;
  capital: number;
  strategyKind: 'protective_put' | 'married_put' | 'collar_put' | 'covered_straddle';
  mode: 'deterministic' | 'monte_carlo' | 'backtest';
  iterations?: number;
}

export interface CoverageSimulateResponse {
  strategyKind: string;
  mode: string;
  summary: {
    expectedPnL: number;
    median: number;
    worst: number;
    best: number;
    var95: number;
    shortfall95: number;
  };
  scenarios: Array<{
    label: string;
    price: number;
    pnl: number;
    probability?: number;
  }>;
  generatedAt: string;
}
```

### AI Chat API
Ubicación: `src/services/ai/aiChatApi.ts`

```typescript
export interface AIChatRequest {
  ticker: string;
  currentPrice: number;
  zones: {
    all: InstitutionalZone[];
    support: InstitutionalZone[];
    resistance: InstitutionalZone[];
  };
  coverageStrategies?: CoverageStrategyResult[];
  question: string;
  userRole?: 'analyst' | 'risk_manager';
}

export interface AIChatResponse {
  contextId: string;
  responseId: string;
  ticker: string;
  narrative: string;
  reasoning: string[];
  scenarioAnalysis: Array<{
    label: string;
    description: string;
    protectionLevel: 'low' | 'medium' | 'high';
    potentialPnL: number;
  }>;
  recommendation: string;
  evidenceIds: string[];
  modelVersion: string;
  responseHash: string;
  ai_unavailable: boolean;
  timestamp: string;
}

export interface AIChatPollingResponse {
  status: 'pending' | 'completed';
  contextId: string;
  responseId: string;
  pollingUrl?: string;
  retryAfterSeconds?: number;
  ai_unavailable: boolean;
  timestamp: string;
}
```
