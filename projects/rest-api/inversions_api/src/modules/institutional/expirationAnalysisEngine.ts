/**
 * T110: Expiration Analysis Engine
 * ==================================
 * Detects key option/future expiration dates (monthly/quarterly) where
 * institutional players adjust positions, and evaluates the expected
 * impact on the underlying price.
 *
 * Features:
 * - Slippery slope analysis (accelerated decline toward expiration)
 * - Catalyst windows (event-driven: earnings, FOMC, CPI, OpEx)
 * - Time decay profile (theta/gamma profile as expiration approaches)
 * - Correlation with quarterly report filing windows
 *
 * Follows the same architectural pattern as InstitutionalZonesEngine
 * and InstitutionalTrendEngine.
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
 * Type of expiration event detected by the engine.
 */
export type ExpirationEventType =
  | "monthly_opex"
  | "quarterly_opex"
  | "weekly_opex"
  | "quarter_futures"
  | "monthly_futures";

/**
 * A detected expiration event in the analysis window.
 */
export interface ExpirationEvent {
  /** Type of expiration event. */
  type: ExpirationEventType;
  /** Unix ms timestamp of the expiration date. */
  date: number;
  /** Human-readable label for the event. */
  label: string;
  /** Days from the analysis reference until this event. */
  daysUntil: number;
  /** Expected directional bias of the event (bullish, bearish, neutral). */
  directionalBias: "bullish" | "bearish" | "neutral";
  /** Expected significance (0-1). */
  significance: number;
}

/**
 * Direction of a slippery slope.
 */
export type SlopeDirection = "call_skew" | "put_skew" | "symmetric";

/**
 * Slippery slope analysis result.
 *
 * Represents how the underlying price tends to "slide" toward key strikes
 * as expiration approaches, driven by institutional gamma hedging.
 */
export interface SlipperySlope {
  /** Direction of the slope. */
  direction: SlopeDirection;
  /** Acceleration factor: how much the slide accelerates (0-1). */
  accelerationFactor: number;
  /** Estimated price drift toward nearest strike (% of current price). */
  driftPct: number;
  /** Nearest strike with significant open interest attracting price. */
  attractorStrike: number;
  /** Confidence in the slippery slope detection (0-1). */
  confidence: number;
  /** Estimated number of days until the slope effect peaks. */
  peakDays: number;
}

/**
 * Type of catalyst window.
 */
export type CatalystType =
  | "earnings"
  | "fomc"
  | "cpi"
  | "monthly_opex"
  | "quarterly_opex"
  | "triple_witching"
  | "dividend_ex"
  | "index_rebalance";

/**
 * A catalyst window — an event-driven period where volatility and
 * institutional activity are expected to spike.
 */
export interface CatalystWindow {
  /** Type of catalyst. */
  type: CatalystType;
  /** Unix ms timestamp of the catalyst event. */
  date: number;
  /** Human-readable label. */
  label: string;
  /** Days until the catalyst event. */
  daysUntil: number;
  /** Expected volatility impact (0-1). */
  volatilityImpact: number;
  /** Expected volume surge factor (multiplier). */
  volumeSurgeFactor: number;
  /** Confidence in the catalyst detection (0-1). */
  confidence: number;
}

/**
 * Time decay profile as expiration approaches.
 *
 * Models the theta and gamma profile that institutional positions
 * experience as they approach expiration.
 */
export interface TimeDecayProfile {
  /** Estimated theta (daily time decay) as % of position value. */
  thetaPct: number;
  /** Estimated gamma exposure as % of notional. */
  gammaExposurePct: number;
  /** Acceleration of decay: number of days until decay accelerates. */
  accelerationDays: number;
  /** Regime of the decay curve. */
  decayRegime: "far" | "near" | "at_expiration";
  /** Vanna exposure (volatility/spot cross-sensitivity) as % of notional. */
  vannaExposurePct: number;
  /** Charm (delta decay over time) as % of notional per day. */
  charmPct: number;
}

/**
 * Correlation between expiration windows and quarterly report filing periods.
 */
export interface QuarterlyReportCorrelation {
  /** Number of detected quarterly report windows overlapping with expiration events. */
  overlappingWindows: number;
  /** Average historical price impact of overlapping windows (as % of price). */
  averageImpactPct: number;
  /** Total number of quarterly windows in the analysis period. */
  totalQuarterlyWindows: number;
  /** Correlation coefficient between quarterly filings and expiration spikes (-1 to 1). */
  filingExpirationCorrelation: number;
  /** Whether an active quarterly report window is currently open. */
  currentlyInWindow: boolean;
  /** Days until next quarterly report window. */
  daysUntilNextWindow: number;
}

/**
 * Full result payload emitted by the expiration analysis engine.
 */
