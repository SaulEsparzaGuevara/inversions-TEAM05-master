# TEAM-05 "TurboPapus" — Informe Completo de Implementación

## Resumen

Implementación del feature **006-team-05-institucional-cobertura** para análisis institucional y estrategias de cobertura (Protective Put, Married Put, Collar Put, Covered Straddle) con Chat IA explicativo vía Gemini.

**Pipeline**: Diana → Speckit (specify → clarify → plan → tasks → implement)

---

## 1. Configuración Inicial

### Problema: npm install fallaba en WSL

El proyecto estaba en `/mnt/c/` (Windows) y npm no funcionaba correctamente con WSL.

**Solución**: Movimos el proyecto a filesystem nativo de WSL y usamos `nvm` para instalar Node.js.

```bash
# Verificar ubicación actual y permisos
ls -la /mnt/c/
# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
```

### Problema: speckit.plan pedía PowerShell (pwsh)

```bash
# Instalar pwsh en Ubuntu
sudo apt-get update && sudo apt-get install -y wget apt-transport-https software-properties-common
wget -q "https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/packages-microsoft-prod.deb"
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update && sudo apt-get install -y powershell
```

---

## 2. Pipeline Diana → Speckit

### speckit.specify
```
/speckit.specify
```
- Generó `specs/006-team-05-institucional-cobertura/spec.md` desde el canon Diana
- Definió alcance funcional (RF-001 a RF-006) y no funcional (RNF-001 a RNF-006)

### speckit.clarify — 5 preguntas resueltas

```
/speckit.clarify
```

| # | Pregunta | Decisión |
|---|----------|----------|
| Q1 | ¿Trazabilidad del Chat IA? | Completa: `context_id`, estrategia, evidencia, timestamp, model_version, hash |
| Q2 | ¿Latencia del flujo completo? | p95 ≤ 5s con fallback async (polling 2s, timeout 30s, max 15 intentos) |
| Q3 | ¿Roles de acceso? | Solo `analyst` y `risk_manager` |
| Q4 | ¿Degradación ante falla IA? | Devolver cálculo + flag `ai_unavailable` |
| Q5 | ¿Retención de trazas? | 365 días |

Archivo generado: `TEAM-05_clarify_session.md`

### speckit.checklist
```
/speckit.checklist
```
- Validó 16 ítems de calidad del plan (CHK001-CHK016)

### speckit.plan
```
/speckit.plan
```
- Generó `specs/006-team-05-institucional-cobertura/plan.md` con diseño de ejecución por flujos

### speckit.tasks
```
/speckit.tasks
```
- Generó `specs/006-team-05-institucional-cobertura/tasks.md` con T106-T121 + derivadas T200-T210

---

## 3. Migración NodeNext (CommonJS → ESM)

El `tsconfig.json` usaba `CommonJS`/`node`. Lo migramos a `NodeNext`/`NodeNext` para compatibilidad moderna.

