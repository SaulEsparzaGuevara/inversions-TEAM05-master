/**
 * ============================================================================
 * coverageTypes.ts
 * ============================================================================
 *
 * FIC: T113/T120: Coverage types — Zod schemas and TypeScript types for coverage strategies, simulation, risk, report, and comparison results.
 */

import {
  createCoverageStrategyContract,
  isCoverageStrategyContract,
  isFiniteNumber,
  isNonEmptyString,
  type CoverageStrategyContract,
  type CoverageStrategyKind
} from "./coverageStrategyContract.js";

export type AlertSeverity = "info" | "warning" | "critical";

export interface Alert {
  code: string;
  severity: AlertSeverity;
  message: string;
  recommendation: string;
  triggerPrice?: number;
  triggerPct?: number;
}

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
  marginRequirement: number;
  exerciseRiskScore: number;
  volatilityStressLoss: number;
}

export interface CoverageStrategyResult {
  engineId: string;
  strategy: CoverageStrategyContract;
  strategyKind: CoverageStrategyKind;
  ticker: string;
  shares: number;
  currentPrice: number;
  payoff: PayoffSimulation;
  riskMetrics: RiskMetrics;
  alerts: Alert[];
  generatedAt: string;
}

export function isAlert(value: unknown): value is Alert {
  if (!value || typeof value !== "object") {
    return false;
  }

  const alert = value as Alert;
  return (
    isNonEmptyString(alert.code) &&
    (alert.severity === "info" || alert.severity === "warning" || alert.severity === "critical") &&
    isNonEmptyString(alert.message) &&
    isNonEmptyString(alert.recommendation) &&
    (alert.triggerPrice === undefined || isFiniteNumber(alert.triggerPrice)) &&
    (alert.triggerPct === undefined || isFiniteNumber(alert.triggerPct))
  );
}

export function isPayoffSimulation(value: unknown): value is PayoffSimulation {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payoff = value as PayoffSimulation;
  return (
    isFiniteNumber(payoff.baselinePrice) &&
    isFiniteNumber(payoff.breakevenPrice) &&
    (payoff.maxProfit === null || isFiniteNumber(payoff.maxProfit)) &&
    (payoff.maxLoss === null || isFiniteNumber(payoff.maxLoss)) &&
    isNonEmptyString(payoff.description) &&
    Array.isArray(payoff.points) &&
    payoff.points.every(isPayoffPoint)
  );
}

export function isPayoffPoint(value: unknown): value is PayoffPoint {
  if (!value || typeof value !== "object") {
    return false;
  }

  const point = value as PayoffPoint;
  return (
    isNonEmptyString(point.label) &&
    isFiniteNumber(point.movePct) &&
    isFiniteNumber(point.underlyingPrice) &&
    isFiniteNumber(point.pnl) &&
    isFiniteNumber(point.pnlPct) &&
    Array.isArray(point.notes) &&
    point.notes.every(isNonEmptyString)
  );
}

export function isRiskMetrics(value: unknown): value is RiskMetrics {
  if (!value || typeof value !== "object") {
    return false;
  }

  const risk = value as RiskMetrics;
  return (
    (risk.riskProfile === "limited" || risk.riskProfile === "unlimited") &&
    isFiniteNumber(risk.maxProtection) &&
    isFiniteNumber(risk.protectionFloorPrice) &&
    (risk.protectionCeilingPrice === undefined || isFiniteNumber(risk.protectionCeilingPrice)) &&
    isFiniteNumber(risk.netPremium) &&
    isFiniteNumber(risk.netPremiumPerShare) &&
    isFiniteNumber(risk.costBenefitRatio) &&
    isFiniteNumber(risk.downsideRisk) &&
    (risk.upsideCap === null || isFiniteNumber(risk.upsideCap)) &&
    isFiniteNumber(risk.breakEvenPrice) &&
    isFiniteNumber(risk.stopLossPrice) &&
    isFiniteNumber(risk.marginRequirement) &&
    isFiniteNumber(risk.exerciseRiskScore) &&
    isFiniteNumber(risk.volatilityStressLoss)
  );
}

