import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  evaluateSignal,
  getDashboardOrchestrator,
  getSignalDetails,
  type DashboardOrchestratorResponse,
  type EvaluateSignalResponse,
  type SignalDetailsResponse
} from "../../../src/services/signals/signalApi";

describe("signalApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("evaluates signal and forwards bearer token from localStorage", async () => {
    const payload: EvaluateSignalResponse = {
      signalId: "sig-1",
      correlationId: "corr-1",
      instrument: "AAPL",
      signal: "BUY",
      confidence: 0.8,
      confluenceScore: 80,
      explainability: {
        summary: "uptrend",
        evidence: []
      }
    };

    window.localStorage.setItem("inversions.dev.token", "token-123");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => payload
    } as Response);

    const response = await evaluateSignal({
      instrument: "AAPL",
      verdicts: []
    });

    expect(response.signalId).toBe("sig-1");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/signals/evaluate",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer token-123",
          "Content-Type": "application/json"
        })
      })
    );
  });

  it("throws on evaluate error response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false, status: 500 } as Response);

    await expect(
      evaluateSignal({
        instrument: "MSFT",
        verdicts: []
      })
    ).rejects.toThrow("Error al evaluar senal: 500");
  });

  it("gets signal details and throws on not found", async () => {
    const details: SignalDetailsResponse = {
      signalId: "sig-2",
      summary: "neutral",
      evidence: []
    };

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({ ok: true, json: async () => details } as Response)
      .mockResolvedValueOnce({ ok: false, status: 404 } as Response);

    const ok = await getSignalDetails("sig-2");
    expect(ok.summary).toBe("neutral");

    await expect(getSignalDetails("sig-missing")).rejects.toThrow(
      "Error al obtener detalle de senal: 404"
    );
  });

  it("builds dashboard orchestrator query string", async () => {
    const dashboard: DashboardOrchestratorResponse = {
      timeframe: "1d",
      generatedAt: new Date().toISOString(),
      instruments: ["AAPL"],
      cards: []
    };

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => dashboard
    } as Response);

    const response = await getDashboardOrchestrator({
      instruments: "AAPL,MSFT",
      timeframe: "4h"
    });

    expect(response.timeframe).toBe("1d");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/dashboard/orchestrator?instruments=AAPL%2CMSFT&timeframe=4h",
      expect.any(Object)
    );
  });
});