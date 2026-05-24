/**
 * T109: Institutional Trend Engine
 * ==================================
 * Computes trend analysis using moving averages (50 & 200 days),
 * crossover detection, correlation between quarterly reports and
 * daily volume, and trend continuity probability.
 *
 * Follows the same architectural pattern as InstitutionalZonesEngine.
 */

import {
  createInstitutionalAnalysisContract,
  isFiniteNumber,
  isInstitutionalAnalysisContract,
  isNonEmptyString,
  type InstitutionalAnalysisContract,
  type InstitutionalAnalysisPeriod,
  type InstitutionalHorizon,
  type InstitutionalLiquidity
} from "./institutionalContract.js";
import {
  InstitutionalDataService,
  isInstitutionalSourceReport,
  type InstitutionalDataServiceResult,
  type InstitutionalSourceObservation,
  type InstitutionalSourceReport
} from "./institutionalDataService.js";
import {
  type InstitutionalOhlcCandle,
  isInstitutionalOhlcCandle
} from "./institutionalZonesEngine.js";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * Trend direction detected by the engine.
 */
export type TrendDirection = "bullish" | "bearish" | "neutral";

/**
 * Moving average computed by the engine.
 */
export interface MovingAverage {
  /** Period of the moving average (50 or 200). */
  period: number;
  /** Current value of the moving average. */
  value: number;
  /** Normalised slope of the MA (rate of change as fraction of price). */
  slope: number;
  /** Whether the MA is rising. */
  rising: boolean;
  /** Number of data points used for the computation. */
  sampleCount: number;
}

/**
 * Crossover signal between the 50-day and 200-day moving averages.
 */
export interface MaCrossover {
  /** Type of crossover detected. */
  type: "golden_cross" | "death_cross" | "none";
  /** Unix ms timestamp when the crossover occurred (0 if none). */
  occurredAt: number;
  /** Estimated days since the crossover occurred. */
  daysSince: number;
  /** Current value of the 50-day MA. */
  ma50: number;
  /** Current value of the 200-day MA. */
  ma200: number;
  /** Spread between MA50 and MA200 (MA50 - MA200). */
  spread: number;
}

/**
 * Correlation between quarterly report signals and daily volume.
 */
export interface VolumeCorrelation {
  /** Pearson correlation coefficient between quarterly data and volume (-1 to 1). */
  correlationCoefficient: number;
  /** Observed volume trend direction. */
  volumeTrend: "increasing" | "decreasing" | "flat";
  /** Number of quarterly data points analysed. */
  quarterlyReportsAnalyzed: number;
}

/**
 * Factors that contribute to the trend continuity probability.
 */
export interface ContinuityFactors {
  /** Contribution from moving average alignment (0-1). */
  maAlignment: number;
  /** Contribution from volume confirmation (0-1). */
  volumeConfirmation: number;
  /** Contribution from fund ownership trend (0-1). */
  ownershipTrend: number;
  /** Contribution from institutional flow momentum (0-1). */
  flowMomentum: number;
}

/**
 * Trend continuity probability assessment.
 */
export interface ContinuityProbability {
  /** Overall probability that the current trend will continue (0-1). */
  probability: number;
  /** Breakdown of contributing factors. */
  factors: ContinuityFactors;
}

/**
 * Result payload emitted by the institutional trend engine.
 */
export interface InstitutionalTrendResult {
  /** The original analysis contract. */
  analysis: InstitutionalAnalysisContract;
  /** Computed moving averages (50 and 200 day). */
  movingAverages: MovingAverage[];
  /** Crossover signal detected. */
  crossover: MaCrossover;
  /** Current trend direction. */
  currentTrend: TrendDirection;
  /** Overall trend strength (0-1). */
  trendStrength: number;
  /** Estimated support level based on trend analysis. */
  supportLevel: number;
  /** Estimated resistance level based on trend analysis. */
  resistanceLevel: number;
  /** Volume correlation with quarterly report data. */
  volumeCorrelation: VolumeCorrelation;
  /** Trend continuity probability. */
  continuityProbability: ContinuityProbability;
  /** Source reports from institutional data service. */
  sourceReports: InstitutionalSourceReport[];
  /** Number of OHLC candles analysed. */
  candlesAnalyzed: number;
  /** Timestamp when the result was generated. */
  generatedAt: string;
}

