# Spec: 010-team-05-audit-bugfix-engines

## Resumen

Feature para TEAM-05 (TurboPapus): correcciones derivadas de auditoría técnica completa sobre los módulos de análisis institucional (Spec 006) y estrategias de cobertura (Spec 007). La auditoría identificó 3 bugs críticos, 3 bugs importantes y 2 fallos pre-existentes en tests. Todos los fixes fueron aplicados en sesión de auditoría 2026-05-28 y están listos para merge a `main`.

## Clarifications

### Session 2026-05-28

- Q: ¿Por qué la `normalCdf` retornaba valores incorrectos (≈0.247 en x=0 en lugar de 0.5)?
  A: La aproximación de Abramowitz & Stegun (fórmula 26.2.17) requiere multiplicar `φ(x)` (la PDF normal) por el polinomio. El código original multiplicaba `(1 - φ(x))` por error. Verificación: `φ(0) × poly(k=1) = 0.3989 × 1.2533 ≈ 0.5` ✅.

- Q: ¿Por qué `stopLossPrice` del collar siempre retornaba la banda inferior?
  A: `Math.min(stopLossLow, stopLossHigh)` siempre devuelve `stopLossLow` porque `stopLossLow = putStrike * 0.96` es siempre menor que `stopLossHigh = callStrike * 1.04`. La banda superior nunca se exponía. Fix: separar en `stopLossLowPrice` y `stopLossHighPrice` como campos distintos.

- Q: ¿Cómo afecta `Math.random()` en los fallback candles del TrendEngine?
  A: Dos llamadas con el mismo ticker producen tendencias diferentes ("bullish" vs "bearish") de forma no reproducible. El ZonesEngine ya usaba trigonometría determinística. Fix: LCG seeded con el hash del ticker.

- Q: ¿FOMC y CPI realmente se superponen en el código?
  A: Sí. Ambos usaban `findNthWeekday(year, month, 2, 3)` (2do miércoles). El CPI del BLS generalmente cae en martes de la 2da semana. Fix: CPI → `findNthWeekday(year, month, 2, 2)` (2do martes).

- Q: ¿Por qué el Triple Witching generaba eventos duplicados?
  A: El bloque "Monthly OpEx" ya insertaba un evento `quarterly_opex` para los meses 3/6/9/12, y luego el bloque "Triple Witching" insertaba un segundo `quarterly_opex` para la misma fecha. Fix: el bloque de Triple Witching ahora actualiza el evento existente si ya existe, en lugar de hacer push doble.

