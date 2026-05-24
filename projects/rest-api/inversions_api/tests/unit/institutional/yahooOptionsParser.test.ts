import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseYahooOptionsFlow } from "../../../src/modules/institutional/yahooOptionsParser.js";
import type { InstitutionalAnalysisContract } from "../../../src/modules/institutional/institutionalContract.js";
import type { InstitutionalSourceConfig } from "../../../src/modules/institutional/institutionalDataService.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeContract(overrides?: Partial<InstitutionalAnalysisContract>): InstitutionalAnalysisContract {
  return {
    analysisId: "test-001",
    ticker: "SPY",
    instrument: "SPY institutional coverage",
    period: "daily",
    volume: 1_500_000,
    liquidity: "high",
    horizon: "medium",
    fundsOwnershipPct: 25,
    flows: { inflows: 500_000, outflows: 200_000, asOf: new Date().toISOString() },
    openPositions: { count: 150, notional: 200_000_000 },
    sourceIds: ["yahoo-options-flow"],
    requestedAt: new Date().toISOString(),
    ...overrides
  };
}

function makeSourceConfig(): InstitutionalSourceConfig {
  return {
    sourceId: "yahoo-options-flow",
    kind: "yahoo_options_flow",
    label: "Yahoo Options Flow",
    enabled: true,
    tier: "free",
    baseUrl: "https://query2.finance.yahoo.com",
    path: "/v7/finance/options",
    priority: 5,
    cacheTtlMs: 120_000,
    rateLimitPerMinute: 30
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("parseYahooOptionsFlow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Default: mock fetch to simulate API unavailable → fallback
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Fetch not mocked")));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("should return a fallback observation when Yahoo API is unreachable", async () => {
    const result = await parseYahooOptionsFlow(null, makeContract(), makeSourceConfig());

    expect(result).not.toBeNull();
    expect(result!.sourceId).toBe("yahoo-options-flow");
    expect(result!.kind).toBe("yahoo_options_flow");
    expect(result!.ticker).toBe("SPY");
    expect(result!.confidence).toBe(0.3);
    expect(result!.notes[0]).toContain("API unavailable");
    expect(result!.raw).toHaveProperty("estimated", true);
    expect(result!.volume).toBeGreaterThan(0);
    expect(result!.flows?.inflows).toBeGreaterThan(0);
    expect(result!.flows?.outflows).toBeGreaterThan(0);
    expect(result!.openPositions?.count).toBeGreaterThan(0);
  });

  it("should parse a valid Yahoo options chain response", async () => {
    const mockOptionsResponse = {
      optionChain: {
        result: [
          {
            underlyingSymbol: "SPY",
            expirationDates: [1718323200, 1718928000, 1719532800],
            strikes: [450, 455, 460, 465, 470],
            hasMiniOptions: false,
            options: [
              {
                expirationDate: 1718323200,
                hasMiniOptions: false,
                calls: [
                  { strike: 460, lastPrice: 5.20, volume: 15000, openInterest: 80000, impliedVolatility: 0.18, inTheMoney: true, expiration: 1718323200 },
                  { strike: 465, lastPrice: 2.10, volume: 250000, openInterest: 45000, impliedVolatility: 0.22, inTheMoney: false, expiration: 1718323200 },
                  { strike: 470, lastPrice: 0.85, volume: 8000, openInterest: 60000, impliedVolatility: 0.25, inTheMoney: false, expiration: 1718323200 }
                ],
                puts: [
                  { strike: 450, lastPrice: 1.50, volume: 12000, openInterest: 70000, impliedVolatility: 0.20, inTheMoney: false, expiration: 1718323200 },
                  { strike: 455, lastPrice: 3.80, volume: 18000, openInterest: 55000, impliedVolatility: 0.19, inTheMoney: true, expiration: 1718323200 }
                ]
              }
            ]
          }
        ]
      }
    };

    // Smart mock that routes by URL — crumb endpoints return proper headers/text
    const smartFetch = vi.fn().mockImplementation(async (url: string, _init?: RequestInit) => {
      if (url.includes("fc.yahoo.com")) {
        // Cookie endpoint: return set-cookie header
        return {
          ok: true,
          status: 200,
          headers: new Map([["set-cookie", "B=test-cookie-value; Path=/"]]),
          json: () => Promise.resolve({}),
          text: () => Promise.resolve("")
        };
      }
      if (url.includes("getcrumb")) {
        // Crumb endpoint: return plain text crumb
        return {
          ok: true,
          status: 200,
          headers: new Map(),
          json: () => Promise.resolve(""),
          text: () => Promise.resolve("test-crumb-value")
        };
      }
      // Options data endpoint
      return {
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve(mockOptionsResponse),
        text: () => Promise.resolve(JSON.stringify(mockOptionsResponse))
      };
    });
    vi.stubGlobal("fetch", smartFetch);

    const result = await parseYahooOptionsFlow(null, makeContract(), makeSourceConfig());

    expect(result).not.toBeNull();
    expect(result!.sourceId).toBe("yahoo-options-flow");
    expect(result!.ticker).toBe("SPY");
    expect(result!.confidence).toBeGreaterThan(0.4);
    expect(result!.volume).toBeGreaterThan(0);
    expect(result!.volume).toBe(303000); // 15000 + 250000 + 8000 + 12000 + 18000
    expect(result!.flows!.inflows).toBe(273000); // call volume: 15000 + 250000 + 8000
    expect(result!.flows!.outflows).toBe(30000); // put volume: 12000 + 18000
    expect(result!.openPositions!.count).toBe(310000); // call OI 80000+45000+60000 + put OI 70000+55000
    expect(result!.notes.length).toBeGreaterThan(1);
    expect(result!.notes[0]).toContain("SPY");
  });

  it("should fall back when options chain has no volume", async () => {
    const emptyOptionsResponse = {
      optionChain: {
        result: [
          {
            underlyingSymbol: "SPY",
            expirationDates: [1718323200],
            strikes: [460],
            hasMiniOptions: false,
            options: [
              {
                expirationDate: 1718323200,
                hasMiniOptions: false,
                calls: [
                  { strike: 460, lastPrice: 5.20, volume: 0, openInterest: 0, impliedVolatility: 0.18, inTheMoney: true, expiration: 1718323200 }
                ],
                puts: [
                  { strike: 450, lastPrice: 1.50, volume: 0, openInterest: 0, impliedVolatility: 0.20, inTheMoney: false, expiration: 1718323200 }
                ]
              }
            ]
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
        json: () => Promise.resolve(emptyOptionsResponse),
        text: () => Promise.resolve(JSON.stringify(emptyOptionsResponse))
      };
    });
    vi.stubGlobal("fetch", smartFetch);

    const result = await parseYahooOptionsFlow(null, makeContract(), makeSourceConfig());

    expect(result).not.toBeNull();
    expect(result!.confidence).toBe(0.3);
  });

  it("should handle HTTP error from Yahoo API with graceful fallback", async () => {
    const smartFetch = vi.fn().mockImplementation(async (url: string, _init?: RequestInit) => {
      if (url.includes("fc.yahoo.com")) {
        return { ok: true, status: 200, headers: new Map([["set-cookie", "B=test; Path=/"]]), json: () => Promise.resolve({}), text: () => Promise.resolve("") };
      }
      if (url.includes("getcrumb")) {
        return { ok: true, status: 200, headers: new Map(), json: () => Promise.resolve(""), text: () => Promise.resolve("test-crumb") };
      }
      // Options endpoint returns 429 error
      return { ok: false, status: 429, statusText: "Too Many Requests", headers: new Map(), json: () => Promise.resolve({}), text: () => Promise.resolve("") };
    });
    vi.stubGlobal("fetch", smartFetch);

    const result = await parseYahooOptionsFlow(null, makeContract({ ticker: "AAPL" }), makeSourceConfig());

    expect(result).not.toBeNull();
    expect(result!.confidence).toBe(0.3);
    expect(result!.ticker).toBe("AAPL");
  });

  it("should detect strikes with unusual volume (> 2x OI)", async () => {
    // Strike 465 has volume 250000 vs OI 45000 → unusual (250000 > 90000)
    const unusualResponse = {
      optionChain: {
        result: [
          {
            underlyingSymbol: "SPY",
            expirationDates: [1718323200],
            strikes: [460, 465],
            hasMiniOptions: false,
            options: [
              {
                expirationDate: 1718323200,
                hasMiniOptions: false,
                calls: [
                  { strike: 460, lastPrice: 5.20, volume: 5000, openInterest: 80000, impliedVolatility: 0.18, inTheMoney: true, expiration: 1718323200 },
                  { strike: 465, lastPrice: 2.10, volume: 250000, openInterest: 45000, impliedVolatility: 0.22, inTheMoney: false, expiration: 1718323200 }
                ],
                puts: [
                  { strike: 460, lastPrice: 1.50, volume: 3000, openInterest: 55000, impliedVolatility: 0.20, inTheMoney: false, expiration: 1718323200 }
                ]
              }
            ]
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
        json: () => Promise.resolve(unusualResponse),
        text: () => Promise.resolve(JSON.stringify(unusualResponse))
      };
    });
    vi.stubGlobal("fetch", smartFetch);

    const result = await parseYahooOptionsFlow(null, makeContract(), makeSourceConfig());

    expect(result).not.toBeNull();
    // The raw property should contain the signal with unusualStrikeCount
    const raw = result!.raw as Record<string, unknown>;
    expect(raw.unusualStrikeCount).toBe(1);
  });

  it("should return null on exception with fallback", async () => {
    // fetch throws → caught by the try/catch → returns fallback
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));

    const result = await parseYahooOptionsFlow(null, makeContract(), makeSourceConfig());

    expect(result).not.toBeNull();
    expect(result!.confidence).toBe(0.3);
  });
});
