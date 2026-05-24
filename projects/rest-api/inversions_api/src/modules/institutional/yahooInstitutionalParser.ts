/**
 * T339/T212: Yahoo Finance Institutional Parser
 * ==============================================
 * Fetches institutional ownership data from Yahoo Finance v10 API
 * (institutionOwnership and majorHoldersBreakdown modules) and
 * normalizes it to InstitutionalSourceObservation.
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
const YAHOO_QUOTE_URL = "https://query2.finance.yahoo.com/v10/finance/quoteSummary";
const YAHOO_CRUMB_URL = "https://query2.finance.yahoo.com/v1/test/getcrumb";
const YAHOO_COOKIE_URL = "https://fc.yahoo.com";
const REQUEST_TIMEOUT_MS = 10_000;

const YAHOO_HEADERS = {
  "User-Agent": YAHOO_USER_AGENT,
  Accept: "application/json"
};

// ---------------------------------------------------------------------------
// Cache for crumb + cookie (module-level, shared with options parser)
// ---------------------------------------------------------------------------

interface CrumbSession {
  crumb: string;
  cookie: string;
  expiresAt: number;
}

// Separate crumb cache for institutional (in case options parser cleared it)
let instCrumbSession: CrumbSession | null = null;
let instCrumbSessionPromise: Promise<CrumbSession> | null = null;

const CRUMB_TTL_MS = 15 * 60 * 1000; // 15 minutes

// ---------------------------------------------------------------------------
// Yahoo API response types
// ---------------------------------------------------------------------------

interface YahooInstitutionOwnership {
  ownershipList: Array<{
    maxAge: number;
    reportDate: string;
    organization: string;
    pctHeld: { raw: number; fmt: string };
    position: { raw: number; fmt: string };
    value: { raw: number; fmt: string };
    change?: { raw: number; fmt: string };
  }>;
}

interface YahooMajorHoldersBreakdown {
  insidersPercentHeld: { raw: number; fmt: string };
  institutionsPercentHeld: { raw: number; fmt: string };
  institutionsCount: { raw: number; fmt: string };
}

interface YahooQuoteSummaryResult {
  institutionOwnership?: YahooInstitutionOwnership;
  majorHoldersBreakdown?: YahooMajorHoldersBreakdown;
}

interface YahooQuoteSummaryResponse {
  quoteSummary?: {
    result?: YahooQuoteSummaryResult[];
    error?: unknown;
  };
}

// ---------------------------------------------------------------------------
// Crumb authentication (independent cache for isolation)
// ---------------------------------------------------------------------------

async function ensureInstCrumbSession(): Promise<CrumbSession> {
  if (instCrumbSession && instCrumbSession.expiresAt > Date.now()) {
    return instCrumbSession;
  }

  if (instCrumbSessionPromise) {
    return instCrumbSessionPromise;
  }

  instCrumbSessionPromise = (async () => {
    const cookieResp = await fetch(YAHOO_COOKIE_URL, {
      headers: YAHOO_HEADERS,
      redirect: "manual"
    });
    const setCookieHeader = cookieResp.headers.get("set-cookie") ?? "";
    const cookieMatch = setCookieHeader.match(/[A-Za-z0-9]+=[A-Za-z0-9]+/);
    const cookie = cookieMatch ? cookieMatch[0] : "";

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

    instCrumbSession = session;
    return session;
  })();

  try {
    return await instCrumbSessionPromise;
  } finally {
    instCrumbSessionPromise = null;
  }
}

// ---------------------------------------------------------------------------
// Institutional data fetching
// ---------------------------------------------------------------------------

/**
 * Fetches institutional ownership data from Yahoo Finance quoteSummary API.
 */
