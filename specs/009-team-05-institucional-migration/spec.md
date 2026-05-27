# Spec: 009-team-05-institucional-migration

- **Feature**: 009-team-05-institucional-migration
- **Equipo**: TEAM-05 (TurboPapus)
- **Tipo**: Migration Spec (as-is)
- **Spec fuente local**: specs/006-team-05-institucional-cobertura/spec.md
- **Última actualización**: 2026-05-26

## Resumen

Migración completa del módulo de análisis institucional y estrategias de cobertura de TEAM-05 al repositorio principal. Cubre 27 archivos backend (~7,500 líneas), 4 fuentes de datos externas (SEC EDGAR, FINRA, Yahoo Finance v7/v10), 4 motores de estrategias de cobertura, motor de zonas institucionales, motor de tendencias, motor de análisis de vencimientos, servicio de Chat IA (Gemini 2.5 Flash), y 7 endpoints REST.

## Alcance Funcional

### RF-001 — Módulo Institutional Contract

**Archivo**: `src/modules/institutional/institutionalContract.ts`

**Tipos**: `InstitutionalAnalysisPeriod`, `InstitutionalHorizon`, `InstitutionalLiquidity`, `InstitutionalFlowSnapshot`, `InstitutionalOpenPositionsSnapshot`, `InstitutionalAnalysisContract`

**Funciones**: `isNonEmptyString`, `isFiniteNumber`, `isInstitutionalFlowSnapshot`, `isInstitutionalOpenPositionsSnapshot`, `isInstitutionalAnalysisContract`, `createInstitutionalAnalysisContract`

**Validaciones**: `supportedPeriods`, `supportedHorizons`, `supportedLiquidity`, `fundsOwnershipPct` [0,100]

### RF-002 — Módulo Institutional Data Service

**Archivo**: `src/modules/institutional/institutionalDataService.ts`

**Clase**: `InstitutionalDataService`

**Constructor**: options con `sources[]`, `cacheTtlMs=300000`, `cacheMaxEntries=250`, `fetchImpl=globalThis.fetch`

**Método `resolve(request)`**: ejecuta fuentes EN PARALELO via `Promise.allSettled`, merge de observaciones, `overallStatus: ok/partial/all_failed`

**Método `resolveSingleSource`**: cache check → rate limit → fetch + parse, nunca rechaza (maneja errores internamente)

**Cache key**: `sourceId:ticker` (sin period/horizon)

**Rate limit**: ventana 60s por source

**Timeouts**: `DEFAULT_SOURCE_TIMEOUT_MS=12000`

**Merge strategy**:
- `fundsOwnershipPct` → PROMEDIO
- `volume` → MÁXIMO
- `flows.inflows/outflows` → SUMA
- `openPositions.count` → MÁXIMO
- `categorical` → FIRST DEFINED ordenado por confidence desc
- `liquidity` → HIGHEST (`pickHighestLiquidity`)

**Confidence scoring**:
- ≥4 señales → 0.95
- 3 señales → 0.85
- 2 señales → 0.70
- else → 0.55
- máximo 0.95 (nunca 1.0)

**Parsers embebidos**: `parseSecEdgar13f`, `parseFinraShortInterest`, `parseUnusualWhales`, `parseFinvizInstitutional`, `parseYahooOptionsFlow`, `parseYahooInstitutional`

**`normalizePercentage`**: ≤1 → ×100 (decimal), >1 → directo (porcentaje)

### RF-003 — Real Source Parsers (SEC EDGAR + FINRA)

**Archivo**: `src/modules/institutional/realSourceParsers.ts`

**SEC EDGAR**:
- `EDGAR_USER_AGENT`: `process.env.EDGAR_USER_AGENT ?? "TurboPapus/1.0 (contact@turbopapus.com)"`
- `SEC_REQUEST_TIMEOUT_MS`: 30000
- `JSON_HEADERS`: User-Agent + `Accept:application/json`
- `XML_HEADERS`: User-Agent + `Accept:application/xml,text/xml,text/plain`
- `MAX_FILINGS`: 1 (solo filing más reciente)
- EFTS URL: `https://efts.sec.gov/LATEST/search-index?q={TICKER}&dateRange=custom&startdt={START}&enddt={END}&forms=13F-HR`
- Filing index URL: `https://www.sec.gov/Archives/edgar/data/{cik}/{stripped}/index.json`
- Date ranges por period:
  - weekly → 6 meses atrás
  - monthly/quarterly → desde 2024-01-01
  - daily/intraday → NOT_APPLICABLE para SEC
