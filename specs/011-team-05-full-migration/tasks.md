---
description: "Master task list for 011-team-05-full-migration — replica completa del trabajo de TEAM-05"
---

# Tasks: 011-team-05-full-migration

**Input**: spec.md, plan.md, data-model.md — `specs/011-team-05-full-migration/`  
**Prerequisito**: Backend arriba en `localhost:3000` antes de ejecutar tasks de frontend.  
**Nota**: Todas las tasks marcadas `[ ]` — pendientes en repositorio principal.  
**Marcador `[P]`**: tarea priorizada, implementar en el próximo ciclo si hay que dividir el trabajo.

---

## BACKEND — Phase 1: Contracts & Types

- [ ] T1000 [P] Crear `src/modules/institutional/institutionalContract.ts`
  - Exportar: `InstitutionalAnalysisPeriod`, `InstitutionalHorizon`, `InstitutionalLiquidity`, `InstitutionalFlowSnapshot`, `InstitutionalOpenPositionsSnapshot`, `InstitutionalAnalysisContract`
  - Funciones: `isNonEmptyString`, `isFiniteNumber`, `isInstitutionalFlowSnapshot`, `isInstitutionalOpenPositionsSnapshot`, `isInstitutionalAnalysisContract`, `createInstitutionalAnalysisContract`
  - Validaciones hardcoded: `supportedPeriods=["intraday","daily","weekly","monthly","quarterly"]`, `supportedHorizons=["short","medium","long"]`, `supportedLiquidity=["low","medium","high"]`, `fundsOwnershipPct` en [0,100]
  - FIC: comentarios bilingüe EN/ES en todas las funciones públicas

- [ ] T1001 [P] Crear `src/modules/strategies/coverage/coverageStrategyContract.ts`
  - Exportar: `CoverageStrategyKind`, `CoverageStrategyLeg`, `CoverageStrategyContract`, `CoverageStrategyResult`, `CoveragePayoffPoint`, `CoverageRiskMetrics`, `CoverageStrategyAlert`, `CoverageStrategyAlertSeverity`
  - FIC: comentarios bilingüe EN/ES

- [ ] T1002 [P] Crear `src/modules/strategies/coverage/coverageTypes.ts`
  - Función: `estimateOptionPremium(type, strike, IV=0.25, DTE=90)` — Black-Scholes simplificado
  - **`normalCdf`**: usar `φ(x) * poly` (NO `(1-φ(x)) * poly`)
  - **`RiskMetrics`**: incluir `stopLossLowPrice?: number` y `stopLossHighPrice?: number` como campos opcionales
  - FIC: comentarios bilingüe EN/ES

---

## BACKEND — Phase 2: Institutional Data Service

- [ ] T1003 [P] Crear `src/modules/institutional/institutionalDataService.ts`
  - Clase `InstitutionalDataService`
  - Constructor: `sources[]`, `cacheTtlMs=300000`, `cacheMaxEntries=250`, `fetchImpl=globalThis.fetch`
  - `resolve()`: `Promise.allSettled`, merge de observaciones, `overallStatus: ok/partial/all_failed`
  - `resolveSingleSource()`: cache → rate limit → fetch + parse — nunca rechaza
  - Constantes: `DEFAULT_CACHE_TTL_MS=300000`, `DEFAULT_CACHE_MAX_ENTRIES=250`, `DEFAULT_SOURCE_TIMEOUT_MS=12000`
  - Cache key: `sourceId:ticker`
  - Rate limit: ventana 60,000ms por source
  - Merge strategy: `fundsOwnershipPct`→PROMEDIO, `volume`→MÁXIMO, `flows`→SUMA, `openPositions`→MÁXIMO, `categorical`→FIRST DEFINED por confidence desc, `liquidity`→HIGHEST
  - Confidence scoring: ≥4 señales→0.95, 3→0.85, 2→0.70, else→0.55, max 0.95 (nunca 1.0)
  - `normalizePercentage`: ≤1→×100, >1→directo
  - 6 parsers embebidos: SEC13F, FINRA, UnusualWhales, Finviz, YahooOptions, YahooInstitutional
  - LRU eviction cuando `cache.size > cacheMaxEntries`
  - FIC: comentarios bilingüe EN/ES

---

## BACKEND — Phase 3: Real Source Parsers

