# Plan de Implementación: 010-team-05-audit-bugfix-engines

## 1) Contexto y Autoridad

- **Feature**: `specs/010-team-05-audit-bugfix-engines/`
- **Equipo**: TEAM-05 (TurboPapus)
- **Iniciativa**: `001-inversions`
- **Engine**: Speckit (`stage=plan`)
- **Idioma**: es
- **Política de autoridad**: `diana_canon_strict`

Este plan está subordinado a:
1. `.drfic/diana-sdk/projects/diana-inversions/inv-constitution.md`
2. `specs/006-team-05-institucional-cobertura/spec.md`
3. `specs/007-team-05-frontend-cobertura/spec.md`
4. `specs/010-team-05-audit-bugfix-engines/spec.md`

Ante conflicto, prevalece el canon Diana.

## 2) Entradas Canónicas Cargadas

- Documento de auditoría: `docs/TEAM-05-auditoria-specs-006-007.md`
- Spec padre A: `specs/006-team-05-institucional-cobertura/spec.md`
- Spec padre B: `specs/007-team-05-frontend-cobertura/spec.md`
- Spec vigente: `specs/010-team-05-audit-bugfix-engines/spec.md`

## 3) Objetivo del Plan

Documentar y registrar los 8 fixes de auditoría aplicados al módulo de cobertura e institucional de TEAM-05 para que sean reproducibles en el repositorio del grupo, preservando trazabilidad 1:1 con las specs padre 006 y 007.

## 4) Skills Requeridas (Speckit `plan`)

- `004-inv-options-strategy-engine`
- `007-inv-institutional-analysis`
- `011-inv-portfolio-and-performance-analytics`

## 5) Diseño de Ejecución por Flujos

### Flujo A — Black-Scholes CDF Fix (coverageTypes.ts)

**Objetivo**: Corregir la función `normalCdf` que multiplicaba `(1 - φ(x))` en lugar de `φ(x)`.

Inputs:
- `coverageTypes.ts` — función `normalCdf` con error en la construcción de la PDF.

Outputs:
- `normalCdf` retorna `0.5` en `x=0`, `0` en `x=-10`, `1` en `x=10`.
- `estimateOptionPremium()` produce primas Black-Scholes correctas.

Archivos afectados:
- `src/modules/strategies/coverage/coverageTypes.ts` (función `normalCdf`, líneas 202-213)

Cambio quirúrgico — una línea:
```typescript
// Antes:
let cdf = 1 - Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
cdf *= k * ... + k**5 * ...;

// Después:
const pdf = Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
const cdf = pdf * (k * ... + k**5 * ...);
```

---

### Flujo B — Collar Stop-Loss Bands (collarEngine.ts + coverageTypes.ts)

**Objetivo**: Exponer ambas bandas de stop-loss del collar como campos distintos.

Inputs:
- `collarEngine.ts` — `stopLossPrice: Math.min(stopLossLow, stopLossHigh)` (siempre retorna `stopLossLow`).
- `coverageTypes.ts` — interfaz `RiskMetrics` con un solo campo `stopLossPrice`.

Outputs:
- `RiskMetrics` tiene `stopLossLowPrice?: number` y `stopLossHighPrice?: number` como campos opcionales.
- Collar expone `stopLossPrice` (= `stopLossLow`, retrocompatibilidad), `stopLossLowPrice` y `stopLossHighPrice`.
- Otros engines (ProtectivePut, CoveredStraddle) no se modifican.

Archivos afectados:
- `src/modules/strategies/coverage/coverageTypes.ts` (interfaz `RiskMetrics`)
- `src/modules/strategies/coverage/collarEngine.ts` (línea 61)

---

### Flujo C — Fallback Candles Determinísticos (institutionalTrendEngine.ts)

**Objetivo**: Reemplazar `Math.random()` con un PRNG seeded para garantizar reproducibilidad.

Inputs:
- `institutionalTrendEngine.ts` — `buildFallbackCandles()` usa `Math.random()` en 3 puntos.

Outputs:
- Método privado `seededRandom(seed: number): () => number` — LCG determinístico.
- `buildFallbackCandles()` usa seed derivado de `analysis.ticker`.
- Mismo ticker → mismos candles → misma señal de tendencia.

Archivos afectados:
- `src/modules/institutional/institutionalTrendEngine.ts` (método `buildFallbackCandles`, líneas 517-551)

Algoritmo LCG elegido (Numerical Recipes):
```typescript
private seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = Math.imul(s, 1664525) + 1013904223 | 0;
    return (s >>> 0) / 0xffffffff;
  };
}
```

---

### Flujo D — Calendario de Eventos de Mercado (expirationAnalysisEngine.ts)

**Objetivo**: Corregir 3 bugs independientes en la lógica de calendario.

#### D1 — Separación FOMC / CPI (línea 730)

- CPI: cambiar `findNthWeekday(year, month, 2, 3)` → `findNthWeekday(year, month, 2, 2)` (martes vs miércoles).
- FOMC permanece en 2do miércoles.

#### D2 — Deduplicación Triple Witching (líneas 603-617)

