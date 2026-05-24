import { getAuthHeaders } from "../signals/signalApi";

export interface InstitutionalAnalysisRequest {
  ticker: string;
  period: "intraday" | "daily" | "weekly" | "monthly" | "quarterly";
  horizon: "short" | "medium" | "long";
}

export interface InstitutionalZone {
  type: "support" | "resistance";
  price: number;
  strength: number;
  accumulatedVolume: number;
  confidence: number;
  confirmingSources: number;
  touches: number;
  liquidity: "low" | "medium" | "high";
  asOf: string;
  notes: string[];
}

export interface InstitutionalSourceReport {
  sourceId: string;
  kind: string;
  label: string;
  status: "ok" | "error" | "cached";
  tookMs: number;
  observation?: {
    asOf: string;
    confidence: number;
    volume?: number;
    fundsOwnershipPct?: number;
    openPositions?: { count: number; notional?: number };
  };
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
    liquidity: "low" | "medium" | "high";
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
    direction: "bullish" | "bearish" | "neutral";
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

const API_BASE = "/api/institutional";

export async function getInstitutionalAnalysis(
  params: InstitutionalAnalysisRequest
): Promise<InstitutionalAnalysisResponse> {
  const query = new URLSearchParams({
    ticker: params.ticker,
    period: params.period,
    horizon: params.horizon
  }).toString();

  const response = await fetch(`${API_BASE}/analysis?${query}`, {
    headers: { ...getAuthHeaders() }
  });

  if (!response.ok) {
    throw new Error(`Error al obtener analisis institucional: ${response.status}`);
  }

  return (await response.json()) as InstitutionalAnalysisResponse;
}

export async function getRegulatoryPositions(
  params: InstitutionalAnalysisRequest
): Promise<RegulatoryPositionsResponse> {
  const query = new URLSearchParams({
    ticker: params.ticker,
    period: params.period,
    horizon: params.horizon
  }).toString();

  const response = await fetch(`${API_BASE}/positions?${query}`, {
    headers: { ...getAuthHeaders() }
  });

  if (!response.ok) {
    throw new Error(`Error al obtener posiciones regulatorias: ${response.status}`);
  }

  return (await response.json()) as RegulatoryPositionsResponse;
}
