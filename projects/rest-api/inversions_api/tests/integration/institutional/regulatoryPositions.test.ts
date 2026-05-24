/**
 * Integration tests: Regulatory Positions route
 * ==============================================
 *
 * Tests the /positions endpoint by mocking getInstitutionalRouteContext()
 * with a controlled service.
 */

import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../src/routes/institutional/bootstrap.js", async () => {
  const actual = await vi.importActual<typeof import("../../../src/routes/institutional/bootstrap.js")>("../../../src/routes/institutional/bootstrap.js");

  const buildPositionsResult = (analysis: any) => ({
    analysis,
    sourceReports: [
      {
        sourceId: "sec-edgar-13f",
        kind: "sec_edgar_13f" as const,
        tier: "free" as const,
        enabled: true,
        status: "ok" as const,
        cacheHit: false,
        latencyMs: 5,
        fetchedAt: "2026-05-20T00:00:00.000Z",
        observation: {
          sourceId: "sec-edgar-13f",
          kind: "sec_edgar_13f" as const,
          ticker: analysis.ticker,
          asOf: "2026-05-20T00:00:00.000Z",
          confidence: 0.91,
          notes: ["fixture"],
          raw: {},
          openPositions: { count: 14, notional: 19_000_000 },
          fundsOwnershipPct: 42,
          volume: 1_500_000,
          liquidity: "high" as const,
          horizon: "medium" as const,
          period: "daily" as const
        }
      },
      {
        sourceId: "finra-short-interest",
        kind: "finra_short_interest" as const,
        tier: "free" as const,
        enabled: true,
        status: "ok" as const,
        cacheHit: false,
        latencyMs: 8,
        fetchedAt: "2026-05-20T00:00:00.000Z",
        observation: {
          sourceId: "finra-short-interest",
          kind: "finra_short_interest" as const,
          ticker: analysis.ticker,
          asOf: "2026-05-20T00:00:00.000Z",
          confidence: 0.88,
          notes: ["fixture finra"],
          raw: {},
          openPositions: { count: 1, notional: 2_500_000 },
          volume: 2_000_000
        }
      }
    ],
    cacheHit: false,
    usedSourceIds: ["sec-edgar-13f", "finra-short-interest"],
    overallStatus: "ok" as const
  });

  return {
    ...actual,
    getInstitutionalRouteContext: () => ({
      service: {
        resolve: async (analysis: any) => buildPositionsResult(analysis)
      },
      engine: {
        async analyze({ analysis }: any) {
          return {
            analysis,
            zones: [],
            candlesAnalyzed: 0,
            sourceReports: [],
            generatedAt: "2026-05-20T00:00:00.000Z",
            overallStatus: "ok"
          };
        }
      },
      trendEngine: {
        async analyze({ analysis: _a }: any) {
          return {
            analysis: _a,
            movingAverages: [{ period: 50, value: 100, slope: 0, rising: true, sampleCount: 50 }],
            crossover: { type: "none", occurredAt: 0, daysSince: 0, ma50: 100, ma200: 98, spread: 2 },
            currentTrend: "bullish",
            trendStrength: 0.5,
            supportLevel: 95,
            resistanceLevel: 105,
            volumeCorrelation: { correlationCoefficient: 0, volumeTrend: "flat", quarterlyReportsAnalyzed: 0 },
            continuityProbability: { probability: 0.5, factors: { maAlignment: 0.5, volumeConfirmation: 0.5, ownershipTrend: 0.5, flowMomentum: 0.5 } },
            sourceReports: [],
            candlesAnalyzed: 0,
            generatedAt: "2026-05-20T00:00:00.000Z"
          };
        }
      },
      expirationEngine: {
        async analyze({ analysis: _a }: any) {
          return {
            analysis: _a,
            expirationEvents: [],
            slipperySlope: { direction: "symmetric", accelerationFactor: 0, driftPct: 0, attractorStrike: 100, confidence: 0, peakDays: 0 },
            catalystWindows: [],
            timeDecay: { thetaPct: 0, gammaExposurePct: 0, accelerationDays: 0, decayRegime: "far", vannaExposurePct: 0, charmPct: 0 },
            quarterlyCorrelation: { overlappingWindows: 0, averageImpactPct: 0, totalQuarterlyWindows: 0, filingExpirationCorrelation: 0, currentlyInWindow: false, daysUntilNextWindow: 0 },
            sourceReports: [],
            analysisWindowDays: 90,
            generatedAt: "2026-05-20T00:00:00.000Z"
          };
        }
      }
    })
  };
});

import { regulatoryPositionsRouter } from "../../../src/routes/institutional/regulatoryPositions.js";

afterEach(() => {
  process.env.AUTH_BYPASS = "false";
});

describe("regulatory positions route", () => {
  it("returns regulatory positions with 13F data and flows", async () => {
    process.env.AUTH_BYPASS = "true";

    const app = express();
    app.use(express.json());
    app.use("/api/institutional", regulatoryPositionsRouter);

    const response = await request(app).get("/api/institutional/positions?ticker=AAPL&period=daily&horizon=medium");

    expect(response.status).toBe(200);
    expect(response.body.request.ticker).toBe("AAPL");
    expect(response.body.positions13F).toBeDefined();
    expect(Array.isArray(response.body.positions13F)).toBe(true);
    expect(response.body.positions13F.length).toBeGreaterThanOrEqual(1);
    expect(response.body.flows).toBeDefined();
    expect(response.body.flows.netFlow).toBeDefined();
    expect(response.body.sourceReports).toBeDefined();
    expect(Array.isArray(response.body.sourceReports)).toBe(true);
    expect(response.body.cacheHit).toBe(false);
    expect(response.body.usedSourceIds).toContain("sec-edgar-13f");
  });

  it("returns positions with different ticker and period", async () => {
    process.env.AUTH_BYPASS = "true";

    const app = express();
    app.use(express.json());
    app.use("/api/institutional", regulatoryPositionsRouter);

    const response = await request(app).get("/api/institutional/positions?ticker=MSFT&period=weekly&horizon=long");

    expect(response.status).toBe(200);
    expect(response.body.request.ticker).toBe("MSFT");
    expect(response.body.request.period).toBe("weekly");
    expect(response.body.request.horizon).toBe("long");
  });

  it("returns 401 without auth bypass", async () => {
    process.env.AUTH_BYPASS = "false";

    const app = express();
    app.use(express.json());
    app.use("/api/institutional", regulatoryPositionsRouter);

    const response = await request(app).get("/api/institutional/positions?ticker=AAPL");

    expect(response.status).toBe(401);
  });
});
