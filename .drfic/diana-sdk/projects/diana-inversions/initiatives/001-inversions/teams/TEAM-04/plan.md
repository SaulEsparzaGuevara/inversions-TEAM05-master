# Plan Tecnico de Equipo: TEAM-04 DiviNoSQL

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-04
**Alias**: DiviNoSQL
**Version**: 1.0
**Estado**: Draft
**Fuente**: 001-inv-plan.md + TEAM-04/spec.md + scope_primario.md + integration-profile.md

## Autoridad

Este plan de equipo esta subordinado a:
1. inv-constitution.md
2. 001-inv-spec.md
3. 001-inv-plan.md
4. TEAM-04/spec.md
5. scope_primario.md

## Entradas Oficiales
- .drfic/diana-sdk/projects/diana-inversions/inv-constitution.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-spec.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-plan.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-04/spec.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/scope_primario.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/meta.md

## Objetivo

Implementar el slice de analisis tecnico y estrategia Wheel con salida explicativa y trazable.

## Fases Tecnicas

### Fase T04-1: Contratos tecnicos
- Parametros para soportes, resistencias y tendencias.
- Contratos para entrada/salida de senales.

### Fase T04-2: Motor tecnico
- Calculo de soportes, resistencias y tendencias.
- Seleccion de contexto tecnico relevante.

### Fase T04-3: Wheel y Chat IA
- Covered Call y Cash-Secured Put.
- Explicacion IA de escenarios y riesgo.

### Fase T04-4: Validacion
- Trazabilidad y readiness para Speckit.

## Riesgos
- Señales tecnicas inconsistentes; mitigar con determinismo y pruebas.
- Expansion de alcance hacia otros tipos de estrategia; mitigar con scope_primario.

## Criterios de Validacion
- El analisis tecnico y Wheel se publican de forma trazable.
- La explicabilidad IA no rompe el modelo semi-automatico.
- El plan queda listo para `/speckit.plan`.

## Integracion con Speckit
- `/diana.plan action="generate" project="diana-inversions" initiative="001-inversions" team="TEAM-04"`
- Luego `/speckit.plan`
