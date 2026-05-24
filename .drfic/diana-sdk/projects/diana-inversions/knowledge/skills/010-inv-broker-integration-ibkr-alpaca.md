# 010-inv-broker-integration-ibkr-alpaca — Broker Integration IBKR Alpaca

## Objetivo

Implementar ejecución asistida y sincronización operativa con IBKR y Alpaca de forma desacoplada.

## Fuentes canonicas

- spec.md#FR-008
- 001-inv-spec.md#3

## Knowledge docs

- local/brokers/001-ibkr-tws-api.md
- local/brokers/002-ibkr-client-portal.md
- local/brokers/003-alpaca-api.md

## Criterios de exito

- Mapeo de estados de orden consistente.
- Gestión de errores y reconexión robusta.
- Idempotencia y trazabilidad por broker.

## Fallback

Si falta esta skill, aplicar integración mínima por broker y reportar gap 010-inv-broker-integration-ibkr-alpaca.
