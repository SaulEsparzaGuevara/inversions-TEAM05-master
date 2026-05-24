/**
 * ============================================================================
 * bootstrap.ts
 * ============================================================================
 *
 * FIC: T340: Bootstrap — singleton factory creating InstitutionalDataService with 4 real sources, zones/trend/expiration engines, and source configs (priorities, rate-limits, TTLs).
 */

import type { Request } from "express";
import {
  createInstitutionalAnalysisContract,
  type InstitutionalAnalysisContract,
  type InstitutionalAnalysisPeriod,
  type InstitutionalFlowSnapshot,
  type InstitutionalHorizon,
  type InstitutionalLiquidity,
  type InstitutionalOpenPositionsSnapshot
} from "../../modules/institutional/institutionalContract.js";
import {
  InstitutionalDataService,
  type FetchLike,
  type InstitutionalDataServiceResult,
  type InstitutionalSourceConfig,
  type InstitutionalSourceKind,
  type InstitutionalSourceObservation,
  type InstitutionalSourceReport,
  type InstitutionalSourceParser
} from "../../modules/institutional/institutionalDataService.js";
import {
  InstitutionalZonesEngine,
  type InstitutionalZone,
  type InstitutionalZonesResult
} from "../../modules/institutional/institutionalZonesEngine.js";
import {
  InstitutionalTrendEngine,
  type InstitutionalTrendResult
} from "../../modules/institutional/institutionalTrendEngine.js";
import {
  ExpirationAnalysisEngine,
  type ExpirationAnalysisResult
} from "../../modules/institutional/expirationAnalysisEngine.js";
import {
  parseSecEdgar13fReal,
  parseFinraShortInterestReal,
  ensureFinraCache
} from "../../modules/institutional/realSourceParsers.js";
import {
  parseYahooOptionsFlow
} from "../../modules/institutional/yahooOptionsParser.js";
import {
  parseYahooInstitutional
} from "../../modules/institutional/yahooInstitutionalParser.js";

type InstitutionalRouteContext = {
  service: InstitutionalDataService;
  engine: InstitutionalZonesEngine;
  trendEngine: InstitutionalTrendEngine;
  expirationEngine: ExpirationAnalysisEngine;
};

type InstitutionalTrendSummary = {
  direction: "bullish" | "bearish" | "neutral";
  score: number;
  confidence: number;
  rationale: string;
  supportStrength: number;
  resistanceStrength: number;
  flowBias: number;
};

type InstitutionalMetricsSummary = {
  candlesAnalyzed: number;
  zoneCount: number;
  supportZoneCount: number;
  resistanceZoneCount: number;
  averageZoneStrength: number;
  maxZoneStrength: number;
  averageZoneConfidence: number;
  sourceCount: number;
  liquidity: InstitutionalLiquidity;
  volume: number;
  openPositions: number;
  fundsOwnershipPct: number;
  netFlow: number;
};

type InstitutionalPositionsSummary = {
  ticker: string;
  period: InstitutionalAnalysisPeriod;
  horizon: InstitutionalHorizon;
  positions13F: Array<{
    sourceId: string;
    asOf: string;
    count: number;
    notional?: number;
    fundsOwnershipPct?: number;
    volume?: number;
    confidence: number;
  }>;
  flows: InstitutionalFlowSnapshot & {
    netFlow: number;
  };
  sourceReports: InstitutionalSourceReport[];
};

const defaultSourceConfigs = buildDefaultSourceConfigs();

let routeContext: InstitutionalRouteContext | null = null;

export function getInstitutionalRouteContext(): InstitutionalRouteContext {
  if (routeContext) {
    return routeContext;
  }

  const service = new InstitutionalDataService({
    sources: defaultSourceConfigs,
    fetchImpl: globalThis.fetch as FetchLike
  });

  const engine = new InstitutionalZonesEngine({
    institutionalDataService: service,
    maxZones: 8,
    pivotWindow: 2,
    clusterTolerancePct: 0.0125,
    liquidityVolumeMultiplier: 1.15
  });

  const trendEngine = new InstitutionalTrendEngine({
    institutionalDataService: service,
    minCandles: 200,
    fastMaPeriod: 50,
    slowMaPeriod: 200,
    volumeLookback: 20
  });

  const expirationEngine = new ExpirationAnalysisEngine({
    institutionalDataService: service,
    defaultWindowDays: 90,
    lookAheadMonths: 6,
    strikeProximityPct: 0.05
  });

  routeContext = { service, engine, trendEngine, expirationEngine };

  // Eager background preload — does NOT block the return
  ensureFinraCache().catch(() => {});

  return routeContext;
}

