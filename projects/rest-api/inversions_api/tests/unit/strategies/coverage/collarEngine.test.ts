import { describe, expect, it } from "vitest";
import { CollarEngine } from "../../../../src/modules/strategies/coverage/collarEngine.js";

describe("collar engine", () => {
  it("builds capped payoff, risk metrics, and target move alerts", () => {
    const engine = new CollarEngine();

    const result = engine.analyze({
      strategyId: "collar-001",
      kind: "collar_put",
      ticker: "AAPL",
      shares: 100,
      underlyingPrice: 100,
      targetMovePct: 0.12,
      legs: [
        {
          side: "long",
          type: "put",
          strike: 95,
          premium: 3,
          expiration: "2026-12-31T00:00:00.000Z",
          multiplier: 100
        },
        {
          side: "short",
          type: "call",
          strike: 110,
          premium: 2,
          expiration: "2026-12-31T00:00:00.000Z",
          multiplier: 100
        }
      ],
      capital: 12_000,
      riskTolerancePct: 0.25,
      requestedAt: "2026-05-20T00:00:00.000Z"
    });

    expect(result.strategyKind).toBe("collar_put");
    expect(result.payoff.points.length).toBeGreaterThan(0);
    expect(result.riskMetrics.riskProfile).toBe("limited");
    expect(result.riskMetrics.protectionCeilingPrice).toBeGreaterThan(result.riskMetrics.protectionFloorPrice);
    expect(result.alerts.some((alert) => alert.code === "COLLAR_TARGET_MOVE")).toBe(true);
  });
});
