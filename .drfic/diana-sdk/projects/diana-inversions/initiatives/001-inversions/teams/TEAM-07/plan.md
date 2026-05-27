# Plan Tecnico de Equipo: TEAM-07 SixPackDevs

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-07
**Alias**: SixPackDevs
**Version**: 1.0
**Estado**: Draft
**Fuente**: 001-inv-plan.md + TEAM-07/spec.md + scope_primario.md + integration-profile.md

## Autoridad

Este plan de equipo esta subordinado a:
1. inv-constitution.md
2. 001-inv-spec.md
3. 001-inv-plan.md
4. TEAM-07/spec.md
5. scope_primario.md

## Objetivo

Implementar analisis de IA y estrategias de volatilidad para reforzar interpretacion de mercado y explicabilidad operativa.

## Fases Tecnicas

### Fase T07-1: Lectura de contexto IA
- Contratos de entrada para analisis de IA.
- Normalizacion de contexto explicativo.

### Fase T07-2: Volatilidad
- Long/Short Volatility.
- Straddle y Strangle.

### Fase T07-3: Chat IA y API
- Narrativa de volatilidad y riesgo.
- Endpoints explicativos para consumo operativo.

### Fase T07-4: Validacion
- Trazabilidad y readiness para Speckit.

## Riesgos
- Contexto IA poco fiable; mitigar con explicabilidad y contratos.
- Exceso de abstraccion; mitigar con outputs consumibles y deterministas.

## Criterios de Validacion
- Las estrategias de volatilidad quedan explicadas y trazables.
- La IA no ejecuta ni decide.
- El plan queda listo para `/speckit.plan`.

## Integracion con Speckit
- `/diana.plan action="generate" project="diana-inversions" initiative="001-inversions" team="TEAM-07"`
- Luego `/speckit.plan`
