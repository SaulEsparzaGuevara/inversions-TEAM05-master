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
      },
      trendEngine: {
        async analyze({ analysis: _a }: any) {
          return {
            analysis: _a,
            movingAverages: [
              { period: 50, value: 102.35, slope: 0.012, rising: true, sampleCount: 50 },
              { period: 200, value: 98.12, slope: 0.005, rising: true, sampleCount: 200 }
            ],
            crossover: { type: "golden_cross", occurredAt: Date.now() - 5 * 86400000, daysSince: 5, ma50: 102.35, ma200: 98.12, spread: 4.23 },
            currentTrend: "bullish",
            trendStrength: 0.72,
            supportLevel: 95.5,
            resistanceLevel: 108.3,
            volumeCorrelation: { correlationCoefficient: 0.34, volumeTrend: "increasing", quarterlyReportsAnalyzed: 4 },
            continuityProbability: {
              probability: 0.68,
              factors: { maAlignment: 0.72, volumeConfirmation: 0.65, ownershipTrend: 0.58, flowMomentum: 0.54 }
            },
            sourceReports: [],
            candlesAnalyzed: 260,
            generatedAt: "2026-05-20T00:00:00.000Z"
          };
        }
      },
      expirationEngine: {
        async analyze({ analysis: _a }: any) {
          return {
            analysis: _a,
            expirationEvents: [
              { type: "monthly_opex", date: Date.now() + 12 * 86400000, label: "Jun 2025 Monthly OpEx", daysUntil: 12, directionalBias: "neutral", significance: 0.6 }
            ],
            slipperySlope: { direction: "symmetric", accelerationFactor: 0.3, driftPct: 0.5, attractorStrike: 100, confidence: 0.65, peakDays: 12 },
            catalystWindows: [
              { type: "fomc", date: Date.now() + 8 * 86400000, label: "FOMC Meeting Jun 2025", daysUntil: 8, volatilityImpact: 0.7, volumeSurgeFactor: 1.8, confidence: 0.85 }
            ],
            timeDecay: { thetaPct: 0.35, gammaExposurePct: 0.12, accelerationDays: 5, decayRegime: "near", vannaExposurePct: 0.08, charmPct: 0.02 },
            quarterlyCorrelation: { overlappingWindows: 1, averageImpactPct: 2.1, totalQuarterlyWindows: 4, filingExpirationCorrelation: 0.45, currentlyInWindow: false, daysUntilNextWindow: 15 },
            sourceReports: [],
            analysisWindowDays: 90,
            generatedAt: "2026-05-20T00:00:00.000Z"
          };
        }
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