export interface ExpirationAnalysisResult {
  /** The original analysis contract. */
  analysis: InstitutionalAnalysisContract;
  /** Detected expiration events in the analysis window. */
  expirationEvents: ExpirationEvent[];
  /** Slippery slope analysis. */
  slipperySlope: SlipperySlope;
  /** Detected catalyst windows. */
  catalystWindows: CatalystWindow[];
  /** Time decay profile. */
  timeDecay: TimeDecayProfile;
  /** Quarterly report correlation. */
  quarterlyCorrelation: QuarterlyReportCorrelation;
  /** Number of days in the analysis window. */
  analysisWindowDays: number;
  /** Source reports from institutional data service. */
  sourceReports: InstitutionalSourceReport[];
  /** Timestamp when the result was generated. */
  generatedAt: string;
}

/**
 * Request accepted by the expiration analysis engine.
 */
export interface ExpirationAnalysisRequest {
  /** The canonical institutional analysis contract. */
  analysis: InstitutionalAnalysisContract;
  /** Optional OHLC candle data for price-contextualized analysis. */
  candles?: InstitutionalOhlcCandle[];
  /** Optional reference date for analysis (default: now). */
  referenceDate?: Date;
  /** Optional override for the analysis window in days (default: 90). */
  analysisWindowDays?: number;
}

/**
 * Engine configuration options.
 */
export interface ExpirationAnalysisEngineOptions {
  /** Required institutional data service for resolving source observations. */
  institutionalDataService: InstitutionalDataService;
  /** Default analysis window in days (default 90). */
  defaultWindowDays?: number;
  /** Number of months to look ahead for expiration events (default 6). */
  lookAheadMonths?: number;
  /** Strike proximity threshold for attractor detection (% of price, default 0.05). */
  strikeProximityPct?: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_WINDOW_DAYS = 90;
const DEFAULT_LOOK_AHEAD_MONTHS = 6;
const DEFAULT_STRIKE_PROXIMITY_PCT = 0.05;
const OPEX_WEEKDAY = 5; // Friday
const QUARTER_MONTHS = [3, 6, 9, 12];
const TRIPLE_WITCHING_MONTHS = [3, 6, 9, 12];
const QUARTERLY_REPORT_MONTHS = [2, 5, 8, 11]; // Approximate 13F filing months
const DAY_MS = 86_400_000;

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

/**
 * Checks whether a value is a valid expiration event type.
 */
export function isExpirationEventType(value: unknown): value is ExpirationEventType {
  const valid: ExpirationEventType[] = [
    "monthly_opex", "quarterly_opex", "weekly_opex",
    "quarter_futures", "monthly_futures"
  ];
  return valid.includes(value as ExpirationEventType);
}

/**
 * Checks whether a value is a valid expiration event.
 */
export function isExpirationEvent(value: unknown): value is ExpirationEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as ExpirationEvent;
  return (
    isExpirationEventType(event.type) &&
    isFiniteNumber(event.date) &&
    isNonEmptyString(event.label) &&
    isFiniteNumber(event.daysUntil) &&
    (event.directionalBias === "bullish" || event.directionalBias === "bearish" || event.directionalBias === "neutral") &&
    isFiniteNumber(event.significance) &&
    event.significance >= 0 &&
    event.significance <= 1
  );
}

/**
 * Checks whether a value is a valid slope direction.
 */
export function isSlopeDirection(value: unknown): value is SlopeDirection {
  const valid: SlopeDirection[] = ["call_skew", "put_skew", "symmetric"];
  return valid.includes(value as SlopeDirection);
}

/**
 * Checks whether a value is a valid slippery slope.
 */
export function isSlipperySlope(value: unknown): value is SlipperySlope {
  if (!value || typeof value !== "object") return false;
  const slope = value as SlipperySlope;
  return (
    isSlopeDirection(slope.direction) &&
    isFiniteNumber(slope.accelerationFactor) &&
    slope.accelerationFactor >= 0 &&
    slope.accelerationFactor <= 1 &&
    isFiniteNumber(slope.driftPct) &&
    isFiniteNumber(slope.attractorStrike) &&
    slope.attractorStrike >= 0 &&
    isFiniteNumber(slope.confidence) &&
    slope.confidence >= 0 &&
    slope.confidence <= 1 &&
    isFiniteNumber(slope.peakDays) &&
    slope.peakDays >= 0
  );
}

/**
 * Checks whether a value is a valid catalyst type.
 */
export function isCatalystType(value: unknown): value is CatalystType {
  const valid: CatalystType[] = [
    "earnings", "fomc", "cpi", "monthly_opex",
    "quarterly_opex", "triple_witching", "dividend_ex", "index_rebalance"
  ];
  return valid.includes(value as CatalystType);
}

/**
 * Checks whether a value is a valid catalyst window.
 */
export function isCatalystWindow(value: unknown): value is CatalystWindow {
  if (!value || typeof value !== "object") return false;
  const cw = value as CatalystWindow;
  return (
    isCatalystType(cw.type) &&
    isFiniteNumber(cw.date) &&
    isNonEmptyString(cw.label) &&
    isFiniteNumber(cw.daysUntil) &&
    isFiniteNumber(cw.volatilityImpact) &&
    cw.volatilityImpact >= 0 &&
    cw.volatilityImpact <= 1 &&
    isFiniteNumber(cw.volumeSurgeFactor) &&
    cw.volumeSurgeFactor >= 0 &&
    isFiniteNumber(cw.confidence) &&
    cw.confidence >= 0 &&
    cw.confidence <= 1
  );
}

