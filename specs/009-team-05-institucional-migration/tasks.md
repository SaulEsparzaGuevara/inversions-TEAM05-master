---
description: "Task list for 009-team-05-institucional-migration"
---

# Tasks: 009-team-05-institucional-migration

**Input**: Spec documents from `specs/009-team-05-institucional-migration/`
**Prerequisites**: spec.md, plan.md, research.md, data-model.md
**Nota**: Todas las tasks están marcadas `[ ]` (pendientes en repo principal).
**Numeración**: T1000+ para no colisionar con T106-T911 de otras specs.
**Marcador `[P]`**: tasks priorizadas para próxima iteración.

---

## Phase 1: Contracts & Types (Pendiente)

- [ ] T1000 [P] Crear `institutionalContract.ts` en `src/modules/institutional/institutionalContract.ts`
  Exportar: `InstitutionalAnalysisPeriod`, `InstitutionalHorizon`, `InstitutionalLiquidity`, `InstitutionalFlowSnapshot`, `InstitutionalOpenPositionsSnapshot`, `InstitutionalAnalysisContract`
  Funciones: `isNonEmptyString`, `isFiniteNumber`, `isInstitutionalFlowSnapshot`, `isInstitutionalOpenPositionsSnapshot`, `isInstitutionalAnalysisContract`, `createInstitutionalAnalysisContract`
  Validaciones hardcoded: `supportedPeriods`, `supportedHorizons`, `supportedLiquidity`, `fundsOwnershipPct` [0,100]
  FIC: comentarios bilingüe EN/ES en todas las funciones públicas

- [ ] T1001 [P] Crear `coverageStrategyContract.ts` en `src/modules/strategies/coverage/coverageStrategyContract.ts`
  Exportar: `CoverageStrategyKind`, `CoverageStrategyLeg`, `CoverageStrategyContract`, `CoverageStrategyResult`, `CoveragePayoffPoint`, `CoverageRiskMetrics`, `CoverageStrategyAlert`, `CoverageStrategyAlertSeverity`
  FIC: comentarios bilingüe EN/ES

- [ ] T1002 [P] Crear `coverageTypes.ts` en `src/modules/strategies/coverage/coverageTypes.ts`
  Función: `estimateOptionPremium(type, strike, IV=0.25, DTE=90)`
  FIC: comentarios bilingüe EN/ES

## Phase 2: Institutional Data Service (Pendiente)

- [ ] T1003 [P] Crear `institutionalDataService.ts` en `src/modules/institutional/institutionalDataService.ts`
  Clase `InstitutionalDataService` completa con:
  - constructor: `sources[]`, `cacheTtlMs=300000`, `cacheMaxEntries=250`, `fetchImpl=globalThis.fetch`
  - `resolve()`: `Promise.allSettled`, merge, `overallStatus`
  - `resolveSingleSource()`: cache→rateLimit→fetch+parse, nunca rechaza
  - `DEFAULT_CACHE_TTL_MS=300000`
  - `DEFAULT_CACHE_MAX_ENTRIES=250`
  - `DEFAULT_SOURCE_TIMEOUT_MS=12000`
  - Cache key: `sourceId:ticker`
  - Rate limit: ventana 60000ms
  - Merge strategy completa (promedio/máximo/suma/first/highest)
  - Confidence scoring: ≥4→0.95, 3→0.85, 2→0.70, else→0.55, max 0.95
  - `normalizePercentage`: ≤1→×100, >1→directo
  - 6 parsers embebidos (SEC, FINRA, UnusualWhales, Finviz, YahooOptions, YahooInstitutional)
  - LRU eviction en cache
  FIC: comentarios bilingüe EN/ES en clase, constructor y métodos públicos
  ✅ T1003a Validar que `overallStatus` retorna "partial" si ≥1 fuente falla pero ≥1 tiene datos
  ✅ T1003b Validar que `overallStatus` retorna "all_failed" si 0 fuentes tienen datos

