# Options Strategies Core - Diana Inversiones Knowledge

> ID: INV-CORE-004  
> Generado: 2026-04-28  
> Scope: project - diana-inversions  
> Estado: 🟢 Completo

## TL;DR

Este core modela estrategias de opciones multi-leg como Wheel, Straddle e Iron Condor.  
Debe calcular payoff, Greeks, probabilidad aproximada y ventanas de riesgo antes de sugerir una estrategia.  
En v1 puede iniciar con simulacion/analisis sin autoejecucion de combinaciones complejas.

## Estrategias Minimas

- Wheel: cash-secured put + covered call.
- Long Straddle: compra call y put mismo strike/exp.
- Short Straddle: venta call y put mismo strike/exp (alto riesgo).
- Iron Condor: spread de calls + spread de puts.

## Entradas

- Cadena de opciones (strikes, expiraciones, IV)
- Precio spot y volatilidad implicita/historica
- Perfil de riesgo y capital disponible
- Reglas de margin y permisos de cuenta

## Salidas Estandar

- strategy_candidate
- net_premium
- max_profit
- max_loss
- breakevens
- greek_exposure (delta, gamma, theta, vega)
- confidence
- rationale

## Reglas Operativas

- No sugerir short premium sin validar margen y riesgo maximo.
- Evitar expiraciones iliquidas (open interest y spread amplios).
- Penalizar estructuras con slippage esperado alto.
- Mostrar siempre escenario peor caso.

## Analitica Minima

- Grafica de payoff al vencimiento.
- Sensibilidad por cambio de volatilidad (vega shock).
- Probabilidad aproximada de terminar dentro/fuera de rango objetivo.

## Integracion

La salida se entrega al core de confluencia IA para comparar contra senales de acciones spot.  
Si opciones y spot discrepan, sugerir neutralidad o reduccion de exposicion.
