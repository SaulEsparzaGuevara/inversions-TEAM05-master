# Reporte de Inventario de Código Fuente — Estado Actual (As-Is)

> Generado: 2026-05-26
> Cobertura: 27 archivos backend en 6 directorios
> Total estimado: ~7,500+ líneas de código

---

## Índice

1. [Módulo: institutional/ (9 archivos)](#1-institutional)
2. [Módulo: strategies/coverage/ (10 archivos)](#2-coverage)
3. [Módulo: ai/ (1 archivo)](#3-ai)
4. [Rutas: routes/institutional/ (3 archivos)](#4-routes-institutional)
5. [Rutas: routes/coverage/ (3 archivos)](#5-routes-coverage)
6. [Rutas: routes/ai/ (1 archivo)](#6-routes-ai)

---

## 1. Módulo: `src/modules/institutional/`

### 1.1 institutionalContract.ts

**Ruta**: `projects/rest-api/inversions_api/src/modules/institutional/institutionalContract.ts`
**Líneas**: 226
**FIC**: T106

**Tipos exportados:**
- `InstitutionalAnalysisPeriod`: `"intraday" | "daily" | "weekly" | "monthly" | "quarterly"`
- `InstitutionalHorizon`: `"short" | "medium" | "long"`
- `InstitutionalLiquidity`: `"low" | "medium" | "high"`
- `InstitutionalFlowSnapshot`: `{ inflows: number; outflows: number; asOf: string }`
- `InstitutionalOpenPositionsSnapshot`: `{ count: number; notional?: number }`
- `InstitutionalAnalysisContract`: `{ analysisId, ticker, instrument?, strike?, period, volume, liquidity, horizon, fundsOwnershipPct, flows, openPositions, sourceIds?, requestedAt }`

**Funciones públicas:**
- `isNonEmptyString(value: unknown): value is string` — línea 142
- `isFiniteNumber(value: unknown): value is number` — línea 149
- `isInstitutionalFlowSnapshot(value: unknown): value is InstitutionalFlowSnapshot` — línea 156
- `isInstitutionalOpenPositionsSnapshot(value: unknown): value is InstitutionalOpenPositionsSnapshot` — línea 172
- `isInstitutionalAnalysisContract(value: unknown): value is InstitutionalAnalysisContract` — línea 186
- `createInstitutionalAnalysisContract(payload): InstitutionalAnalysisContract` — línea 218

**APIs externas**: Ninguna.

**Configuraciones hardcoded:**
- `supportedPeriods` = `["intraday", "daily", "weekly", "monthly", "quarterly"]` (línea 192)
- `supportedHorizons` = `["short", "medium", "long"]` (línea 193)
- `supportedLiquidity` = `["low", "medium", "high"]` (línea 194)
- Validación: `fundsOwnershipPct >= 0 && fundsOwnershipPct <= 100` (líneas 206-207)

**Dependencias**: Ninguna (archivo de tipos puro).

---

### 1.2 institutionalDataService.ts

**Ruta**: `projects/rest-api/inversions_api/src/modules/institutional/institutionalDataService.ts`
**Líneas**: 1400
**FIC**: T107

**Tipos exportados:**
- `InstitutionalSourceKind`: `"sec_edgar_13f" | "finra_short_interest" | "unusual_whales" | "finviz_institutional" | "yahoo_options_flow" | "yahoo_institutional"`
- `InstitutionalAccessTier`: `"free" | "paid"`
- `InstitutionalSourceStatus`: `"ok" | "cached" | "rate_limited" | "failed" | "error" | "skipped"`
- `InstitutionalSourceError`: `{ sourceId, kind, code, message, retryable, status? }`
- `InstitutionalSourceObservation`: `{ sourceId, kind, ticker, instrument?, strike?, period?, volume?, liquidity?, horizon?, fundsOwnershipPct?, flows?, openPositions?, asOf, confidence, notes, raw }`
- `InstitutionalSourceReport`: `{ sourceId, kind, tier, enabled, status, cacheHit, latencyMs, fetchedAt, observation?, error? }`
- `InstitutionalOverallStatus`: `"ok" | "partial" | "all_failed"`
- `InstitutionalDataServiceResult`: `{ analysis, sourceReports, cacheHit, usedSourceIds, overallStatus }`
- `FetchLikeResponse`, `FetchLike`
- `InstitutionalSourcePathBuilder`, `InstitutionalSourceQueryBuilder`, `InstitutionalSourceParser`
- `InstitutionalSourceConfig`: `{ sourceId, kind, label, enabled, tier, baseUrl, path, method?, headers?, apiKey?, timeoutMs?, rateLimitPerMinute?, cacheTtlMs?, priority?, fallbackSourceIds?, queryParams?, parser? }`
- `InstitutionalDataServiceOptions`: `{ sources, cacheTtlMs?, cacheMaxEntries?, fetchImpl?, now? }`

**Funciones públicas tipo guard:**
- `isInstitutionalSourceConfig(value)` — línea 210
- `isInstitutionalSourceObservation(value)` — línea 236
- `isInstitutionalDataServiceResult(value)` — línea 263
- `isInstitutionalSourceReport(value)` — línea 283
- `isInstitutionalSourceError(value)` — línea 316

**Clase `InstitutionalDataService`:**
- `constructor(options: InstitutionalDataServiceOptions)` — línea 352
  - Valida que `options.sources` tenga al menos una fuente
  - Valida cada source con `isInstitutionalSourceConfig`
  - Ordena sources por `priority` ascendente
  - Cache TTL default: 5 min, max entries: 250
  - Fetch impl default: `globalThis.fetch`
- `async resolve(request: InstitutionalAnalysisContract): Promise<InstitutionalDataServiceResult>` — línea 379
  - Normaliza request con `createInstitutionalAnalysisContract`
  - **Filtra fuentes deshabilitadas** (skipped sync, sin I/O)
  - **Ejecuta fuentes habilitadas EN PARALELO** via `Promise.allSettled`
  - Mergea observaciones con `mergeObservations`
  - Calcula `overallStatus`: `"ok"` (todas ok/cached/skipped), `"partial"` (al menos una falló), `"all_failed"` (ningún dato)
- `async resolveAnalysis(request): Promise<InstitutionalAnalysisContract>` — línea 440 (convenience)
- `private resolveSingleSource(source, request)` — línea 453
  - Cache check → rate limit check → fetch + parse
  - Maneja errores internamente, nunca rechaza
- `private createNativeFetch(): FetchLike` — línea 546
- `private buildSourceUrl(source, request): string` — línea 556
  - Construye URL con `new URL(path, baseUrl)` + query params default
- `private async fetchAndNormalizeSource(source, request)` — línea 577
  - Si source tiene parser custom, lo invoca directamente (sin fetch)
  - Sino: fetch HTTP con timeout + parser default
- `private getDefaultParser(kind): InstitutionalSourceParser` — línea 629
  - Switch con 6 parsers embebidos (líneas 646-838):
    1. `parseSecEdgar13f` — extrae holdingsCount, fundsOwnershipPct, volume, inflows, outflows
    2. `parseFinraShortInterest` — shortInterest, volume, fundsOwnershipPct, positions
    3. `parseUnusualWhales` — flowPressure, volume, openPositions
    4. `parseFinvizInstitutional` — fundsOwnershipPct, volume, openPositions
    5. `parseYahooOptionsFlow` — optionChain → call/put volume + OI
    6. `parseYahooInstitutional` — quoteSummary → institutionOwnership
- `private buildObservationFromPayload(source, request, payload, partial)` — línea 840
- `private hasMeaningfulSignal(observation): boolean` — línea 883
  - Requiere al menos un campo numérico significativo
- `private computeConfidence(partial): number` — línea 907
  - 5 señales posibles: ownership, volume, inflows, outflows, count
  - ≥4 señales → 0.95, 3 → 0.85, 2 → 0.7, else → 0.55
  - Máximo 0.95 (nunca 1.0)
- `private normalizePercentage(value)` — línea 939
  - Si value ≤ 1 → multiplica ×100 (asume decimal)
  - Si value > 1 → usa directo (asume porcentaje)
- `private normalizeFlowSnapshot`, `normalizeOpenPositionsSnapshot`
- `private extractString`, `extractNumber`, `extractPeriod`, `extractLiquidity`, `extractHorizon` — múltiples path alternativos
- `private extractValue(payload, paths)` — línea 1060
  - Recorre múltiples paths, toma el primer valor definido
  - Soporta path `["length"]` para arrays
- `private readPath(payload, path)` — línea 1078
- `private mergeObservations(request, observations)` — línea 1119
  - **Estrategia de merge:**
    - `fundsOwnershipPct` → PROMEDIO
    - `volume` → MÁXIMO
    - `flows.inflows/outflows` → SUMA
    - `openPositions.count` → MÁXIMO
    - Campos categóricos → FIRST DEFINED (ordenado por confidence descendente)
    - `liquidity` → HIGHEST (pickHighestLiquidity)
- `private pickHighestLiquidity` — línea 1200
- `private getCacheKey(source, request): string` — línea 1213
  - Key = `sourceId:ticker` (solo ticker, no period/horizon)
- `private getCachedObservation`, `setCache` — líneas 1221-1258
  - LRU eviction cuando `cache.size > cacheMaxEntries`
- `private isRateLimited`, `registerRateAttempt` — líneas 1260-1279
  - Ventana de 60s, rate limit por source
- `private buildHttpError`, `buildTimeoutError`, `normalizeSourceError` — líneas 1282-1362
- `private buildSkippedReport` — línea 1364
- `private buildAggregateFailureMessage` — línea 1391

**APIs externas**: Fetch genérico (fetchImpl inyectado, default `globalThis.fetch`).

**Configuraciones hardcoded:**
- `DEFAULT_CACHE_TTL_MS` = 300,000 (5 min) — línea 203
- `DEFAULT_CACHE_MAX_ENTRIES` = 250 — línea 204
- `DEFAULT_SOURCE_TIMEOUT_MS` = 12,000 — línea 205
- Cache key = `sourceId:ticker` (sin period/horizon)
- Rate limit window = 60,000 ms (1 min)
- Confidence scoring: 4+ señales → 0.95, 3 → 0.85, 2 → 0.7, else → 0.55
- Merge: promedio ownership, máximo volume, suma flows, máximo positions, first defined categorical
- Orden de parsing de paths (múltiples variantes por campo)

**Dependencias**: `./institutionalContract.js`

---

### 1.3 realSourceParsers.ts

**Ruta**: `projects/rest-api/inversions_api/src/modules/institutional/realSourceParsers.ts`
**Líneas**: 634
**FIC**: T107b

**Funciones públicas:**
- `parseSecEdgar13fReal(_payload, request, source): Promise<InstitutionalSourceObservation | null>` — línea 284
  - Timeout de 60s para toda la operación SEC
  - Captura `NOT_APPLICABLE` errors y los re-lanza (para skipped status)
- `parseFinraShortInterestReal(_payload, request, source): Promise<InstitutionalSourceObservation | null>` — línea 544
  - Usa `ensureFinraCache()` para precarga
  - Si ticker no encontrado → fallback sintético con confidence 0.3
- `ensureFinraCache(): Promise<void>` — línea 520
  - Singleton + in-flight dedup
  - Carga desde disco si existe y no expiró
  - Si no: fetch completo + save a disco

**Funciones privadas:**
- `fetchWithTimeout(url, headers, timeoutMs)` — línea 38
- `nativeFetchJson(url)` — línea 48
- `nativeFetchText(url)` — línea 54
- `withTimeout(promise, ms, label)` — línea 60
- `readFilingDir(cik, adsh)` — línea 72
  - URL: `https://www.sec.gov/Archives/edgar/data/${cik}/${stripped}/index.json`
- `getEftsDateRange(period)` — línea 106
  - weekly → 6 meses atrás
  - monthly/quarterly → desde 2024-01-01
  - daily/intraday → 3 meses atrás
- `searchEfts(ticker, formType, period)` — línea 126
  - Cache en `searchEftsCache` (Map, nunca expira)
  - In-flight dedup con `inflightEfts` (Map)
- `doSearchEfts(ticker, formType, period)` — línea 148
  - URL: `https://efts.sec.gov/LATEST/search-index?q=TICKER&dateRange=custom&startdt=...&enddt=...&forms=13F-HR`
- `extractInfoTableEntries(xmlText)` — línea 161
  - Regex `<infoTable>` → extrae campos nameOfIssuer, cusip, sshPrnamt, value
- `findXmlWithHoldings(cik, adsh, dirItems)` — línea 181
- `cusipForTicker(ticker): string | null` — línea 207
  - **Mapa de 60 tickers a CUSIP** (líneas 208-280):
    AAPL, MSFT, GOOGL, GOOG, AMZN, META, TSLA, NVDA, JPM, V, SPY, QQQ, INTC, CSCO, IBM, QCOM, AMD, ADBE, ORCL, CRM, NOW, INTU, WMT, HD, COST, PG, KO, PEP, MCD, DIS, SBUX, NFLX, BKNG, LOW, TGT, UNH, JNJ, ABBV, MRK, LLY, TMO, ABT, PFE, MDT, XOM, CVX, BA, GE, CAT, UPS, UNP, HON, LMT, C, BRK.B, BRK.A, VZ, T, NEE, AVGO, ACN, LIN, AMT, TROW
- `secEdgar13fInner(request, source)` — línea 305
  - Salta si period es intraday/daily (NOT_APPLICABLE)
  - Busca CUSIP, busca EFTS, parsea XML del filing, extrae posiciones
  - `MAX_FILINGS = 1` (solo el filing más reciente)
- `parseCsvLine(line): string[]` — línea 415
- `fetchFinraPage(limit, offset): Promise<FinraRecord[]>` — línea 428
  - POST a FINRA_API con body `{ limit, offset }`
  - Parseo manual de CSV (columnas: symbol, currentShort, prevShort, avgDailyVol, daysToCover, changePct, settleDate, dateStr)
- `recordsArrayToMap(records): Map<string, FinraRecord[]>` — línea 469
- `loadFinraCacheFromDisk()` — línea 481
  - Archivo: `/tmp/inversions-api-finra-cache.json`
- `saveFinraCacheToDisk(records)` — línea 493
- `fetchAllFinraRecords(): Promise<FinraRecord[]>` — línea 502
  - Paginación: hasta FINRA_MAX_PAGES (6) páginas de FINRA_PAGE_SIZE (5000)
  - Corta cuando cambia la fecha

**APIs externas:**
- SEC EDGAR EFTS Search: `https://efts.sec.gov/LATEST/search-index`
- SEC EDGAR Filing Index: `https://www.sec.gov/Archives/edgar/data/{cik}/{stripped}/index.json`
- SEC EDGAR XML Filing: `https://www.sec.gov/Archives/edgar/data/{cik}/{stripped}/{filename}`
- FINRA Short Interest: `https://api.finra.org/data/group/otcmarket/name/consolidatedShortInterest` (POST)

**Configuraciones hardcoded:**
- `EDGAR_USER_AGENT` = `process.env.EDGAR_USER_AGENT ?? "TurboPapus/1.0 (contact@turbopapus.com)"` — línea 24
- `SEC_REQUEST_TIMEOUT_MS` = 30,000 — línea 26
- `JSON_HEADERS`: `User-Agent: EDGAR_USER_AGENT, Accept: application/json` — línea 28
- `XML_HEADERS`: `User-Agent: EDGAR_USER_AGENT, Accept: application/xml, text/xml, text/plain` — línea 33
- Date ranges: 3 meses (daily/intraday), 6 meses (weekly), desde 2024 (monthly/quarterly) — líneas 106-124
- `MAX_FILINGS = 1` — línea 324
- Mapa CUSIP de 60 tickers (hardcoded) — líneas 208-280
- `FINRA_API = "https://api.finra.org/data/group/otcmarket/name/consolidatedShortInterest"` — línea 408
- `FINRA_PAGE_SIZE = 5000` — línea 409
- `FINRA_MAX_PAGES = 6` — línea 410
- `FINRA_CACHE_TTL_MS` = 86,400,000 (24h) — línea 466
- `FINRA_CACHE_FILE` = `/tmp/inversions-api-finra-cache.json` — línea 467
- Fallback sintético FINRA: `estimatedShort = 500000 + random * 2000000`, `estimatedVolume = 1000000 + random * 5000000` — líneas 604-605
- Multiplicador notional FINRA: 2.3× short interest — líneas 574, 582, 622
- Confidence FINRA real: 0.88 (si daysToCover > 0 && avgDailyVol > 0) else 0.7 — línea 584
- Confidence FINRA fallback: 0.3 — línea 625
- Confidence SEC EDGAR: ≥5 holders → 0.88, ≥2 → 0.8, else → 0.65 — línea 385
- Flows SEC EDGAR: inflows = totalValue * 0.5 / 1000, outflows = totalValue * 0.25 / 1000 — líneas 376-377
- SEC timeout global: 60s — línea 291

**Dependencias:** `node:fs`, `node:path`, `node:os`, `./institutionalContract.js`, `./institutionalDataService.js`

---

### 1.4 yahooCrumbSession.ts

**Ruta**: `projects/rest-api/inversions_api/src/modules/institutional/yahooCrumbSession.ts`
**Líneas**: 121
**FIC**: T340b

**Tipos exportados:**
- `CrumbSession`: `{ crumb: string; cookie: string; expiresAt: number }`

**Funciones públicas:**
- `ensureCrumbSession(): Promise<CrumbSession>` — línea 72
  - Singleton con shared-promise dedup
  - Cache de módulo (`sessionCache`, `sessionPromise`)
  - Flujo: GET fc.yahoo.com (cookie) → GET v1/test/getcrumb (crumb)

**APIs externas:**
- Yahoo Cookie: `https://fc.yahoo.com` (GET, redirect: "manual")
- Yahoo Crumb: `https://query2.finance.yahoo.com/v1/test/getcrumb` (GET)

**Configuraciones hardcoded:**
- `YAHOO_USER_AGENT` = `"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"` — línea 32
- `YAHOO_CRUMB_URL` = `"https://query2.finance.yahoo.com/v1/test/getcrumb"` — línea 33
- `YAHOO_COOKIE_URL` = `"https://fc.yahoo.com"` — línea 34
- `CRUMB_TTL_MS` = 900,000 (15 min) — línea 35
- `YAHOO_HEADERS`: `User-Agent, Accept: application/json` — línea 37
- Cookie extraction regex: `/[A-Za-z0-9]+=[A-Za-z0-9]+/` — línea 92

**Dependencias:** Ninguna (solo fetch global).

---

### 1.5 yahooOptionsParser.ts

**Ruta**: `projects/rest-api/inversions_api/src/modules/institutional/yahooOptionsParser.ts`
**Líneas**: 334
**FIC**: T338/T211

**Funciones públicas:**
- `parseYahooOptionsFlow(_payload, request, source): Promise<InstitutionalSourceObservation | null>` — línea 261
  - Obtiene crumb session, fetch options chain, computa señales
  - Fallback: si API no disponible → `buildFallbackObservation` con confidence 0.3

**Funciones privadas:**
- `fetchYahooOptions(ticker)` — línea 80
  - URL: `https://query2.finance.yahoo.com/v7/finance/options/{TICKER}?crumb={CRUMB}`
- `computeOptionsFlowSignal(result): OptionsFlowSignal` — línea 139
  - callVolume, putVolume, callOi, putOi, put/call ratios
  - `unusualStrikeCount`: volumen > 2× OI
  - `directionalBias`: (callVolume - putVolume) / totalVolume
- `buildFallbackObservation(ticker, request, source)` — línea 203
  - Seed determinista por ticker (suma charCodes)
  - Volume estimado: 15,000-20,000 + seed-based variation

**APIs externas:**
- Yahoo Finance v7 Options: `https://query2.finance.yahoo.com/v7/finance/options/{TICKER}?crumb={CRUMB}`

**Configuraciones hardcoded:**
- `YAHOO_USER_AGENT` = `"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"` — línea 27
- `YAHOO_OPTIONS_URL` = `"https://query2.finance.yahoo.com/v7/finance/options"` — línea 28
- `REQUEST_TIMEOUT_MS` = 10,000 — línea 29
- `YAHOO_HEADERS`: `User-Agent, Accept: application/json` — línea 31
- Umbral unusual volume: 2× open interest — línea 157
- Confidence formula: `0.4 + (expirationCount/6)*0.2 + min(unusualStrikeCount/10,1)*0.2 + (totalVolume>0?0.15:0) + (totalOi>0?0.15:0)`, capped at 0.95 — líneas 285-291
- Fallback: volume = `15000 + (seed % 5000) * (volume/1000000)` — línea 210
- Fallback confidence: 0.3 — línea 232

**Dependencias:** `./institutionalContract.js`, `./institutionalDataService.js`, `./yahooCrumbSession.js`

---

### 1.6 yahooInstitutionalParser.ts

**Ruta**: `projects/rest-api/inversions_api/src/modules/institutional/yahooInstitutionalParser.ts`
**Líneas**: 273
**FIC**: T339/T212

**Funciones públicas:**
- `parseYahooInstitutional(_payload, request, source): Promise<InstitutionalSourceObservation | null>` — línea 176
  - Obtiene crumb session, fetch quoteSummary, parsea institutionOwnership + majorHoldersBreakdown
  - Fallback: `buildFallbackObservation` con confidence 0.3

**Funciones privadas:**
- `fetchYahooInstitutional(ticker)` — línea 78
  - URL: `https://query2.finance.yahoo.com/v10/finance/quoteSummary/{TICKER}?modules=institutionOwnership,majorHoldersBreakdown&crumb={CRUMB}`
- `buildFallbackObservation(ticker, request, source)` — línea 117
  - Seed determinista, holders estimados: 500-700, ownership: 25-55%

**APIs externas:**
- Yahoo Finance v10 Quote Summary: `https://query2.finance.yahoo.com/v10/finance/quoteSummary/{TICKER}?modules=institutionOwnership,majorHoldersBreakdown&crumb={CRUMB}`

**Configuraciones hardcoded:**
- `YAHOO_USER_AGENT` = `"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"` — línea 27
- `YAHOO_QUOTE_URL` = `"https://query2.finance.yahoo.com/v10/finance/quoteSummary"` — línea 28
- `REQUEST_TIMEOUT_MS` = 10,000 — línea 29
- `YAHOO_HEADERS`: `User-Agent, Accept: application/json` — línea 31
- Modules: `"institutionOwnership,majorHoldersBreakdown"` — línea 81
- Confidence formula: `0.35 + (holderCount/50)*0.25 + (ownership?0.2:0) + (holders>0?0.15:0) + (change!=0?0.05:0)`, capped at 0.95 — líneas 222-228
- Fallback: holders = `500 + (seed % 200)`, ownership = `25 + (seed % 30)`, shares = holders * 150000 * (volume/1000000) — líneas 124-126
- Fallback confidence: 0.3 — línea 146

**Dependencias:** `./institutionalContract.js`, `./institutionalDataService.js`, `./yahooCrumbSession.js`

---

### 1.7 institutionalZonesEngine.ts

**Ruta**: `projects/rest-api/inversions_api/src/modules/institutional/institutionalZonesEngine.ts`
**Líneas**: 523
**FIC**: T108

**Tipos exportados:**
- `InstitutionalZoneType`: `"support" | "resistance"`
- `InstitutionalOhlcCandle`: `{ time, open, high, low, close, volume }`
- `InstitutionalZone`: `{ type, price, strength, accumulatedVolume, confidence, confirmingSources, touches, liquidity, asOf, notes }`
- `InstitutionalZonesResult`: `{ analysis, zones, candlesAnalyzed, sourceReports, generatedAt, overallStatus }`
- `InstitutionalZonesRequest`: `{ analysis, candles? }`
- `InstitutionalZonesEngineOptions`: `{ institutionalDataService, maxZones?, pivotWindow?, clusterTolerancePct?, liquidityVolumeMultiplier? }`

**Funciones públicas tipo guard:**
- `isInstitutionalOhlcCandle(value)` — línea 108
- `isInstitutionalZone(value)` — línea 129
- `isInstitutionalZonesResult(value)` — línea 162

**Factories:**
- `createInstitutionalZone(zone)` — línea 185
- `createInstitutionalZonesResult(result)` — línea 196

**Clase `InstitutionalZonesEngine`:**
- `constructor(options)` — línea 214
- `async analyze(request, preResolvedResult?)` — línea 234
  - Acepta `preResolvedResult` opcional (evita resolve duplicado)
  - Genera fallback candles (60 velas sinusoidales) si no se proveen
  - Calcula pivots (pivotWindow=2), clusteriza candidates, rankea por strength
- `async identifyZones(request): Promise<InstitutionalZone[]>` — línea 265 (convenience)

**Métodos privados:**
- `normalizeCandles(candles)` — línea 270
- `buildFallbackCandles(analysis, result)` — línea 284
  - 60 velas diarias, precio base sinusoidal + institutional bias
  - Drift = sin(index/5) * (basePrice * 0.012)
- `estimateBasePrice(analysis, result)` — línea 312
- `deriveInstitutionalBias(result, index)` — línea 322
- `calculateInstitutionalScore(result)` — línea 328
  - Formula: `0.2 + sourceConfidence*0.35 + ownership*0.2 + positionFactor*0.15 + flowFactor*0.1`
- `buildCandidates(candles, result, liquidityThreshold)` — línea 351
  - Detecta pivot lows/highs con ventana de 2
  - Filtra por liquidez (volume ≥ averageVolume * 1.15)
- `zoneConfidence(type, candle, institutionalScore, highLiquidity)` — línea 398
  - Formula: `0.35 + institutionalScore*0.35 + (highLiquidity?0.15:0.05) + directionalBias*0.1 + candleBody*0.05`
- `countConfirmingSources(result)` — línea 415
- `clusterCandidates(candidates, candles)` — línea 419
  - Clusteriza por precio (tolerance = ATR * clusterTolerancePct)
  - Weighted average price, accumulated volume, confidence boost
- `toInstitutionalZone(candidate, result, candles)` — línea 452
  - Strength: `0.25 + volumeScore*0.35 + sourceScore*0.2 + touchesScore*0.15 + liquidityScore*0.05 + confidence*0.15`
- `liquidityWeight(liquidity)` — línea 488
  - high=1, medium=0.7, low=0.4
- `calculateAverageVolume`, `estimateAverageClose`, `calculateAtr`, `average`, `clamp01`

**APIs externas**: Ninguna (usa `InstitutionalDataService.resolve()`).

**Configuraciones hardcoded:**
- `maxZones` default = 8 — línea 220
- `pivotWindow` default = 2 — línea 221
- `clusterTolerancePct` default = 0.0125 (1.25%) — línea 222
- `liquidityVolumeMultiplier` default = 1.15 — línea 223
- Fallback candles: 60 velas, drift sinusoidal ±1.2%, noise coseno ±0.7% — líneas 291-296
- Confidence floor: 0.35 — línea 407
- Strength floor: 0.25 — línea 463
- Touches score cap: /6 — línea 460

**Dependencias:** `./institutionalContract.js`, `./institutionalDataService.js`

---

### 1.8 institutionalTrendEngine.ts

**Ruta**: `projects/rest-api/inversions_api/src/modules/institutional/institutionalTrendEngine.ts`
**Líneas**: 974
**FIC**: T109

**Tipos exportados:**
- `TrendDirection`: `"bullish" | "bearish" | "neutral"`
- `MovingAverage`: `{ period, value, slope, rising, sampleCount }`
- `MaCrossover`: `{ type: "golden_cross" | "death_cross" | "none", occurredAt, daysSince, ma50, ma200, spread }`
- `VolumeCorrelation`: `{ correlationCoefficient, volumeTrend, quarterlyReportsAnalyzed }`
- `ContinuityFactors`: `{ maAlignment, volumeConfirmation, ownershipTrend, flowMomentum }`
- `ContinuityProbability`: `{ probability, factors }`
- `InstitutionalTrendResult`: `{ analysis, movingAverages, crossover, currentTrend, trendStrength, supportLevel, resistanceLevel, volumeCorrelation, continuityProbability, sourceReports, candlesAnalyzed, generatedAt }`
- `InstitutionalTrendRequest`: `{ analysis, candles? }`
- `InstitutionalTrendEngineOptions`: `{ institutionalDataService, minCandles?, fastMaPeriod?, slowMaPeriod?, volumeLookback? }`

**Funciones públicas tipo guard:**
- `isMovingAverage(value)` — línea 197
- `isMaCrossover(value)` — línea 216
- `isVolumeCorrelation(value)` — línea 232
- `isContinuityFactors(value)` — línea 249
- `isContinuityProbability(value)` — línea 263
- `isInstitutionalTrendResult(value)` — línea 275

**Factories:**
- `createMovingAverage`, `createMaCrossover`, `createVolumeCorrelation`, `createContinuityFactors`, `createContinuityProbability`, `createInstitutionalTrendResult`

**Clase `InstitutionalTrendEngine`:**
- `constructor(options)` — línea 384
- `async analyze(request, preResolvedResult?)` — línea 403
  - SMA-50 y SMA-200
  - Crossover detection con lookback de 30 días
  - Volume correlation con señales sintéticas trimestrales
  - Trend direction, support/resistance, trend strength, continuity probability
- `async analyzeTrend(request)` — línea 480 (convenience)

**Métodos privados:**
- `normalizeCandles`, `buildFallbackCandles` (slowMaPeriod + 60 velas, sinusoidal ±10% + noise ±0.75%)
- `estimateBasePrice`, `deriveInstitutionalBias`
- `computeSma(data, period)` — línea 572
  - Slope: compara primera mitad vs segunda mitad del período
- `detectCrossover(closePrices, fastValue, slowValue)` — línea 598
  - Tolerance 0.2%, lookback 30 días
- `computeVolumeCorrelation(volumes, analysis)` — línea 674
  - Pearson correlation con 4 señales trimestrales sintéticas
- `determineTrend(fastMa, slowMa, fastRising, slowRising, crossover)` — línea 737
  - 6 condiciones: golden/death cross fuerte/moderado, neutral por convergencia
- `estimatePriceLevels(candles, fastMa, slowMa)` — línea 785
  - Support = min(slowMa, fastMa, minLow de últimas 20 velas)
  - Resistance = max(slowMa, fastMa, maxHigh de últimas 20 velas)
- `computeTrendStrength(fastMa, slowMa, crossover, volumeCorrelation, analysis)` — línea 809
  - MA separation (30%), slope (15%), crossover recency (20%), volume (20%), flow (15%)
- `computeContinuityProbability(...)` — línea 854
  - MA alignment (35%), volume confirmation (25%), ownership trend (20%), flow momentum (20%)
- `calculateInstitutionalScore` — línea 914
- `pearsonCorrelation(x, y)` — línea 940

**APIs externas**: Ninguna.

**Configuraciones hardcoded:**
- `DEFAULT_MIN_CANDLES` = 200 — línea 185
- `DEFAULT_FAST_MA_PERIOD` = 50 — línea 186
- `DEFAULT_SLOW_MA_PERIOD` = 200 — línea 187
- `DEFAULT_VOLUME_LOOKBACK` = 20 — línea 188
- Crossover tolerance: 0.002 (0.2%) — línea 605
- Crossover lookback: 30 días — línea 625
- Trend strength weights: MA sep 30%, slope 15%, crossover 20%, volume 20%, flow 15% — líneas 843-848
- Continuity weights: MA 35%, volume 25%, ownership 20%, flow 20% — líneas 902-906
- Institutional score: `0.2 + confidence*0.35 + ownership*0.2 + posFactor*0.15 + flowFactor*0.1` — líneas 928-934
- Fallback candles: sinusoidal ±10% + random noise ±0.75% — líneas 528-531

**Dependencias:** `./institutionalContract.js`, `./institutionalDataService.js`, `./institutionalZonesEngine.js`

---

### 1.9 expirationAnalysisEngine.ts

**Ruta**: `projects/rest-api/inversions_api/src/modules/institutional/expirationAnalysisEngine.ts`
**Líneas**: 1097
**FIC**: T110

**Tipos exportados:**
- `ExpirationEventType`: `"monthly_opex" | "quarterly_opex" | "weekly_opex" | "quarter_futures" | "monthly_futures"`
- `ExpirationEvent`: `{ type, date, label, daysUntil, directionalBias, significance }`
- `SlopeDirection`: `"call_skew" | "put_skew" | "symmetric"`
- `SlipperySlope`: `{ direction, accelerationFactor, driftPct, attractorStrike, confidence, peakDays }`
- `CatalystType`: `"earnings" | "fomc" | "cpi" | "monthly_opex" | "quarterly_opex" | "triple_witching" | "dividend_ex" | "index_rebalance"`
- `CatalystWindow`: `{ type, date, label, daysUntil, volatilityImpact, volumeSurgeFactor, confidence }`
- `TimeDecayProfile`: `{ thetaPct, gammaExposurePct, accelerationDays, decayRegime, vannaExposurePct, charmPct }`
- `QuarterlyReportCorrelation`: `{ overlappingWindows, averageImpactPct, totalQuarterlyWindows, filingExpirationCorrelation, currentlyInWindow, daysUntilNextWindow }`
- `ExpirationAnalysisResult`: `{ analysis, expirationEvents, slipperySlope, catalystWindows, timeDecay, quarterlyCorrelation, analysisWindowDays, sourceReports, generatedAt }`
- `ExpirationAnalysisRequest`: `{ analysis, candles?, referenceDate?, analysisWindowDays? }`
- `ExpirationAnalysisEngineOptions`: `{ institutionalDataService, defaultWindowDays?, lookAheadMonths?, strikeProximityPct? }`

**Funciones públicas tipo guard:**
- `isExpirationEventType`, `isExpirationEvent`, `isSlopeDirection`, `isSlipperySlope`, `isCatalystType`, `isCatalystWindow`, `isTimeDecayProfile`, `isQuarterlyReportCorrelation`, `isExpirationAnalysisResult`

**Factories:**
- `createExpirationEvent`, `createSlipperySlope`, `createCatalystWindow`, `createTimeDecayProfile`, `createQuarterlyReportCorrelation`, `createExpirationAnalysisResult`

**Clase `ExpirationAnalysisEngine`:**
- `constructor(options)` — línea 479
- `async analyze(request, preResolvedResult?)` — línea 497
  - Detecta expiration events, slippery slope, catalyst windows, time decay, quarterly correlation
- `async analyzeExpirationSummary(request)` — línea 537 (convenience)

**Métodos privados:**
- `detectExpirationEvents(referenceDate)` — línea 561
  - Itera `lookAheadMonths` meses, calcula OpEx (3er viernes), quarter futures (último viernes), triple witching
- `computeSlipperySlope(analysis, candles, referenceDate)` — línea 632
  - Atractor = nearest strike, drift, acceleration factor
- `determineSlopeDirection(analysis)` — línea 672
  - flowRatio > 0.25 && ownership > 30 → call_skew
  - flowRatio < -0.25 && ownership < 20 → put_skew
  - else → symmetric
- `detectCatalystWindows(referenceDate)` — línea 698
  - FOMC (meses 1,3,5,6,7,9,11,12 → 2do miércoles)
  - CPI (2do miércoles de cada mes)
  - Earnings (meses 1,4,7,10 → 2do viernes)
  - Monthly/quarterly OpEx, Triple Witching
- `computeTimeDecayProfile(events, referenceDate)` — línea 809
  - ≤7 días → at_expiration (theta 0.8-2.0, gamma 1.2+)
  - 8-30 días → near (theta 0.3-0.8, gamma 0.3-1.0)
  - >30 días → far (theta 0.05-0.2, gamma 0.05)
  - Vanna y Charm calculados por régimen
- `computeQuarterlyCorrelation(events, analysis, referenceDate)` — línea 888
  - Ventanas de reporte: 7 días antes a 14 después de mid-Feb/May/Aug/Nov
  - Overlap counting, correlation sintética
- `estimateCurrentPrice`, `findNearestStrike`, `estimateExpiryBias`
- `findNthWeekday(year, month, nth, weekday)` — línea 1021
- `findLastWeekday(year, month, weekday)` — línea 1033
- `daysToNextQuarterEnd`, `daysToNearestOpEx`, `monthLabel`
- `clamp01`, `clampNeg1Pos1`, `average`

**APIs externas**: Ninguna.

**Configuraciones hardcoded:**
- `DEFAULT_WINDOW_DAYS` = 90 — línea 226
- `DEFAULT_LOOK_AHEAD_MONTHS` = 6 — línea 227
- `DEFAULT_STRIKE_PROXIMITY_PCT` = 0.05 — línea 228
- `OPEX_WEEKDAY` = 5 (Friday) — línea 229
- `QUARTER_MONTHS` = [3, 6, 9, 12] — línea 230
- `TRIPLE_WITCHING_MONTHS` = [3, 6, 9, 12] — línea 231
- `QUARTERLY_REPORT_MONTHS` = [2, 5, 8, 11] — línea 232
- FOMC months: [1, 3, 5, 6, 7, 9, 11, 12] — línea 711
- Earnings months: [1, 4, 7, 10] — línea 747
- Slippery slope thresholds: flowRatio > 0.25, ownership > 30; flowRatio < -0.25, ownership < 20 — líneas 678, 683
- Expiry bias: Jan-Mar neutral, Apr-Jun bullish, Jul-Sep neutral, Oct-Dec bearish — líneas 1011-1014
- Theta/gamma thresholds: 7 días y 30 días — líneas 835-847
- Quarterly report window: -7/+14 días alrededor del 15 — líneas 904-905
- Average impact: overlapRatio * 3.5% — línea 926

**Dependencias:** `./institutionalContract.js`, `./institutionalDataService.js`, `./institutionalZonesEngine.js`

---

## 2. Módulo: `src/modules/strategies/coverage/`

### 2.1 collarEngine.ts

**Ruta**: `projects/rest-api/inversions_api/src/modules/strategies/coverage/collarEngine.ts`
**Líneas**: 261

**Clase `CollarEngine`:**
- `analyze(contract): CoverageStrategyResult` — valida, calcula risk metrics, genera alerts
- `validate(contract): string[]`
- `calculateRiskMetrics(contract, currentPrice)`
- `evaluateProtection(contract, scenarios)`
- `evaluateUpside(contract, scenarios)`
- `generateAlerts(contract, metrics)`

**APIs externas:** Ninguna.

**Config hardcoded:** `maxLegs: 2`, collar ratio 1:1.

**Dependencias:** `coverageTypes.ts`, `coverageStrategyContract.ts`

---

### 2.2 protectivePutEngine.ts

**Ruta**: `projects/rest-api/inversions_api/src/modules/strategies/coverage/protectivePutEngine.ts`
**Líneas**: 274

**Clase `ProtectivePutEngine`:**
- `analyze(contract)`
- `validate(contract)`
- `calculateRiskMetrics(contract, currentPrice)`
- `evaluateProtection(contract, scenarios)`
- `generateAlerts(contract, metrics)`

**APIs externas:** Ninguna.

**Config hardcoded:** `maxLegs: 1`.

**Dependencias:** `coverageTypes.ts`, `coverageStrategyContract.ts`

---

### 2.3 coveredStraddleEngine.ts

**Ruta**: `projects/rest-api/inversions_api/src/modules/strategies/coverage/coveredStraddleEngine.ts`
**Líneas**: 253

**Clase `CoveredStraddleEngine`:**
- `analyze(contract)`
- `validate(contract)`
- `calculateRiskMetrics(contract, currentPrice)`
- `evaluatePremium(contract, scenarios)`
- `generateAlerts(contract, metrics)`

**APIs externas:** Ninguna.

**Config hardcoded:** `maxLegs: 2`, short put + short call.

**Dependencias:** `coverageTypes.ts`, `coverageStrategyContract.ts`

---

### 2.4 coverageTypes.ts

**Ruta**: `projects/rest-api/inversions_api/src/modules/strategies/coverage/coverageTypes.ts`
**Líneas**: ~300

**Funciones públicas:**
- `createCoverageStrategyResult`, `createCoverageSimulationResult`, `createCoverageReportResult`, `estimateOptionPremium`, `round`

**Tipos exportados:**
- `CoverageStrategyResult`, `CoverageSimulationResult`, `CoverageReportResult`, `CoverageRiskServiceResult`, `CoverageOptionLeg`

**APIs externas:** Ninguna.

**Config hardcoded:** Fórmula Black-Scholes simplificada para estimación de primas.

**Dependencias:** `coverageStrategyContract.ts`

---

### 2.5 coverageStrategyContract.ts

**Ruta**: `projects/rest-api/inversions_api/src/modules/strategies/coverage/coverageStrategyContract.ts`
**Líneas**: ~150

**Funciones públicas:**
- `createCoverageStrategyContract`, `isFiniteNumber`, `isNonEmptyString`

**Tipos exportados:**
- `CoverageStrategyContract`, `CoverageStrategyKind`, `CoverageOptionLeg`

**APIs externas:** Ninguna.

**Config hardcoded:** Validación por strategy kind.

**Dependencias:** Ninguna.

---

### 2.6 coverageStrategyAdapter.ts

**Ruta**: `projects/rest-api/inversions_api/src/modules/strategies/coverage/coverageStrategyAdapter.ts`
**Líneas**: ~100

**Funciones públicas:**
- `adaptContractToEngine`, `adaptResultToResponse`

**APIs externas:** Ninguna.

**Dependencias:** `coverageTypes.ts`, `coverageStrategyContract.ts`

---

### 2.7 coverageSimulationEngine.ts

**Ruta**: `projects/rest-api/inversions_api/src/modules/strategies/coverage/coverageSimulationEngine.ts`
**Líneas**: ~250

**Clase `CoverageSimulationEngine`:**
- `analyze(contract)` — punto de entrada
- `runMonteCarlo(contract)` — 10,000 simulaciones
- `calculateScenario(contract, pricePath)` — escenario individual
- `computePercentiles(results)` — percentiles PnL

**APIs externas:** Ninguna.

**Config hardcoded:** Monte Carlo con 10,000 iteraciones, distribución normal, 10 escenarios predeterminados.

**Dependencias:** `coverageTypes.ts`, `coverageStrategyContract.ts`

---

### 2.8 coverageComparator.ts

**Ruta**: `projects/rest-api/inversions_api/src/modules/strategies/coverage/coverageComparator.ts`
**Líneas**: ~280

**Clase `CoverageComparator`:**
- `compare(baseRequest)` — compara las 4 estrategias
- `rankByRiskReward()`, `rankByProtection()`, `rankByCost()`
- `buildComparisonMatrix()`

**APIs externas:** Ninguna.

**Config hardcoded:** Pesos de ranking, thresholds de comparación.

**Dependencias:** `collarEngine.ts`, `protectivePutEngine.ts`, `coveredStraddleEngine.ts`, `coverageStrategyContract.ts`, `coverageTypes.ts`

---

### 2.9 coverageRiskService.ts

**Ruta**: `projects/rest-api/inversions_api/src/modules/strategies/coverage/coverageRiskService.ts`
**Líneas**: ~200

**Clase `CoverageRiskService`:**
- `evaluate(baseResult, simulationResult, recipients?)` — evalúa riesgo completo
- `evaluateDrawdown(series)` — máximo drawdown
- `evaluateVolatility(series)` — volatilidad anualizada
- `evaluateGreeks(contract)` — delta, gamma, theta, vega
- `generateActions(metrics)` — alertas basadas en thresholds

**APIs externas:** Ninguna.

**Config hardcoded:** Drawdown threshold 20%, VaR 95%, severity levels.

**Dependencias:** `coverageTypes.ts`

---

### 2.10 coverageReportService.ts

**Ruta**: `projects/rest-api/inversions_api/src/modules/strategies/coverage/coverageReportService.ts`
**Líneas**: 119
**FIC**: T119

**Clase `CoverageReportService`:**
- `constructor(options: CoverageReportServiceOptions)` — línea 33
  - Crea `CoverageSimulationEngine` y `CoverageRiskService`
  - `outputDir` default: `path.join(process.cwd(), "reports", "coverage")`
- `async generateReport(strategyReq, recipients?, precomputed?)` — línea 39
  - Acepta `precomputed` (simulation + risk) para evitar duplicados
  - Genera resumen (expectedPnL, winRate, bestPnL, worstPnL, R/R ratio, alertCount)
  - Exporta JSON + Markdown a disco en paralelo
  - Retorna `CoverageReportResult` con exports embebidos
- `private buildSummary(sim, risk)` — línea 102
  - expectedPnL, expectedPnLPct, bestPnL, worstPnL, riskRewardRatio, winRate, lossRate, alertCount

**APIs externas:** Sistema de archivos (`node:fs`).

**Configuraciones hardcoded:**
- `outputDir` default: `<cwd>/reports/coverage` — línea 36
- Formato JSON: `{ summary, baseResult, risk }` — línea 60
- Formato Markdown: `# Coverage Report - {strategyId}` con summary + alerts — líneas 63-76
- Archivos: `{strategyId}-report.json` y `{strategyId}-summary.md` — líneas 59, 62

**Dependencias:** `node:fs`, `node:path`, `./coverageStrategyContract.js`, `./coverageTypes.js`, `./coverageSimulationEngine.js`, `./coverageRiskService.js`

---

## 3. Módulo: `src/modules/ai/`

### 3.1 institutionalCopilotChat.ts

**Ruta**: `projects/rest-api/inversions_api/src/modules/ai/institutionalCopilotChat.ts`
**Líneas**: 618
**FIC**: T121

**Tipos exportados:**
- `AIAnalystRole`: `"analyst" | "risk_manager"`
- `InstitutionalCopilotContext`: `{ contextId, ticker, currentPrice, zones, coverageStrategies, question, userRole, requestedAt }`
- `InstitutionalCopilotEvidence`: `{ evidenceId, sourceType, label, value }`
- `InstitutionalCopilotScenarioAnalysisItem`: `{ label, description, protectionLevel, potentialPnL }`
- `InstitutionalCopilotResponse`: `{ contextId, context_id, responseId, response_id, ticker, narrative, reasoning, scenarioAnalysis, recommendation, evidenceIds, evidence_ids, modelVersion, model_version, responseHash, response_hash, ai_unavailable, timestamp }`
- `InstitutionalCopilotAcceptedResponse`: `{ status, contextId, responseId, pollingUrl, retryAfterSeconds, ai_unavailable, timestamp }`
- `InstitutionalCopilotSubmissionResponse`: `InstitutionalCopilotResponse | InstitutionalCopilotAcceptedResponse`

**Clase `InstitutionalCopilotChat`:**
- `constructor()` — configura constantes internas (sin parámetros)
- `async chat(context): Promise<InstitutionalCopilotSubmissionResponse>` — línea 131 (delega a `submit`)
- `async submit(context): Promise<InstitutionalCopilotSubmissionResponse>` — línea 152
  - Valida role con `assertAllowedRole`
  - Extrae evidencia de zones + strategies
  - Crea job con responseId, pollingUrl
  - Inicia Gemini en background (sin await)
  - **Promise.race** entre ejecución Gemini y ventana de decisión (5s)
  - Si Gemini responde ≤5s → respuesta directa (HTTP 200)
  - Si Gemini tarda >5s → 202 Accepted con pollingUrl
- `async poll(responseId): Promise<...>` — línea 206
  - Busca job en el Map
  - Si tiene resultado → lo retorna y elimina job
  - Si expiró → `buildUnavailableResponse`
  - Si pending → retorna 202 Accepted
- `private async runGeminiWorkflow(job)` — línea 236
  - Lee `GEMINI_API_KEY` de env
  - Build prompt → request Gemini → parse response → build success response
- `private assertAllowedRole(role)` — línea 248
  - Solo `"analyst"` y `"risk_manager"` permitidos
- `private async requestGemini(prompt, apiKey)` — línea 254
  - POST a Gemini API con AbortController timeout 30s
  - Body: `{ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, topP: 0.9, maxOutputTokens: 8192, responseMimeType: "application/json" } }`
- `private parseGeminiResponse(response): GeminiParsedPayload` — línea 297
  - Extrae texto del candidato, parsea JSON, valida campos: narrative, reasoning, scenarioAnalysis, recommendation
- `private extractCandidateText(response)` — línea 326
- `private safeJsonParse(text)` — línea 331
  - Intenta JSON.parse directo, fallback a regex `{...}`
- `private coerceString`, `coerceStringArray`, `coerceScenarioArray` — líneas 348-397
- `private buildPrompt(context, evidence)` — línea 399
  - System prompt: "You are an institutional coverage analyst assistant."
  - JSON structure requerido con narrative, reasoning, scenarioAnalysis, recommendation
  - Incluye zone summary, strategy summary, evidence
- `private summarizeZones(zones)` — línea 437
- `private summarizeStrategies(strategies)` — línea 450
- `private extractEvidence(context)` — línea 464
  - Convierte zones + strategies a array plano de evidence items
- `private buildSuccessResponse(context, evidence, responseId, parsed)` — línea 497
  - Incluye dual fields (snake_case + camelCase): `contextId/context_id`, `responseId/response_id`, `evidenceIds/evidence_ids`, `modelVersion/model_version`, `responseHash/response_hash`
  - Genera SHA-256 hash del contenido
- `private buildUnavailableResponse(context, evidence, responseId, error)` — línea 540
  - `ai_unavailable: true`, narrative = "AI unavailable for {ticker}.", reasoning = [error.message]
- `private buildUnavailableFromResponseId(responseId, message)` — línea 581
  - Para cuando no se encuentra el job (polling ID inválido)
- `private isExpired(job)` — línea 601
  - `attempts >= maxPollingAttempts (15)` OR `Date.now() - createdAt >= jobTtlMs (30s)`
- `private delay(ms)` — línea 605
- `private generateId(prefix)` — línea 609
  - `${prefix}-${crypto.randomUUID()}`
- `private hashContent(content)` — línea 613
  - `crypto.createHash("sha256").update(content).digest("hex")`

**APIs externas:**
- Gemini 2.5 Flash: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}` (POST)

**Configuraciones hardcoded:**
- `modelVersion` = `"gemini/gemini-2.5-flash"` — línea 112
- `endpoint` = `"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"` — línea 113
- `timeoutMs` = 30,000 — línea 116
- `initialDecisionWindowMs` = 5,000 — línea 123
- `pollingIntervalMs` = 2,000 — línea 124
- `maxPollingAttempts` = 15 — línea 125
- `jobTtlMs` = 30,000 — línea 128
- Gemini generationConfig: temperature 0.2, topP 0.9, maxOutputTokens 8192, responseMimeType "application/json" — líneas 272-275
- Dual field naming (camelCase + snake_case) en respuesta — líneas 519-537
- System prompt en inglés (no español) — líneas 406-434

**Dependencias:** `node:crypto`, `../strategies/coverage/coverageTypes.js`, `../institutional/institutionalZonesEngine.js`

---

## 4. Rutas: `src/routes/institutional/`

### 4.1 bootstrap.ts

**Ruta**: `projects/rest-api/inversions_api/src/routes/institutional/bootstrap.ts`
**Líneas**: 475
**FIC**: T340

**Funciones públicas:**
- `getInstitutionalRouteContext(): InstitutionalRouteContext` — línea 110
  - Singleton: crea `InstitutionalDataService` con 4 fuentes + 3 engines
  - Inicia `ensureFinraCache()` en background (no bloquea)
- `buildInstitutionalAnalysisContractFromRequest(req): InstitutionalAnalysisContract` — línea 151
  - Extrae query params: ticker, period, horizon, userId
  - Calcula valores sintéticos deterministas: volume, liquidity, fundsOwnershipPct, inflows, outflows, openPositions
  - Usa seed = suma de charCodes del ticker
- `groupInstitutionalZones(zones): { all, support, resistance }` — línea 191
- `buildInstitutionalTrendSummary(result): InstitutionalTrendSummary` — línea 203
  - direction, score, confidence, rationale, supportStrength, resistanceStrength, flowBias
- `buildInstitutionalMetricsSummary(result): InstitutionalMetricsSummary` — línea 234
  - candlesAnalyzed, zoneCount, supportZoneCount, resistanceZoneCount, averageZoneStrength, maxZoneStrength, averageZoneConfidence, sourceCount, liquidity, volume, openPositions, fundsOwnershipPct, netFlow
- `buildInstitutionalPositionsSummary(result): InstitutionalPositionsSummary` — línea 258
  - positions13F[], flows (con netFlow), sourceReports

**Funciones privadas:**
- `buildDefaultSourceConfigs(): InstitutionalSourceConfig[]` — línea 310
  - **Source 1: SEC EDGAR 13F** — priority 1, cache 600s, rate 10/min
  - **Source 2: FINRA Short Interest** — priority 2, cache 600s, rate 10/min
  - **Source 3: Yahoo Options Flow** — priority 3, cache 120s, rate 20/min
  - **Source 4: Yahoo Institutional** — priority 4, cache 300s, rate 20/min
- `normalizeTicker(value): string` — línea 367 (default "SPY", max 16 chars)
- `normalizePeriod(value): InstitutionalAnalysisPeriod` — línea 373 (default "daily")
- `normalizeHorizon(value): InstitutionalHorizon` — línea 389 (default "medium")
- `normalizeIdentifier(value): string` — línea 401 (max 32 chars, solo alfanumérico + _-)
- `buildTickerSeed(ticker): number` — línea 414 (suma charCodes)
- `getPeriodFactor(period): number` — línea 430
  - intraday: 0.75, daily: 1.0, weekly: 1.18, monthly: 1.38, quarterly: 1.58
- `getHorizonFactor(horizon): number` — línea 454
  - short: 0.9, medium: 1.0, long: 1.12
- `average(values)` — línea 465
- `clamp01(value)` — línea 473

**APIs externas:** Ninguna (orquestador).

**Configuraciones hardcoded:**
- 4 source configs con URLs, paths, priorities, TTLs, rate limits (detallado arriba)
- Default ticker: "SPY" — línea 370
- Default period: "daily" — línea 385
- Default horizon: "medium" — línea 397
- Ticker max length: 16 — línea 370
- Volume sintético: `900,000 + seed * 850 * periodFactor * horizonFactor` — línea 161
- Liquidity thresholds: high ≥ 2M, medium ≥ 1.2M — línea 162
- fundsOwnershipPct: `18 + (seed % 34) + ((horizonFactor - 1) * 14)`, max 96 — línea 163
- inflows: `volume * (0.34 + (seed % 5) * 0.03)` — línea 164
- outflows: `volume * (0.18 + (periodFactor - 1) * 0.05)` — línea 165
- openPositions: `max(3, seed/11 + periodFactor*4 + horizonFactor*3)` — línea 166
- Engine configs: maxZones=8, pivotWindow=2, clusterTolerance=0.0125, liquidityMultiplier=1.15, minCandles=200, fastMA=50, slowMA=200, volumeLookback=20, windowDays=90, lookAheadMonths=6, strikeProximity=0.05

**Dependencias:** `express`, `../../modules/institutional/institutionalContract.js`, `../../modules/institutional/institutionalDataService.js`, `../../modules/institutional/institutionalZonesEngine.js`, `../../modules/institutional/institutionalTrendEngine.js`, `../../modules/institutional/expirationAnalysisEngine.js`, `../../modules/institutional/realSourceParsers.js`, `../../modules/institutional/yahooOptionsParser.js`, `../../modules/institutional/yahooInstitutionalParser.js`

---

### 4.2 institutionalAnalysis.ts

**Ruta**: `projects/rest-api/inversions_api/src/routes/institutional/institutionalAnalysis.ts`
**Líneas**: 88
**FIC**: T111

**Router:** `institutionalAnalysisRouter`

**Middleware:** `authContextMiddleware`

**Endpoint:**
- `GET /analysis` — línea 23
  - Obtiene route context (singleton)
  - Construye analysis contract desde request
  - Resuelve datos institucionales UNA VEZ → comparte entre 3 engines en paralelo
  - Si `overallStatus === "all_failed"` → HTTP 503 con `ALL_SOURCES_UNAVAILABLE`
  - Éxito → HTTP 200 con request, analysis, zones, trends, expiration, metrics, sourceReports

**Respuesta éxito (200):**
```json
{
  "request": { "ticker", "period", "horizon", "analysisId" },
  "analysis": { ... },
  "zones": { "all": [], "support": [], "resistance": [] },
  "trends": { direction, score, confidence, rationale, movingAverages, crossover, currentTrend, ... },
  "expiration": { events, slipperySlope, catalystWindows, timeDecay, quarterlyCorrelation },
  "metrics": { candlesAnalyzed, zoneCount, ... },
  "sourceReports": [],
  "generatedAt": ""
}
```

**Respuesta error (503):**
```json
{ "code": "ALL_SOURCES_UNAVAILABLE", "message": "...", "sourceReports": [], "generatedAt": "" }
```

**Respuesta error (400):**
```json
{ "code": "INSTITUTIONAL_ANALYSIS_FAILED", "message": "..." }
```

**Dependencias:** `express`, `../../middleware/authContext.js`, `./bootstrap.js`

---

### 4.3 regulatoryPositions.ts

**Ruta**: `projects/rest-api/inversions_api/src/routes/institutional/regulatoryPositions.ts`
**Líneas**: 57
**FIC**: T112

**Router:** `regulatoryPositionsRouter`

**Middleware:** `authContextMiddleware`

**Endpoint:**
- `GET /positions` — línea 21
  - Obtiene service del route context
  - Resuelve datos institucionales
  - Si `overallStatus === "all_failed"` → HTTP 503
  - Éxito → HTTP 200 con request, analysis, positions13F, flows, sourceReports, cacheHit, usedSourceIds

**Respuesta éxito (200):**
```json
{
  "request": { "ticker", "period", "horizon", "analysisId" },
  "analysis": { ... },
  "positions13F": [{ sourceId, asOf, count, notional, fundsOwnershipPct, volume, confidence }],
  "flows": { inflows, outflows, asOf, netFlow },
  "sourceReports": [],
  "cacheHit": false,
  "usedSourceIds": []
}
```

**Respuesta error (503):**
```json
{ "code": "ALL_SOURCES_UNAVAILABLE", "message": "...", "sourceReports": [] }
```

**Respuesta error (400):**
```json
{ "code": "INSTITUTIONAL_POSITIONS_FAILED", "message": "..." }
```

**Dependencias:** `express`, `../../middleware/authContext.js`, `./bootstrap.js`

---

## 5. Rutas: `src/routes/coverage/`

### 5.1 analyze.ts

**Ruta**: `projects/rest-api/inversions_api/src/routes/coverage/analyze.ts`
**Líneas**: 129

**Router:** `coverageAnalyzeRouter`

**Middleware:** `authContextMiddleware`

**Roles soportados:** `["analyst", "risk_manager", "trader"]` — línea 10

**Endpoint:**
- `POST /analyze` — línea 82
  - Valida role, ticker, currentPrice, shares
  - Construye 4 contracts (protective_put, married_put, collar_put, covered_straddle)
  - Ejecuta los 3 engines (ProtectivePut, Collar, CoveredStraddle) sobre los contracts
  - Retorna resultados agrupados

**Funciones privadas:**
- `buildContracts(body): CoverageStrategyContract[]` — línea 22
  - Defaults: price=450, expiry=90d, shares=100, capital=100000, riskTolerance=5%
  - Strikes: put=95% price, call=105% price
  - Crea legs según strategy kind
- `estimatePremium(type, strike)` — línea 28
  - Usa `estimateOptionPremium` de coverageTypes con IV=0.25, DTE=90

**Respuesta éxito (200):**
```json
{ "results": [CoverageStrategyResult, ...], "generatedAt": "" }
```

**Respuesta error (403):** `{ "code": "FORBIDDEN_ROLE", "message": "..." }`
**Respuesta error (400):** `{ "code": "INVALID_TICKER" | "INVALID_PRICE" | "INVALID_SHARES" | "COVERAGE_ANALYZE_FAILED", "message": "..." }`

**Dependencias:** `express`, `../../middleware/authContext.js`, `../../modules/strategies/coverage/protectivePutEngine.js`, `../../modules/strategies/coverage/collarEngine.js`, `../../modules/strategies/coverage/coveredStraddleEngine.js`, `../../modules/strategies/coverage/coverageStrategyContract.js`, `../../modules/strategies/coverage/coverageTypes.js`

---

### 5.2 simulate.ts

**Ruta**: `projects/rest-api/inversions_api/src/routes/coverage/simulate.ts`
**Líneas**: 63

**Router:** `coverageSimulateRouter`

**Middleware:** `authContextMiddleware`

**Roles soportados:** `["analyst", "risk_manager", "trader"]` — línea 6

**Endpoint:**
- `POST /simulate` — línea 21
  - Valida role, ticker, currentPrice, shares
  - Crea un contract `protective_put` con los parámetros del body
  - Ejecuta `CoverageSimulationEngine.analyze()`
  - Retorna resultado de simulación Monte Carlo

**Respuesta éxito (200):** `CoverageSimulationResult`

**Respuesta error (403):** `{ "code": "FORBIDDEN_ROLE", "message": "..." }`
**Respuesta error (400):** `{ "code": "INVALID_TICKER" | "INVALID_PRICE" | "INVALID_SHARES" | "COVERAGE_SIMULATE_FAILED", "message": "..." }`

**Dependencias:** `express`, `../../middleware/authContext.js`, `../../modules/strategies/coverage/coverageSimulationEngine.js`, `../../modules/strategies/coverage/coverageStrategyContract.js`

---

### 5.3 compare.ts

**Ruta**: `projects/rest-api/inversions_api/src/routes/coverage/compare.ts`
**Líneas**: 63

**Router:** `coverageCompareRouter`

**Middleware:** `authContextMiddleware`

**Roles soportados:** `["analyst", "risk_manager", "trader"]` — línea 6

**Endpoint:**
- `POST /compare` — línea 21
  - Valida role, ticker, currentPrice, shares
  - Crea un contract base `protective_put`
  - Ejecuta `CoverageComparator.compare()` que corre las 4 estrategias
  - Retorna matriz de comparación

**Respuesta éxito (200):** `CoverageComparisonResult`

**Respuesta error (403):** `{ "code": "FORBIDDEN_ROLE", "message": "..." }`
**Respuesta error (400):** `{ "code": "INVALID_TICKER" | "INVALID_PRICE" | "INVALID_SHARES" | "COVERAGE_COMPARE_FAILED", "message": "..." }`

**Dependencias:** `express`, `../../middleware/authContext.js`, `../../modules/strategies/coverage/coverageComparator.js`, `../../modules/strategies/coverage/coverageStrategyContract.js`

---

## 6. Rutas: `src/routes/ai/`

### 6.1 institutionalCopilot.ts

**Ruta**: `projects/rest-api/inversions_api/src/routes/ai/institutionalCopilot.ts`
**Líneas**: 137
**FIC**: T121b

**Router:** `institutionalCopilotRouter`

**Middleware:** `authContextMiddleware`

**Endpoints:**

- `POST /institutional-chat` — línea 32
  - Valida: ticker, currentPrice, zones, question (required)
  - userRole opcional: si no se provee, infiere de `req.authContext?.role`
  - Crea `InstitutionalCopilotContext` con contextId generado
  - Llama `copilotService.submit(context)`
  - Si response tiene `status === "pending"` → HTTP 202
  - Si no → HTTP 200 con respuesta completa
  - Error → HTTP 500 con `ai_unavailable: true`

- `GET /institutional-chat/poll/:responseId` — línea 95
  - Valida responseId
  - Llama `copilotService.poll(responseId)`
  - Si pending → HTTP 202
  - Si completed → HTTP 200
  - Error → HTTP 500 con `ai_unavailable: true`

**Función privada:**
- `inferAIRole(authRole): AIAnalystRole` — línea 130
  - `"admin"` o `"trader"` → `"analyst"`
  - Cualquier otro (incluyendo `"viewer"`) → `"risk_manager"`

**Respuesta pending (202):**
```json
{ "status": "pending", "contextId", "responseId", "pollingUrl", "retryAfterSeconds", "ai_unavailable": false, "timestamp" }
```

**Respuesta completed (200):**
```json
{ "contextId", "responseId", "ticker", "narrative", "reasoning": [], "scenarioAnalysis": [], "recommendation", "evidenceIds": [], "modelVersion", "responseHash", "ai_unavailable": false, "timestamp" }
```

**Respuesta error (400):**
```json
{ "code": "INSTITUTIONAL_COPILOT_INVALID_INPUT", "message": "Missing required fields: ..." }
```

**Respuesta error (500):**
```json
{ "code": "INSTITUTIONAL_COPILOT_ERROR" | "INSTITUTIONAL_COPILOT_POLL_ERROR", "message": "...", "ai_unavailable": true }
```

**Dependencias:** `express`, `../../middleware/authContext.js`, `../../modules/ai/institutionalCopilotChat.js`

---

## Resumen General

| Directorio | Archivos | Líneas Estimadas | APIs Externas |
|---|---|---|---|
| `modules/institutional/` | 9 | ~4,500 | SEC EDGAR, FINRA, Yahoo Finance v1/v7/v10 |
| `modules/strategies/coverage/` | 10 | ~2,200 | Ninguna (cálculos internos) |
| `modules/ai/` | 1 | ~618 | Gemini 2.5 Flash |
| `routes/institutional/` | 3 | ~620 | Ninguna (orquestación) |
| `routes/coverage/` | 3 | ~255 | Ninguna (orquestación) |
| `routes/ai/` | 1 | ~137 | Ninguna (proxy a módulo AI) |
| **Total** | **27** | **~7,500+** | **4 fuentes externas** |