## Phase 3: Real Source Parsers (Pendiente)

- [ ] T1004 [P] Crear `realSourceParsers.ts` en `src/modules/institutional/realSourceParsers.ts`

  **Función `parseSecEdgar13fReal`**:
  - `EDGAR_USER_AGENT`: `process.env.EDGAR_USER_AGENT ?? "TurboPapus/1.0 (contact@turbopapus.com)"`
  - `SEC_REQUEST_TIMEOUT_MS`: 30000
  - `JSON_HEADERS` y `XML_HEADERS` con User-Agent
  - `MAX_FILINGS`: 1
  - EFTS URL: `https://efts.sec.gov/LATEST/search-index` con parámetros q, dateRange=custom, startdt, enddt, forms=13F-HR
  - Date ranges: weekly→6m, monthly/quarterly→2024-01-01, daily/intraday→NOT_APPLICABLE
  - Timeout global: 60s
  - Confidence: ≥5 holders→0.88, ≥2→0.80, else→0.65
  - Flows: `inflows=totalValue*0.5/1000`, `outflows=totalValue*0.25/1000`
  - `searchEftsCache` (Map, nunca expira) + `inflightEfts` dedup
  - CUSIP map 60 tickers hardcoded

  **Función `parseFinraShortInterestReal`**:
  - `FINRA_API`: `https://api.finra.org/data/group/otcmarket/name/consolidatedShortInterest`
  - `FINRA_PAGE_SIZE`: 5000, `FINRA_MAX_PAGES`: 6
  - `FINRA_CACHE_TTL_MS`: 86400000, `FINRA_CACHE_FILE`: `/tmp/inversions-api-finra-cache.json`
  - `ensureFinraCache`: singleton + in-flight dedup + disk persistence
  - CSV columns: `symbol,currentShort,prevShort,avgDailyVol,daysToCover,changePct,settleDate,dateStr`
  - Fallback sintético confidence: 0.3
  - Confidence real: 0.88 si `daysToCover>0&&avgDailyVol>0`, else 0.70
  - Multiplicador notional: 2.3× short interest

  FIC: comentarios bilingüe EN/ES

- [ ] T1005 [P] Crear `yahooCrumbSession.ts` en `src/modules/institutional/yahooCrumbSession.ts`
  - `YAHOO_USER_AGENT`: Mozilla/5.0 Chrome/125 string completo
  - `YAHOO_CRUMB_URL`: `https://query2.finance.yahoo.com/v1/test/getcrumb`
  - `YAHOO_COOKIE_URL`: `https://fc.yahoo.com`
  - `CRUMB_TTL_MS`: 900000
  - Flujo: GET fc.yahoo.com redirect:manual → GET getcrumb
  - Cookie regex: `/[A-Za-z0-9]+=[A-Za-z0-9]+/`
  - Singleton + shared-promise dedup (`sessionCache` + `sessionPromise`)
  FIC: comentarios bilingüe EN/ES

- [ ] T1006 [P] Crear `yahooOptionsParser.ts` en `src/modules/institutional/yahooOptionsParser.ts`
  - `YAHOO_OPTIONS_URL`: `https://query2.finance.yahoo.com/v7/finance/options`
  - `REQUEST_TIMEOUT_MS`: 10000
  - URL con crumb: `{YAHOO_OPTIONS_URL}/{TICKER}?crumb={CRUMB}`
  - `computeOptionsFlowSignal`: callVolume, putVolume, callOi, putOi, `unusualStrikeCount` (volumen>2×OI), `directionalBias`
  - Confidence formula completa (capped 0.95)
  - Fallback seed determinista (suma charCodes del ticker)
  - Fallback confidence: 0.3
  FIC: comentarios bilingüe EN/ES

