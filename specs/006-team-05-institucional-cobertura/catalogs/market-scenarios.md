# Catálogo de Escenarios Extremos — TEAM-05

Propósito: Validar estrategias de cobertura (Protective Put, Married Put, Collar Put, Covered Straddle) bajo condiciones límite de mercado.
Fuentes de datos gratuitas sugeridas: Yahoo Finance (OHLC histórica), Alpha Vantage (free tier), FRED (VIX data).

---

## ST-01: Stress Test (-25% en 1 mes)

Inspiración histórica: COVID Crash (feb-mar 2020).

| Campo | Valor |
|-------|-------|
| **Descripción** | Caída sostenida del 25% en 30 días con aumento progresivo de volatilidad |
| **Condiciones** | SPY 338 → 223 (-25%), VIX de 15 → 82, volumen 3x promedio |
| **Periodo referencia** | 2020-02-19 → 2020-03-23 |
| **Fixture asociado** | Fixture B (Stress tail) |
| **Impacto Protective Put** | Put ATM se vuelve ITM profundo; ganancia máxima alcanzada |
| **Impacto Married Put** | Protección activa; pérdida limitada a prima pagada |
| **Impacto Collar Put** | Put ITM protege, call corta limita ganancia si hay rebote |
| **Impacto Covered Straddle** | Alta volatilidad aumenta prima vendida pero riesgo ilimitado |
| **Criterio validación** | Todas las estrategias deben reportar drawdown < 5% adicional sobre el costo de cobertura |

---

## ST-02: Tail Event (-40% en una sesión)

Inspiración histórica: Flash Crash 2010 (intradiario), o crashes bursátiles históricos.

| Campo | Valor |
|-------|-------|
| **Descripción** | Caída intradiaria del 40% en un instrumento específico (gap down + selling climax) |
| **Condiciones** | Gap down de -20% en apertura, continuación hasta -40% en 2 horas, IV implícita > 150% |
| **Periodo referencia** | 2010-05-06 (Flash Crash SPY ~9% intraday), extrapolado a escenario extremo |
| **Fixture asociado** | Fixture B (Stress tail) |
| **Impacto Protective Put** | Deep ITM; protección máxima; ejercicio automático recomendado |
| **Impacto Married Put** | Put deep ITM ejerce, pérdida reducida drásticamente |
| **Impacto Collar Put** | Put deep ITM protege, call corta OTM sin valor |
| **Impacto Covered Straddle** | **ALERTA**: riesgo ilimitado materializado; stop-loss obligatorio |
| **Criterio validación** | Covered Straddle debe ejecutar stop-loss antes de -20%; las demás deben limitar pérdida neta < 10% |

---

## ST-03: Zero Liquidity

Inspiración histórica: Small caps en pánico (ej. marzo 2020, bolsas emergentes).

| Campo | Valor |
|-------|-------|
| **Descripción** | El instrumento objetivo pierde liquidez: cero Open Interest en opciones, spreads > 10% del precio |
| **Condiciones** | ADV < 5,000 acciones, OI < 100 contratos en todos los strikes, bid-ask spread > 10% |
| **Periodo referencia** | Pequeños emisores durante COVID, o corporate events con suspensión temporal |
| **Fixture asociado** | Fixture C (Low-liquidity) |
| **Impacto Protective Put** | No hay strikes elegibles con liquidez suficiente; cobertura no disponible |
| **Impacto Married Put** | Ídem; sistema debe rechazar la operación y marcar `low_liquidity` |
| **Impacto Collar Put** | Ídem; faltan strikes para put y call |
| **Impacto Covered Straddle** | No ejecutable por falta de liquidez |
| **Criterio validación** | Sistema debe rechazar todas las estrategias con flag `low_liquidity: true` y mensaje claro al usuario |

---

## ST-04: Alta Volatilidad (VIX > 40)

Inspiración histórica: COVID (VIX 82), 2008 crisis (VIX 80), 2011 debt ceiling (VIX 48).

| Campo | Valor |
|-------|-------|
| **Descripción** | Volatilidad extrema con VIX sostenido sobre 40; primas de opciones 5x-10x su nivel normal |
| **Condiciones** | VIX > 40 por más de 5 días hábiles, IV > 80% en opciones ATM, primas elevadas 5-10x |
| **Periodo referencia** | 2020-03-16 → 2020-04-20 (VIX > 40), 2008-10 → 2008-11 |
| **Fixture asociado** | Fixture A (Nominal con parámetros extremos) |
| **Impacto Protective Put** | Prima muy cara; costo-beneficio desfavorable; sistema debe alertar |
| **Impacto Married Put** | Prima alta reduce atractivo; sugerir esperar o usar strikes más lejanos |
| **Impacto Collar Put** | Prima vendida del call compensa parcialmente prima del put; estrategia viable |
| **Impacto Covered Straddle** | Primas altas = ingresos altos, pero riesgo de movimiento adverso es máximo |
| **Criterio validación** | Sistema debe mostrar advertencia de volatilidad extrema y recomendar Collar Put sobre las demás por compensación de primas |