- [ ] T1004 [P] Crear `src/modules/institutional/realSourceParsers.ts`

  **SEC EDGAR 13F** (`parseSecEdgar13fReal`):
  - `EDGAR_USER_AGENT = process.env.EDGAR_USER_AGENT ?? "TurboPapus/1.0 (contact@turbopapus.com)"`
  - `SEC_REQUEST_TIMEOUT_MS = 30000`, timeout global operación: 60s
  - `JSON_HEADERS`: `User-Agent` + `Accept: application/json`
  - `XML_HEADERS`: `User-Agent` + `Accept: application/xml,text/xml,text/plain`
  - `MAX_FILINGS = 1`
  - EFTS URL: `https://efts.sec.gov/LATEST/search-index?q={TICKER}&dateRange=custom&startdt={START}&enddt={END}&forms=13F-HR`
  - Date ranges: weekly→6m atrás, monthly/quarterly→desde 2024-01-01, daily/intraday→NOT_APPLICABLE
  - `searchEftsCache` (Map, in-flight dedup con `inflightEfts`)
  - Confidence: ≥5 holders→0.88, ≥2→0.80, else→0.65
  - Flows estimados: `inflows=totalValue*0.5/1000`, `outflows=totalValue*0.25/1000`
  - **CUSIP map de 60 tickers hardcoded**: AAPL, MSFT, GOOGL, GOOG, AMZN, META, TSLA, NVDA, JPM, V, SPY, QQQ, INTC, CSCO, IBM, QCOM, AMD, ADBE, ORCL, CRM, NOW, INTU, WMT, HD, COST, PG, KO, PEP, MCD, DIS, SBUX, NFLX, BKNG, LOW, TGT, UNH, JNJ, ABBV, MRK, LLY, TMO, ABT, PFE, MDT, XOM, CVX, BA, GE, CAT, UPS, UNP, HON, LMT, C, BRK.B, BRK.A, VZ, T, NEE, AVGO, ACN, LIN, AMT, TROW

  **FINRA Short Interest** (`parseFinraShortInterestReal`):
  - `FINRA_API = "https://api.finra.org/data/group/otcmarket/name/consolidatedShortInterest"` (POST)
  - `FINRA_PAGE_SIZE = 5000`, `FINRA_MAX_PAGES = 6`
  - `FINRA_CACHE_TTL_MS = 86400000`, `FINRA_CACHE_FILE = /tmp/inversions-api-finra-cache.json`
  - `ensureFinraCache`: singleton + in-flight dedup + persistencia en disco
  - CSV columns: `symbol,currentShort,prevShort,avgDailyVol,daysToCover,changePct,settleDate,dateStr`
  - Fallback sintético si ticker no encontrado: confidence=0.3
  - Confidence real: 0.88 si `daysToCover>0&&avgDailyVol>0`, else 0.70
  - Multiplicador notional: 2.3× short interest
  - FIC: comentarios bilingüe EN/ES

- [ ] T1005 [P] Crear `src/modules/institutional/yahooCrumbSession.ts`
  - `YAHOO_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"`
  - `YAHOO_CRUMB_URL = "https://query2.finance.yahoo.com/v1/test/getcrumb"`
  - `YAHOO_COOKIE_URL = "https://fc.yahoo.com"`
  - `CRUMB_TTL_MS = 900000` (15 min)
  - Flujo: GET fc.yahoo.com (redirect:manual) → extrae cookie con regex `/[A-Za-z0-9]+=[A-Za-z0-9]+/` → GET getcrumb
  - Singleton + shared-promise dedup (`sessionCache` + `sessionPromise`)
  - FIC: comentarios bilingüe EN/ES

- [ ] T1006 [P] Crear `src/modules/institutional/yahooOptionsParser.ts`
  - `YAHOO_OPTIONS_URL = "https://query2.finance.yahoo.com/v7/finance/options"`
  - `REQUEST_TIMEOUT_MS = 10000`
  - URL con crumb: `{URL}/{TICKER}?crumb={CRUMB}`
  - `computeOptionsFlowSignal`: callVolume, putVolume, callOi, putOi, `unusualStrikeCount` (vol>2×OI), `directionalBias=(callVol-putVol)/totalVol`
  - Confidence: `0.4 + (expirationCount/6)*0.2 + min(unusualCount/10,1)*0.2 + (vol>0?0.15:0) + (oi>0?0.15:0)`, capped 0.95
  - Fallback seed determinista (suma charCodes del ticker)
  - Fallback confidence: 0.3
  - FIC: comentarios bilingüe EN/ES

- [ ] T1007 [P] Crear `src/modules/institutional/yahooInstitutionalParser.ts`
  - `YAHOO_QUOTE_URL = "https://query2.finance.yahoo.com/v10/finance/quoteSummary"`
  - `REQUEST_TIMEOUT_MS = 10000`
  - Modules: `institutionOwnership,majorHoldersBreakdown`
  - Confidence: `0.35 + (holderCount/50)*0.25 + (ownership?0.2:0) + (holders>0?0.15:0) + (change!=0?0.05:0)`, capped 0.95
  - Fallback: `holders=500+(seed%200)`, `ownership=25+(seed%30)`
  - Fallback confidence: 0.3
  - FIC: comentarios bilingüe EN/ES

---

## BACKEND — Phase 4: Institutional Engines

- [ ] T1008 [P] Crear `src/modules/institutional/institutionalZonesEngine.ts`
  - Clase `InstitutionalZonesEngine`
  - Constructor: `maxZones=8`, `pivotWindow=2`, `clusterTolerancePct=0.0125`, `liquidityVolumeMultiplier=1.15`
  - `analyze(request, preResolvedResult?)`: acepta precomputed para evitar resolve duplicado
  - `buildFallbackCandles`: 60 velas diarias sinusoidales (drift ±1.2%, noise coseno ±0.7%) — **DETERMINÍSTICO** (sin Math.random)
  - `buildCandidates`: pivot lows/highs ventana=2, filtro `volume≥avgVol*1.15`
  - `clusterCandidates`: agrupación por `ATR*clusterTolerancePct`
  - `institutionalScore = 0.2 + confidence*0.35 + ownership*0.2 + posFactor*0.15 + flowFactor*0.1`
  - `zoneConfidence = 0.35 + score*0.35 + (highLiq?0.15:0.05) + bias*0.1 + body*0.05`
  - Strength = `0.25 + volumeScore*0.35 + sourceScore*0.2 + touchesScore*0.15 + liquidityScore*0.05 + confidence*0.15`
  - `liquidityWeight`: high=1, medium=0.7, low=0.4
  - FIC: comentarios bilingüe EN/ES

