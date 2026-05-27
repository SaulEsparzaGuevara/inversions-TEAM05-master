import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  submitChatQuestion,
  pollChatResponse,
  pollUntilComplete,
  type AIChatPollingResponse,
  type AIChatResponse
} from "../../src/services/ai/aiChatApi";

describe("aiChatApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("submits chat question and returns pending polling response", async () => {
    const polling: AIChatPollingResponse = {
      status: "pending",
      contextId: "ctx-1",
      responseId: "resp-1",
      pollingUrl: "/api/ai/institutional-chat/poll/resp-1",
      retryAfterSeconds: 2,
      ai_unavailable: false,
      timestamp: new Date().toISOString()
    };

    window.localStorage.setItem("inversions.dev.token", "tok-chat");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => polling
    } as Response);

    const response = await submitChatQuestion({
      ticker: "SPY",
      currentPrice: 450,
      question: "Best coverage?",
      zones: { zones: [], analysis: {} as any, candlesAnalyzed: 0, sourceReports: [], generatedAt: "" }
    });

    expect(response.status).toBe("pending");
    expect(response.responseId).toBe("resp-1");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/ai/institutional-chat",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer tok-chat"
        })
      })
    );
  });

  it("polls and returns completed response", async () => {
    const completed: AIChatResponse = {
      contextId: "ctx-1",
      responseId: "resp-1",
      ticker: "SPY",
      narrative: "Protective put is recommended.",
      reasoning: ["Downside protection"],
      scenarioAnalysis: [{ label: "Bear", description: "Market drops", protectionLevel: "high", potentialPnL: 500 }],
      recommendation: "protective_put",
      evidenceIds: ["src-1"],
      modelVersion: "gemini-2.5-flash",
      responseHash: "abc123",
      ai_unavailable: false,
      timestamp: new Date().toISOString()
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => completed
    } as Response);

    const response = await pollChatResponse("resp-1");
    expect("narrative" in response && response.narrative).toBe("Protective put is recommended.");
  });

  it("returns pending on poll while AI is still processing", async () => {
    const pending: AIChatPollingResponse = {
      status: "pending",
      contextId: "ctx-1",
      responseId: "resp-1",
      ai_unavailable: false,
      timestamp: new Date().toISOString()
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => pending
    } as Response);

    const response = await pollChatResponse("resp-1");
    expect("status" in response && response.status).toBe("pending");
  });

  it("returns degraded response on 503", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      status: 503,
      ok: false,
      json: async () => ({ ai_unavailable: true })
    } as Response);

    const response = await submitChatQuestion({
      ticker: "SPY",
      currentPrice: 450,
      question: "Hi",
      zones: { zones: [], analysis: {} as any, candlesAnalyzed: 0, sourceReports: [], generatedAt: "" }
    });

    expect(response.ai_unavailable).toBe(true);
  });

  it("polls until complete and returns final response", async () => {
    const completed: AIChatResponse = {
      contextId: "ctx-2",
      responseId: "resp-2",
      ticker: "SPY",
      narrative: "Use collar strategy.",
      reasoning: [],
      scenarioAnalysis: [],
      recommendation: "collar_put",
      evidenceIds: [],
      modelVersion: "gemini-2.5-flash",
      responseHash: "def456",
      ai_unavailable: false,
      timestamp: new Date().toISOString()
    };

    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "pending", responseId: "resp-2" } as AIChatPollingResponse)
      } as Response)
      .mockResolvedValue({
        ok: true,
        json: async () => completed
      } as Response);

    const result = await pollUntilComplete("resp-2");
    expect(result.narrative).toBe("Use collar strategy.");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws POLL_TIMEOUT after max attempts", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ status: "pending", responseId: "resp-3", ai_unavailable: false })
    } as Response);

    await expect(pollUntilComplete("resp-3")).rejects.toThrow("POLL_TIMEOUT");
  }, 40000);
});
