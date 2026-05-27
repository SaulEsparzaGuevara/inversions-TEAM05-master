# Plan de Implementación: 009-team-05-institucional-migration

## 1) Contexto y Autoridad

- **Feature**: `specs/009-team-05-institucional-migration/`
- **Equipo**: TEAM-05 (TurboPapus)
- **Tipo**: Migration Spec (as-is)
- **Engine**: Speckit (`stage=plan`)
- **Idioma**: es
- **Política de autoridad**: `diana_canon_strict`

Este plan está subordinado a:
1. `diana-inversions-constitution v1.1.0`
2. `specs/009-team-05-institucional-migration/spec.md`
3. Código fuente de referencia en repo local de TEAM-05 (`specs/006-team-05-institucional-cobertura/`)

Ante conflicto, prevalece el canon Diana.

## 2) Entradas Canónicas Cargadas

- Spec de migración vigente: `specs/009-team-05-institucional-migration/spec.md`
- Spec fuente local: `specs/006-team-05-institucional-cobertura/spec.md`
- Código fuente de referencia: ~7,500 líneas / 27 archivos en repo local TEAM-05

## 3) Objetivo del Plan

Migrar el módulo completo de análisis institucional y estrategias de cobertura de TEAM-05 al repositorio principal. Documentar el estado actual (as-is) para que al ejecutar `/speckit.implement` se obtenga exactamente lo que existe en el repo local de TEAM-05.

## 4) Skills Requeridas (Speckit `plan`)

- `001-inv-technical-analysis-structure`
- `004-inv-options-strategy-engine`
- `005-inv-institutional-options-flow`
- `007-inv-ai-confluence-orchestration`
- `008-inv-market-data-and-realtime`

## 5) Diseño de Ejecución por Flujos

### Flujo A — Módulo Institutional (9 archivos)

**Secuencia**: `institutionalContract.ts` → `institutionalDataService.ts` → `realSourceParsers.ts` + `yahooCrumbSession.ts` + `yahooOptionsParser.ts` + `yahooInstitutionalParser.ts` → `institutionalZonesEngine.ts` → `institutionalTrendEngine.ts` → `expirationAnalysisEngine.ts`

**Dependencia clave**: todos los engines dependen de `institutionalDataService`.

Archivos a crear:
| # | Archivo | Path |
|---|---------|------|
| 1 | institutionalContract.ts | src/modules/institutional/institutionalContract.ts |
| 2 | institutionalDataService.ts | src/modules/institutional/institutionalDataService.ts |
| 3 | realSourceParsers.ts | src/modules/institutional/realSourceParsers.ts |
| 4 | yahooCrumbSession.ts | src/modules/institutional/yahooCrumbSession.ts |
| 5 | yahooOptionsParser.ts | src/modules/institutional/yahooOptionsParser.ts |
| 6 | yahooInstitutionalParser.ts | src/modules/institutional/yahooInstitutionalParser.ts |
| 7 | institutionalZonesEngine.ts | src/modules/institutional/institutionalZonesEngine.ts |
| 8 | institutionalTrendEngine.ts | src/modules/institutional/institutionalTrendEngine.ts |
| 9 | expirationAnalysisEngine.ts | src/modules/institutional/expirationAnalysisEngine.ts |

### Flujo B — Módulo Coverage (10 archivos)

**Secuencia**: `coverageStrategyContract.ts` + `coverageTypes.ts` → `protectivePutEngine.ts` + `collarEngine.ts` + `coveredStraddleEngine.ts` → `coverageSimulationEngine.ts` → `coverageRiskService.ts` → `coverageReportService.ts` → `coverageComparator.ts`

**Dependencia clave**: reportService depende de simulation y risk.