/**
 * Checks whether a value is a valid time decay profile.
 */
export function isTimeDecayProfile(value: unknown): value is TimeDecayProfile {
  if (!value || typeof value !== "object") return false;
  const td = value as TimeDecayProfile;
  return (
    isFiniteNumber(td.thetaPct) &&
    isFiniteNumber(td.gammaExposurePct) &&
    isFiniteNumber(td.accelerationDays) &&
    td.accelerationDays >= 0 &&
    (td.decayRegime === "far" || td.decayRegime === "near" || td.decayRegime === "at_expiration") &&
    isFiniteNumber(td.vannaExposurePct) &&
    isFiniteNumber(td.charmPct)
  );
}

/**
 * Checks whether a value is a valid quarterly report correlation.
 */
export function isQuarterlyReportCorrelation(value: unknown): value is QuarterlyReportCorrelation {
  if (!value || typeof value !== "object") return false;
  const qc = value as QuarterlyReportCorrelation;
  return (
    isFiniteNumber(qc.overlappingWindows) &&
    Number.isInteger(qc.overlappingWindows) &&
    qc.overlappingWindows >= 0 &&
    isFiniteNumber(qc.averageImpactPct) &&
    isFiniteNumber(qc.totalQuarterlyWindows) &&
    Number.isInteger(qc.totalQuarterlyWindows) &&
    qc.totalQuarterlyWindows >= 0 &&
    isFiniteNumber(qc.filingExpirationCorrelation) &&
    qc.filingExpirationCorrelation >= -1 &&
    qc.filingExpirationCorrelation <= 1 &&
    typeof qc.currentlyInWindow === "boolean" &&
    isFiniteNumber(qc.daysUntilNextWindow) &&
    qc.daysUntilNextWindow >= 0
  );
}

/**
 * Checks whether a value is a valid expiration analysis result.
 */
export function isExpirationAnalysisResult(value: unknown): value is ExpirationAnalysisResult {
  if (!value || typeof value !== "object") return false;
  const result = value as ExpirationAnalysisResult;
  return (
    isInstitutionalAnalysisContract(result.analysis) &&
    Array.isArray(result.expirationEvents) &&
    result.expirationEvents.every(isExpirationEvent) &&
    isSlipperySlope(result.slipperySlope) &&
    Array.isArray(result.catalystWindows) &&
    result.catalystWindows.every(isCatalystWindow) &&
    isTimeDecayProfile(result.timeDecay) &&
    isQuarterlyReportCorrelation(result.quarterlyCorrelation) &&
    isFiniteNumber(result.analysisWindowDays) &&
    Number.isInteger(result.analysisWindowDays) &&
    result.analysisWindowDays > 0 &&
    Array.isArray(result.sourceReports) &&
    result.sourceReports.every(isInstitutionalSourceReport) &&
    isNonEmptyString(result.generatedAt)
  );
}

// ---------------------------------------------------------------------------
// Factory functions
// ---------------------------------------------------------------------------

/**
 * Creates a validated expiration event.
 */
export function createExpirationEvent(event: ExpirationEvent): ExpirationEvent {
  if (!isExpirationEvent(event)) {
    throw new Error("Invalid expiration event payload.");
  }
  return event;
}

/**
 * Creates a validated slippery slope.
 */
export function createSlipperySlope(slope: SlipperySlope): SlipperySlope {
  if (!isSlipperySlope(slope)) {
    throw new Error("Invalid slippery slope payload.");
  }
  return slope;
}

/**
 * Creates a validated catalyst window.
 */
export function createCatalystWindow(window: CatalystWindow): CatalystWindow {
  if (!isCatalystWindow(window)) {
    throw new Error("Invalid catalyst window payload.");
  }
  return window;
}

/**
 * Creates a validated time decay profile.
 */
export function createTimeDecayProfile(profile: TimeDecayProfile): TimeDecayProfile {
  if (!isTimeDecayProfile(profile)) {
    throw new Error("Invalid time decay profile payload.");
  }
  return profile;
}

/**
 * Creates a validated quarterly report correlation.
 */
export function createQuarterlyReportCorrelation(correlation: QuarterlyReportCorrelation): QuarterlyReportCorrelation {
  if (!isQuarterlyReportCorrelation(correlation)) {
    throw new Error("Invalid quarterly report correlation payload.");
  }
  return correlation;
}

/**
 * Creates a validated expiration analysis result.
 */
export function createExpirationAnalysisResult(result: ExpirationAnalysisResult): ExpirationAnalysisResult {
  if (!isExpirationAnalysisResult(result)) {
    throw new Error("Invalid expiration analysis result payload.");
  }
  return result;
}

