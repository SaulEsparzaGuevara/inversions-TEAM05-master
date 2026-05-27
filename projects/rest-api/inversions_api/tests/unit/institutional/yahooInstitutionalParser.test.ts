import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseYahooInstitutional } from "../../../src/modules/institutional/yahooInstitutionalParser.js";
import type { InstitutionalAnalysisContract } from "../../../src/modules/institutional/institutionalContract.js";
import type { InstitutionalSourceConfig } from "../../../src/modules/institutional/institutionalDataService.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeContract(overrides?: Partial<InstitutionalAnalysisContract>): InstitutionalAnalysisContract {
  return {
    analysisId: "test-001",
    ticker: "AAPL",
    instrument: "AAPL institutional coverage",
    period: "daily",
    volume: 2_500_000,
    liquidity: "high",
    horizon: "medium",
    fundsOwnershipPct: 60,
    flows: { inflows: 1_200_000, outflows: 800_000, asOf: new Date().toISOString() },
    openPositions: { count: 300, notional: 500_000_000 },
    sourceIds: ["yahoo-institutional"],
    requestedAt: new Date().toISOString(),
    ...overrides
  };
}

function makeSourceConfig(): InstitutionalSourceConfig {
  return {
    sourceId: "yahoo-institutional",
    kind: "yahoo_institutional",
    label: "Yahoo Institutional",
    enabled: true,
    tier: "free",
    baseUrl: "https://query2.finance.yahoo.com",
    path: "/v10/finance/quoteSummary",
    priority: 6,
    cacheTtlMs: 600_000,
    rateLimitPerMinute: 20
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("parseYahooInstitutional", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Fetch not mocked")));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("should return a fallback observation when Yahoo API is unreachable", async () => {
    const result = await parseYahooInstitutional(null, makeContract(), makeSourceConfig());

    expect(result).not.toBeNull();
    expect(result!.sourceId).toBe("yahoo-institutional");
    expect(result!.kind).toBe("yahoo_institutional");
    expect(result!.ticker).toBe("AAPL");
    expect(result!.confidence).toBe(0.3);
    expect(result!.notes[0]).toContain("API unavailable");
    expect(result!.raw).toHaveProperty("estimated", true);
  });

  it("should parse a valid Yahoo institutional ownership response", async () => {
    const mockQuoteResponse = {
      quoteSummary: {
        result: [
          {
            institutionOwnership: {
              ownershipList: [
                {
                  maxAge: 1,
                  reportDate: "2026-03-31",
                  organization: "Vanguard Group Inc",
                  pctHeld: { raw: 0.0823, fmt: "8.23%" },
                  position: { raw: 125000000, fmt: "125,000,000" },
                  value: { raw: 18500000000, fmt: "18,500,000,000" },
                  change: { raw: 2500000, fmt: "2,500,000" }
                },
                {
                  maxAge: 1,
                  reportDate: "2026-03-31",
                  organization: "BlackRock Inc",
                  pctHeld: { raw: 0.0651, fmt: "6.51%" },
                  position: { raw: 98000000, fmt: "98,000,000" },
                  value: { raw: 14500000000, fmt: "14,500,000,000" },
                  change: { raw: -1200000, fmt: "-1,200,000" }
                },
                {
                  maxAge: 1,
                  reportDate: "2026-03-31",
                  organization: "State Street Corp",
                  pctHeld: { raw: 0.0412, fmt: "4.12%" },
                  position: { raw: 62000000, fmt: "62,000,000" },
                  value: { raw: 9200000000, fmt: "9,200,000,000" },
                  change: { raw: 800000, fmt: "800,000" }
                }
              ]
            },
            majorHoldersBreakdown: {
              insidersPercentHeld: { raw: 0.0015, fmt: "0.15%" },
              institutionsPercentHeld: { raw: 0.623, fmt: "62.30%" },
              institutionsCount: { raw: 2247, fmt: "2,247" }
            }
          }
        ]
      }
    };

    // Smart mock that routes by URL
    const smartFetch = vi.fn().mockImplementation(async (url: string, _init?: RequestInit) => {
      if (url.includes("fc.yahoo.com")) {
        return { ok: true, status: 200, headers: new Map([["set-cookie", "B=test-cookie; Path=/"]]), json: () => Promise.resolve({}), text: () => Promise.resolve("") };
      }
      if (url.includes("getcrumb")) {
        return { ok: true, status: 200, headers: new Map(), json: () => Promise.resolve(""), text: () => Promise.resolve("test-crumb") };
      }
      return {
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve(mockQuoteResponse),
        text: () => Promise.resolve(JSON.stringify(mockQuoteResponse))
      };
    });
    vi.stubGlobal("fetch", smartFetch);

    const result = await parseYahooInstitutional(null, makeContract(), makeSourceConfig());

    expect(result).not.toBeNull();
    expect(result!.sourceId).toBe("yahoo-institutional");
    expect(result!.ticker).toBe("AAPL");
    expect(result!.confidence).toBeGreaterThan(0.5);
    // institutionsPercentHeld = 0.623 → 62.3%
    expect(result!.fundsOwnershipPct).toBe(62.3);
    // Total position: 125M + 98M + 62M = 285M
    expect(result!.volume).toBe(285000000);
    // Net change: 2.5M - 1.2M + 0.8M = 2.1M → inflows
    expect(result!.flows!.inflows).toBeGreaterThan(0);
    expect(result!.openPositions!.count).toBe(2247);
    expect(result!.notes[0]).toContain("AAPL");
    expect(result!.notes[1]).toContain("2247");
  });

  it("should handle missing ownership data with partial observation", async () => {
    const emptyResponse = {
      quoteSummary: {
        result: [
          {
            institutionOwnership: {
              ownershipList: []
            }
          }
        ]
      }
    };

    const smartFetch = vi.fn().mockImplementation(async (url: string, _init?: RequestInit) => {
      if (url.includes("fc.yahoo.com")) {
        return { ok: true, status: 200, headers: new Map([["set-cookie", "B=test; Path=/"]]), json: () => Promise.resolve({}), text: () => Promise.resolve("") };
      }
      if (url.includes("getcrumb")) {
        return { ok: true, status: 200, headers: new Map(), json: () => Promise.resolve(""), text: () => Promise.resolve("test-crumb") };
      }
      return {
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve(emptyResponse),
        text: () => Promise.resolve(JSON.stringify(emptyResponse))
      };
    });
    vi.stubGlobal("fetch", smartFetch);

    const result = await parseYahooInstitutional(null, makeContract(), makeSourceConfig());

    expect(result).not.toBeNull();
    expect(result!.confidence).toBe(0.35);
    expect(result!.volume).toBeUndefined();
  });

  it("should handle HTTP error with graceful fallback", async () => {
    const smartFetch = vi.fn().mockImplementation(async (url: string, _init?: RequestInit) => {
      if (url.includes("fc.yahoo.com")) {
        return { ok: true, status: 200, headers: new Map([["set-cookie", "B=test; Path=/"]]), json: () => Promise.resolve({}), text: () => Promise.resolve("") };
      }
      if (url.includes("getcrumb")) {
        return { ok: true, status: 200, headers: new Map(), json: () => Promise.resolve(""), text: () => Promise.resolve("test-crumb") };
      }
      return { ok: false, status: 401, statusText: "Unauthorized", headers: new Map(), json: () => Promise.resolve({}), text: () => Promise.resolve("") };
    });
    vi.stubGlobal("fetch", smartFetch);

    const result = await parseYahooInstitutional(null, makeContract(), makeSourceConfig());

    expect(result).not.toBeNull();
    expect(result!.confidence).toBe(0.3);
    expect(result!.raw).toHaveProperty("estimated", true);
  });

  it("should compute net flows correctly from holder changes", async () => {
    // Fund A +2.5M, Fund B -1.2M
    // Total change: 2.5M - 1.2M = +1.3M → inflows = 1.3M, outflows = 0
    const flowResponse = {
      quoteSummary: {
        result: [
          {
            institutionOwnership: {
              ownershipList: [
                {
                  maxAge: 1,
                  reportDate: "2026-03-31",
                  organization: "Fund A",
                  pctHeld: { raw: 0.05, fmt: "5%" },
                  position: { raw: 10000000, fmt: "10,000,000" },
                  value: { raw: 1500000000, fmt: "1,500,000,000" },
                  change: { raw: 2500000, fmt: "2,500,000" }
                },
                {
                  maxAge: 1,
                  reportDate: "2026-03-31",
                  organization: "Fund B",
                  pctHeld: { raw: 0.03, fmt: "3%" },
                  position: { raw: 5000000, fmt: "5,000,000" },
                  value: { raw: 750000000, fmt: "750,000,000" },
                  change: { raw: -1200000, fmt: "-1,200,000" }
                }
              ]
            },
            majorHoldersBreakdown: {
              insidersPercentHeld: { raw: 0.01, fmt: "1%" },
              institutionsPercentHeld: { raw: 0.45, fmt: "45%" },
              institutionsCount: { raw: 850, fmt: "850" }
            }
          }
        ]
      }
    };

    const smartFetch = vi.fn().mockImplementation(async (url: string, _init?: RequestInit) => {
      if (url.includes("fc.yahoo.com")) {
        return { ok: true, status: 200, headers: new Map([["set-cookie", "B=test; Path=/"]]), json: () => Promise.resolve({}), text: () => Promise.resolve("") };
      }
      if (url.includes("getcrumb")) {
        return { ok: true, status: 200, headers: new Map(), json: () => Promise.resolve(""), text: () => Promise.resolve("test-crumb") };
      }
      return {
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve(flowResponse),
        text: () => Promise.resolve(JSON.stringify(flowResponse))
      };
    });
    vi.stubGlobal("fetch", smartFetch);

    const result = await parseYahooInstitutional(null, makeContract(), makeSourceConfig());

    expect(result).not.toBeNull();
    // Net change = 2.5M - 1.2M = +1.3M → inflows = 1.3M, outflows = 0
    expect(result!.flows!.inflows).toBe(1300000);
    expect(result!.flows!.outflows).toBeUndefined();
  });
});
