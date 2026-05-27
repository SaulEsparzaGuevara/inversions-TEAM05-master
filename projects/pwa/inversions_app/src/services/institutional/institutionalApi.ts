/**
 * ============================================================================
 * institutionalApi.ts
 * ============================================================================
 *
 * FIC: Institutional API service — getInstitutionalAnalysis and getRegulatoryPositions GET functions.
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
  status: "ok" | "error" | "cached" | "skipped" | "failed" | "rate_limited";
  latencyMs: number;
  observation?: {
    asOf: string;
    confidence: number;
    volume?: number;
    fundsOwnershipPct?: number;
    openPositions?: { count: number; notional?: number };
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Genera el texto del tooltip para el badge de estado de una fuente.
 */
export function getSourceTooltipText(report: InstitutionalSourceReport): string {
  switch (report.status) {
    case "ok": {
      const parts = ["Datos frescos obtenidos correctamente"];
      if (report.observation) {
        parts.push(`Confianza: ${(report.observation.confidence * 100).toFixed(0)}%`);
        parts.push(`Corte: ${new Date(report.observation.asOf).toLocaleDateString("es-MX")}`);
      }
      return parts.join(" · ");
    }
    case "cached": {
      const parts = ["Datos recuperados de caché"];
      if (report.observation) {
        parts.push(`Confianza: ${(report.observation.confidence * 100).toFixed(0)}%`);
        parts.push(`Corte: ${new Date(report.observation.asOf).toLocaleDateString("es-MX")}`);
      }
      return parts.join(" · ");
    }
    case "skipped": {
      const reason = report.error?.message ?? "Fuente no aplica para los parámetros seleccionados";
      return `Fuente omitida: ${reason}`;
    }
    case "failed": {
      const code = report.error?.code ?? "FAILED";
      const message = report.error?.message ?? "Error desconocido";
      return `Error (${code}): ${message}`;
    }
    case "rate_limited": {
      const message = report.error?.message ?? "Límite de tasa alcanzado para esta fuente";
      return `Límite de tasa: ${message}`;
    }
    case "error": {
      const code = report.error?.code ?? "DESCONOCIDO";
      const message = report.error?.message ?? "Error desconocido";
      return `Error (${code}): ${message}`;
    }
    default:
      return `Estado: ${report.status}`;
  }
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
  params: InstitutionalAnalysisRequest,
  signal?: AbortSignal
): Promise<InstitutionalAnalysisResponse> {
  const query = new URLSearchParams({
    ticker: params.ticker,
    period: params.period,
    horizon: params.horizon
  }).toString();
  const url = `${API_BASE}/analysis?${query}`;

  const cacheKey = buildCacheKey(url);
  const cached = getCached<InstitutionalAnalysisResponse>(cacheKey);
  if (cached) return cached;

  const response = await fetchWithRetry(url, {
    headers: { ...getAuthHeaders() },
    signal
  });

  if (!response.ok) {
    throw new Error(`Error al obtener analisis institucional: ${response.status}`);
  }

  const data = (await response.json()) as InstitutionalAnalysisResponse;
  setCache(cacheKey, data);
  return data;
}

export async function getRegulatoryPositions(
  params: InstitutionalAnalysisRequest,
  signal?: AbortSignal
): Promise<RegulatoryPositionsResponse> {
  const query = new URLSearchParams({
    ticker: params.ticker,
    period: params.period,
    horizon: params.horizon
  }).toString();
  const url = `${API_BASE}/positions?${query}`;

  const cacheKey = buildCacheKey(url);
  const cached = getCached<RegulatoryPositionsResponse>(cacheKey);
  if (cached) return cached;

  const response = await fetchWithRetry(url, {
    headers: { ...getAuthHeaders() },
    signal
  });

  if (!response.ok) {
    throw new Error(`Error al obtener posiciones regulatorias: ${response.status}`);
  }

  const data = (await response.json()) as RegulatoryPositionsResponse;
  setCache(cacheKey, data);
  return data;
}