- [ ] T1009 [P] Crear `src/modules/institutional/institutionalTrendEngine.ts`
  - Clase `InstitutionalTrendEngine`
  - Constructor: `DEFAULT_MIN_CANDLES=200`, `FAST_MA=50`, `SLOW_MA=200`, `VOLUME_LOOKBACK=20`
  - `analyze(request, preResolvedResult?)`: SMA-50, SMA-200, crossover detection, volume correlation Pearson, continuity probability
  - `detectCrossover`: tolerance=0.002 (0.2%), lookback=30 días
  - Trend strength weights: MA sep 30%, slope 15%, crossover 20%, volume 20%, flow 15%
  - Continuity weights: MA 35%, volume 25%, ownership 20%, flow 20%
  - `institutionalScore = 0.2 + confidence*0.35 + ownership*0.2 + posFactor*0.15 + flowFactor*0.1`
  - **`buildFallbackCandles`**: usar PRNG seeded con `seededRandom(tickerSeed)` — LCG `s = Math.imul(s,1664525)+1013904223|0`
  - **`seededRandom(seed)`**: método privado, genera secuencia determinista (mismo ticker → mismas velas → misma señal)
  - FIC: comentarios bilingüe EN/ES

- [ ] T1010 [P] Crear `src/modules/institutional/expirationAnalysisEngine.ts`
  - Clase `ExpirationAnalysisEngine`
  - Constructor: `DEFAULT_WINDOW_DAYS=90`, `LOOK_AHEAD_MONTHS=6`, `STRIKE_PROXIMITY_PCT=0.05`
  - `OPEX_WEEKDAY=5`, `QUARTER_MONTHS=[3,6,9,12]`, `TRIPLE_WITCHING_MONTHS=[3,6,9,12]`, `QUARTERLY_REPORT_MONTHS=[2,5,8,11]`
  - OpEx: 3er viernes de cada mes; Quarter futures: último viernes del trimestre
  - **Triple Witching**: verificar si ya existe evento `quarterly_opex` para esa fecha antes de push — si existe, actualizar `label` y `significance=0.95`; no duplicar
  - FOMC months: [1,3,5,6,7,9,11,12] → **2do miércoles** (`findNthWeekday(y,m,2,3)`)
  - **CPI**: **2do martes** (`findNthWeekday(y,m,2,2)`) — NO 2do miércoles
  - Earnings: [1,4,7,10] → 2do viernes
  - Time decay regimes: ≤7d→`at_expiration`(theta 0.8-2.0, gamma 1.2+), 8-30d→`near`(theta 0.3-0.8, gamma 0.3-1.0), >30d→`far`(theta 0.05-0.2, gamma 0.05)
  - Slippery slope: `flowRatio>0.25&&ownership>30`→`call_skew`, `flowRatio<-0.25&&ownership<20`→`put_skew`, else→`symmetric`
  - **Expiry bias**: `month===9`→`"bearish"`, `month===10`→`"neutral"`, `month===11||12`→`"bullish"`, `4-6`→`"bullish"`, `7-8`→`"neutral"`, default→`"neutral"`
  - Quarterly report window: -7/+14 días alrededor del 15 de feb/may/ago/nov, impacto `overlapRatio*3.5%`
  - Acepta `preResolvedResult` opcional
  - FIC: comentarios bilingüe EN/ES

---

## BACKEND — Phase 5: Coverage Engines

- [ ] T1011 [P] Crear `src/modules/strategies/coverage/protectivePutEngine.ts`
  - `breakEvenPrice = currentPrice + netPremiumPerShare` (válido OTM/ATM/ITM)
  - `stopLossBuffer = clamp(riskTolerancePct*0.5, 0.01, 0.10)` — fallback 0.03 cuando `riskTolerancePct===0`
  - `stopLossPrice = putStrike * (1 - stopLossBuffer)`
  - `maxProfit`: Infinity (protección pura sin cap)
  - `maxLoss = max(0, currentPrice - putStrike + netPremiumPerShare) * shares`
  - Alerta `STOP_LOSS_TRIGGERED`: `currentPrice <= stopLossPrice`
  - Alerta `STOP_LOSS_NEAR_STRIKE`: precio dentro ±3% del strike
  - Alerta `MARRIED_PUT_BASIS_CHECK`: para `kind=married_put`
  - FIC: comentarios bilingüe EN/ES

- [ ] T1012 [P] Crear `src/modules/strategies/coverage/collarEngine.ts`
  - `netPremiumPerShare = putPremium - callPremium` (positivo=débito, negativo=crédito neto)
  - `maxProfit = max(0, callStrike - currentPrice - netPremiumPerShare) * shares`
  - `maxLoss = max(0, currentPrice - putStrike + netPremiumPerShare) * shares`
  - `protectionCeilingPrice = callStrike - netPremiumPerShare`
  - `protectionFloorPrice = putStrike - netPremiumPerShare`
  - `exerciseRiskScore = clamp01(downside*0.5 + upside*0.5)` — pesos 0.5+0.5 (NO 0.6+0.6)
  - `stopLossLow = putStrike * (1 - stopLossBufferPct)` — default buffer 4%
  - `stopLossHigh = callStrike * (1 + stopLossBufferPct)`
  - **Exponer**: `stopLossPrice = stopLossLow` (retrocompatibilidad) + `stopLossLowPrice = stopLossLow` + `stopLossHighPrice = stopLossHigh`
  - Alerta `COLLAR_CALL_BELOW_MARKET`: si `callStrike <= currentPrice`
  - Alerta `COLLAR_LOWER_BAND_BROKEN`: si `currentPrice <= stopLossLow`
  - FIC: comentarios bilingüe EN/ES

- [ ] T1013 [P] Crear `src/modules/strategies/coverage/coveredStraddleEngine.ts`
  - `kind = "covered_straddle"` (mantener por compatibilidad de contratos)
  - Estructura real: acciones long + put short + call short → **covered strangle** (strikes distintos)
  - Riesgo asimétrico: ilimitado SOLO a la baja (put short); alza cubierta por acciones long
  - `riskProfile = "unlimited"` (correcto — put short expone a pérdidas ilimitadas a la baja)
  - Alerta `HIGH_VOLATILITY_PROFILE` con texto explicativo "covered strangle"
  - FIC: comentarios bilingüe EN/ES

