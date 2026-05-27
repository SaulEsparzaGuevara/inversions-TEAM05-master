# Technical Analysis Core - Diana Inversiones Knowledge

> ID: INV-CORE-001  
> Generado: 2026-04-28  
> Scope: project - diana-inversions  
> Estado: 🟢 Completo

## TL;DR

Este core calcula estructura tecnica del mercado para cada simbolo: tendencia, soportes, resistencias, momentum y volatilidad.  
Debe operar en multiples temporalidades y devolver un resultado normalizado para el motor de confluencia.  
No ejecuta ordenes, solo produce evidencia tecnica trazable.

## Entradas

- Symbol
- Temporalidades activas (ej. 5m, 15m, 1h, 1d)
- Ventana historica OHLCV
- Configuracion de indicadores habilitados por usuario

## Salidas Estandar

- trend_state: UP | DOWN | SIDEWAYS
- support_levels: lista de niveles con score
- resistance_levels: lista de niveles con score
- indicators: valores por indicador
- technical_bias_score: -100..100
- confidence: 0..1
- evidence: lista de reglas activadas

## Modulos Minimos

- Trend detector: EMA slope, HH/HL vs LH/LL, ADX filter.
- Support/Resistance detector: pivots, volume profile nodes, round numbers.
- Momentum pack: RSI, MACD histogram, rate of change.
- Volatility pack: ATR, Bollinger width, regime low/high vol.
- Breakout validator: cierre confirmado + volumen relativo.

## Reglas Base Recomendadas

- Tendencia alcista valida si EMA20 > EMA50 y ADX > umbral.
- Soporte fuerte si nivel fue tocado >= N veces con rechazo.
- Ruptura valida solo con cierre y volumen relativo > 1.2x.
- Evitar senales contra tendencia mayor salvo setup de reversal explicitado.

## Multi-Timeframe

- Timeframe mayor define contexto (1h/1d).
- Timeframe intermedio confirma setup (15m/1h).
- Timeframe menor define trigger de entrada (5m/15m).
- Penalizar setups con conflicto fuerte entre temporalidades.

## Riesgos y Mitigaciones

- Overfitting de reglas tecnicas: usar pocos indicadores robustos.
- Latencia de feed: invalidar senales con datos stale.
- Ruido en baja liquidez: filtrar por volumen minimo.

## Integracion con Confluence AI

Este core produce `technical_bias_score` y `confidence` para fusion con otros cores.  
Debe incluir explicaciones humanas por senal: por que, en que timeframe y con que evidencia.
