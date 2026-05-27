import { describe, expect, it, vi } from "vitest";

const comparatorFixtures = vi.hoisted(() => {
  const buildStrategy = (kind: string, netPremium: number) => {
    const base = {
      strategyId: `${kind}-strategy`,
      kind,
      ticker: "AAPL",
      shares: 100,
      underlyingPrice: 100,
      capital: 10_000,
      riskTolerancePct: 0.3,
      requestedAt: "2026-05-20T00:00:00.000Z"
    };

    if (kind === "protective_put" || kind === "married_put") {
      return {
        ...base,
        legs: [
          {
            side: "long",
            type: "put",
            strike: 95,
            premium: netPremium,
            expiration: "2026-12-31T00:00:00.000Z",
            multiplier: 100
          }
        ]
      };
    }

    if (kind === "collar_put") {
      return {
        ...base,
        legs: [
          {
            side: "long",
            type: "put",
            strike: 95,
            premium: 2,
            expiration: "2026-12-31T00:00:00.000Z",
            multiplier: 100
          },
          {
            side: "short",
            type: "call",
            strike: 110,
            premium: 1,
            expiration: "2026-12-31T00:00:00.000Z",
            multiplier: 100
          }
        ]
      };
    }

    return {
      ...base,
      legs: [
        {
          side: "short",
          type: "put",
          strike: 95,
          premium: 2,
          expiration: "2026-12-31T00:00:00.000Z",
          multiplier: 100
        },
        {
          side: "short",
          type: "call",
          strike: 105,
          premium: 3,
          expiration: "2026-12-31T00:00:00.000Z",
          multiplier: 100
        }
      ]
    };
  };

  const buildBaseResult = (kind: string, netPremium: number) => ({
    engineId: `engine-${kind}`,
    strategy: buildStrategy(kind, netPremium),
    strategyKind: kind,
    ticker: "AAPL",
    shares: 100,
    currentPrice: 100,
    payoff: {
      baselinePrice: 100,
      breakevenPrice: 100,
      maxProfit: null,
      maxLoss: null,
      description: "fixture",
      points: []
    },
    riskMetrics: {
      riskProfile: "limited" as const,
      maxProtection: 100,
      protectionFloorPrice: 95,
      protectionCeilingPrice: undefined,
      netPremium,
      netPremiumPerShare: netPremium / 100,
      costBenefitRatio: 1,
      downsideRisk: 10,
      upsideCap: null,
      breakEvenPrice: 100,
      stopLossPrice: 90,
      marginRequirement: 10,
      exerciseRiskScore: 0.1,
      volatilityStressLoss: 5
    },
    alerts: [],
    generatedAt: "2026-05-20T00:00:00.000Z"
  });

  const buildSimulation = (kind: string, expectedPnL: number, worstPnL: number, netPremium: number, winRate: number) => ({
    engineId: `simulation-${kind}`,
    strategy: buildStrategy(kind, netPremium),
    strategyKind: kind,
    currentPrice: 100,
    baseResult: buildBaseResult(kind, netPremium),
    deterministicScenarios: [],
    monteCarlo: {
      iterations: 100,
      expectedPnL,
      medianPnL: expectedPnL,
      bestPnL: expectedPnL + 5,
      worstPnL,
      standardDeviation: 1,
      valueAtRisk95: worstPnL,
      expectedShortfall95: worstPnL,
      winRate,
      lossRate: 1 - winRate
    },
    monteCarloOutcomes: [],
    backtest: {
      samples: 10,
      startTime: 1,
      endTime: 2,
      averagePnL: expectedPnL,
      bestPnL: expectedPnL + 5,
      worstPnL,
      winRate,
      maxDrawdown: Math.abs(worstPnL),
      profitFactor: 1.5
    },
    backtestObservations: [],
    historicalCandles: [],
    generatedAt: "2026-05-20T00:00:00.000Z"
  });

  const simulations = {
    protective_put: buildSimulation("protective_put", 12, -1, 1, 0.95),
    collar_put: buildSimulation("collar_put", 6, -3, 3, 0.7),
    covered_straddle: buildSimulation("covered_straddle", 1, -8, 5, 0.4),
    married_put: buildSimulation("married_put", 9, -2, 2, 0.8)
  };

  return {
    simulations,
    analyze: vi.fn(async (request: { kind: keyof typeof simulations }) => simulations[request.kind]),
    evaluate: vi.fn(async (_strategyResult: unknown, simulation: any) => ({
      engineId: "coverage_risk_service",
      strategy: simulation.baseResult.strategy,
      strategyResult: simulation.baseResult,
      simulation,
      stopLossTriggered: false,
      marginAlertTriggered: false,
      actions: [],
      notifications: [],
      generatedAt: "2026-05-20T00:00:00.000Z"
    })),
    generateReport: vi.fn(async (strategy: any) => {
      const simulation = simulations[strategy.kind as keyof typeof simulations];

      return {
        engineId: "coverage_report_service",
        strategy,
        strategyResult: simulation.baseResult,
        simulation,
        risk: {
          engineId: "coverage_risk_service",
          strategy: simulation.baseResult.strategy,
          strategyResult: simulation.baseResult,
          simulation,
          stopLossTriggered: false,
          marginAlertTriggered: false,
          actions: [],
          notifications: [],
          generatedAt: "2026-05-20T00:00:00.000Z"
        },
        summary: {
          expectedPnL: simulation.monteCarlo.expectedPnL,
          expectedPnLPct: 0.12,
          bestPnL: simulation.monteCarlo.bestPnL,
          worstPnL: simulation.monteCarlo.worstPnL,
          riskRewardRatio: 17,
          winRate: simulation.monteCarlo.winRate,
          lossRate: simulation.monteCarlo.lossRate,
          alertCount: 0
        },
        logs: [],
        exports: [],
        generatedAt: "2026-05-20T00:00:00.000Z"
      };
    })
  };
});

vi.mock("../../../../src/modules/strategies/coverage/coverageSimulationEngine.js", () => ({
  CoverageSimulationEngine: class {
    analyze = comparatorFixtures.analyze;
  }
}));

vi.mock("../../../../src/modules/strategies/coverage/coverageRiskService.js", () => ({
  CoverageRiskService: class {
    evaluate = comparatorFixtures.evaluate;
  }
}));

vi.mock("../../../../src/modules/strategies/coverage/coverageReportService.js", () => ({
  CoverageReportService: class {
    generateReport = comparatorFixtures.generateReport;
  }
}));

import { CoverageComparator } from "../../../../src/modules/strategies/coverage/coverageComparator.js";

describe("coverage comparator", () => {
  it("ranks the candidate strategies and recommends the top score", async () => {
    const comparator = new CoverageComparator();

    const result = await comparator.compare({
      strategyId: "base-strategy",
      kind: "protective_put",
      ticker: "AAPL",
      shares: 100,
      underlyingPrice: 100,
      legs: [
        {
          side: "long",
          type: "put",
          strike: 95,
          premium: 3,
          expiration: "2026-12-31T00:00:00.000Z",
          multiplier: 100
        }
      ],
      capital: 10_000,
      riskTolerancePct: 0.3,
      requestedAt: "2026-05-20T00:00:00.000Z"
    });

    expect(result.entries).toHaveLength(4);
    expect(result.entries[0].rank).toBe(1);
    expect(result.entries[0].score.total).toBeGreaterThanOrEqual(result.entries[1].score.total);
    expect(result.recommendedKind).toBe(result.entries[0].strategyKind);
    expect(result.multiCoreContext.executionMode).toBe("serial");
  });
});
