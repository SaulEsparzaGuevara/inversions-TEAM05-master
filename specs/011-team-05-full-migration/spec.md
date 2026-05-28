# Spec: 011-team-05-full-migration

- **Feature**: 011-team-05-full-migration
- **Equipo**: TEAM-05 (TurboPapus)
- **Tipo**: Master Migration Spec — fuente única de verdad
- **Última actualización**: 2026-05-28
- **Estado**: READY_FOR_IMPLEMENTATION

## Resumen

Migración y homologación completa del trabajo de TEAM-05 al repositorio principal. Este spec consolida en un único documento todo lo desarrollado de forma independiente por el equipo: 28 archivos backend (~7,600 líneas), 16 archivos frontend (~4,200 líneas), 22 tests, y 8 correcciones de auditoría técnica post-implementación.

Copia esta carpeta al repo principal y ejecuta las tasks en orden para replicar el 100% del trabajo del equipo.

## Specs Predecesoras (solo referencia)

| Spec | Contenido | Estado |
|------|-----------|--------|
| `006-team-05-institucional-cobertura` | Diseño original del módulo backend | Completado localmente |
| `007-team-05-frontend-cobertura` | Diseño del frontend PWA | Completado localmente |
| `008-team-05-cobertura-bugfix-visual` | Bugfixes de CollarEngine y PayoffChart | Completado localmente |
| `009-team-05-institucional-migration` | Inventario as-is del backend | Referencia |
| `010-team-05-audit-bugfix-engines` | Auditoría técnica y correcciones post-merge | Completado localmente |

---

## Alcance Total

### Backend REST API (`projects/rest-api/inversions_api/`)

#### Módulo Institutional (9 archivos)

| Archivo | Descripción | FIC |
|---------|-------------|-----|
| `src/modules/institutional/institutionalContract.ts` | Contratos y type guards del análisis institucional | T106 |
| `src/modules/institutional/institutionalDataService.ts` | Servicio de datos multi-fuente con cache, rate limit, merge paralelo | T107 |
| `src/modules/institutional/realSourceParsers.ts` | Parsers reales SEC EDGAR 13F + FINRA Short Interest | T107b |
| `src/modules/institutional/yahooCrumbSession.ts` | Sesión de crumb/cookie para Yahoo Finance | T340b |
| `src/modules/institutional/yahooOptionsParser.ts` | Parser Yahoo Finance v7 options flow | T338 |
| `src/modules/institutional/yahooInstitutionalParser.ts` | Parser Yahoo Finance v10 institutional ownership | T339 |
| `src/modules/institutional/institutionalZonesEngine.ts` | Motor de zonas S/R institucionales | T108 |
| `src/modules/institutional/institutionalTrendEngine.ts` | Motor de tendencias SMA-50/200 con PRNG seeded | T109 |
| `src/modules/institutional/expirationAnalysisEngine.ts` | Motor de análisis de vencimientos y catalizadores | T110 |

#### Módulo Coverage (9 archivos)

| Archivo | Descripción | FIC |
|---------|-------------|-----|
| `src/modules/strategies/coverage/coverageStrategyContract.ts` | Contratos y validadores de estrategias de cobertura | T113 |
| `src/modules/strategies/coverage/coverageTypes.ts` | Tipos, Black-Scholes `normalCdf` (corregida), `RiskMetrics` | T505 |
| `src/modules/strategies/coverage/coverageStrategyAdapter.ts` | Adaptador contrato → engine → response | T173 |
| `src/modules/strategies/coverage/protectivePutEngine.ts` | Engine Protective Put / Married Put | T114 |
| `src/modules/strategies/coverage/collarEngine.ts` | Engine Collar con `stopLossLowPrice` + `stopLossHighPrice` | T115 |
| `src/modules/strategies/coverage/coveredStraddleEngine.ts` | Engine Covered Strangle (kind=covered_straddle) | T116 |
| `src/modules/strategies/coverage/coverageSimulationEngine.ts` | Monte Carlo 256 iter, skip MC con `monteCarloIterations=0` | T117 |
| `src/modules/strategies/coverage/coverageRiskService.ts` | Evaluación de riesgo, notificaciones paralelas | T118 |
| `src/modules/strategies/coverage/coverageReportService.ts` | Reports JSON + MD, `precomputed` para skip re-análisis | T119 |
| `src/modules/strategies/coverage/coverageComparator.ts` | Comparador de 4 estrategias con ranking | T120 |

