# Especificacion de Equipo: TEAM-03 SQLitoNo

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-03
**Alias**: SQLitoNo
**Version**: 1.0
**Estado**: Draft
**Fuente**: 001-inv-spec.md + scope_primario.md + integration-profile.md

## Objetivo

Definir el slice canonico de TEAM-03 para analisis fundamental y estrategias de opciones base, cubriendo los flujos de Long Call, Long Put, Short Call y Short Put con apoyo de Chat IA explicativo.

## Alcance Funcional

- RF-001: Construir el core de analisis fundamental sobre datos financieros y de contexto.
- RF-002: Exponer un perfil fundamental de viabilidad y lectura de empresa/activo.
- RF-003: Implementar la familia de estrategias Long Call, Long Put, Short Call y Short Put.
- RF-004: Integrar un Chat IA para explicar fundamentos, escenarios y decisiones sugeridas.
- RF-005: Publicar salidas estructuradas para consumo por otros equipos y por Speckit.
- RF-006: Mantener trazabilidad entre fundamentos, estrategia sugerida y evidencia operativa.

## Alcance No Funcional

- RNF-001: La IA no ejecuta operaciones y no sustituye el juicio humano.
- RNF-002: El core debe ser explicable, auditable y reproducible.
- RNF-003: Las estrategias deben mantener contratos claros de entrada y salida.
- RNF-004: El equipo debe permanecer desacoplado del frontend y de la capa de broker.
- RNF-005: Las recomendaciones deben presentar riesgo y supuestos de forma explícita.

## Restricciones

- Se mantiene la arquitectura semi-automatica constitucional.
- No se permite auto-trading.
- No se modifican los artefactos canonicos globales 001-inv-spec.md, 001-inv-plan.md ni 001-inv-tasks.md.
- El alcance de TEAM-03 se limita a analisis fundamental y estrategias base de opciones.

## Supuestos

- La topologia activa de la iniciativa es multi_team.
- TEAM-03 consume datos financieros normalizados y señales previas de otros cores cuando aplique.
- Existen contratos comunes de persistencia y evidencia definidos por el canon global.
- El Chat IA solo explica y contextualiza, no autoriza ejecucion.

## Criterios de Exito

- El core fundamental produce evaluaciones coherentes y trazables.
- Las estrategias de opciones generan escenarios claros de riesgo y recompensa.
- El Chat IA puede justificar por que una estrategia aplica o no aplica.
- El alcance del equipo no invade dominios tecnicos de analisis tecnico, institucional o de broker.
- Las salidas son consumibles por Speckit sin perder el canon global.

## Trazabilidad

- Principios constitucionales:
  - modelo semi-automatico obligatorio
  - control humano explicito
  - arquitectura por cores desacoplados
  - señales explicables y trazables
- UCC de origen: 001-INV-UCC
- Fuente de division funcional: scope_primario.md
- Relacion con canon global: derivada de 001-inv-spec.md

## Integracion con Speckit

- Speckit debe leer este archivo como base canonica del equipo.
- Speckit puede refinar este slice sin alterar el canon global.
- La siguiente etapa natural es generar el plan de TEAM-03 a partir de esta spec.
