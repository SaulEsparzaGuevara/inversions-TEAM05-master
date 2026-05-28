# Research: 010-team-05-audit-bugfix-engines

## Key Decisions

### Bug 1 — normalCdf: Abramowitz & Stegun Formula 26.2.17 (Documented 2026-05-28)

La aproximación de A&S para la CDF normal estándar es:

```
Φ(x) = 1 - φ(x) · (a₁k + a₂k² + a₃k³ + a₄k⁴ + a₅k⁵)  para x ≥ 0
k = 1 / (1 + p·|x|),   p = 0.2316419
```

donde `φ(x) = exp(-x²/2) / √(2π)` es la PDF normal estándar.

| Implementación | Multiplicando | x=0 resultado | Correcto |
|---------------|--------------|---------------|---------|
| Original | `1 - φ(0) = 0.6011` | ≈ 0.247 | ❌ |
| Corregida | `φ(0) = 0.3989` | ≈ 0.500 | ✅ |

**Impacto del error**: `estimateOptionPremium()` usa `normalCdf` para calcular `d₁` y `d₂` en Black-Scholes. Los payoff engines no se ven afectados porque usan primas del contrato (user input), pero cualquier módulo que estime primas como fallback producía valores incorrectos.

**Verificación de coeficientes**: Los coeficientes `[0.31938153, -0.356563782, 1.781477937, -1.821255978, 1.330274429]` son correctos — coinciden con A&S Table 26.2. Error máximo de la aproximación: `|ε(x)| < 7.5 × 10⁻⁸`.

---

### Bug 2 — Collar: Dos Bandas de Stop-Loss (Documented 2026-05-28)

Un collar tiene dos zonas de alerta operacional distintas:

| Banda | Cálculo | Significado |
|-------|---------|------------|
| Inferior | `putStrike × (1 - buffer)` | El put de protección está a punto de ser ejercido |
| Superior | `callStrike × (1 + buffer)` | El cap del call está siendo superado — upside capturado |

`Math.min(low, high)` siempre devuelve `low` porque `putStrike < callStrike` en todo collar válido. La banda superior nunca era expuesta al consumer.

**Retrocompatibilidad**: `stopLossPrice = stopLossLowPrice` preserva comportamiento para consumers que solo leen el campo original. Los campos nuevos son opcionales en `RiskMetrics`.

---

### Bug 3 — TrendEngine: PRNG Determinístico con LCG (Documented 2026-05-28)

| Engine | Fallback method | Determinístico |
|--------|----------------|----------------|
| `institutionalZonesEngine` | `Math.sin` / `Math.cos` (trigonometría) | ✅ |
| `institutionalTrendEngine` | `Math.random()` | ❌ → corregido |

**Algoritmo LCG (Linear Congruential Generator)**:
```
s_{n+1} = (s_n × 1664525 + 1013904223) mod 2³²
```
Parámetros de Numerical Recipes. Período = 2³². Suficiente para `slowMaPeriod + 60 ≈ 260` llamadas por sesión.

**Seed**: suma de `charCodeAt()` de cada carácter del ticker. Colisiones entre tickers rarísimas dado que los tickers de US equity son mayúsculas ASCII (65-90) y de longitud 1-5.

**Alternativa descartada**: `crypto.getRandomValues()` con seed — más correcto estadísticamente pero innecesario para datos sintéticos de fallback.

---

### Bug 4 — FOMC vs CPI: Calendario de Eventos Macro (Documented 2026-05-28)

**Patrón real de publicación CPI (BLS)**:
- El BLS publica el calendario de CPI con ~1 año de anticipación.
- Típicamente cae en **martes de la 2da semana** del mes siguiente al período de referencia.
- Rango histórico 2020-2026: entre el 8 y el 15 del mes, generalmente martes o miércoles.

**Patrón real de reuniones FOMC (Fed)**:
- La Fed publica el calendario con ~2 años de anticipación.
- 8 reuniones por año, en semanas no fijas; las conferencias de prensa suelen ser miércoles.
- Los meses sin reunión FOMC son: febrero, abril, agosto, octubre (aproximado).

**Decisión de implementación**: Aproximación mínima que separa visualmente los eventos. La corrección ideal (calendario hardcodeado de fechas exactas) se documenta como deuda técnica.

