/**
 * ============================================================================
 * coverageApi.ts
 * ============================================================================
 *
 * FIC: Coverage API service — analyzeCoverage POST /api/coverage/analyze.
 */

import { getAuthHeaders } from "../signals/signalApi";
import { buildCacheKey, getCached, setCache } from "../apiCache.js";

// ── Retry helper ──────────────────────────────────────────

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 1_000;

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = MAX_RETRIES
): Promise<Response> {
  let lastResponse: Response | undefined;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    lastResponse = await fetch(url, init);
    if (lastResponse.ok) return lastResponse;
    // Only retry on 5xx, 429 (rate-limit), or network errors
    if (lastResponse.status < 500 && lastResponse.status !== 429) {
      return lastResponse;
    }
    if (attempt < retries) {
      const delay = BASE_DELAY_MS * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  // Return last attempt's response
  return lastResponse!;
}

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
  payload: CoverageAnalyzeRequest,
  signal?: AbortSignal
): Promise<CoverageAnalysisResponse> {
  const cacheKey = buildCacheKey(`${API_BASE}/analyze`, payload);
  const cached = getCached<CoverageAnalysisResponse>(cacheKey);
  if (cached) return cached;

  const response = await fetchWithRetry(`${API_BASE}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload),
    signal
  });

  if (!response.ok) {
    throw new Error(`Error al analizar coberturas: ${response.status}`);
  }

  const data = (await response.json()) as CoverageAnalysisResponse;
  setCache(cacheKey, data);
  return data;
}

export async function postCoverageCompare(
  payload: CoverageCompareRequest,
  signal?: AbortSignal
): Promise<CoverageComparisonResponse> {
  const cacheKey = buildCacheKey(`${API_BASE}/compare`, payload);
  const cached = getCached<CoverageComparisonResponse>(cacheKey);
  if (cached) return cached;

  const response = await fetchWithRetry(`${API_BASE}/compare`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload),
    signal
  });

  if (!response.ok) {
    throw new Error(`Error al comparar coberturas: ${response.status}`);
  }

  const data = (await response.json()) as CoverageComparisonResponse;
  setCache(cacheKey, data);
  return data;
}

export async function postCoverageSimulate(
  payload: CoverageSimulateRequest,
  signal?: AbortSignal
): Promise<CoverageSimulationResponse> {
  const cacheKey = buildCacheKey(`${API_BASE}/simulate`, payload);
  const cached = getCached<CoverageSimulationResponse>(cacheKey);
  if (cached) return cached;

  const response = await fetchWithRetry(`${API_BASE}/simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload),
    signal
  });

  if (!response.ok) {
    throw new Error(`Error al simular cobertura: ${response.status}`);
  }

  const data = (await response.json()) as CoverageSimulationResponse;
  setCache(cacheKey, data);
  return data;
}
