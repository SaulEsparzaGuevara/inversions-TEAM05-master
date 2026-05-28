# Checklist: Plan Quality — 011-team-05-full-migration

Purpose: Validar la calidad del plan de implementación antes de ejecutar.
Created: 2026-05-28
Source: `specs/011-team-05-full-migration/plan.md`

## Completitud de Requisitos

- [X] CHK001 - ¿Están descritos todos los flujos de ejecución (A: Core, B: Coverage+AI, C: Routes, D: Tests, E: Frontend) con sus inputs y outputs? [Completeness, Plan §5] ✅ Flujos A-E con archivos, dependencias y orden definidos
- [X] CHK002 - ¿Están cubiertos los 28 archivos backend como tareas ejecutables en tasks.md? [Completeness, Plan §5] ✅ T1000-T1035 cubren 28 archivos backend incluyendo adapter (T1034)
- [X] CHK003 - ¿Están cubiertos los 16 archivos frontend como tareas ejecutables? [Completeness, Plan §5] ✅ T300-T316 cubren infraestructura, servicios, componentes y páginas
- [X] CHK004 - ¿Están descritas las 8 correcciones de auditoría con su integración en las tasks correspondientes? [Correctness, Plan §5] ✅ T1100-T1107 con nota "integrar en T1002/T1009/T1010/T1012/T1106/T1107"
- [X] CHK005 - ¿Está especificado el fix de normalCdf con verificación numérica? [Correctness, Plan §6] ✅ normalCdf(0)≈0.500, fórmula φ(x)×poly documentada
- [X] CHK006 - ¿Está especificado el comportamiento del PRNG seeded (mismo ticker→mismas velas)? [Reproducibility, Plan §5] ✅ LCG con seed=suma charCodes, algoritmo Numerical Recipes
- [X] CHK007 - ¿Están los 3 bugfixes de expirationAnalysisEngine especificados con valores exactos? [Correctness, Plan §5] ✅ CPI→martes(2), Triple Witching dedup logic, sesgo estacional por mes
- [X] CHK008 - ¿Están definidas las APIs externas con URLs, headers y timeouts? [Dependency, Plan §7] ✅ SEC EDGAR, FINRA, Yahoo Finance v1/v7/v10, Gemini con parámetros exactos
- [X] CHK009 - ¿Están definidas las variables de entorno requeridas? [Dependency, Plan §7] ✅ EDGAR_USER_AGENT, GEMINI_API_KEY documentadas con valores y fuentes
- [X] CHK010 - ¿Está especificada la estrategia de merge de observaciones institucionales? [Completeness, Tasks] ✅ PROMEDIO/MÁXIMO/SUMA/FIRST DEFINED/HIGHEST para cada campo
- [X] CHK011 - ¿Está el scoring de confidence definido con umbrales exactos? [Completeness, Tasks] ✅ ≥4→0.95, 3→0.85, 2→0.70, else→0.55, max 0.95 en T1003
- [X] CHK012 - ¿Están definidos los criterios de aceptación global con comandos de verificación? [Acceptance Criteria, Plan §6] ✅ npx tsc, npx vitest, curl smoke tests con valores esperados
- [X] CHK013 - ¿Están identificadas las oportunidades de paralelismo? [Efficiency, Plan §5] ✅ Tabla de parallel opportunities en tasks.md
- [X] CHK014 - ¿Está especificado el formato de respuesta de los 7 endpoints REST? [Contract, Spec] ✅ Respuestas de éxito y error documentadas por endpoint en spec.md
- [X] CHK015 - ¿Están definidos los roles de acceso por endpoint? [Security, Spec] ✅ analyst/risk_manager/trader para coverage+institutional+AI
- [X] CHK016 - ¿Está especificado el comportamiento de degradación parcial (all_failed/partial/ok)? [Resilience, Tasks §T1003] ✅ overallStatus con tres valores y comportamiento HTTP 200/206/503

## Gaps Conocidos (Deuda Técnica — No Bloqueantes)

- [~] CHK017 - Monte Carlo con 10,000 iteraciones para producción → actual 256 (demo). Documentado como gap en plan.md §9.
- [~] CHK018 - CUSIP map de 60 tickers — cobertura limitada para tickers fuera del S&P 500. Documentado en plan.md §9.
- [~] CHK019 - Correlación Pearson usa señales sintéticas trimestrales. Documentado; requiere 13F histórico real.
- [~] CHK020 - `calculateAtr` implementa Average Range, no True Range. Nombre incorrecto, documentado.

---

Meta: Checklist validado antes de ejecutar cualquier task de implementación en el repo principal.
