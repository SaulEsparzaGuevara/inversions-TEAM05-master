/**
 * ============================================================================
 * coverageComparator.ts
 * ============================================================================
 *
 * FIC: T120: Coverage Comparator — ranks 4 strategies (protective put, married put, collar, covered straddle) by composite score and recommends best.
 */

import { CoverageSimulationEngine } from "./coverageSimulationEngine.js";
import { CoverageRiskService } from "./coverageRiskService.js";
import { CoverageReportService } from "./coverageReportService.js";
import { createCoverageComparisonResult, type CoverageComparisonResult } from "./coverageTypes.js";
import { createCoverageStrategyContract, type CoverageStrategyContract } from "./coverageStrategyContract.js";

function clamp01(v: number) {
  if (Number.isFinite(v) === false) return 0;
  return Math.max(0, Math.min(1, v));
}

export interface CoverageComparatorOptions {
  runners?: number; // parallelism hint
  recipients?: { email?: string[]; push?: string[] };
}

export class CoverageComparator {
  private readonly simulationEngine: CoverageSimulationEngine;
  private readonly riskService: CoverageRiskService;
  private readonly reportService: CoverageReportService;

  constructor() {
    this.simulationEngine = new CoverageSimulationEngine();
    this.riskService = new CoverageRiskService();
    this.reportService = new CoverageReportService();
  }

  /**
   * Compare a base strategy across candidate coverage strategies:
   * - protective_put
   * - collar
   * - covered_straddle
   * - underlying (baseline)
   */
  async compare(baseRequest: CoverageStrategyContract, options: CoverageComparatorOptions = {}): Promise<CoverageComparisonResult> {
    const strategy = createCoverageStrategyContract(baseRequest);
    const candidateKinds = ["protective_put", "collar_put", "covered_straddle", "married_put"] as const;

    const candidateRequests = candidateKinds.map((k) => ({ ...baseRequest, kind: k }));

    // Run simulations in parallel
    const simulations = await Promise.all(candidateRequests.map((req) => this.simulationEngine.analyze(req)));

    // Evaluate risk for each simulation (in parallel)
    const risks = await Promise.all(simulations.map((sim) => this.riskService.evaluate(sim.baseResult, sim, options.recipients)));

    // Produce reports — pass pre-computed simulation+risk to avoid re-computation inside generateReport()
    const reports = await Promise.all(simulations.map((sim, i) =>
      this.reportService.generateReport(sim.baseResult.strategy, options.recipients, {
        simulation: sim,
        risk: risks[i]
      })
    ));

    // Prepare metrics for normalization
    const expectedPnls = simulations.map((s) => (s.monteCarlo?.expectedPnL ?? s.backtest?.averagePnL ?? 0));
    const worstPnls = simulations.map((s) => (s.monteCarlo?.worstPnL ?? s.backtest?.worstPnL ?? 0));
    const netPremiums = simulations.map((s) => (s.baseResult?.riskMetrics?.netPremium ?? 0));

    const maxExpected = Math.max(...expectedPnls);
    const minExpected = Math.min(...expectedPnls);
    const maxCost = Math.max(...netPremiums.map((c) => Math.abs(c)));

    const entries = candidateKinds.map((kind, i) => {
      const sim = simulations[i];
      const risk = risks[i];
      const expected = expectedPnls[i];
      const worst = worstPnls[i];
      const cost = netPremiums[i];
      const report = reports[i];

      const pnlScore = (maxExpected === minExpected) ? 0.5 : clamp01((expected - minExpected) / (maxExpected - minExpected));
      const costScore = maxCost <= 0 ? 0.5 : clamp01(1 - Math.abs(cost) / (maxCost * 1.2));
      const riskMetric = Math.min(1, Math.abs(worst) / Math.max(1, strategy.capital));
      const riskScore = clamp01(1 - riskMetric); // higher is better
      const contextFit = clamp01((sim.monteCarlo?.winRate ?? 0.5));

      // Weighted total: pnl 50%, cost 20%, risk 20%, context 10%
      const total = clamp01(pnlScore * 0.5 + costScore * 0.2 + riskScore * 0.2 + contextFit * 0.1);

      return {
        strategyKind: kind as any,
        strategy: sim.baseResult.strategy,
        strategyResult: sim.baseResult,
        simulation: sim,
        risk,
        report,
        score: {
          pnl: pnlScore,
          costEfficiency: costScore,
          risk: riskScore,
          contextFit,
          total
        },
        rank: 0,
        notes: []
      };
    });

    // sort by total desc
    const ranked = entries.slice().sort((a, b) => b.score.total - a.score.total);

    // assign ranks
    ranked.forEach((e, idx) => {
      e.rank = idx + 1;
    });

    const recommendedKind = (ranked[0]?.strategyKind ?? candidateKinds[0]) as any;

    const result = createCoverageComparisonResult({
      engineId: "coverage_comparator",
      ticker: simulations[0]?.baseResult?.ticker ?? strategy.ticker ?? "",
      currentPrice: simulations[0]?.currentPrice ?? simulations[0]?.baseResult?.currentPrice ?? 0,
      entries: ranked,
      recommendedKind,
      multiCoreContext: {
        executionMode: (options.runners && options.runners > 1) ? "parallel" : "serial",
        runners: options.runners ? Math.max(1, Math.trunc(options.runners)) : 1
      },
      generatedAt: new Date().toISOString()
    });

    return result;
  }
}

export default CoverageComparator;
