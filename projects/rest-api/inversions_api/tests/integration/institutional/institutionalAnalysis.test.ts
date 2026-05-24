import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../src/routes/institutional/bootstrap.js", async () => {
  const actual = await vi.importActual<typeof import("../../../src/routes/institutional/bootstrap.js")>("../../../src/routes/institutional/bootstrap.js");

  const buildAnalysisResult = (analysis: any) => ({
    analysis,
    zones: [
      {
        type: "support",
        price: 95,
        strength: 0.82,
        accumulatedVolume: 200_000,
        confidence: 0.91,
        confirmingSources: 2,
        touches: 2,
        liquidity: "high",
        asOf: "2026-05-20T00:00:00.000Z",
        notes: ["fixture"]
      },
      {
        type: "resistance",
        price: 110,
        strength: 0.74,
        accumulatedVolume: 180_000,
        confidence: 0.84,
        confirmingSources: 2,
        touches: 2,
        liquidity: "high",
        asOf: "2026-05-20T00:00:00.000Z",
        notes: ["fixture"]
      }
    ],
    candlesAnalyzed: 7,
    sourceReports: [
      {
        sourceId: "sec-edgar-13f",
        kind: "sec_edgar_13f",
        tier: "free",
        enabled: true,
        status: "ok",
        cacheHit: false,
        latencyMs: 5,
        fetchedAt: "2026-05-20T00:00:00.000Z"
      }
    ],
    generatedAt: "2026-05-20T00:00:00.000Z"
  });

  const buildPositionsResult = (analysis: any) => ({
    analysis,
    sourceReports: [
      {
        sourceId: "sec-edgar-13f",
        kind: "sec_edgar_13f",
        tier: "free",
        enabled: true,
        status: "ok",
        cacheHit: false,
        latencyMs: 5,
        fetchedAt: "2026-05-20T00:00:00.000Z",
        observation: {
          sourceId: "sec-edgar-13f",
          kind: "sec_edgar_13f",
          ticker: analysis.ticker,
          asOf: "2026-05-20T00:00:00.000Z",
          confidence: 0.91,
          notes: ["fixture"],
          raw: {},
          openPositions: {
            count: 14,
            notional: 19_000_000
          },
          fundsOwnershipPct: 42,
          volume: 1_500_000,
          liquidity: "high",
          horizon: "medium",
          period: "daily"
        }
      }
    ],
    cacheHit: false,
    usedSourceIds: ["sec-edgar-13f"]
  });

  return {
    ...actual,
    getInstitutionalRouteContext: () => ({
      engine: {
        analyze: async ({ analysis }: any) => buildAnalysisResult(analysis)
      },
      service: {
        resolve: async (analysis: any) => buildPositionsResult(analysis)
      }
    })
  };
});

import { institutionalAnalysisRouter } from "../../../src/routes/institutional/institutionalAnalysis.js";

afterEach(() => {
  process.env.AUTH_BYPASS = "false";
});

describe("institutional analysis route", () => {
  it("returns institutional analysis with zones and metrics", async () => {
    process.env.AUTH_BYPASS = "true";

    const app = express();
    app.use(express.json());
    app.use("/api/institutional", institutionalAnalysisRouter);

    const response = await request(app).get("/api/institutional/analysis?ticker=AAPL&period=daily&horizon=medium");

    expect(response.status).toBe(200);
    expect(response.body.request.ticker).toBe("AAPL");
    expect(response.body.zones.support.length).toBe(1);
    expect(response.body.zones.resistance.length).toBe(1);
    expect(response.body.metrics.zoneCount).toBe(2);
  });
});