**Cambios en `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

**Actualización de imports:** Todos los imports relativos ahora usan extensión `.js`:
```typescript
// Antes
import { algo } from "./modulo";
// Después
import { algo } from "./modulo.js";
```

---

## 4. Implementación — Fase 1 (Contratos y Servicios Base)

### T106 — Contrato de Parámetros Institucionales

**Archivo**: `src/modules/institutional/institutionalContract.ts`

Define tipos y validadores para el análisis institucional:
- `InstitutionalAnalysisPeriod`: "intraday" | "daily" | "weekly" | "monthly" | "quarterly"
- `InstitutionalHorizon`: "short" | "medium" | "long"
- `InstitutionalLiquidity`: "low" | "medium" | "high"
- `InstitutionalAnalysisContract`: contrato completo con ticker, strikes, volumen, flujos, posiciones
- Factory: `createInstitutionalAnalysisContract()` con validación via type guard

### T107 — Servicio de Datos Institucionales

**Archivo**: `src/modules/institutional/institutionalDataService.ts`

Consume 4 fuentes externas reales:
1. SEC EDGAR 13F — tenencias de fondos institucionales
2. FINRA Short Interest — posiciones cortas
3. Yahoo Options Flow — flujo de opciones (reemplaza Unusual Whales)
4. Yahoo Institutional — ownership institucional (reemplaza Finviz)

Características:
- Cache configurable por fuente (TTL por source)
- Rate limiting (30 req/min por fuente)
- Fallback y degradación: si una fuente falla, continúa con las demás
- **Graceful degradation**: `overallStatus` (ok/partial/all_failed), HTTP 503
- Normalización de respuestas a `InstitutionalSourceObservation`

### T113 — Contrato de Estrategias de Cobertura

**Archivo**: `src/modules/strategies/coverage/coverageStrategyContract.ts`

Define:
- `CoverageStrategyKind`: "protective_put" | "married_put" | "collar_put" | "covered_straddle"
- `CoverageOptionLeg`: side, type, strike, premium, expiration
- `CoverageStrategyContract`: strategyId, ticker, shares, legs, capital, riskTolerancePct
- Validadores: `isCoverageOptionLeg()`, `isCoverageStrategyContract()`
- Factory: `createCoverageStrategyContract()`

### T200 — Contratos JSON de API (3 schemas)

**Archivos**: `specs/006-team-05-institucional-cobertura/api/contracts/coverage/`
- `institutional_context.v1.json`
- `strategy.v1.json`
- `explanation.v1.json`

---

## 5. Implementación — Fase 2 (Motores de Análisis)

### T108 — Motor de Zonas Institucionales

**Archivo**: `src/modules/institutional/institutionalZonesEngine.ts`

- Detecta pivotes de soporte/resistencia desde datos de velas
- Clustering de zonas cercanas (tolerance configurable, default 1.25%)
- Scoring de fortaleza: peso institucional + volumen + toques históricos
- `maxZones` configurable (default 8)

---

## 6. Implementación — Fase 3 (APIs REST)

### T111 — API de Análisis Institucional

**Archivo**: `src/routes/institutional/institutionalAnalysis.ts`

```
GET /api/institutional/analysis?ticker=SPY&period=daily&horizon=medium
```

Middleware: `authContextMiddleware`

Respuesta:
```json
{
  "request": { "ticker": "SPY", "period": "daily", "horizon": "medium" },
  "analysis": { ... },
  "zones": { "all": [], "support": [], "resistance": [] },
  "trends": { "direction": "bullish", "score": 0.75, "confidence": 0.72 },
  "metrics": { "zoneCount": 6, "averageZoneStrength": 0.68 },
  "sourceReports": [],
  "generatedAt": "2026-..."
}
```

### T112 — API de Posiciones Regulatorias

**Archivo**: `src/routes/institutional/regulatoryPositions.ts`

```
GET /api/institutional/positions?ticker=SPY&period=daily&horizon=medium
```

Retorna posiciones 13F, flujos institucionales y reportes de cada fuente.

### Bootstrap (fábrica compartida)

**Archivo**: `src/routes/institutional/bootstrap.ts`

- Singleton: `InstitutionalDataService` + `InstitutionalZonesEngine`
- Fetch real vía `globalThis.fetch` (mock infrastructure eliminada en T340)
- 4 fuentes reales: SEC EDGAR, FINRA, Yahoo Options, Yahoo Institutional
- Funciones helper: `buildInstitutionalAnalysisContractFromRequest()`, `groupInstitutionalZones()`,
  `buildInstitutionalTrendSummary()`, `buildInstitutionalMetricsSummary()`

Montaje en `index.ts`:
```typescript
import { institutionalAnalysisRouter } from "./routes/institutional/institutionalAnalysis.js";
import { regulatoryPositionsRouter } from "./routes/institutional/regulatoryPositions.js";

