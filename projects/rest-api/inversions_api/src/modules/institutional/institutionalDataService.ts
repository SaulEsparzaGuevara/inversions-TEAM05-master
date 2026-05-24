import {
  createInstitutionalAnalysisContract,
  isFiniteNumber,
  isInstitutionalAnalysisContract,
  isNonEmptyString,
  type InstitutionalAnalysisContract,
  type InstitutionalFlowSnapshot,
  type InstitutionalHorizon,
  type InstitutionalLiquidity,
  type InstitutionalOpenPositionsSnapshot,
  type InstitutionalAnalysisPeriod
} from "./institutionalContract.js";

/**
 * Fuente institucional soportada por el servicio.
 */
export type InstitutionalSourceKind =
  | "sec_edgar_13f"
  | "finra_short_interest"
  | "unusual_whales"
  | "finviz_institutional"
  | "yahoo_options_flow"
  | "yahoo_institutional";

/**
 * Nivel de acceso de la fuente.
 */
export type InstitutionalAccessTier = "free" | "paid";

/**
 * Estado de ejecución de una fuente.
 */
export type InstitutionalSourceStatus =
  | "ok"
  | "cached"
  | "rate_limited"
  | "failed"
  | "error";

/**
 * Error normalizado por fuente.
 */
export interface InstitutionalSourceError {
  sourceId: string;
  kind: InstitutionalSourceKind;
  code: string;
  message: string;
  retryable: boolean;
  status?: number;
}

/**
 * Respuesta normalizada de una fuente institucional.
 *
 * Esta estructura contiene un subconjunto común que luego se fusiona en el
 * contrato canónico de T106.
 */
export interface InstitutionalSourceObservation {
  sourceId: string;
  kind: InstitutionalSourceKind;
  ticker: string;
  instrument?: string;
  strike?: number;
  period?: InstitutionalAnalysisPeriod;
  volume?: number;
  liquidity?: InstitutionalLiquidity;
  horizon?: InstitutionalHorizon;
  fundsOwnershipPct?: number;
  flows?: Partial<InstitutionalFlowSnapshot>;
  openPositions?: Partial<InstitutionalOpenPositionsSnapshot>;
  asOf: string;
  confidence: number;
  notes: string[];
  raw: unknown;
}

/**
 * Resultado de una fuente individual.
 */
export interface InstitutionalSourceReport {
  sourceId: string;
  kind: InstitutionalSourceKind;
  tier: InstitutionalAccessTier;
  enabled: boolean;
  status: InstitutionalSourceStatus;
  cacheHit: boolean;
  latencyMs: number;
  fetchedAt: string;
  observation?: InstitutionalSourceObservation;
  error?: InstitutionalSourceError;
}

/**
 * Estado global de la resolución multi-fuente.
 * - "ok": todas las fuentes retornaron datos
 * - "partial": al menos una fuente falló, pero se obtuvo datos de otras
 * - "all_failed": ninguna fuente retornó datos utilizables
 */
export type InstitutionalOverallStatus = "ok" | "partial" | "all_failed";

/**
 * Resultado agregado del servicio.
 */
export interface InstitutionalDataServiceResult {
  analysis: InstitutionalAnalysisContract;
  sourceReports: InstitutionalSourceReport[];
  cacheHit: boolean;
  usedSourceIds: string[];
  overallStatus: InstitutionalOverallStatus;
}

/**
 * Cliente fetch mínimo para mantener dependencia solo en fetch nativo.
 */
export interface FetchLikeResponse {
  ok: boolean;
  status: number;
  statusText: string;
  json(): Promise<unknown>;
  text(): Promise<string>;
  headers: {
    get(name: string): string | null;
  };
}

export interface FetchLike {
  (input: string, init?: { method?: string; headers?: Record<string, string>; signal?: AbortSignal }): Promise<FetchLikeResponse>;
}

/**
 * Callback de construcción de path para cada fuente.
 */
export type InstitutionalSourcePathBuilder = (request: InstitutionalAnalysisContract) => string;

/**
 * Callback de construcción de query params para cada fuente.
 */
export type InstitutionalSourceQueryBuilder = (
  request: InstitutionalAnalysisContract
) => Record<string, string | number | boolean | undefined>;

/**
 * Callback de normalización especializada por fuente.
 */
export type InstitutionalSourceParser = (
  payload: unknown,
  request: InstitutionalAnalysisContract,
  source: InstitutionalSourceConfig
) => InstitutionalSourceObservation | null | Promise<InstitutionalSourceObservation | null>;

/**
 * Configuración de una fuente institucional configurable.
 */
export interface InstitutionalSourceConfig {
  sourceId: string;
  kind: InstitutionalSourceKind;
  label: string;
  enabled: boolean;
  tier: InstitutionalAccessTier;
  baseUrl: string;
  path: string | InstitutionalSourcePathBuilder;
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  apiKey?: string;
  timeoutMs?: number;
  rateLimitPerMinute?: number;
  cacheTtlMs?: number;
  priority?: number;
  fallbackSourceIds?: string[];
  queryParams?: InstitutionalSourceQueryBuilder;
  parser?: InstitutionalSourceParser;
}

/**
 * Configuración del servicio.
 */
