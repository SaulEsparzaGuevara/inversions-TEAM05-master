/**
 * Integration tests: InstitutionalDataService orchestration
 * ==========================================================
 *
 * Tests the full service pipeline with injected fetch implementation.
 * Source configs are defined WITHOUT parsers so the service uses its
 * built-in URL-building → fetch → default-parser flow, allowing us
 * to control responses via mock fetchImpl.
 */

import {
  InstitutionalDataService,
  type FetchLike,
  type FetchLikeResponse,
  type InstitutionalSourceConfig
} from "../../../src/modules/institutional/institutionalDataService.js";
import type { InstitutionalAnalysisContract } from "../../../src/modules/institutional/institutionalContract.js";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeContract(overrides?: Partial<InstitutionalAnalysisContract>): InstitutionalAnalysisContract {
  return {
    analysisId: "integration-test-001",
    ticker: "AAPL",
    instrument: "AAPL institutional coverage",
    period: "daily",
    volume: 1_500_000,
    liquidity: "high",
    horizon: "medium",
    fundsOwnershipPct: 42,
    flows: { inflows: 500_000, outflows: 200_000, asOf: "2026-05-20T00:00:00.000Z" },
    openPositions: { count: 150, notional: 200_000_000 },
    sourceIds: ["sec-edgar-13f", "finra-short-interest"],
    requestedAt: "2026-05-20T00:00:00.000Z",
    ...overrides
  };
}

/**
 * Creates a mock FetchLikeResponse with the given JSON body.
 */
function makeJsonResponse(data: unknown, status = 200, statusText = "OK"): FetchLikeResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    headers: { get: (_name: string) => null },
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data))
  };
}

/**
 * Creates a mock FetchLike that returns the given responses in order.
 * Each call pops the first response from the array.
 */
function makeSequentialFetch(responses: FetchLikeResponse[]): FetchLike {
  const copy = [...responses];
  return vi.fn(async (_input: string, _init?: any) => {
    const next = copy.shift();
    if (!next) throw new Error("Unexpected fetch call — no more mocked responses");
    return next;
  }) as unknown as FetchLike;
}

/**
 * Creates a mock FetchLike that always returns the same response.
 */
function makeStaticFetch(response: FetchLikeResponse): FetchLike {
  return vi.fn(async () => response) as unknown as FetchLike;
}

/**
 * Creates a FetchLike that rejects every call (simulates network errors).
 */
function makeFailingFetch(): FetchLike {
  return vi.fn(async () => {
    throw new Error("Simulated network error");
  }) as unknown as FetchLike;
}

// ---------------------------------------------------------------------------
// Source configs without parsers (so the service uses built-in URL + fetch)
// ---------------------------------------------------------------------------

function sourceConfigWithoutParser(
  sourceId: string,
  kind: InstitutionalSourceConfig["kind"],
  priority: number
): InstitutionalSourceConfig {
  return {
    sourceId,
    kind,
    label: `Source ${sourceId}`,
    enabled: true,
    tier: "free",
    baseUrl: "https://mock-api.example.com",
    path: `/${sourceId}`,
    priority,
    cacheTtlMs: 300_000,
    rateLimitPerMinute: 60
  };
}

