# 005-inv-institutional-options-flow — Institutional Options Flow

## Objetivo

Inferir posicionamiento institucional por strike/expiracion usando OI, volumen y comportamiento de flujo.

## Fuentes canonicas

- 001-inv-spec.md#2.2
- 001-inv-ucc.md#Descripcion del Requerimiento

## Knowledge docs

- local/cores/005-institutional-options-flow-core.md

## Criterios de exito

- Zonas institucionales explicables.
- Distincion entre apertura/cierre probable.
- Integracion como evidencia no deterministica.

## Fallback

Si falta esta skill, omitir inferencia institucional avanzada y reportar gap 005-inv-institutional-options-flow.
