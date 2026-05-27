# Plan Tecnico de Equipo: TEAM-05 TurboPapus

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-05
**Alias**: TurboPapus
**Version**: 1.0
**Estado**: Draft
**Fuente**: 001-inv-plan.md + TEAM-05/spec.md + scope_primario.md + integration-profile.md

## Autoridad

Este plan de equipo esta subordinado a:
1. inv-constitution.md
2. 001-inv-spec.md
3. 001-inv-plan.md
4. TEAM-05/spec.md
5. scope_primario.md

## Objetivo

Implementar analisis institucional y estrategias de cobertura para orientar decisiones de proteccion y gestion de riesgo.

## Fases Tecnicas

### Fase T05-1: Contexto institucional
- Lectura y normalizacion de contexto de mercado.
- Contrato de lectura institucional.

### Fase T05-2: Estrategias de cobertura
- Protective Put, Married Put, Collar Put, Covered Straddle.
- Reglas de aplicacion y sensibilidad.

### Fase T05-3: Chat IA y API
- Narrativa de proteccion y cobertura.
- Endpoints explicativos para consumo operativo.

### Fase T05-4: Validacion
- Reproducibilidad y trazabilidad.
- Readiness para Speckit.

## Riesgos
- Lecturas institucionales ambiguas; mitigar con evidencia y supuestos.
- Coberturas mal interpretadas; mitigar con explicabilidad y limites de alcance.

## Criterios de Validacion
- El core institucional produce salidas utilitarias y trazables.
- Las estrategias de cobertura se explican con claridad.
- El plan queda listo para `/speckit.plan`.

## Integracion con Speckit
- `/diana.plan action="generate" project="diana-inversions" initiative="001-inversions" team="TEAM-05"`
- Luego `/speckit.plan`