// ---------------------------------------------------------------------------
// Engine class
// ---------------------------------------------------------------------------

/**
 * Engine that analyses option/future expiration dynamics.
 *
 * This engine:
 * - Detects monthly, quarterly and weekly OpEx dates
 * - Identifies slippery slopes (gamma-driven price attraction to strikes)
 * - Maps catalyst windows (earnings, FOMC, CPI, OpEx, Triple Witching)
 * - Computes time decay profile (theta, gamma, vanna, charm)
 * - Correlates expiration events with quarterly report filing windows
 */
export class ExpirationAnalysisEngine {
  private readonly institutionalDataService: InstitutionalDataService;
  private readonly defaultWindowDays: number;
  private readonly lookAheadMonths: number;
  private readonly strikeProximityPct: number;

  constructor(options: ExpirationAnalysisEngineOptions) {
    if (!options.institutionalDataService) {
      throw new Error("ExpirationAnalysisEngine requires an institutional data service.");
    }

    this.institutionalDataService = options.institutionalDataService;
    this.defaultWindowDays = options.defaultWindowDays ?? DEFAULT_WINDOW_DAYS;
    this.lookAheadMonths = options.lookAheadMonths ?? DEFAULT_LOOK_AHEAD_MONTHS;
    this.strikeProximityPct = options.strikeProximityPct ?? DEFAULT_STRIKE_PROXIMITY_PCT;
  }

  /**
   * Analyse expiration dynamics for an institutional request.
   *
   * @param preResolvedResult - Optional pre-resolved data from InstitutionalDataService.
   *   When provided, the engine skips calling resolve() again, saving one full
   *   multi-source fetch cycle.
   */
  async analyze(request: ExpirationAnalysisRequest, preResolvedResult?: InstitutionalDataServiceResult): Promise<ExpirationAnalysisResult> {
    const analysis = createInstitutionalAnalysisContract(request.analysis);
    const institutionalResult = preResolvedResult ?? await this.institutionalDataService.resolve(analysis);
    const referenceDate = request.referenceDate ?? new Date();
    const windowDays = request.analysisWindowDays ?? this.defaultWindowDays;

    // Build option/future expiration events
    const expirationEvents = this.detectExpirationEvents(referenceDate);

    // Compute slippery slope
    const candles = request.candles;
    const slipperySlope = this.computeSlipperySlope(analysis, candles, referenceDate);

    // Detect catalyst windows
    const catalystWindows = this.detectCatalystWindows(referenceDate);

    // Compute time decay profile
    const timeDecay = this.computeTimeDecayProfile(expirationEvents, referenceDate);

    // Compute quarterly report correlation
    const quarterlyCorrelation = this.computeQuarterlyCorrelation(
      expirationEvents, analysis, referenceDate
    );

    return createExpirationAnalysisResult({
      analysis,
      expirationEvents,
      slipperySlope: createSlipperySlope(slipperySlope),
      catalystWindows: catalystWindows.map(createCatalystWindow),
      timeDecay: createTimeDecayProfile(timeDecay),
      quarterlyCorrelation: createQuarterlyReportCorrelation(quarterlyCorrelation),
      analysisWindowDays: windowDays,
      sourceReports: institutionalResult.sourceReports,
      generatedAt: new Date().toISOString()
    });
  }

  /**
   * Convenience method that returns only the expiration summary.
   */
  async analyzeExpirationSummary(request: ExpirationAnalysisRequest): Promise<{
    expirationEvents: ExpirationEvent[];
    slipperySlope: SlipperySlope;
    catalystWindows: CatalystWindow[];
    timeDecay: TimeDecayProfile;
    quarterlyCorrelation: QuarterlyReportCorrelation;
  }> {
    const result = await this.analyze(request);
    return {
      expirationEvents: result.expirationEvents,
      slipperySlope: result.slipperySlope,
      catalystWindows: result.catalystWindows,
      timeDecay: result.timeDecay,
      quarterlyCorrelation: result.quarterlyCorrelation
    };
  }

  // -------------------------------------------------------------------------
  // Private helpers — Expiration event detection
  // -------------------------------------------------------------------------

