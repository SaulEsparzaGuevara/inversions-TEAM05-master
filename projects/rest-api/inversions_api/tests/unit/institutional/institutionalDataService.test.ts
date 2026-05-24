import { describe, expect, it, vi } from "vitest";
import { createInstitutionalAnalysisContract } from "../../../src/modules/institutional/institutionalContract.js";
import {
  InstitutionalDataService,
  type InstitutionalSourceConfig,
  type InstitutionalOverallStatus
} from "../../../src/modules/institutional/institutionalDataService.js";

function buildBaseRequest() {
  return createInstitutionalAnalysisContract({
    analysisId: "graceful-deg-test-001",
    ticker: "AAPL",
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
    requestedAt: "2026-05-20T00:00:00.000Z"
  });
}

function buildSourceOverrides(overrides: Partial<InstitutionalSourceConfig>): InstitutionalSourceConfig {
  return {
    sourceId: "test-source",
    kind: "sec_edgar_13f",
    label: "Test Source",
    enabled: true,
    tier: "free",
    baseUrl: "https://test.example.com",
    path: "/api/v1",
    ...overrides
  };
}

function buildMockFetch(response?: unknown, shouldThrow = false) {
  return vi.fn(async (_input: string, _init?: unknown) => {
    if (shouldThrow) {
      throw new Error("Network failure");
    }

    return {
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => response ?? { ticker: "AAPL", volume: 1_500_000, holdingsCount: 14 },
      text: async () => JSON.stringify(response ?? { ticker: "AAPL" }),
      headers: {
        get(_name: string) {
          return null;
        }
      }
    };
  });
}