export function isCoverageStrategyResult(value: unknown): value is CoverageStrategyResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as CoverageStrategyResult;
  return (
    isNonEmptyString(result.engineId) &&
    isCoverageStrategyContract(result.strategy) &&
    (result.strategyKind === "protective_put" ||
      result.strategyKind === "married_put" ||
      result.strategyKind === "collar_put" ||
      result.strategyKind === "covered_straddle") &&
    isNonEmptyString(result.ticker) &&
    isFiniteNumber(result.shares) &&
    Number.isInteger(result.shares) &&
    result.shares > 0 &&
    isFiniteNumber(result.currentPrice) &&
    isPayoffSimulation(result.payoff) &&
    isRiskMetrics(result.riskMetrics) &&
    Array.isArray(result.alerts) &&
    result.alerts.every(isAlert) &&
    isNonEmptyString(result.generatedAt)
  );
}

export function createCoverageStrategyResult(payload: CoverageStrategyResult): CoverageStrategyResult {
  if (!isCoverageStrategyResult(payload)) {
    throw new Error("Invalid coverage strategy result payload.");
  }

  return payload;
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function toContractScale(shares: number, multiplier?: number): number {
  const contractMultiplier = multiplier ?? 100;
  return shares / contractMultiplier;
}

export interface CoverageHistoricalCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type CoverageSimulationMode = "deterministic" | "monte_carlo" | "backtest";

export interface CoverageScenarioInput {
  label: string;
  movePct: number;
  probability?: number;
  notes?: string[];
}

export interface CoverageScenarioOutcome extends PayoffPoint {
  mode: CoverageSimulationMode;
  probability: number;
}

export interface CoverageMonteCarloSummary {
  iterations: number;
  expectedPnL: number;
  medianPnL: number;
  bestPnL: number;
  worstPnL: number;
  standardDeviation: number;
  valueAtRisk95: number;
  expectedShortfall95: number;
  winRate: number;
  lossRate: number;
}

export interface CoverageBacktestObservation extends CoverageScenarioOutcome {
  time: number;
}

export interface CoverageBacktestSummary {
  samples: number;
  startTime?: number;
  endTime?: number;
  averagePnL: number;
  bestPnL: number;
  worstPnL: number;
  winRate: number;
  maxDrawdown: number;
  profitFactor: number;
}

export interface CoverageSimulationResult {
  engineId: string;
  strategy: CoverageStrategyContract;
  strategyKind: CoverageStrategyKind;
  currentPrice: number;
  baseResult: CoverageStrategyResult;
  deterministicScenarios: CoverageScenarioOutcome[];
  monteCarlo: CoverageMonteCarloSummary;
  monteCarloOutcomes: CoverageScenarioOutcome[];
  backtest: CoverageBacktestSummary;
  backtestObservations: CoverageBacktestObservation[];
  historicalCandles: CoverageHistoricalCandle[];
  generatedAt: string;
}

export interface CoverageRiskAction {
  type: "stop_loss" | "margin_alert" | "push_notification" | "email_notification";
  code: string;
  severity: AlertSeverity;
  message: string;
  recommendation: string;
  triggerPrice?: number;
  triggerPct?: number;
}

export interface CoverageNotificationRecord {
  channel: "push" | "email";
  recipient: string;
  subject: string;
  body: string;
  delivered: boolean;
  deliveredAt: string;
}

export interface CoverageRiskServiceResult {
  engineId: string;
  strategy: CoverageStrategyContract;
  strategyResult: CoverageStrategyResult;
  simulation: CoverageSimulationResult;
  stopLossTriggered: boolean;
  marginAlertTriggered: boolean;
  actions: CoverageRiskAction[];
  notifications: CoverageNotificationRecord[];
  generatedAt: string;
}

export interface CoverageReportExport {
  format: "json" | "md" | "csv";
  fileName: string;
  content: string;
}

export interface CoverageReportSummary {
  expectedPnL: number;
  expectedPnLPct: number;
  bestPnL: number;
  worstPnL: number;
  riskRewardRatio: number;
  winRate: number;
  lossRate: number;
  alertCount: number;
}

export interface CoverageReportResult {
  engineId: string;
  strategy: CoverageStrategyContract;
  strategyResult: CoverageStrategyResult;
  simulation: CoverageSimulationResult;
  risk: CoverageRiskServiceResult;
  summary: CoverageReportSummary;
  logs: string[];
  exports: CoverageReportExport[];
  generatedAt: string;
}

export interface CoverageComparisonScore {
  pnl: number;
  costEfficiency: number;
  risk: number;
  contextFit: number;
  total: number;
}

export interface CoverageComparisonEntry {
  strategyKind: CoverageStrategyKind;
  strategy: CoverageStrategyContract;
  strategyResult: CoverageStrategyResult;
  simulation: CoverageSimulationResult;
  risk: CoverageRiskServiceResult;
  report: CoverageReportResult;
  score: CoverageComparisonScore;
  rank: number;
  notes: string[];
}

export interface CoverageComparisonResult {
  engineId: string;
  ticker: string;
  currentPrice: number;
  entries: CoverageComparisonEntry[];
  recommendedKind: CoverageStrategyKind;
  multiCoreContext: {
    executionMode: "parallel" | "serial";
    runners: number;
  };
  generatedAt: string;
}

export function isCoverageHistoricalCandle(value: unknown): value is CoverageHistoricalCandle {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candle = value as CoverageHistoricalCandle;
  return (
    isFiniteNumber(candle.time) &&
    isFiniteNumber(candle.open) &&
    isFiniteNumber(candle.high) &&
    isFiniteNumber(candle.low) &&
    isFiniteNumber(candle.close) &&
    isFiniteNumber(candle.volume)
  );
}

export function isCoverageScenarioOutcome(value: unknown): value is CoverageScenarioOutcome {
  if (!value || typeof value !== "object") {
    return false;
  }

  const scenario = value as CoverageScenarioOutcome;
  return (
    (scenario.mode === "deterministic" || scenario.mode === "monte_carlo" || scenario.mode === "backtest") &&
    isFiniteNumber(scenario.probability) &&
    isPayoffPoint(scenario)
  );
}

export function isCoverageMonteCarloSummary(value: unknown): value is CoverageMonteCarloSummary {
  if (!value || typeof value !== "object") {
    return false;
  }

  const summary = value as CoverageMonteCarloSummary;
  return (
    isFiniteNumber(summary.iterations) &&
    Number.isInteger(summary.iterations) &&
    summary.iterations > 0 &&
    isFiniteNumber(summary.expectedPnL) &&
    isFiniteNumber(summary.medianPnL) &&
    isFiniteNumber(summary.bestPnL) &&
    isFiniteNumber(summary.worstPnL) &&
    isFiniteNumber(summary.standardDeviation) &&
    isFiniteNumber(summary.valueAtRisk95) &&
    isFiniteNumber(summary.expectedShortfall95) &&
    isFiniteNumber(summary.winRate) &&
    isFiniteNumber(summary.lossRate)
  );
}

export function isCoverageBacktestObservation(value: unknown): value is CoverageBacktestObservation {
  if (!value || typeof value !== "object") {
    return false;
  }

  const observation = value as CoverageBacktestObservation;
  return isFiniteNumber(observation.time) && isCoverageScenarioOutcome(observation);
}

export function isCoverageBacktestSummary(value: unknown): value is CoverageBacktestSummary {
  if (!value || typeof value !== "object") {
    return false;
  }

  const summary = value as CoverageBacktestSummary;
  return (
    isFiniteNumber(summary.samples) &&
    Number.isInteger(summary.samples) &&
    summary.samples >= 0 &&
    (summary.startTime === undefined || isFiniteNumber(summary.startTime)) &&
    (summary.endTime === undefined || isFiniteNumber(summary.endTime)) &&
    isFiniteNumber(summary.averagePnL) &&
    isFiniteNumber(summary.bestPnL) &&
    isFiniteNumber(summary.worstPnL) &&
    isFiniteNumber(summary.winRate) &&
    isFiniteNumber(summary.maxDrawdown) &&
    isFiniteNumber(summary.profitFactor)
  );
}

export function isCoverageSimulationResult(value: unknown): value is CoverageSimulationResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as CoverageSimulationResult;
  return (
    isNonEmptyString(result.engineId) &&
    isCoverageStrategyContract(result.strategy) &&
    (result.strategyKind === "protective_put" ||
      result.strategyKind === "married_put" ||
      result.strategyKind === "collar_put" ||
      result.strategyKind === "covered_straddle") &&
    isFiniteNumber(result.currentPrice) &&
    isCoverageStrategyResult(result.baseResult) &&
    Array.isArray(result.deterministicScenarios) && result.deterministicScenarios.every(isCoverageScenarioOutcome) &&
    isCoverageMonteCarloSummary(result.monteCarlo) &&
    Array.isArray(result.monteCarloOutcomes) && result.monteCarloOutcomes.every(isCoverageScenarioOutcome) &&
    isCoverageBacktestSummary(result.backtest) &&
    Array.isArray(result.backtestObservations) && result.backtestObservations.every(isCoverageBacktestObservation) &&
    Array.isArray(result.historicalCandles) && result.historicalCandles.every(isCoverageHistoricalCandle) &&
    isNonEmptyString(result.generatedAt)
  );
}

