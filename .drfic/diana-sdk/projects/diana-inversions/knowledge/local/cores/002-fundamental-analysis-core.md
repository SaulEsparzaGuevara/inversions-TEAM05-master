# Fundamental Analysis Core - Diana Inversiones Knowledge

> ID: INV-CORE-002  
> Generado: 2026-04-28  
> Scope: project - diana-inversions  
> Estado: 🟢 Completo

## TL;DR

Este core evalua calidad fundamental de emisoras para evitar senales tecnicas sin respaldo de negocio.  
Debe combinar salud financiera, valuacion relativa y riesgo macro en un score interpretable.  
Su salida se usa como filtro o ponderador del motor de confluencia.

## Entradas

- Estados financieros historicos
- Multiples de valuacion por sector
- Calendario de earnings y guidance
- Tasas, inflacion, riesgo macro relevante

## Salidas Estandar

- fundamental_score: 0..100
- valuation_state: UNDERVALUED | FAIR | OVERVALUED
- quality_flags: margen, deuda, crecimiento, FCF
- event_risk: LOW | MEDIUM | HIGH
- confidence: 0..1
- evidence: razones clave

## Factores Nucleares

- Calidad: ROE/ROIC, margen operativo, estabilidad de ingresos.
- Solvencia: deuda neta/EBITDA, cobertura de intereses.
- Crecimiento: revenue CAGR, EPS trend.
- Valuacion: P/E, EV/EBITDA, P/S vs pares sectoriales.
- Riesgo evento: earnings cercanos, guidance incierto, litigios.

## Reglas de Decision

- Si event_risk = HIGH previo a earnings, reducir peso de senal direccional.
- Penalizar empresas con deterioro secuencial de margenes y deuda creciente.
- Evitar etiqueta UNDERVALUED si el descuento depende de riesgo estructural no resuelto.

## Horizonte

- Swing/inversion: alta relevancia.
- Intradia: usar como filtro de riesgo, no como trigger principal.

## Integracion

El `fundamental_score` modula tamano de posicion sugerido y umbrales de activacion de senales.  
El core debe exponer explicaciones simples para usuario no experto.
