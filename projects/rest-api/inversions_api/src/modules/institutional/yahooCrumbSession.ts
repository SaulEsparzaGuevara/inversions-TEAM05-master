/**
 * ============================================================================
 * yahooCrumbSession.ts
 * ============================================================================
 *
 * FIC: T340b: Shared Yahoo Crumb Session — single crumb + cookie auth flow
 * used by both yahooOptionsParser and yahooInstitutionalParser.
 *
 * POR QUÉ COMPARTIDO (vs caches independientes anteriores):
 * - Ambos parsers (options e institutional) usan autenticación crumb para
 *   las APIs v7/v10 de Yahoo Finance.
 * - Antes cada uno tenía su propio cache de crumb independiente, causando
 *   UNA llamada DUPLICADA de autenticación (2 GETs = 4 HTTP calls total).
 * - Con este módulo compartido, SOLO se hace una autenticación por ventana
 *   de 15 minutos, reduciendo 4 llamadas → 2 llamadas HTTP de auth total.
 *
 * POR QUÉ SHARED-PROMISE DEDUP (ensureCrumbSession):
 *   Si ambos parsers solicitan crumb simultáneamente (lo que ocurre ahora
 *   que InstitutionalDataService ejecuta fuentes en paralelo), el patrón
 *   de shared-promise asegura que solo se haga UNA llamada de autenticación,
 *   no dos concurrentes.
 *
 * POR QUÉ TTL DE 15 MIN:
 *   La cookie de Yahoo expira aproximadamente a los 20-30 min.
 *   Usamos 15 min para tener margen de seguridad.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const YAHOO_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";
const YAHOO_CRUMB_URL = "https://query2.finance.yahoo.com/v1/test/getcrumb";
const YAHOO_COOKIE_URL = "https://fc.yahoo.com";
const CRUMB_TTL_MS = 15 * 60 * 1000; // 15 minutes

const YAHOO_HEADERS = {
  "User-Agent": YAHOO_USER_AGENT,
  Accept: "application/json"
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CrumbSession {
  crumb: string;
  cookie: string;
  expiresAt: number;
}

// ---------------------------------------------------------------------------
// Module-level cache (singleton, shared across all Yahoo parsers)
// ---------------------------------------------------------------------------

let sessionCache: CrumbSession | null = null;
let sessionPromise: Promise<CrumbSession> | null = null;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Obtiene un par crumb + cookie de Yahoo Finance, con cache compartido
 * y deduplicación de promesas para evitar auth duplicada en paralelo.
 *
 * El flujo de autenticación es:
 * 1. GET a fc.yahoo.com → obtener cookie de sesión
 * 2. GET a v1/test/getcrumb con la cookie → obtener crumb token
 * 3. Incluir crumb como query param en todas las requests subsiguientes
 */
export async function ensureCrumbSession(): Promise<CrumbSession> {
  if (sessionCache && sessionCache.expiresAt > Date.now()) {
    return sessionCache;
  }

  if (sessionPromise) {
    return sessionPromise;
  }

  sessionPromise = (async () => {
    // PASO 1: Obtener cookie de sesión desde fc.yahoo.com.
    // redirect: "manual" porque Yahoo redirige a una página principal;
    // nos interesa solo el header Set-Cookie de la respuesta inicial.
    const cookieResp = await fetch(YAHOO_COOKIE_URL, {
      headers: YAHOO_HEADERS,
      redirect: "manual"
    });
    const setCookieHeader = cookieResp.headers.get("set-cookie") ?? "";
    // Extrae solo el primer par nombre=valor (ej: "B=abc123") ignorando
    // parámetros adicionales como path, domain, expires.
    const cookieMatch = setCookieHeader.match(/[A-Za-z0-9]+=[A-Za-z0-9]+/);
    const cookie = cookieMatch ? cookieMatch[0] : "";

    // PASO 2: Canjear la cookie por un crumb token.
    // El crumb es un string corto que se pasa como query param ?crumb=xxx
    // en todas las requests a las APIs v7/v10 de Yahoo.
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

    sessionCache = session;
    return session;
  })();

  try {
    return await sessionPromise;
  } finally {
    sessionPromise = null;
  }
}
