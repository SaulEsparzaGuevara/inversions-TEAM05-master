import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../src/routes/institutional/bootstrap.js", async () => {
  const actual = await vi.importActual<typeof import("../../../src/routes/institutional/bootstrap.js")>("../../../src/routes/institutional/bootstrap.js");

  return {
    ...actual,
    getInstitutionalRouteContext: () => ({
      engine: {
        analyze: async ({ analysis }: any) => ({
          analysis,
          zones: [],
          candlesAnalyzed: 0,
          sourceReports: [],
          generatedAt: "2026-05-20T00:00:00.000Z"
        })
      },
      service: {
        resolve: async (analysis: any) => ({
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
        })
      }
    })
  };
});

import { regulatoryPositionsRouter } from "../../../src/routes/institutional/regulatoryPositions.js";

afterEach(() => {
  process.env.AUTH_BYPASS = "false";
});

describe("institutional positions route", () => {
  it("returns 13F positions and flow summary", async () => {
    process.env.AUTH_BYPASS = "true";

    const app = express();
    app.use(express.json());
    app.use("/api/institutional", regulatoryPositionsRouter);

    const response = await request(app).get("/api/institutional/positions?ticker=AAPL&period=daily&horizon=medium");

    expect(response.status).toBe(200);
    expect(response.body.request.ticker).toBe("AAPL");
    expect(response.body.positions13F.length).toBe(1);
    expect(response.body.flows.netFlow).toBeGreaterThan(0);
  });
});
