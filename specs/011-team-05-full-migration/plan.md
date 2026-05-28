# Plan de Implementación: 011-team-05-full-migration

## 1) Contexto y Autoridad

- **Feature**: `specs/011-team-05-full-migration/`
- **Equipo**: TEAM-05 (TurboPapus)
- **Iniciativa**: `001-inversions`
- **Engine**: Speckit (`stage=plan`)
- **Idioma**: es
- **Política de autoridad**: `diana_canon_strict`

Este plan consolida el trabajo completo de TEAM-05 en un único spec ejecutable. Las specs predecesoras (006, 007, 008, 009, 010) sirven de referencia; esta es la fuente única de verdad para la homologación al repo principal.

## 2) Fuentes Cargadas

- Inventario as-is: `specs/009-team-05-as-is-code-inventory/report.md`
- Spec institucional: `specs/009-team-05-institucional-migration/spec.md`
- Spec frontend: `specs/007-team-05-frontend-cobertura/spec.md`
- Auditoría técnica: `docs/TEAM-05-auditoria-specs-006-007.md`
- Spec vigente: `specs/011-team-05-full-migration/spec.md`

## 3) Objetivo

Replicar en el repositorio principal el 100% del trabajo desarrollado por TEAM-05: 20 módulos backend, 7 rutas REST, 1 módulo AI, 16 archivos frontend, 11 archivos de tests, y 8 correcciones de auditoría técnica.

## 4) Skills Requeridas

- `004-inv-options-strategy-engine`
- `007-inv-institutional-analysis`
- `011-inv-portfolio-and-performance-analytics`
- `012-inv-frontend-pwa` (React + Vite + TypeScript)

## 5) Diseño de Ejecución por Flujos

### Flujo A — Backend Core (Phases 1-4)

**Objetivo**: Contratos, data service, parsers reales, y los 3 engines institucionales.

| Task | Archivo | Bloqueante de |
|------|---------|---------------|
| T1000 | institutionalContract.ts | T1003, T1008-T1010 |
| T1001 | coverageStrategyContract.ts | T1011-T1017 |
| T1002 | coverageTypes.ts (**con normalCdf corregida**) | T1011-T1017 |
| T1003 | institutionalDataService.ts | T1008-T1010 |
| T1004 | realSourceParsers.ts | T1019 (bootstrap) |
| T1005 | yahooCrumbSession.ts | T1006, T1007 |
| T1006 | yahooOptionsParser.ts | T1019 |
| T1007 | yahooInstitutionalParser.ts | T1019 |
| T1008 | institutionalZonesEngine.ts | T1020 |
| T1009 | institutionalTrendEngine.ts (**con seededRandom**) | T1020 |
| T1010 | expirationAnalysisEngine.ts (**con 3 bugfixes**) | T1020 |

**Bugs a integrar directamente** (no como parche posterior):
- T1100: normalCdf → en T1002
- T1101: stopLossLowPrice/High → en T1002 y T1012
- T1102: seededRandom → en T1009
- T1103-T1105: CPI, triple witching, sesgo estacional → en T1010

### Flujo B — Backend Coverage + AI (Phase 5-6)

**Objetivo**: 7 engines de cobertura + adapter + copilot AI.

Depende de: Flujo A completo.

| Task | Archivo |
|------|---------|
| T1011 | protectivePutEngine.ts |
| T1012 | collarEngine.ts (**con stopLossLow/High**) |
| T1013 | coveredStraddleEngine.ts |
| T1014 | coverageSimulationEngine.ts |
| T1015 | coverageRiskService.ts |
| T1016 | coverageReportService.ts |
| T1017 | coverageComparator.ts |
| T1034 | coverageStrategyAdapter.ts |
| T1018 | institutionalCopilotChat.ts |

T1011-T1013 pueden ir en paralelo. T1014→T1015→T1016→T1017 son secuenciales (cada uno depende del anterior).

### Flujo C — Backend Routes (Phase 7)

**Objetivo**: 7 rutas + fix confluenceViewPresets + registro en index.ts.

Depende de: Flujos A y B completos.

| Task | Archivo |
|------|---------|
| T1019 | bootstrap.ts |
| T1020 | institutionalAnalysis.ts |
| T1021 | regulatoryPositions.ts |
| T1022 | analyze.ts (coverage) |
| T1023 | simulate.ts (coverage) |
| T1024 | compare.ts (coverage) |
| T1025 | institutionalCopilot.ts |
| T1026 | index.ts (route registration) |
| T1035 | confluenceViewPresets.ts (fix auth) |

T1020, T1021 en paralelo. T1022, T1023, T1024 en paralelo. T1026 al final.

### Flujo D — Backend Tests + Config (Phases 8-11)

**Objetivo**: Variables de entorno, bugfix tests, cache fixes, tests de integración.

