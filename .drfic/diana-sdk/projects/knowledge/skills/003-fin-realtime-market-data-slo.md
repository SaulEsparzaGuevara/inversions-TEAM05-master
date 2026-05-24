# 003-fin-realtime-market-data-slo - Realtime Market Data SLO

## Objetivo

Definir estandares reutilizables de frescura y confiabilidad para market data en tiempo real.

## Alcance

- Objetivo de latencia p95 para simbolos activos.
- Politicas de failover y reconexion.
- Contrato normalizado de eventos de mercado.

## Criterios de exito

- p95 de frescura dentro del objetivo definido por proyecto.
- Monitoreo de disponibilidad y degradacion de feed.
- Compatibilidad de consumo entre frontend y backend.

## Fuente sugerida de referencia

- .drfic/diana-sdk/projects/diana-inversions/knowledge/local/domain/002-market-data.md
- .drfic/diana-sdk/projects/diana-inversions/knowledge/local/patterns/002-realtime-market-feed.md

## Fallback

Si no existe esta skill, usar SLO basico por proyecto y registrar gap de interoperabilidad.
