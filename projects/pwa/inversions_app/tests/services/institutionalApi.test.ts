import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getInstitutionalAnalysis,
  getRegulatoryPositions,
  type InstitutionalAnalysisResponse,
  type RegulatoryPositionsResponse
} from "../../src/services/institutional/institutionalApi";

describe("institutionalApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches institutional analysis with query params", async () => {
    const payload: InstitutionalAnalysisResponse = {
      request: { ticker: "SPY", period: "daily", horizon: "medium", analysisId: "a1" },
      analysis: {
        analysisId: "a1", ticker: "SPY", period: "daily", volume: 1e6,
        liquidity: "high", horizon: "medium", fundsOwnershipPct: 0.05,
        flows: { inflows: 1e6, outflows: 5e5, asOf: "2026-05-20" },
        openPositions: { count: 120 }
      },
      zones: { all: [], support: [], resistance: [] },
      trends: {
        direction: "bullish", score: 0.7, confidence: 0.8,
        rationale: "Strong support", supportStrength: 0.8,
        resistanceStrength: 0.4, flowBias: 0.6
      },
      metrics: {
        candlesAnalyzed: 100, zoneCount: 5, supportZoneCount: 3,
        resistanceZoneCount: 2, averageZoneStrength: 0.6,
        maxZoneStrength: 0.9, averageZoneConfidence: 0.7,
        sourceCount: 3, liquidity: "high", volume: 1e6,
        openPositions: 120, fundsOwnershipPct: 0.05, netFlow: 5e5
      },
      sourceReports: [],
      generatedAt: new Date().toISOString()
    };

    window.localStorage.setItem("inversions.dev.token", "tok-inst");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => payload
    } as Response);

    const response = await getInstitutionalAnalysis({ ticker: "SPY", period: "daily", horizon: "medium" });

    expect(response.request.ticker).toBe("SPY");
    expect(response.trends.direction).toBe("bullish");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/institutional/analysis?ticker=SPY&period=daily&horizon=medium",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer tok-inst" })
      })
    );
  });

  it("fetches regulatory positions", async () => {
    const payload: RegulatoryPositionsResponse = {
      request: { ticker: "AAPL", period: "quarterly", horizon: "long", analysisId: "a2" },
      analysis: {
        ticker: "AAPL", period: "quarterly", horizon: "long",
        fundsOwnershipPct: 0.08,
        flows: { inflows: 2e6, outflows: 1e6, asOf: "2026-05-20" },
        openPositions: { count: 200, notional: 5e7 }
      },
      positions13F: [{ sourceId: "sec", asOf: "2026-05-20", count: 150, confidence: 0.9 }],
      flows: { inflows: 2e6, outflows: 1e6, netFlow: 1e6, asOf: "2026-05-20" },
      sourceReports: [],
      cacheHit: true,
      usedSourceIds: ["sec"]
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => payload
    } as Response);

    const response = await getRegulatoryPositions({ ticker: "AAPL", period: "quarterly", horizon: "long" });

    expect(response.cacheHit).toBe(true);
    expect(response.positions13F[0].sourceId).toBe("sec");
  });

  it("throws on analysis error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false, status: 500 } as Response);

    await expect(
      getInstitutionalAnalysis({ ticker: "INVALID", period: "daily", horizon: "short" })
    ).rejects.toThrow("Error al obtener analisis institucional: 500");
  });

  it("throws on positions error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false, status: 403 } as Response);

    await expect(
      getRegulatoryPositions({ ticker: "INVALID", period: "daily", horizon: "short" })
    ).rejects.toThrow("Error al obtener posiciones regulatorias: 403");
  });
});
