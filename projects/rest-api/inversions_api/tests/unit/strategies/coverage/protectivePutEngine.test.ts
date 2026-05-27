import { describe, expect, it } from "vitest";
import { ProtectivePutEngine } from "../../../../src/modules/strategies/coverage/protectivePutEngine.js";

describe("protective put engine", () => {
  it("builds payoff, risk metrics, and critical alerts", () => {
    const engine = new ProtectivePutEngine();

    const result = engine.analyze({
      strategyId: "pp-001",
      kind: "protective_put",
      ticker: "AAPL",
      shares: 100,
      underlyingPrice: 90,
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

    expect(result.strategyKind).toBe("protective_put");
    expect(result.payoff.points.length).toBeGreaterThan(0);
    expect(result.riskMetrics.riskProfile).toBe("limited");
    expect(result.riskMetrics.maxProtection).toBeGreaterThan(0);
    expect(result.alerts.some((alert) => alert.code === "STOP_LOSS_TRIGGERED")).toBe(true);
  });
});
