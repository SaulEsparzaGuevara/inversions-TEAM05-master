# Realtime Market Feed — Diana Inversiones Knowledge

> **ID**: INV-P-002  
> **Generado**: 2026-04-27  
> **Scope**: project — diana-inversions  
> **Estado**: 🟢 Completo  
> **Referencia**: SC-006 (p95 ≤ 1s latencia)

## TL;DR

La arquitectura realtime debe desacoplar conectores broker de la capa de distribución a cliente para mantener latencia estable.  
El sistema debe medir latencia extremo a extremo y aplicar fallback automático cuando se degrada la fuente principal.  
El contrato normalizado de mensajes es obligatorio para soportar múltiples brokers sin reescrituras de UI.

## Arquitectura Recomendada

Flujo base:
- Broker stream -> Connector service
- Connector -> Normalizer/validator
- Normalizer -> Event bus interno
- Event bus -> Supabase Realtime channel
- Cliente React -> store local -> TradingView charts

## Estrategia de Suscripción

- Suscribir solo símbolos visibles o en watchlist activa.
- Reusar conexiones y canales por usuario/sesión.
- Implementar unsubscribe estricto para evitar fugas de memoria.

## Control de Latencia p95 <= 1s

- Capturar timestamp en origen (si existe) y en cada salto.
- Calcular ingest_latency, publish_latency, client_render_latency.
- Alertar si p95 supera umbral por ventana deslizante.

## Fallback y Recuperación

- Si falla stream primario, conmutar a fuente secundaria o polling.
- Backoff exponencial con jitter para reconexión.
- Al reconectar, pedir snapshot inicial + delta stream para evitar huecos.

## Contrato de Mensaje Normalizado

Campos mínimos:
- symbol
- type (QUOTE|TRADE|BAR)
- price fields segun type
- volume/size
- event_time_utc
- source
- sequence

## Integración Frontend

- Buffer corto para suavizar ráfagas.
- Batch render para evitar re-render por cada tick.
- Validar monotonicidad de eventos por símbolo antes de pintar.

## Riesgos Clave

- Burst de mercado que satura cliente.
- Desorden de mensajes entre fuentes.
- Drift entre reloj de broker y backend.

## Mitigaciones

- Backpressure y rate control por canal.
- Normalización con sequence + ordering policy.
- Sincronización NTP obligatoria en servidores.

## Contenido

```
/diana.knowledge topic="realtime-market-feed" scope="project" type="local"
```
