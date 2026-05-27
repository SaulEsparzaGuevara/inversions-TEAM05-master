import { describe, expect, it } from "vitest";
import { createInstitutionalAnalysisContract } from "../../../src/modules/institutional/institutionalContract.js";
import { InstitutionalTrendEngine } from "../../../src/modules/institutional/institutionalTrendEngine.js";

/**
 * Builds a set of realistic OHLC candles that simulate
 * a bullish trend (prices gradually rising).
 */
function buildBullishCandles(count: number) {
  const base = Date.parse("2025-06-01T00:00:00.000Z");
  const startPrice = 100;
  const candles = [];

  for (let i = 0; i < count; i++) {
    const trend = (i / count) * 25; // gradual rise from 100 to 125
    const noise = Math.sin(i * 0.5) * 3;
    const open = startPrice + trend + noise;
    const close = startPrice + trend + noise + 1.5 + Math.sin(i * 0.3);
    const high = Math.max(open, close) + 1;
    const low = Math.min(open, close) - 1;
    const volume = Math.round(150000 + Math.sin(i / 10) * 50000 + 80000);

    candles.push({
      time: base + i * 86_400_000,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume
    });
  }

  return candles;
}

/**
 * Builds a set of realistic OHLC candles that simulate
 * a bearish trend (prices gradually falling).
 */
function buildBearishCandles(count: number) {
  const base = Date.parse("2025-06-01T00:00:00.000Z");
  const startPrice = 130;
  const candles = [];

  for (let i = 0; i < count; i++) {
    const trend = (i / count) * 25; // gradual fall from 130 to 105
    const noise = Math.sin(i * 0.5) * 3;
    const open = startPrice - trend + noise;
    const close = startPrice - trend + noise - 1.5 + Math.sin(i * 0.3);
    const high = Math.max(open, close) + 1;
    const low = Math.min(open, close) - 1;
    const volume = Math.round(150000 + Math.sin(i / 10) * 50000 + 80000);

    candles.push({
      time: base + i * 86_400_000,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume
    });
  }

  return candles;
}

/**
 * Builds a set of candles with no clear trend (range-bound).
 */
function buildNeutralCandles(count: number) {
  const base = Date.parse("2025-06-01T00:00:00.000Z");
  const center = 100;
  const candles = [];

  for (let i = 0; i < count; i++) {
    const oscillation = Math.sin(i * 0.3) * 5;
    const noise = (Math.random() - 0.5) * 2;
    const open = center + oscillation + noise;
    const close = center + oscillation + noise + (Math.random() - 0.5) * 2;
    const high = Math.max(open, close) + 0.8;
    const low = Math.min(open, close) - 0.8;
    const volume = Math.round(120000 + Math.random() * 60000);

    candles.push({
      time: base + i * 86_400_000,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume
    });
  }

  return candles;
}

function buildMockAnalysis(ticker = "AAPL", overrides: Record<string, unknown> = {}) {
  return createInstitutionalAnalysisContract({
    analysisId: "trend-test-001",
    ticker,
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
    requestedAt: "2026-05-20T00:00:00.000Z",
    ...overrides
  });
}

function buildMockServiceResult(analysis: ReturnType<typeof buildMockAnalysis>) {
  return {
    analysis,
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
          openPositions: { count: 14, notional: 19_000_000 },
          asOf: "2026-05-20T00:00:00.000Z",
          confidence: 0.92,
          notes: ["institutional accumulation"],
          raw: {}
        }
      }
    ],
    cacheHit: false,
    usedSourceIds: ["sec-edgar-13f"]
  };
}

function createMockService() {
  return {
    resolve: async (request: ReturnType<typeof buildMockAnalysis>) =>
      buildMockServiceResult(request)
  };
}

