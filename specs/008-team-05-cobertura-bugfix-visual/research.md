# Research: 008-team-05-cobertura-bugfix-visual

## Key Decisions

### netPremiumPerShare Sign Convention in CollarEngine (Documented 2026-05-26)

| Escenario | netPremiumPerShare | Fórmula correcta | Efecto en maxProfit/ceiling |
|-----------|-------------------|------------------|------------------------------|
| Collar débito neto (putPremium > callPremium) | > 0 | callStrike - currentPrice - netPremiumPerShare | Reduce maxProfit y ceiling (pagar prima neta cuesta) |
| Collar crédito neto (callPremium > putPremium) | < 0 | callStrike - currentPrice - netPremiumPerShare | Aumenta maxProfit y ceiling (call genera más que el costo del put) |

maxLoss y protectionFloorPrice no se ven afectados porque ya usaban la convención correcta.

### PayoffChart Time Axis — lightweight-charts Constraint (Documented 2026-05-26)

- lightweight-charts v4 interpreta el eje X siempre como Unix timestamp.
- Los payoff charts son curvas precio vs PnL, no series de tiempo.
- Solución adoptada: TIME_BASE = 1000000000 (Sep 2001) + índice. tickMarkFormatter convierte de vuelta a precio del subyacente.
- Alternativa descartada: ISeriesPrimitive para ejes categóricos — más invasivo, no necesario para este caso.

### exerciseRiskScore Weight Correction (Documented 2026-05-26)

- Pesos anteriores 0.6 + 0.6 sumaban 1.2 antes del clamp01.
- El clamp silenciaba el error matemático pero los pesos no tenían justificación como diseño intencional.
- Corrección a 0.5 + 0.5: cada lado contribuye equitativamente, score máximo = 1.0 sin necesidad de clamp en el caso típico.

### Covered Straddle vs Covered Strangle Nomenclature (Documented 2026-05-26)

- Un straddle puro requiere ambas opciones al mismo strike.
- La estructura implementada (put short + call short en strikes distintos) es un strangle.
- El kind="covered_straddle" se mantiene por compatibilidad con contratos existentes y para no romper consumers.
- El perfil de riesgo es asimétrico: riesgo ilimitado solo a la baja (put short), no en ambas direcciones como implicaría "straddle".

### Stop-Loss Buffer Formula (Documented 2026-05-26)

| riskTolerancePct | buffer calculado | stopLossBuffer efectivo | stopLossPrice (putStrike=440) |
|------------------|-----------------|------------------------|------------------------------|
| 0.00 (fallback) | — | 0.03 | 426.80 |
| 0.02 | 0.01 | 0.01 | 435.60 |
| 0.10 | 0.05 | 0.05 | 418.00 |
| 0.30 | 0.15 | 0.10 | 396.00 |

Fórmula: buffer = clamp(riskTolerancePct * 0.5, 0.01, 0.10). Fallback a 0.03 cuando riskTolerancePct es 0 o ausente.

### Break-Even Formula Simplification (Documented 2026-05-26)

- Fórmula anterior: currentPrice - maxProtectionPerShare + netPremiumPerShare
- Fórmula corregida: currentPrice + netPremiumPerShare
- maxProtectionPerShare era 0 para puts OTM (caso que funcionaba) pero distinto de 0 para puts ITM, causando error.
- La fórmula simplificada es algebraicamente correcta para OTM, ATM e ITM.
