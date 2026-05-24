# AI Confluence Orchestrator Core - Diana Inversiones Knowledge

> ID: INV-CORE-007  
> Generado: 2026-04-28  
> Scope: project - diana-inversions  
> Estado: 🟢 Completo

## TL;DR

Este core combina todos los cores activos elegidos por el usuario para producir una recomendacion coherente y explicable.  
Debe ponderar evidencia, resolver conflictos y emitir salida con incertidumbre explicita.  
Es el cerebro de confluencia, no un ejecutor automatico de operaciones.

## Entradas

- Output de core tecnico
- Output de core fundamental
- Output de senales
- Output de opciones y flujo institucional
- Output de noticias en tiempo real
- Configuracion de cores activos por usuario
- Perfil de riesgo del usuario

## Salidas Estandar

- final_signal: BUY | SELL | HOLD
- confluence_score: 0..100
- confidence: 0..1
- top_drivers: razones principales
- conflicts: lista de desacuerdos entre cores
- risk_posture: CONSERVATIVE | BALANCED | AGGRESSIVE
- action_suggestion: texto explicable

## Logica de Fusion Recomendada

- Ponderacion base por tipo de core.
- Ponderacion dinamica por regimen de mercado.
- Penalizacion por conflicto fuerte entre cores.
- Limite maximo de confianza para evitar sobreajuste.

## Esquema de Pesos Inicial (ejemplo)

- Tecnico: 30%
- Fundamental: 20%
- Senales directas: 20%
- Opciones/flujo institucional: 15%
- Noticias tiempo real: 15%

Ajustes:
- Intradia: subir tecnico/noticias, bajar fundamental.
- Swing: balanceado.
- Posicional: subir fundamental, bajar ruido de noticias.

## Resolucion de Conflictos

- Si confluence_score queda en zona gris, emitir HOLD.
- Si noticia critica contradice setup tecnico, reducir fuerza de senal.
- Si flujo institucional valida ruptura, aumentar confianza bajo limites.

## Explicabilidad

Cada salida debe responder:
- Que cores fueron usados.
- Cual fue el peso real aplicado.
- Que evidencia empujo la decision.
- Que condiciones invalidan la recomendacion.

## Seguridad

- Prohibido auto-trading sin aprobacion humana.
- Trazar version de modelo/reglas por recomendacion.
- Incluir disclaimer no asesoria en cada sugerencia generada.