export interface InstitutionalDataServiceOptions {
  sources: InstitutionalSourceConfig[];
  cacheTtlMs?: number;
  cacheMaxEntries?: number;
  fetchImpl?: FetchLike;
  now?: () => number;
}

interface CacheEntry {
  value: InstitutionalSourceObservation;
  expiresAt: number;
}

interface RateState {
  timestamps: number[];
}

const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_CACHE_MAX_ENTRIES = 250;
const DEFAULT_SOURCE_TIMEOUT_MS = 12_000;

/**
 * Tipo guard para la configuración de una fuente institucional.
 */
export function isInstitutionalSourceConfig(value: unknown): value is InstitutionalSourceConfig {
  if (!value || typeof value !== "object") {
    return false;
  }

  const source = value as InstitutionalSourceConfig;
  return (
    isNonEmptyString(source.sourceId) &&
    (source.kind === "sec_edgar_13f" ||
      source.kind === "finra_short_interest" ||
      source.kind === "unusual_whales" ||
      source.kind === "finviz_institutional" ||
      source.kind === "yahoo_options_flow" ||
      source.kind === "yahoo_institutional") &&
    isNonEmptyString(source.label) &&
    typeof source.enabled === "boolean" &&
    (source.tier === "free" || source.tier === "paid") &&
    isNonEmptyString(source.baseUrl) &&
    (isNonEmptyString(source.path) || typeof source.path === "function") &&
    (source.method === undefined || source.method === "GET" || source.method === "POST")
  );
}

/**
 * Tipo guard para una observación institucional normalizada.
 */
export function isInstitutionalSourceObservation(value: unknown): value is InstitutionalSourceObservation {
  if (!value || typeof value !== "object") {
    return false;
  }

  const observation = value as InstitutionalSourceObservation;
  return (
    isNonEmptyString(observation.sourceId) &&
    (observation.kind === "sec_edgar_13f" ||
      observation.kind === "finra_short_interest" ||
      observation.kind === "unusual_whales" ||
      observation.kind === "finviz_institutional" ||
      observation.kind === "yahoo_options_flow" ||
      observation.kind === "yahoo_institutional") &&
    isNonEmptyString(observation.ticker) &&
    isNonEmptyString(observation.asOf) &&
    isFiniteNumber(observation.confidence) &&
    observation.confidence >= 0 &&
    observation.confidence <= 1 &&
    Array.isArray(observation.notes) &&
    observation.notes.every(isNonEmptyString)
  );
}

/**
 * Tipo guard para el resultado agregado del servicio.
 */
export function isInstitutionalDataServiceResult(value: unknown): value is InstitutionalDataServiceResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as InstitutionalDataServiceResult;
  return (
    isInstitutionalAnalysisContract(result.analysis) &&
    Array.isArray(result.sourceReports) &&
    result.sourceReports.every(isInstitutionalSourceReport) &&
    typeof result.cacheHit === "boolean" &&
    Array.isArray(result.usedSourceIds) &&
    result.usedSourceIds.every(isNonEmptyString) &&
    (result.overallStatus === "ok" || result.overallStatus === "partial" || result.overallStatus === "all_failed")
  );
}

/**
 * Tipo guard para un reporte de fuente.
 */
export function isInstitutionalSourceReport(value: unknown): value is InstitutionalSourceReport {
  if (!value || typeof value !== "object") {
    return false;
  }

  const report = value as InstitutionalSourceReport;
  return (
    isNonEmptyString(report.sourceId) &&
    (report.kind === "sec_edgar_13f" ||
      report.kind === "finra_short_interest" ||
      report.kind === "unusual_whales" ||
      report.kind === "finviz_institutional" ||
      report.kind === "yahoo_options_flow" ||
      report.kind === "yahoo_institutional") &&
    (report.tier === "free" || report.tier === "paid") &&
    typeof report.enabled === "boolean" &&
    (report.status === "ok" ||
      report.status === "cached" ||
      report.status === "rate_limited" ||
      report.status === "failed" ||
      report.status === "error") &&
    typeof report.cacheHit === "boolean" &&
    isFiniteNumber(report.latencyMs) &&
    isNonEmptyString(report.fetchedAt) &&
    (report.observation === undefined || isInstitutionalSourceObservation(report.observation)) &&
    (report.error === undefined || isInstitutionalSourceError(report.error))
  );
}

/**
 * Tipo guard para errores normalizados por fuente.
 */
export function isInstitutionalSourceError(value: unknown): value is InstitutionalSourceError {
  if (!value || typeof value !== "object") {
    return false;
  }

  const error = value as InstitutionalSourceError;
  return (
    isNonEmptyString(error.sourceId) &&
    (error.kind === "sec_edgar_13f" ||
      error.kind === "finra_short_interest" ||
      error.kind === "unusual_whales" ||
      error.kind === "finviz_institutional" ||
      error.kind === "yahoo_options_flow" ||
      error.kind === "yahoo_institutional") &&
    isNonEmptyString(error.code) &&
    isNonEmptyString(error.message) &&
    typeof error.retryable === "boolean" &&
    (error.status === undefined || isFiniteNumber(error.status))
  );
}

/**
 * Servicio de integración con fuentes institucionales externas.
 *
 * Se apoya en fetch nativo, caché configurable, fallback por prioridad de
 * fuente y un contrato de salida común basado en T106.
 */
