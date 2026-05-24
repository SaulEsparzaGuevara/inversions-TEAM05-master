import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  postCoverageAnalyze,
  postCoverageCompare,
  postCoverageSimulate,
  type CoverageAnalysisResponse,
  type CoverageComparisonResponse,
  type CoverageSimulationResponse
} from "../../src/services/coverage/coverageApi";

describe("coverageApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
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
});
