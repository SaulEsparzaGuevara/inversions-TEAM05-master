# 002-inv-indicator-signal-logic — Indicator Signal Logic

## Objetivo

Transformar lectura de indicadores en evidencia estructurada para BUY/SELL/HOLD, evitando ruido y sobreajuste.

## Fuentes canonicas

- 001-inv-ucc.md#Descripcion del Requerimiento
- spec.md#FR-001

## Knowledge docs

- local/cores/003-buy-sell-signals-core.md

## Criterios de exito

- Reglas de activacion versionadas.
- Umbrales claros por contexto.
- Explicabilidad por señal.

## Fallback

Si falta esta skill, generar señal con reglas mínimas del engine y registrar gap 002-inv-indicator-signal-logic.