- El bloque de Triple Witching ahora busca el evento `quarterly_opex` existente para esa fecha.
- Si existe: actualiza `label`, `significance` y `directionalBias` en lugar de hacer push.
- Si no existe (raro): inserta normalmente.

#### D3 — Sesgo Estacional (líneas 1009-1015)

```typescript
// Antes:
if (month >= 1 && month <= 3) return "neutral";
if (month >= 4 && month <= 6) return "bullish";
if (month >= 7 && month <= 9) return "neutral";
return "bearish"; // ← Oct-Dic incorrecto

// Después:
if (month === 9) return "bearish";           // Sep: peor mes del año
if (month === 10) return "neutral";          // Oct: volátil, sesgo mixto
if (month === 11 || month === 12) return "bullish"; // Nov-Dic: Santa rally
if (month >= 4 && month <= 6) return "bullish";     // Abr-Jun: primavera alcista
if (month >= 7 && month <= 8) return "neutral";     // Jul-Ago: verano
return "neutral";                            // Ene-Mar: variable
```

Archivos afectados:
- `src/modules/institutional/expirationAnalysisEngine.ts` (3 cambios quirúrgicos)

---

### Flujo E — Correcciones de Tests e Infraestructura

**Objetivo**: Corregir 2 fallos pre-existentes en suite de tests.

#### E1 — protectivePutEngine.test.ts

- Cambiar `riskTolerancePct: 0.3` → `riskTolerancePct: 0` para que el escenario active `STOP_LOSS_TRIGGERED`.
- Raíz: con 0.3 → buffer=10% → `stopLossPrice=85.5` < `currentPrice=90` → no dispara.
- Con 0 → buffer=3% → `stopLossPrice=92.15` > `currentPrice=90` → dispara.

#### E2 — confluenceViewPresets.ts + test

- La ruta `/confluence-columns` usaba `supabaseClient` (no mockeado en el test).
- Fix: usar `createAuthenticatedClient(req.authContext.token)`.
- Eliminar `supabaseClient` del import (ya no se referencia en el archivo).

Archivos afectados:
- `tests/unit/strategies/coverage/protectivePutEngine.test.ts`
- `src/routes/dashboard/confluenceViewPresets.ts`

---

## 6) Estrategia de Pruebas

Verificación numérica de `normalCdf`:
- `normalCdf(0) ≈ 0.5` (tolerancia ±0.001)
- `normalCdf(-10) = 0`, `normalCdf(10) = 1`

Verificación del collar:
- `putStrike=440, callStrike=460, bufferPct=4%`
- `stopLossLowPrice = 440 × 0.96 = 422.4`
- `stopLossHighPrice = 460 × 1.04 = 478.4`
- `stopLossPrice = 422.4` (retrocompatibilidad)

Verificación de reproducibilidad (TrendEngine):
- Llamada 1 con ticker "AAPL" → candles[0].close = X
- Llamada 2 con ticker "AAPL" → candles[0].close = X (mismo valor)
- Llamada 3 con ticker "MSFT" → candles[0].close ≠ X (diferente ticker)

Verificación del calendario:
- Mes de Triple Witching → eventos filtrados por fecha → exactamente 1 evento por fecha
- `estimateExpiryBias(9) === "bearish"`
- `estimateExpiryBias(11) === "bullish"`
- `estimateExpiryBias(12) === "bullish"`

Suite completa:
- `npx vitest run` → `32 passed (32)`, `158 passed (158)`
- `npx tsc --noEmit` → sin errores

## 7) Restricciones y Guardrails

- No modificar contratos JSON.
- No modificar tipos públicos de retorno de `analyze()` en ningún engine.
- `kind="covered_straddle"` se mantiene por compatibilidad (deuda técnica post-merge).
- `stopLossPrice` se conserva en `RiskMetrics` para retrocompatibilidad; los nuevos campos son opcionales.
- La función `normalCdf` es privada al módulo; no hay consumers externos que dependan de la firma.

## 8) Dependencias y Secuenciación

Dependencias de datos:
- Auditoría técnica: `docs/TEAM-05-auditoria-specs-006-007.md`
- Engines existentes (todos ya implementados en specs 006-008)

Secuencia recomendada (ya ejecutada):
1. Flujo A — `normalCdf` (mayor impacto, menor riesgo)
2. Flujo B — Collar stop-loss bands
3. Flujo C — TrendEngine PRNG determinístico
4. Flujo D — Tres correcciones de calendario (D1 → D2 → D3)
5. Flujo E — Tests e infraestructura

Todos los flows son independientes entre sí. El orden recomendado refleja severidad decreciente.

## 9) Ready / Gaps

- **Ready**: READY_FOR_SPECKIT_TASKS
- **Estado de implementación**: APLICADO — todos los fixes están en rama `emiliano` (commit `aec2495` + cambios no commiteados de sesión 2026-05-28).
- **Gaps abiertos (deuda técnica, fuera de scope)**:
  - Nomenclatura `covered_straddle` vs `covered_strangle` en contratos.
  - Correlación Pearson calculada con señales sintéticas en TrendEngine.
  - Convención de signos inconsistente entre engines.
  - `calculateAtr` implementa Average Range, no True Range.