  /**
   * Detects all option/future expiration dates in the look-ahead window.
   */
  private detectExpirationEvents(referenceDate: Date): ExpirationEvent[] {
    const events: ExpirationEvent[] = [];
    const refTime = referenceDate.getTime();
    const currentMonth = referenceDate.getMonth() + 1; // 1-based
    const currentYear = referenceDate.getFullYear();

    for (let offset = 0; offset < this.lookAheadMonths; offset++) {
      const targetMonth = ((currentMonth - 1 + offset) % 12) + 1;
      const yearDelta = Math.floor((currentMonth - 1 + offset) / 12);
      const targetYear = currentYear + yearDelta;

      // Monthly OpEx: third Friday of the month
      const monthlyOpEx = this.findNthWeekday(targetYear, targetMonth, 3, OPEX_WEEKDAY);
      if (monthlyOpEx > refTime) {
        const daysUntil = Math.round((monthlyOpEx - refTime) / DAY_MS);
        const isQuarterly = QUARTER_MONTHS.includes(targetMonth);
        events.push({
          type: isQuarterly ? "quarterly_opex" : "monthly_opex",
          date: monthlyOpEx,
          label: `${this.monthLabel(targetMonth)} ${targetYear} ${isQuarterly ? "Quarterly" : "Monthly"} OpEx`,
          daysUntil,
          directionalBias: this.estimateExpiryBias(targetMonth),
          significance: isQuarterly ? 0.9 : 0.6
        });
      }

      // Quarterly futures expiration (quarter-end)
      if (QUARTER_MONTHS.includes(targetMonth)) {
        const quarterEndDate = this.findLastWeekday(targetYear, targetMonth, OPEX_WEEKDAY);
        if (quarterEndDate > refTime) {
          const daysUntil = Math.round((quarterEndDate - refTime) / DAY_MS);
          events.push({
            type: "quarter_futures",
            date: quarterEndDate,
            label: `${this.monthLabel(targetMonth)} ${targetYear} Quarterly Futures Expiry`,
            daysUntil,
            directionalBias: this.estimateExpiryBias(targetMonth),
            significance: 0.85
          });
        }
      }

      // Triple Witching (quarterly OpEx months)
      if (TRIPLE_WITCHING_MONTHS.includes(targetMonth)) {
        const tripleWitch = this.findNthWeekday(targetYear, targetMonth, 3, OPEX_WEEKDAY);
        if (tripleWitch > refTime) {
          const daysUntil = Math.round((tripleWitch - refTime) / DAY_MS);
          events.push({
            type: "quarterly_opex",
            date: tripleWitch,
            label: `${this.monthLabel(targetMonth)} ${targetYear} Triple Witching`,
            daysUntil,
            directionalBias: "neutral",
            significance: 0.95
          });
        }
      }
    }

    // Sort by date ascending
    return events.sort((a, b) => a.date - b.date);
  }

  // -------------------------------------------------------------------------
  // Private helpers — Slippery slope
  // -------------------------------------------------------------------------

  /**
   * Computes the slippery slope — the tendency of price to "slide" toward
   * high-open-interest strikes as expiration approaches.
   */
  private computeSlipperySlope(
    analysis: InstitutionalAnalysisContract,
    candles: InstitutionalOhlcCandle[] | undefined,
    referenceDate: Date
  ): SlipperySlope {
    const currentPrice = this.estimateCurrentPrice(analysis, candles);
    const nearestStrike = this.findNearestStrike(currentPrice, analysis);

    // Compute drift toward attractor strike
    const driftPct = ((nearestStrike - currentPrice) / currentPrice) * 100;

    // Determine slope direction based on put/call open interest skew
    const direction = this.determineSlopeDirection(analysis);

    // Acceleration increases as we approach expiration
    const daysToQuarterEnd = this.daysToNextQuarterEnd(referenceDate);
    const accelerationFactor = this.clamp01(1 - daysToQuarterEnd / 90);

    // Confidence based on institutional data strength
    const confidence = this.clamp01(
      0.3 +
        (analysis.fundsOwnershipPct / 100) * 0.3 +
        Math.abs(driftPct) / 10 * 0.2 +
        (analysis.liquidity === "high" ? 0.2 : analysis.liquidity === "medium" ? 0.1 : 0)
    );

    return {
      direction,
      accelerationFactor: Number(accelerationFactor.toFixed(4)),
      driftPct: Number(driftPct.toFixed(4)),
      attractorStrike: Number(nearestStrike.toFixed(2)),
      confidence: Number(confidence.toFixed(4)),
      peakDays: Math.min(Math.round(this.daysToNearestOpEx(referenceDate)), 30)
    };
  }

  /**
   * Determines the directional skew of the slippery slope based on
   * institutional flow data.
   */
  private determineSlopeDirection(analysis: InstitutionalAnalysisContract): SlopeDirection {
    const netFlow = analysis.flows.inflows - analysis.flows.outflows;
    const totalFlow = analysis.flows.inflows + analysis.flows.outflows;
    const flowRatio = totalFlow > 0 ? netFlow / totalFlow : 0;

    // Strong institutional buying → call skew (upward attraction)
    if (flowRatio > 0.25 && analysis.fundsOwnershipPct > 30) {
      return "call_skew";
    }

    // Strong institutional selling → put skew (downward attraction)
    if (flowRatio < -0.25 && analysis.fundsOwnershipPct < 20) {
      return "put_skew";
    }

    // Neutral / mixed signals
    return "symmetric";
  }

  // -------------------------------------------------------------------------
  // Private helpers — Catalyst windows
  // -------------------------------------------------------------------------

