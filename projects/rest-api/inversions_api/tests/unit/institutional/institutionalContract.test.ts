import { describe, expect, it } from "vitest";
import { createInstitutionalAnalysisContract } from "../../../src/modules/institutional/institutionalContract.js";

describe("institutional analysis contract", () => {
  const validPayload = {
    analysisId: "analysis-001",
    ticker: "AAPL",
    instrument: "Apple Inc.",
    strike: 200,
    period: "daily" as const,
    volume: 1_500_000,
    liquidity: "high" as const,
    horizon: "medium" as const,
    fundsOwnershipPct: 42,
    flows: {
      inflows: 850_000,
      outflows: 420_000,
      asOf: "2026-05-20T00:00:00.000Z"
    },
    openPositions: {
      count: 14,
      notional: 19_000_000
    },
    sourceIds: ["sec-edgar-13f"],
    requestedAt: "2026-05-20T00:00:00.000Z"
  };

  it("accepts a valid institutional analysis contract", () => {
    const result = createInstitutionalAnalysisContract(validPayload);

    expect(result).toBe(validPayload);
    expect(result.ticker).toBe("AAPL");
    expect(result.openPositions.count).toBe(14);
  });

  it("rejects invalid payloads", () => {
    expect(() =>
      createInstitutionalAnalysisContract({
        ...validPayload,
        period: "hourly"
      } as any)
    ).toThrow("Invalid institutional analysis contract payload.");
  });
});
