# Especificacion de Equipo: TEAM-04 DiviNoSQL

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-04
**Alias**: DiviNoSQL
**Version**: 1.0
**Estado**: Draft
**Fuente**: 001-inv-spec.md + scope_primario.md + integration-profile.md

## Objetivo

Definir el slice canonico de TEAM-04 para analisis tecnico y la estrategia Wheel, cubriendo soportes, resistencias, tendencias y sus variantes Covered Call y Cash-Secured Put con Chat IA explicativo.

## Alcance Funcional

- RF-001: Implementar el core de analisis tecnico sobre soportes, resistencias y tendencias.
- RF-002: Exponer contratos para seleccionar y combinar senales tecnicas relevantes.
- RF-003: Implementar la estrategia Wheel con sus flujos Covered Call y Cash-Secured Put.
- RF-004: Integrar un Chat IA para explicar condiciones de entrada, salida y riesgo tecnico.
- RF-005: Publicar resultados estructurados para consumo de otros equipos y Speckit.
- RF-006: Mantener trazabilidad entre patron tecnico, estrategia y recomendacion emitida.

## Alcance No Funcional

- RNF-001: La IA no ejecuta operaciones y no sustituye el juicio humano.
- RNF-002: Los calculos tecnicos deben ser reproducibles y auditables.
- RNF-003: La estrategia Wheel debe operar con contratos claros y desacoplados.
- RNF-004: La salida debe ser explicable para usuarios operativos y revisores.
- RNF-005: El componente debe permanecer desacoplado del frontend y del broker.
- RNF-006: Cada modulo o historia de usuario implementada DEBE contar con tests automatizados (unit e integration) que cubran la logica de negocio critica, los contratos de API y los flujos de error, con cobertura minima del 80% en rutas criticas.

## Restricciones

- Se mantiene la arquitectura semi-automatica constitucional.
- No se permite auto-trading.
- No se modifican los artefactos canonicos globales 001-inv-spec.md, 001-inv-plan.md ni 001-inv-tasks.md.
- El alcance de TEAM-04 se limita a analisis tecnico y estrategia Wheel.

## Supuestos

- La topologia activa de la iniciativa es multi_team.
- TEAM-04 consume datos de mercado normalizados y puede compartir resultados con otros cores.
- Existen contratos comunes de persistencia y evidencia definidos por el canon global.
- El Chat IA solo explica y contextualiza, no autoriza ejecucion.

## Criterios de Exito

- El analisis tecnico produce lecturas consistentes y trazables.
- La estrategia Wheel se modela de forma clara en sus variantes principales.
- Las salidas son suficientes para consumo operativo y validacion humana.
- El alcance del equipo no invade dominios de analisis fundamental, noticias o broker.
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
- La siguiente etapa natural es generar el plan de TEAM-04 a partir de esta spec.
