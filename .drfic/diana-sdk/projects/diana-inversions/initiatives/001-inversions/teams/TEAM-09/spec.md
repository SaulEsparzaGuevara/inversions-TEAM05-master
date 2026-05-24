# Especificacion de Equipo: TEAM-09 SquadISC

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-09
**Alias**: SquadISC
**Version**: 1.0
**Estado**: Draft
**Fuente**: 001-inv-spec.md + scope_primario.md + integration-profile.md

## Objetivo

Definir el slice canonico de TEAM-09 para estrategias Calendar Spread y Diagonal Spread, cubriendo sus variantes call/put con apoyo de Chat IA explicativo.

## Alcance Funcional

- RF-001: Implementar contratos para modelar estrategias Calendar Spread y Diagonal Spread.
- RF-002: Cubrir variantes call y put de ambas estructuras.
- RF-003: Exponer escenarios de riesgo, tiempo y sensibilidad para cada estrategia.
- RF-004: Integrar un Chat IA para explicar el proposito, riesgo y condiciones de uso.
- RF-005: Publicar salidas estructuradas para consumo por otros equipos y Speckit.
- RF-006: Mantener trazabilidad entre estructura temporal, estrategia y decision sugerida.

## Alcance No Funcional

- RNF-001: La IA no ejecuta operaciones y no sustituye el juicio humano.
- RNF-002: Las estructuras deben ser reproducibles y auditables.
- RNF-003: Las estrategias deben permanecer desacopladas del broker y del frontend.
- RNF-004: La salida debe ser clara para validacion humana y lectura operativa.
- RNF-005: El componente debe conservar contratos estables de integracion.
- RNF-006: Cada modulo o historia de usuario implementada DEBE contar con tests automatizados (unit e integration) que cubran la logica de negocio critica, los contratos de API y los flujos de error, con cobertura minima del 80% en rutas criticas.

## Restricciones

- Se mantiene la arquitectura semi-automatica constitucional.
- No se permite auto-trading.
- No se modifican los artefactos canonicos globales 001-inv-spec.md, 001-inv-plan.md ni 001-inv-tasks.md.
- El alcance de TEAM-09 se limita a estrategias temporales Calendar y Diagonal.

## Supuestos

- La topologia activa de la iniciativa es multi_team.
- TEAM-09 consume contratos de mercado y puede compartir contexto con otros cores.
- Existen contratos comunes de persistencia y evidencia definidos por el canon global.
- El Chat IA solo explica y contextualiza, no autoriza ejecucion.

## Criterios de Exito

- Las estrategias Calendar y Diagonal se modelan con escenarios claros y trazables.
- El Chat IA puede explicar por que una estructura temporal aplica o no.
- Las salidas permiten validacion humana antes de cualquier intento de operacion.
- El alcance del equipo no invade dominios de volatilidad, noticias o broker.
- Las salidas pueden integrarse con Speckit sin perder la autoridad canonica.

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
- La siguiente etapa natural es generar el plan de TEAM-09 a partir de esta spec.