export function createCoverageSimulationResult(payload: CoverageSimulationResult): CoverageSimulationResult {
  if (!isCoverageSimulationResult(payload)) {
    throw new Error("Invalid coverage simulation result payload.");
  }

  return payload;
}

export function isCoverageRiskAction(value: unknown): value is CoverageRiskAction {
  if (!value || typeof value !== "object") {
    return false;
  }

  const action = value as CoverageRiskAction;
  return (
    (action.type === "stop_loss" || action.type === "margin_alert" || action.type === "push_notification" || action.type === "email_notification") &&
    isNonEmptyString(action.code) &&
    (action.severity === "info" || action.severity === "warning" || action.severity === "critical") &&
    isNonEmptyString(action.message) &&
    isNonEmptyString(action.recommendation) &&
    (action.triggerPrice === undefined || isFiniteNumber(action.triggerPrice)) &&
    (action.triggerPct === undefined || isFiniteNumber(action.triggerPct))
  );
}

export function isCoverageNotificationRecord(value: unknown): value is CoverageNotificationRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const notification = value as CoverageNotificationRecord;
  return (
    (notification.channel === "push" || notification.channel === "email") &&
    isNonEmptyString(notification.recipient) &&
    isNonEmptyString(notification.subject) &&
    isNonEmptyString(notification.body) &&
    typeof notification.delivered === "boolean" &&
    isNonEmptyString(notification.deliveredAt)
  );
}