  /**
   * Detects event-driven catalyst windows in the look-ahead period.
   */
  private detectCatalystWindows(referenceDate: Date): CatalystWindow[] {
    const windows: CatalystWindow[] = [];
    const refTime = referenceDate.getTime();
    const currentMonth = referenceDate.getMonth() + 1;
    const currentYear = referenceDate.getFullYear();

    for (let offset = 0; offset < this.lookAheadMonths; offset++) {
      const targetMonth = ((currentMonth - 1 + offset) % 12) + 1;
      const yearDelta = Math.floor((currentMonth - 1 + offset) / 12);
      const targetYear = currentYear + yearDelta;

      // FOMC: approximately 6-week cycle, simulated as mid-month
      // FOMC meetings typically fall in Jan, Mar, May, Jun, Jul, Sep, Nov, Dec
      const fomcMonths = [1, 3, 5, 6, 7, 9, 11, 12];
      if (fomcMonths.includes(targetMonth)) {
          const fomcDate = this.findNthWeekday(targetYear, targetMonth, 2, 3); // 2nd Wednesday
          if (fomcDate > refTime) {
            const daysUntil = Math.round((fomcDate - refTime) / DAY_MS);
            windows.push({
              type: "fomc",
              date: fomcDate,
              label: `FOMC Meeting ${this.monthLabel(targetMonth)} ${targetYear}`,
              daysUntil,
              volatilityImpact: 0.7,
              volumeSurgeFactor: 1.8,
              confidence: 0.85
            });
          }
      }

      // CPI release: typically 2nd week of the month
      if (targetMonth > currentMonth || (targetMonth === currentMonth && 0 < referenceDate.getDate())) {
        const cpiDate = this.findNthWeekday(targetYear, targetMonth, 2, 3); // 2nd Wednesday
        if (cpiDate > refTime) {
          const daysUntil = Math.round((cpiDate - refTime) / DAY_MS);
          windows.push({
            type: "cpi",
            date: cpiDate,
            label: `CPI Release ${this.monthLabel(targetMonth)} ${targetYear}`,
            daysUntil,
            volatilityImpact: 0.6,
            volumeSurgeFactor: 1.5,
            confidence: 0.8
          });
        }
      }

      // Earnings season: approximate windows for common tickers
      // Mid-Jan, Mid-Apr, Mid-Jul, Mid-Oct
      const earningsMonths = [1, 4, 7, 10];
      if (earningsMonths.includes(targetMonth)) {
        const earningsDate = this.findNthWeekday(targetYear, targetMonth, 2, 5); // 2nd Friday
        if (earningsDate > refTime) {
          const daysUntil = Math.round((earningsDate - refTime) / DAY_MS);
          windows.push({
            type: "earnings",
            date: earningsDate,
            label: `Earnings Season ${this.monthLabel(targetMonth)} ${targetYear}`,
            daysUntil,
            volatilityImpact: 0.75,
            volumeSurgeFactor: 2.0,
            confidence: 0.7
          });
        }
      }

      // Monthly OpEx as catalyst
      const opexDate = this.findNthWeekday(targetYear, targetMonth, 3, OPEX_WEEKDAY);
      if (opexDate > refTime) {
        const daysUntil = Math.round((opexDate - refTime) / DAY_MS);
        const isQuarterly = QUARTER_MONTHS.includes(targetMonth);
        windows.push({
          type: isQuarterly ? "quarterly_opex" : "monthly_opex",
          date: opexDate,
          label: `${this.monthLabel(targetMonth)} ${targetYear} ${isQuarterly ? "Quarterly OpEx" : "Monthly OpEx"}`,
          daysUntil,
          volatilityImpact: isQuarterly ? 0.8 : 0.55,
          volumeSurgeFactor: isQuarterly ? 2.5 : 1.6,
          confidence: isQuarterly ? 0.9 : 0.75
        });
      }

      // Triple Witching
      if (TRIPLE_WITCHING_MONTHS.includes(targetMonth)) {
        const tripleDate = this.findNthWeekday(targetYear, targetMonth, 3, OPEX_WEEKDAY);
        if (tripleDate > refTime) {
          const daysUntil = Math.round((tripleDate - refTime) / DAY_MS);
          windows.push({
            type: "triple_witching",
            date: tripleDate,
            label: `Triple Witching ${this.monthLabel(targetMonth)} ${targetYear}`,
            daysUntil,
            volatilityImpact: 0.85,
            volumeSurgeFactor: 2.8,
            confidence: 0.95
          });
        }
      }
    }

    return windows.sort((a, b) => a.date - b.date);
  }

  // -------------------------------------------------------------------------
  // Private helpers — Time decay profile
  // -------------------------------------------------------------------------

