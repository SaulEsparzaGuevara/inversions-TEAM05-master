/**
 * T106: Institutional analysis parameter contract.
 * ==================================================
 * Defines the validated input model used by TEAM-05 institutional analysis flows.
 *
 * The contract is intentionally explicit so downstream analysis, reporting and
 * audit layers can preserve traceability across market sources and coverage logic.
 */

/**
 * Period granularity supported by the institutional analysis contract.
 */
export type InstitutionalAnalysisPeriod =
  | "intraday"
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly";

/**
 * Investment horizon used to frame the institutional analysis.
 */
export type InstitutionalHorizon = "short" | "medium" | "long";

/**
 * Liquidity bucket used by the institutional analysis contract.
 */
export type InstitutionalLiquidity = "low" | "medium" | "high";

/**
 * Market flow snapshot for institutional analysis.
 */
export interface InstitutionalFlowSnapshot {
  /**
   * Net inflow amount for the period under analysis.
   */
  inflows: number;

  /**
   * Net outflow amount for the period under analysis.
   */
  outflows: number;

  /**
   * Timestamp that identifies the source snapshot for the flow data.
   */
  asOf: string;
}

/**
 * Positions snapshot used to represent open exposure in the institutional model.
 */
export interface InstitutionalOpenPositionsSnapshot {
  /**
   * Total open positions detected in the source set.
   */
  count: number;

  /**
   * Optional aggregate notional associated with the open positions.
   */
  notional?: number;
}

/**
 * Canonical input contract for institutional analysis.
 *
 * Fields intentionally cover the full TEAM-05 scope: ticker/instrument, strike,
 * analysis period, volume, liquidity, horizon, fund participation, flows and
 * open positions.
 */
export interface InstitutionalAnalysisContract {
  /**
   * Unique analysis request identifier.
   */
  analysisId: string;

  /**
   * Ticker or instrument identifier under analysis.
   */
  ticker: string;

  /**
   * Optional human-readable instrument name.
   */
  instrument?: string;

  /**
   * Reference strike used by the analysis, when the request is option-aware.
   */
  strike?: number;

  /**
   * Period granularity for the request.
   */
  period: InstitutionalAnalysisPeriod;

  /**
   * Observed or requested volume for the period.
   */
  volume: number;

  /**
   * Liquidity bucket for the underlying instrument.
   */
  liquidity: InstitutionalLiquidity;

  /**
   * Time horizon used to contextualize the analysis.
   */
  horizon: InstitutionalHorizon;

  /**
   * Percentage of the float or free shares controlled by funds.
   */
  fundsOwnershipPct: number;

  /**
   * Snapshot of positive and negative flow information.
   */
  flows: InstitutionalFlowSnapshot;

  /**
   * Snapshot of open positions detected in the source data.
   */
  openPositions: InstitutionalOpenPositionsSnapshot;

  /**
   * Optional source system identifiers used to build the request.
   */
  sourceIds?: string[];

  /**
   * Timestamp when the request was created.
   */
  requestedAt: string;
}

/**
 * Checks whether a value is a non-empty string.
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Checks whether a value is a finite number.
 */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Validates the flow snapshot payload.
 */
export function isInstitutionalFlowSnapshot(value: unknown): value is InstitutionalFlowSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const snapshot = value as InstitutionalFlowSnapshot;
  return (
    isFiniteNumber(snapshot.inflows) &&
    isFiniteNumber(snapshot.outflows) &&
    isNonEmptyString(snapshot.asOf)
  );
}

/**
 * Validates the open positions snapshot payload.
 */
export function isInstitutionalOpenPositionsSnapshot(
  value: unknown
): value is InstitutionalOpenPositionsSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const snapshot = value as InstitutionalOpenPositionsSnapshot;
  return isFiniteNumber(snapshot.count) && Number.isInteger(snapshot.count) && (snapshot.notional === undefined || isFiniteNumber(snapshot.notional));
}

/**
 * Validates an institutional analysis contract payload.
 */
export function isInstitutionalAnalysisContract(value: unknown): value is InstitutionalAnalysisContract {
  if (!value || typeof value !== "object") {
    return false;
  }

  const contract = value as InstitutionalAnalysisContract;
  const supportedPeriods: InstitutionalAnalysisPeriod[] = ["intraday", "daily", "weekly", "monthly", "quarterly"];
  const supportedHorizons: InstitutionalHorizon[] = ["short", "medium", "long"];
  const supportedLiquidity: InstitutionalLiquidity[] = ["low", "medium", "high"];

  return (
    isNonEmptyString(contract.analysisId) &&
    isNonEmptyString(contract.ticker) &&
    (contract.instrument === undefined || isNonEmptyString(contract.instrument)) &&
    (contract.strike === undefined || isFiniteNumber(contract.strike)) &&
    supportedPeriods.includes(contract.period) &&
    isFiniteNumber(contract.volume) &&
    supportedLiquidity.includes(contract.liquidity) &&
    supportedHorizons.includes(contract.horizon) &&
    isFiniteNumber(contract.fundsOwnershipPct) &&
    contract.fundsOwnershipPct >= 0 &&
    contract.fundsOwnershipPct <= 100 &&
    isInstitutionalFlowSnapshot(contract.flows) &&
    isInstitutionalOpenPositionsSnapshot(contract.openPositions) &&
    (contract.sourceIds === undefined || (Array.isArray(contract.sourceIds) && contract.sourceIds.every(isNonEmptyString))) &&
    isNonEmptyString(contract.requestedAt)
  );
}

/**
 * Normalizes an institutional analysis contract after validation.
 */
export function createInstitutionalAnalysisContract(
  payload: InstitutionalAnalysisContract
): InstitutionalAnalysisContract {
  if (!isInstitutionalAnalysisContract(payload)) {
    throw new Error("Invalid institutional analysis contract payload.");
  }

  return payload;
}
