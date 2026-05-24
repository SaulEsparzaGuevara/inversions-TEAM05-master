# Buy/Sell Signals Core - Diana Inversiones Knowledge

> ID: INV-CORE-003  
> Generado: 2026-04-28  
> Scope: project - diana-inversions  
> Estado: 🟢 Completo

## TL;DR

Este core transforma evidencia tecnica/fundamental en senales accionables de compra o venta.  
No decide en aislamiento: debe operar como agregador de reglas con score, confianza y explicabilidad.  
Toda senal debe incluir condiciones de invalidez y gestion de riesgo.

## Entradas

- technical_bias_score
- fundamental_score
- market_regime (trend/range/volatile)
- usuario: perfil riesgo y cores activos

## Salidas Estandar

- signal: BUY | SELL | HOLD
- strength: WEAK | MEDIUM | STRONG
- entry_zone
- stop_loss
- take_profit_levels
- risk_reward_estimate
- confidence: 0..1
- rationale: lista priorizada

## Motor de Reglas

- Regla de consenso: requerir quorum minimo de evidencia.
- Regla de conflicto: si tecnico y fundamental divergen fuerte, degradar a HOLD.
- Regla de volatilidad: ampliar stops o reducir tamano en ATR alto.
- Regla de riesgo evento: bloquear STRONG cerca de eventos binarios.

## Ejemplo de Umbrales

- BUY STRONG: technical_bias >= 60, confluencia >= 0.75, riesgo evento bajo.
- SELL STRONG: technical_bias <= -60, confluencia >= 0.75, confirmacion de tendencia.
- HOLD: confluencia < 0.55 o conflicto de fuentes.

## Seguridad de Senales

- Nunca emitir senal sin stop_loss sugerido.
- Registrar version de reglas para auditoria.
- Evitar cambios bruscos de senal por ruido de un solo tick.

## Integracion

Este core entrega la senal final de capa analitica; el usuario siempre confirma antes de envio a broker.
