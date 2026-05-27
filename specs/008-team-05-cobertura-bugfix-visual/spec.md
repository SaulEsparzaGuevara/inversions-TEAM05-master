# Spec: 008-team-05-cobertura-bugfix-visual

## Resumen

Feature para TEAM-05 (TurboPapus): correcciones de bugs críticos y mejoras visuales en el módulo de estrategias de cobertura, identificados en revisión externa post-implementación. Cubre errores de cálculo en CollarEngine, fórmulas de break-even y stop-loss en ProtectivePutEngine, y correcciones visuales en PayoffChart. Spec derivada de `specs/006-team-05-institucional-cobertura/spec.md`.

## Clarifications

### Session 2026-05-26

- Q: ¿Cuál es la raíz del bug de maxProfit y protectionCeilingPrice en CollarEngine?
  A: calculateNetPremiumPerShare() retorna putPremium - callPremium (positivo = débito neto, negativo = crédito neto). Las fórmulas de maxProfit y protectionCeilingPrice usaban + netPremiumPerShare en lugar de - netPremiumPerShare, lo que propagaba el signo al revés cuando el collar tiene crédito neto (callPremium > putPremium).

- Q: ¿La corrección del signo en CollarEngine afecta a maxLoss y protectionFloorPrice?
  A: No. maxLoss y protectionFloorPrice ya usaban la convención de signo correcta desde el inicio y no requieren modificación.

- Q: ¿Qué convención de fórmula es correcta para el break-even del Protective Put en casos ITM?
  A: breakEvenPrice = currentPrice + netPremiumPerShare. La fórmula anterior (currentPrice - maxProtectionPerShare + netPremiumPerShare) era correcta solo cuando el put está OTM (maxProtectionPerShare = 0). La fórmula simplificada es correcta para puts OTM, ATM e ITM.

- Q: ¿Cómo debe calcularse el stopLossPrice en ProtectivePutEngine usando riskTolerancePct?
  A: stopLossBuffer = clamp(riskTolerancePct * 0.5, 0.01, 0.10). stopLossPrice = putStrike * (1 - stopLossBuffer). Fallback al valor hardcoded stopLossBufferPct = 0.03 cuando riskTolerancePct es 0 o ausente.

- Q: ¿Por qué el eje X del PayoffChart mostraba "1970" en lugar de precios?
  A: lightweight-charts interpreta el eje X como timestamps Unix. Los payoff charts usaban índices enteros (0, 1, 2...) como time values, que corresponden a 1-3 de enero de 1970. La corrección usa TIME_BASE = 1000000000 + índice con un tickMarkFormatter que convierte de vuelta al precio del subyacente.

## Identificadores de backlog (rango derivado)

- T900..T911 (ver tasks.md para contexto y dependencias)

## Objetivo

Documentar y registrar las correcciones aplicadas al módulo de cobertura de TEAM-05 para que sean reproducibles en el repositorio del grupo, preservando trazabilidad 1:1 con la spec padre 006.

## Alcance Funcional

- Corregir bug de signo en maxProfit y protectionCeilingPrice del CollarEngine (RF-BUG-001).
- Corregir fórmula de break-even en ProtectivePutEngine para casos ITM (RF-BUG-002).
- Corregir stopLossPrice para usar riskTolerancePct dinámicamente (RF-BUG-003).
- Corregir pesos del exerciseRiskScore del CollarEngine (0.6+0.6 → 0.5+0.5) (RF-BUG-004).
- Corregir nombre conceptual del CoveredStraddleEngine de "straddle" a "covered strangle" en comentarios y descripciones (RF-BUG-005).
- Corregir eje X del PayoffChart (timestamps "1970" → precios reales) (RF-VIS-001).
- Reemplazar etiqueta estática "BE" por tooltip hover en PayoffChart (RF-VIS-002).

## Alcance No Funcional

- Ningún cambio de interfaz pública (contratos JSON, tipos, endpoints).
- Cero regresiones en las estrategias no afectadas (PP, Married Put, Straddle).
- Tests unitarios actualizados para cubrir el caso de crédito neto en collar (callPremium > putPremium).

## Restricciones

- No modificar artefactos canónicos globales: `001-inv-spec.md`, `001-inv-plan.md` ni `001-inv-tasks.md`.
- No modificar contratos JSON (strategy.v1.json, etc.).
- No modificar tipos públicos en coverageTypes.ts ni coverageStrategyContract.ts.
- No modificar otros engines (protectivePutEngine para el married_put path, coveredStraddleEngine para sus cálculos).

## Entregables

- CollarEngine corregido con fórmula de signo consistente.
- ProtectivePutEngine con break-even correcto para OTM/ATM/ITM y stopLoss dinámico.
- CoveredStraddleEngine con nomenclatura corregida.
- PayoffChart con eje X de precios reales y tooltip hover de break-even.
- Tests actualizados con caso de crédito neto.

## Criterios de Aceptación

- Collar con crédito neto (callPremium > putPremium) muestra maxProfit > 0 y protectionCeilingPrice > currentPrice.
- Break-even del Protective Put es correcto para puts OTM, ATM e ITM.
- stopLossPrice del Protective Put varía con riskTolerancePct.
- exerciseRiskScore del Collar no supera 1.0 antes del clamp.
- PayoffChart muestra precios reales ($225, $360, etc.) en eje X.
- Tooltip "Break-even: $XXX.XX" aparece al hacer hover ±5% del BE price.
- npx tsc --noEmit pasa sin errores en backend y frontend.
- Tests de collarEngine.test.ts incluyen caso crédito neto con aserciones numéricas.

## Dependencias

- Spec padre: `specs/006-team-05-institucional-cobertura/spec.md`
- Motores de cobertura existentes (collarEngine.ts, protectivePutEngine.ts, coveredStraddleEngine.ts).
- Componente PayoffChart.tsx existente.
- Tests unitarios existentes (`tests/unit/strategies/coverage/`).

## Riesgos y Mitigaciones

- Riesgo: Regresión en estrategias no afectadas → Mitigación: tests de regresión en PP, Married Put, Straddle.
- Riesgo: Romper compatibilidad de contratos → Mitigación: solo cambios internos en engines, sin tocar interfaces públicas.
- Riesgo: Eje X del PayoffChart confuso para usuarios → Mitigación: tickMarkFormatter muestra formato de precio legible.

## Trazabilidad

- Spec padre: `specs/006-team-05-institucional-cobertura/spec.md`
- Documentación del módulo: `specs/008-team-05-cobertura-bugfix-visual/`

## Notas de Implementación

- Los cambios ya fueron aplicados en sesión de revisión externa 2026-05-26.
- Archivos afectados: collarEngine.ts, protectivePutEngine.ts, coveredStraddleEngine.ts, PayoffChart.tsx, collarEngine.test.ts, protectivePutEngine.test.ts.

## Próximos pasos

1. Verificar que todos los tests pasan (T911).
2. Revisar que el tooltip hover del PayoffChart funciona correctamente en diferentes resoluciones.
3. Monitorear que no haya regresiones en estrategias no afectadas.
