/**
 * T338/T211: Yahoo Finance Options Flow Parser
 * =============================================
 * Fetches options chain data from Yahoo Finance v7 API and computes
 * options flow signals (unusual volume, put/call ratios, strike
 * concentration) normalized to InstitutionalSourceObservation.
 *
 * Follows the same pattern as realSourceParsers.ts with graceful
 * fallback when the upstream API is unavailable.
 */

import {
  type InstitutionalAnalysisContract
} from "./institutionalContract.js";
import {
  type InstitutionalSourceObservation,
  type InstitutionalSourceConfig
} from "./institutionalDataService.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const YAHOO_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";
const YAHOO_OPTIONS_URL = "https://query2.finance.yahoo.com/v7/finance/options";
const YAHOO_CRUMB_URL = "https://query2.finance.yahoo.com/v1/test/getcrumb";
const YAHOO_COOKIE_URL = "https://fc.yahoo.com";
const REQUEST_TIMEOUT_MS = 10_000;

const YAHOO_HEADERS = {
  "User-Agent": YAHOO_USER_AGENT,
  Accept: "application/json"
};

// ---------------------------------------------------------------------------
// Cache for crumb + cookie (module-level, like finraCache)
// ---------------------------------------------------------------------------

interface CrumbSession {
  crumb: string;
  cookie: string;
  expiresAt: number;
}

let crumbSession: CrumbSession | null = null;
let crumbSessionPromise: Promise<CrumbSession> | null = null;

const CRUMB_TTL_MS = 15 * 60 * 1000; // 15 minutes

// ---------------------------------------------------------------------------
// Helper types for Yahoo API response
// ---------------------------------------------------------------------------

interface YahooOptionContract {
  strike: number;
  lastPrice: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  inTheMoney: boolean;
  expiration: number;
}

interface YahooOptionsResult {
  underlyingSymbol: string;
  expirationDates: number[];
  strikes: number[];
  hasMiniOptions: boolean;
  quote?: Record<string, unknown>;
  options: Array<{
    expirationDate: number;
    hasMiniOptions: boolean;
    calls: YahooOptionContract[];
    puts: YahooOptionContract[];
  }>;
}

interface YahooOptionsChainResponse {
  optionChain?: {
    result?: YahooOptionsResult[];
    error?: unknown;
  };
}

// ---------------------------------------------------------------------------
// Crumb authentication
// ---------------------------------------------------------------------------

/**
 * Obtains a crumb + cookie pair from Yahoo Finance.
 * Uses module-level shared-promise dedup (same pattern as ensureFinraCache).
 */
async function ensureCrumbSession(): Promise<CrumbSession> {
  if (crumbSession && crumbSession.expiresAt > Date.now()) {
    return crumbSession;
  }

  if (crumbSessionPromise) {
    return crumbSessionPromise;
  }

  crumbSessionPromise = (async () => {
    // Step 1: get a cookie from fc.yahoo.com
    const cookieResp = await fetch(YAHOO_COOKIE_URL, {
      headers: YAHOO_HEADERS,
      redirect: "manual"
    });
    const setCookieHeader = cookieResp.headers.get("set-cookie") ?? "";
    const cookieMatch = setCookieHeader.match(/[A-Za-z0-9]+=[A-Za-z0-9]+/);
    const cookie = cookieMatch ? cookieMatch[0] : "";

    // Step 2: get a crumb using that cookie
    const crumbResp = await fetch(YAHOO_CRUMB_URL, {
      headers: {
        ...YAHOO_HEADERS,
        Cookie: cookie
      }
    });
    const crumb = crumbResp.ok ? (await crumbResp.text()).trim() : "";

    const session: CrumbSession = {
      crumb,
      cookie,
      expiresAt: Date.now() + CRUMB_TTL_MS
    };

    crumbSession = session;
    return session;
  })();

  try {
    return await crumbSessionPromise;
  } finally {
    crumbSessionPromise = null;
  }
}

