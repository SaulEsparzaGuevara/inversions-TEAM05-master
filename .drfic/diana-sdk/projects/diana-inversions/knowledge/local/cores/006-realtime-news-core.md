# Realtime News Core - Diana Inversiones Knowledge

> ID: INV-CORE-006  
> Generado: 2026-04-28  
> Scope: project - diana-inversions  
> Estado: 🟢 Completo

## TL;DR

Este core ingiere noticias en tiempo real, las clasifica por activo/sector y calcula impacto potencial de corto plazo.  
Debe combinar velocidad con filtros de calidad para evitar reaccionar a ruido o titulares no confiables.  
Su salida se usa como factor de riesgo/evento en la confluencia final.

## Entradas

- Feeds de noticias financieras en tiempo real
- Calendario economico y corporativo
- Metadata de fuente y reputacion
- NER ticker/company extraction

## Salidas Estandar

- news_impact_score: -100..100
- sentiment: NEGATIVE | NEUTRAL | POSITIVE
- relevance: 0..1 por simbolo
- event_type: EARNINGS | MACRO | M&A | REGULATORY | OTHER
- confidence
- headline_summary

## Pipeline Recomendado

1. Ingestion multifuente.
2. Deduplicacion y clustering de titulares.
3. Clasificacion de evento y entidades.
4. Sentiment financiero contextual.
5. Estimacion de impacto temporal.

## Guardrails

- Ponderar mas fuentes de alta credibilidad.
- Penalizar rumores sin confirmacion.
- Establecer ventana de enfriamiento para evitar sobre-reaccion.
- En noticias de alto impacto, reducir confianza de senales tecnicas en contra.

## Integracion

Publica `news_impact_score` al motor de confluencia para ajustar señal y nivel de riesgo sugerido.
