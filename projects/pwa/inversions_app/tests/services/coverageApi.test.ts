import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  postCoverageAnalyze,
  postCoverageCompare,
  postCoverageSimulate,
  type CoverageAnalysisResponse,
  type CoverageComparisonResponse,
  type CoverageSimulationResponse
} from "../../src/services/coverage/coverageApi";
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

describe("coverageApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    clearCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends analyze request with bearer token", async () => {
    const payload: CoverageAnalysisResponse = {
      results: [],
      generatedAt: new Date().toISOString()
    };

    window.localStorage.setItem("inversions.dev.token", "tok-analyze");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => payload
    } as Response);

    const response = await postCoverageAnalyze({
      ticker: "SPY",
      currentPrice: 450,
      shares: 100,
      strikes: [440, 460]
    });

    expect(response.generatedAt).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/coverage/analyze",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer tok-analyze",
          "Content-Type": "application/json"
        }),
        body: expect.stringContaining("SPY")
      })
    );
  });

  it("sends compare request with strikes", async () => {
    const payload: CoverageComparisonResponse = {
      engineId: "comp-1",
      ticker: "SPY",
      currentPrice: 450,
      entries: [],
      recommendedKind: "protective_put",
      generatedAt: new Date().toISOString()
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => payload
    } as Response);

    const response = await postCoverageCompare({
      ticker: "SPY",
      currentPrice: 450,
      shares: 100
    });

    expect(response.recommendedKind).toBe("protective_put");
  });

  it("sends simulate request", async () => {
    const payload: CoverageSimulationResponse = {
      engineId: "sim-1",
      strategyKind: "protective_put",
      currentPrice: 450,
      deterministicScenarios: [],
      generatedAt: new Date().toISOString()
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => payload
    } as Response);

    const response = await postCoverageSimulate({
      ticker: "SPY",
      currentPrice: 450,
      shares: 100
    });

    expect(response.strategyKind).toBe("protective_put");
  });

  it("throws on analyze error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false, status: 400 } as Response);

    await expect(
      postCoverageAnalyze({ ticker: "SPY", currentPrice: 450, shares: 100 })
    ).rejects.toThrow("Error al analizar coberturas: 400");
  });

  it("throws on compare error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false, status: 403 } as Response);

    await expect(
      postCoverageCompare({ ticker: "SPY", currentPrice: 450, shares: 100 })
    ).rejects.toThrow("Error al comparar coberturas: 403");
  });

  it("throws on simulate error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false, status: 500 } as Response);

    await expect(
      postCoverageSimulate({ ticker: "SPY", currentPrice: 450, shares: 100 })
    ).rejects.toThrow("Error al simular cobertura: 500");
  });

  // ── Cache tests ───────────────────────────────────────

  it("returns cached data on second identical call (no fetch)", async () => {
    const payload: CoverageAnalysisResponse = {
      results: [],
      generatedAt: new Date().toISOString()
    };

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse({ json: async () => payload })
    );

    // First call — goes to network
    const first = await postCoverageAnalyze({
      ticker: "CACHE",
      currentPrice: 100,
      shares: 10
    });
    expect(first.generatedAt).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Second call — should hit cache
    const second = await postCoverageAnalyze({
      ticker: "CACHE",
      currentPrice: 100,
      shares: 10
    });
    expect(second.generatedAt).toBe(first.generatedAt);
    expect(fetchMock).toHaveBeenCalledTimes(1); // no extra fetch
  });

  it("cache miss for different payload", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse({
        json: async () => ({ results: [], generatedAt: new Date().toISOString() })
      })
    );

    await postCoverageAnalyze({ ticker: "SPY", currentPrice: 450, shares: 100 });
    await postCoverageAnalyze({ ticker: "AAPL", currentPrice: 200, shares: 50 });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  // ── Retry tests ───────────────────────────────────────

  it("retries on 5xx and eventually succeeds", async () => {
    const payload: CoverageAnalysisResponse = {
      results: [],
      generatedAt: new Date().toISOString()
    };

    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({ ok: false, status: 502 } as Response)
      .mockResolvedValueOnce({ ok: false, status: 503 } as Response)
      .mockResolvedValueOnce(mockResponse({ json: async () => payload }));

    const response = await postCoverageAnalyze({
      ticker: "RETRY",
      currentPrice: 100,
      shares: 10
    });

    expect(response.generatedAt).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("retries on 429 (rate-limit) and succeeds", async () => {
    const payload: CoverageAnalysisResponse = {
      results: [],
      generatedAt: new Date().toISOString()
    };

    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({ ok: false, status: 429 } as Response)
      .mockResolvedValueOnce({ ok: false, status: 429 } as Response)
      .mockResolvedValueOnce(mockResponse({ json: async () => payload }));

    const response = await postCoverageAnalyze({
      ticker: "RATE",
      currentPrice: 100,
      shares: 10
    });

    expect(response.generatedAt).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("does NOT retry on 4xx (non-429) errors", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: false, status: 400 } as Response);

    await expect(
      postCoverageAnalyze({ ticker: "BAD", currentPrice: 100, shares: 10 })
    ).rejects.toThrow("Error al analizar coberturas: 400");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws after exhausting retries on persistent 5xx", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: false, status: 502 } as Response);

    await expect(
      postCoverageAnalyze({ ticker: "DOWN", currentPrice: 100, shares: 10 })
    ).rejects.toThrow("Error al analizar coberturas: 502");

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  // ── AbortController tests ─────────────────────────────

  it("aborts in-flight request when signal is aborted", async () => {
    const ac = new AbortController();

    // Make fetch hang until the signal is aborted
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async (_url: string, init?: RequestInit) => {
        if (init?.signal) {
          // If the signal is already aborted, throw immediately
          if (init.signal.aborted) {
            throw new DOMException("The operation was aborted", "AbortError");
          }
          // Otherwise wait until it is
          await new Promise<void>((_, reject) => {
            init.signal!.addEventListener("abort", () => {
              reject(new DOMException("The operation was aborted", "AbortError"));
            }, { once: true });
          });
        }
        // Should never reach here
        return mockResponse();
      }
    );

    // Fire the request and abort ~100ms later
    const requestPromise = postCoverageAnalyze(
      { ticker: "ABORT", currentPrice: 100, shares: 10 },
      ac.signal
    );

    setTimeout(() => ac.abort(), 50);

    await expect(requestPromise).rejects.toThrow(/aborted/i);
  });

  it("throws AbortError when signal is already aborted", async () => {
    const ac = new AbortController();
    ac.abort(); // abort before even calling the function

    await expect(
      postCoverageAnalyze(
        { ticker: "PRE", currentPrice: 100, shares: 10 },
        ac.signal
      )
    ).rejects.toThrow(/aborted/i);
  });
});