const secSource = sourceConfigWithoutParser("sec-edgar-13f", "sec_edgar_13f", 1);
const finraSource = sourceConfigWithoutParser("finra-short-interest", "finra_short_interest", 2);
const yahooOptionsSource = sourceConfigWithoutParser("yahoo-options-flow", "yahoo_options_flow", 3);
const yahooInstSource = sourceConfigWithoutParser("yahoo-institutional", "yahoo_institutional", 4);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("InstitutionalDataService — service orchestration", () => {
  let mockNow: number;

  beforeEach(() => {
    mockNow = Date.now();
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // -----------------------------------------------------------------------
  // Overall status scenarios
  // -----------------------------------------------------------------------

  it("should return overallStatus='ok' when all sources return data", async () => {
    const secJson = { holdingsCount: 42, volume: 1_500_000, inflows: 500_000, outflows: 200_000 };
    const finraJson = { shortInterest: 850_000, volume: 2_100_000 };
    const fetcher = makeSequentialFetch([
      makeJsonResponse(secJson),
      makeJsonResponse(finraJson)
    ]);

    const service = new InstitutionalDataService({
      sources: [secSource, finraSource],
      fetchImpl: fetcher,
      now: () => mockNow
    });

    const result = await service.resolve(makeContract());

    expect(result.overallStatus).toBe("ok");
    expect(result.cacheHit).toBe(false);
    expect(result.usedSourceIds).toHaveLength(2);
    expect(result.usedSourceIds).toContain("sec-edgar-13f");
    expect(result.usedSourceIds).toContain("finra-short-interest");
    expect(result.sourceReports).toHaveLength(2);
    expect(result.sourceReports[0].status).toBe("ok");
    expect(result.sourceReports[1].status).toBe("ok");
  });

  it("should return overallStatus='partial' when some sources fail", async () => {
    const secJson = { holdingsCount: 42, volume: 1_500_000 };
    const fetcher = makeSequentialFetch([
      makeJsonResponse(secJson),       // sec-edgar-13f succeeds
      makeJsonResponse({}, 429, "Too Many Requests")  // finra fails
    ]);

    const service = new InstitutionalDataService({
      sources: [secSource, finraSource],
      fetchImpl: fetcher,
      now: () => mockNow
    });

    const result = await service.resolve(makeContract());

    expect(result.overallStatus).toBe("partial");
    expect(result.usedSourceIds).toHaveLength(1);
    expect(result.usedSourceIds).toContain("sec-edgar-13f");
    expect(result.sourceReports).toHaveLength(2);
    // First source: ok
    expect(result.sourceReports[0].status).toBe("ok");
    expect(result.sourceReports[0].observation).toBeDefined();
    // Second source: HTTP error
    expect(result.sourceReports[1].status).toBe("error");
    expect(result.sourceReports[1].error).toBeDefined();
    expect(result.sourceReports[1].error!.code).toBe("HTTP_429");
  });

  it("should return overallStatus='all_failed' when all sources fail", async () => {
    const fetcher = makeSequentialFetch([
      makeJsonResponse({}, 503, "Service Unavailable"),
      makeJsonResponse({}, 500, "Internal Server Error")
    ]);

    const service = new InstitutionalDataService({
      sources: [secSource, finraSource],
      fetchImpl: fetcher,
      now: () => mockNow
    });

    const result = await service.resolve(makeContract());

    expect(result.overallStatus).toBe("all_failed");
    expect(result.usedSourceIds).toHaveLength(0);
    expect(result.sourceReports).toHaveLength(2);
    expect(result.sourceReports[0].status).toBe("error");
    expect(result.sourceReports[1].status).toBe("error");
  });

  it("should return overallStatus='all_failed' when fetch throws network error", async () => {
    const service = new InstitutionalDataService({
      sources: [secSource, finraSource],
      fetchImpl: makeFailingFetch(),
      now: () => mockNow
    });

    const result = await service.resolve(makeContract());

    expect(result.overallStatus).toBe("all_failed");
    expect(result.usedSourceIds).toHaveLength(0);
    expect(result.sourceReports).toHaveLength(2);
    expect(result.sourceReports[0].status).toBe("error");
    expect(result.sourceReports[0].error!.code).toBe("FETCH_ERROR");
    expect(result.sourceReports[1].status).toBe("error");
  });

  it("should return overallStatus='all_failed' when sources return empty/unusable data", async () => {
    // Empty JSON with no meaningful fields → parser returns null
    const fetcher = makeSequentialFetch([
      makeJsonResponse({}),
      makeJsonResponse({})
    ]);

    const service = new InstitutionalDataService({
      sources: [secSource, finraSource],
      fetchImpl: fetcher,
      now: () => mockNow
    });

    const result = await service.resolve(makeContract());

    expect(result.overallStatus).toBe("all_failed");
    expect(result.sourceReports).toHaveLength(2);
    expect(result.sourceReports[0].status).toBe("failed");
    expect(result.sourceReports[0].error!.code).toBe("EMPTY_OR_UNSUPPORTED_RESPONSE");
  });

  // -----------------------------------------------------------------------
  // Cache behavior
  // -----------------------------------------------------------------------

  it("should serve cached data on second call", async () => {
    const secJson = { holdingsCount: 10, volume: 900_000 };
    const fetcher = makeStaticFetch(makeJsonResponse(secJson));

    const service = new InstitutionalDataService({
      sources: [secSource],
      fetchImpl: fetcher,
      now: () => mockNow
    });

    // First call — should fetch
    const first = await service.resolve(makeContract());
    expect(first.cacheHit).toBe(false);
    expect(first.overallStatus).toBe("ok");
    expect(first.sourceReports[0].status).toBe("ok");

    // Advance time a bit but stay within cache TTL
    mockNow += 60_000;
    vi.setSystemTime(mockNow);

    // Second call — should use cache
    const second = await service.resolve(makeContract());
    expect(second.cacheHit).toBe(true);
    expect(second.sourceReports[0].status).toBe("cached");
    expect(second.sourceReports[0].cacheHit).toBe(true);
    // The fetcher was only called once
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("should expire cache after TTL", async () => {
    const secJson = { holdingsCount: 10, volume: 900_000 };
    const fetcher = makeStaticFetch(makeJsonResponse(secJson));

    const service = new InstitutionalDataService({
      sources: [secSource],
      cacheTtlMs: 120_000,
      fetchImpl: fetcher,
      now: () => mockNow
    });

    // First call — fetch
    await service.resolve(makeContract());

    // Advance past cache TTL
    mockNow += 300_000;
    vi.setSystemTime(mockNow);

    // Second call — should fetch again
    const second = await service.resolve(makeContract());
    expect(second.cacheHit).toBe(false);
    expect(second.sourceReports[0].status).toBe("ok");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  // -----------------------------------------------------------------------
  // Rate limiting
  // -----------------------------------------------------------------------

  it("should rate-limit sources that exceed their rate limit", async () => {
    const secJson = { holdingsCount: 10, volume: 900_000 };
    const fetcher = makeStaticFetch(makeJsonResponse(secJson));

    // Source with rate limit of 2 per minute, cache disabled so each call goes to fetch
    const rateLimitedSource: InstitutionalSourceConfig = {
      ...secSource,
      rateLimitPerMinute: 2,
      cacheTtlMs: 0
    };

    const service = new InstitutionalDataService({
      sources: [rateLimitedSource],
      cacheTtlMs: 0,
      fetchImpl: fetcher,
      now: () => mockNow
    });

    // First call — should fetch (uses 1 of 2)
    const first = await service.resolve(makeContract());
    expect(first.sourceReports[0].status).toBe("ok");

    // Second call — should fetch (uses 2 of 2)
    const second = await service.resolve(makeContract());
    expect(second.sourceReports[0].status).toBe("ok");

    // Third call — rate limited
    const third = await service.resolve(makeContract());
    expect(third.sourceReports[0].status).toBe("rate_limited");
    expect(third.sourceReports[0].error!.code).toBe("RATE_LIMITED");
    // Only 2 fetches were made
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  // -----------------------------------------------------------------------
  // Source disabled
  // -----------------------------------------------------------------------

  it("should skip disabled sources", async () => {
    const disabledSource: InstitutionalSourceConfig = {
      ...secSource,
      enabled: false
    };

    const finraJson = { shortInterest: 500_000, volume: 1_000_000 };
    const fetcher = makeStaticFetch(makeJsonResponse(finraJson));

    const service = new InstitutionalDataService({
      sources: [disabledSource, finraSource],
      fetchImpl: fetcher,
      now: () => mockNow
    });

    const result = await service.resolve(makeContract());

    expect(result.sourceReports).toHaveLength(2);
    expect(result.sourceReports[0].status).toBe("failed");
    expect(result.sourceReports[0].error!.code).toBe("SOURCE_DISABLED");
    expect(result.sourceReports[1].status).toBe("ok");
    // Only finra was actually fetched
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  // -----------------------------------------------------------------------
  // Merged analysis from multiple sources
  // -----------------------------------------------------------------------

  it("should merge observations from multiple sources into the analysis contract", async () => {
    const secJson = { fundsOwnershipPct: 45, volume: 1_500_000, holdingsCount: 120 };
    const finraJson = { shortInterest: 800_000, avgDailyVolume: 2_300_000 };
    const fetcher = makeSequentialFetch([
      makeJsonResponse(secJson),
      makeJsonResponse(finraJson)
    ]);

    const service = new InstitutionalDataService({
      sources: [secSource, finraSource],
      fetchImpl: fetcher,
      now: () => mockNow
    });

    const result = await service.resolve(makeContract());

    // Merged analysis should combine data from both sources
    expect(result.analysis.fundsOwnershipPct).toBe(45);
    // Volume should be the max of both source volumes and the original request
    expect(result.analysis.volume).toBeGreaterThanOrEqual(2_300_000);
    // sourceIds should reflect both sources
    expect(result.analysis.sourceIds).toContain("sec-edgar-13f");
    expect(result.analysis.sourceIds).toContain("finra-short-interest");
  });

  // -----------------------------------------------------------------------
  // Four sources, all successful
  // -----------------------------------------------------------------------

  it("should resolve all 4 configured sources successfully", async () => {
    const secJson = { holdingsCount: 80, volume: 3_000_000, fundsOwnershipPct: 55, inflows: 1_200_000, outflows: 800_000 };
    const finraJson = { shortInterest: 1_200_000, avgDailyVolume: 2_500_000 };
    const yahooOptJson = {
      optionChain: { result: [{ options: [{ calls: [{ volume: 150_000, openInterest: 800_000 }], puts: [{ volume: 100_000, openInterest: 600_000 }] }] }] }
    };
    const yahooInstJson = {
      quoteSummary: { result: [{ institutionOwnership: { ownershipList: [{ position: 50_000_000, change: 1_000_000 }, { position: 30_000_000, change: -500_000 }] } }] }
    };
    const fetcher = makeSequentialFetch([
      makeJsonResponse(secJson),
      makeJsonResponse(finraJson),
      makeJsonResponse(yahooOptJson),
      makeJsonResponse(yahooInstJson)
    ]);

    const service = new InstitutionalDataService({
      sources: [secSource, finraSource, yahooOptionsSource, yahooInstSource],
      fetchImpl: fetcher,
      now: () => mockNow
    });

    const result = await service.resolve(makeContract());

    expect(result.overallStatus).toBe("ok");
    expect(result.sourceReports).toHaveLength(4);
    expect(result.sourceReports.every((r) => r.status === "ok")).toBe(true);
    expect(result.usedSourceIds).toHaveLength(4);
  });

  // -----------------------------------------------------------------------
  // Error: no sources provided
  // -----------------------------------------------------------------------

  it("should throw when constructed with no sources", () => {
    expect(() => new InstitutionalDataService({ sources: [] })).toThrow(
      "InstitutionalDataService requires at least one source configuration."
    );
  });

  it("should throw when constructed with invalid source config", () => {
    const invalidSource = { sourceId: "bad" } as InstitutionalSourceConfig;
    expect(() => new InstitutionalDataService({ sources: [invalidSource] })).toThrow(
      "Invalid institutional source configuration"
    );
  });

  // -----------------------------------------------------------------------
  // resolveAnalysis convenience method
  // -----------------------------------------------------------------------

  it("resolveAnalysis should return only the analysis contract", async () => {
    const secJson = { holdingsCount: 5, volume: 750_000 };
    const fetcher = makeStaticFetch(makeJsonResponse(secJson));

    const service = new InstitutionalDataService({
      sources: [secSource],
      fetchImpl: fetcher,
      now: () => mockNow
    });

    const analysis = await service.resolveAnalysis(makeContract());

    expect(analysis.ticker).toBe("AAPL");
    expect(analysis.period).toBe("daily");
    // The analysis contract should have been normalized through mergeObservations
    expect(analysis.analysisId).toBeTruthy();
  });
});