- Timeout global operación SEC: 60s
- Confidence SEC: ≥5 holders → 0.88, ≥2 → 0.80, else → 0.65
- Flows estimados: `inflows=totalValue*0.5/1000`, `outflows=totalValue*0.25/1000`
- `searchEftsCache`: Map en módulo (nunca expira), in-flight dedup con `inflightEfts`
- CUSIP map de 60 tickers hardcoded:
  AAPL, MSFT, GOOGL, GOOG, AMZN, META, TSLA, NVDA, JPM, V, SPY, QQQ,
  INTC, CSCO, IBM, QCOM, AMD, ADBE, ORCL, CRM, NOW, INTU, WMT, HD, COST,
  PG, KO, PEP, MCD, DIS, SBUX, NFLX, BKNG, LOW, TGT, UNH, JNJ, ABBV,
  MRK, LLY, TMO, ABT, PFE, MDT, XOM, CVX, BA, GE, CAT, UPS, UNP, HON,
  LMT, C, BRK.B, BRK.A, VZ, T, NEE, AVGO, ACN, LIN, AMT, TROW

**FINRA**:
- `FINRA_API`: `https://api.finra.org/data/group/otcmarket/name/consolidatedShortInterest` (POST)
- `FINRA_PAGE_SIZE`: 5000
- `FINRA_MAX_PAGES`: 6 (hasta 30,000 registros)
- `FINRA_CACHE_TTL_MS`: 86400000 (24h)
- `FINRA_CACHE_FILE`: `/tmp/inversions-api-finra-cache.json`
- Cache singleton + in-flight dedup (`ensureFinraCache`)
- Carga desde disco si existe y no expiró
- CSV columns: `symbol,currentShort,prevShort,avgDailyVol,daysToCover,changePct,settleDate,dateStr`
- Fallback sintético si ticker no encontrado:
  - confidence: 0.3
  - estimatedShort: 500000 + random*2000000
  - estimatedVolume: 1000000 + random*5000000
- Confidence FINRA real: 0.88 si `daysToCover>0 && avgDailyVol>0`, else 0.70
- Multiplicador notional: 2.3× short interest

### RF-004 — Yahoo Crumb Session

**Archivo**: `src/modules/institutional/yahooCrumbSession.ts`

- `YAHOO_USER_AGENT`: `"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"`
- `YAHOO_CRUMB_URL`: `https://query2.finance.yahoo.com/v1/test/getcrumb`
- `YAHOO_COOKIE_URL`: `https://fc.yahoo.com`
- `CRUMB_TTL_MS`: 900000 (15 min)
- Flujo: GET fc.yahoo.com (redirect:manual, extrae cookie) → GET getcrumb
- Cookie extraction regex: `/[A-Za-z0-9]+=[A-Za-z0-9]+/`
- Singleton + shared-promise dedup

### RF-005 — Yahoo Options Parser

**Archivo**: `src/modules/institutional/yahooOptionsParser.ts`

- `YAHOO_OPTIONS_URL`: `https://query2.finance.yahoo.com/v7/finance/options`
- `REQUEST_TIMEOUT_MS`: 10000
- URL con crumb: `https://query2.finance.yahoo.com/v7/finance/options/{TICKER}?crumb={CRUMB}`
- Señal: `callVolume`, `putVolume`, `callOi`, `putOi`, put/call ratios
- `unusualStrikeCount`: volumen > 2× OI
- `directionalBias`: `(callVolume - putVolume) / totalVolume`
- Confidence: `0.4 + (expirationCount/6)*0.2 + min(unusualStrikeCount/10,1)*0.2 + (totalVolume>0?0.15:0) + (totalOi>0?0.15:0)`, capped 0.95
- Fallback seed determinista por ticker (suma charCodes)
- Fallback volume: 15000 + (seed%5000)*(volume/1000000)
- Fallback confidence: 0.3

### RF-006 — Yahoo Institutional Parser

**Archivo**: `src/modules/institutional/yahooInstitutionalParser.ts`

- `YAHOO_QUOTE_URL`: `https://query2.finance.yahoo.com/v10/finance/quoteSummary`
- `REQUEST_TIMEOUT_MS`: 10000
- URL: `https://query2.finance.yahoo.com/v10/finance/quoteSummary/{TICKER}?modules=institutionOwnership,majorHoldersBreakdown&crumb={CRUMB}`
- Confidence: `0.35 + (holderCount/50)*0.25 + (ownership?0.2:0) + (holders>0?0.15:0) + (change!=0?0.05:0)`, capped 0.95
- Fallback: `holders=500+(seed%200)`, `ownership=25+(seed%30)`
- Fallback confidence: 0.3

### RF-007 — Institutional Zones Engine