#### Módulo AI (1 archivo)

| Archivo | Descripción | FIC |
|---------|-------------|-----|
| `src/modules/ai/institutionalCopilotChat.ts` | Chat Gemini 2.5 Flash, polling async, `ai_unavailable` flag | T121 |

#### Rutas REST (7 archivos + 1 modificación)

| Archivo | Endpoint(s) | FIC |
|---------|-------------|-----|
| `src/routes/institutional/bootstrap.ts` | Configuración singleton de 4 fuentes + 3 engines | T340 |
| `src/routes/institutional/institutionalAnalysis.ts` | `GET /api/institutional/analysis` | T111 |
| `src/routes/institutional/regulatoryPositions.ts` | `GET /api/institutional/positions` | T112 |
| `src/routes/coverage/analyze.ts` | `POST /api/coverage/analyze` | T304 |
| `src/routes/coverage/simulate.ts` | `POST /api/coverage/simulate` | T306 |
| `src/routes/coverage/compare.ts` | `POST /api/coverage/compare` | T305 |
| `src/routes/ai/institutionalCopilot.ts` | `POST /api/ai/institutional-chat`, `GET /api/ai/institutional-chat/poll/:id` | T121b |
| `src/routes/dashboard/confluenceViewPresets.ts` | `GET /api/dashboard/confluence-columns` (fix: usar `createAuthenticatedClient`) | T1035 |
| `src/index.ts` | Registrar rutas institucionales, coverage, AI | T1026 |

#### Correcciones de Auditoría (8 fixes)

| Archivo | Fix | Ref |
|---------|-----|-----|
| `coverageTypes.ts` | `normalCdf`: `φ(x)` no `(1-φ(x))` | T1100 |
| `coverageTypes.ts` + `collarEngine.ts` | `stopLossLowPrice` + `stopLossHighPrice` en `RiskMetrics` | T1101 |
| `institutionalTrendEngine.ts` | `buildFallbackCandles` con PRNG seeded (LCG) | T1102 |
| `expirationAnalysisEngine.ts` | CPI → 2do martes (distinto de FOMC 2do miércoles) | T1103 |
| `expirationAnalysisEngine.ts` | Triple Witching: dedup evento `quarterly_opex` | T1104 |
| `expirationAnalysisEngine.ts` | Sesgo estacional: Sep bearish, Oct neutral, Nov-Dic bullish | T1105 |
| `protectivePutEngine.test.ts` | `riskTolerancePct: 0` para activar `STOP_LOSS_TRIGGERED` | T1106 |
| `confluenceViewPresets.ts` | Usar `createAuthenticatedClient` en `/confluence-columns` | T1107 |

---

### Frontend PWA (`projects/pwa/inversions_app/`)

#### Infraestructura (5 archivos)

| Archivo | Descripción |
|---------|-------------|
| `src/main.tsx` | Actualización: `BrowserRouter` + rutas nuevas |
| `src/layouts/MainLayout.tsx` | Layout compartido con sidebar de navegación |
| `src/store/chat.ts` | Store IA con `useSyncExternalStore` |
| `src/services/signals/signalApi.ts` | Actualización: memoize `getAuthHeaders()` |
| `src/services/apiCache.ts` | Cache in-memory con TTL configurable |

#### Servicios API (3 archivos)

| Archivo | Endpoints consumidos |
|---------|---------------------|
| `src/services/institutional/institutionalApi.ts` | `/api/institutional/analysis`, `/api/institutional/positions` |
| `src/services/coverage/coverageApi.ts` | `/api/coverage/analyze`, `/api/coverage/compare`, `/api/coverage/simulate` |
| `src/services/ai/aiChatApi.ts` | `POST /api/ai/institutional-chat`, `GET /api/ai/institutional-chat/poll/:id` |

#### Páginas (4 archivos)

| Archivo | Ruta |
|---------|------|
| `src/pages/institutional/InstitutionalAnalysisPage.tsx` | `/institutional/analysis` |
| `src/pages/institutional/RegulatoryPositionsPage.tsx` | `/institutional/positions` |
| `src/pages/coverage/CoverageStrategiesPage.tsx` | `/coverage/strategies` |
| `src/pages/ai/AIChatPage.tsx` | `/ai/chat` |