- [ ] T1014 [P] Crear `src/modules/strategies/coverage/coverageSimulationEngine.ts`
  - Monte Carlo: 256 iteraciones por defecto (demo/visualización)
  - `monteCarloIterations=0` → skip MC, retorna payoff instantáneo sin loop
  - Escenarios determinísticos (subida/bajada %)
  - FIC: comentarios bilingüe EN/ES

- [ ] T1015 [P] Crear `src/modules/strategies/coverage/coverageRiskService.ts`
  - Stop-loss configurable, alertas de margen y niveles críticos
  - Notificaciones via `Promise.allSettled` (paralelas, no secuenciales)
  - FIC: comentarios bilingüe EN/ES

- [ ] T1016 [P] Crear `src/modules/strategies/coverage/coverageReportService.ts`
  - `generateReport(strategyReq, recipients?, precomputed?)`
  - Si `precomputed` → skip `simulationEngine.analyze()` y `riskService.evaluate()`
  - File I/O (JSON + Markdown) con `Promise.all` en paralelo
  - FIC: comentarios bilingüe EN/ES

- [ ] T1017 [P] Crear `src/modules/strategies/coverage/coverageComparator.ts`
  - `compare()`: ejecuta 4 estrategias, genera matriz de comparación y ranking
  - Pasa `precomputed` a `generateReport` — evita 4 re-simulaciones duplicadas
  - Score: 50% PnL esperado + distribución riesgo/costo/contexto
  - FIC: comentarios bilingüe EN/ES

- [ ] T1034 [P] Crear `src/modules/strategies/coverage/coverageStrategyAdapter.ts`
  - Función `adaptContractToEngine(contract)` — mapea contrato a parámetros del engine correspondiente
  - Función `adaptResultToResponse(result)` — mapea resultado del engine a respuesta API
  - Score de confianza: 40% protectionScore + 30% costEfficiencyScore + 30% riskScore
  - Niveles: score≥0.70→ALTA, ≥0.40→MEDIA, <0.40→BAJA
  - FIC: comentarios bilingüe EN/ES

---

## BACKEND — Phase 6: AI Copilot