---

## ST-05: Earnings Gap

| Campo | Valor |
|-------|-------|
| **Descripción** | Movimiento posterior a earnings que supera las expectativas del mercado en +25% o -25% |
| **Condiciones** | Gap de apertura > 15%, IV collapse post-earnings (50% → 20%), opciones pierden valor extrínseco |
| **Periodo referencia** | Cualquier earnings season con sorpresas mayores (ej. NVDA, META, TSLA post-earnings) |
| **Fixture asociado** | Fixture A + ajuste de escenario |
| **Impacto Protective Put** | Put pierde valor extrínseco post-earnings; protección contra gap funciona si se compró antes |
| **Impacto Married Put** | Si gap es positivo, put expira OTM; si negativo, put protege |
| **Impacto Collar Put** | Riesgo de que el call corto sea ejercido si gap es positivo fuerte |
| **Impacto Covered Straddle** | Riesgo máximo: gap en cualquier dirección genera pérdida en una pata |
| **Criterio validación** | Sistema debe recomendar no usar Covered Straddle en ventana de earnings |

---

## ST-06: Sector Crash (contagio)

Inspiración histórica: 2008 Financials, 2022 Tech sell-off, 2023 Regional Banks.

| Campo | Valor |
|-------|-------|
| **Descripción** | Un sector completo cae > 30% en una semana, arrastrando instrumentos correlacionados |
| **Condiciones** | Sector index > -30% en 5 días, correlación entre componentes > 0.8, pánico generalizado |
| **Periodo referencia** | 2008-09 (Financials), 2022-01 (Tech/Nasdaq -25%), 2023-03 (Regional Banks) |
| **Fixture asociado** | Fixture B (Stress tail) |
| **Impacto Protective Put** | Protege si el instrumento está en el sector afectado; cobertura sectorial sugerida |
| **Impacto Married Put** | Protección activa; pérdida acotada |
| **Impacto Collar Put** | Put protege, call corta probablemente OTM si caída continúa |
| **Impacto Covered Straddle** | No recomendado; alta probabilidad de movimiento direccional violento |
| **Criterio validación** | Sistema debe detectar correlación sectorial y alertar sobre concentración de riesgo |

---

## ST-07: Flash Crash Recovery

Inspiración histórica: Flash Crash 2010 (recuperación en 20 minutos).

| Campo | Valor |
|-------|-------|
| **Descripción** | Caída vertical (> 10% en 5 minutos) seguida de recuperación completa en < 1 hora |
| **Condiciones** | Caída > 10% en 5 min, recuperación > 8% en 30 min, volumen 50x normal en caída |
| **Periodo referencia** | 2010-05-06 14:32-14:56 ET (Flash Crash), 2014-10-15 (Treasury Flash Crash) |
| **Fixture asociado** | Fixture B (Stress tail) con recovery |
| **Impacto Protective Put** | Put comprado antes del crash se beneficia; comprado durante es caro y se deprecia al recuperar |
| **Impacto Married Put** | Put protege contra el gap down; recuperación hace que la posición total se recupere |
| **Impacto Collar Put** | Put protege durante caída; call corta limita ganancia en recuperación |
| **Impacto Covered Straddle** | Alta probabilidad de pérdida en ambas direcciones por la velocidad del movimiento |
| **Criterio validación** | Estrategias deben evaluarse con datos intradiarios (no solo cierre); sistema debe alertar sobre eventos de recuperación rápida |

---

## Resumen de Cobertura por Estrategia

| Estrategia / Escenario | ST-01 | ST-02 | ST-03 | ST-04 | ST-05 | ST-06 | ST-07 |
|------------------------|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
| Protective Put | ✅ | ✅ | ⚠️ N/A | ⚠️ Cara | ✅ | ✅ | ✅ |
| Married Put | ✅ | ✅ | ⚠️ N/A | ⚠️ Cara | ✅ | ✅ | ✅ |
| Collar Put | ✅ | ✅ | ⚠️ N/A | ✅ | ⚠️ Call | ✅ | ✅ |
| Covered Straddle | ⚠️ Riesgo | ❌ Peligro | ⚠️ N/A | ⚠️ Riesgo | ❌ No | ❌ No | ❌ Peligro |

✅ Recomendada | ⚠️ Precaución | ❌ No recomendada | N/A No aplica

---

## Notas para Implementación

1. Los datos históricos de referencia pueden obtenerse gratuitamente de Yahoo Finance vía `yfinance` (Python) o APIs REST gratuitas
2. Cada escenario debe tener un fixture de datos asociado en `tests/fixtures/coverage/`
3. Los criterios de validación deben traducirse a aserciones en los tests de integración
4. El motor de simulación (T117) debe soportar estos escenarios como presets configurables

**OWNER**: TEAM-05
**Estado**: PENDIENTE — pendiente crear fixtures de datos para cada escenario