#### Componentes (4 archivos)

| Archivo | Descripción |
|---------|-------------|
| `src/components/coverage/PayoffChart.tsx` | Gráfico payoff con `lightweight-charts`, eje X en precios reales |
| `src/components/ai/ChatHistory.tsx` | Historial del chat IA |
| `src/components/ai/ScenarioAnalysisCards.tsx` | Cards de análisis de escenarios |
| `src/components/ui/Tooltip.tsx` | Componente tooltip reutilizable |

#### Tests (9 archivos)

| Archivo | Scope |
|---------|-------|
| `tests/pages/InstitutionalAnalysisPage.test.tsx` | Render, loading, error, data |
| `tests/pages/RegulatoryPositionsPage.test.tsx` | Render, 13F table, flows |
| `tests/pages/CoverageStrategiesPage.test.tsx` | Render, payoff chart |
| `tests/pages/AIChatPage.test.tsx` | Render, polling, `ai_unavailable` |
| `tests/services/aiChatApi.test.ts` | Submit, poll, degradación |
| `tests/services/apiCache.test.ts` | TTL, hit/miss, `clearCache` |
| `tests/services/coverageApi.test.ts` | Analyze, compare, simulate + retry |
| `tests/services/institutionalApi.test.ts` | Analysis, positions + AbortController |

---

## APIs Externas Requeridas

| API | URL Base | Auth | Uso |
|-----|----------|------|-----|
| SEC EDGAR EFTS | `https://efts.sec.gov` | `User-Agent` header | 13F filings search |
| SEC EDGAR Archives | `https://www.sec.gov/Archives` | `User-Agent` header | Filing XML/JSON |
| FINRA Short Interest | `https://api.finra.org` | Ninguna | Short interest data |
| Yahoo Finance v1 | `https://query2.finance.yahoo.com/v1` | Cookie + crumb | Auth session |
| Yahoo Finance v7 | `https://query2.finance.yahoo.com/v7` | Cookie + crumb | Options chain |
| Yahoo Finance v10 | `https://query2.finance.yahoo.com/v10` | Cookie + crumb | Institutional ownership |
| Gemini 2.5 Flash | `https://generativelanguage.googleapis.com/v1beta` | `GEMINI_API_KEY` | AI analysis |

## Variables de Entorno Requeridas

```env
EDGAR_USER_AGENT=TurboPapus/1.0 (contact@turbopapus.com)
GEMINI_API_KEY=<obtener del proyecto TEAM-05>
AUTH_BYPASS=true                    # solo desarrollo
AUTH_BYPASS_USER_ID=dev-user
AUTH_BYPASS_TOKEN=dev-bypass-token
```

## Criterios de Aceptación Globales

- `npx tsc --noEmit` pasa sin errores en backend y frontend.
- `npx vitest run` → 32 test files, 158 tests pasando en backend.
- Frontend: todos los tests de páginas y servicios pasan.
- `GET /api/institutional/analysis?ticker=AAPL` retorna HTTP 200 con zonas, tendencias y catalizadores.
- `POST /api/coverage/analyze` con `{"ticker":"SPY","currentPrice":450,"shares":100}` retorna 4 estrategias con payoff válido.
- `POST /api/ai/institutional-chat` retorna HTTP 200 o 202 (polling).
- Las 4 rutas del frontend se renderizan sin errores en browser.
- `PayoffChart` muestra precios reales en eje X (no "1970").
- `normalCdf(0) ≈ 0.500` (±0.001).

## Restricciones

- No modificar artefactos canónicos globales: `001-inv-spec.md`, `001-inv-plan.md` ni `001-inv-tasks.md`.
- Backend: Node.js ≥ 18 + Express + TypeScript.
- Frontend: React + Vite + TypeScript, sin Tailwind ni Material UI.
- Comentarios FIC bilingüe EN/ES en todos los archivos nuevos generados.
- No auto-trading, no ejecución automática.
- Solo roles `analyst`, `risk_manager`, `trader` acceden a endpoints de cobertura.
- `kind="covered_straddle"` se mantiene en contratos (retrocompatibilidad).

## Trazabilidad

- Código fuente en rama `emiliano` del repo local TEAM-05.
- Auditoría técnica: `docs/TEAM-05-auditoria-specs-006-007.md`.
- Inventario as-is: `specs/009-team-05-as-is-code-inventory/report.md`.