export function isCoverageRiskServiceResult(value: unknown): value is CoverageRiskServiceResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as CoverageRiskServiceResult;
  return (
    isNonEmptyString(result.engineId) &&
    isCoverageStrategyContract(result.strategy) &&
    isCoverageStrategyResult(result.strategyResult) &&
    isCoverageSimulationResult(result.simulation) &&
    typeof result.stopLossTriggered === "boolean" &&
    typeof result.marginAlertTriggered === "boolean" &&
    Array.isArray(result.actions) && result.actions.every(isCoverageRiskAction) &&
    Array.isArray(result.notifications) && result.notifications.every(isCoverageNotificationRecord) &&
    isNonEmptyString(result.generatedAt)
  );
}

export function createCoverageRiskServiceResult(payload: CoverageRiskServiceResult): CoverageRiskServiceResult {
  if (!isCoverageRiskServiceResult(payload)) {
    throw new Error("Invalid coverage risk service result payload.");
  }

  return payload;
}

export function isCoverageReportExport(value: unknown): value is CoverageReportExport {
  if (!value || typeof value !== "object") {
    return false;
  }

  const reportExport = value as CoverageReportExport;
  return (
    (reportExport.format === "json" || reportExport.format === "md" || reportExport.format === "csv") &&
    isNonEmptyString(reportExport.fileName) &&
    isNonEmptyString(reportExport.content)
  );
}