- [ ] T1007 [P] Crear `yahooInstitutionalParser.ts` en `src/modules/institutional/yahooInstitutionalParser.ts`
  - `YAHOO_QUOTE_URL`: `https://query2.finance.yahoo.com/v10/finance/quoteSummary`
  - `REQUEST_TIMEOUT_MS`: 10000
  - Modules: `institutionOwnership,majorHoldersBreakdown`
  - Confidence formula completa (capped 0.95)
  - Fallback seed determinista
  - Fallback confidence: 0.3
  FIC: comentarios bilingüe EN/ES

## Phase 4: Institutional Engines (Pendiente)

- [ ] T1008 [P] Crear `institutionalZonesEngine.ts` en `src/modules/institutional/institutionalZonesEngine.ts`
  - Clase `InstitutionalZonesEngine` con constructor(options)
  - `maxZones=8`, `pivotWindow=2`, `clusterTolerancePct=0.0125`, `liquidityVolumeMultiplier=1.15`
  - `analyze(request, preResolvedResult?)`: acepta precomputed
  - `buildFallbackCandles`: 60 velas sinusoidales
  - `buildCandidates`: pivot lows/highs con ventana=2, filtro liquidez volume≥avgVol*1.15
  - `clusterCandidates`: agrupación por ATR*`clusterTolerancePct`
  - `institutionalScore`, `zoneConfidence`, Strength fórmulas completas
  - `liquidityWeight`: high=1, medium=0.7, low=0.4
  FIC: comentarios bilingüe EN/ES

- [ ] T1009 [P] Crear `institutionalTrendEngine.ts` en `src/modules/institutional/institutionalTrendEngine.ts`
  - Clase `InstitutionalTrendEngine` con constructor(options)
  - `DEFAULT_MIN_CANDLES=200`, `FAST_MA=50`, `SLOW_MA=200`, `VOLUME_LOOKBACK=20`
  - `analyze(request, preResolvedResult?)`: SMA-50, SMA-200, crossover, volume correlation Pearson, continuity probability
  - `detectCrossover`: tolerance=0.002, lookback=30 días
  - Trend strength weights completos
  - Continuity weights completos
  - `institutionalScore` fórmula completa
  - Fallback candles: sinusoidal ±10% + noise ±0.75%
  FIC: comentarios bilingüe EN/ES

- [ ] T1010 [P] Crear `expirationAnalysisEngine.ts` en `src/modules/institutional/expirationAnalysisEngine.ts`
  - Clase `ExpirationAnalysisEngine` con constructor(options)
  - `DEFAULT_WINDOW_DAYS=90`, `LOOK_AHEAD_MONTHS=6`, `STRIKE_PROXIMITY_PCT=0.05`
  - OPEX: 3er viernes de cada mes
  - Quarter futures: último viernes del trimestre
  - Triple witching: meses [3,6,9,12]
  - FOMC months: [1,3,5,6,7,9,11,12] → 2do miércoles
  - CPI: 2do miércoles de cada mes
  - Earnings: [1,4,7,10] → 2do viernes
  - Time decay regimes completos (`at_expiration`/`near`/`far`)
  - Slippery slope thresholds completos
  - Expiry bias por trimestre
  - Quarterly report window: -7/+14 días, impacto `overlapRatio*3.5%`
  - Acepta `preResolvedResult` opcional
  FIC: comentarios bilingüe EN/ES

## Phase 5: Coverage Engines (Pendiente)

- [ ] T1011 [P] Crear `protectivePutEngine.ts` en `src/modules/strategies/coverage/protectivePutEngine.ts`
  - `breakEvenPrice = currentPrice + netPremiumPerShare`
  - `stopLossBuffer = clamp(riskTolerancePct*0.5, 0.01, 0.10)`
  - `stopLossPrice = putStrike * (1 - stopLossBuffer)`
  - Fallback stopLoss: 0.03 cuando `riskTolerancePct=0` o ausente
  - `maxProfit`: Infinity
  - `maxLoss`: `max(0, currentPrice-putStrike+netPremiumPerShare)*shares`
  - Alerta `STOP_LOSS_NEAR_STRIKE`: precio dentro ±3% del strike
  - Alerta `MARRIED_PUT_BASIS_CHECK`: para `kind=married_put`
  FIC: comentarios bilingüe EN/ES

