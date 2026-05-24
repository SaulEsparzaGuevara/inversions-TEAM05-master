# Especificacion de Equipo: TEAM-08 GlassCoke

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-08
**Alias**: GlassCoke
**Version**: 1.0
**Estado**: Draft
**Fuente**: 001-inv-spec.md + scope_primario.md + integration-profile.md

## Objetivo

Definir el slice canonico de TEAM-08 para estrategias complejas de opciones, cubriendo Iron Condor, Iron Butterfly, Butterfly Spread y Condor con apoyo de Chat IA explicativo.

## Alcance Funcional

- RF-001: Implementar contratos para modelar estrategias complejas de opciones.
- RF-002: Cubrir variantes Iron Condor, Iron Butterfly, Butterfly Spread y Condor.
- RF-003: Exponer escenarios de riesgo, recompensa y sensibilidad para cada estrategia.
- RF-004: Integrar un Chat IA para explicar la logica y la conveniencia de cada estructura.
- RF-005: Publicar salidas estructuradas para consumo por otros equipos y Speckit.
- RF-006: Mantener trazabilidad entre estructura de opcion, estrategia y decision sugerida.

## Alcance No Funcional

- RNF-001: La IA no ejecuta operaciones y no sustituye el juicio humano.
- RNF-002: Las estructuras de opciones deben ser reproducibles y auditables.
- RNF-003: Las estrategias complejas deben permanecer desacopladas del broker y del frontend.
- RNF-004: La salida debe ser clara para validacion humana y lectura operativa.
- RNF-005: El componente debe conservar contratos estables de integracion.
- RNF-006: Cada modulo o historia de usuario implementada DEBE contar con tests automatizados (unit e integration) que cubran la logica de negocio critica, los contratos de API y los flujos de error, con cobertura minima del 80% en rutas criticas.

## Restricciones

- Se mantiene la arquitectura semi-automatica constitucional.
- No se permite auto-trading.
- No se modifican los artefactos canonicos globales 001-inv-spec.md, 001-inv-plan.md ni 001-inv-tasks.md.
- El alcance de TEAM-08 se limita a estrategias complejas de opciones.

## Supuestos

- La topologia activa de la iniciativa es multi_team.
- TEAM-08 consume contratos de mercado y puede compartir contexto con otros cores.
- Existen contratos comunes de persistencia y evidencia definidos por el canon global.
- El Chat IA solo explica y contextualiza, no autoriza ejecucion.

## Criterios de Exito

- Las estructuras complejas se modelan con escenarios claros y trazables.
- El Chat IA puede explicar por que una combinacion de patas es util o no.
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
- La siguiente etapa natural es generar el plan de TEAM-08 a partir de esta spec.