- [ ] T1018 [P] Crear `src/modules/ai/institutionalCopilotChat.ts`
  - Modelo: Gemini 2.5 Flash (`GEMINI_API_KEY` de env)
  - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={KEY}`
  - `timeoutMs=30000`, `initialDecisionWindowMs=5000`, `pollingIntervalMs=2000`, `maxPollingAttempts=15`, `jobTtlMs=30000`
  - `submit(context)`: Promise.race entre Gemini y ventana de 5s; si ≤5s→HTTP 200 directo; si >5s→202 Accepted con pollingUrl
  - `poll(responseId)`: consulta Map de jobs en memoria
  - `ai_unavailable=true` cuando Gemini no responde
  - Trazabilidad: `context_id`, `response_id`, `evidence_ids[]`, `model_version`, `response_hash` (SHA256), `timestamp`
  - Campos duales snake_case + camelCase en respuesta
  - `inferAIRole`: admin/trader→`"analyst"`, cualquier otro→`"risk_manager"`
  - Gemini generationConfig: temperature=0.2, topP=0.9, maxOutputTokens=8192, responseMimeType="application/json"
  - Solo lectura, nunca ejecuta operaciones
  - FIC: comentarios bilingüe EN/ES

---

## BACKEND — Phase 7: Routes & Bootstrap

- [ ] T1019 [P] Crear `src/routes/institutional/bootstrap.ts`
  - `getInstitutionalRouteContext()`: singleton que crea `InstitutionalDataService` con 4 fuentes + 3 engines
  - 4 fuentes: `sec_edgar_13f` (priority=1, cache=600s, rate=10/min), `finra_short_interest` (p=2, cache=600s, rate=10/min), `yahoo_options_flow` (p=3, cache=120s, rate=20/min), `yahoo_institutional` (p=4, cache=300s, rate=20/min)
  - `ensureFinraCache().catch(()=>{})` en background (no bloquea startup)
  - `buildInstitutionalAnalysisContractFromRequest(req)`: extrae ticker/period/horizon, calcula valores sintéticos deterministas (seed=suma charCodes ticker)
  - Valores sintéticos: `volume=900000+seed*850*periodFactor*horizonFactor`, `liquidity`: high≥2M, medium≥1.2M, `fundsOwnershipPct=18+(seed%34)+...`, `inflows=volume*(0.34+...)`, `outflows=volume*(0.18+...)`
  - Helpers: `buildInstitutionalTrendSummary`, `buildInstitutionalMetricsSummary`, `buildInstitutionalPositionsSummary`
  - FIC: comentarios bilingüe EN/ES

- [ ] T1020 [P] Crear `src/routes/institutional/institutionalAnalysis.ts`
  - `GET /analysis` — `authContextMiddleware`
  - `resolve()` UNA VEZ → `preResolvedResult` compartido con Zones + Trend + Expiration en paralelo (`Promise.allSettled`)
  - `overallStatus==="all_failed"` → HTTP 503 `{ code:"ALL_SOURCES_UNAVAILABLE" }`
  - HTTP 200 con: request, analysis, zones (all/support/resistance), trends, expiration, metrics, sourceReports
  - FIC: comentarios bilingüe EN/ES

- [ ] T1021 [P] Crear `src/routes/institutional/regulatoryPositions.ts`
  - `GET /positions` — `authContextMiddleware`
  - Resuelve datos institucionales, misma degradación parcial que institutionalAnalysis
  - HTTP 200 con: positions13F[], flows (inflows/outflows/netFlow), sourceReports, cacheHit, usedSourceIds
  - FIC: comentarios bilingüe EN/ES

- [ ] T1022 [P] Crear `src/routes/coverage/analyze.ts`
  - `POST /analyze` — roles: analyst, risk_manager, trader
  - `buildContracts(body)`: 4 estrategias (protective_put, married_put, collar_put, covered_straddle)
  - Defaults: price=450, expiry=90d, shares=100, capital=100000, risk=5%, put=95%×price, call=105%×price
  - `estimatePremium`: usa `estimateOptionPremium` con IV=0.25, DTE=90
  - Retorna `{ results: CoverageStrategyResult[], generatedAt }`
  - Errores: FORBIDDEN_ROLE(403), INVALID_TICKER/PRICE/SHARES(400)
  - FIC: comentarios bilingüe EN/ES

- [ ] T1023 [P] Crear `src/routes/coverage/simulate.ts`
  - `POST /simulate` — roles: analyst, risk_manager, trader
  - Crea contract `protective_put` con params del body → ejecuta `CoverageSimulationEngine`
  - Retorna `CoverageSimulationResult`
  - FIC: comentarios bilingüe EN/ES

- [ ] T1024 [P] Crear `src/routes/coverage/compare.ts`
  - `POST /compare` — roles: analyst, risk_manager, trader
  - `CoverageComparator.compare()` con 4 estrategias
  - Retorna `CoverageComparisonResult`
  - FIC: comentarios bilingüe EN/ES

- [ ] T1025 [P] Crear `src/routes/ai/institutionalCopilot.ts`
  - `POST /institutional-chat` — `authContextMiddleware`
  - Valida: ticker, currentPrice, zones, question (required)
  - `userRole` del body o inferido de `authContext.role`
  - pending → HTTP 202 `{ status:"pending", contextId, responseId, pollingUrl, retryAfterSeconds }`
  - completed → HTTP 200 con narrative, reasoning, scenarioAnalysis, recommendation, evidenceIds, modelVersion, responseHash
  - error → HTTP 500 `{ code:"INSTITUTIONAL_COPILOT_ERROR", ai_unavailable:true }`
  - `GET /institutional-chat/poll/:responseId` — pending→202, completed→200, error→500
  - `inferAIRole`: admin/trader→analyst, otro→risk_manager
  - FIC: comentarios bilingüe EN/ES

- [ ] T1026 Modificar `src/index.ts` — registrar todas las rutas nuevas de TEAM-05:
  ```typescript
  app.use("/api/institutional", institutionalAnalysisRouter);
  app.use("/api/institutional", regulatoryPositionsRouter);
  app.use("/api/ai", institutionalCopilotRouter);
  app.use("/api/coverage", coverageAnalyzeRouter);
  app.use("/api/coverage", coverageCompareRouter);
  app.use("/api/coverage", coverageSimulateRouter);
  app.use("/api/dashboard", confluenceViewPresetsRouter); // ya montado, incluir confluenceViewPresets fix
  ```

- [ ] T1035 [P] Modificar `src/routes/dashboard/confluenceViewPresets.ts`
  - En el handler `GET /confluence-columns`: usar `createAuthenticatedClient(req.authContext.token)` en lugar de `supabaseClient`
  - Eliminar `supabaseClient` del import si ya no se usa en el archivo
  - Asegurarse de que el handler esté registrado ANTES del `export default router` (o mover la declaración)
  - FIC: comentarios bilingüe EN/ES

---

## BACKEND — Phase 8: Variables de Entorno

- [ ] T1027 Configurar variables de entorno en `.env.example` del proyecto principal:
  ```env
  EDGAR_USER_AGENT=TurboPapus/1.0 (contact@turbopapus.com)
  GEMINI_API_KEY=<obtener del proyecto TEAM-05>
  ```

---

## BACKEND — Phase 9: Bugfixes de Auditoría (2026-05-28)

> Estos fixes deben aplicarse **sobre** los archivos creados en Phases 1-7, o integrarse directamente al crearlos.

- [ ] T1100 [P] Fix `normalCdf` en `coverageTypes.ts` — multiplicar por `φ(x)` no por `(1-φ(x))`
  - Verificación: `normalCdf(0) ≈ 0.500 (±0.001)`, `normalCdf(-10) = 0`, `normalCdf(10) = 1`
  - **Nota**: integrar directamente en T1002 al crear `coverageTypes.ts`

- [ ] T1101 [P] Fix Collar stop-loss en `collarEngine.ts` + `coverageTypes.ts`
  - `RiskMetrics`: agregar `stopLossLowPrice?: number`, `stopLossHighPrice?: number`
  - `collarEngine`: exponer `stopLossPrice=stopLossLow` (retrocompatibilidad) + ambos campos nuevos
  - **Nota**: integrar directamente en T1002 y T1012 al crearlos

- [ ] T1102 [P] Fix fallback candles `institutionalTrendEngine.ts` — PRNG determinístico
  - `seededRandom(seed)`: LCG `s = Math.imul(s,1664525)+1013904223|0; return (s>>>0)/0xffffffff`
  - Seed: `analysis.ticker.split("").reduce((acc,c)=>acc+c.charCodeAt(0), 0)`
  - **Nota**: integrar directamente en T1009 al crear `institutionalTrendEngine.ts`

- [ ] T1103 [P] Fix CPI date en `expirationAnalysisEngine.ts` — 2do martes (no miércoles)
  - `const cpiDate = this.findNthWeekday(targetYear, targetMonth, 2, 2)` // 2=martes
  - **Nota**: integrar directamente en T1010 al crear `expirationAnalysisEngine.ts`

- [ ] T1104 [P] Fix Triple Witching en `expirationAnalysisEngine.ts` — deduplicar `quarterly_opex`
  - Antes de push, buscar `events.find(e => e.date===tripleWitch && e.type==="quarterly_opex")`
  - Si existe: `existing.label=...; existing.significance=0.95;` (no push)
  - **Nota**: integrar directamente en T1010

- [ ] T1105 [P] Fix sesgo estacional en `expirationAnalysisEngine.ts`
  - `month===9`→`"bearish"`, `month===10`→`"neutral"`, `month===11||12`→`"bullish"`, `4-6`→`"bullish"`, `7-8`→`"neutral"`, default→`"neutral"`
  - **Nota**: integrar directamente en T1010

- [ ] T1106 Fix test `protectivePutEngine.test.ts` — cambiar `riskTolerancePct: 0.3` → `riskTolerancePct: 0`
  - Con 0.3: buffer=10%, stopLossPrice=85.5, currentPrice=90 → alerta NO dispara
  - Con 0: buffer=3%, stopLossPrice=92.15, currentPrice=90 → alerta SÍ dispara ✅
  - Verificar que `alerts.some(a => a.code === "STOP_LOSS_TRIGGERED")` es true

- [ ] T1107 Fix test `confluenceDynamicColumns.test.ts` — mock de `supabaseClient`
  - La ruta `/confluence-columns` usa `createAuthenticatedClient`; el mock del test ya lo intercepta
  - Si la ruta fue creada correctamente en T1035, este test pasa automáticamente
  - Verificar: `GET /api/dashboard/confluence-columns` → HTTP 200, body `{ columns: [...] }`

---

## BACKEND — Phase 10: Cache Fixes SEC EDGAR

- [ ] T1031 [P] Incluir `period` en la key de `searchEftsCache` e `inflightEfts` (`realSourceParsers.ts`)
  - Cache key actual: solo `ticker` → cambiar a `${ticker}:${period}`
  - Evita que requests con distintos períodos compartan el mismo resultado cacheado

- [ ] T1032 [P] Agregar TTL de 24h a `searchEftsCache` (`realSourceParsers.ts`)
  - `SEARCH_EFTS_CACHE_TTL_MS = 86_400_000`
  - Cambiar `Map<string, EftsHit[]>` → `Map<string, { hits: EftsHit[]; timestamp: number }>`
  - Verificar expiración en `searchEfts()` antes de retornar cache

- [ ] T1033 [P] Incluir `period` en `InstitutionalDataService.getCacheKey()` (`institutionalDataService.ts`)
  - Key actual: `sourceId:ticker` → cambiar a `${sourceId}:${ticker}:${period}`
  - Evita que requests con diferentes períodos compartan la misma observación cacheada

---

## BACKEND — Phase 11: Tests Backend

- [ ] T1028 [P] Crear `tests/unit/strategies/coverage/collarEngine.test.ts`
  - Caso crédito neto: `callPremium=9.26, putPremium=0.74, currentPrice=450.50, callStrike=460, shares=100`
  - `netPremiumPerShare ≈ -8.52`, `maxProfit ≈ 1002`, `protectionCeilingPrice ≈ 468.52`
  - Caso débito neto: verificar `maxProfit`, `maxLoss`, `stopLossLowPrice`, `stopLossHighPrice`

- [ ] T1029 Crear `tests/unit/strategies/coverage/protectivePutEngine.test.ts`
  - Break-even OTM/ATM/ITM
  - `stopLossPrice` dinámico con `riskTolerancePct=0` (trigger activo) y `riskTolerancePct=0.3` (no trigger)

- [ ] T1030 Crear `tests/integration/coverage.test.ts`
  - `POST /api/coverage/analyze` → verifica 4 estrategias con datos válidos
  - `GET /api/institutional/analysis?ticker=AAPL` → verifica degradación parcial

---

## FRONTEND — Phase 12: Setup e Infraestructura

- [ ] T300 Instalar `react-router-dom` en `projects/pwa/inversions_app/package.json`

- [ ] T301 Actualizar `src/main.tsx` — envolver con `BrowserRouter`, añadir rutas:
  - `/` → MainDashboard (existente)
  - `/institutional/analysis` → InstitutionalAnalysisPage
  - `/institutional/positions` → RegulatoryPositionsPage
  - `/coverage/strategies` → CoverageStrategiesPage
  - `/ai/chat` → AIChatPage

- [ ] T302 [P] Crear `src/layouts/MainLayout.tsx`
  - Sidebar con navegación: Dashboard, Análisis Institucional, Posiciones, Cobertura, Chat IA
  - Top Navbar con logo e indicador de usuario
  - `<Outlet />` de React Router para renderizar páginas hijas

- [ ] T303 [P] Crear `src/store/chat.ts`
  - `ChatState`: historial de mensajes, estado de polling, `ai_unavailable` flag
  - `useSyncExternalStore` (mismo patrón que `src/store/signals.ts`)
  - Persistencia en memoria de sesión (no localStorage)

---

## FRONTEND — Phase 13: API Services

- [ ] T304 [P] Crear `src/services/institutional/institutionalApi.ts`
  - `getInstitutionalAnalysis(ticker, period, horizon, signal?)`: `GET /api/institutional/analysis`
  - `getRegulatoryPositions(ticker, period, horizon, signal?)`: `GET /api/institutional/positions`
  - Usar `getAuthHeaders()` de `signalApi.ts`
  - Cache-before-fetch con `getCached` / `setCache` de `apiCache.ts`
  - `AbortSignal` en ambas funciones

- [ ] T305 [P] Crear `src/services/coverage/coverageApi.ts`
  - `postCoverageAnalyze(body, signal?)`: `POST /api/coverage/analyze`
  - `postCoverageCompare(body, signal?)`: `POST /api/coverage/compare`
  - `postCoverageSimulate(body, signal?)`: `POST /api/coverage/simulate`
  - `fetchWithRetry()`: 2 reintentos en 5xx/429, backoff 1s/2s
  - Cache-before-fetch con TTL=5min

- [ ] T306 [P] Crear `src/services/ai/aiChatApi.ts`
  - `postInstitutionalChat(body)`: `POST /api/ai/institutional-chat`
  - `pollChatResponse(responseId)`: `GET /api/ai/institutional-chat/poll/:responseId`
  - Manejo explícito de `status==="pending"` y `ai_unavailable`

- [ ] T307 [P] Crear `src/services/apiCache.ts`
  - Cache in-memory con TTL configurable (default 5 min)
  - API: `getCached<T>(key)`, `setCache(key, value, ttlMs?)`, `clearCache()`, `invalidateCache(key)`
  - Cache key: URL + JSON.stringify(body)
  - Sin dependencias de React

- [ ] T308 [P] Actualizar `src/services/signals/signalApi.ts`
  - Memoizar `getAuthHeaders()`: cachear `authToken` en variable de módulo
  - Exportar `invalidateAuthCache()` para reset en logout
  - Eliminar lecturas repetitivas de `localStorage` en cada llamada

---

## FRONTEND — Phase 14: Componentes

- [ ] T309 [P] Crear `src/components/coverage/PayoffChart.tsx`
  - Usar `lightweight-charts` (ya disponible en el proyecto)
  - Eje X: precios reales con `TIME_BASE=1000000000` + tickMarkFormatter → NO "1970"
  - `subscribeCrosshairMove` para tooltip de break-even: "Break-even: $XXX.XX" al hover ±5%
  - Props: `points: PayoffPoint[]`, `breakEvenPrice: number`

- [ ] T310 [P] Crear `src/components/ai/ChatHistory.tsx`
  - Consume `src/store/chat.ts` via `useSyncExternalStore`
  - Muestra historial de preguntas/respuestas con timestamps
  - ScenarioAnalysis cards incrustadas

- [ ] T311 [P] Crear `src/components/ai/ScenarioAnalysisCards.tsx`
  - Cards con: label, description, protectionLevel, potentialPnL
  - Diseño consistente con CSS variables existentes (dark theme)

- [ ] T312 Crear `src/components/ui/Tooltip.tsx`
  - Componente tooltip reutilizable con portal o position:absolute
  - Props: `content: string`, `children: ReactNode`

---

## FRONTEND — Phase 15: Páginas

- [ ] T313 [P] Crear `src/pages/institutional/InstitutionalAnalysisPage.tsx`
  - Input ticker + dropdowns cerrados period/horizon (valores fijos del contrato backend)
  - Zonas S/R: tabla con precio, tipo, fuerza, confianza, volumen acumulado
  - Tendencias: dirección, SMA-50/200, crossover, score de continuidad
  - Métricas: candlesAnalyzed, zoneCount, sourceCount, ownership, netFlow
  - Source reports: estado de cada fuente (ok/partial/failed)
  - AbortController: abortar request en vuelo al cambiar ticker o desmontar
  - Refreshing overlay: barra animada (CSS) cuando `loading && data !== null`

- [ ] T314 [P] Crear `src/pages/institutional/RegulatoryPositionsPage.tsx`
  - Tabla 13F por fondo: sourceId, asOf, count, notional, ownership, confidence
  - Flujos: inflows, outflows, netFlow
  - Cache hit indicator
  - AbortController + refreshing overlay (mismo patrón que T313)

- [ ] T315 [P] Crear `src/pages/coverage/CoverageStrategiesPage.tsx`
  - Formulario: ticker, precio, strikes put/call, shares, capital, riskTolerance
  - Tabla comparativa de 4 estrategias con badge ALTA/MEDIA/BAJA (score 0-1)
  - `PayoffChart` por estrategia (o estado vacío si no hay opciones disponibles)
  - Risk metrics por estrategia: netPremium, downsideRisk, breakEven, stopLoss
  - AbortController para requests de analyze/compare/simulate

- [ ] T316 [P] Crear `src/pages/ai/AIChatPage.tsx`
  - Selector contexto: ticker + precio
  - Input de pregunta con submit
  - `ChatHistory` component
  - Polling visual: spinner + contador de intentos (máx 15) + tiempo transcurrido
  - `ai_unavailable`: mostrar estado de error con botón "Reintentar"
  - Narrativa renderizada, ScenarioAnalysisCards, recommendation
  - Traceability footer: evidenceIds, modelVersion, responseHash

---

## FRONTEND — Phase 16: Tests Frontend

- [ ] T317 [P] Crear `tests/pages/InstitutionalAnalysisPage.test.tsx`
  - Render sin errores, estado loading, estado error (403/503), estado con datos
  - Mock de `institutionalApi` con Vitest

- [ ] T318 [P] Crear `tests/pages/RegulatoryPositionsPage.test.tsx`
  - Render de tabla 13F, flujos, ownership
  - Mock de `institutionalApi`

- [ ] T319 [P] Crear `tests/pages/CoverageStrategiesPage.test.tsx`
  - Render de estrategias, estado "options unavailable"
  - Mock de `coverageApi`

- [ ] T320 [P] Crear `tests/pages/AIChatPage.test.tsx`
  - Render, envío de pregunta, estado polling, `ai_unavailable`
  - Mock de `aiChatApi`

- [ ] T321 Crear `tests/services/aiChatApi.test.ts`
  - Submit directo (HTTP 200) y async (HTTP 202)
  - Poll: pending→202, completed→200

- [ ] T322 Crear `tests/services/apiCache.test.ts`
  - Hit/miss, TTL expirado, `clearCache()`
  - `clearCache()` en `beforeEach` para evitar polución entre tests

- [ ] T323 [P] Crear `tests/services/coverageApi.test.ts`
  - analyze/compare/simulate: success + error 5xx + retry
  - AbortController: request abortada → no se cachea resultado
  - `clearCache()` en `beforeEach`

- [ ] T324 Crear `tests/services/institutionalApi.test.ts`
  - analysis/positions: success + error + cache hit
  - AbortController: signal abortada

---

## FRONTEND — Phase 17: Optimizaciones de Performance

- [ ] T342 [P] Verificar/crear `src/services/apiCache.ts` — ya cubierto en T307

- [ ] T343 [P] Cache + AbortSignal en `coverageApi.ts` — integrar en T305

- [ ] T344 [P] `fetchWithRetry()` en `coverageApi.ts` — integrar en T305

- [ ] T345 [P] Cache + AbortSignal en `institutionalApi.ts` — integrar en T304

- [ ] T346 [P] Memoized `getAuthHeaders()` en `signalApi.ts` — integrar en T308

- [ ] T347 [P] AbortController en `InstitutionalAnalysisPage.tsx` — integrar en T313

- [ ] T348 [P] AbortController en `RegulatoryPositionsPage.tsx` — integrar en T314

- [ ] T349 [P] AbortController en `CoverageStrategiesPage.tsx` — integrar en T315

- [ ] T350 [P] Refreshing bar en `InstitutionalAnalysisPage.tsx` — integrar en T313

- [ ] T351 [P] Refreshing bar en `RegulatoryPositionsPage.tsx` — integrar en T314

- [ ] T352 [P] `clearCache()` en `beforeEach` de `coverageApi.test.ts` — integrar en T323

---

## Validación Final

- [ ] T1040 Verificar `npx tsc --noEmit` en backend → 0 errores
- [ ] T1041 Verificar `npx vitest run` en backend → 32 test files, 158 tests passed
- [ ] T1042 Verificar `npx tsc --noEmit` en frontend → 0 errores
- [ ] T1043 Verificar tests frontend → todos pasan
- [ ] T1044 Smoke test manual:
  - `GET /api/institutional/analysis?ticker=AAPL` → HTTP 200, overallStatus ok/partial
  - `POST /api/coverage/analyze` con `{"ticker":"SPY","currentPrice":450,"shares":100}` → 4 estrategias
  - `POST /api/ai/institutional-chat` → HTTP 200 o 202
  - Browser: navegar `/institutional/analysis`, `/coverage/strategies`, `/ai/chat` — sin errores de consola

---

## Dependency Graph

```
Phase 1 (Contracts & Types)
     │
     ▼