- [ ] T1012 [P] Crear `collarEngine.ts` en `src/modules/strategies/coverage/collarEngine.ts`
  - `netPremiumPerShare = putPremium - callPremium`
  - `maxProfit = max(0, callStrike-currentPrice-netPremiumPerShare)*shares`
  - `maxLoss = max(0, currentPrice-putStrike+netPremiumPerShare)*shares`
  - `protectionCeilingPrice = callStrike - netPremiumPerShare`
  - `protectionFloorPrice = putStrike - netPremiumPerShare`
  - `exerciseRiskScore = clamp01(downside*0.5 + upside*0.5)`
  - Alerta `COLLAR_CALL_BELOW_MARKET`: si `callStrike<=currentPrice`
  - Alerta `STOP_LOSS_NEAR_STRIKE`: precio dentro del rango collar
  FIC: comentarios bilingüe EN/ES

- [ ] T1013 [P] Crear `coveredStraddleEngine.ts` en `src/modules/strategies/coverage/coveredStraddleEngine.ts`
  - `kind`: `"covered_straddle"` (por compatibilidad de contratos)
  - Estructura: acciones long + put short + call short (covered strangle)
  - Riesgo asimétrico: ilimitado solo a la baja (put short)
  - Alza cubierta por acciones long (no riesgo verdaderamente ilimitado)
  - Alerta `HIGH_VOLATILITY_PROFILE` con texto "covered strangle"
  FIC: comentarios bilingüe EN/ES

- [ ] T1014 [P] Crear `coverageSimulationEngine.ts` en `src/modules/strategies/coverage/coverageSimulationEngine.ts`
  - Monte Carlo: 256 iteraciones default
  - `monteCarloIterations=0` → skip, retorna payoff sin loop
  - Escenarios determinísticos (subida/bajada %)
  - Nota en documentación: 256 iteraciones para demo/visualización, mínimo 10000 para producción
  FIC: comentarios bilingüe EN/ES

- [ ] T1015 [P] Crear `coverageRiskService.ts` en `src/modules/strategies/coverage/coverageRiskService.ts`
  - Stop-loss configurable
  - Alertas de margen y niveles críticos
  - Notificaciones via `Promise.allSettled` (paralelo)
  FIC: comentarios bilingüe EN/ES

- [ ] T1016 [P] Crear `coverageReportService.ts` en `src/modules/strategies/coverage/coverageReportService.ts`
  - `generateReport(strategyReq, recipients?, precomputed?)`
  - `precomputed` provisto → skip simulation y risk
  - File I/O parallelizado con `Promise.all`
  FIC: comentarios bilingüe EN/ES

- [ ] T1017 [P] Crear `coverageComparator.ts` en `src/modules/strategies/coverage/coverageComparator.ts`
  - `compare()`: 4 estrategias, matriz de comparación
  - Pasa `precomputed` a `generateReport`
  - Score: 50% PnL esperado + distribución de riesgo/costo/contexto
  FIC: comentarios bilingüe EN/ES

## Phase 6: AI Copilot (Pendiente)

- [ ] T1018 [P] Crear `institutionalCopilotChat.ts` en `src/modules/ai/institutionalCopilotChat.ts`
  - Modelo: Gemini 2.5 Flash (`GEMINI_API_KEY` de env)
  - `submit(context)`: síncrono si p95≤5s, async si excede
  - `poll(responseId)`: consulta estado
  - Polling: 2s/30s/15 intentos
  - `ai_unavailable` flag cuando Gemini no responde
  - Trazabilidad: `context_id`, `strategy_id`, `evidence_ids[]`, `model_version`, `response_hash` (SHA256), `timestamp`
  - `inferAIRole`: admin/trader→analyst, cualquier otro→risk_manager
  - Solo lectura, nunca ejecuta operaciones
  FIC: comentarios bilingüe EN/ES