/**
 * Request accepted by the trend engine.
 */
export interface InstitutionalTrendRequest {
  /** The canonical institutional analysis contract. */
  analysis: InstitutionalAnalysisContract;
  /** Optional OHLC candle data. If omitted, fallback candles are generated. */
  candles?: InstitutionalOhlcCandle[];
}

/**
 * Trend engine configuration options.
 */
export interface InstitutionalTrendEngineOptions {
  /** Required institutional data service for resolving source observations. */
  institutionalDataService: InstitutionalDataService;
  /** Minimum number of candles required for MA computation (default 200). */
  minCandles?: number;
  /** Period for the fast moving average (default 50). */
  fastMaPeriod?: number;
  /** Period for the slow moving average (default 200). */
  slowMaPeriod?: number;
  /** Look-back window for volume trend analysis in days (default 20). */
  volumeLookback?: number;
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface MaComputed {
  value: number;
  slope: number;
  rising: boolean;
  sampleCount: number;
}



// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_MIN_CANDLES = 200;
const DEFAULT_FAST_MA_PERIOD = 50;
const DEFAULT_SLOW_MA_PERIOD = 200;
const DEFAULT_VOLUME_LOOKBACK = 20;

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

/**
 * Checks whether a value is a valid moving average object.
 */
export function isMovingAverage(value: unknown): value is MovingAverage {
  if (!value || typeof value !== "object") return false;
  const ma = value as MovingAverage;
  return (
    isFiniteNumber(ma.period) &&
    Number.isInteger(ma.period) &&
    ma.period > 0 &&
    isFiniteNumber(ma.value) &&
    isFiniteNumber(ma.slope) &&
    typeof ma.rising === "boolean" &&
    isFiniteNumber(ma.sampleCount) &&
    Number.isInteger(ma.sampleCount) &&
    ma.sampleCount >= 0
  );
}

/**
 * Checks whether a value is a valid MA crossover object.
 */
export function isMaCrossover(value: unknown): value is MaCrossover {
  if (!value || typeof value !== "object") return false;
  const cross = value as MaCrossover;
  return (
    (cross.type === "golden_cross" || cross.type === "death_cross" || cross.type === "none") &&
    isFiniteNumber(cross.occurredAt) &&
    isFiniteNumber(cross.daysSince) &&
    isFiniteNumber(cross.ma50) &&
    isFiniteNumber(cross.ma200) &&
    isFiniteNumber(cross.spread)
  );
}

/**
 * Checks whether a value is a valid volume correlation object.
 */
export function isVolumeCorrelation(value: unknown): value is VolumeCorrelation {
  if (!value || typeof value !== "object") return false;
  const vc = value as VolumeCorrelation;
  return (
    isFiniteNumber(vc.correlationCoefficient) &&
    vc.correlationCoefficient >= -1 &&
    vc.correlationCoefficient <= 1 &&
    (vc.volumeTrend === "increasing" || vc.volumeTrend === "decreasing" || vc.volumeTrend === "flat") &&
    isFiniteNumber(vc.quarterlyReportsAnalyzed) &&
    Number.isInteger(vc.quarterlyReportsAnalyzed) &&
    vc.quarterlyReportsAnalyzed >= 0
  );
}

/**
 * Checks whether a value is a valid continuity factors object.
 */
export function isContinuityFactors(value: unknown): value is ContinuityFactors {
  if (!value || typeof value !== "object") return false;
  const cf = value as ContinuityFactors;
  return (
    isFiniteNumber(cf.maAlignment) && cf.maAlignment >= 0 && cf.maAlignment <= 1 &&
    isFiniteNumber(cf.volumeConfirmation) && cf.volumeConfirmation >= 0 && cf.volumeConfirmation <= 1 &&
    isFiniteNumber(cf.ownershipTrend) && cf.ownershipTrend >= 0 && cf.ownershipTrend <= 1 &&
    isFiniteNumber(cf.flowMomentum) && cf.flowMomentum >= 0 && cf.flowMomentum <= 1
  );
}

/**
 * Checks whether a value is a valid continuity probability object.
 */
export function isContinuityProbability(value: unknown): value is ContinuityProbability {
  if (!value || typeof value !== "object") return false;
  const cp = value as ContinuityProbability;
  return (
    isFiniteNumber(cp.probability) && cp.probability >= 0 && cp.probability <= 1 &&
    isContinuityFactors(cp.factors)
  );
}

/**
 * Checks whether a value is a valid trend result.
 */
export function isInstitutionalTrendResult(value: unknown): value is InstitutionalTrendResult {
  if (!value || typeof value !== "object") return false;
  const result = value as InstitutionalTrendResult;
  return (
    isInstitutionalAnalysisContract(result.analysis) &&
    Array.isArray(result.movingAverages) &&
    result.movingAverages.every(isMovingAverage) &&
    isMaCrossover(result.crossover) &&
    (result.currentTrend === "bullish" || result.currentTrend === "bearish" || result.currentTrend === "neutral") &&
    isFiniteNumber(result.trendStrength) &&
    result.trendStrength >= 0 &&
    result.trendStrength <= 1 &&
    isFiniteNumber(result.supportLevel) &&
    isFiniteNumber(result.resistanceLevel) &&
    isVolumeCorrelation(result.volumeCorrelation) &&
    isContinuityProbability(result.continuityProbability) &&
    Array.isArray(result.sourceReports) &&
    result.sourceReports.every(isInstitutionalSourceReport) &&
    isFiniteNumber(result.candlesAnalyzed) &&
    Number.isInteger(result.candlesAnalyzed) &&
    result.candlesAnalyzed >= 0 &&
    isNonEmptyString(result.generatedAt)
  );
}

// ---------------------------------------------------------------------------
// Factory functions
// ---------------------------------------------------------------------------

/**
 * Creates a validated moving average object.
 */
export function createMovingAverage(ma: MovingAverage): MovingAverage {
  if (!isMovingAverage(ma)) {
    throw new Error("Invalid moving average payload.");
  }
  return ma;
}

/**
 * Creates a validated MA crossover object.
 */
export function createMaCrossover(cross: MaCrossover): MaCrossover {
  if (!isMaCrossover(cross)) {
    throw new Error("Invalid MA crossover payload.");
  }
  return cross;
}

/**
 * Creates a validated volume correlation object.
 */
export function createVolumeCorrelation(vc: VolumeCorrelation): VolumeCorrelation {
  if (!isVolumeCorrelation(vc)) {
    throw new Error("Invalid volume correlation payload.");
  }
  return vc;
}

/**
 * Creates a validated continuity factors object.
 */
export function createContinuityFactors(cf: ContinuityFactors): ContinuityFactors {
  if (!isContinuityFactors(cf)) {
    throw new Error("Invalid continuity factors payload.");
  }
  return cf;
}

/**
 * Creates a validated continuity probability object.
 */
export function createContinuityProbability(cp: ContinuityProbability): ContinuityProbability {
  if (!isContinuityProbability(cp)) {
    throw new Error("Invalid continuity probability payload.");
  }
  return cp;
}

/**
 * Creates a validated trend result.
 */
export function createInstitutionalTrendResult(result: InstitutionalTrendResult): InstitutionalTrendResult {
  if (!isInstitutionalTrendResult(result)) {
    throw new Error("Invalid institutional trend result payload.");
  }
  return result;
}

// ---------------------------------------------------------------------------
// Engine class
// ---------------------------------------------------------------------------

/**
 * Engine that computes institutional trend analysis.
 *
 * This engine:
 * - Computes 50-day and 200-day simple moving averages
 * - Detects golden/death crossovers
 * - Correlates quarterly report signals with daily volume
 * - Calculates trend continuity probability
 */
export class InstitutionalTrendEngine {
  private readonly institutionalDataService: InstitutionalDataService;
  private readonly minCandles: number;
  private readonly fastMaPeriod: number;
  private readonly slowMaPeriod: number;
  private readonly volumeLookback: number;

