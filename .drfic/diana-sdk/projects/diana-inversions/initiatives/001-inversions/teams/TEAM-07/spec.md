# Especificacion de Equipo: TEAM-07 SixPackDevs

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-07
**Alias**: SixPackDevs
**Version**: 1.0
**Estado**: Draft
**Fuente**: 001-inv-spec.md + scope_primario.md + integration-profile.md

## Objetivo

Definir el slice canonico de TEAM-07 para analisis de IA aplicado al mercado y estrategias de volatilidad, cubriendo Long/Short Volatility, Straddle y Strangle con apoyo de Chat IA explicativo.

## Alcance Funcional

- RF-001: Implementar el core de analisis de IA aplicado a contexto y decision tecnica.
- RF-002: Evaluar senales o patrones derivados de modelos de IA como insumo explicativo.
- RF-003: Implementar estrategias Long Volatility y Short Volatility.
- RF-004: Implementar variantes Straddle y Strangle en el marco de volatilidad.
- RF-005: Integrar un Chat IA para explicar decisiones, supuestos y riesgos del componente.
- RF-006: Publicar salidas estructuradas para consumo por otros equipos y Speckit.

## Alcance No Funcional

- RNF-001: La IA no ejecuta operaciones y no sustituye el juicio humano.
- RNF-002: Los modelos o salidas de IA deben ser auditables y explicables.
- RNF-003: Las estrategias de volatilidad deben permanecer desacopladas del broker y del frontend.
- RNF-004: La salida debe ser reproducible y util para validacion humana.
- RNF-005: El componente debe conservar contratos estables de integracion.
- RNF-006: Cada modulo o historia de usuario implementada DEBE contar con tests automatizados (unit e integration) que cubran la logica de negocio critica, los contratos de API y los flujos de error, con cobertura minima del 80% en rutas criticas.

## Restricciones

- Se mantiene la arquitectura semi-automatica constitucional.
- No se permite auto-trading.
- No se modifican los artefactos canonicos globales 001-inv-spec.md, 001-inv-plan.md ni 001-inv-tasks.md.
- El alcance de TEAM-07 se limita a IA y estrategias de volatilidad.

## Supuestos

- La topologia activa de la iniciativa es multi_team.
- TEAM-07 consume contextos o modelos de IA normalizados y puede compartir contexto con otros cores.
- Existen contratos comunes de persistencia y evidencia definidos por el canon global.
- El Chat IA solo explica y contextualiza, no autoriza ejecucion.

## Criterios de Exito

- El core de IA produce explicaciones consistentes y trazables.
- Las estrategias de volatilidad modelan escenarios claros de uso.
- Las salidas permiten validacion humana antes de cualquier intento de operacion.
- El alcance del equipo no invade dominios de noticias, broker o estrategias de estructura compleja.
- Las salidas pueden integrarse con Speckit sin reinterpretar el canon global.

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
- La siguiente etapa natural es generar el plan de TEAM-07 a partir de esta spec.