// ---------------------------------------------------------------------------
// Options chain fetching
// ---------------------------------------------------------------------------

/**
 * Fetches the options chain for a ticker from Yahoo Finance.
 * Returns the raw API response or null on failure.
 */
async function fetchYahooOptions(ticker: string): Promise<YahooOptionsChainResponse | null> {
  try {
    const session = await ensureCrumbSession();
    const url = `${YAHOO_OPTIONS_URL}/${encodeURIComponent(ticker)}?crumb=${encodeURIComponent(session.crumb)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: {
          ...YAHOO_HEADERS,
          Cookie: session.cookie
        },
        signal: controller.signal
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json() as YahooOptionsChainResponse;
      return data;
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Signal computation
// ---------------------------------------------------------------------------

interface OptionsFlowSignal {
  /** Total call volume. */
  callVolume: number;
  /** Total put volume. */
  putVolume: number;
  /** Total call open interest. */
  callOi: number;
  /** Total put open interest. */
  putOi: number;
  /** Put/call volume ratio. */
  putCallVolumeRatio: number;
  /** Put/call open interest ratio. */
  putCallOiRatio: number;
  /** Number of strikes with unusual volume (> 2x OI). */
  unusualStrikeCount: number;
  /** Weighted directional bias: positive = bullish, negative = bearish. */
  directionalBias: number;
  /** Number of available expiration dates. */
  expirationCount: number;
}

/**
 * Computes options flow signals from a Yahoo options chain result.
 */
function computeOptionsFlowSignal(result: YahooOptionsResult): OptionsFlowSignal {
  let callVolume = 0;
  let putVolume = 0;
  let callOi = 0;
  let putOi = 0;
  let unusualStrikeCount = 0;

  for (const expiration of result.options) {
    // Process calls
    for (const call of expiration.calls) {
      callVolume += call.volume || 0;
      callOi += call.openInterest || 0;
      // Detect unusual volume: volume > 2x open interest
      if (call.volume > 0 && call.openInterest > 0 && call.volume > call.openInterest * 2) {
        unusualStrikeCount++;
      }
    }

    // Process puts
    for (const put of expiration.puts) {
      putVolume += put.volume || 0;
      putOi += put.openInterest || 0;
      if (put.volume > 0 && put.openInterest > 0 && put.volume > put.openInterest * 2) {
        unusualStrikeCount++;
      }
    }
  }

  const totalVolume = callVolume + putVolume;
  const totalOi = callOi + putOi;

  // Directional bias: ratio of bullish (call) to total flow
  const directionalBias = totalVolume > 0
    ? (callVolume - putVolume) / totalVolume
    : totalOi > 0
      ? (callOi - putOi) / totalOi
      : 0;

  return {
    callVolume,
    putVolume,
    callOi,
    putOi,
    putCallVolumeRatio: putVolume > 0 ? callVolume / putVolume : callVolume > 0 ? Infinity : 1,
    putCallOiRatio: putOi > 0 ? callOi / putOi : callOi > 0 ? Infinity : 1,
    unusualStrikeCount,
    directionalBias,
    expirationCount: result.options.length
  };
}

// ---------------------------------------------------------------------------
// Mock / fallback helpers (for when Yahoo API is unavailable)
// ---------------------------------------------------------------------------

/**
 * Builds a synthetic observation when the real Yahoo API is unreachable.
 * Uses the ticker seed to produce deterministic estimates.
 */
function buildFallbackObservation(
  ticker: string,
  request: InstitutionalAnalysisContract,
  source: InstitutionalSourceConfig
): InstitutionalSourceObservation {
  const seed = ticker.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const asOf = new Date().toISOString();
  const estimatedCallVol = Math.round(15000 + (seed % 5000) * (request.volume / 1000000));
  const estimatedPutVol = Math.round(12000 + (seed % 4000) * (request.volume / 1000000));
  const estimatedCallOi = Math.round(80000 + (seed % 20000) * (request.volume / 1000000));
  const estimatedPutOi = Math.round(75000 + (seed % 18000) * (request.volume / 1000000));

  return {
    sourceId: source.sourceId,
    kind: source.kind,
    ticker: request.ticker,
    instrument: request.instrument,
    period: request.period,
    horizon: request.horizon,
    volume: estimatedCallVol + estimatedPutVol,
    flows: {
      inflows: estimatedCallVol,
      outflows: estimatedPutVol,
      asOf
    },
    openPositions: {
      count: estimatedCallOi + estimatedPutOi
    },
    asOf,
    confidence: 0.3,
    notes: [
      `Yahoo Options Flow: API unavailable — showing estimated flow for ${ticker}`,
      `Estimated call vol: ${estimatedCallVol.toLocaleString()}, put vol: ${estimatedPutVol.toLocaleString()}`
    ],
    raw: {
      estimated: true,
      seed,
      ticker
    }
  };
}

// ---------------------------------------------------------------------------
// Main parser export
// ---------------------------------------------------------------------------

/**
 * Parses Yahoo Finance options chain data into an InstitutionalSourceObservation.
 *
 * This function:
 * 1. Obtains a crumb + cookie session from Yahoo Finance
 * 2. Fetches the options chain for the requested ticker
 * 3. Computes options flow signals (unusual volume, put/call ratios)
 * 4. Returns a normalized observation with confidence based on signal strength
 *
 * Graceful fallback: if the real API fails, returns a synthetic low-confidence
 * observation instead of null, ensuring the institutional pipeline continues.
 */
export async function parseYahooOptionsFlow(
  _payload: unknown,
  request: InstitutionalAnalysisContract,
  source: InstitutionalSourceConfig
): Promise<InstitutionalSourceObservation | null> {
  try {
    const upperTicker = request.ticker.toUpperCase();
    const response = await fetchYahooOptions(upperTicker);

    if (!response?.optionChain?.result?.[0]) {
      return buildFallbackObservation(upperTicker, request, source);
    }

    const result = response.optionChain.result[0];
    const signal = computeOptionsFlowSignal(result);

    const totalVolume = signal.callVolume + signal.putVolume;
    const totalOi = signal.callOi + signal.putOi;

    if (totalVolume === 0 && totalOi === 0) {
      return buildFallbackObservation(upperTicker, request, source);
    }

    // Confidence based on signal richness
    const confidence = Math.min(0.95,
      0.4 +
        (signal.expirationCount / 6) * 0.2 +
        Math.min(signal.unusualStrikeCount / 10, 1) * 0.2 +
        (totalVolume > 0 ? 0.15 : 0) +
        (totalOi > 0 ? 0.15 : 0)
    );

    const asOf = new Date().toISOString();

    const notes: string[] = [
      `Yahoo Options Flow — ${upperTicker}`,
      `Call vol: ${signal.callVolume.toLocaleString()}, Put vol: ${signal.putVolume.toLocaleString()}`,
      `P/C vol ratio: ${signal.putCallVolumeRatio === Infinity ? "∞" : signal.putCallVolumeRatio.toFixed(2)}`,
      `Unusual strikes: ${signal.unusualStrikeCount}`,
      `Expirations: ${signal.expirationCount}`
    ];

    const observation: InstitutionalSourceObservation = {
      sourceId: source.sourceId,
      kind: source.kind,
      ticker: request.ticker,
      instrument: request.instrument,
      period: request.period,
      horizon: request.horizon,
      volume: totalVolume,
      flows: {
        inflows: signal.callVolume,
        outflows: signal.putVolume,
        asOf
      },
      openPositions: {
        count: totalOi
      },
      asOf,
      confidence: Number(confidence.toFixed(4)),
      notes,
      raw: {
        underlyingSymbol: result.underlyingSymbol,
        expirationDates: result.expirationDates,
        ...signal
      }
    };

    return observation;
  } catch {
    // Ultimate fallback — API error or exception
    return buildFallbackObservation(request.ticker.toUpperCase(), request, source);
  }
}