export class InstitutionalDataService {
  private readonly sources: InstitutionalSourceConfig[];
  private readonly cacheTtlMs: number;
  private readonly cacheMaxEntries: number;
  private readonly fetchImpl: FetchLike;
  private readonly now: () => number;
  private readonly cache = new Map<string, CacheEntry>();
  private readonly rateState = new Map<string, RateState>();

  constructor(options: InstitutionalDataServiceOptions) {
    if (!Array.isArray(options.sources) || options.sources.length === 0) {
      throw new Error("InstitutionalDataService requires at least one source configuration.");
    }

    const invalidSource = options.sources.find((source) => !isInstitutionalSourceConfig(source));
    if (invalidSource) {
      throw new Error(`Invalid institutional source configuration: ${JSON.stringify(invalidSource)}`);
    }

    this.sources = [...options.sources].sort((left, right) => (left.priority ?? 100) - (right.priority ?? 100));
    this.cacheTtlMs = options.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
    this.cacheMaxEntries = options.cacheMaxEntries ?? DEFAULT_CACHE_MAX_ENTRIES;
    this.fetchImpl = options.fetchImpl ?? this.createNativeFetch();
    this.now = options.now ?? (() => Date.now());
  }

  /**
   * Resolves institutional data using the configured sources.
   */
  async resolve(request: InstitutionalAnalysisContract): Promise<InstitutionalDataServiceResult> {
    const normalizedRequest = createInstitutionalAnalysisContract(request);
    const sourceReports: InstitutionalSourceReport[] = [];
    const observations: InstitutionalSourceObservation[] = [];

    for (const source of this.sources) {
      if (!source.enabled) {
        sourceReports.push(this.buildSkippedReport(source, "failed", "SOURCE_DISABLED", "Source is disabled", false, 0));
        continue;
      }

      const cached = this.getCachedObservation(source, normalizedRequest);
      if (cached) {
        sourceReports.push({
          sourceId: source.sourceId,
          kind: source.kind,
          tier: source.tier,
          enabled: source.enabled,
          status: "cached",
          cacheHit: true,
          latencyMs: 0,
          fetchedAt: cached.asOf,
          observation: cached
        });
        observations.push(cached);
        continue;
      }

      const rateLimited = this.isRateLimited(source);
      if (rateLimited) {
        sourceReports.push(
          this.buildSkippedReport(
            source,
            "rate_limited",
            "RATE_LIMITED",
            `Rate limit reached for ${source.sourceId}`,
            false,
            0
          )
        );
        continue;
      }

      const startedAt = this.now();
      this.registerRateAttempt(source);

      try {
        const observation = await this.fetchAndNormalizeSource(source, normalizedRequest);
        if (!observation) {
          sourceReports.push(
            this.buildSkippedReport(
              source,
              "failed",
              "EMPTY_OR_UNSUPPORTED_RESPONSE",
              `Source ${source.sourceId} returned no usable institutional signal`,
              true,
              this.now() - startedAt
            )
          );
          continue;
        }

        this.setCache(source, normalizedRequest, observation);
        observations.push(observation);
        sourceReports.push({
          sourceId: source.sourceId,
          kind: source.kind,
          tier: source.tier,
          enabled: source.enabled,
          status: "ok",
          cacheHit: false,
          latencyMs: this.now() - startedAt,
          fetchedAt: observation.asOf,
          observation
        });
      } catch (error) {
        const normalized = this.normalizeSourceError(source, error);
        sourceReports.push({
          sourceId: source.sourceId,
          kind: source.kind,
          tier: source.tier,
          enabled: source.enabled,
          status: "error",
          cacheHit: false,
          latencyMs: this.now() - startedAt,
          fetchedAt: new Date(this.now()).toISOString(),
          error: normalized
        });
      }
    }

    const anyDataReturned = observations.length > 0;
    const analysis = anyDataReturned
      ? this.mergeObservations(normalizedRequest, observations)
      : normalizedRequest;

    const cacheHit = sourceReports.every((report) => report.status === "cached");
    const allOk = sourceReports.every((r) => r.status === "ok" || r.status === "cached");

    const overallStatus: InstitutionalOverallStatus = !anyDataReturned
      ? "all_failed"
      : allOk
        ? "ok"
        : "partial";

    return {
      analysis,
      sourceReports,
      cacheHit,
      usedSourceIds: observations.map((observation) => observation.sourceId),
      overallStatus
    };
  }

  /**
   * Convenience method that returns only the T106 analysis contract.
   */
  async resolveAnalysis(request: InstitutionalAnalysisContract): Promise<InstitutionalAnalysisContract> {
    const result = await this.resolve(request);
    return result.analysis;
  }

  private createNativeFetch(): FetchLike {
    const nativeFetch = globalThis.fetch;
    if (!nativeFetch) {
      throw new Error("Native fetch is not available in this runtime.");
    }

    return async (input: string, init?: { method?: string; headers?: Record<string, string>; signal?: AbortSignal }) =>
      nativeFetch(input, init as never) as Promise<FetchLikeResponse>;
  }