Archivos a crear:
| # | Archivo | Path |
|---|---------|------|
| 10 | coverageStrategyContract.ts | src/modules/strategies/coverage/coverageStrategyContract.ts |
| 11 | coverageTypes.ts | src/modules/strategies/coverage/coverageTypes.ts |
| 12 | protectivePutEngine.ts | src/modules/strategies/coverage/protectivePutEngine.ts |
| 13 | collarEngine.ts | src/modules/strategies/coverage/collarEngine.ts |
| 14 | coveredStraddleEngine.ts | src/modules/strategies/coverage/coveredStraddleEngine.ts |
| 15 | coverageSimulationEngine.ts | src/modules/strategies/coverage/coverageSimulationEngine.ts |
| 16 | coverageRiskService.ts | src/modules/strategies/coverage/coverageRiskService.ts |
| 17 | coverageReportService.ts | src/modules/strategies/coverage/coverageReportService.ts |
| 18 | coverageComparator.ts | src/modules/strategies/coverage/coverageComparator.ts |

### Flujo C — Módulo AI (1 archivo)

- `institutionalCopilotChat.ts` → `src/modules/ai/institutionalCopilotChat.ts`
- Dependencia: Gemini API key en variables de entorno

### Flujo D — Routes + Bootstrap (7 archivos)

**Secuencia**: `bootstrap.ts` → `institutionalAnalysis.ts` + `regulatoryPositions.ts` → `analyze.ts` + `simulate.ts` + `compare.ts` → `institutionalCopilot.ts`

**Dependencia**: todos los módulos A/B/C deben existir.

Archivos a crear:
| # | Archivo | Path |
|---|---------|------|
| 20 | bootstrap.ts | src/routes/institutional/bootstrap.ts |
| 21 | institutionalAnalysis.ts | src/routes/institutional/institutionalAnalysis.ts |
| 22 | regulatoryPositions.ts | src/routes/institutional/regulatoryPositions.ts |
| 23 | analyze.ts | src/routes/coverage/analyze.ts |
| 24 | simulate.ts | src/routes/coverage/simulate.ts |
| 25 | compare.ts | src/routes/coverage/compare.ts |
| 26 | institutionalCopilot.ts | src/routes/ai/institutionalCopilot.ts |

Total: **27 archivos** backend (~7,500 líneas).

## 6) Variables de Entorno Requeridas

| Variable | Valor por defecto | Obligatoria |
|----------|-------------------|-------------|
| `EDGAR_USER_AGENT` | `TurboPapus/1.0 (contact@turbopapus.com)` | No |
| `GEMINI_API_KEY` | — | Sí |
| `NODE_ENV` | `development` | No |

## 7) Performance (Phase 8 y 9 ya incorporadas)

- `Promise.allSettled` para fuentes institucionales en paralelo
- `MAX_FILINGS=1` en SEC EDGAR
- `preResolvedResult` compartido entre Zones/Trend/Expiration engines
- shared `yahooCrumbSession` (no duplicar auth calls)
- Cache key simplificada: `sourceId:ticker`
- `monteCarloIterations=0` para payoff-only instantáneo
- `precomputed` en reportService evita simulaciones duplicadas
- `Promise.allSettled` en notificaciones

## 8) Restricciones y Guardrails

- Comentarios con prefijo `FIC:` (bilingüe EN/ES) en todo código generado
- Escala canónica `confidence`: rango decimal [0.00, 1.00], nunca 0-100
- Códigos de error estandarizados: `HTTP_ERROR`, `TIMEOUT`, `RATE_LIMITED`, `EMPTY_RESPONSE`, `PARSE_ERROR`
- Degradación parcial: fuentes fallidas no bloquean respuesta completa
- Solo roles analyst, risk_manager, trader acceden a endpoints de cobertura
- No auto-trading, no ejecución automática

## 9) Estrategia de Pruebas

- Unitarias: fórmulas de payoff, validaciones de parámetros, confidence scoring
- Integración: flujo completo analyze/compare/simulate con datos reales
- Contratos: validación de esquema de respuestas estructuradas
- Fixtures: escenarios de collar crédito neto, protective put OTM/ATM/ITM

## 10) Ready / Gaps

- **Ready**: `READY_FOR_SPECKIT_TASKS`
- **Gaps**: Fixtures de datos para escenarios extremos (catálogo `market-scenarios.md` pendiente de materializar en el repositorio principal)

## 11) Siguiente Paso

Ejecutar las tareas priorizadas del `tasks.md` en el repositorio principal mediante `/speckit.implement`. Todas las tasks están marcadas como pendientes `[ ]` porque aún no han sido ejecutadas en el repo principal.