  /**
   * Computes the theta/gamma time decay profile based on proximity
   * to the nearest expiration event.
   */
  private computeTimeDecayProfile(
    events: ExpirationEvent[],
    referenceDate: Date
  ): TimeDecayProfile {
    const nearestEvent = events.length > 0
      ? events.reduce((nearest, event) =>
          event.daysUntil < nearest.daysUntil ? event : nearest
        )
      : null;

    if (!nearestEvent) {
      return {
        thetaPct: 0,
        gammaExposurePct: 0,
        accelerationDays: 30,
        decayRegime: "far",
        vannaExposurePct: 0,
        charmPct: 0
      };
    }

    const daysUntil = nearestEvent.daysUntil;

    // Theta: decays faster as expiration approaches
    let thetaPct: number;
    let decayRegime: "far" | "near" | "at_expiration";
    if (daysUntil <= 7) {
      // At-expiration: theta accelerates, gamma explodes
      thetaPct = 0.8 + (1 - daysUntil / 7) * 1.2;
      decayRegime = "at_expiration";
    } else if (daysUntil <= 30) {
      // Near-expiration: theta significant, gamma building
      thetaPct = 0.3 + (1 - (daysUntil - 7) / 23) * 0.5;
      decayRegime = "near";
    } else {
      // Far from expiration: theta low and steady
      thetaPct = Math.max(0.05, 0.2 - (daysUntil - 30) * 0.002);
      decayRegime = "far";
    }

    // Gamma: inverse of theta — low far out, spikes near expiration
    const gammaExposurePct = decayRegime === "at_expiration"
      ? 1.2 + (7 - daysUntil) * 0.3
      : decayRegime === "near"
        ? 0.3 + (30 - daysUntil) * 0.03
        : 0.05;

    // Vanna: volatility/spot cross-sensitivity — peaks in "near" regime
    const vannaExposurePct = decayRegime === "near"
      ? 0.4 + (30 - daysUntil) * 0.01
      : decayRegime === "at_expiration"
        ? 0.15
        : 0.02;

    // Charm: delta decay — how delta changes as time passes, peaks in "near"
    const charmPct = decayRegime === "near"
      ? 0.06 + (30 - daysUntil) * 0.002
      : decayRegime === "at_expiration"
        ? 0.03
        : 0.005;

    return {
      thetaPct: Number(thetaPct.toFixed(4)),
      gammaExposurePct: Number(gammaExposurePct.toFixed(4)),
      accelerationDays: Math.max(0, daysUntil - 7),
      decayRegime,
      vannaExposurePct: Number(vannaExposurePct.toFixed(4)),
      charmPct: Number(charmPct.toFixed(4))
    };
  }

  // -------------------------------------------------------------------------
  // Private helpers — Quarterly report correlation
  // -------------------------------------------------------------------------

  /**
   * Computes the correlation between expiration events and quarterly
   * report filing periods.
   */
  private computeQuarterlyCorrelation(
    events: ExpirationEvent[],
    analysis: InstitutionalAnalysisContract,
    referenceDate: Date
  ): QuarterlyReportCorrelation {
    const currentMonth = referenceDate.getMonth() + 1;
    const currentYear = referenceDate.getFullYear();

    // Find quarterly report windows (13F filings: mid-Feb, mid-May, mid-Aug, mid-Nov)
    const reportWindows: Array<{ start: number; end: number }> = [];
    const expirationTimes = new Set(events.map((e) => e.date));

    for (let q = 0; q < 4; q++) {
      const reportMonth = QUARTERLY_REPORT_MONTHS[q];
      const reportYear = reportMonth >= currentMonth ? currentYear : currentYear + 1;
      const midDate = new Date(reportYear, reportMonth - 1, 15);
      const windowStart = midDate.getTime() - 7 * DAY_MS;
      const windowEnd = midDate.getTime() + 14 * DAY_MS;

      if (windowStart > referenceDate.getTime()) {
        reportWindows.push({ start: windowStart, end: windowEnd });
      }
    }

    // Count overlapping windows
    let overlappingWindows = 0;
    for (const window of reportWindows) {
      for (const expTime of expirationTimes) {
        if (expTime >= window.start && expTime <= window.end) {
          overlappingWindows++;
          break;
        }
      }
    }

    // Average impact: more overlap → higher impact
    const totalWindows = reportWindows.length;
    const overlapRatio = totalWindows > 0 ? overlappingWindows / totalWindows : 0;
    const averageImpactPct = this.clamp01(overlapRatio) * 3.5; // Up to 3.5% impact

    // Correlation coefficient: synthetic based on institutional data
    const ownershipSignal = analysis.fundsOwnershipPct / 100;
    const flowBias = analysis.flows.inflows + analysis.flows.outflows > 0
      ? (analysis.flows.inflows - analysis.flows.outflows) /
        (analysis.flows.inflows + analysis.flows.outflows)
      : 0;
    const correlation = this.clampNeg1Pos1(
      ownershipSignal * 0.5 + flowBias * 0.3 + overlapRatio * 0.2
    );

    // Check if currently in a quarterly report window
    const now = referenceDate.getTime();
    const currentlyInWindow = reportWindows.some(
      (w) => now >= w.start && now <= w.end
    );

    // Days until next quarterly report window
    const futureWindows = reportWindows.filter((w) => w.start > now);
    const daysUntilNextWindow = futureWindows.length > 0
      ? Math.round((futureWindows[0].start - now) / DAY_MS)
      : 120;

    return {
      overlappingWindows,
      averageImpactPct: Number(averageImpactPct.toFixed(4)),
      totalQuarterlyWindows: totalWindows,
      filingExpirationCorrelation: Number(correlation.toFixed(4)),
      currentlyInWindow,
      daysUntilNextWindow
    };
  }