app.use("/api/institutional", institutionalAnalysisRouter);
app.use("/api/institutional", regulatoryPositionsRouter);
```

---

## 7. Implementación — Fase 4 (Estrategias de Cobertura)

### coverageTypes.ts — Tipos Compartidos

**Archivo**: `src/modules/strategies/coverage/coverageTypes.ts` (641 líneas)

Define:
- `Alert`: código, severidad, mensaje, recomendación
- `PayoffPoint`: punto de payoff con PnL y notas
- `PayoffSimulation`: simulación completa con breakeven, maxProfit, maxLoss
- `RiskMetrics`: perfil de riesgo, protección, primas, stop-loss, margen
- `CoverageStrategyResult`: resultado unificado de cualquier estrategia
- +15 interfaces más para simulación, reportes, comparación, etc.
- Type guards y factories para cada interfaz

### T114 — Protective Put / Married Put

**Archivo**: `src/modules/strategies/coverage/protectivePutEngine.ts`

```bash
# Comando a Copilot
Implementa T114 del tasks.md: protectivePutEngine.ts con:
- Cálculo de protección máxima (strike - precio actual)
- Simulación de escenarios de caída del subyacente
- Análisis costo-beneficio de cobertura
- Alertas de ejercicio anticipado y stop-loss
```
- `ProtectivePutEngine.analyze(contract)`: recibe `CoverageStrategyContract`, devuelve `CoverageStrategyResult`
- Soporta `protective_put` y `married_put`
- Payoff simulation con 9 puntos (-20% a +20%)
- Alertas: ejercicio anticipado, proximidad a stop-loss

### T115 — Collar Put

**Archivo**: `src/modules/strategies/coverage/collarEngine.ts`

```bash
# Comando a Copilot
Implementa T115 del tasks.md: collarEngine.ts con:
- Simulación de rango de protección (put) y techo de ganancia (call)
- Cálculo de costo neto (prima put - prima call)
- Proyección de payoff en tiempo real
- Stop-loss automático si rompe el rango
```
- Busca put long + call short automáticamente
- Collar "zero-cost" si las primas se cancelan
- Stop-loss en ambos lados del rango

### T116 — Covered Straddle

**Archivo**: `src/modules/strategies/coverage/coveredStraddleEngine.ts`

```bash
# Comando a Copilot
Implementa T116 del tasks.md: coveredStraddleEngine.ts con:
- Cálculo de ingresos por primas vendidas
- Simulación de alta volatilidad y riesgo ilimitado
- Cuantificación de pérdidas en movimientos fuertes
- Alertas de margen y stop-loss
```
- Short put + short call sobre posición long de acciones
- Cálculo de margen requerido (regla T)
- Stop-loss en lado put y call
- Riesgo: unlimited (perfil `unlimited`)

### T117 — Motor de Simulación Avanzada

**Archivo**: `src/modules/strategies/coverage/coverageSimulationEngine.ts`

```bash
# Comando a Copilot
Implementa T117 del tasks.md: coverageSimulationEngine.ts con:
- Monte Carlo: 10,000 iteraciones con distribución normal
- Escenarios determinísticos (subida/bajada %)
- Backtesting con datos históricos
- Payoff projection para las 3 estrategias
```
- `CoverageSimulationEngine.run()` devuelve `CoverageSimulationResult`
- Modos: "deterministic" | "monte_carlo" | "backtest"
- Summary: expectedPnL, median, worst, best, VaR95, Shortfall95

### T118 — Servicio de Alertas y Riesgos

**Archivo**: `src/modules/strategies/coverage/coverageRiskService.ts`

```bash
# Comando a Copilot
Implementa T118 del tasks.md: coverageRiskService.ts con:
- Stop-loss automático configurable
- Alertas de margen
- Notificaciones push/email (stub)
```
- Evalúa si stop-loss debe activarse
- Verifica margen contra capital disponible
- Genera acciones y registros de notificación

### T119 — Módulo de Reporting

**Archivo**: `src/modules/strategies/coverage/coverageReportService.ts`

```bash
# Comando a Copilot
Implementa T119 del tasks.md: coverageReportService.ts con:
- Resumen de resultados por estrategia
- Estadísticas de riesgo/beneficio
- Logs de simulación
- Reportes exportables (json, md, csv)
```
- `CoverageReportService.generate()` produce resumen + exportaciones

### T120 — Comparador de Estrategias

**Archivo**: `src/modules/strategies/coverage/coverageComparator.ts`

```bash
# Comando a Copilot
Implementa T120 del tasks.md: coverageComparator.ts que evalúa:
- Protective Put, Collar Put, Covered Straddle
- P&L esperado, costo neto, nivel de riesgo, contexto multi-core
- Recomienda la estrategia más adecuada
```
- Scoring en 4 dimensiones (pnl, costEfficiency, risk, contextFit)
- Ranking automático
- `recommendedKind` en el resultado

---

## 8. Implementación — Fase 5 (Chat IA con Gemini)

### T121 — Chat IA Institucional

**Iteración 1**: Servicio con templates (sin LLM real)
```
/speckit.implement
Implementa T121: chat IA con templates, evidence extraction, roles, degradation
```

**Iteración 2**: Migración a Gemini real
```
/speckit.implement
Reescribe institutionalCopilotChat.ts para usar Gemini Free API:
1. Leer GEMINI_API_KEY de process.env
2. POST a Gemini con fetch nativo
3. Timeout 30s via AbortController
4. Parsear respuesta JSON estructurada
5. Traceability completa
```

**Iteración 3**: Polling async + persistencia + tests
```
/speckit.implement
Completa tareas pendientes:
1. T121: polling async (POST → 202 + pollingUrl, GET /poll/:responseId)
2. T201: migración SQL (3 tablas)
3. T202: purge job 365 días
4. T184-T186: tests
```

**Iteración 4**: T203-T210 (métricas, fixtures, resiliencia, docs)
```
/speckit.implement
Implementa T203-T210:
- coverageMetrics.ts
- Fixtures A/B/C
- reconstruct_explanation.ts
- validate-contract-compat.sh
- Contract tests
- Resiliencia (retry, stale, partial)
- retention.md
```

#### Archivos del Chat IA:

**Servicio**: `src/modules/ai/institutionalCopilotChat.ts`

```typescript
export class InstitutionalCopilotChat {
  private readonly modelVersion = "gemini/gemini-2.5-flash";
  private readonly endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
  private readonly initialDecisionWindowMs = 5_000; // 5s para sync
  private readonly pollingIntervalMs = 2_000;       // 2s entre polls
  private readonly maxPollingAttempts = 15;         // max 15 intentos
  private readonly jobTtlMs = 30_000;               // timeout 30s
  private readonly jobs = new Map<string, InstitutionalCopilotJob>();

