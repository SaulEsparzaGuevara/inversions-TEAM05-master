import { getAuthHeaders } from "../signals/signalApi";

// ── Payload types (match backend response shapes) ─────────

export interface PayoffPoint {
  label: string;
  movePct: number;
  underlyingPrice: number;
  pnl: number;
  pnlPct: number;
  notes: string[];
}

export interface PayoffSimulation {
  baselinePrice: number;
  breakevenPrice: number;
  maxProfit: number | null;
  maxLoss: number | null;
  description: string;
  points: PayoffPoint[];
}

export interface RiskMetrics {
  riskProfile: "limited" | "unlimited";
  maxProtection: number;
  protectionFloorPrice: number;
  protectionCeilingPrice?: number;
  netPremium: number;
  netPremiumPerShare: number;
  costBenefitRatio: number;
  downsideRisk: number;
  upsideCap: number | null;
  breakEvenPrice: number;
  stopLossPrice: number;
  marginRequirement?: number;
  exerciseRiskScore?: number;
}

export interface Alert {
  code: string;
  severity: "info" | "warning" | "critical";
  message: string;
  recommendation: string;
  triggerPrice?: number;
  triggerPct?: number;
}

export interface CoverageStrategyResult {
  engineId: string;
  strategyKind: string;
  ticker: string;
  shares: number;
  currentPrice: number;
  payoff: PayoffSimulation;
  riskMetrics: RiskMetrics;
  alerts: Alert[];
  generatedAt: string;
}

export interface CoverageAnalysisResponse {
  results: CoverageStrategyResult[];
  generatedAt: string;
}

export interface CoverageComparisonResponse {
  engineId: string;
  ticker: string;
  currentPrice: number;
  entries: Array<{
    strategyKind: string;
    strategyResult: CoverageStrategyResult;
    score: {
      pnl: number;
      costEfficiency: number;
      risk: number;
      contextFit: number;
      total: number;
    };
    rank: number;
    notes: string[];
  }>;
  recommendedKind: string;
  generatedAt: string;
}

export interface CoverageSimulationResponse {
  engineId: string;
  strategyKind: string;
  currentPrice: number;
  deterministicScenarios: Array<{
    label: string;
    movePct: number;
    underlyingPrice: number;
    pnl: number;
    pnlPct: number;
    notes: string[];
  }>;
  generatedAt: string;
}

// ── Request types (match backend route interfaces) ────────

export interface CoverageOptionLeg {
  type: "call" | "put";
  side: "long" | "short";
  strike: number;
  premium: number;
  expiration: string;
  multiplier?: number;
}

export interface CoverageAnalyzeRequest {
  ticker: string;
  currentPrice: number;
  shares: number;
  strikes?: number[];
  legs?: CoverageOptionLeg[];
  capital?: number;
  riskTolerancePct?: number;
}

export interface CoverageCompareRequest {
  ticker: string;
  currentPrice: number;
  shares: number;
  legs?: CoverageOptionLeg[];
  capital?: number;
  riskTolerancePct?: number;
}

export interface CoverageSimulateRequest {
  ticker: string;
  currentPrice: number;
  shares: number;
  legs?: CoverageOptionLeg[];
  capital?: number;
}

// ── API functions ────────────────────────────────────────

const API_BASE = "/api/coverage";

export async function postCoverageAnalyze(
  payload: CoverageAnalyzeRequest
): Promise<CoverageAnalysisResponse> {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Error al analizar coberturas: ${response.status}`);
  }

  return (await response.json()) as CoverageAnalysisResponse;
}

export async function postCoverageCompare(
  payload: CoverageCompareRequest
): Promise<CoverageComparisonResponse> {
  const response = await fetch(`${API_BASE}/compare`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Error al comparar coberturas: ${response.status}`);
  }

  return (await response.json()) as CoverageComparisonResponse;
}

export async function postCoverageSimulate(
  payload: CoverageSimulateRequest
): Promise<CoverageSimulationResponse> {
  const response = await fetch(`${API_BASE}/simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Error al simular cobertura: ${response.status}`);
  }

  return (await response.json()) as CoverageSimulationResponse;
}
