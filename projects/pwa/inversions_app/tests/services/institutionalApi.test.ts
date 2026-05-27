import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getInstitutionalAnalysis,
  getRegulatoryPositions,
  type InstitutionalAnalysisResponse,
  type RegulatoryPositionsResponse
} from "../../src/services/institutional/institutionalApi";
import { clearCache } from "../../src/services/apiCache";

// Helper to build a mock Response
function mockResponse(overrides: Partial<Response> = {}): Response {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    headers: new Headers(),
    json: async () => ({}),
    clone: function () {
      return mockResponse(overrides);
    },
    ...overrides
  } as Response;
}

describe("institutionalApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    clearCache();
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

  // ── Cache tests ───────────────────────────────────────

  it("returns cached analysis on second identical call", async () => {
    const payload: InstitutionalAnalysisResponse = {
      request: { ticker: "CACHE", period: "daily", horizon: "short", analysisId: "c1" },
      analysis: {
        analysisId: "c1", ticker: "CACHE", period: "daily", volume: 1e6,
        liquidity: "high", horizon: "short", fundsOwnershipPct: 0.05,
        flows: { inflows: 1e6, outflows: 5e5, asOf: "2026-05-20" },
        openPositions: { count: 120 }
      },
      zones: { all: [], support: [], resistance: [] },
      trends: { direction: "bullish", score: 0.7, confidence: 0.8, rationale: "", supportStrength: 0.7, resistanceStrength: 0.5, flowBias: 0.6 },
      metrics: { candlesAnalyzed: 100, zoneCount: 5, supportZoneCount: 3, resistanceZoneCount: 2, averageZoneStrength: 0.6, maxZoneStrength: 0.9, averageZoneConfidence: 0.7, sourceCount: 3, liquidity: "high", volume: 1e6, openPositions: 120, fundsOwnershipPct: 0.05, netFlow: 5e5 },
      sourceReports: [],
      generatedAt: new Date().toISOString()
    };

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse({ json: async () => payload })
    );

    const params = { ticker: "CACHE", period: "daily" as const, horizon: "short" as const };
    const first = await getInstitutionalAnalysis(params);
    expect(first.analysis.analysisId).toBe("c1");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const second = await getInstitutionalAnalysis(params);
    expect(second.analysis.analysisId).toBe("c1");
    expect(fetchMock).toHaveBeenCalledTimes(1); // cache hit, no extra fetch
  });

  it("cache miss for different ticker in institutional analysis", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse({
        json: async () => ({
          request: { ticker: "X", period: "daily", horizon: "short", analysisId: "x" },
          analysis: { analysisId: "x", ticker: "X", period: "daily", volume: 1, liquidity: "high", horizon: "short", fundsOwnershipPct: 0, flows: { inflows: 0, outflows: 0, asOf: "" }, openPositions: { count: 0 } },
          zones: { all: [], support: [], resistance: [] },
          trends: { direction: "bullish", score: 0, confidence: 0, rationale: "", supportStrength: 0, resistanceStrength: 0, flowBias: 0 },
          metrics: { candlesAnalyzed: 0, zoneCount: 0, supportZoneCount: 0, resistanceZoneCount: 0, averageZoneStrength: 0, maxZoneStrength: 0, averageZoneConfidence: 0, sourceCount: 0, liquidity: "high", volume: 1, openPositions: 0, fundsOwnershipPct: 0, netFlow: 0 },
          sourceReports: [],
          generatedAt: new Date().toISOString()
        })
      })
    );

    await getInstitutionalAnalysis({ ticker: "AAPL", period: "daily", horizon: "short" });
    await getInstitutionalAnalysis({ ticker: "MSFT", period: "daily", horizon: "short" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  // ── Retry tests ───────────────────────────────────────

  it("retries on 5xx and eventually succeeds for analysis", async () => {
    const payload: InstitutionalAnalysisResponse = {
      request: { ticker: "RETRY", period: "daily", horizon: "short", analysisId: "r1" },
      analysis: { analysisId: "r1", ticker: "RETRY", period: "daily", volume: 1e6, liquidity: "high", horizon: "short", fundsOwnershipPct: 0.05, flows: { inflows: 0, outflows: 0, asOf: "" }, openPositions: { count: 120 } },
      zones: { all: [], support: [], resistance: [] },
      trends: { direction: "bullish", score: 0.7, confidence: 0.8, rationale: "", supportStrength: 0.7, resistanceStrength: 0.5, flowBias: 0.6 },
      metrics: { candlesAnalyzed: 100, zoneCount: 5, supportZoneCount: 3, resistanceZoneCount: 2, averageZoneStrength: 0.6, maxZoneStrength: 0.9, averageZoneConfidence: 0.7, sourceCount: 3, liquidity: "high", volume: 1e6, openPositions: 120, fundsOwnershipPct: 0.05, netFlow: 5e5 },
      sourceReports: [],
      generatedAt: new Date().toISOString()
    };

    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({ ok: false, status: 502 } as Response)
      .mockResolvedValueOnce({ ok: false, status: 503 } as Response)
      .mockResolvedValueOnce(mockResponse({ json: async () => payload }));

    const response = await getInstitutionalAnalysis({ ticker: "RETRY", period: "daily", horizon: "short" });
    expect(response.analysis.analysisId).toBe("r1");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("retries on 429 and succeeds for positions", async () => {
    const payload: RegulatoryPositionsResponse = {
      request: { ticker: "RATE", period: "daily", horizon: "short", analysisId: "r2" },
      analysis: { ticker: "RATE", period: "daily", horizon: "short", fundsOwnershipPct: 0.05, flows: { inflows: 0, outflows: 0, asOf: "" }, openPositions: { count: 10 } },
      positions13F: [{ sourceId: "sec", asOf: "2026-05-20", count: 10, confidence: 0.9 }],
      flows: { inflows: 0, outflows: 0, netFlow: 0, asOf: "" },
      sourceReports: [],
      cacheHit: true,
      usedSourceIds: ["sec"]
    };

    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({ ok: false, status: 429 } as Response)
      .mockResolvedValueOnce({ ok: false, status: 429 } as Response)
      .mockResolvedValueOnce(mockResponse({ json: async () => payload }));

    const response = await getRegulatoryPositions({ ticker: "RATE", period: "daily", horizon: "short" });
    expect(response.cacheHit).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("does NOT retry on 4xx (non-429)", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: false, status: 400 } as Response);

    await expect(
      getInstitutionalAnalysis({ ticker: "BAD", period: "daily", horizon: "short" })
    ).rejects.toThrow("Error al obtener analisis institucional: 400");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  // ── AbortController tests ─────────────────────────────

  it("aborts in-flight institutional analysis request", async () => {
    const ac = new AbortController();

    vi.spyOn(globalThis, "fetch").mockImplementation(
      async (_url: string, init?: RequestInit) => {
        if (init?.signal?.aborted) {
          throw new DOMException("The operation was aborted", "AbortError");
        }
        await new Promise<void>((_, reject) => {
          init!.signal!.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted", "AbortError"));
          }, { once: true });
        });
        return mockResponse();
      }
    );

    const requestPromise = getInstitutionalAnalysis(
      { ticker: "ABORT", period: "daily", horizon: "short" },
      ac.signal
    );

    setTimeout(() => ac.abort(), 50);
    await expect(requestPromise).rejects.toThrow(/aborted/i);
  });

  it("throws AbortError when signal is already aborted (positions)", async () => {
    const ac = new AbortController();
    ac.abort();

    await expect(
      getRegulatoryPositions(
        { ticker: "PRE", period: "daily", horizon: "short" },
        ac.signal
      )
    ).rejects.toThrow(/aborted/i);
  });
});