describe("InstitutionalDataService — graceful degradation", () => {
  it("returns overallStatus='ok' when all sources succeed", async () => {
    const source = buildSourceOverrides({});
    const mockFetch = buildMockFetch({
      ticker: "AAPL",
      volume: 1_500_000,
      holdingsCount: 14,
      fundsOwnershipPct: 0.42,
      inflows: 850_000,
      outflows: 420_000
    });

    const service = new InstitutionalDataService({
      sources: [source],
      fetchImpl: mockFetch as any,
      now: () => Date.parse("2026-05-20T12:00:00.000Z")
    });

    const result = await service.resolve(buildBaseRequest());

    expect(result.overallStatus).toBe("ok");
    expect(result.sourceReports).toHaveLength(1);
    expect(result.sourceReports[0].status).toBe("ok");
    expect(result.analysis.ticker).toBe("AAPL");
  });

  it("returns overallStatus='partial' when some sources fail and some succeed", async () => {
    const failingSource = buildSourceOverrides({
      sourceId: "failing-source",
      label: "Failing Source",
      path: "/api/v1/fail"
    });
    const okSource = buildSourceOverrides({
      sourceId: "ok-source",
      label: "OK Source",
      kind: "finra_short_interest",
      path: "/api/v1/ok",
      priority: 10
    });

    const mockFetch = vi.fn(async (input: string) => {
      if (input.includes("/fail")) {
        throw new Error("Network failure");
      }
      return {
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({
          ticker: "AAPL",
          volume: 1_500_000,
          shortInterest: 500_000,
          holdingsCount: 10
        }),
        text: async () => "{}",
        headers: { get() { return null; } }
      };
    });

    const service = new InstitutionalDataService({
      sources: [failingSource, okSource],
      fetchImpl: mockFetch as any,
      now: () => Date.parse("2026-05-20T12:00:00.000Z")
    });

    const result = await service.resolve(buildBaseRequest());

    expect(result.overallStatus).toBe("partial");
    expect(result.sourceReports).toHaveLength(2);

    const failingReport = result.sourceReports.find((r) => r.sourceId === "failing-source");
    const okReport = result.sourceReports.find((r) => r.sourceId === "ok-source");

    expect(failingReport?.status).toBe("error");
    expect(failingReport?.error?.code).toBe("FETCH_ERROR");
    expect(okReport?.status).toBe("ok");
    expect(okReport?.observation).toBeDefined();

    // usedSourceIds should only include the successful source
    expect(result.usedSourceIds).toContain("ok-source");
    expect(result.usedSourceIds).not.toContain("failing-source");
  });

  it("returns overallStatus='all_failed' when all sources fail", async () => {
    const source1 = buildSourceOverrides({
      sourceId: "source-1",
      label: "Source 1",
      priority: 10
    });
    const source2 = buildSourceOverrides({
      sourceId: "source-2",
      label: "Source 2",
      kind: "finra_short_interest",
      priority: 20
    });

    const mockFetch = vi.fn(async () => {
      throw new Error("Network failure");
    });

    const service = new InstitutionalDataService({
      sources: [source1, source2],
      fetchImpl: mockFetch as any,
      now: () => Date.parse("2026-05-20T12:00:00.000Z")
    });

    const result = await service.resolve(buildBaseRequest());

    expect(result.overallStatus).toBe("all_failed");
    expect(result.sourceReports).toHaveLength(2);
    expect(result.sourceReports.every((r) => r.status === "error")).toBe(true);
    expect(result.sourceReports.every((r) => r.error !== undefined)).toBe(true);
    expect(result.usedSourceIds).toHaveLength(0);

    // Analysis contract should still be returned (the original request)
    expect(result.analysis.ticker).toBe("AAPL");
  });

  it("returns overallStatus='all_failed' when one source errors and another returns empty", async () => {
    const errorSource = buildSourceOverrides({
      sourceId: "error-source",
      label: "Error Source",
      path: "/api/v1/error",
      priority: 10
    });
    const emptySource = buildSourceOverrides({
      sourceId: "empty-source",
      label: "Empty Source",
      kind: "finra_short_interest",
      path: "/api/v1/empty",
      priority: 20
    });

    const mockFetch = vi.fn(async (input: string) => {
      if (input.includes("/error")) {
        throw new Error("Network failure");
      }
      // Returns empty payload — parser will produce null
      return {
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({}),
        text: async () => "{}",
        headers: { get() { return null; } }
      };
    });

    const service = new InstitutionalDataService({
      sources: [errorSource, emptySource],
      fetchImpl: mockFetch as any,
      now: () => Date.parse("2026-05-20T12:00:00.000Z")
    });

    const result = await service.resolve(buildBaseRequest());

    expect(result.overallStatus).toBe("all_failed");
    expect(result.sourceReports[0].status).toBe("error");
    expect(result.sourceReports[1].status).toBe("failed");
    expect(result.usedSourceIds).toHaveLength(0);
  });

  it("continues processing remaining sources after one fails (no throw on error)", async () => {
    // Important: the service should NOT throw when individual sources fail
    const failingSource = buildSourceOverrides({
      sourceId: "failing-source",
      label: "Failing Source",
      path: "/api/v1/fail",
      priority: 10
    });
    const okSource = buildSourceOverrides({
      sourceId: "ok-source",
      label: "OK Source",
      kind: "finra_short_interest",
      path: "/api/v1/ok",
      priority: 20
    });

    let callCount = 0;
    const mockFetch = vi.fn(async (input: string) => {
      callCount++;
      if (input.includes("/fail")) {
        throw new Error("Network failure");
      }
      return {
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({
          ticker: "AAPL",
          volume: 1_500_000,
          shortInterest: 500_000,
          holdingsCount: 10
        }),
        text: async () => "{}",
        headers: { get() { return null; } }
      };
    });

    const service = new InstitutionalDataService({
      sources: [failingSource, okSource],
      fetchImpl: mockFetch as any,
      now: () => Date.parse("2026-05-20T12:00:00.000Z")
    });

    // Should NOT throw — gracefully degrades
    const result = await service.resolve(buildBaseRequest());

    expect(result.overallStatus).toBe("partial");
    expect(callCount).toBe(2); // Both sources were attempted
    expect(result.sourceReports).toHaveLength(2);
    expect(result.sourceReports[0].status).toBe("error");
    expect(result.sourceReports[1].status).toBe("ok");
  });

  it("does not throw on HTTP errors — returns status='error' instead", async () => {
    const source = buildSourceOverrides({});

    const mockFetch = vi.fn(async () => ({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({}),
      text: async () => "Internal Server Error",
      headers: { get() { return null; } }
    }));

    const service = new InstitutionalDataService({
      sources: [source],
      fetchImpl: mockFetch as any,
      now: () => Date.parse("2026-05-20T12:00:00.000Z")
    });

    const result = await service.resolve(buildBaseRequest());

    expect(result.overallStatus).toBe("all_failed");
    expect(result.sourceReports[0].status).toBe("error");
    expect(result.sourceReports[0].error?.code).toBe("HTTP_500");
    expect(result.sourceReports[0].error?.retryable).toBe(true);
  });

  it("continues processing after HTTP 429 (rate limited) for other sources", async () => {
    const rateLimitedSource = buildSourceOverrides({
      sourceId: "rate-limited",
      label: "Rate Limited",
      path: "/api/v1/ratelimit",
      priority: 10
    });
    const okSource = buildSourceOverrides({
      sourceId: "ok-source",
      label: "OK Source",
      kind: "finra_short_interest",
      path: "/api/v1/ok",
      priority: 20
    });

    const mockFetch = vi.fn(async (input: string) => {
      if (input.includes("/ratelimit")) {
        return {
          ok: false,
          status: 429,
          statusText: "Too Many Requests",
          json: async () => ({}),
          text: async () => "Too Many Requests",
          headers: { get() { return null; } }
        };
      }
      return {
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({
          ticker: "AAPL",
          volume: 1_500_000,
          shortInterest: 500_000,
          holdingsCount: 10
        }),
        text: async () => "{}",
        headers: { get() { return null; } }
      };
    });

    const service = new InstitutionalDataService({
      sources: [rateLimitedSource, okSource],
      fetchImpl: mockFetch as any,
      now: () => Date.parse("2026-05-20T12:00:00.000Z")
    });

    const result = await service.resolve(buildBaseRequest());

    expect(result.overallStatus).toBe("partial");
    expect(result.sourceReports[0].status).toBe("error");
    expect(result.sourceReports[0].error?.code).toBe("HTTP_429");
    expect(result.sourceReports[1].status).toBe("ok");
    expect(result.usedSourceIds).toContain("ok-source");
  });
});
