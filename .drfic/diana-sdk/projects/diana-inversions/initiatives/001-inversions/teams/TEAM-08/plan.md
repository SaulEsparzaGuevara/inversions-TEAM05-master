# Plan Tecnico de Equipo: TEAM-08 GlassCoke

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-08
**Alias**: GlassCoke
**Version**: 1.0
**Estado**: Draft
**Fuente**: 001-inv-plan.md + TEAM-08/spec.md + scope_primario.md + integration-profile.md

## Autoridad

Este plan de equipo esta subordinado a:
1. inv-constitution.md
2. 001-inv-spec.md
3. 001-inv-plan.md
4. TEAM-08/spec.md
5. scope_primario.md

## Objetivo

Implementar estrategias complejas de opciones con lectura clara de riesgo, recompensa y sensibilidad.

## Fases Tecnicas

### Fase T08-1: Modelado de estructuras
- Contratos para Iron Condor, Iron Butterfly, Butterfly Spread y Condor.

### Fase T08-2: Calculo y escenarios
- Sensibilidad, riesgo y recompensa.
- Reglas de comparacion entre estructuras.

### Fase T08-3: Chat IA y API
- Narrativa explicativa de cada estructura.
- Endpoints de consumo para otros equipos.

### Fase T08-4: Validacion
- Consistencia y readiness para Speckit.

## Riesgos
- Estructuras complejas mal parametrizadas; mitigar con contratos y pruebas.
- Salidas demasiado densas; mitigar con explicabilidad y formatos claros.

## Criterios de Validacion
- Las estrategias complejas quedan modeladas y explicadas.
- La salida es trazable y util para validacion humana.
- El plan queda listo para `/speckit.plan`.

## Integracion con Speckit
- `/diana.plan action="generate" project="diana-inversions" initiative="001-inversions" team="TEAM-08"`
- Luego `/speckit.plan`
