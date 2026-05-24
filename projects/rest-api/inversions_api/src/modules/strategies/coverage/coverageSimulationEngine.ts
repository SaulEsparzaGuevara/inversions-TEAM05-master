/**
 * ============================================================================
 * coverageSimulationEngine.ts
 * ============================================================================
 *
 * FIC: T117: Coverage Simulation Engine — Monte Carlo (10K iterations) and backtest with deterministic scenarios, VaR, Expected Shortfall.
 */

import { CollarEngine } from "./collarEngine.js";
import { CoveredStraddleEngine } from "./coveredStraddleEngine.js";
import { ProtectivePutEngine } from "./protectivePutEngine.js";
import { createCoverageStrategyContract, type CoverageStrategyContract } from "./coverageStrategyContract.js";
import {
  clamp01,
  createCoverageSimulationResult,
  round,
  toContractScale,
  type CoverageBacktestObservation,
  type CoverageBacktestSummary,
  type CoverageHistoricalCandle,
  type CoverageMonteCarloSummary,
  type CoverageScenarioInput,
  type CoverageScenarioOutcome,
  type CoverageSimulationResult,
  type CoverageStrategyResult
} from "./coverageTypes.js";

export interface CoverageSimulationEngineOptions {
  monteCarloIterations?: number;
  deterministicScenarios?: CoverageScenarioInput[];
  historicalCandles?: CoverageHistoricalCandle[];
  randomSeed?: number;
}

interface ScenarioOutcomeSeed extends CoverageScenarioInput {
  mode: "deterministic" | "monte_carlo" | "backtest";
  probability: number;
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values: number[]): number {
  if (values.length < 2) {
    return 0;
  }

  const mean = average(values);
  const variance = average(values.map((value) => (value - mean) ** 2));
  return Math.sqrt(variance);
}

function percentile(values: number[], percentileValue: number): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * percentileValue)));
  return sorted[index];
}

function clampMovePct(value: number): number {
  return Math.max(-0.95, Math.min(0.95, value));
}

function createSeededRandom(seed: number): () => number {
  let state = Math.floor(Math.abs(seed)) || 1;

  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return state / 4_294_967_296;
  };
}