export function buildInstitutionalAnalysisContractFromRequest(req: Request): InstitutionalAnalysisContract {
  const query = req.query as Record<string, string | string[] | undefined>;
  const ticker = normalizeTicker(query.ticker);
  const period = normalizePeriod(query.period);
  const horizon = normalizeHorizon(query.horizon);
  const userId = normalizeIdentifier(req.authContext?.userId ?? "anonymous");
  const requestedAt = new Date().toISOString();
  const seed = buildTickerSeed(ticker);
  const periodFactor = getPeriodFactor(period);
  const horizonFactor = getHorizonFactor(horizon);
  const volume = Math.round(900_000 + seed * 850 * periodFactor * horizonFactor);
  const liquidity = volume >= 2_000_000 ? "high" : volume >= 1_200_000 ? "medium" : "low";
  const fundsOwnershipPct = Number(Math.min(96, 18 + (seed % 34) + ((horizonFactor - 1) * 14)).toFixed(2));
  const inflows = Number((volume * (0.34 + (seed % 5) * 0.03)).toFixed(2));
  const outflows = Number((volume * (0.18 + (periodFactor - 1) * 0.05)).toFixed(2));
  const openPositions = Math.max(3, Math.round(seed / 11 + periodFactor * 4 + horizonFactor * 3));

  return createInstitutionalAnalysisContract({
    analysisId: `institutional-${ticker}-${period}-${horizon}-${userId}`,
    ticker,
    instrument: `${ticker} institutional coverage`,
    period,
    volume,
    liquidity,
    horizon,
    fundsOwnershipPct,
    flows: {
      inflows,
      outflows,
      asOf: requestedAt
    },
    openPositions: {
      count: openPositions,
      notional: Number((openPositions * 1_350_000 * horizonFactor).toFixed(2))
    },
    sourceIds: defaultSourceConfigs.map((source) => source.sourceId),
    requestedAt
  });
}

export function groupInstitutionalZones(zones: InstitutionalZone[]): {
  all: InstitutionalZone[];
  support: InstitutionalZone[];
  resistance: InstitutionalZone[];
} {
  return {
    all: zones,
    support: zones.filter((zone) => zone.type === "support"),
    resistance: zones.filter((zone) => zone.type === "resistance")
  };
}

export function buildInstitutionalTrendSummary(result: InstitutionalZonesResult): InstitutionalTrendSummary {
  const grouped = groupInstitutionalZones(result.zones);
  const supportStrength = average(grouped.support.map((zone) => zone.strength));
  const resistanceStrength = average(grouped.resistance.map((zone) => zone.strength));
  const flowBias = result.analysis.flows.inflows - result.analysis.flows.outflows;
  const bias = supportStrength - resistanceStrength;
  const direction = Math.abs(bias) < 0.05 && Math.abs(flowBias) < Math.max(1, result.analysis.volume) * 0.03
    ? "neutral"
    : bias >= 0
      ? "bullish"
      : "bearish";
  const score = clamp01(Math.abs(bias) * 0.7 + Math.min(1, Math.abs(flowBias) / Math.max(1, result.analysis.volume)) * 0.3);
  const confidence = clamp01(average(result.zones.map((zone) => zone.confidence)) * 0.7 + score * 0.3);
  const rationale =
    direction === "neutral"
      ? "Los soportes y resistencias institucionales estan equilibrados"
      : direction === "bullish"
        ? "Predominan soportes institucionales y el flujo neto acompana"
        : "Predominan resistencias institucionales y el flujo neto es defensivo";

  return {
    direction,
    score: Number(score.toFixed(4)),
    confidence: Number(confidence.toFixed(4)),
    rationale,
    supportStrength: Number(supportStrength.toFixed(4)),
    resistanceStrength: Number(resistanceStrength.toFixed(4)),
    flowBias: Number(flowBias.toFixed(2))
  };
}

