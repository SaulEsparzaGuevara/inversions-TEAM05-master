import {
  createInstitutionalAnalysisContract,
  isFiniteNumber,
  isInstitutionalAnalysisContract,
  isNonEmptyString,
  type InstitutionalAnalysisContract,
  type InstitutionalLiquidity,
  type InstitutionalOpenPositionsSnapshot
} from "./institutionalContract.js";
import {
  InstitutionalDataService,
  isInstitutionalDataServiceResult,
  isInstitutionalSourceReport,
  type InstitutionalDataServiceResult,
  type InstitutionalSourceObservation,
  type InstitutionalSourceReport
} from "./institutionalDataService.js";

/**
 * Supported institutional zone types.
 */
export type InstitutionalZoneType = "support" | "resistance";

/**
 * OHLC candle used by the zone engine.
 */
export interface InstitutionalOhlcCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Canonical support/resistance zone identified by the engine.
 */
export interface InstitutionalZone {
  type: InstitutionalZoneType;
  price: number;
  strength: number;
  accumulatedVolume: number;
  confidence: number;
  confirmingSources: number;
  touches: number;
  liquidity: InstitutionalLiquidity;
  asOf: string;
  notes: string[];
}

/**
 * Result payload emitted by the institutional zones engine.
 */
export interface InstitutionalZonesResult {
  analysis: InstitutionalAnalysisContract;
  zones: InstitutionalZone[];
  candlesAnalyzed: number;
  sourceReports: InstitutionalSourceReport[];
  generatedAt: string;
  overallStatus: "ok" | "partial" | "all_failed";
}

/**
 * Request accepted by the zone engine.
 *
 * The main input is the canonical T106 contract; candle data is optional and
 * can be supplied by callers that already have OHLC snapshots.
 */
export interface InstitutionalZonesRequest {
  analysis: InstitutionalAnalysisContract;
  candles?: InstitutionalOhlcCandle[];
}

/**
 * Zone engine configuration.
 */
export interface InstitutionalZonesEngineOptions {
  institutionalDataService: InstitutionalDataService;
  maxZones?: number;
  pivotWindow?: number;
  clusterTolerancePct?: number;
  liquidityVolumeMultiplier?: number;
}

interface ZoneCandidate {
  type: InstitutionalZoneType;
  price: number;
  accumulatedVolume: number;
  touches: number;
  confirmingSources: number;
  confidence: number;
  liquidity: InstitutionalLiquidity;
  notes: string[];
}

/**
 * Type guard for OHLC candles.
 */
export function isInstitutionalOhlcCandle(value: unknown): value is InstitutionalOhlcCandle {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candle = value as InstitutionalOhlcCandle;
  return (
    isFiniteNumber(candle.time) &&
    isFiniteNumber(candle.open) &&
    isFiniteNumber(candle.high) &&
    isFiniteNumber(candle.low) &&
    isFiniteNumber(candle.close) &&
    isFiniteNumber(candle.volume) &&
    candle.high >= Math.max(candle.open, candle.close, candle.low) &&
    candle.low <= Math.min(candle.open, candle.close, candle.high)
  );
}

/**
 * Type guard for institutional zones.
 */
export function isInstitutionalZone(value: unknown): value is InstitutionalZone {
  if (!value || typeof value !== "object") {
    return false;
  }

  const zone = value as InstitutionalZone;
  return (
    (zone.type === "support" || zone.type === "resistance") &&
    isFiniteNumber(zone.price) &&
    isFiniteNumber(zone.strength) &&
    zone.strength >= 0 &&
    zone.strength <= 1 &&
    isFiniteNumber(zone.accumulatedVolume) &&
    zone.accumulatedVolume >= 0 &&
    isFiniteNumber(zone.confidence) &&
    zone.confidence >= 0 &&
    zone.confidence <= 1 &&
    isFiniteNumber(zone.confirmingSources) &&
    Number.isInteger(zone.confirmingSources) &&
    zone.confirmingSources >= 0 &&
    isFiniteNumber(zone.touches) &&
    Number.isInteger(zone.touches) &&
    zone.touches >= 0 &&
    (zone.liquidity === "low" || zone.liquidity === "medium" || zone.liquidity === "high") &&
    isNonEmptyString(zone.asOf) &&
    Array.isArray(zone.notes) &&
    zone.notes.every(isNonEmptyString)
  );
}

/**
 * Type guard for the engine result.
 */