function createGaussian(random: () => number): number {
  let u = 0;
  let v = 0;

  while (u === 0) {
    u = random();
  }

  while (v === 0) {
    v = random();
  }

  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * FIC: Coverage simulation engine with deterministic scenarios, Monte Carlo
 * and backtesting (EN).
 * FIC: Motor de simulacion de coberturas con escenarios deterministas,
 * Monte Carlo y backtesting (ES).
 */
export class CoverageSimulationEngine {
  private readonly monteCarloIterations: number;

  constructor(options: CoverageSimulationEngineOptions = {}) {
    this.monteCarloIterations = Math.max(32, options.monteCarloIterations ?? 256);
  }

  /**
   * FIC: Analyze a coverage contract and generate simulation artifacts (EN).
   * FIC: Analiza un contrato de cobertura y genera artefactos de simulacion (ES).
   */
  analyze(request: CoverageStrategyContract, options: CoverageSimulationEngineOptions = {}): CoverageSimulationResult {
    const strategy = createCoverageStrategyContract(request);
    const currentPrice = this.resolveCurrentPrice(strategy);
    const baseResult = this.analyzeStrategy(strategy);
    const historicalCandles = this.normalizeCandles(options.historicalCandles ?? []);
    const scenarios = this.buildScenarioInputs(strategy, options.deterministicScenarios);
    const deterministicScenarios = scenarios.map((scenario) =>
      this.simulateScenario(strategy, currentPrice, scenario.movePct, "deterministic", scenario.label, scenario.probability, scenario.notes)
    );
    const monteCarloOutcomes = this.runMonteCarlo(strategy, currentPrice, historicalCandles, options.randomSeed ?? this.seedFromStrategy(strategy));
    const monteCarlo = this.summarizeMonteCarlo(monteCarloOutcomes);
    const backtestObservations = this.runBacktest(strategy, currentPrice, historicalCandles);
    const backtest = this.summarizeBacktest(backtestObservations);

    return createCoverageSimulationResult({
      engineId: "coverage_simulation_engine",
      strategy,
      strategyKind: strategy.kind,
      currentPrice: round(currentPrice, 2),
      baseResult,
      deterministicScenarios,
      monteCarlo,
      monteCarloOutcomes,
      backtest,
      backtestObservations,
      historicalCandles,
      generatedAt: new Date().toISOString()
    });
  }

  private analyzeStrategy(strategy: CoverageStrategyContract): CoverageStrategyResult {
    switch (strategy.kind) {
      case "protective_put":
      case "married_put":
        return new ProtectivePutEngine().analyze(strategy);
      case "collar_put":
        return new CollarEngine().analyze(strategy);
      case "covered_straddle":
        return new CoveredStraddleEngine().analyze(strategy);
    }
  }

  private resolveCurrentPrice(strategy: CoverageStrategyContract): number {
    if (strategy.underlyingPrice !== undefined) {
      return Math.max(0.01, strategy.underlyingPrice);
    }

    const strikes = strategy.legs.map((leg) => leg.strike);
    return Math.max(0.01, average(strikes.length ? strikes : [strategy.capital / Math.max(1, strategy.shares)]));
  }

  private buildScenarioInputs(strategy: CoverageStrategyContract, customScenarios?: CoverageScenarioInput[]): ScenarioOutcomeSeed[] {
    const fallbackScenarios: CoverageScenarioInput[] = customScenarios ?? strategy.targetMovePct !== undefined
      ? [
          { label: "deep_drawdown", movePct: -0.35, probability: 0.08, notes: ["stress_downside"] },
          { label: "moderate_drawdown", movePct: -0.18, probability: 0.12, notes: ["downside"] },
          { label: "flat", movePct: 0, probability: 0.22, notes: ["baseline"] },
          { label: "target_move", movePct: strategy.targetMovePct ?? 0.12, probability: 0.18, notes: ["target"] },
          { label: "upside_extension", movePct: 0.24, probability: 0.14, notes: ["upside"] },
          { label: "breakout", movePct: 0.4, probability: 0.1, notes: ["breakout"] }
        ]
      : [
          { label: "deep_drawdown", movePct: -0.35, probability: 0.1, notes: ["stress_downside"] },
          { label: "moderate_drawdown", movePct: -0.18, probability: 0.14, notes: ["downside"] },
          { label: "flat", movePct: 0, probability: 0.26, notes: ["baseline"] },
          { label: "mild_upside", movePct: 0.08, probability: 0.18, notes: ["upside"] },
          { label: "target_move", movePct: strategy.targetMovePct ?? 0.12, probability: 0.16, notes: ["target"] },
          { label: "breakout", movePct: 0.3, probability: 0.1, notes: ["breakout"] }
        ];

    const totalProbability = fallbackScenarios.reduce((sum, scenario) => sum + (scenario.probability ?? 0), 0) || fallbackScenarios.length;

    return fallbackScenarios.map((scenario) => ({
      label: scenario.label,
      movePct: scenario.movePct,
      notes: scenario.notes ?? [],
      mode: "deterministic" as const,
      probability: (scenario.probability ?? 1 / fallbackScenarios.length) / totalProbability * fallbackScenarios.length
    }));
  }

  private simulateScenario(
    strategy: CoverageStrategyContract,
    currentPrice: number,
    movePct: number,
    mode: "deterministic" | "monte_carlo" | "backtest",
    label: string,
    probability: number,
    notes: string[] = []
  ): CoverageScenarioOutcome {
    const scenarioPrice = Math.max(0.01, currentPrice * (1 + movePct));
    const pnl = this.calculatePnL(strategy, currentPrice, scenarioPrice);

    return {
      label,
      mode,
      probability: round(clamp01(probability), 4),
      movePct: round(movePct, 4),
      underlyingPrice: round(scenarioPrice, 2),
      pnl: round(pnl, 2),
      pnlPct: round((pnl / Math.max(1, strategy.capital)) * 100, 2),
      notes
    };
  }

  private calculatePnL(strategy: CoverageStrategyContract, currentPrice: number, scenarioPrice: number): number {
    const stockPnL = (scenarioPrice - currentPrice) * strategy.shares;
    const contractScale = toContractScale(strategy.shares, strategy.legs[0]?.multiplier);

    const optionPremiumCashFlow = strategy.legs.reduce((sum, leg) => {
      const signedPremium = leg.side === "long" ? -leg.premium : leg.premium;
      return sum + signedPremium * toContractScale(strategy.shares, leg.multiplier);
    }, 0);

    const optionPayoff = strategy.legs.reduce((sum, leg) => {
      if (leg.type === "call") {
        const payoff = Math.max(0, scenarioPrice - leg.strike);
        return sum + (leg.side === "long" ? payoff : -payoff) * toContractScale(strategy.shares, leg.multiplier);
      }

      const payoff = Math.max(0, leg.strike - scenarioPrice);
      return sum + (leg.side === "long" ? payoff : -payoff) * toContractScale(strategy.shares, leg.multiplier);
    }, 0);

    return stockPnL + optionPremiumCashFlow + optionPayoff * Math.sign(contractScale || 1);
  }

  private runMonteCarlo(
    strategy: CoverageStrategyContract,
    currentPrice: number,
    historicalCandles: CoverageHistoricalCandle[],
    seed: number
  ): CoverageScenarioOutcome[] {
    const iterations = this.monteCarloIterations;
    const random = createSeededRandom(seed);
    const sigma = this.estimateVolatility(strategy, historicalCandles);
    const meanShift = strategy.targetMovePct ? strategy.targetMovePct / 8 : 0;

    const outcomes: CoverageScenarioOutcome[] = [];
    for (let index = 0; index < iterations; index += 1) {
      const movePct = clampMovePct(meanShift + createGaussian(random) * sigma);
      outcomes.push(
        this.simulateScenario(
          strategy,
          currentPrice,
          movePct,
          "monte_carlo",
          `mc_${index + 1}`,
          1 / iterations,
          [movePct >= 0 ? "positive_shock" : "negative_shock"]
        )
      );
    }

    return outcomes;
  }

  private estimateVolatility(strategy: CoverageStrategyContract, historicalCandles: CoverageHistoricalCandle[]): number {
    const returns = historicalCandles
      .slice(1)
      .map((candle, index) => {
        const previous = historicalCandles[index].close;
        if (previous <= 0 || candle.close <= 0) {
          return 0;
        }

        return Math.log(candle.close / previous);
      })
      .filter((value) => Number.isFinite(value));

    if (returns.length === 0) {
      const targetMove = Math.abs(strategy.targetMovePct ?? 0.12);
      return Math.max(0.08, targetMove / 1.6);
    }

    return Math.max(0.05, standardDeviation(returns));
  }

  private runBacktest(
    strategy: CoverageStrategyContract,
    currentPrice: number,
    historicalCandles: CoverageHistoricalCandle[]
  ): CoverageBacktestObservation[] {
    const candles = [...historicalCandles].sort((left, right) => left.time - right.time);

    return candles.map((candle) => {
      const movePct = (candle.close - currentPrice) / Math.max(0.01, currentPrice);
      const pnl = this.calculatePnL(strategy, currentPrice, candle.close);

      return {
        label: new Date(candle.time).toISOString(),
        mode: "backtest",
        probability: candles.length > 0 ? 1 / candles.length : 0,
        movePct: round(movePct, 4),
        underlyingPrice: round(candle.close, 2),
        pnl: round(pnl, 2),
        pnlPct: round((pnl / Math.max(1, strategy.capital)) * 100, 2),
        notes: [candle.close >= currentPrice ? "historical_upside" : "historical_downside"],
        time: candle.time
      };
    });
  }

  private summarizeMonteCarlo(outcomes: CoverageScenarioOutcome[]): CoverageMonteCarloSummary {
    const pnls = outcomes.map((outcome) => outcome.pnl);
    const sorted = [...pnls].sort((left, right) => left - right);
    const positive = pnls.filter((value) => value >= 0);
    const negative = pnls.filter((value) => value < 0);
    const tailIndex = Math.max(0, Math.floor(sorted.length * 0.05));
    const tail = sorted.slice(0, tailIndex + 1);

    return {
      iterations: outcomes.length,
      expectedPnL: round(average(pnls), 2),
      medianPnL: round(percentile(pnls, 0.5), 2),
      bestPnL: round(sorted[sorted.length - 1] ?? 0, 2),
      worstPnL: round(sorted[0] ?? 0, 2),
      standardDeviation: round(standardDeviation(pnls), 2),
      valueAtRisk95: round(percentile(pnls, 0.05), 2),
      expectedShortfall95: round(average(tail), 2),
      winRate: round(outcomes.length ? positive.length / outcomes.length : 0, 4),
      lossRate: round(outcomes.length ? negative.length / outcomes.length : 0, 4)
    };
  }

  private summarizeBacktest(observations: CoverageBacktestObservation[]): CoverageBacktestSummary {
    const pnls = observations.map((observation) => observation.pnl);
    const cumulative = pnls.reduce((sum, value) => {
      const next = sum[sum.length - 1] + value;
      sum.push(next);
      return sum;
    }, [0]);

    const drawdowns = cumulative.map((value, index) => {
      const peak = Math.max(...cumulative.slice(0, index + 1));
      return peak - value;
    });

    const positive = pnls.filter((value) => value >= 0).reduce((sum, value) => sum + value, 0);
    const negative = pnls.filter((value) => value < 0).reduce((sum, value) => sum + Math.abs(value), 0);

    return {
      samples: observations.length,
      startTime: observations[0]?.time,
      endTime: observations[observations.length - 1]?.time,
      averagePnL: round(average(pnls), 2),
      bestPnL: round(Math.max(...pnls, 0), 2),
      worstPnL: round(Math.min(...pnls, 0), 2),
      winRate: round(observations.length ? pnls.filter((value) => value >= 0).length / observations.length : 0, 4),
      maxDrawdown: round(Math.max(...drawdowns, 0), 2),
      profitFactor: round(positive / Math.max(0.01, negative), 4)
    };
  }

  private normalizeCandles(candles: CoverageHistoricalCandle[]): CoverageHistoricalCandle[] {
    return candles
      .filter((candle) => Number.isFinite(candle.time) && Number.isFinite(candle.open) && Number.isFinite(candle.high) && Number.isFinite(candle.low) && Number.isFinite(candle.close) && Number.isFinite(candle.volume))
      .map((candle) => ({
        time: Math.floor(candle.time),
        open: Number(candle.open),
        high: Number(candle.high),
        low: Number(candle.low),
        close: Number(candle.close),
        volume: Number(candle.volume)
      }))
      .sort((left, right) => left.time - right.time);
  }

  private seedFromStrategy(strategy: CoverageStrategyContract): number {
    const base = `${strategy.strategyId}:${strategy.ticker}:${strategy.kind}:${strategy.requestedAt}`;
    let seed = 0;

    for (let index = 0; index < base.length; index += 1) {
      seed = (seed * 31 + base.charCodeAt(index)) >>> 0;
    }

    return seed || 1;
  }
}