## Phase 7: Routes & Bootstrap (Pendiente)

- [ ] T1019 [P] Crear `bootstrap.ts` en `src/routes/institutional/bootstrap.ts`
  - Configuración de source configs para `InstitutionalDataService`
  - Eager preload de FINRA cache: `ensureFinraCache().catch(()=>{})`
  - Registrar 4 fuentes: `sec_edgar_13f`, `finra_short_interest`, `yahoo_options_flow`, `yahoo_institutional`
  FIC: comentarios bilingüe EN/ES

- [ ] T1020 [P] Crear `institutionalAnalysis.ts` en `src/routes/institutional/institutionalAnalysis.ts`
  - `POST /api/institutional/analysis`
  - `authContextMiddleware`, roles: analyst/risk_manager/trader
  - Valida: ticker, period, horizon
  - `resolve()` UNA VEZ, comparte `preResolvedResult` con los 3 engines
  - Zones + Trend + Expiration en paralelo (`Promise.allSettled`)
  - HTTP 200 ok, 206 partial, 503 all_failed
  - Respuesta 503: `{ code:"ALL_SOURCES_UNAVAILABLE", sourceReports:[] }`
  FIC: comentarios bilingüe EN/ES

- [ ] T1021 [P] Crear `regulatoryPositions.ts` en `src/routes/institutional/regulatoryPositions.ts`
  - `POST /api/institutional/positions`
  - `authContextMiddleware`, roles: analyst/risk_manager/trader
  - Mismo patrón de degradación parcial que `institutionalAnalysis`
  - Retorna posiciones abiertas, flujos, datos 13F
  FIC: comentarios bilingüe EN/ES

- [ ] T1022 [P] Crear `analyze.ts` en `src/routes/coverage/analyze.ts`
  - `POST /api/coverage/analyze`
  - Roles: analyst, risk_manager, trader
  - `buildContracts`: defaults price=450, expiry=90d, shares=100, capital=100000, risk=5%, put=95%*price, call=105%*price
  - `estimatePremium` con IV=0.25, DTE=90
  - Retorna `{ results: CoverageStrategyResult[], generatedAt }`
  - Errores: FORBIDDEN_ROLE(403), INVALID_TICKER/PRICE/SHARES(400)
  FIC: comentarios bilingüe EN/ES

- [ ] T1023 [P] Crear `simulate.ts` en `src/routes/coverage/simulate.ts`
  - `POST /api/coverage/simulate`
  - Roles: analyst, risk_manager, trader
  - Contract protective_put con params del body
  - Retorna `CoverageSimulationResult`
  FIC: comentarios bilingüe EN/ES

- [ ] T1024 [P] Crear `compare.ts` en `src/routes/coverage/compare.ts`
  - `POST /api/coverage/compare`
  - Roles: analyst, risk_manager, trader
  - `CoverageComparator.compare()` con 4 estrategias
  - Retorna `CoverageComparisonResult`
  FIC: comentarios bilingüe EN/ES

- [ ] T1025 [P] Crear `institutionalCopilot.ts` en `src/routes/ai/institutionalCopilot.ts`
  - `POST /api/ai/institutional-chat`
  - `GET /api/ai/institutional-chat/poll/:responseId`
  - `authContextMiddleware`
  - Valida: ticker, currentPrice, zones, question
  - `userRole` del body o inferido de `authContext.role`
  - pending → HTTP 202 con pollingUrl y retryAfterSeconds
  - completed → HTTP 200 con narrative, reasoning, scenarioAnalysis, recommendation, evidenceIds, modelVersion, responseHash
  - Error → HTTP 500 con `ai_unavailable:true`
  - `inferAIRole`: admin/trader→analyst, otro→risk_manager
  FIC: comentarios bilingüe EN/ES

## Phase 8: Registro de Rutas (Pendiente)