  async chat(context): Promise<InstitutionalCopilotSubmissionResponse>
  async submit(context): Promise<InstitutionalCopilotSubmissionResponse>
  async poll(responseId): Promise<InstitutionalCopilotResponse | InstitutionalCopilotAcceptedResponse>
}
```

**Flujo**:
1. `POST /api/ai/institutional-chat` → `submit()`
2. Si Gemini responde en ≤5s → devuelve respuesta directa
3. Si Gemini tarda >5s → devuelve 202 con `pollingUrl`
4. `GET /api/ai/institutional-chat/poll/:responseId` → `poll()`
5. Si completó → devuelve `InstitutionalCopilotResponse`
6. Si aún procesando → devuelve 202 con `retryAfterSeconds: 2`
7. Si expiró (30s) → `ai_unavailable: true`

**Router**: `src/routes/ai/institutionalCopilot.ts`

```typescript
POST /api/ai/institutional-chat     → submit con Gemini
GET  /api/ai/institutional-chat/poll/:responseId → poll result
```

**Montaje**: `src/index.ts`
```typescript
import institutionalCopilotRouter from "./routes/ai/institutionalCopilot.js";
app.use("/api/ai", institutionalCopilotRouter);
```

**Problemas resueltos del modelo Gemini:**
1. `gemini-2.0-flash`: quota excedida (429)
2. `gemini-flash-latest`: no soporta `responseMimeType: "application/json"`, devolvía markdown
3. Solución final: `gemini-2.5-flash` con `responseMimeType: "application/json"` y `maxOutputTokens: 8192`

---

## 9. Implementación — Fase 6 (Hardening)

### T173 — Ajuste Transversal

**Archivo**: `src/modules/strategies/coverage/coverageStrategyAdapter.ts`

Adapta `CoverageStrategyResult` al estándar transversal `StrategyOutput`:
```typescript
export function coverageResultToStrategyOutput(
  result: CoverageStrategyResult, traceId?: string
): StrategyOutput
```
- Usa `StrategySource.MECANICO`, `RecommendationType.COBERTURAS`
- Construye `ScoreBreakdown` desde riskMetrics
- Mapea alerts → `EvidenceMetadata[]`

### T184 — Tests Unitarios Institucionales

**Archivos**: `tests/unit/institutional/`
- `institutionalContract.test.ts` — validación de contratos
- `institutionalZonesEngine.test.ts` — detección de pivotes, clustering, scoring

### T185 — Tests Unitarios de Cobertura

**Archivos**: `tests/unit/strategies/coverage/`
- `protectivePutEngine.test.ts` — payoff, riskMetrics, alerts
- `collarEngine.test.ts` — rango, costo neto, stop-loss
- `coveredStraddleEngine.test.ts` — primas, margen, riesgo ilimitado
- `coverageComparator.test.ts` — ranking, recomendación

### T186 — Tests de Integración

**Archivos**: `tests/integration/institutional/`
- `institutionalAnalysis.test.ts` — GET /api/institutional/analysis con supertest
- `regulatoryPositions.test.ts` — GET /api/institutional/positions con supertest

### T201 — Persistencia (Migración SQL)

**Archivo**: `src/database/supabase/migrations/008_institutional_copilot.sql`

```sql
CREATE TABLE institutional_contexts (
  "contextId" text PRIMARY KEY,
  ticker text NOT NULL,
  "currentPrice" numeric(18,6),
  zones jsonb,
  "coverageStrategies" jsonb,
  question text,
  "userRole" text CHECK ("userRole" IN ('analyst', 'risk_manager')),
  "requestedAt" timestamptz,
  "createdAt" timestamptz DEFAULT now()
);