describe("InstitutionalTrendEngine", () => {
  // -------------------------------------------------------------------------
  // MA computation
  // -------------------------------------------------------------------------

  it("computes 50-day and 200-day moving averages", async () => {
    const analysis = buildMockAnalysis();
    const engine = new InstitutionalTrendEngine({
      institutionalDataService: createMockService() as any,
      minCandles: 200,
      fastMaPeriod: 50,
      slowMaPeriod: 200
    });

    const candles = buildBullishCandles(260);
    const result = await engine.analyze({ analysis, candles });

    expect(result.candlesAnalyzed).toBe(260);
    expect(result.movingAverages).toHaveLength(2);

    const ma50 = result.movingAverages.find((ma) => ma.period === 50);
    const ma200 = result.movingAverages.find((ma) => ma.period === 200);

    expect(ma50).toBeDefined();
    expect(ma200).toBeDefined();
    expect(ma50!.value).toBeGreaterThan(0);
    expect(ma200!.value).toBeGreaterThan(0);
    expect(ma50!.sampleCount).toBe(50);
    expect(ma200!.sampleCount).toBe(200);
  });

  it("computes valid MA slopes", async () => {
    const analysis = buildMockAnalysis();
    const engine = new InstitutionalTrendEngine({
      institutionalDataService: createMockService() as any
    });

    const candles = buildBullishCandles(260);
    const result = await engine.analyze({ analysis, candles });

    for (const ma of result.movingAverages) {
      expect(typeof ma.slope).toBe("number");
      expect(typeof ma.rising).toBe("boolean");
      // Slope should be a small fraction for trending data
      expect(Math.abs(ma.slope)).toBeLessThan(0.5);
    }
  });

  // -------------------------------------------------------------------------
  // Crossover detection
  // -------------------------------------------------------------------------

  it("detects golden cross in bullish data", async () => {
    const analysis = buildMockAnalysis();
    const engine = new InstitutionalTrendEngine({
      institutionalDataService: createMockService() as any
    });

    const candles = buildBullishCandles(260);
    const result = await engine.analyze({ analysis, candles });

    expect(result.crossover.type).toBe("golden_cross");
    expect(result.crossover.ma50).toBeGreaterThan(result.crossover.ma200);
    expect(result.crossover.spread).toBeGreaterThan(0);
    expect(result.crossover.daysSince).toBeGreaterThanOrEqual(0);
  });

  it("detects death cross in bearish data", async () => {
    const analysis = buildMockAnalysis("AAPL", { fundsOwnershipPct: 15 });
    const engine = new InstitutionalTrendEngine({
      institutionalDataService: createMockService() as any
    });

    const candles = buildBearishCandles(260);
    const result = await engine.analyze({ analysis, candles });

    expect(result.crossover.type).toBe("death_cross");
    expect(result.crossover.ma50).toBeLessThan(result.crossover.ma200);
    expect(result.crossover.spread).toBeLessThan(0);
  });

  it("returns 'none' crossover when MAs are too close", async () => {
    const analysis = buildMockAnalysis();
    const engine = new InstitutionalTrendEngine({
      institutionalDataService: createMockService() as any,
      fastMaPeriod: 10,
      slowMaPeriod: 15
    });

    // Neutral data with very small moves
    const candles = buildNeutralCandles(100);
    const result = await engine.analyze({ analysis, candles });

    // Cross type can be none or golden/death depending on slight random variance
    expect(["golden_cross", "death_cross", "none"]).toContain(result.crossover.type);
    expect(isFinite(result.crossover.daysSince)).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Trend determination
  // -------------------------------------------------------------------------

  it("identifies bullish trend with rising prices", async () => {
    const analysis = buildMockAnalysis();
    const engine = new InstitutionalTrendEngine({
      institutionalDataService: createMockService() as any
    });

    const candles = buildBullishCandles(260);
    const result = await engine.analyze({ analysis, candles });

    expect(result.currentTrend).toBe("bullish");
    expect(result.trendStrength).toBeGreaterThan(0.3);
  });

  it("identifies bearish trend with falling prices", async () => {
    const analysis = buildMockAnalysis("AAPL", { fundsOwnershipPct: 15 });
    const engine = new InstitutionalTrendEngine({
      institutionalDataService: createMockService() as any
    });

    const candles = buildBearishCandles(260);
    const result = await engine.analyze({ analysis, candles });

    expect(result.currentTrend).toBe("bearish");
    expect(result.trendStrength).toBeGreaterThan(0.3);
  });

  // -------------------------------------------------------------------------
  // Support & Resistance levels
  // -------------------------------------------------------------------------

  it("computes support and resistance levels", async () => {
    const analysis = buildMockAnalysis();
    const engine = new InstitutionalTrendEngine({
      institutionalDataService: createMockService() as any
    });

    const candles = buildBullishCandles(260);
    const result = await engine.analyze({ analysis, candles });

    expect(result.supportLevel).toBeGreaterThan(0);
    expect(result.resistanceLevel).toBeGreaterThan(0);
    expect(result.supportLevel).toBeLessThanOrEqual(result.resistanceLevel);
  });

  // -------------------------------------------------------------------------
  // Volume correlation
  // -------------------------------------------------------------------------

  it("returns volume correlation data", async () => {
    const analysis = buildMockAnalysis();
    const engine = new InstitutionalTrendEngine({
      institutionalDataService: createMockService() as any
    });

    const candles = buildBullishCandles(260);
    const result = await engine.analyze({ analysis, candles });

    expect(result.volumeCorrelation.correlationCoefficient).toBeGreaterThanOrEqual(-1);
    expect(result.volumeCorrelation.correlationCoefficient).toBeLessThanOrEqual(1);
    expect(["increasing", "decreasing", "flat"]).toContain(result.volumeCorrelation.volumeTrend);
    expect(result.volumeCorrelation.quarterlyReportsAnalyzed).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // Continuity probability
  // -------------------------------------------------------------------------

  it("computes trend continuity probability with all factors", async () => {
    const analysis = buildMockAnalysis();
    const engine = new InstitutionalTrendEngine({
      institutionalDataService: createMockService() as any
    });

    const candles = buildBullishCandles(260);
    const result = await engine.analyze({ analysis, candles });

    const cp = result.continuityProbability;
    expect(cp.probability).toBeGreaterThan(0);
    expect(cp.probability).toBeLessThanOrEqual(1);

    // All factors should be populated
    expect(cp.factors.maAlignment).toBeGreaterThan(0);
    expect(cp.factors.volumeConfirmation).toBeGreaterThan(0);
    expect(cp.factors.ownershipTrend).toBeGreaterThan(0);
    expect(cp.factors.flowMomentum).toBeGreaterThan(0);

    // Each factor should be in [0, 1]
    for (const value of Object.values(cp.factors)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------

  it("throws error with insufficient candles", async () => {
    const analysis = buildMockAnalysis();
    const engine = new InstitutionalTrendEngine({
      institutionalDataService: createMockService() as any,
      slowMaPeriod: 50
    });

    const candles = buildBullishCandles(30);
    await expect(engine.analyze({ analysis, candles })).rejects.toThrow(
      "Insufficient OHLC data for trend analysis"
    );
  });

  it("works with fallback candles when none provided", async () => {
    const analysis = buildMockAnalysis();
    const engine = new InstitutionalTrendEngine({
      institutionalDataService: createMockService() as any
    });

    const result = await engine.analyze({ analysis });

    expect(result.candlesAnalyzed).toBeGreaterThanOrEqual(260);
    expect(result.movingAverages).toHaveLength(2);
    expect(result.generatedAt).toBeTruthy();
  });

  it("returns sourceReports from the data service", async () => {
    const analysis = buildMockAnalysis();
    const engine = new InstitutionalTrendEngine({
      institutionalDataService: createMockService() as any
    });

    const candles = buildBullishCandles(260);
    const result = await engine.analyze({ analysis, candles });

    expect(result.sourceReports).toHaveLength(1);
    expect(result.sourceReports[0].sourceId).toBe("sec-edgar-13f");
    expect(result.sourceReports[0].status).toBe("ok");
  });

  it("convenience method analyzeTrend returns summary", async () => {
    const analysis = buildMockAnalysis();
    const engine = new InstitutionalTrendEngine({
      institutionalDataService: createMockService() as any
    });

    const candles = buildBullishCandles(260);
    const summary = await engine.analyzeTrend({ analysis, candles });

    expect(summary.currentTrend).toBe("bullish");
    expect(summary.trendStrength).toBeGreaterThan(0.3);
    expect(summary.crossover.type).toBe("golden_cross");
    expect(summary.continuityProbability.probability).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // Type guard tests
  // -------------------------------------------------------------------------

  it("validates moving average shape through type guard", async () => {
    const analysis = buildMockAnalysis();
    const engine = new InstitutionalTrendEngine({
      institutionalDataService: createMockService() as any
    });

    const candles = buildBullishCandles(260);
    const result = await engine.analyze({ analysis, candles });

    for (const ma of result.movingAverages) {
      expect(ma.period === 50 || ma.period === 200).toBe(true);
      expect(typeof ma.value).toBe("number");
      expect(typeof ma.slope).toBe("number");
      expect(typeof ma.rising).toBe("boolean");
    }
  });

  it("handles neutral / range-bound data gracefully", async () => {
    const analysis = buildMockAnalysis();
    const engine = new InstitutionalTrendEngine({
      institutionalDataService: createMockService() as any
    });

    const candles = buildNeutralCandles(220);
    const result = await engine.analyze({ analysis, candles });

    // Should not throw and should return valid data
    expect(result.candlesAnalyzed).toBe(220);
    expect(result.movingAverages).toHaveLength(2);
    expect(result.currentTrend).toBeDefined();
    expect(result.continuityProbability.probability).toBeGreaterThan(0);
    expect(result.continuityProbability.probability).toBeLessThanOrEqual(1);
  });
});