export function buildInstitutionalMetricsSummary(result: InstitutionalZonesResult): InstitutionalMetricsSummary {
  const grouped = groupInstitutionalZones(result.zones);
  const averageZoneStrength = average(result.zones.map((zone) => zone.strength));
  const averageZoneConfidence = average(result.zones.map((zone) => zone.confidence));
  const maxZoneStrength = result.zones.reduce((highest, zone) => Math.max(highest, zone.strength), 0);
  const netFlow = result.analysis.flows.inflows - result.analysis.flows.outflows;

  return {
    candlesAnalyzed: result.candlesAnalyzed,
    zoneCount: result.zones.length,
    supportZoneCount: grouped.support.length,
    resistanceZoneCount: grouped.resistance.length,
    averageZoneStrength: Number(averageZoneStrength.toFixed(4)),
    maxZoneStrength: Number(maxZoneStrength.toFixed(4)),
    averageZoneConfidence: Number(averageZoneConfidence.toFixed(4)),
    sourceCount: result.sourceReports.length,
    liquidity: result.analysis.liquidity,
    volume: result.analysis.volume,
    openPositions: result.analysis.openPositions.count,
    fundsOwnershipPct: result.analysis.fundsOwnershipPct,
    netFlow: Number(netFlow.toFixed(2))
  };
}

export function buildInstitutionalPositionsSummary(result: InstitutionalDataServiceResult): InstitutionalPositionsSummary {
  const positions13F = result.sourceReports
    .filter((report) => report.kind === "sec_edgar_13f" && report.observation)
    .map((report) => ({
      sourceId: report.sourceId,
      asOf: report.observation!.asOf,
      count: report.observation!.openPositions?.count ?? result.analysis.openPositions.count,
      notional: report.observation!.openPositions?.notional,
      fundsOwnershipPct: report.observation!.fundsOwnershipPct,
      volume: report.observation!.volume,
      confidence: report.observation!.confidence
    }));

  return {
    ticker: result.analysis.ticker,
    period: result.analysis.period,
    horizon: result.analysis.horizon,
    positions13F,
    flows: {
      ...result.analysis.flows,
      netFlow: Number((result.analysis.flows.inflows - result.analysis.flows.outflows).toFixed(2))
    },
    sourceReports: result.sourceReports
  };
}

/**
 * Construye las configuraciones por defecto de las 4 fuentes institucionales.
 *
 * ESTRATEGIA DE PRIORIDADES:
 * - priority 1 (SEC EDGAR): La fuente más autoritativa (filings regulatorios reales).
 *   Pero es lenta (EFTS + XML parsing), por eso se intenta primero.
 * - priority 2 (FINRA): También regulatoria, pero requiere precarga completa
 *   del dataset (ensureFinraCache). Tiene cache propio.
 * - priority 3 (Yahoo Options): API gratuita sin autenticación formal.
 *   Rápida pero menos confiable que fuentes regulatorias.
 * - priority 4 (Yahoo Institutional): Similar a options, pero con rate limit
 *   más restrictivo.
 *
 * POR QUÉ cacheTtlMs DIFERENTES:
 * - SEC/FINRA (10 min): Datos regulatorios cambian lentamente (semanal/mensual).
 * - Yahoo Options (2 min): Opciones cambian minuto a minuto.
 * - Yahoo Institutional (5 min): Holdings cambian trimestralmente, pero el
 *   crumb session expira cada 15 min.
 *
 * POR QUÉ rateLimitPerMinute:
 * - Yahoo (20/min): APIs no oficiales — superar este límite puede resultar
 *   en bloqueo de IP. 20/min es conservador.
 * - SEC (10/min): SEC tiene rate limiting estricto y requiere User-Agent
 *   identificable.
 * - FINRA (10/min): Similar a SEC, aunque usa POST con CSV response.
 */