- [ ] T1026 Registrar todos los routers en el entry point principal de la REST API (app.ts o index.ts):
  - `/api/institutional` → institutionalAnalysis + regulatoryPositions routers
  - `/api/coverage` → analyze + simulate + compare routers
  - `/api/ai` → institutionalCopilot router
  Verificar que `authContextMiddleware` está instalado globalmente o por router según la arquitectura existente del proyecto.

## Phase 9: Variables de Entorno (Pendiente)

- [ ] T1027 Documentar y configurar variables de entorno requeridas:
  - `EDGAR_USER_AGENT=TurboPapus/1.0 (contact@turbopapus.com)`
  - `GEMINI_API_KEY=<obtener del proyecto TEAM-05>`
  Agregar al `.env.example` del proyecto principal.

## Phase 10: Tests (Pendiente)

- [ ] T1028 [P] Crear tests unitarios para CollarEngine — caso crédito neto:
  `callPremium=9.26`, `putPremium=0.74`, `currentPrice=450.50`, `callStrike=460`, `shares=100`
  Aserciones: `netPremiumPerShare≈-8.52`, `maxProfit≈1002`, `protectionCeilingPrice≈468.52`
  Archivo: `tests/unit/strategies/coverage/collarEngine.test.ts`

- [ ] T1029 Crear tests unitarios para ProtectivePutEngine:
  break-even OTM/ATM/ITM + `stopLossPrice` dinámico con `riskTolerancePct`
  Archivo: `tests/unit/strategies/coverage/protectivePutEngine.test.ts`

- [ ] T1030 Crear tests de integración para flujo completo:
  `POST /api/coverage/analyze` → verifica 4 estrategias con datos reales
  `POST /api/institutional/analysis` → verifica degradación parcial
  Archivo: `tests/integration/coverage.test.ts`

## Phase 11: Cache Fixes — SEC EDGAR 13F Date Staleness (Pendiente)

- [ ] T1031 [P] Incluir `period` en la key de `searchEftsCache` e `inflightEfts` en `realSourceParsers.ts`
  Cache key actual: solo `ticker` → ignoraba `period`, devolviendo el mismo `period_ending` sin importar el rango solicitado. Cambiar a `${ticker}:${period}` tanto en `searchEftsCache` como en `inflightEfts`.

- [ ] T1032 [P] Agregar TTL de 24h a `searchEftsCache` en `realSourceParsers.ts`
  Definir `SEARCH_EFTS_CACHE_TTL_MS = 86_400_000`. Cambiar estructura del Map de `Map<string, EftsHit[]>` a `Map<string, { hits: EftsHit[]; timestamp: number }>`. En `searchEfts()`, verificar expiración antes de retornar cache. Aunque los 13F son inmutables, nuevos filings se publican cada trimestre y sin TTL el servidor necesita restart para verlos.

- [ ] T1033 [P] Incluir `period` en `InstitutionalDataService.getCacheKey()`
  Cache key actual: `sourceId:ticker` → ignora `period`. Cambiar a `${source.sourceId}:${request.ticker}:${request.period}`. Evita que requests con diferentes periodos compartan la misma observación cachead.

---

## Dependency Graph

```
Phase 1 (Contracts & Types)
    │
    ▼
Phase 2 (Institutional Data Service)
    │
    ▼
Phase 3 (Real Source Parsers: SEC, FINRA, Yahoo)
    │
    ▼
Phase 4 (Institutional Engines: Zones, Trend, Expiration)
    │
    ▼
Phase 5 (Coverage Engines: Protective Put, Collar, Straddle, Simulation, Risk, Report, Comparator)
    │
    ▼
Phase 6 (AI Copilot Chat)
    │
    ▼
Phase 7 (Routes & Bootstrap)
    │
    ▼
Phase 8 (Register Routes)
    │
    ▼
Phase 9 (Environment Variables)
    │
    ▼
Phase 10 (Tests)
    │
    ▼
Phase 11 (Cache Fixes — SEC EDGAR)
```

## Implementation Sequence