| Task | Descripción |
|------|-------------|
| T1027 | .env.example con EDGAR_USER_AGENT + GEMINI_API_KEY |
| T1028 | collarEngine.test.ts — caso crédito neto |
| T1029 | protectivePutEngine.test.ts — riskTolerancePct=0 fix |
| T1030 | coverage integration tests |
| T1031 | searchEftsCache key incluye period |
| T1032 | searchEftsCache TTL 24h |
| T1033 | InstitutionalDataService cache key incluye period |
| T1106 | Fix test: riskTolerancePct=0 |
| T1107 | Fix test: confluenceViewPresets auth |

T1031 → T1032 (secuencial, mismo archivo). T1033, T1106, T1107 independientes.

### Flujo E — Frontend (Phases 12-17)

**Objetivo**: 16 archivos de frontend + 8 tests.

Puede ejecutarse **en paralelo** con los Flujos A-B una vez que las rutas backend están definidas (aunque no implementadas — los servicios API del frontend se pueden mockear para desarrollo).

**Setup** (blocking todos los demás):
- T300: react-router-dom
- T301: main.tsx con rutas
- T302: MainLayout
- T303: chat.ts store

**Servicios API** (en paralelo una vez setup listo):
- T304: institutionalApi.ts
- T305: coverageApi.ts
- T306: aiChatApi.ts
- T307: apiCache.ts
- T308: signalApi.ts update

**Componentes** (en paralelo):
- T309: PayoffChart.tsx
- T310: ChatHistory.tsx
- T311: ScenarioAnalysisCards.tsx
- T312: Tooltip.tsx

**Páginas** (dependen de componentes y servicios):
- T313: InstitutionalAnalysisPage.tsx
- T314: RegulatoryPositionsPage.tsx
- T315: CoverageStrategiesPage.tsx
- T316: AIChatPage.tsx

**Tests frontend**:
- T317-T320: tests de páginas (en paralelo)
- T321-T324: tests de servicios (en paralelo)

## 6) Estrategia de Pruebas

### Backend
```bash
cd projects/rest-api/inversions_api
npx tsc --noEmit                          # 0 errores de tipos
npx vitest run                            # 32 test files, 158 tests
npx vitest run tests/unit/strategies/coverage/  # coverage engines
npx vitest run tests/unit/institutional/        # institutional engines
```

Smoke tests:
```bash
# Análisis institucional
curl "http://localhost:3000/api/institutional/analysis?ticker=AAPL" \
  -H "Authorization: Bearer dev-bypass-token"

# Cobertura
curl -X POST "http://localhost:3000/api/coverage/analyze" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-bypass-token" \
  -d '{"ticker":"SPY","currentPrice":450,"shares":100}'

# Verify normalCdf (en Node):
# import {normalCdf} from './src/modules/strategies/coverage/coverageTypes.js'
# normalCdf(0) → ≈0.500
```

### Frontend
```bash
cd projects/pwa/inversions_app
npx tsc --noEmit      # 0 errores
npx vitest run        # todos los tests
npm run dev           # abrir http://localhost:5173
```

Verificaciones manuales:
- `/institutional/analysis` → ticker AAPL, period daily → zonas S/R renderizadas
- `/coverage/strategies` → ticker SPY, precio 450, 100 shares → 4 estrategias con payoff
- `/ai/chat` → pregunta sobre SPY → respuesta o polling visible
- PayoffChart: eje X muestra "$225", "$360" (no "1970")

## 7) Restricciones y Guardrails

- `kind="covered_straddle"` se mantiene en contratos (retrocompatibilidad).
- `stopLossPrice` se preserva en `RiskMetrics` para retrocompatibilidad; nuevos campos son opcionales.
- FIC: comentarios bilingüe EN/ES requeridos en TODOS los archivos nuevos.
- No auto-trading, no ejecución automática.
- Frontend: solo `fetch` nativo (sin axios), CSS variables existentes (sin Tailwind/MUI).
- React Router v6 para navegación SPA.

## 8) Dependencias Externas

| Variable | Requerida para | Fuente |
|----------|---------------|--------|
| `EDGAR_USER_AGENT` | realSourceParsers.ts | Hardcoded default ok |
| `GEMINI_API_KEY` | institutionalCopilotChat.ts | Obtener del proyecto TEAM-05 |
| Backend en localhost:3000 | Frontend dev | `npm run dev` en backend |

## 9) Ready / Gaps

- **Ready**: READY_FOR_SPECKIT_TASKS
- **Gaps conocidos** (deuda técnica post-migración, no bloqueantes):
  - Nomenclatura `covered_straddle` vs `covered_strangle` en contratos (sprint siguiente)
  - Correlación Pearson con señales reales de 13F (requiere histórico de filings)
  - Convención de signos inconsistente entre engines (refactor cosmético)
  - `calculateAtr` implementa Average Range, no True Range (renombrar o corregir)
  - CUSIP map limitado a 60 tickers — agregar más según demanda
  - Monte Carlo con 256 iteraciones — aumentar a 10,000 en producción