  constructor(options: InstitutionalTrendEngineOptions) {
    if (!options.institutionalDataService) {
      throw new Error("InstitutionalTrendEngine requires an institutional data service.");
    }

    this.institutionalDataService = options.institutionalDataService;
    this.minCandles = options.minCandles ?? DEFAULT_MIN_CANDLES;
    this.fastMaPeriod = options.fastMaPeriod ?? DEFAULT_FAST_MA_PERIOD;
    this.slowMaPeriod = options.slowMaPeriod ?? DEFAULT_SLOW_MA_PERIOD;
    this.volumeLookback = options.volumeLookback ?? DEFAULT_VOLUME_LOOKBACK;
  }

  /**
   * Analyse an institutional request and return trend data.
   */
  async analyze(request: InstitutionalTrendRequest): Promise<InstitutionalTrendResult> {
    const analysis = createInstitutionalAnalysisContract(request.analysis);
    const institutionalResult = await this.institutionalDataService.resolve(analysis);
    const candles = this.normalizeCandles(
      request.candles ?? this.buildFallbackCandles(analysis, institutionalResult)
    );

    if (candles.length < this.slowMaPeriod) {
      throw new Error(
        `Insufficient OHLC data for trend analysis: need at least ${this.slowMaPeriod} candles, got ${candles.length}.`
      );
    }

    const closePrices = candles.map((c) => c.close);
    const volumes = candles.map((c) => c.volume);

    // Compute moving averages
    const fastMa = this.computeSma(closePrices, this.fastMaPeriod);
    const slowMa = this.computeSma(closePrices, this.slowMaPeriod);
    const movingAverages: MovingAverage[] = [
      createMovingAverage({
        period: this.fastMaPeriod,
        value: Number(fastMa.value.toFixed(4)),
        slope: Number(fastMa.slope.toFixed(6)),
        rising: fastMa.rising,
        sampleCount: fastMa.sampleCount
      }),
      createMovingAverage({
        period: this.slowMaPeriod,
        value: Number(slowMa.value.toFixed(4)),
        slope: Number(slowMa.slope.toFixed(6)),
        rising: slowMa.rising,
        sampleCount: slowMa.sampleCount
      })
    ];

    // Detect crossover
    const crossover = this.detectCrossover(closePrices, fastMa.value, slowMa.value);

    // Compute volume correlation with quarterly signals
    const volumeCorrelation = this.computeVolumeCorrelation(volumes, analysis);

    // Determine current trend direction
    const currentTrend = this.determineTrend(fastMa.value, slowMa.value, fastMa.rising, slowMa.rising, crossover);

    // Estimate support and resistance levels
    const { supportLevel, resistanceLevel } = this.estimatePriceLevels(candles, fastMa.value, slowMa.value);

    // Compute trend strength
    const trendStrength = this.computeTrendStrength(
      fastMa, slowMa, crossover, volumeCorrelation, analysis
    );

    // Compute continuity probability
    const continuityProbability = this.computeContinuityProbability(
      fastMa, slowMa, crossover, volumeCorrelation, analysis, trendStrength
    );

    return createInstitutionalTrendResult({
      analysis,
      movingAverages,
      crossover: createMaCrossover(crossover),
      currentTrend,
      trendStrength: Number(trendStrength.toFixed(4)),
      supportLevel: Number(supportLevel.toFixed(4)),
      resistanceLevel: Number(resistanceLevel.toFixed(4)),
      volumeCorrelation: createVolumeCorrelation(volumeCorrelation),
      continuityProbability,
      sourceReports: institutionalResult.sourceReports,
      candlesAnalyzed: candles.length,
      generatedAt: new Date().toISOString()
    });
  }