async function fetchYahooInstitutional(ticker: string): Promise<YahooQuoteSummaryResponse | null> {
  try {
    const session = await ensureInstCrumbSession();
    const modules = "institutionOwnership,majorHoldersBreakdown";
    const url = `${YAHOO_QUOTE_URL}/${encodeURIComponent(ticker)}?modules=${encodeURIComponent(modules)}&crumb=${encodeURIComponent(session.crumb)}`;

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

      const data = await response.json() as YahooQuoteSummaryResponse;
      return data;
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Mock / fallback helpers
// ---------------------------------------------------------------------------

/**
 * Builds a synthetic observation when the real Yahoo API is unreachable.
 */
function buildFallbackObservation(
  ticker: string,
  request: InstitutionalAnalysisContract,
  source: InstitutionalSourceConfig
): InstitutionalSourceObservation {
  const seed = ticker.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const asOf = new Date().toISOString();
  const estimatedHolders = Math.max(50, Math.round(500 + (seed % 200)));
  const estimatedPct = Math.min(95, Number((25 + (seed % 30)).toFixed(2)));
  const estimatedShares = Math.round(estimatedHolders * 150000 * (request.volume / 1000000));

  return {
    sourceId: source.sourceId,
    kind: source.kind,
    ticker: request.ticker,
    instrument: request.instrument,
    period: request.period,
    horizon: request.horizon,
    volume: estimatedShares,
    fundsOwnershipPct: estimatedPct,
    flows: {
      inflows: Number((estimatedShares * 0.15).toFixed(2)),
      outflows: Number((estimatedShares * 0.08).toFixed(2)),
      asOf
    },
    openPositions: {
      count: estimatedHolders
    },
    asOf,
    confidence: 0.3,
    notes: [
      `Yahoo Institutional: API unavailable — showing estimated data for ${ticker}`,
      `Estimated holders: ${estimatedHolders}, ownership: ${estimatedPct}%`
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
 * Parses Yahoo Finance institutional ownership data into an
 * InstitutionalSourceObservation.
 *
 * This function:
 * 1. Obtains a crumb + cookie session from Yahoo Finance
 * 2. Fetches institutionOwnership and majorHoldersBreakdown modules
 * 3. Computes inflows/outflows from holder position changes
 * 4. Returns a normalized observation with confidence based on data freshness
 *
 * Graceful fallback: if the real API fails, returns a synthetic low-confidence
 * observation instead of null.
 */
export async function parseYahooInstitutional(
  _payload: unknown,
  request: InstitutionalAnalysisContract,
  source: InstitutionalSourceConfig
): Promise<InstitutionalSourceObservation | null> {
  try {
    const upperTicker = request.ticker.toUpperCase();
    const response = await fetchYahooInstitutional(upperTicker);

    if (!response?.quoteSummary?.result?.[0]) {
      return buildFallbackObservation(upperTicker, request, source);
    }

    const result = response.quoteSummary.result[0];
    const ownership = result.institutionOwnership;
    const breakdown = result.majorHoldersBreakdown;

    // Parse institution ownership list
    const holders = ownership?.ownershipList ?? [];
    const totalPosition = holders.reduce(
      (sum, h) => sum + (h.position?.raw ?? 0), 0
    );
    const totalChange = holders.reduce(
      (sum, h) => sum + (h.change?.raw ?? 0), 0
    );

    // Parse breakdown percentages
    const institutionsPct = breakdown?.institutionsPercentHeld?.raw;
    const institutionsCount = breakdown?.institutionsCount?.raw;

    // Derive fundsOwnershipPct
    const fundsOwnershipPct = institutionsPct !== undefined
      ? institutionsPct * 100
      : holders.length > 0
        ? undefined
        : undefined;

    // Compute flows from net position change
    const netChange = totalChange;
    const inflows = netChange > 0 ? netChange : 0;
    const outflows = netChange < 0 ? Math.abs(netChange) : 0;

    const asOf = new Date().toISOString();

    // Confidence based on data richness
    const holderCount = institutionsCount ?? holders.length;
    const confidence = Math.min(0.95,
      0.35 +
        (holderCount > 0 ? Math.min(holderCount / 50, 1) * 0.25 : 0) +
        (fundsOwnershipPct !== undefined ? 0.2 : 0) +
        (holders.length > 0 ? 0.15 : 0) +
        (totalChange !== 0 ? 0.05 : 0)
    );

    const notes: string[] = [
      `Yahoo Institutional — ${upperTicker}`,
      `Institutional holders: ${holderCount}`,
      fundsOwnershipPct !== undefined
        ? `Institutional ownership: ${fundsOwnershipPct.toFixed(2)}%`
        : "Ownership data unavailable"
    ];

    const observation: InstitutionalSourceObservation = {
      sourceId: source.sourceId,
      kind: source.kind,
      ticker: request.ticker,
      instrument: request.instrument,
      period: request.period,
      horizon: request.horizon,
      volume: totalPosition > 0 ? totalPosition : undefined,
      fundsOwnershipPct: fundsOwnershipPct !== undefined
        ? Number(fundsOwnershipPct.toFixed(2))
        : undefined,
      flows: {
        inflows: inflows > 0 ? Number(inflows.toFixed(2)) : undefined,
        outflows: outflows > 0 ? Number(outflows.toFixed(2)) : undefined,
        asOf
      },
      openPositions: {
        count: holderCount
      },
      asOf,
      confidence: Number(confidence.toFixed(4)),
      notes,
      raw: {
        holderCount,
        totalPosition,
        totalChange: netChange,
        institutionsPct,
        latestHolderReportDate: holders[0]?.reportDate
      }
    };

    return observation;
  } catch {
    return buildFallbackObservation(request.ticker.toUpperCase(), request, source);
  }
}