  private buildSourceUrl(source: InstitutionalSourceConfig, request: InstitutionalAnalysisContract): string {
    const rawPath = typeof source.path === "function" ? source.path(request) : source.path;
    const url = new URL(rawPath, source.baseUrl);

    const queryParams = source.queryParams?.(request) ?? {
      ticker: request.ticker,
      period: request.period,
      horizon: request.horizon,
      strike: request.strike,
      analysisId: request.analysisId
    };

    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }

    return url.toString();
  }

  private async fetchAndNormalizeSource(
    source: InstitutionalSourceConfig,
    request: InstitutionalAnalysisContract
  ): Promise<InstitutionalSourceObservation | null> {
    const parser = source.parser ?? this.getDefaultParser(source.kind);

    if (source.parser) {
      return await parser(null, request, source);
    }

    const url = this.buildSourceUrl(source, request);
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(source.headers ?? {})
    };

    if (source.apiKey && !headers.Authorization) {
      headers.Authorization = `Bearer ${source.apiKey}`;
    }

    const controller = new AbortController();
    const timeoutMs = source.timeoutMs ?? DEFAULT_SOURCE_TIMEOUT_MS;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await this.fetchImpl(url, {
        method: source.method ?? "GET",
        headers,
        signal: controller.signal
      });

      if (!response.ok) {
        throw this.buildHttpError(source, response.status, response.statusText);
      }

      const payload = await response.json().catch(async () => {
        const text = await response.text();
        return text;
      });

      return await parser(payload, request, source);
    } catch (error) {
      if (controller.signal.aborted) {
        throw this.buildTimeoutError(source, timeoutMs);
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private getDefaultParser(kind: InstitutionalSourceKind): InstitutionalSourceParser {
    switch (kind) {
      case "sec_edgar_13f":
        return this.parseSecEdgar13f.bind(this);
      case "finra_short_interest":
        return this.parseFinraShortInterest.bind(this);
      case "unusual_whales":
        return this.parseUnusualWhales.bind(this);
      case "finviz_institutional":
        return this.parseFinvizInstitutional.bind(this);
      case "yahoo_options_flow":
        return this.parseYahooOptionsFlow.bind(this);
      case "yahoo_institutional":
        return this.parseYahooInstitutional.bind(this);
    }
  }

  private parseSecEdgar13f(
    payload: unknown,
    request: InstitutionalAnalysisContract,
    source: InstitutionalSourceConfig
  ): InstitutionalSourceObservation | null {
    const holdingsCount = this.extractNumber(payload, [
      ["holdingsCount"],
      ["holdings", "length"],
      ["positions", "length"]
    ]);
    const fundsOwnershipPct = this.extractNumber(payload, [
      ["fundsOwnershipPct"],
      ["institutionalOwnershipPct"],
      ["ownershipPct"],
      ["institutional", "ownershipPct"]
    ]);
    const volume = this.extractNumber(payload, [["volume"], ["averageVolume"], ["avgVolume"]]);
    const inflows = this.extractNumber(payload, [["inflows"], ["netInflow"], ["buyFlow"]]);
    const outflows = this.extractNumber(payload, [["outflows"], ["netOutflow"], ["sellFlow"]]);

    return this.buildObservationFromPayload(source, request, payload, {
      fundsOwnershipPct,
      volume,
      flows: { inflows, outflows },
      openPositions: {
        count: holdingsCount,
        notional: this.extractNumber(payload, [["notional"], ["openPositionsNotional"]])
      },
      notes: ["SEC EDGAR 13F normalized"]
    });
  }

  private parseFinraShortInterest(
    payload: unknown,
    request: InstitutionalAnalysisContract,
    source: InstitutionalSourceConfig
  ): InstitutionalSourceObservation | null {
    const shortInterest = this.extractNumber(payload, [["shortInterest"], ["short_interest"], ["daysToCover"]]);
    const volume = this.extractNumber(payload, [["volume"], ["avgDailyVolume"], ["averageDailyVolume"]]);
    const fundsOwnershipPct = this.extractNumber(payload, [["fundsOwnershipPct"], ["institutionalOwnershipPct"]]);
    const positions = this.extractNumber(payload, [["openPositions"], ["positions"], ["sharesShort"]]);

    return this.buildObservationFromPayload(source, request, payload, {
      fundsOwnershipPct,
      volume,
      flows: {
        inflows: this.extractNumber(payload, [["positiveFlow"], ["inflows"]]),
        outflows: shortInterest
      },
      openPositions: {
        count: positions,
        notional: this.extractNumber(payload, [["notional"], ["shortInterestNotional"]])
      },
      notes: ["FINRA short-interest normalized"]
    });
  }

  private parseUnusualWhales(
    payload: unknown,
    request: InstitutionalAnalysisContract,
    source: InstitutionalSourceConfig
  ): InstitutionalSourceObservation | null {
    const flowPressure = this.extractNumber(payload, [["flow"], ["whaleFlow"], ["optionsFlow"]]);
    const fundsOwnershipPct = this.extractNumber(payload, [["fundsOwnershipPct"], ["institutionalOwnershipPct"]]);
    const volume = this.extractNumber(payload, [["volume"], ["optionsVolume"], ["flowVolume"]]);
    const openPositions = this.extractNumber(payload, [["openPositions"], ["positions"], ["contractsOpen"]]);

    return this.buildObservationFromPayload(source, request, payload, {
      fundsOwnershipPct,
      volume,
      flows: {
        inflows: flowPressure,
        outflows: this.extractNumber(payload, [["bearishFlow"], ["sellFlow"], ["negativeFlow"]])
      },
      openPositions: {
        count: openPositions,
        notional: this.extractNumber(payload, [["notional"], ["openInterestNotional"]])
      },
      notes: ["Unusual Whales flow normalized"]
    });
  }

  private parseFinvizInstitutional(
    payload: unknown,
    request: InstitutionalAnalysisContract,
    source: InstitutionalSourceConfig
  ): InstitutionalSourceObservation | null {
    const fundsOwnershipPct = this.extractNumber(payload, [["fundsOwnershipPct"], ["institutionalOwnership"], ["instOwn"]]);
    const volume = this.extractNumber(payload, [["volume"], ["relativeVolume"], ["avgVolume"]]);
    const openPositions = this.extractNumber(payload, [["openPositions"], ["positions"], ["institutionalPositions"]]);

    return this.buildObservationFromPayload(source, request, payload, {
      fundsOwnershipPct,
      volume,
      flows: {
        inflows: this.extractNumber(payload, [["inflows"], ["positiveFlow"]]),
        outflows: this.extractNumber(payload, [["outflows"], ["negativeFlow"]])
      },
      openPositions: {
        count: openPositions,
        notional: this.extractNumber(payload, [["notional"], ["openPositionsNotional"]])
      },
      notes: ["Finviz institutional normalized"]
    });
  }

  private parseYahooOptionsFlow(
    payload: unknown,
    request: InstitutionalAnalysisContract,
    source: InstitutionalSourceConfig
  ): InstitutionalSourceObservation | null {
    const optionChain = this.extractValue(payload, [["optionChain", "result", "0"]]);
    const options = optionChain && typeof optionChain === "object"
      ? (optionChain as Record<string, unknown>)["options"]
      : undefined;
    const firstExpiration = Array.isArray(options) && options.length > 0
      ? options[0]
      : undefined;
    const calls = firstExpiration && typeof firstExpiration === "object"
      ? (firstExpiration as Record<string, unknown>)["calls"]
      : undefined;
    const puts = firstExpiration && typeof firstExpiration === "object"
      ? (firstExpiration as Record<string, unknown>)["puts"]
      : undefined;

    const callVolume = Array.isArray(calls)
      ? (calls as Record<string, unknown>[]).reduce((sum, c) => sum + (typeof c.volume === "number" ? c.volume : 0), 0)
      : 0;
    const putVolume = Array.isArray(puts)
      ? (puts as Record<string, unknown>[]).reduce((sum, p) => sum + (typeof p.volume === "number" ? p.volume : 0), 0)
      : 0;
    const callOi = Array.isArray(calls)
      ? (calls as Record<string, unknown>[]).reduce((sum, c) => sum + (typeof c.openInterest === "number" ? c.openInterest : 0), 0)
      : 0;
    const putOi = Array.isArray(puts)
      ? (puts as Record<string, unknown>[]).reduce((sum, p) => sum + (typeof p.openInterest === "number" ? p.openInterest : 0), 0)
      : 0;

    const totalVolume = callVolume + putVolume;
    const putCallVolumeRatio = putVolume > 0 ? callVolume / putVolume : 1;
    const putCallOiRatio = putOi > 0 ? callOi / putOi : 1;

    return this.buildObservationFromPayload(source, request, payload, {
      volume: totalVolume > 0 ? totalVolume : undefined,
      flows: {
        inflows: callVolume,
        outflows: putVolume
      },
      openPositions: {
        count: callOi + putOi
      },
      notes: [`Yahoo Options Flow: ${callVolume} call vol, ${putVolume} put vol, P/C vol ratio ${putCallVolumeRatio.toFixed(2)}, P/C OI ratio ${putCallOiRatio.toFixed(2)}`]
    });
  }

  private parseYahooInstitutional(
    payload: unknown,
    request: InstitutionalAnalysisContract,
    source: InstitutionalSourceConfig
  ): InstitutionalSourceObservation | null {
    const quoteSummary = this.extractValue(payload, [["quoteSummary", "result", "0"]]);
    const institutionOwnership = quoteSummary && typeof quoteSummary === "object"
      ? (quoteSummary as Record<string, unknown>)["institutionOwnership"]
      : undefined;
    const ownershipList = institutionOwnership && typeof institutionOwnership === "object"
      ? (institutionOwnership as Record<string, unknown>)["ownershipList"]
      : undefined;

    const holders: Array<Record<string, unknown>> = Array.isArray(ownershipList)
      ? ownershipList as Record<string, unknown>[]
      : [];

    const totalHeld = holders.reduce((sum, h) => sum + (typeof h.position === "number" ? h.position : 0), 0);
    const totalChange = holders.reduce((sum, h) => sum + (typeof h.change === "number" ? h.change : 0), 0);

    const fundsOwnershipPct = this.extractNumber(payload, [
      ["quoteSummary", "result", "0", "institutionOwnership", "ownershipList", "0", "pctHeld"],
      ["quoteSummary", "result", "0", "majorHoldersBreakdown", "institutionsPercentHeld"]
    ]);

    return this.buildObservationFromPayload(source, request, payload, {
      fundsOwnershipPct: fundsOwnershipPct,
      volume: totalHeld > 0 ? totalHeld : undefined,
      flows: {
        inflows: totalChange > 0 ? totalChange : 0,
        outflows: totalChange < 0 ? Math.abs(totalChange) : 0
      },
      openPositions: {
        count: holders.length
      },
      notes: [`Yahoo Institutional: ${holders.length} holders, ${totalHeld.toLocaleString()} shares held total`]
    });
  }

  private buildObservationFromPayload(
    source: InstitutionalSourceConfig,
    request: InstitutionalAnalysisContract,
    payload: unknown,
    partial: {
      fundsOwnershipPct?: number;
      volume?: number;
      flows?: Partial<InstitutionalFlowSnapshot>;
      openPositions?: Partial<InstitutionalOpenPositionsSnapshot>;
      notes: string[];
    }
  ): InstitutionalSourceObservation | null {
    const ticker = this.extractString(payload, [["ticker"], ["symbol"], ["instrument"]]) ?? request.ticker;
    const asOf =
      this.extractString(payload, [["asOf"], ["timestamp"], ["updatedAt"], ["date"]]) ??
      new Date(this.now()).toISOString();

    const observation: InstitutionalSourceObservation = {
      sourceId: source.sourceId,
      kind: source.kind,
      ticker,
      instrument: this.extractString(payload, [["instrument"], ["name"], ["company"]]) ?? request.instrument,
      strike: this.extractNumber(payload, [["strike"], ["targetStrike"], ["referenceStrike"]]) ?? request.strike,
      period: this.extractPeriod(payload) ?? request.period,
      volume: partial.volume,
      liquidity: this.extractLiquidity(payload) ?? request.liquidity,
      horizon: this.extractHorizon(payload) ?? request.horizon,
      fundsOwnershipPct: this.normalizePercentage(partial.fundsOwnershipPct),
      flows: this.normalizeFlowSnapshot(partial.flows),
      openPositions: this.normalizeOpenPositionsSnapshot(partial.openPositions),
      asOf,
      confidence: this.computeConfidence(partial),
      notes: partial.notes,
      raw: payload
    };

    if (!this.hasMeaningfulSignal(observation)) {
      return null;
    }

    return observation;
  }

  private hasMeaningfulSignal(observation: InstitutionalSourceObservation): boolean {
    return (
      isFiniteNumber(observation.volume) ||
      isFiniteNumber(observation.fundsOwnershipPct) ||
      isFiniteNumber(observation.openPositions?.count) ||
      isFiniteNumber(observation.flows?.inflows) ||
      isFiniteNumber(observation.flows?.outflows)
    );
  }

  private computeConfidence(partial: {
    fundsOwnershipPct?: number;
    volume?: number;
    flows?: Partial<InstitutionalFlowSnapshot>;
    openPositions?: Partial<InstitutionalOpenPositionsSnapshot>;
  }): number {
    const signals = [partial.fundsOwnershipPct, partial.volume, partial.flows?.inflows, partial.flows?.outflows, partial.openPositions?.count];
    const signalCount = signals.filter(isFiniteNumber).length;

    if (signalCount >= 4) {
      return 0.95;
    }

    if (signalCount === 3) {
      return 0.85;
    }

    if (signalCount === 2) {
      return 0.7;
    }

    return 0.55;
  }

  private normalizePercentage(value: number | undefined): number | undefined {
    if (!isFiniteNumber(value)) {
      return undefined;
    }

    if (value <= 1) {
      return Number((value * 100).toFixed(2));
    }

    return Number(value.toFixed(2));
  }

  private normalizeFlowSnapshot(
    flows: Partial<InstitutionalFlowSnapshot> | undefined
  ): Partial<InstitutionalFlowSnapshot> | undefined {
    if (!flows) {
      return undefined;
    }

    const normalized: Partial<InstitutionalFlowSnapshot> = {};

    if (isFiniteNumber(flows.inflows)) {
      normalized.inflows = Number(flows.inflows.toFixed(2));
    }

    if (isFiniteNumber(flows.outflows)) {
      normalized.outflows = Number(flows.outflows.toFixed(2));
    }

    if (isNonEmptyString(flows.asOf)) {
      normalized.asOf = flows.asOf;
    }

    return normalized;
  }

  private normalizeOpenPositionsSnapshot(
    openPositions: Partial<InstitutionalOpenPositionsSnapshot> | undefined
  ): Partial<InstitutionalOpenPositionsSnapshot> | undefined {
    if (!openPositions) {
      return undefined;
    }

    const normalized: Partial<InstitutionalOpenPositionsSnapshot> = {};

    if (isFiniteNumber(openPositions.count)) {
      normalized.count = Math.max(0, Math.round(openPositions.count));
    }

    if (isFiniteNumber(openPositions.notional)) {
      normalized.notional = Number(openPositions.notional.toFixed(2));
    }

    return normalized;
  }

  private extractString(payload: unknown, paths: string[][]): string | undefined {
    const value = this.extractValue(payload, paths);
    if (isNonEmptyString(value)) {
      return value;
    }

    return undefined;
  }

  private extractNumber(payload: unknown, paths: string[][]): number | undefined {
    const value = this.extractValue(payload, paths);
    if (isFiniteNumber(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value.replace(/[%,$\s]/g, ""));
      return Number.isFinite(parsed) ? parsed : undefined;
    }

    return undefined;
  }

  private extractPeriod(payload: unknown): InstitutionalAnalysisPeriod | undefined {
    const value = this.extractString(payload, [["period"], ["interval"], ["timeframe"]]);
    if (
      value === "intraday" ||
      value === "daily" ||
      value === "weekly" ||
      value === "monthly" ||
      value === "quarterly"
    ) {
      return value;
    }

    return undefined;
  }

  private extractLiquidity(payload: unknown): InstitutionalLiquidity | undefined {
    const value = this.extractString(payload, [["liquidity"], ["liquidityBucket"], ["marketLiquidity"]]);
    if (value === "low" || value === "medium" || value === "high") {
      return value;
    }

    return undefined;
  }

  private extractHorizon(payload: unknown): InstitutionalHorizon | undefined {
    const value = this.extractString(payload, [["horizon"], ["timeHorizon"], ["term"]]);
    if (value === "short" || value === "medium" || value === "long") {
      return value;
    }

    return undefined;
  }

  private extractValue(payload: unknown, paths: string[][]): unknown {
    for (const path of paths) {
      const value = this.readPath(payload, path);
      if (value !== undefined && value !== null) {
        if (path[path.length - 1] === "length" && Array.isArray(this.readPath(payload, path.slice(0, -1)))) {
          const arrayValue = this.readPath(payload, path.slice(0, -1));
          if (Array.isArray(arrayValue)) {
            return arrayValue.length;
          }
        }

        return value;
      }
    }

    return undefined;
  }

  private readPath(payload: unknown, path: string[]): unknown {
    let current: unknown = payload;

    for (const segment of path) {
      if (current === undefined || current === null) {
        return undefined;
      }

      if (segment === "length" && Array.isArray(current)) {
        return current.length;
      }

      if (typeof current !== "object") {
        return undefined;
      }

      const record = current as Record<string, unknown>;
      current = record[segment];
    }

    return current;
  }

  private mergeObservations(
    request: InstitutionalAnalysisContract,
    observations: InstitutionalSourceObservation[]
  ): InstitutionalAnalysisContract {
    const sortedObservations = [...observations].sort((left, right) => right.confidence - left.confidence);
    const firstDefined = <T>(selector: (observation: InstitutionalSourceObservation) => T | undefined): T | undefined => {
      for (const observation of sortedObservations) {
        const value = selector(observation);
        if (value !== undefined && value !== null) {
          return value;
        }
      }

      return undefined;
    };

    const flowInflows = observations
      .map((observation) => observation.flows?.inflows)
      .filter(isFiniteNumber)
      .reduce((sum, value) => sum + value, 0);

    const flowOutflows = observations
      .map((observation) => observation.flows?.outflows)
      .filter(isFiniteNumber)
      .reduce((sum, value) => sum + value, 0);

    const openPositionsCounts = observations
      .map((observation) => observation.openPositions?.count)
      .filter(isFiniteNumber);

    const openPositionsNotional = observations
      .map((observation) => observation.openPositions?.notional)
      .filter(isFiniteNumber)
      .reduce((sum, value) => sum + value, 0);

    const fundsOwnershipValues = observations
      .map((observation) => observation.fundsOwnershipPct)
      .filter(isFiniteNumber);

    const volumeValues = observations
      .map((observation) => observation.volume)
      .filter(isFiniteNumber);

    const fundsOwnershipPct = fundsOwnershipValues.length > 0
      ? Number((fundsOwnershipValues.reduce((sum, value) => sum + value, 0) / fundsOwnershipValues.length).toFixed(2))
      : request.fundsOwnershipPct;

    const volume = volumeValues.length > 0 ? Math.max(...volumeValues, request.volume) : request.volume;

    const liquidity = this.pickHighestLiquidity(
      request.liquidity,
      observations.map((observation) => observation.liquidity).filter((value): value is InstitutionalLiquidity => value !== undefined)
    );

    const horizon = firstDefined((observation) => observation.horizon) ?? request.horizon;
    const strike = firstDefined((observation) => observation.strike) ?? request.strike;
    const instrument = firstDefined((observation) => observation.instrument) ?? request.instrument;
    const period = request.period;

    return createInstitutionalAnalysisContract({
      ...request,
      instrument,
      strike,
      period,
      volume,
      liquidity,
      horizon,
      fundsOwnershipPct,
      flows: {
        inflows: Number((flowInflows > 0 ? flowInflows : request.flows.inflows).toFixed(2)),
        outflows: Number((flowOutflows > 0 ? flowOutflows : request.flows.outflows).toFixed(2)),
        asOf: firstDefined((observation) => observation.flows?.asOf) ?? request.flows.asOf
      },
      openPositions: {
        count: openPositionsCounts.length > 0 ? Math.max(...openPositionsCounts.map((value) => Math.round(value)), request.openPositions.count) : request.openPositions.count,
        notional: openPositionsNotional > 0 ? Number(openPositionsNotional.toFixed(2)) : request.openPositions.notional
      },
      sourceIds: observations.map((observation) => observation.sourceId)
    });
  }

  private pickHighestLiquidity(
    preferred: InstitutionalLiquidity,
    observed: InstitutionalLiquidity[]
  ): InstitutionalLiquidity {
    const rank: Record<InstitutionalLiquidity, number> = {
      low: 1,
      medium: 2,
      high: 3
    };

    return [preferred, ...observed].sort((left, right) => rank[right] - rank[left])[0] ?? preferred;
  }

  private getCacheKey(source: InstitutionalSourceConfig, request: InstitutionalAnalysisContract): string {
    return JSON.stringify({
      sourceId: source.sourceId,
      ticker: request.ticker,
      instrument: request.instrument,
      strike: request.strike,
      period: request.period,
      volume: request.volume,
      liquidity: request.liquidity,
      horizon: request.horizon,
      fundsOwnershipPct: request.fundsOwnershipPct,
      flows: request.flows,
      openPositions: request.openPositions,
      sourceIds: request.sourceIds ?? []
    });
  }

  private getCachedObservation(
    source: InstitutionalSourceConfig,
    request: InstitutionalAnalysisContract
  ): InstitutionalSourceObservation | null {
    const entry = this.cache.get(this.getCacheKey(source, request));
    if (!entry) {
      return null;
    }

    if (entry.expiresAt <= this.now()) {
      this.cache.delete(this.getCacheKey(source, request));
      return null;
    }

    return entry.value;
  }

  private setCache(
    source: InstitutionalSourceConfig,
    request: InstitutionalAnalysisContract,
    observation: InstitutionalSourceObservation
  ): void {
    const key = this.getCacheKey(source, request);

    this.cache.set(key, {
      value: observation,
      expiresAt: this.now() + (source.cacheTtlMs ?? this.cacheTtlMs)
    });

    while (this.cache.size > this.cacheMaxEntries) {
      const oldestKey = this.cache.keys().next().value as string | undefined;
      if (!oldestKey) {
        break;
      }

      this.cache.delete(oldestKey);
    }
  }

  private isRateLimited(source: InstitutionalSourceConfig): boolean {
    const limit = source.rateLimitPerMinute;
    if (!limit || limit <= 0) {
      return false;
    }

    const state = this.rateState.get(source.sourceId);
    if (!state) {
      return false;
    }

    const windowStart = this.now() - 60_000;
    state.timestamps = state.timestamps.filter((timestamp) => timestamp >= windowStart);
    return state.timestamps.length >= limit;
  }

  private registerRateAttempt(source: InstitutionalSourceConfig): void {
    const state = this.rateState.get(source.sourceId) ?? { timestamps: [] };
    state.timestamps.push(this.now());
    this.rateState.set(source.sourceId, state);
  }

  private buildHttpError(
    source: InstitutionalSourceConfig,
    status: number,
    statusText: string
  ): InstitutionalSourceError {
    return {
      sourceId: source.sourceId,
      kind: source.kind,
      code: `HTTP_${status}`,
      message: `${source.label} responded with ${status} ${statusText}`,
      retryable: status >= 500 || status === 429,
      status
    };
  }

  private buildTimeoutError(source: InstitutionalSourceConfig, timeoutMs: number): InstitutionalSourceError {
    return {
      sourceId: source.sourceId,
      kind: source.kind,
      code: "TIMEOUT",
      message: `${source.label} timed out after ${timeoutMs}ms`,
      retryable: true
    };
  }

  private normalizeSourceError(source: InstitutionalSourceConfig, error: unknown): InstitutionalSourceError {
    if (isInstitutionalSourceError(error)) {
      return error;
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes("timeout") || message.includes("abort")) {
        return {
          sourceId: source.sourceId,
          kind: source.kind,
          code: "TIMEOUT",
          message: error.message,
          retryable: true
        };
      }

      if (message.includes("rate limit") || message.includes("429")) {
        return {
          sourceId: source.sourceId,
          kind: source.kind,
          code: "RATE_LIMITED",
          message: error.message,
          retryable: true
        };
      }

      return {
        sourceId: source.sourceId,
        kind: source.kind,
        code: "FETCH_ERROR",
        message: error.message,
        retryable: true
      };
    }

    return {
      sourceId: source.sourceId,
      kind: source.kind,
      code: "UNKNOWN_ERROR",
      message: String(error),
      retryable: true
    };
  }

  private buildSkippedReport(
    source: InstitutionalSourceConfig,
    status: InstitutionalSourceStatus,
    code: string,
    message: string,
    retryable: boolean,
    latencyMs: number
  ): InstitutionalSourceReport {
    return {
      sourceId: source.sourceId,
      kind: source.kind,
      tier: source.tier,
      enabled: source.enabled,
      status,
      cacheHit: false,
      latencyMs,
      fetchedAt: new Date(this.now()).toISOString(),
      error: {
        sourceId: source.sourceId,
        kind: source.kind,
        code,
        message,
        retryable
      }
    };
  }

  private buildAggregateFailureMessage(sourceReports: InstitutionalSourceReport[]): string {
    const errors = sourceReports
      .map((report) => report.error)
      .filter((error): error is InstitutionalSourceError => error !== undefined)
      .map((error) => `${error.sourceId}:${error.code}`)
      .join(", ");

    return `No institutional source returned a usable response. Source errors: ${errors || "none"}`;
  }
}