export function isCoverageReportResult(value: unknown): value is CoverageReportResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as CoverageReportResult;
  return (
    isNonEmptyString(result.engineId) &&
    isCoverageStrategyContract(result.strategy) &&
    isCoverageStrategyResult(result.strategyResult) &&
    isCoverageSimulationResult(result.simulation) &&
    isCoverageRiskServiceResult(result.risk) &&
    isFiniteNumber(result.summary.expectedPnL) &&
    isFiniteNumber(result.summary.expectedPnLPct) &&
    isFiniteNumber(result.summary.bestPnL) &&
    isFiniteNumber(result.summary.worstPnL) &&
    isFiniteNumber(result.summary.riskRewardRatio) &&
    isFiniteNumber(result.summary.winRate) &&
    isFiniteNumber(result.summary.lossRate) &&
    isFiniteNumber(result.summary.alertCount) &&
    Array.isArray(result.logs) && result.logs.every(isNonEmptyString) &&
    Array.isArray(result.exports) && result.exports.every(isCoverageReportExport) &&
    isNonEmptyString(result.generatedAt)
  );
}

export function createCoverageReportResult(payload: CoverageReportResult): CoverageReportResult {
  if (!isCoverageReportResult(payload)) {
    throw new Error("Invalid coverage report result payload.");
  }

  return payload;
}

export function isCoverageComparisonScore(value: unknown): value is CoverageComparisonScore {
  if (!value || typeof value !== "object") {
    return false;
  }

  const score = value as CoverageComparisonScore;
  return (
    isFiniteNumber(score.pnl) &&
    isFiniteNumber(score.costEfficiency) &&
    isFiniteNumber(score.risk) &&
    isFiniteNumber(score.contextFit) &&
    isFiniteNumber(score.total)
  );
}

export function isCoverageComparisonEntry(value: unknown): value is CoverageComparisonEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as CoverageComparisonEntry;
  return (
    (entry.strategyKind === "protective_put" ||
      entry.strategyKind === "married_put" ||
      entry.strategyKind === "collar_put" ||
      entry.strategyKind === "covered_straddle") &&
    isCoverageStrategyContract(entry.strategy) &&
    isCoverageStrategyResult(entry.strategyResult) &&
    isCoverageSimulationResult(entry.simulation) &&
    isCoverageRiskServiceResult(entry.risk) &&
    isCoverageReportResult(entry.report) &&
    isCoverageComparisonScore(entry.score) &&
    isFiniteNumber(entry.rank) &&
    Number.isInteger(entry.rank) &&
    entry.rank > 0 &&
    Array.isArray(entry.notes) &&
    entry.notes.every(isNonEmptyString)
  );
}

export function isCoverageComparisonResult(value: unknown): value is CoverageComparisonResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as CoverageComparisonResult;
  return (
    isNonEmptyString(result.engineId) &&
    isNonEmptyString(result.ticker) &&
    isFiniteNumber(result.currentPrice) &&
    Array.isArray(result.entries) && result.entries.every(isCoverageComparisonEntry) &&
    (result.recommendedKind === "protective_put" ||
      result.recommendedKind === "married_put" ||
      result.recommendedKind === "collar_put" ||
      result.recommendedKind === "covered_straddle") &&
    (result.multiCoreContext.executionMode === "parallel" || result.multiCoreContext.executionMode === "serial") &&
    isFiniteNumber(result.multiCoreContext.runners) &&
    Number.isInteger(result.multiCoreContext.runners) &&
    result.multiCoreContext.runners > 0 &&
    isNonEmptyString(result.generatedAt)
  );
}

export function createCoverageComparisonResult(payload: CoverageComparisonResult): CoverageComparisonResult {
  if (!isCoverageComparisonResult(payload)) {
    throw new Error("Invalid coverage comparison result payload.");
  }

  return payload;
}