export function isInstitutionalZonesResult(value: unknown): value is InstitutionalZonesResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as InstitutionalZonesResult;
  return (
    isInstitutionalAnalysisContract(result.analysis) &&
    Array.isArray(result.zones) &&
    result.zones.every(isInstitutionalZone) &&
    isFiniteNumber(result.candlesAnalyzed) &&
    Number.isInteger(result.candlesAnalyzed) &&
    result.candlesAnalyzed >= 0 &&
    Array.isArray(result.sourceReports) &&
    result.sourceReports.every(isInstitutionalSourceReport) &&
    isNonEmptyString(result.generatedAt) &&
    (result.overallStatus === "ok" || result.overallStatus === "partial" || result.overallStatus === "all_failed")
  );
}

/**
 * Factory for a validated institutional zone.
 */
export function createInstitutionalZone(zone: InstitutionalZone): InstitutionalZone {
  if (!isInstitutionalZone(zone)) {
    throw new Error("Invalid institutional zone payload.");
  }

  return zone;
}

/**
 * Factory for a validated engine result.
 */
export function createInstitutionalZonesResult(result: InstitutionalZonesResult): InstitutionalZonesResult {
  if (!isInstitutionalZonesResult(result)) {
    throw new Error("Invalid institutional zones result payload.");
  }

  return result;
}

/**
 * Engine that extracts institutional support/resistance zones.
 */
export class InstitutionalZonesEngine {
  private readonly institutionalDataService: InstitutionalDataService;
  private readonly maxZones: number;
  private readonly pivotWindow: number;
  private readonly clusterTolerancePct: number;
  private readonly liquidityVolumeMultiplier: number;

  constructor(options: InstitutionalZonesEngineOptions) {
    if (!options.institutionalDataService) {
      throw new Error("InstitutionalZonesEngine requires an institutional data service.");
    }

    this.institutionalDataService = options.institutionalDataService;
    this.maxZones = options.maxZones ?? 8;
    this.pivotWindow = Math.max(1, options.pivotWindow ?? 2);
    this.clusterTolerancePct = options.clusterTolerancePct ?? 0.0125;
    this.liquidityVolumeMultiplier = options.liquidityVolumeMultiplier ?? 1.15;
  }

  /**
   * Analyze an institutional request and return support/resistance zones.
   */
  async analyze(request: InstitutionalZonesRequest): Promise<InstitutionalZonesResult> {
    const analysis = createInstitutionalAnalysisContract(request.analysis);
    const institutionalResult = await this.institutionalDataService.resolve(analysis);
    const candles = this.normalizeCandles(request.candles ?? this.buildFallbackCandles(analysis, institutionalResult));

    if (candles.length < this.pivotWindow * 2 + 1) {
      throw new Error("Insufficient OHLC data to identify institutional zones.");
    }

    const averageVolume = this.calculateAverageVolume(candles);
    const liquidityThreshold = averageVolume * this.liquidityVolumeMultiplier;
    const candidates = this.buildCandidates(candles, institutionalResult, liquidityThreshold);
    const clusteredZones = this.clusterCandidates(candidates, candles);
    const rankedZones = clusteredZones
      .map((candidate) => this.toInstitutionalZone(candidate, institutionalResult, candles))
      .sort((left, right) => right.strength - left.strength)
      .slice(0, this.maxZones);

    return createInstitutionalZonesResult({
      analysis,
      zones: rankedZones,
      candlesAnalyzed: candles.length,
      sourceReports: institutionalResult.sourceReports,
      generatedAt: new Date().toISOString(),
      overallStatus: institutionalResult.overallStatus
    });
  }

  /**
   * Convenience method that only returns the zones array.
   */
  async identifyZones(request: InstitutionalZonesRequest): Promise<InstitutionalZone[]> {
    const result = await this.analyze(request);
    return result.zones;
  }

  private normalizeCandles(candles: InstitutionalOhlcCandle[]): InstitutionalOhlcCandle[] {
    return candles
      .filter(isInstitutionalOhlcCandle)
      .map((candle) => ({
        time: Math.floor(candle.time),
        open: Number(candle.open.toFixed(4)),
        high: Number(candle.high.toFixed(4)),
        low: Number(candle.low.toFixed(4)),
        close: Number(candle.close.toFixed(4)),
        volume: Number(candle.volume.toFixed(2))
      }))
      .sort((left, right) => left.time - right.time);
  }