CREATE TABLE evidence_blobs (
  "evidenceId" text PRIMARY KEY,
  "contextId" text REFERENCES institutional_contexts("contextId") ON DELETE CASCADE,
  "sourceType" text, label text, value text,
  "createdAt" timestamptz DEFAULT now()
);

CREATE TABLE explanation_responses (
  "responseId" text PRIMARY KEY,
  "contextId" text REFERENCES institutional_contexts("contextId") ON DELETE CASCADE,
  narrative text, reasoning jsonb, "scenarioAnalysis" jsonb,
  recommendation text, "evidenceIds" jsonb,
  "modelVersion" text, "responseHash" text UNIQUE,
  ai_unavailable boolean DEFAULT false,
  "timestamp" timestamptz, "createdAt" timestamptz DEFAULT now()
);
```

### T202 — Purge Job (365 días)

**Archivo**: `src/jobs/purgeEvidenceJob.ts`

```typescript
export async function purgeEvidenceJob(options = {}): Promise<PurgeEvidenceJobResult>
```
- `retentionDays` configurable (default 365)
- Purge secuencial: institutional_contexts → evidence_blobs → explanation_responses
- Logging de conteo purgado

### T203 — Métricas

**Archivo**: `src/observability/coverageMetrics.ts`

```typescript
export function recordLatency(flow: string, ms: number): void
export function recordP95(ms: number): void
export function incrementUnavailableCount(): void
export function incrementPollingAttempts(): void
```
- Tags: flow, endpoint, region
- Stub para Prometheus/StatsD (console.log)

### T204 — Fixtures de Pruebas

**Archivos**: `tests/fixtures/coverage/`
- `fixture-A-nominal.json`: SPY-like, high liquidity, normal volatility
- `fixture-B-stress-tail.json`: 25% drop, IV spike, low liquidity
- `fixture-C-low-liquidity.json`: low ADV, wide spreads
- `index.ts`: exports centralizados

### T205 — Reconstrucción de Auditoría

**Archivo**: `tools/reconstruct_explanation.ts`

CLI tool: `npx tsx tools/reconstruct_explanation.ts <context_id>`
- Busca context + evidence + response
- Recalcula response_hash y compara con stored
- Produce audit bundle JSON

### T206 — Validación de Contratos (Script)

**Archivo**: `scripts/validate-contract-compat.sh`

Bash script que verifica compatibilidad backwards de schemas JSON.

### T207 — Tests de Contratos

**Archivo**: `tests/unit/contracts/coverageContract.test.ts`

Valida presencia de `$schema` y `examples` en contratos JSON.

### T208 — Resiliencia

**Archivos**: `src/lib/resilience/`
- `retryWithBackoff.ts`: exponential backoff con jitter, maxAttempts configurable
- `staleInput.ts`: flag y handler para inputs stale
- `partialDataHandler.ts`: merge de datos parciales con defaults

### T209 — Catálogo de Escenarios Extremos

**Archivo**: `specs/006-team-05-institucional-cobertura/catalogs/market-scenarios.md`

7 escenarios (ST-01 a ST-07): crash relámpago, gap de liquidez, IV skew extremo, etc.

### T210 — Documentación de Retención

**Archivo**: `ops/docs/retention.md`

Storage tiering (hot 0-30d, warm 31-180d, cold 181-365d), KMS encryption, purge process.

---

## 10. Configuración de Gemini API

### Obtener API Key
1. Ir a https://aistudio.google.com/apikey
2. Crear API key sin restricciones
3. Agregar al `.env`:

```bash
# projects/rest-api/inversions_api/.env
GEMINI_API_KEY=AIzaSy...
```

### Modelo utilizado
- **Modelo**: `gemini-2.5-flash` (soporta `responseMimeType: "application/json"`)
- **Tokens máximos**: 8192 (necesario para respuestas completas)
- **Timeout**: 30s con AbortController
- **Polling**: 2s interval, 15 max attempts

---

## 11. Problemas Técnicos Resueltos

| Problema | Síntoma | Solución |
|----------|---------|----------|
| npm no funcionaba en WSL | errores de permisos | Mover proyecto a filesystem nativo, instalar nvm |
| ts-node no soporta NodeNext | `MODULE_NOT_FOUND` con imports `.js` | Reemplazar `ts-node` por `tsx` en script `dev` |
| `.env` propiedad de root | `EACCES: permission denied` al editar | `rm` + `write` tool |
| Gemini 2.0-flash quota excedido | HTTP 429 | Cambiar a `gemini-2.5-flash` |
| Gemini-flash-latest no devuelve JSON | markdown en vez de JSON | No soporta `responseMimeType`, migrar a 2.5-flash |
| Respuesta truncada | JSON inválido, `finishReason: MAX_TOKENS` | Aumentar `maxOutputTokens` de 2048 a 8192 |
| Archivos en directorio incorrecto | Lint pasaba pero archivos en raíz del monorepo | Mover a `projects/rest-api/inversions_api/` |

---

## 12. Resultados Finales

### Tests

```
npm test → 32 suites, 158 tests, 0 failures (55 solo institucionales)
npm run lint → EXIT_CODE: 0
```

### Desglose de Tests

| Grupo | Archivos | Tests |
|-------|----------|-------|
| Unitarios institucionales | `tests/unit/institutional/` | 12 |
| Unitarios cobertura | `tests/unit/strategies/coverage/` | 45+ |
| Unitarios resiliencia | `tests/unit/resilience/` | **21** (nuevos en Fase 3) |
| Integración institucional | `tests/integration/institutional/` | **18** (nuevos en Fase 5) |
| Unitarios contratos | `tests/unit/contracts/` | 3+ |
| Frontend | `tests/` del PWA | varios |
| **Total** | **32 suites** | **158 tests, 0 fallos** |