1. Phase 1 → Contracts & Types (T1000-T1002)
2. Phase 2 → InstitutionalDataService (T1003)
3. Phase 3 → Real Source Parsers (T1004-T1007)
4. Phase 4 → Institutional Engines (T1008-T1010)
5. Phase 5 → Coverage Engines (T1011-T1017)
6. Phase 6 → AI Copilot (T1018)
7. Phase 7 → Routes (T1019-T1025)
8. Phase 8 → Register Routes (T1026)
9. Phase 9 → Env Vars (T1027)
10. Phase 10 → Tests (T1028-T1030)
11. Phase 11 → Cache Fixes (T1031-T1033)

## Parallel Opportunities

| Task Group | Can run in parallel with |
|------------|-------------------------|
| T1000, T1001, T1002 | All within Phase 1 (different files) |
| T1004, T1005, T1006, T1007 | Each other (different parsers) |
| T1008, T1009, T1010 | Each other (different engines, share preResolvedResult) |
| T1011, T1012, T1013 | Each other (different engines) |
| T1014, T1015, T1016, T1017 | Sequential dependency (sim→risk→report→comparator) |
| T1019 | Independent (bootstrap) |
| T1020, T1021 | Each other (different routes) |
| T1022, T1023, T1024 | Each other (different routes) |
| T1025 | Independent (AI route) |
| T1028, T1029, T1030 | Each other (different test files) |
| T1031, T1032, T1033 | Same file (realSourceParsers.ts) — must be sequential: T1031 → T1032, then T1033 independent |

---

## Implementation Strategy

### 27 Files to Create

| # | Archivo | Ruta |
|---|---------|------|
| 1 | institutionalContract.ts | src/modules/institutional/ |
| 2 | institutionalDataService.ts | src/modules/institutional/ |
| 3 | realSourceParsers.ts | src/modules/institutional/ |
| 4 | yahooCrumbSession.ts | src/modules/institutional/ |
| 5 | yahooOptionsParser.ts | src/modules/institutional/ |
| 6 | yahooInstitutionalParser.ts | src/modules/institutional/ |
| 7 | institutionalZonesEngine.ts | src/modules/institutional/ |
| 8 | institutionalTrendEngine.ts | src/modules/institutional/ |
| 9 | expirationAnalysisEngine.ts | src/modules/institutional/ |
| 10 | coverageStrategyContract.ts | src/modules/strategies/coverage/ |
| 11 | coverageTypes.ts | src/modules/strategies/coverage/ |
| 12 | protectivePutEngine.ts | src/modules/strategies/coverage/ |
| 13 | collarEngine.ts | src/modules/strategies/coverage/ |
| 14 | coveredStraddleEngine.ts | src/modules/strategies/coverage/ |
| 15 | coverageSimulationEngine.ts | src/modules/strategies/coverage/ |
| 16 | coverageRiskService.ts | src/modules/strategies/coverage/ |
| 17 | coverageReportService.ts | src/modules/strategies/coverage/ |
| 18 | coverageComparator.ts | src/modules/strategies/coverage/ |
| 19 | institutionalCopilotChat.ts | src/modules/ai/ |
| 20 | bootstrap.ts | src/routes/institutional/ |
| 21 | institutionalAnalysis.ts | src/routes/institutional/ |
| 22 | regulatoryPositions.ts | src/routes/institutional/ |
| 23 | analyze.ts | src/routes/coverage/ |
| 24 | simulate.ts | src/routes/coverage/ |
| 25 | compare.ts | src/routes/coverage/ |
| 26 | institutionalCopilot.ts | src/routes/ai/ |
| 27 | (entry point route registration) | src/app.ts or src/index.ts |

### Notes

- Todas las tasks marcadas con `[ ]` — pendientes en repositorio principal
- Tasks marcadas con `[P]` — priorizadas para próxima iteración
- FIC: comentarios bilingüe EN/ES requeridos en todos los archivos
- Código fuente de referencia en repo local TEAM-05 (specs/006-team-05-institucional-cobertura/)