- Q: ¿Por qué octubre-diciembre estaba marcado como `"bearish"`?
  A: Error histórico en la implementación inicial. El período octubre-diciembre es el más alcista del año en renta variable de EE.UU. (Hirsch, Stock Trader's Almanac; LPL Financial). Septiembre es históricamente el peor mes. Fix: Sep `"bearish"`, Oct `"neutral"`, Nov-Dic `"bullish"`.

- Q: ¿Por qué `protectivePutEngine.test.ts` fallaba con `riskTolerancePct: 0.3`?
  A: Con `riskTolerancePct=0.3`, el buffer se calcula como `clamp(0.3 × 0.5, 0.01, 0.10) = 0.10`, dando `stopLossPrice = 95 × 0.90 = 85.5`. El stock estaba en 90 > 85.5, por lo que la alerta `STOP_LOSS_TRIGGERED` no disparaba. El test usaba `riskTolerancePct=0` (buffer por defecto de 3%): `stopLossPrice = 95 × 0.97 = 92.15 > 90` → alerta dispara.

- Q: ¿Por qué la ruta `/confluence-columns` retornaba 500?
  A: La ruta usaba `supabaseClient` (importación directa) mientras que el mock del test solo intercepta `createAuthenticatedClient`. `supabaseClient` quedaba `undefined` → TypeError → HTTP 500. Fix: la ruta usa `createAuthenticatedClient(req.authContext.token)` consistentemente.

## Identificadores de backlog (rango derivado)

- T1000..T1009 (ver tasks.md para contexto y dependencias)

## Objetivo

Documentar y registrar los 8 fixes aplicados al módulo de cobertura e institucional de TEAM-05 para que sean reproducibles en el repositorio del grupo, preservando trazabilidad 1:1 con las specs padre 006 y 007.

## Alcance Funcional

- Corregir CDF Black-Scholes: multiplicar `φ(x)` en lugar de `(1 - φ(x))` (RF-BUG-001).
- Corregir collar `stopLossPrice`: separar en `stopLossLowPrice` y `stopLossHighPrice` (RF-BUG-002).
- Corregir fallback candles del TrendEngine: PRNG seeded con ticker (RF-BUG-003).
- Corregir fechas FOMC/CPI: CPI al 2do martes, distinto del 2do miércoles de FOMC (RF-BUG-004).
- Corregir duplicación de eventos Triple Witching: actualizar en lugar de push doble (RF-BUG-005).
- Corregir sesgo estacional mensual: Sep bearish, Oct neutral, Nov-Dic bullish (RF-BUG-006).
- Corregir test `protectivePutEngine`: `riskTolerancePct: 0` para escenario stop-loss válido (RF-TEST-001).
- Corregir ruta `/confluence-columns`: usar `createAuthenticatedClient` en lugar de `supabaseClient` (RF-ROUTE-001).

## Alcance No Funcional

- Ningún cambio de contrato JSON público (strategy.v1.json, institutional_context.v1.json, explanation.v1.json).
- Ningún cambio de interfaz pública de engines (firmas de `analyze()`, tipos de retorno).
- Cero regresiones: 158/158 tests pasan post-fix.
- TypeScript: `npx tsc --noEmit` sin errores en backend.

## Restricciones

- No modificar artefactos canónicos globales: `001-inv-spec.md`, `001-inv-plan.md` ni `001-inv-tasks.md`.
- No modificar contratos JSON.
- No modificar el kind `"covered_straddle"` en contratos (deuda técnica documentada en auditoría, tratada por separado).
- No cambiar firmas públicas de los engines de cobertura.

## Entregables

- `coverageTypes.ts` con `normalCdf` corregida y campos opcionales `stopLossLowPrice` / `stopLossHighPrice` en `RiskMetrics`.
- `collarEngine.ts` con `stopLossLowPrice` y `stopLossHighPrice` expuestos correctamente.
- `institutionalTrendEngine.ts` con `seededRandom()` y `buildFallbackCandles` determinístico.
- `expirationAnalysisEngine.ts` con CPI en martes, Triple Witching deduplicado y sesgo estacional corregido.
- `protectivePutEngine.test.ts` con `riskTolerancePct: 0` para escenario stop-loss.
- `confluenceViewPresets.ts` con `createAuthenticatedClient` en endpoint `/confluence-columns`.
- Suite de tests al 100%: 32 archivos, 158 tests.

## Criterios de Aceptación

- `normalCdf(0)` retorna exactamente `0.5` (±0.001).
- `normalCdf(-10)` retorna `0`, `normalCdf(10)` retorna `1`.
- Collar con `putStrike=440, callStrike=460, bufferPct=4%` expone `stopLossLowPrice=422.4` y `stopLossHighPrice=478.4`.
- Dos llamadas a `buildFallbackCandles` con el mismo ticker retornan candles idénticos.
- Dos llamadas con tickers distintos retornan candles distintos.
- En meses de Triple Witching (mar/jun/sep/dic) no aparecen eventos `quarterly_opex` duplicados para la misma fecha.
- `estimateExpiryBias(9)` retorna `"bearish"`, `estimateExpiryBias(11)` retorna `"bullish"`.
- `GET /api/dashboard/confluence-columns` retorna HTTP 200 con array `columns` en el test de integración.
- `npx vitest run` → `32 passed (32)`, `158 passed (158)`.
- `npx tsc --noEmit` → sin errores.

## Dependencias

- Spec padre A: `specs/006-team-05-institucional-cobertura/spec.md`
- Spec padre B: `specs/007-team-05-frontend-cobertura/spec.md`
- Documento fuente: `docs/TEAM-05-auditoria-specs-006-007.md`
- Engines afectados: `coverageTypes.ts`, `collarEngine.ts`, `institutionalTrendEngine.ts`, `expirationAnalysisEngine.ts`.
- Ruta afectada: `routes/dashboard/confluenceViewPresets.ts`.
- Tests afectados: `tests/unit/strategies/coverage/protectivePutEngine.test.ts`, `tests/integration/dashboard/confluenceDynamicColumns.test.ts`.

## Riesgos y Mitigaciones

- Riesgo: Regresión en engines no afectados → Mitigación: suite completa de 158 tests corre sin fallos.
- Riesgo: Cambio de comportamiento en primas Black-Scholes para usuarios que ya tienen estimaciones guardadas → Mitigación: los engines de payoff usan primas del contrato (user input), no las estimadas; solo `estimateOptionPremium()` como fallback se ve afectado.
- Riesgo: `stopLossLowPrice` / `stopLossHighPrice` ignorados por consumers que solo leen `stopLossPrice` → Mitigación: `stopLossPrice` se preserva (igual a `stopLossLowPrice`) para retrocompatibilidad; los nuevos campos son opcionales.

## Trazabilidad

- Documento de auditoría: `docs/TEAM-05-auditoria-specs-006-007.md`
- Spec padre A: `specs/006-team-05-institucional-cobertura/spec.md`
- Spec padre B: `specs/007-team-05-frontend-cobertura/spec.md`
- Rama: `emiliano`

## Notas de Implementación

- Todos los fixes fueron aplicados en sesión de auditoría 2026-05-28 en rama `emiliano`.
- Los archivos afectados son exclusivamente lógica interna; ninguna interfaz pública fue modificada.
- La auditoría identificó 4 hallazgos adicionales de deuda técnica (nomenclatura covered_straddle, correlación Pearson sintética, convención de signos entre engines, nombre `calculateAtr`). Estos NO se corrigen en esta spec y se trackean como deuda técnica post-merge.

## Próximos pasos

1. Verificar que todos los tests pasan (T1008, T1009).
2. Merge de rama `emiliano` a `main`.
3. Abrir tickets de deuda técnica para hallazgos 7-10 de la auditoría.