Phase 2 (Data Service)
     │
     ▼
Phase 3 (Real Source Parsers)
     │
     ▼
Phase 4 (Institutional Engines)   ←── integrar bugfixes T1102-T1105 aquí
     │
     ▼
Phase 5 (Coverage Engines)        ←── integrar bugfixes T1100-T1101 aquí
     │
     ▼
Phase 6 (AI Copilot)
     │
     ▼
Phase 7 (Routes)                  ←── integrar bugfixes T1106-T1107 aquí
     │
     ├── Phase 8 (Env Vars)
     ├── Phase 10 (Cache Fixes)
     └── Phase 11 (Backend Tests)
     
Phase 12 (Frontend Setup)         ←── en paralelo con Phases 3-7
     │
     ├── Phase 13 (API Services)
     ├── Phase 14 (Components)
     └── Phase 15 (Pages)
          │
          └── Phase 16 (Frontend Tests)
               │
               └── Phase 17 (Performance — integrar en Phases 13-15)

Phases 1-7 → Phase 12-17 (frontend consume backend)
```

## Parallel Opportunities

| Grupo | Paralelo con |
|-------|-------------|
| T1000, T1001, T1002 | Entre sí (archivos distintos) |
| T1004, T1005, T1006, T1007 | Entre sí (parsers distintos) |
| T1008, T1009, T1010 | Entre sí (engines distintos, comparten `preResolvedResult`) |
| T1011, T1012, T1013 | Entre sí (engines de cobertura distintos) |
| T1020, T1021 | Entre sí (rutas institucionales distintas) |
| T1022, T1023, T1024 | Entre sí (rutas de cobertura distintas) |
| T300, T307 | Entre sí (setup + cache, sin dependencias mutuas) |
| T313, T314 | Entre sí (páginas institucionales distintas) |
| T317, T318, T319, T320 | Entre sí (tests de páginas distintas) |

## Conteo de Archivos

| Categoría | Archivos nuevos | Archivos modificados |
|-----------|----------------|---------------------|
| Backend módulos | 20 | 0 |
| Backend rutas | 7 | 2 (index.ts, confluenceViewPresets.ts) |
| Backend tests | 3 | 2 (protectivePutEngine.test.ts, collarEngine.test.ts) |
| Frontend infraestructura | 4 | 1 (main.tsx, signalApi.ts) |
| Frontend servicios | 3 | 0 |
| Frontend páginas | 4 | 0 |
| Frontend componentes | 4 | 0 |
| Frontend tests | 8 | 0 |
| **Total** | **53** | **5** |