function buildDefaultSourceConfigs(): InstitutionalSourceConfig[] {
  return [
    {
      sourceId: "sec-edgar-13f",
      kind: "sec_edgar_13f",
      label: "SEC EDGAR 13F",
      enabled: true,
      tier: "free",
      baseUrl: "https://efts.sec.gov",
      path: "/LATEST/search-index",
      priority: 1,
      cacheTtlMs: 600_000,
      rateLimitPerMinute: 10,
      parser: parseSecEdgar13fReal as unknown as InstitutionalSourceParser
    },
    {
      sourceId: "finra-short-interest",
      kind: "finra_short_interest",
      label: "FINRA Short Interest",
      enabled: true,
      tier: "free",
      baseUrl: "https://api.finra.org",
      path: "/data/group/otcmarket/name/consolidatedShortInterest",
      priority: 2,
      cacheTtlMs: 600_000,
      rateLimitPerMinute: 10,
      parser: parseFinraShortInterestReal as unknown as InstitutionalSourceParser
    },
    {
      sourceId: "yahoo-options-flow",
      kind: "yahoo_options_flow",
      label: "Yahoo Options Flow",
      enabled: true,
      tier: "free",
      baseUrl: "https://query2.finance.yahoo.com",
      path: "/v7/finance/options",
      priority: 3,
      cacheTtlMs: 120_000,
      rateLimitPerMinute: 20,
      parser: parseYahooOptionsFlow
    },
    {
      sourceId: "yahoo-institutional",
      kind: "yahoo_institutional",
      label: "Yahoo Institutional",
      enabled: true,
      tier: "free",
      baseUrl: "https://query2.finance.yahoo.com",
      path: "/v10/finance/quoteSummary",
      priority: 4,
      cacheTtlMs: 300_000,
      rateLimitPerMinute: 20,
      parser: parseYahooInstitutional
    }
  ];
}

function normalizeTicker(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  const ticker = String(raw ?? "SPY").trim().toUpperCase().replace(/[^A-Z0-9.\-]/g, "");
  return ticker.length > 0 ? ticker.slice(0, 16) : "SPY";
}

function normalizePeriod(value: string | string[] | undefined): InstitutionalAnalysisPeriod {
  const raw = Array.isArray(value) ? value[0] : value;
  switch (String(raw ?? "daily").toLowerCase()) {
    case "intraday":
      return "intraday";
    case "weekly":
      return "weekly";
    case "monthly":
      return "monthly";
    case "quarterly":
      return "quarterly";
    default:
      return "daily";
  }
}

function normalizeHorizon(value: string | string[] | undefined): InstitutionalHorizon {
  const raw = Array.isArray(value) ? value[0] : value;
  switch (String(raw ?? "medium").toLowerCase()) {
    case "short":
      return "short";
    case "long":
      return "long";
    default:
      return "medium";
  }
}

function normalizeIdentifier(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 32);
}

/**
 * Genera una semilla determinista a partir del ticker.
 *
 * POR QUÉ SUMAR CHARCODES: Queremos que el mismo ticker produzca SIEMPRE
 * los mismos valores sintéticos (determinista), pero tickers distintos
 * produzcan valores diferentes. Sumar los charCodes de cada letra del
 * ticker logra esto sin necesidad de un RNG con semilla.
 * Ejemplo: "SPY" = 83('S') + 80('P') + 89('Y') = 252
 */
function buildTickerSeed(ticker: string): number {
  return ticker.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

/**
 * Factor multiplicador según el período seleccionado.
 *
 * POR QUÉ ESTOS VALORES: Períodos más largos (quarterly) deberían mostrar
 * mayor acumulación de volumen y flujos que períodos cortos (intraday).
 * Los factores se calibraron para que quarterly ≈ 2× intraday.
 * - intraday: 0.75 (menor actividad)
 * - daily: 1.0 (línea base)
 * - weekly: 1.18
 * - monthly: 1.38
 * - quarterly: 1.58 (mayor acumulación)
 */
function getPeriodFactor(period: InstitutionalAnalysisPeriod): number {
  switch (period) {
    case "intraday":
      return 0.75;
    case "weekly":
      return 1.18;
    case "monthly":
      return 1.38;
    case "quarterly":
      return 1.58;
    default:
      return 1;
  }
}

/**
 * Factor multiplicador según el horizonte de inversión.
 *
 * POR QUÉ: Horizontes más largos implican mayor capital comprometido
 * y por tanto mayor exposición institucional.
 * - short: 0.9 (menor exposición)
 * - medium: 1.0 (línea base)
 * - long: 1.12 (mayor exposición)
 */
function getHorizonFactor(horizon: InstitutionalHorizon): number {
  switch (horizon) {
    case "short":
      return 0.9;
    case "long":
      return 1.12;
    default:
      return 1;
  }
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
