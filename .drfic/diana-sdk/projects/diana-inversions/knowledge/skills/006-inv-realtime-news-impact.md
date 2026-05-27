# 006-inv-realtime-news-impact — Realtime News Impact

## Objetivo

Procesar noticias en tiempo real y estimar impacto por activo para ajustar la confianza de señal.

## Fuentes canonicas

- 001-inv-spec.md#2.2
- spec.md#SC-006

## Knowledge docs

- local/cores/006-realtime-news-core.md

## Criterios de exito

- Relevancia por símbolo.
- Clasificación de evento consistente.
- Penalización de fuentes poco confiables.

## Fallback

Si falta esta skill, mantener monitoreo de noticias básico y registrar gap 006-inv-realtime-news-impact.
