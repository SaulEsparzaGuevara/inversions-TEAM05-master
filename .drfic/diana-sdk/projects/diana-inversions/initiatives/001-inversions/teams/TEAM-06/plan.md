# Plan Tecnico de Equipo: TEAM-06 CodersTMNT

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-06
**Alias**: CodersTMNT
**Version**: 1.0
**Estado**: Draft
**Fuente**: 001-inv-plan.md + TEAM-06/spec.md + scope_primario.md + integration-profile.md

## Autoridad

Este plan de equipo esta subordinado a:
1. inv-constitution.md
2. 001-inv-spec.md
3. 001-inv-plan.md
4. TEAM-06/spec.md
5. scope_primario.md

## Objetivo

Implementar analisis de noticias y estrategias de spreads con trazabilidad y explicabilidad para soportar contexto operativo.

## Fases Tecnicas

### Fase T06-1: Ingesta de noticias
- Normalizacion y contratos de lectura.
- Trazabilidad de fuente y frescura.

### Fase T06-2: Impacto noticioso
- Evaluacion de impacto sobre el mercado.
- Reglas de interpretacion de eventos.

### Fase T06-3: Spreads y Chat IA
- Debit Spread y Credit Spread.
- Explicacion IA de contexto y riesgo.

### Fase T06-4: Validacion
- Consistencia y readiness para Speckit.

## Riesgos
- Noticias incompletas o tardias; mitigar con contratos y frescura observada.
- Sobreinterpretacion IA; mitigar separando calculo de explicacion.

## Criterios de Validacion
- El core de noticias y spreads genera salida trazable.
- La explicabilidad cubre escenarios principales.
- El plan queda listo para `/speckit.plan`.

## Integracion con Speckit
- `/diana.plan action="generate" project="diana-inversions" initiative="001-inversions" team="TEAM-06"`
- Luego `/speckit.plan`