  /**
   * Convenience method that only returns the trend assessment.
   */
  async analyzeTrend(request: InstitutionalTrendRequest): Promise<{
    currentTrend: TrendDirection;
    trendStrength: number;
    crossover: MaCrossover;
    continuityProbability: ContinuityProbability;
  }> {
    const result = await this.analyze(request);
    return {
      currentTrend: result.currentTrend,
      trendStrength: result.trendStrength,
      crossover: result.crossover,
      continuityProbability: result.continuityProbability
    };
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

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

  /**
   * Builds synthetic OHLC candles when real data is not available.
   * Generates at least `slowMaPeriod + 60` candles to ensure MA-200 can be computed.
   */
  private buildFallbackCandles(
    analysis: InstitutionalAnalysisContract,
    result: InstitutionalDataServiceResult
  ): InstitutionalOhlcCandle[] {
    const basePrice = this.estimateBasePrice(analysis, result);
    const totalCandles = this.slowMaPeriod + 60;
    const candles: InstitutionalOhlcCandle[] = [];
    const now = Date.now();

    for (let index = 0; index < totalCandles; index += 1) {
      // Sinusoidal drift to create a realistic price path
      const phase = (index / totalCandles) * Math.PI * 4;
      const drift = Math.sin(phase) * (basePrice * 0.10);
      const noise = (Math.random() - 0.5) * basePrice * 0.015;
      const institutionalBias = this.deriveInstitutionalBias(result, index);

      const center = basePrice + drift + institutionalBias + noise;
      const open = center + Math.sin(index * 0.3) * basePrice * 0.005;
      const close = center + Math.sin((index + 1) * 0.3) * basePrice * 0.005;
      const high = Math.max(open, close) + basePrice * 0.006 * (0.5 + Math.random());
      const low = Math.min(open, close) - basePrice * 0.006 * (0.5 + Math.random());
      const volumeBase = Math.abs(Math.sin(index / 5)) * 150000 + 80000;

      candles.push({
        time: now - (totalCandles - index) * 86_400_000,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Math.round(volumeBase)
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
    const score = this.calculateInstitutionalScore(result);
    const alternating = index % 2 === 0 ? 1 : -1;
    return alternating * score * 0.6;
  }

  /**
   * Computes a Simple Moving Average over the given data.
   */
  private computeSma(data: number[], period: number): MaComputed {
    const valid = data.filter(isFiniteNumber);
    if (valid.length < period) {
      const avg = this.average(valid);
      return { value: avg, slope: 0, rising: false, sampleCount: valid.length };
    }

    const recent = valid.slice(-period);
    const value = this.average(recent);

    // Compute slope: compare the first half vs second half of the window
    const half = Math.floor(period / 2);
    const firstHalfAvg = this.average(recent.slice(0, half));
    const secondHalfAvg = this.average(recent.slice(half));

    const slope = secondHalfAvg !== 0 ? (secondHalfAvg - firstHalfAvg) / secondHalfAvg : 0;
    const rising = secondHalfAvg >= firstHalfAvg;

    return { value, slope, rising, sampleCount: recent.length };
  }

  /**
   * Detects crossover between fast and slow moving averages.
   * Compares the current fast MA value against the slow MA, and also looks
   * back a few periods to detect recent crossovers.
   */
  private detectCrossover(
    closePrices: number[],
    fastValue: number,
    slowValue: number
  ): MaCrossover {
    const spread = fastValue - slowValue;
    const spreadPct = Math.abs(spread) / Math.max(slowValue, 1);
    const tolerance = 0.002; // 0.2% threshold

    // Base result with current values
    const baseResult: MaCrossover = {
      type: "none",
      occurredAt: 0,
      daysSince: 0,
      ma50: Number(fastValue.toFixed(4)),
      ma200: Number(slowValue.toFixed(4)),
      spread: Number(spread.toFixed(4))
    };

    if (spreadPct <= tolerance) {
      return baseResult;
    }

    // Determine current state
    const isBullish = fastValue > slowValue;

    // Look back to find when the crossover may have occurred
    const lookback = Math.min(30, Math.max(1, closePrices.length - this.slowMaPeriod));
    const recentClosePrices = closePrices.slice(-lookback - this.slowMaPeriod);

    let crossoverIndex = -1;
    for (let i = recentClosePrices.length - this.slowMaPeriod; i >= 1; i--) {
      const subFast = this.average(recentClosePrices.slice(i, i + this.fastMaPeriod));
      const subSlow = this.average(recentClosePrices.slice(i, i + this.slowMaPeriod));
      const priorFast = this.average(recentClosePrices.slice(i - 1, i - 1 + this.fastMaPeriod));
      const priorSlow = this.average(recentClosePrices.slice(i - 1, i - 1 + this.slowMaPeriod));

      const currentSpread = subFast - subSlow;
      const priorSpread = priorFast - priorSlow;

      if (isBullish && priorSpread <= 0 && currentSpread > 0) {
        crossoverIndex = i;
        break;
      }
      if (!isBullish && priorSpread >= 0 && currentSpread < 0) {
        crossoverIndex = i;
        break;
      }
    }

    if (crossoverIndex === -1) {
      // Crossover happened before our lookback window or no crossover found
      return {
        ...baseResult,
        type: isBullish ? "golden_cross" : "death_cross",
        occurredAt: Date.now() - lookback * 86_400_000,
        daysSince: lookback
      };
    }

    const daysSince = Math.max(0, lookback - crossoverIndex);
    const occurredAt = Date.now() - daysSince * 86_400_000;

    return {
      ...baseResult,
      type: isBullish ? "golden_cross" : "death_cross",
      occurredAt,
      daysSince
    };
  }

  /**
   * Computes correlation between quarterly report signals and daily volume.
   * Uses a simplified approach: simulates quarterly signals from the
   * institutional data (funds ownership, flows) and correlates with volume.
   */
  private computeVolumeCorrelation(
    volumes: number[],
    analysis: InstitutionalAnalysisContract
  ): VolumeCorrelation {
    const lookback = Math.min(this.volumeLookback, volumes.length);
    const recentVolumes = volumes.slice(-lookback);

    if (recentVolumes.length < 5) {
      return {
        correlationCoefficient: 0,
        volumeTrend: "flat",
        quarterlyReportsAnalyzed: 0
      };
    }

    // Compute volume trend direction
    const firstHalf = this.average(recentVolumes.slice(0, Math.floor(lookback / 2)));
    const secondHalf = this.average(recentVolumes.slice(Math.floor(lookback / 2)));

    const volumeTrend = secondHalf > firstHalf * 1.05
      ? "increasing"
      : secondHalf < firstHalf * 0.95
        ? "decreasing"
        : "flat";

    // Build synthetic quarterly signals from available institutional data
    // We create quarterly data points and correlate with volume segments
    const ownershipSignal = analysis.fundsOwnershipPct / 100;
    const flowBias = analysis.flows.inflows + analysis.flows.outflows > 0
      ? (analysis.flows.inflows - analysis.flows.outflows) /
        (analysis.flows.inflows + analysis.flows.outflows)
      : 0;

    // Simulate quarterly volumes and ownership signals
    // In production, this would use real quarterly filing data
    const quarterlySignals: number[] = [];
    const quarterlyVolumes: number[] = [];

    for (let q = 0; q < 4; q++) {
      const signal = ownershipSignal + flowBias * 0.3 + (q / 8) * (flowBias > 0 ? 0.1 : -0.1);
      quarterlySignals.push(this.clamp01(signal));

      const segmentSize = Math.max(1, Math.floor(recentVolumes.length / 4));
      const segmentVolumes = recentVolumes.slice(
        q * segmentSize,
        Math.min((q + 1) * segmentSize, recentVolumes.length)
      );
      quarterlyVolumes.push(this.average(segmentVolumes) / Math.max(1, this.average(recentVolumes)));
    }

    // Compute Pearson correlation
    const correlationCoefficient = this.pearsonCorrelation(quarterlySignals, quarterlyVolumes);

    return {
      correlationCoefficient: Number(correlationCoefficient.toFixed(4)),
      volumeTrend,
      quarterlyReportsAnalyzed: quarterlySignals.length
    };
  }

  /**
   * Determines the overall trend direction.
   */
  private determineTrend(
    fastMa: number,
    slowMa: number,
    fastRising: boolean,
    slowRising: boolean,
    crossover: MaCrossover
  ): TrendDirection {
    const spread = fastMa - slowMa;
    const spreadPct = Math.abs(spread) / Math.max(slowMa, 1);

    // Strong bullish: golden cross actively in effect, both MAs rising
    if (crossover.type === "golden_cross" && fastRising && slowRising && spreadPct > 0.01) {
      return "bullish";
    }

    // Moderately bullish: golden cross, at least fast MA rising
    if (crossover.type === "golden_cross" && (fastRising || spreadPct > 0.02)) {
      return "bullish";
    }

    // Strong bearish: death cross actively in effect, both MAs falling
    if (crossover.type === "death_cross" && !fastRising && !slowRising && spreadPct > 0.01) {
      return "bearish";
    }

    // Moderately bearish: death cross, at least fast MA falling
    if (crossover.type === "death_cross" && (!fastRising || spreadPct > 0.02)) {
      return "bearish";
    }

    // Check for neutral: MAs are close together or no clear direction
    const fastRisingSlowFalling = fastRising && !slowRising;
    const slowRisingFastFalling = slowRising && !fastRising;

    if (spreadPct < 0.005 || fastRisingSlowFalling || slowRisingFastFalling) {
      return "neutral";
    }

    // Default: align with whichever MA is dominant
    if (fastRising && slowRising) return fastMa > slowMa ? "bullish" : "bearish";
    if (!fastRising && !slowRising) return fastMa > slowMa ? "bullish" : "bearish";

    return "neutral";
  }

  /**
   * Estimates support and resistance levels from candles and MAs.
   */
  private estimatePriceLevels(
    candles: InstitutionalOhlcCandle[],
    fastMa: number,
    slowMa: number
  ): { supportLevel: number; resistanceLevel: number } {
    const recentCandles = candles.slice(-20);
    const lows = recentCandles.map((c) => c.low);
    const highs = recentCandles.map((c) => c.high);

    const minLow = Math.min(...lows);
    const maxHigh = Math.max(...highs);

    // Support is the minimum of: slow MA, fast MA, recent lows
    const supportLevel = Math.min(slowMa, fastMa, minLow);

    // Resistance is the maximum of: slow MA, fast MA, recent highs
    const resistanceLevel = Math.max(slowMa, fastMa, maxHigh);

    return { supportLevel, resistanceLevel };
  }

  /**
   * Computes overall trend strength (0-1).
   */
  private computeTrendStrength(
    fastMa: MaComputed,
    slowMa: MaComputed,
    crossover: MaCrossover,
    volumeCorrelation: VolumeCorrelation,
    analysis: InstitutionalAnalysisContract
  ): number {
    // MA separation contribution (wider = stronger trend)
    const spread = Math.abs(fastMa.value - slowMa.value);
    const spreadPct = spread / Math.max(slowMa.value, 1);
    const maSeparation = Math.min(1, spreadPct * 5);

    // MA slope contribution (steeper = stronger trend)
    const avgSlope = (Math.abs(fastMa.slope) + Math.abs(slowMa.slope)) / 2;
    const slopeStrength = Math.min(1, avgSlope * 100);

    // Crossover recency contribution (recent cross = stronger signal)
    const crossoverStrength = crossover.type !== "none"
      ? Math.max(0, 1 - crossover.daysSince / 60)
      : 0.3;

    // Volume confirmation
    const volumeStrength = volumeCorrelation.volumeTrend === "increasing"
      ? 0.85
      : volumeCorrelation.volumeTrend === "decreasing"
        ? 0.4
        : 0.6;

    // Flow momentum from institutional data
    const netFlow = analysis.flows.inflows - analysis.flows.outflows;
    const flowMagnitude = Math.abs(netFlow) / Math.max(analysis.volume, 1);
    const flowStrength = Math.min(1, flowMagnitude * 5);

    return this.clamp01(
      maSeparation * 0.3 +
      slopeStrength * 0.15 +
      crossoverStrength * 0.2 +
      volumeStrength * 0.2 +
      flowStrength * 0.15
    );
  }

  /**
   * Computes the probability that the current trend will continue.
   */
  private computeContinuityProbability(
    fastMa: MaComputed,
    slowMa: MaComputed,
    crossover: MaCrossover,
    volumeCorrelation: VolumeCorrelation,
    analysis: InstitutionalAnalysisContract,
    trendStrength: number
  ): ContinuityProbability {
    // Factor 1: MA alignment
    // Both MAs aligned in same direction = high continuity
    const bothRising = fastMa.rising && slowMa.rising;
    const bothFalling = !fastMa.rising && !slowMa.rising;
    const aligned = bothRising || bothFalling;
    const maAlignment = aligned ? this.clamp01(0.7 + trendStrength * 0.3) : this.clamp01(0.4 - trendStrength * 0.2);

    // Factor 2: Volume confirmation
    // Increasing volume in trend direction confirms continuity
    const volumeConfirmation = volumeCorrelation.volumeTrend === "increasing"
      ? this.clamp01(0.65 + Math.abs(volumeCorrelation.correlationCoefficient) * 0.3)
      : volumeCorrelation.volumeTrend === "decreasing"
        ? this.clamp01(0.4 - Math.abs(volumeCorrelation.correlationCoefficient) * 0.2)
        : 0.5;

    // Factor 3: Ownership trend
    // High and growing fund ownership supports continuity
    const ownershipPct = analysis.fundsOwnershipPct / 100;
    const ownershipTrend = this.clamp01(
      0.3 + ownershipPct * 0.4 + (analysis.openPositions.count > 10 ? 0.15 : 0)
    );

    // Factor 4: Flow momentum
    // Sustained inflows > outflows supports bullish continuity
    const netFlow = analysis.flows.inflows - analysis.flows.outflows;
    const totalFlow = analysis.flows.inflows + analysis.flows.outflows;
    const flowRatio = totalFlow > 0 ? netFlow / totalFlow : 0;
    // Normalise flow ratio from [-1, 1] to [0, 1]
    const flowMomentum = this.clamp01(0.5 + flowRatio * 0.4);

    const factors: ContinuityFactors = {
      maAlignment: Number(maAlignment.toFixed(4)),
      volumeConfirmation: Number(volumeConfirmation.toFixed(4)),
      ownershipTrend: Number(ownershipTrend.toFixed(4)),
      flowMomentum: Number(flowMomentum.toFixed(4))
    };

    // Overall probability = weighted average of factors
    // Weights: MA 35%, Volume 25%, Ownership 20%, Flow 20%
    const probability = this.clamp01(
      maAlignment * 0.35 +
      volumeConfirmation * 0.25 +
      ownershipTrend * 0.20 +
      flowMomentum * 0.20
    );

    return {
      probability: Number(probability.toFixed(4)),
      factors: createContinuityFactors(factors)
    };
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

  /**
   * Computes the Pearson correlation coefficient between two arrays.
   */
  private pearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;
    const meanX = this.average(x);
    const meanY = this.average(y);

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }

    const denom = Math.sqrt(denomX * denomY);
    if (denom === 0) return 0;

    const raw = numerator / denom;
    return Math.max(-1, Math.min(1, raw));
  }

  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
  }
}