  private buildFallbackCandles(
    analysis: InstitutionalAnalysisContract,
    result: InstitutionalDataServiceResult
  ): InstitutionalOhlcCandle[] {
    const basePrice = this.estimateBasePrice(analysis, result);
    const candles: InstitutionalOhlcCandle[] = [];

    for (let index = 0; index < 60; index += 1) {
      const drift = Math.sin(index / 5) * (basePrice * 0.012);
      const institutionalBias = this.deriveInstitutionalBias(result, index);
      const open = basePrice + drift + institutionalBias;
      const close = open + Math.cos(index / 4) * (basePrice * 0.007);
      const high = Math.max(open, close) + basePrice * 0.004;
      const low = Math.min(open, close) - basePrice * 0.004;

      candles.push({
        time: Date.now() - (60 - index) * 86_400_000,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Math.round(100000 + Math.abs(Math.sin(index / 3)) * 75000)
      });
    }

    return candles;
  }

  private estimateBasePrice(
    analysis: InstitutionalAnalysisContract,
    result: InstitutionalDataServiceResult
  ): number {
    const strike = analysis.strike;
    const sourcePrice = result.analysis.strike;
    const inferred = strike ?? sourcePrice ?? Math.max(analysis.volume / 100000, 25);
    return Math.max(1, inferred);
  }

  private deriveInstitutionalBias(result: InstitutionalDataServiceResult, index: number): number {
    const institutionalScore = this.calculateInstitutionalScore(result);
    const alternating = index % 2 === 0 ? 1 : -1;
    return alternating * institutionalScore * 0.45;
  }

  private calculateInstitutionalScore(result: InstitutionalDataServiceResult): number {
    const sourceConfidence = this.average(
      result.sourceReports
        .map((report) => report.observation?.confidence)
        .filter(isFiniteNumber)
    );
    const ownership = result.analysis.fundsOwnershipPct / 100;
    const positionFactor = Math.min(1, result.analysis.openPositions.count / 50);
    const flowFactor = Math.min(
      1,
      Math.abs(result.analysis.flows.inflows - result.analysis.flows.outflows) /
        Math.max(1, result.analysis.volume)
    );

    return this.clamp01(
      0.2 +
        sourceConfidence * 0.35 +
        ownership * 0.2 +
        positionFactor * 0.15 +
        flowFactor * 0.1
    );
  }

  private buildCandidates(
    candles: InstitutionalOhlcCandle[],
    result: InstitutionalDataServiceResult,
    liquidityThreshold: number
  ): ZoneCandidate[] {
    const candidates: ZoneCandidate[] = [];
    const institutionalScore = this.calculateInstitutionalScore(result);

    for (let index = this.pivotWindow; index < candles.length - this.pivotWindow; index += 1) {
      const candle = candles[index];
      const prior = candles.slice(index - this.pivotWindow, index);
      const next = candles.slice(index + 1, index + 1 + this.pivotWindow);
      const isPivotLow = candle.low <= Math.min(...prior.map((item) => item.low), ...next.map((item) => item.low));
      const isPivotHigh = candle.high >= Math.max(...prior.map((item) => item.high), ...next.map((item) => item.high));
      const highLiquidity = candle.volume >= liquidityThreshold;
      const institutionalVolume = candle.volume * (1 + institutionalScore * 0.35);

      if (isPivotLow && (candle.close >= candle.open || highLiquidity)) {
        candidates.push({
          type: "support",
          price: candle.low,
          accumulatedVolume: institutionalVolume,
          touches: 1,
          confirmingSources: this.countConfirmingSources(result),
          confidence: this.zoneConfidence("support", candle, institutionalScore, highLiquidity),
          liquidity: result.analysis.liquidity,
          notes: ["pivot_low", highLiquidity ? "high_liquidity" : "liquidity_ok"]
        });
      }

      if (isPivotHigh && (candle.close <= candle.open || highLiquidity)) {
        candidates.push({
          type: "resistance",
          price: candle.high,
          accumulatedVolume: institutionalVolume,
          touches: 1,
          confirmingSources: this.countConfirmingSources(result),
          confidence: this.zoneConfidence("resistance", candle, institutionalScore, highLiquidity),
          liquidity: result.analysis.liquidity,
          notes: ["pivot_high", highLiquidity ? "high_liquidity" : "liquidity_ok"]
        });
      }
    }

    return candidates;
  }