**Archivo**: `src/modules/institutional/institutionalZonesEngine.ts`

- `maxZones` default: 8
- `pivotWindow` default: 2
- `clusterTolerancePct` default: 0.0125 (1.25%)
- `liquidityVolumeMultiplier` default: 1.15
- Fallback candles: 60 velas, drift sinusoidal ±1.2%, noise coseno ±0.7%
- `institutionalScore`: `0.2 + sourceConfidence*0.35 + ownership*0.2 + positionFactor*0.15 + flowFactor*0.1`
- `zoneConfidence`: `0.35 + institutionalScore*0.35 + (highLiquidity?0.15:0.05) + directionalBias*0.1 + candleBody*0.05`
- Strength: `0.25 + volumeScore*0.35 + sourceScore*0.2 + touchesScore*0.15 + liquidityScore*0.05 + confidence*0.15`
- `liquidityWeight`: high=1, medium=0.7, low=0.4
- Clusterización por ATR * `clusterTolerancePct`
- Acepta `preResolvedResult` opcional (evita resolve duplicado)

### RF-008 — Institutional Trend Engine

**Archivo**: `src/modules/institutional/institutionalTrendEngine.ts`

- `DEFAULT_MIN_CANDLES`: 200
- `DEFAULT_FAST_MA_PERIOD`: 50 (SMA-50)
- `DEFAULT_SLOW_MA_PERIOD`: 200 (SMA-200)
- `DEFAULT_VOLUME_LOOKBACK`: 20
- Crossover tolerance: 0.002 (0.2%)
- Crossover lookback: 30 días
- Trend strength weights: MA sep 30%, slope 15%, crossover 20%, volume 20%, flow 15%
- Continuity weights: MA 35%, volume 25%, ownership 20%, flow 20%
- `institutionalScore`: `0.2 + confidence*0.35 + ownership*0.2 + posFactor*0.15 + flowFactor*0.1`
- Crossover detection: compara primera vs segunda mitad del período
- Volume correlation: Pearson con 4 señales trimestrales sintéticas
- Fallback candles: sinusoidal ±10% + random noise ±0.75%
- Acepta `preResolvedResult` opcional

### RF-009 — Expiration Analysis Engine

**Archivo**: `src/modules/institutional/expirationAnalysisEngine.ts`

- `DEFAULT_WINDOW_DAYS`: 90
- `DEFAULT_LOOK_AHEAD_MONTHS`: 6
- `DEFAULT_STRIKE_PROXIMITY_PCT`: 0.05
- `OPEX_WEEKDAY`: 5 (viernes)
- `QUARTER_MONTHS`: [3,6,9,12]
- `TRIPLE_WITCHING_MONTHS`: [3,6,9,12]
- `QUARTERLY_REPORT_MONTHS`: [2,5,8,11]
- FOMC months: [1,3,5,6,7,9,11,12] → 2do miércoles
- CPI: 2do miércoles de cada mes
- Earnings months: [1,4,7,10] → 2do viernes
- Time decay regimes:
  - ≤7 días → `at_expiration` (theta 0.8-2.0, gamma 1.2+)
  - 8-30 días → `near` (theta 0.3-0.8, gamma 0.3-1.0)
  - >30 días → `far` (theta 0.05-0.2, gamma 0.05)
- Slippery slope: `flowRatio>0.25 && ownership>30` → `call_skew`, `flowRatio<-0.25 && ownership<20` → `put_skew`, else → `symmetric`
- Expiry bias: Jan-Mar neutral, Apr-Jun bullish, Jul-Sep neutral, Oct-Dec bearish
- Quarterly report window: -7/+14 días alrededor del 15
- Average impact: overlapRatio * 3.5%
- Acepta `preResolvedResult` opcional

### RF-010 — Coverage Strategy Contract

**Archivo**: `src/modules/strategies/coverage/coverageStrategyContract.ts`

**Tipos**: `CoverageStrategyKind`, `CoverageStrategyLeg`, `CoverageStrategyContract`, `CoverageStrategyResult`, `CoveragePayoffPoint`, `CoverageRiskMetrics`, `CoverageStrategyAlert`, `CoverageStrategyAlertSeverity`

**Función**: `estimateOptionPremium(type, strike, IV=0.25, DTE=90)`

### RF-011 — Protective Put Engine (incluye Married Put)

**Archivo**: `src/modules/strategies/coverage/protectivePutEngine.ts`

- Break-even: `currentPrice + netPremiumPerShare` (válido OTM/ATM/ITM)
- `stopLossPrice`: `putStrike * (1 - buffer)`
  - buffer = `clamp(riskTolerancePct * 0.5, 0.01, 0.10)`
  - fallback hardcoded: 0.03 cuando `riskTolerancePct=0` o ausente
