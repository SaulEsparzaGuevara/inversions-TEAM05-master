# Especificacion de Equipo: TEAM-05 TurboPapus

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-05
**Alias**: TurboPapus
**Version**: 1.0
**Estado**: Draft
**Fuente**: 001-inv-spec.md + scope_primario.md + integration-profile.md

## Objetivo

Definir el slice canonico de TEAM-05 para analisis institucional y estrategias de cobertura, cubriendo Protective Put, Married Put, Collar Put y Covered Straddle con apoyo de Chat IA explicativo.

## Alcance Funcional

- RF-001: Implementar el core de analisis institucional sobre condiciones de mercado y posicionamiento.
- RF-002: Exponer una lectura de contexto institucional util para evaluar coberturas.
- RF-003: Implementar estrategias Protective Put, Married Put, Collar Put y Covered Straddle.
- RF-004: Integrar un Chat IA para explicar escenarios de cobertura y proteccion.
- RF-005: Publicar salidas estructuradas para consumo por otros equipos y Speckit.
- RF-006: Mantener trazabilidad entre contexto institucional, estrategia y evidencia operativa.

## Alcance No Funcional

- RNF-001: La IA no ejecuta operaciones y no sustituye el juicio humano.
- RNF-002: Los calculos y contratos deben ser reproducibles y auditables.
- RNF-003: La estrategia de cobertura debe permanecer desacoplada de broker y frontend.
- RNF-004: La salida debe ser clara, defendible y orientada a control de riesgo.
- RNF-005: El componente debe permanecer integrado sin invadir otros dominios de analisis.
- RNF-006: Cada modulo o historia de usuario implementada DEBE contar con tests automatizados (unit e integration) que cubran la logica de negocio critica, los contratos de API y los flujos de error, con cobertura minima del 80% en rutas criticas.

## Restricciones

- Se mantiene la arquitectura semi-automatica constitucional.
- No se permite auto-trading.
- No se modifican los artefactos canonicos globales 001-inv-spec.md, 001-inv-plan.md ni 001-inv-tasks.md.
- El alcance de TEAM-05 se limita a analisis institucional y estrategias de cobertura.

## Supuestos

- La topologia activa de la iniciativa es multi_team.
- TEAM-05 consume datos normalizados y puede compartir contexto con cores tecnicos y de broker.
- Existen contratos comunes de persistencia y evidencia definidos por el canon global.
- El Chat IA solo explica y contextualiza, no autoriza ejecucion.

## Criterios de Exito

- El analisis institucional produce criterios utiles para cobertura y proteccion.
- Las estrategias de cobertura se modelan con riesgo y recompensa claramente expresados.
- Las salidas permiten validacion humana antes de cualquier intento de operacion.
- El alcance del equipo no invade dominios de analisis tecnico, noticias o ejecucion.
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
- La siguiente etapa natural es generar el plan de TEAM-05 a partir de esta spec.
