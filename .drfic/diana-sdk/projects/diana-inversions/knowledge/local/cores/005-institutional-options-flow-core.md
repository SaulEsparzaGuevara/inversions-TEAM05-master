# Institutional Options Flow Core - Diana Inversiones Knowledge

> ID: INV-CORE-005  
> Generado: 2026-04-28  
> Scope: project - diana-inversions  
> Estado: 🟢 Completo

## TL;DR

Este core estima interes institucional en opciones por strike y expiracion usando proxies de flujo y posicionamiento.  
No identifica actores individuales, pero detecta zonas de actividad anomala con valor operativo.  
Debe tratarse como evidencia probabilistica, no verdad absoluta.

## Entradas

- Open interest por strike/exp
- Volumen intradia de opciones
- Cambios de OI entre sesiones
- Distribucion call/put y skew de IV
- Datos de bloques o prints inusuales si disponibles

## Salidas Estandar

- institutional_interest_zones: lista por strike/expiry
- direction_bias: BULLISH | BEARISH | NEUTRAL
- gamma_zones: soporte/resistencia potencial por exposicion
- flow_strength_score: 0..100
- confidence: 0..1
- evidence

## Heuristicas Utiles

- Volumen inusual + incremento de OI sugiere apertura de posiciones.
- Volumen alto sin cambio de OI sugiere cierre/rollover.
- Concentraciones de gamma pueden actuar como imanes de precio.
- Put/call skew extremo puede anticipar stress o cobertura.

## Riesgos de Interpretacion

- No todo flujo grande es direccional; puede ser hedge.
- Datos retrasados o incompletos distorsionan inferencia.
- Eventos macro invalidan patrones historicos de flujo.

## Integracion

Este core no debe generar BUY/SELL directo; aporta contexto de posicionamiento para ajustar confianza de otras senales.
