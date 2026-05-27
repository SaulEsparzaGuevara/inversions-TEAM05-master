import { describe, expect, it } from "vitest";
import { CoveredStraddleEngine } from "../../../../src/modules/strategies/coverage/coveredStraddleEngine.js";

describe("covered straddle engine", () => {
  it("builds unlimited-risk payoff, margin metrics, and stress alerts", () => {
    const engine = new CoveredStraddleEngine();

    const result = engine.analyze({
      strategyId: "straddle-001",
      kind: "covered_straddle",
      ticker: "AAPL",
      shares: 100,
      underlyingPrice: 100,
      legs: [
        {
          side: "short",
          type: "put",
          strike: 95,
          premium: 4,
          expiration: "2026-12-31T00:00:00.000Z",
          multiplier: 100
        },
        {
          side: "short",
          type: "call",
          strike: 105,
          premium: 5,
          expiration: "2026-12-31T00:00:00.000Z",
          multiplier: 100
        }
      ],
      capital: 1_000,
      riskTolerancePct: 0.2,
      requestedAt: "2026-05-20T00:00:00.000Z"
    });

    expect(result.strategyKind).toBe("covered_straddle");
    expect(result.payoff.points.length).toBeGreaterThan(0);
    expect(result.riskMetrics.riskProfile).toBe("unlimited");
    expect(result.riskMetrics.marginRequirement).toBeGreaterThan(0);
    expect(result.alerts.some((alert) => alert.code === "MARGIN_STRESS")).toBe(true);
  });
});
