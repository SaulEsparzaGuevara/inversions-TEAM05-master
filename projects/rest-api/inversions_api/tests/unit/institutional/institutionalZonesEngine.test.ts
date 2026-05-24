import { describe, expect, it } from "vitest";
import { createInstitutionalAnalysisContract } from "../../../src/modules/institutional/institutionalContract.js";
import { InstitutionalZonesEngine } from "../../../src/modules/institutional/institutionalZonesEngine.js";

function buildCandles() {
  const base = Date.parse("2026-05-01T00:00:00.000Z");

  return [
    { time: base + 0, open: 100, high: 101, low: 98, close: 99, volume: 100_000 },
    { time: base + 1, open: 99, high: 101, low: 95, close: 100, volume: 160_000 },
    { time: base + 2, open: 100, high: 102, low: 96, close: 101, volume: 120_000 },
    { time: base + 3, open: 101, high: 104, low: 97, close: 100, volume: 180_000 },
    { time: base + 4, open: 100, high: 101, low: 95.1, close: 101, volume: 170_000 },
    { time: base + 5, open: 101, high: 104.05, low: 96, close: 100, volume: 190_000 },
    { time: base + 6, open: 100, high: 103, low: 97, close: 101, volume: 130_000 }
  ];
}

describe("institutional zones engine", () => {
  it("detects pivots, clusters nearby zones, and scores strength", async () => {
    const analysis = createInstitutionalAnalysisContract({
      analysisId: "analysis-zones-001",
      ticker: "AAPL",
      instrument: "Apple Inc.",
      period: "daily",
      volume: 1_500_000,
      liquidity: "high",
      horizon: "medium",
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
    });

    const service = {
      resolve: async (request: typeof analysis) => ({
        analysis: request,
        sourceReports: [
          {
            sourceId: "sec-edgar-13f",
            kind: "sec_edgar_13f",
            tier: "free",
            enabled: true,
            status: "ok",
            cacheHit: false,
            latencyMs: 12,
            fetchedAt: "2026-05-20T00:00:00.000Z",
            observation: {
              sourceId: "sec-edgar-13f",
              kind: "sec_edgar_13f",
              ticker: "AAPL",
              period: "daily",
              volume: 1_500_000,
              liquidity: "high",
              horizon: "medium",
              fundsOwnershipPct: 42,
              openPositions: {
                count: 14,
                notional: 19_000_000
              },
              asOf: "2026-05-20T00:00:00.000Z",
              confidence: 0.92,
              notes: ["institutional accumulation"],
              raw: {}
            }
          }
        ],
        cacheHit: false,
        usedSourceIds: ["sec-edgar-13f"]
      })
    };

    const engine = new InstitutionalZonesEngine({
      institutionalDataService: service as any,
      maxZones: 5,
      pivotWindow: 1,
      clusterTolerancePct: 0.1,
      liquidityVolumeMultiplier: 1.0
    });

    const result = await engine.analyze({ analysis, candles: buildCandles() });

    expect(result.candlesAnalyzed).toBe(7);
    expect(result.zones).toHaveLength(2);

    const support = result.zones.find((zone) => zone.type === "support");
    const resistance = result.zones.find((zone) => zone.type === "resistance");

    expect(support).toBeDefined();
    expect(resistance).toBeDefined();
    expect(support?.touches).toBeGreaterThan(1);
    expect(resistance?.touches).toBeGreaterThan(1);
    expect(support?.strength).toBeGreaterThan(0);
    expect(resistance?.strength).toBeGreaterThan(0);
  });
});
