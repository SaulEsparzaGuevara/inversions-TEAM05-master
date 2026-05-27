import { describe, expect, it } from "vitest";
import { createInstitutionalAnalysisContract } from "../../../src/modules/institutional/institutionalContract.js";
import { ExpirationAnalysisEngine } from "../../../src/modules/institutional/expirationAnalysisEngine.js";

function buildMockAnalysis(ticker = "AAPL", overrides: Record<string, unknown> = {}) {
  return createInstitutionalAnalysisContract({
    analysisId: "expiry-test-001",
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

describe("ExpirationAnalysisEngine", () => {
  // -------------------------------------------------------------------------
  // Expiration events detection
  // -------------------------------------------------------------------------

  it("detects monthly OpEx events in the look-ahead window", async () => {
    const analysis = buildMockAnalysis();
    const engine = new ExpirationAnalysisEngine({
      institutionalDataService: createMockService() as any,
      lookAheadMonths: 5
    });

    const refDate = new Date("2026-06-01T00:00:00.000Z");
    const result = await engine.analyze({ analysis, referenceDate: refDate });

    expect(result.expirationEvents.length).toBeGreaterThan(0);
    const monthlyOpEx = result.expirationEvents.filter((e) => e.type === "monthly_opex");
    expect(monthlyOpEx.length).toBeGreaterThanOrEqual(2);
    for (const event of monthlyOpEx) {
      expect(event.type).toBe("monthly_opex");
      expect(event.significance).toBeGreaterThan(0);
      expect(event.daysUntil).toBeGreaterThan(0);
      expect(["bullish", "bearish", "neutral"]).toContain(event.directionalBias);
    }
  });

  it("detects quarterly OpEx events in quarterly months", async () => {
    const analysis = buildMockAnalysis();
    const engine = new ExpirationAnalysisEngine({
      institutionalDataService: createMockService() as any,
      lookAheadMonths: 6
    });

    const refDate = new Date("2026-06-01T00:00:00.000Z");
    const result = await engine.analyze({ analysis, referenceDate: refDate });

    const quarterlyEvents = result.expirationEvents.filter(
      (e) => e.type === "quarterly_opex"
    );
    expect(quarterlyEvents.length).toBeGreaterThan(0);
    for (const event of quarterlyEvents) {
      expect(event.significance).toBeGreaterThanOrEqual(0.8);
    }
  });

  it("detects Triple Witching in quarterly months", async () => {
    const analysis = buildMockAnalysis();
    const engine = new ExpirationAnalysisEngine({
      institutionalDataService: createMockService() as any,
      lookAheadMonths: 6
    });

    const refDate = new Date("2026-06-01T00:00:00.000Z");
    const result = await engine.analyze({ analysis, referenceDate: refDate });

    // Sep 2026 is a triple witching month (Sep, Dec, Mar, Jun)
    const tripleWitchEvents = result.catalystWindows.filter(
      (w) => w.type === "triple_witching"
    );
    expect(tripleWitchEvents.length).toBeGreaterThanOrEqual(1);
    expect(tripleWitchEvents[0].confidence).toBeGreaterThan(0.8);
  });

  it("sorts expiration events by date ascending", async () => {
    const analysis = buildMockAnalysis();
    const engine = new ExpirationAnalysisEngine({
      institutionalDataService: createMockService() as any,
      lookAheadMonths: 6
    });

    const refDate = new Date("2026-06-01T00:00:00.000Z");
    const result = await engine.analyze({ analysis, referenceDate: refDate });

    for (let i = 1; i < result.expirationEvents.length; i++) {
      expect(result.expirationEvents[i].date).toBeGreaterThanOrEqual(
        result.expirationEvents[i - 1].date
      );
    }
  });

  // -------------------------------------------------------------------------
  // Slippery slope
  // -------------------------------------------------------------------------

  it("computes slippery slope with valid drift and acceleration", async () => {
    const analysis = buildMockAnalysis();
    const engine = new ExpirationAnalysisEngine({
      institutionalDataService: createMockService() as any
    });

    const refDate = new Date("2026-06-01T00:00:00.000Z");
    const result = await engine.analyze({ analysis, referenceDate: refDate });

    const slope = result.slipperySlope;
    expect(["call_skew", "put_skew", "symmetric"]).toContain(slope.direction);
    expect(slope.accelerationFactor).toBeGreaterThanOrEqual(0);
    expect(slope.accelerationFactor).toBeLessThanOrEqual(1);
    expect(slope.confidence).toBeGreaterThanOrEqual(0);
    expect(slope.confidence).toBeLessThanOrEqual(1);
    expect(slope.attractorStrike).toBeGreaterThan(0);
    expect(slope.peakDays).toBeGreaterThanOrEqual(0);
  });

  it("detects call skew with bullish institutional flow", async () => {
    const analysis = buildMockAnalysis("AAPL", {
      fundsOwnershipPct: 65,
      flows: { inflows: 2_000_000, outflows: 300_000, asOf: "2026-05-20T00:00:00.000Z" }
    });
    const engine = new ExpirationAnalysisEngine({
      institutionalDataService: createMockService() as any
    });

    const refDate = new Date("2026-06-01T00:00:00.000Z");
    const result = await engine.analyze({ analysis, referenceDate: refDate });

    expect(result.slipperySlope.direction).toBe("call_skew");
  });

  it("detects put skew with bearish institutional flow", async () => {
    const analysis = buildMockAnalysis("AAPL", {
      fundsOwnershipPct: 12,
      flows: { inflows: 200_000, outflows: 1_800_000, asOf: "2026-05-20T00:00:00.000Z" }
    });
    const engine = new ExpirationAnalysisEngine({
      institutionalDataService: createMockService() as any
    });

    const refDate = new Date("2026-06-01T00:00:00.000Z");
    const result = await engine.analyze({ analysis, referenceDate: refDate });

    expect(result.slipperySlope.direction).toBe("put_skew");
  });

  // -------------------------------------------------------------------------
  // Catalyst windows
  // -------------------------------------------------------------------------

  it("detects multiple catalyst windows in look-ahead", async () => {
    const analysis = buildMockAnalysis();
    const engine = new ExpirationAnalysisEngine({
      institutionalDataService: createMockService() as any,
      lookAheadMonths: 6
    });

    const refDate = new Date("2026-06-01T00:00:00.000Z");
    const result = await engine.analyze({ analysis, referenceDate: refDate });

    expect(result.catalystWindows.length).toBeGreaterThanOrEqual(5);
    const types = new Set(result.catalystWindows.map((w) => w.type));
    // Should include multiple catalyst types
    expect(types.has("monthly_opex")).toBe(true);
    expect(types.has("fomc")).toBe(true);
    expect(types.has("cpi")).toBe(true);
  });

  it("sorts catalyst windows by date ascending", async () => {
    const analysis = buildMockAnalysis();
    const engine = new ExpirationAnalysisEngine({
      institutionalDataService: createMockService() as any,
      lookAheadMonths: 6
    });

    const refDate = new Date("2026-06-01T00:00:00.000Z");
    const result = await engine.analyze({ analysis, referenceDate: refDate });

    for (let i = 1; i < result.catalystWindows.length; i++) {
      expect(result.catalystWindows[i].date).toBeGreaterThanOrEqual(
        result.catalystWindows[i - 1].date
      );
    }
  });

  // -------------------------------------------------------------------------
  // Time decay profile
  // -------------------------------------------------------------------------

  it("computes time decay profile with correct regime", async () => {
    const analysis = buildMockAnalysis();
    const engine = new ExpirationAnalysisEngine({
      institutionalDataService: createMockService() as any
    });

    const refDate = new Date("2026-06-01T00:00:00.000Z");
    const result = await engine.analyze({ analysis, referenceDate: refDate });

    const td = result.timeDecay;
    expect(["far", "near", "at_expiration"]).toContain(td.decayRegime);
    expect(td.thetaPct).toBeGreaterThanOrEqual(0);
    expect(td.gammaExposurePct).toBeGreaterThanOrEqual(0);
    expect(td.accelerationDays).toBeGreaterThanOrEqual(0);
    expect(td.vannaExposurePct).toBeGreaterThanOrEqual(0);
    expect(td.charmPct).toBeGreaterThanOrEqual(0);
  });

  it("shows at_expiration regime when very close to expiration", async () => {
    const analysis = buildMockAnalysis();
    const engine = new ExpirationAnalysisEngine({
      institutionalDataService: createMockService() as any
    });

    // Set reference date to be just before monthly OpEx (third Friday)
    // June 2026: third Friday is June 19
    const refDate = new Date("2026-06-18T00:00:00.000Z");
    const result = await engine.analyze({ analysis, referenceDate: refDate });

    expect(result.timeDecay.decayRegime).toBe("at_expiration");
    expect(result.timeDecay.thetaPct).toBeGreaterThan(0.5);
  });

  // -------------------------------------------------------------------------
  // Quarterly report correlation
  // -------------------------------------------------------------------------

  it("computes quarterly report correlation", async () => {
    const analysis = buildMockAnalysis();
    const engine = new ExpirationAnalysisEngine({
      institutionalDataService: createMockService() as any,
      lookAheadMonths: 6
    });

    const refDate = new Date("2026-06-01T00:00:00.000Z");
    const result = await engine.analyze({ analysis, referenceDate: refDate });

    const qc = result.quarterlyCorrelation;
    expect(qc.totalQuarterlyWindows).toBeGreaterThan(0);
    expect(qc.overlappingWindows).toBeGreaterThanOrEqual(0);
    expect(qc.filingExpirationCorrelation).toBeGreaterThanOrEqual(-1);
    expect(qc.filingExpirationCorrelation).toBeLessThanOrEqual(1);
    expect(typeof qc.currentlyInWindow).toBe("boolean");
    expect(qc.daysUntilNextWindow).toBeGreaterThanOrEqual(0);
  });

  // -------------------------------------------------------------------------
  // Convenience method
  // -------------------------------------------------------------------------

  it("convenience method analyzeExpirationSummary returns summary", async () => {
    const analysis = buildMockAnalysis();
    const engine = new ExpirationAnalysisEngine({
      institutionalDataService: createMockService() as any
    });

    const refDate = new Date("2026-06-01T00:00:00.000Z");
    const summary = await engine.analyzeExpirationSummary({ analysis, referenceDate: refDate });

    expect(summary.expirationEvents.length).toBeGreaterThan(0);
    expect(summary.slipperySlope).toBeDefined();
    expect(summary.catalystWindows.length).toBeGreaterThan(0);
    expect(summary.timeDecay).toBeDefined();
    expect(summary.quarterlyCorrelation).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------

  it("handles year transition correctly (Dec to Jan)", async () => {
    const analysis = buildMockAnalysis();
    const engine = new ExpirationAnalysisEngine({
      institutionalDataService: createMockService() as any,
      lookAheadMonths: 3
    });

    const refDate = new Date("2026-12-15T00:00:00.000Z");
    const result = await engine.analyze({ analysis, referenceDate: refDate });

    // Should detect Jan 2027 events
    const janEvents = result.expirationEvents.filter(
      (e) => e.label.includes("Jan")
    );
    expect(janEvents.length).toBeGreaterThan(0);
  });

  it("returns sourceReports from data service", async () => {
    const analysis = buildMockAnalysis();
    const engine = new ExpirationAnalysisEngine({
      institutionalDataService: createMockService() as any
    });

    const refDate = new Date("2026-06-01T00:00:00.000Z");
    const result = await engine.analyze({ analysis, referenceDate: refDate });

    expect(result.sourceReports).toHaveLength(1);
    expect(result.sourceReports[0].sourceId).toBe("sec-edgar-13f");
    expect(result.sourceReports[0].status).toBe("ok");
  });

  it("has valid generatedAt timestamp", async () => {
    const analysis = buildMockAnalysis();
    const engine = new ExpirationAnalysisEngine({
      institutionalDataService: createMockService() as any
    });

    const refDate = new Date("2026-06-01T00:00:00.000Z");
    const result = await engine.analyze({ analysis, referenceDate: refDate });

    expect(result.generatedAt).toBeTruthy();
    expect(new Date(result.generatedAt).toISOString()).toBe(result.generatedAt);
  });

  // -------------------------------------------------------------------------
  // Type guard tests
  // -------------------------------------------------------------------------

  it("validates expiration event shape through type guard", async () => {
    const analysis = buildMockAnalysis();
    const engine = new ExpirationAnalysisEngine({
      institutionalDataService: createMockService() as any
    });

    const refDate = new Date("2026-06-01T00:00:00.000Z");
    const result = await engine.analyze({ analysis, referenceDate: refDate });

    for (const event of result.expirationEvents) {
      expect(typeof event.type).toBe("string");
      expect(typeof event.date).toBe("number");
      expect(typeof event.label).toBe("string");
      expect(typeof event.daysUntil).toBe("number");
      expect(typeof event.significance).toBe("number");
    }
  });
});
