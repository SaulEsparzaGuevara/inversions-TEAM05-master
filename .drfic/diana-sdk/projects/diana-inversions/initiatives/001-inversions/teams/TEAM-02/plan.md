# Plan Tecnico de Equipo: TEAM-02 CocaDe6Lts

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-02
**Alias**: CocaDe6Lts
**Version**: 1.0
**Estado**: Draft
**Fuente**: 001-inv-plan.md + TEAM-02/spec.md + scope_primario.md + integration-profile.md

## Autoridad

Este plan de equipo esta subordinado a:
1. inv-constitution.md
2. 001-inv-spec.md
3. 001-inv-plan.md
4. TEAM-02/spec.md
5. scope_primario.md

## Entradas Oficiales
- .drfic/diana-sdk/projects/diana-inversions/inv-constitution.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-spec.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-plan.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-02/spec.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/scope_primario.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/meta.md

## Objetivo

Implementar el core de indicadores tecnicos y su Chat IA explicativo, manteniendo trazabilidad y consumo por el dashboard sin invadir el resto del canon global.

## Alcance

Incluye:
- Motor de indicadores (EMA, MACD, ADX, RSI, Bollinger).
- Motor de confluencia tecnica y explicabilidad.
- Chat IA para lectura y narrativa del core.
- Contratos para consumo por otros equipos y Speckit.

Excluye:
- Broker, ejecucion y automatizacion operativa.
- Estrategias de opciones que pertenecen a otros equipos.
- Cambios al backlog canonico global.

## Fases Tecnicas

### Fase T02-1: Contratos e ingesta tecnica
- Contrato de parametros de indicadores.
- Ingesta de series y normalizacion.
- Trazabilidad de entrada.

### Fase T02-2: Motor de indicadores y confluencia
- Calculo de EMA, MACD, ADX, RSI y Bollinger.
- Combinacion y score tecnico.
- Explicabilidad por señal.

### Fase T02-3: API y Chat IA
- Endpoints de evaluacion y detalle.
- Chat IA para narrativa explicativa.
- Salidas consumibles por dashboard.

### Fase T02-4: Validacion y hardening
- Pruebas de reproducibilidad.
- Contratos estables y auditoria.
- Readiness para Speckit.

## Riesgos
- Señales no reproducibles; mitigar con contratos y pruebas deterministas.
- Sobreposicion con otros cores; mitigar con scope_primario.
- Narrativa IA inconsistente; mitigar separando calculo de explicacion.

## Criterios de Validacion
- El core publica evaluaciones coherentes y trazables.
- Las explicaciones son consumibles por el dashboard.
- El alcance no invade broker ni estrategias de otros equipos.
- El plan queda listo para `/speckit.plan`.

## Integracion con Speckit
- `/diana.plan action="generate" project="diana-inversions" initiative="001-inversions" team="TEAM-02"`
- Luego `/speckit.plan`