| Evento | Antes | Después | Aproximación |
|--------|-------|---------|-------------|
| CPI | 2do miércoles | 2do martes | ~70% de precisión histórica |
| FOMC | 2do miércoles | 2do miércoles (sin cambio) | ~60% de precisión histórica |

---

### Bug 5 — Triple Witching: Deduplicación de Eventos (Documented 2026-05-28)

El tercer viernes de cada mes de triple witching (mar/jun/sep/dic) es simultáneamente:
- **Monthly/Quarterly OpEx**: expiración de opciones de acciones e índices
- **Triple Witching**: coincidencia de expiración de opciones de índices, futuros de índices y opciones de futuros

El código tenía dos bloques que, de forma independiente, llamaban a `findNthWeekday(year, month, 3, OPEX_WEEKDAY)` — produciendo la misma fecha — y hacían `events.push()` dos veces.

**Fix**: El bloque de Triple Witching busca el evento `quarterly_opex` existente para esa fecha. Si lo encuentra, actualiza sus metadatos (label, significance, directionalBias) en lugar de duplicar. Esto preserva la representación de un solo evento por fecha con el máximo significance (0.95).

---

### Bug 6 — Sesgo Estacional: Evidencia Histórica (Documented 2026-05-28)

**Evidencia empírica del sesgo mensual del S&P 500 (1950-2023)**:

| Mes | Retorno promedio | Clasificación correcta |
|-----|-----------------|----------------------|
| Enero | +1.1% | neutral |
| Febrero | -0.1% | neutral |
| Marzo | +1.1% | neutral |
| Abril | +1.5% | bullish |
| Mayo | +0.2% | neutral (border) |
| Junio | +0.7% | neutral/bullish |
| Julio | +1.4% | bullish |
| Agosto | +0.1% | neutral |
| Septiembre | **-0.7%** | **bearish** ← el peor |
| Octubre | +0.9% (volátil) | neutral |
| Noviembre | **+1.7%** | **bullish** ← 2do mejor |
| Diciembre | **+1.5%** | **bullish** ← "Santa rally" |

Fuentes: Hirsch, *Stock Trader's Almanac* (edición 2024); análisis de retornos mensuales LPL Financial Research.

**Error original**: La implementación devolvía `"bearish"` para oct-dic como bloque monolítico, ignorando la evidencia estadística más básica de estacionalidad equity.

---

### Bug 7 — Test protectivePutEngine: Escenario de Stop-Loss (Documented 2026-05-28)

| Parámetro | Valor | riskBuffer | stopLossPrice | currentPrice≤stopLoss |
|-----------|-------|-----------|--------------|----------------------|
| `riskTolerancePct=0.3` | alto riesgo | `clamp(0.15, 0.01, 0.10) = 0.10` | 95×0.90 = **85.5** | 90 > 85.5 → ❌ no dispara |
| `riskTolerancePct=0` | fallback | 0.03 | 95×0.97 = **92.15** | 90 ≤ 92.15 → ✅ dispara |

El escenario del test es: stock cayó de su precio original a 90 mientras el put está en 95 (ITM). Con el buffer por defecto de 3%, el stop-loss está a 92.15 — el stock ya cruzó ese nivel → `STOP_LOSS_TRIGGERED` correcto.

---

### Bug 8 — confluenceViewPresets: Autenticación Consistente (Documented 2026-05-28)

El endpoint `/confluence-columns` usaba `supabaseClient` (cliente sin credenciales de usuario) en lugar de `createAuthenticatedClient(token)` (cliente con el JWT del usuario).

**Problema de seguridad**: `supabaseClient` usa la service key o anonymous key del servidor — omite las políticas RLS de Supabase. El endpoint debería respetar el contexto de autenticación del usuario.

**Fix**: `createAuthenticatedClient(req.authContext.token)` es consistente con todos los demás endpoints del archivo y respeta RLS.

**Efecto en test**: El mock de Vitest ya interceptaba `createAuthenticatedClient`. Al pasar de `supabaseClient` a `createAuthenticatedClient`, el mock funciona correctamente y el test pasa sin cambios en el mock.
