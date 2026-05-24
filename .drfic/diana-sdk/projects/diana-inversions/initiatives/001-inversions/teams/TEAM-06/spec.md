# Especificacion de Equipo: TEAM-06 CodersTMNT

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-06
**Alias**: CodersTMNT
**Version**: 1.0
**Estado**: Draft
**Fuente**: 001-inv-spec.md + scope_primario.md + integration-profile.md

## Objetivo

Definir el slice canonico de TEAM-06 para analisis de noticias y estrategias de spreads, cubriendo Debit Spread y Credit Spread con apoyo de Chat IA explicativo.

## Alcance Funcional

- RF-001: Implementar el core de analisis de noticias y eventos relevantes para el mercado.
- RF-002: Evaluar el impacto de noticias sobre el sesgo operativo de la iniciativa.
- RF-003: Implementar estrategias Debit Spread y Credit Spread en sus variantes principales.
- RF-004: Integrar un Chat IA para explicar contexto noticioso, riesgo y posibles lecturas de spread.
- RF-005: Publicar salidas estructuradas para consumo por otros equipos y Speckit.
- RF-006: Mantener trazabilidad entre noticia, interpretacion y estrategia derivada.

## Alcance No Funcional

- RNF-001: La IA no ejecuta operaciones y no sustituye el juicio humano.
- RNF-002: Las fuentes de noticias deben ser trazables y reproducibles.
- RNF-003: Las estrategias de spread deben permanecer desacopladas del broker y del frontend.
- RNF-004: La salida debe ser explicable, auditada y util para validacion humana.
- RNF-005: El componente debe mantener contratos estables para integracion con otros cores.
- RNF-006: Cada modulo o historia de usuario implementada DEBE contar con tests automatizados (unit e integration) que cubran la logica de negocio critica, los contratos de API y los flujos de error, con cobertura minima del 80% en rutas criticas.

## Restricciones

- Se mantiene la arquitectura semi-automatica constitucional.
- No se permite auto-trading.
- No se modifican los artefactos canonicos globales 001-inv-spec.md, 001-inv-plan.md ni 001-inv-tasks.md.
- El alcance de TEAM-06 se limita a noticias y estrategias de spread.

## Supuestos

- La topologia activa de la iniciativa es multi_team.
- TEAM-06 consume fuentes de noticias normalizadas y puede compartir contexto con otros cores.
- Existen contratos comunes de persistencia y evidencia definidos por el canon global.
- El Chat IA solo explica y contextualiza, no autoriza ejecucion.

## Criterios de Exito

- El core de noticias produce contextos utilitarios y trazables.
- Las estrategias de spread se modelan con escenarios claros de entrada, salida y riesgo.
- Las salidas permiten validacion humana antes de cualquier intento de operacion.
- El alcance del equipo no invade dominios de analisis tecnico, fundamental o broker.
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
- La siguiente etapa natural es generar el plan de TEAM-06 a partir de esta spec.