- `maxProfit`: Infinity
- `maxLoss`: `max(0, currentPrice - putStrike + netPremiumPerShare) * shares`
- Alerta `STOP_LOSS_NEAR_STRIKE`: precio actual dentro de ±3% del strike
- Alerta `MARRIED_PUT_BASIS_CHECK`: para `kind=married_put`

### RF-012 — Collar Engine

**Archivo**: `src/modules/strategies/coverage/collarEngine.ts`

- `netPremiumPerShare = putPremium - callPremium` (positivo=débito neto, negativo=crédito neto)
- `maxProfit = max(0, callStrike - currentPrice - netPremiumPerShare) * shares`
- `maxLoss = max(0, currentPrice - putStrike + netPremiumPerShare) * shares`
- `protectionCeilingPrice = callStrike - netPremiumPerShare`
- `protectionFloorPrice = putStrike - netPremiumPerShare`
- `exerciseRiskScore = clamp01(downside*0.5 + upside*0.5)`
- Alerta `COLLAR_CALL_BELOW_MARKET`: si `callStrike <= currentPrice`
- Alerta `STOP_LOSS_NEAR_STRIKE`: precio actual dentro del rango del collar

### RF-013 — Covered Straddle Engine

**Archivo**: `src/modules/strategies/coverage/coveredStraddleEngine.ts`

- `kind`: `"covered_straddle"` (mantener por compatibilidad de contratos)
- Estructura real: acciones long + put short + call short (covered strangle)
- Riesgo asimétrico: riesgo ilimitado SOLO a la baja (put short), alza cubierta por acciones long
- Alerta `HIGH_VOLATILITY_PROFILE`: evaluación bajo escenarios de alta volatilidad

### RF-014 — Coverage Simulation Engine

**Archivo**: `src/modules/strategies/coverage/coverageSimulationEngine.ts`

- Monte Carlo: 256 iteraciones por defecto
- `monteCarloIterations=0` → skip MC, retorna payoff sin loop (sub-segundo)
- Soporta escenarios determinísticos (subida/bajada %)
- Soporta backtesting con datos históricos

### RF-015 — Coverage Risk Service

**Archivo**: `src/modules/strategies/coverage/coverageRiskService.ts`

- Stop-loss automático configurable
- Alertas de margen y niveles críticos
- Notificaciones: `Promise.allSettled` (paralelo, no secuencial)

### RF-016 — Coverage Report Service

**Archivo**: `src/modules/strategies/coverage/coverageReportService.ts`

- `generateReport(strategyReq, recipients?, precomputed?)`
- Cuando `precomputed` provisto → skip re-calling simulation y risk
- File I/O (JSON + MD) parallelizado con `Promise.all`
- `precomputed`: `{ simulation: CoverageSimulationResult; risk: CoverageRiskResult }`

### RF-017 — Coverage Comparator

**Archivo**: `src/modules/strategies/coverage/coverageComparator.ts`

- `compare()`: corre las 4 estrategias, genera matriz de comparación
- Pasa `precomputed` a `generateReport` para evitar 4 simulaciones duplicadas
- Score: 50% PnL esperado, resto distribuido entre riesgo, costo, contexto

### RF-018 — Coverage Types

**Archivo**: `src/modules/strategies/coverage/coverageTypes.ts`

- `estimateOptionPremium` con IV=0.25, DTE=90

### RF-019 — Institutional Copilot Chat (Gemini 2.5 Flash)

**Archivo**: `src/modules/ai/institutionalCopilotChat.ts`

- Modelo: Gemini 2.5 Flash
- `submit(context)`: síncrono si responde en p95≤5s, async si excede
- `poll(responseId)`: consulta estado de respuesta async
- Polling: cada 2s, timeout 30s, máximo 15 intentos
- `ai_unavailable` flag: si Gemini no responde
- Trazabilidad por respuesta: `context_id`, `strategy_id`, `evidence_ids[]`, `model_version`, `response_hash` (SHA256), `timestamp`
- `inferAIRole`: mapea admin/trader → analyst, cualquier otro → risk_manager
- Solo lectura, nunca ejecuta operaciones

### RF-020 — Routes Institutional

**Archivos**:
- `src/routes/institutional/bootstrap.ts`
- `src/routes/institutional/institutionalAnalysis.ts`
- `src/routes/institutional/regulatoryPositions.ts`

