# Plan de Implementación: 008-team-05-cobertura-bugfix-visual

## 1) Contexto y Autoridad

- **Feature**: `specs/008-team-05-cobertura-bugfix-visual/`
- **Equipo**: TEAM-05 (TurboPapus)
- **Iniciativa**: `001-inversions`
- **Engine**: Speckit (`stage=plan`)
- **Idioma**: es
- **Política de autoridad**: `diana_canon_strict`

Este plan está subordinado a:
1. `.drfic/diana-sdk/projects/diana-inversions/inv-constitution.md`
2. `specs/006-team-05-institucional-cobertura/spec.md`
3. `specs/008-team-05-cobertura-bugfix-visual/spec.md`

Ante conflicto, prevalece el canon Diana.

## 2) Entradas Canónicas Cargadas

- Spec de feature padre: `specs/006-team-05-institucional-cobertura/spec.md`
- Plan de feature padre: `specs/006-team-05-institucional-cobertura/plan.md`
- Spec de feature vigente: `specs/008-team-05-cobertura-bugfix-visual/spec.md`

## 3) Objetivo del Plan

Documentar y registrar las correcciones aplicadas al módulo de cobertura de TEAM-05 para que sean reproducibles en el repositorio del grupo, preservando trazabilidad 1:1 con la spec padre 006.

## 4) Skills Requeridas (Speckit `plan`)

- `004-inv-options-strategy-engine`
- `011-inv-portfolio-and-performance-analytics`

## 5) Diseño de Ejecución por Flujos

### Flujo A — Correcciones de Cálculo (CollarEngine + ProtectivePutEngine)

**Objetivo**: Corregir bugs de signo y fórmulas incorrectas en engines de cobertura.

Inputs:
- `collarEngine.ts` — bugs en maxProfit, protectionCeilingPrice, exerciseRiskScore.
- `protectivePutEngine.ts` — bugs en breakEvenPrice, stopLossPrice.

Outputs:
- Engines corregidos con convención de signo consistente (`- netPremiumPerShare`).
- stopLossPrice dinámico basado en riskTolerancePct.
- Pesos de exerciseRiskScore normalizados (0.5+0.5).

Archivos afectados:
- `collarEngine.ts` (maxProfit, protectionCeilingPrice, exerciseRiskScore)
- `protectivePutEngine.ts` (breakEvenPrice, stopLossPrice)

### Flujo B — Corrección Conceptual (CoveredStraddleEngine)

**Objetivo**: Corregir denominación incorrecta "straddle" → "covered strangle".

Inputs:
- `coveredStraddleEngine.ts` con comentarios y descripciones incorrectas.

Outputs:
- Comentarios JSDoc, descripciones de payoff y alertas actualizados.
- Perfil de riesgo asimétrico documentado correctamente.
- kind="covered_straddle" mantenido por compatibilidad.

Archivos afectados:
- `coveredStraddleEngine.ts` (comentarios, JSDoc, alertas)

### Flujo C — Correcciones Visuales (PayoffChart)

**Objetivo**: Corregir eje X con timestamps incorrectos y reemplazar etiqueta BE estática.

Inputs:
- `PayoffChart.tsx` con `time: index` (Unix epoch → "1970") y etiqueta BE fija.

Outputs:
- Eje X con precios reales via TIME_BASE + tickMarkFormatter.
- Tooltip hover de break-even con subscribeCrosshairMove.

Archivos afectados:
- `PayoffChart.tsx` (time mapping, tickMarkFormatter, subscribeCrosshairMove)

### Flujo D — Tests y Validación

**Objetivo**: Actualizar tests para cubrir casos de crédito neto y validar correcciones.

Inputs:
- `collarEngine.test.ts` existente.
- `protectivePutEngine.test.ts` existente.

Outputs:
- Tests actualizados con caso de crédito neto y aserciones numéricas.
- Regresión completa del módulo de cobertura.

Archivos afectados:
- `tests/unit/strategies/coverage/collarEngine.test.ts`
- `tests/unit/strategies/coverage/protectivePutEngine.test.ts`

## 6) Estrategia de Pruebas

Test nuevo — Collar crédito neto:
- callPremium=$9.26, putPremium=$0.74, currentPrice=$450.50, callStrike=$460
- netPremiumPerShare = 0.74 - 9.26 = -8.52 (crédito neto)
- maxProfit esperado = max(0, 460 - 450.50 - (-8.52)) * 100 = $1,002
- protectionCeilingPrice esperado = 460 - (-8.52) = $468.52

Test regresión — PP con put OTM:
- breakEvenPrice = currentPrice + prima.

Test regresión — PP con riskTolerancePct=0.10:
- stopLossPrice = putStrike * (1 - 0.05).

Verificación:
- `npx vitest run tests/unit/strategies/coverage/` — todos pasan.
- `npx tsc --noEmit` en backend y frontend — cero errores.

## 7) Restricciones y Guardrails

- No modificar contratos JSON (strategy.v1.json, etc.).
- No modificar tipos públicos en coverageTypes.ts ni coverageStrategyContract.ts.
- No modificar otros engines (protectivePutEngine para el married_put path, coveredStraddleEngine para sus cálculos).
- kind="covered_straddle" se mantiene por compatibilidad de contratos.

## 8) Dependencias y Secuenciación

Dependencias:
- Motores de cobertura existentes (collarEngine.ts, protectivePutEngine.ts, coveredStraddleEngine.ts).
- Componente PayoffChart.tsx existente.
- Tests unitarios existentes.

Secuencia recomendada:
1. Flujo A — Correcciones de cálculo (CollarEngine + ProtectivePutEngine)
2. Flujo B — Corrección conceptual (CoveredStraddleEngine)
3. Flujo C — Correcciones visuales (PayoffChart)
4. Flujo D — Tests y validación

## 9) Ready / Gaps

- **Ready**: READY_FOR_SPECKIT_TASKS
- **Gaps**: Pendiente fixtures de datos para escenarios de crédito neto extremo.