  // -------------------------------------------------------------------------
  // Private helpers — Utility
  // -------------------------------------------------------------------------

  /**
   * Estimates current price from candles or contract.
   */
  private estimateCurrentPrice(
    analysis: InstitutionalAnalysisContract,
    candles?: InstitutionalOhlcCandle[]
  ): number {
    if (candles && candles.length > 0) {
      const sorted = [...candles].sort((a, b) => b.time - a.time);
      return sorted[0].close;
    }
    return analysis.strike ?? Math.max(analysis.volume / 100000, 25);
  }

  /**
   * Finds the nearest strike price with likely high open interest.
   */
  private findNearestStrike(
    currentPrice: number,
    analysis: InstitutionalAnalysisContract
  ): number {
    const strike = analysis.strike;
    if (strike && strike > 0) {
      // Use the contract's strike as attractor if close enough
      const proximity = Math.abs(strike - currentPrice) / currentPrice;
      if (proximity <= this.strikeProximityPct * 3) {
        return strike;
      }
    }

    // Otherwise, find the nearest round-number strike
    const interval = this.strikeProximityPct * currentPrice;
    const remainder = currentPrice % interval;
    const below = currentPrice - remainder;
    const above = below + interval;

    // Pick the closer one
    return (currentPrice - below) < (above - currentPrice) ? below : above;
  }

  /**
   * Estimates expiration directional bias based on month.
   * (Simplified model: Jan/Feb/Mar tend to be put-skewed due to tax-loss,
   * Jul/Aug/Sep mixed, Oct/Nov/Dec mixed.)
   */
  private estimateExpiryBias(month: number): "bullish" | "bearish" | "neutral" {
    // January effect, March OpEx, etc.
    if (month >= 1 && month <= 3) return "neutral";
    if (month >= 4 && month <= 6) return "bullish";
    if (month >= 7 && month <= 9) return "neutral";
    return "bearish";
  }

  /**
   * Finds the Nth occurrence of a weekday in a given month/year.
   * weekday: 0=Sun, 1=Mon, ..., 6=Sat
   */
  private findNthWeekday(year: number, month: number, nth: number, weekday: number): number {
    const firstDay = new Date(year, month - 1, 1);
    const firstWeekday = firstDay.getDay();
    let diff = weekday - firstWeekday;
    if (diff < 0) diff += 7;
    const dayOfMonth = 1 + diff + (nth - 1) * 7;
    return new Date(year, month - 1, dayOfMonth).getTime();
  }

  /**
   * Finds the last occurrence of a weekday in a given month/year.
   */
  private findLastWeekday(year: number, month: number, weekday: number): number {
    const lastDay = new Date(year, month, 0); // Last day of month
    const lastWeekday = lastDay.getDay();
    let diff = lastWeekday - weekday;
    if (diff < 0) diff += 7;
    const dayOfMonth = lastDay.getDate() - diff;
    return new Date(year, month - 1, dayOfMonth).getTime();
  }

  /**
   * Returns the number of days until the next quarter-end.
   */
  private daysToNextQuarterEnd(date: Date): number {
    const month = date.getMonth() + 1;
    const nextQuarter = QUARTER_MONTHS.find((q) => q > month) ?? QUARTER_MONTHS[0];
    const year = nextQuarter > month ? date.getFullYear() : date.getFullYear() + 1;
    const quarterEnd = new Date(year, nextQuarter - 1, 1);
    // Move to last business day of the month
    quarterEnd.setDate(0);
    return Math.round((quarterEnd.getTime() - date.getTime()) / DAY_MS);
  }

  /**
   * Returns the number of days until the nearest monthly OpEx.
   */
  private daysToNearestOpEx(date: Date): number {
    const currentMonth = date.getMonth() + 1;
    const currentYear = date.getFullYear();
    const opexThisMonth = this.findNthWeekday(currentYear, currentMonth, 3, OPEX_WEEKDAY);

    if (opexThisMonth > date.getTime()) {
      return Math.round((opexThisMonth - date.getTime()) / DAY_MS);
    }

    // Next month
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    const opexNextMonth = this.findNthWeekday(nextYear, nextMonth, 3, OPEX_WEEKDAY);
    return Math.round((opexNextMonth - date.getTime()) / DAY_MS);
  }

  /**
   * Returns a short month label.
   */
  private monthLabel(month: number): string {
    const labels = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return labels[month - 1] ?? "Unknown";
  }

  private clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
  }

  private clampNeg1Pos1(value: number): number {
    return Math.max(-1, Math.min(1, value));
  }

  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
}
