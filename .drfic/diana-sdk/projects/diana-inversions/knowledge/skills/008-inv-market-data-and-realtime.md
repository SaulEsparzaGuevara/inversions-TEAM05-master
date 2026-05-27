# 008-inv-market-data-and-realtime — Market Data and Realtime

## Objetivo

Sostener frescura y confiabilidad de market data para señales activas con latencia controlada.

## Fuentes canonicas

- spec.md#SC-006
- 001-inv-ucc.md#Descripcion del Requerimiento

## Knowledge docs

- local/domain/002-market-data.md
- local/patterns/002-realtime-market-feed.md

## Criterios de exito

- p95 de frescura dentro de objetivo.
- Failover y reconexión definidos.
- Contrato normalizado de datos.

## Fallback

Si falta esta skill, usar ingestion básica del engine y reportar gap 008-inv-market-data-and-realtime.
