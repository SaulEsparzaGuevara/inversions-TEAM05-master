---
description: "Task list for 008-team-05-cobertura-bugfix-visual"
---

# Tasks: 008-team-05-cobertura-bugfix-visual

**Input**: Design documents from `specs/008-team-05-cobertura-bugfix-visual/`
**Prerequisites**: spec.md, plan.md, research.md, data-model.md

## Derived Tasks — Bugfix & Visual Corrections

Todas las tasks de esta spec están completadas porque los cambios ya fueron aplicados en la sesión de revisión externa 2026-05-26.

### Phase 10: Coverage Engine Bug Fixes — Cálculo (Completado)

- [x] T900 [P] Corregir bug de signo en CollarEngine — `buildPayoffSimulation()`: cambiar `callStrike - currentPrice + netPremiumPerShare` → `callStrike - currentPrice - netPremiumPerShare` en el cálculo de maxProfit. Raíz: netPremiumPerShare es negativo en crédito neto, sumarlo propagaba el signo al revés. Archivo: `collarEngine.ts`
  - ✅ T900a Verificar que maxLoss y protectionFloorPrice no requieren cambio (ya usan convención correcta)
  - ✅ T900b Actualizar comentario inline explicando la convención de signo de netPremiumPerShare

- [x] T901 [P] Corregir protectionCeilingPrice en CollarEngine — `analyze()`: cambiar `callLeg.strike + netPremiumPerShare` → `callLeg.strike - netPremiumPerShare`. Mismo origen que T900. Archivo: `collarEngine.ts`
  - Ejemplo: callStrike=460, netPremiumPerShare=-8.52 → Antes: 460 + (-8.52) = $451.48 ❌ → Después: 460 - (-8.52) = $468.52 ✅

- [x] T902 [P] Agregar alerta COLLAR_CALL_BELOW_MARKET en CollarEngine — emitir warning si callStrike <= currentPrice, indicando collar invertido. Archivo: `collarEngine.ts`

- [x] T903 [P] Corregir fórmula de break-even en ProtectivePutEngine — simplificar a `currentPrice + netPremiumPerShare` (válida para OTM/ATM/ITM). Eliminar uso de maxProtectionPerShare en este cálculo. Archivo: `protectivePutEngine.ts`

- [x] T904 [P] Corregir stopLossPrice en ProtectivePutEngine para usar riskTolerancePct dinámico — fórmula: buffer = clamp(riskTolerancePct * 0.5, 0.01, 0.10), stopLossPrice = putStrike * (1 - buffer). Fallback a stopLossBufferPct=0.03 cuando riskTolerancePct es 0 o ausente. Documentar el comportamiento del fallback en la tabla de opciones del motor. Archivo: `protectivePutEngine.ts`

- [x] T905 [P] Corregir pesos del exerciseRiskScore en CollarEngine — cambiar `downside * 0.6 + upside * 0.6` → `downside * 0.5 + upside * 0.5`. Los pesos anteriores sumaban 1.2 antes del clamp, ocultando un error matemático silencioso. Archivo: `collarEngine.ts`

### Phase 11: Covered Straddle — Corrección Conceptual (Completado)

- [x] T906 [P] Corregir denominación en CoveredStraddleEngine de "straddle" a "covered strangle" en todos los comentarios JSDoc, descripciones de payoff y mensajes de alertas. Mantener kind="covered_straddle" por compatibilidad de contratos. Archivo: `coveredStraddleEngine.ts`
  - ✅ T906a Actualizar descripción del payoff: aclarar que el riesgo al alza está limitado por las acciones long (no es verdaderamente ilimitado), y que el riesgo ilimitado real es solo a la baja vía el put short.
  - ✅ T906b Actualizar texto de alerta HIGH_VOLATILITY_PROFILE para decir "covered strangle" en lugar de "covered straddle"

### Phase 12: PayoffChart — Correcciones Visuales (Completado)

- [x] T907 [P] Corregir eje X del PayoffChart — lightweight-charts interpreta el eje X como timestamps Unix. Reemplazar `time: index` por `time: TIME_BASE + index` donde TIME_BASE = 1000000000. Implementar `tickMarkFormatter` y `timeFormatter` que convierten el time value de vuelta al precio del subyacente ($XXX). Archivo: `PayoffChart.tsx`
  - ✅ T907a Definir constante TIME_BASE = 1000000000 al inicio del componente
  - ✅ T907b Implementar tickMarkFormatter en timeScale options
  - ✅ T907c Verificar que los 4 charts (PP, Married Put, Collar, Straddle) muestran precios reales en eje X

- [x] T908 [P] Reemplazar etiqueta BE estática por tooltip hover en PayoffChart — usar subscribeCrosshairMove de lightweight-charts para detectar posición del cursor. Mostrar tooltip "Break-even: $XXX.XX" cuando el cursor esté dentro de ±5% del breakevenPrice. El tooltip sigue al cursor en X, fijo en Y=0 (PnL=0). Estilo: fondo #21262d, borde #30363d, texto #e6edf3, sin sombra agresiva. Archivo: `PayoffChart.tsx`
  - ✅ T908a Implementar overlay div posicionado con position:absolute sobre el contenedor del chart
  - ✅ T908b Calcular rango de activación: precio en cursor dentro de [breakevenPrice * 0.95, breakevenPrice * 1.05]
  - ✅ T908c Limpiar suscripción en cleanup de useEffect (unsubscribe)

### Phase 13: Tests y Validación (Completado)

- [x] T909 [P] Actualizar collarEngine.test.ts con caso de crédito neto — agregar test con callPremium=$9.26, putPremium=$0.74, currentPrice=$450.50, callStrike=$460, shares=100. Aserciones:
  - netPremiumPerShare ≈ -8.52
  - maxProfit ≈ 1002
  - protectionCeilingPrice ≈ 468.52
  Archivo: `tests/unit/strategies/coverage/collarEngine.test.ts`

- [x] T910 Actualizar protectivePutEngine.test.ts con caso ITM y con riskTolerancePct variable — verificar breakEvenPrice simplificado y stopLossPrice dinámico. Archivo: `tests/unit/strategies/coverage/protectivePutEngine.test.ts`

- [x] T911 Ejecutar regresión completa del módulo de cobertura: `npx vitest run tests/unit/strategies/coverage/` y `npx tsc --noEmit` en backend y frontend. Confirmar cero errores.

---

## Implementation Sequence

1. Phase 10 → Coverage Engine Bug Fixes (T900-T905)
2. Phase 11 → Covered Straddle Conceptual Correction (T906)
3. Phase 12 → PayoffChart Visual Corrections (T907-T908)
4. Phase 13 → Tests and Validation (T909-T911)

## Dependency Graph

```
Phase 10 (Coverage Engine Bug Fixes)
       │
       ▼
Phase 11 (Covered Straddle Correction)
       │
       ▼
Phase 12 (PayoffChart Visual Corrections)
       │
       ▼
Phase 13 (Tests and Validation)
```

## Parallel Opportunities

| Task Group | Can run in parallel with |
|------------|-------------------------|
| T900, T901, T902, T903, T904, T905 | Sequentially (same engine files) |
| T906 | Independent |
| T907, T908 | Sequentially (same component file) |
| T909, T910 | Each other (different test files) |
| T911 | Depends on all other tasks |

## Implementation Strategy

All tasks are completed and marked [x]. The phases were executed in order during the 2026-05-26 external review session. No pending work remains.