**POST /api/institutional/analysis**:
- Valida: ticker, period, horizon
- Ejecuta Zones + Trend + Expiration engines en paralelo
- `preResolvedResult` compartido (resolve() solo 1 vez por request)
- `overallStatus: ok/partial/all_failed` → HTTP 200/206/503

**POST /api/institutional/positions**:
- Retorna posiciones abiertas, flujos, datos 13F
- Mismo patrón de degradación parcial

**Auth**: `authContextMiddleware`, roles analyst/risk_manager/trader

**Respuesta 503**: `{ code:"ALL_SOURCES_UNAVAILABLE", sourceReports:[] }`
**Respuesta 400**: `{ code:"INSTITUTIONAL_ANALYSIS_FAILED"|"INSTITUTIONAL_POSITIONS_FAILED", message }`

### RF-021 — Routes Coverage

**Archivos**:
- `src/routes/coverage/analyze.ts`
- `src/routes/coverage/simulate.ts`
- `src/routes/coverage/compare.ts`

**POST /api/coverage/analyze**:
- Roles: analyst, risk_manager, trader
- Defaults: price=450, expiry=90d, shares=100, capital=100000, risk=5%
- Strikes: put=95%*price, call=105%*price
- `estimatePremium` con IV=0.25, DTE=90
- Retorna `{ results: CoverageStrategyResult[], generatedAt }`

**POST /api/coverage/simulate**:
- Crea contract protective_put y ejecuta CoverageSimulationEngine
- Retorna CoverageSimulationResult

**POST /api/coverage/compare**:
- Ejecuta CoverageComparator.compare() con 4 estrategias
- Retorna CoverageComparisonResult

**Errores**: FORBIDDEN_ROLE (403), INVALID_TICKER/PRICE/SHARES (400)

### RF-022 — Routes AI Copilot

**Archivo**: `src/routes/ai/institutionalCopilot.ts`

**POST /api/ai/institutional-chat**:
- Valida: ticker, currentPrice, zones, question
- `userRole`: del body o inferido de `authContext.role`
- Si pending → HTTP 202 con pollingUrl y retryAfterSeconds
- Si completed → HTTP 200 con narrative, reasoning, scenarioAnalysis, recommendation, evidenceIds, modelVersion, responseHash
- Error → HTTP 500 con `ai_unavailable:true`

**GET /api/ai/institutional-chat/poll/:responseId**:
- pending → 202, completed → 200, error → 500

## Alcance No Funcional

- FIC: comments bilingüe EN/ES en todos los archivos
- p95 ≤ 5s para análisis completo, fallback async con polling 2s/30s/15 intentos
- Cobertura de tests mínima 80% en rutas críticas
- Retención de trazas 365 días
- Escala confidence: siempre [0.00, 1.00], nunca 0-100
- Error codes estandarizados: HTTP_ERROR, TIMEOUT, RATE_LIMITED, EMPTY_RESPONSE, PARSE_ERROR
- Degradación parcial: respuesta con fuentes disponibles, no bloqueo total
- Solo roles analyst, risk_manager, trader acceden a endpoints
- No auto-trading, no ejecución automática

## Restricciones

- Se mantiene la arquitectura semi-automática constitucional (restricción constitucional).
- No modificar artefactos canónicos globales: `001-inv-spec.md`, `001-inv-plan.md` ni `001-inv-tasks.md`.
- La IA no ejecuta operaciones y no sustituye el juicio humano.
- Cumplir con `diana-inversions-constitution v1.1.0`.
- Backend: Node.js + Express + TypeScript.
- PWA: React + Vite + TypeScript.
- Separación estricta PWA / REST API.
- Arquitectura modular por features.
- Comentarios con prefijo `FIC:` (bilingüe EN/ES) en todo código generado.
- Solo roles analyst, risk_manager, trader pueden acceder a endpoints de cobertura.

## Dependencias

- Código fuente de referencia en repo local de TEAM-05 (specs/006-team-05-institucional-cobertura/).
- Node.js ≥ 18.
- Variables de entorno: `EDGAR_USER_AGENT`, `GEMINI_API_KEY`.

## Riesgos y Mitigaciones

- Riesgo: Diferencias entre código local y especificación documentada → Mitigación: verificación contra repo local antes de marcar tareas como completadas.
- Riesgo: Fuentes upstream cambian API → Mitigación: parsers con timeouts y fallbacks, confidence baja para fallbacks sintéticos.
- Riesgo: Colisión de tasks con specs existentes → Mitigación: tasks numeradas T1000+ fuera del rango T106-T911.

## Próximos pasos

1. Ejecutar `/speckit.implement` contra el repositorio principal.
2. Verificar que los 27 archivos se crean correctamente.
3. Ejecutar tests de integración para validar endpoints.
