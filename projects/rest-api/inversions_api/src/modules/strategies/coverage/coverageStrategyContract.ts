/**
 * T113: Coverage strategy unified input contract.
 * ==============================================
 * Shared parameter model for Protective Put, Married Put, Collar Put and
 * Covered Straddle workflows in TEAM-05.
 */

/**
 * Supported strategy kinds under the TEAM-05 coverage model.
 */
export type CoverageStrategyKind =
  | "protective_put"
  | "married_put"
  | "collar_put"
  | "covered_straddle";

/**
 * Option leg side.
 */
export type CoverageOptionSide = "long" | "short";

/**
 * Option leg type.
 */
export type CoverageOptionType = "call" | "put";

/**
 * Single option leg used by a coverage strategy.
 */
export interface CoverageOptionLeg {
  /**
   * Leg side: long or short.
   */
  side: CoverageOptionSide;

  /**
   * Option type.
   */
  type: CoverageOptionType;

  /**
   * Strike price for the leg.
   */
  strike: number;

  /**
   * Option premium paid or received.
   */
  premium: number;

  /**
   * Expiration date in ISO-8601 format.
   */
  expiration: string;

  /**
   * Optional contract multiplier; defaults to 100 if omitted by consumers.
   */
  multiplier?: number;
}

/**
 * Unified input contract for all TEAM-05 coverage strategies.
 */
export interface CoverageStrategyContract {
  /**
   * Unique strategy request identifier.
   */
  strategyId: string;

  /**
   * Strategy family identifier.
   */
  kind: CoverageStrategyKind;

  /**
   * Underlying ticker or instrument.
   */
  ticker: string;

  /**
   * Number of shares covered by the strategy.
   */
  shares: number;

  /**
   * Optional reference price for the underlying.
   */
  underlyingPrice?: number;

  /**
   * Strategy legs used to build the payoff profile.
   */
  legs: CoverageOptionLeg[];

  /**
   * Capital allocated to the strategy.
   */
  capital: number;

  /**
   * Maximum tolerated risk as a normalized percentage from 0 to 1.
   */
  riskTolerancePct: number;

  /**
   * Optional target upside or downside in percentage terms.
   */
  targetMovePct?: number;

  /**
   * Optional scenario name used in simulations or reports.
   */
  scenario?: string;

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
 * Validates a coverage option leg.
 */
export function isCoverageOptionLeg(value: unknown): value is CoverageOptionLeg {
  if (!value || typeof value !== "object") {
    return false;
  }

  const leg = value as CoverageOptionLeg;
  return (
    (leg.side === "long" || leg.side === "short") &&
    (leg.type === "call" || leg.type === "put") &&
    isFiniteNumber(leg.strike) &&
    isFiniteNumber(leg.premium) &&
    isNonEmptyString(leg.expiration) &&
    (leg.multiplier === undefined || (isFiniteNumber(leg.multiplier) && Number.isInteger(leg.multiplier) && leg.multiplier > 0))
  );
}

/**
 * Validates a coverage strategy contract.
 */
export function isCoverageStrategyContract(value: unknown): value is CoverageStrategyContract {
  if (!value || typeof value !== "object") {
    return false;
  }

  const contract = value as CoverageStrategyContract;
  const supportedKinds: CoverageStrategyKind[] = [
    "protective_put",
    "married_put",
    "collar_put",
    "covered_straddle"
  ];

  return (
    isNonEmptyString(contract.strategyId) &&
    supportedKinds.includes(contract.kind) &&
    isNonEmptyString(contract.ticker) &&
    isFiniteNumber(contract.shares) &&
    Number.isInteger(contract.shares) &&
    contract.shares > 0 &&
    (contract.underlyingPrice === undefined || isFiniteNumber(contract.underlyingPrice)) &&
    Array.isArray(contract.legs) && contract.legs.length > 0 && contract.legs.every(isCoverageOptionLeg) &&
    isFiniteNumber(contract.capital) &&
    contract.capital >= 0 &&
    isFiniteNumber(contract.riskTolerancePct) &&
    contract.riskTolerancePct >= 0 &&
    contract.riskTolerancePct <= 1 &&
    (contract.targetMovePct === undefined || isFiniteNumber(contract.targetMovePct)) &&
    (contract.scenario === undefined || isNonEmptyString(contract.scenario)) &&
    isNonEmptyString(contract.requestedAt)
  );
}

/**
 * Creates a validated coverage strategy contract.
 */
export function createCoverageStrategyContract(payload: CoverageStrategyContract): CoverageStrategyContract {
  if (!isCoverageStrategyContract(payload)) {
    throw new Error("Invalid coverage strategy contract payload.");
  }

  return payload;
}