  private zoneConfidence(
    type: InstitutionalZoneType,
    candle: InstitutionalOhlcCandle,
    institutionalScore: number,
    highLiquidity: boolean
  ): number {
    const candleBody = Math.abs(candle.close - candle.open) / Math.max(candle.high - candle.low, 0.0001);
    const directionalBias = type === "support" ? candle.close >= candle.open : candle.close <= candle.open;
    return this.clamp01(
      0.35 +
        institutionalScore * 0.35 +
        (highLiquidity ? 0.15 : 0.05) +
        (directionalBias ? 0.1 : 0) +
        Math.min(0.05, candleBody * 0.05)
    );
  }

  private countConfirmingSources(result: InstitutionalDataServiceResult): number {
    return result.sourceReports.filter((report) => report.observation && report.status !== "failed").length;
  }

  private clusterCandidates(
    candidates: ZoneCandidate[],
    candles: InstitutionalOhlcCandle[]
  ): ZoneCandidate[] {
    if (candidates.length === 0) {
      return [];
    }

    const atr = this.calculateAtr(candles);
    const tolerance = Math.max(atr * this.clusterTolerancePct, this.estimateAverageClose(candles) * this.clusterTolerancePct);
    const clusters: ZoneCandidate[] = [];

    for (const candidate of candidates) {
      const matching = clusters.find(
        (cluster) => cluster.type === candidate.type && Math.abs(cluster.price - candidate.price) <= tolerance
      );

      if (matching) {
        const totalTouches = matching.touches + candidate.touches;
        matching.price = Number(((matching.price * matching.touches + candidate.price * candidate.touches) / totalTouches).toFixed(4));
        matching.accumulatedVolume += candidate.accumulatedVolume;
        matching.touches = totalTouches;
        matching.confirmingSources = Math.max(matching.confirmingSources, candidate.confirmingSources);
        matching.confidence = this.clamp01((matching.confidence + candidate.confidence) / 2 + 0.05);
        matching.notes = Array.from(new Set([...matching.notes, ...candidate.notes]));
      } else {
        clusters.push({ ...candidate });
      }
    }

    return clusters;
  }

  private toInstitutionalZone(
    candidate: ZoneCandidate,
    result: InstitutionalDataServiceResult,
    candles: InstitutionalOhlcCandle[]
  ): InstitutionalZone {
    const averageVolume = this.calculateAverageVolume(candles);
    const volumeScore = candidate.accumulatedVolume / Math.max(1, averageVolume * candles.length);
    const sourceScore = candidate.confirmingSources / Math.max(1, result.sourceReports.length);
    const touchesScore = Math.min(1, candidate.touches / 6);
    const liquidityScore = this.liquidityWeight(candidate.liquidity);

    const strength = this.clamp01(
      0.25 +
        volumeScore * 0.35 +
        sourceScore * 0.2 +
        touchesScore * 0.15 +
        liquidityScore * 0.05 +
        candidate.confidence * 0.15
    );

    const confidence = this.clamp01((candidate.confidence * 0.7) + (sourceScore * 0.3));

    return createInstitutionalZone({
      type: candidate.type,
      price: Number(candidate.price.toFixed(4)),
      strength: Number(strength.toFixed(4)),
      accumulatedVolume: Number(candidate.accumulatedVolume.toFixed(2)),
      confidence: Number(confidence.toFixed(4)),
      confirmingSources: candidate.confirmingSources,
      touches: candidate.touches,
      liquidity: candidate.liquidity,
      asOf: new Date().toISOString(),
      notes: candidate.notes
    });
  }

  private liquidityWeight(liquidity: InstitutionalLiquidity): number {
    switch (liquidity) {
      case "high":
        return 1;
      case "medium":
        return 0.7;
      case "low":
        return 0.4;
    }
  }

  private calculateAverageVolume(candles: InstitutionalOhlcCandle[]): number {
    return this.average(candles.map((candle) => candle.volume));
  }

  private estimateAverageClose(candles: InstitutionalOhlcCandle[]): number {
    return this.average(candles.map((candle) => candle.close));
  }

  private calculateAtr(candles: InstitutionalOhlcCandle[]): number {
    const ranges = candles.map((candle) => candle.high - candle.low);
    return this.average(ranges);
  }

  private average(values: number[]): number {
    if (values.length === 0) {
      return 0;
    }

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
  }
}
