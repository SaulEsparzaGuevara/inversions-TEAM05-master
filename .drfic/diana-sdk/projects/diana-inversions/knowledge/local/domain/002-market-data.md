# Market Data — Diana Inversiones Knowledge

> **ID**: INV-D-002  
> **Generado**: 2026-04-27  
> **Scope**: project — diana-inversions  
> **Estado**: 🟢 Completo

## TL;DR

El objetivo operativo es mantener frescura de datos en tiempo real con latencia p95 <= 1s extremo a extremo para símbolos suscritos.  
La arquitectura debe separar ingestión, normalización y distribución para soportar múltiples brokers sin acoplamiento fuerte.  
El frontend no debe depender de formatos nativos del broker; debe consumir un contrato normalizado único.

## Objetivos de Servicio

- Frescura: p95 <= 1s para símbolos activos.
- Disponibilidad de feed: >=99.5% en horario de mercado.
- Consistencia: timestamp UTC y secuencia monotónica por símbolo.

## Fuentes y Prioridad

- Primaria por símbolo: broker asociado a la cuenta activa del usuario.
- Secundaria: proveedor alterno cuando el primario falla o no cubre instrumento.
- Fuentes v1: IBKR market data y Alpaca market data.

## Contrato Normalizado

Campos mínimos para quote/trade:
- symbol
- event_type (QUOTE|TRADE|BAR)
- bid, ask, bid_size, ask_size
- last_price, last_size
- open, high, low, close, volume (para BAR)
- source (IBKR|ALPACA)
- event_time_utc
- ingest_time_utc

## Arquitectura Recomendada

Pipeline:
1. Connector por broker (WebSocket/stream nativo).
2. Normalizer (mapea payload nativo a contrato único).
3. Distributor (pub/sub interno y canal realtime a frontend).
4. Cache in-memory por símbolo para lectura rápida.
5. Persistencia selectiva (OHLCV y snapshots para análisis).

## WebSocket vs Polling

- WebSocket: default para símbolos en watchlist activa.
- Polling: fallback para recuperación temporal o endpoints sin streaming.
- Política de fallback: cambiar a polling con intervalo 1-2s tras N fallos de socket.

## Fallback y Resiliencia

- Health check por conector cada 5-10s.
- Circuit breaker por fuente para evitar saturación.
- Reconexión con backoff exponencial con jitter.
- Auto-recovery: volver a fuente primaria cuando su salud sea estable.

## Integración con TradingView

- Entregar barras en formato compatible OHLC UTC.
- Resolver huecos de datos con política de fill-forward controlada.
- Evitar recalcular historiales completos en cada tick; usar actualización incremental.

## Observabilidad

Métricas mínimas:
- market_feed_latency_ms_p50/p95/p99
- dropped_messages_count
- reconnect_attempts_total
- source_failover_count
- symbols_subscribed_total

Alertas recomendadas:
- p95 > 1000ms por 3 ventanas consecutivas.
- reconexiones > umbral por minuto.
- ausencia total de eventos en símbolo activo > N segundos.

## Contenido

```
/diana.knowledge topic="market-data" scope="project" type="local"
```
