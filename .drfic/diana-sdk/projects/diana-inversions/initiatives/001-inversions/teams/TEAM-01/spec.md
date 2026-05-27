# Especificacion de Equipo: TEAM-01 DIANArchiTEC

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-01
**Alias**: DIANArchiTEC
**Version**: 1.0
**Estado**: Draft
**Fuente**: 001-inv-spec.md + scope_primario.md + integration-profile.md

## Objetivo

Definir el slice canonico de TEAM-01 para la plataforma de inversiones con IA, cubriendo la base de modelo de datos, la integracion con IBKR y Alpaca, y el dashboard principal de confluencia de señales y UX operativa.

## Alcance Funcional

- RF-001: Diseñar y mantener el modelo de base de datos del dominio operativo para usuarios, activos, señales, decisiones y evidencia.
- RF-002: Exponer contratos de integracion para brokers IBKR y Alpaca desde una capa desacoplada del frontend.
- RF-003: Implementar la integracion funcional entre backend y frontend para consumo de señales y estado operativo.
- RF-004: Construir el dashboard principal de confluencia de señales por core.
- RF-005: Proveer UX operativa para visualizacion, aprobacion y seguimiento de recomendaciones humanas asistidas.
- RF-006: Mantener trazabilidad entre señal, evidencia, decision humana e intento de ejecucion.

## Alcance No Funcional

- RNF-001: La IA no ejecuta operaciones; solo confirma, explica y evalua riesgo.
- RNF-002: La integracion con brokers debe permanecer desacoplada y trazable.
- RNF-003: El modelo de datos debe ser persistente, versionado e idempotente.
- RNF-004: La interfaz debe priorizar claridad operativa, explicabilidad y auditabilidad.
- RNF-005: Toda credencial operativa debe permanecer fuera del codigo fuente.
- RNF-006: Cada modulo o historia de usuario implementada DEBE contar con tests automatizados (unit e integration) que cubran la logica de negocio critica, los contratos de API y los flujos de error, con cobertura minima del 80% en rutas criticas.

## Restricciones

- Se mantiene la arquitectura semi-automatica constitucional.
- No se permite auto-trading.
- No se modifican los artefactos canonicos globales 001-inv-spec.md, 001-inv-plan.md ni 001-inv-tasks.md.
- El slice de equipo debe respetar la division funcional definida en scope_primario.md.
- Las dependencias de broker deben permanecer desacopladas de la logica de presentacion.

## Supuestos

- La topologia activa de la iniciativa es multi_team.
- TEAM-01 actua como equipo de plataforma/base integradora para el dominio operativo principal.
- Existen o existiran contratos comunes para auth, broker y lifecycle que este equipo debe consumir.
- La especificacion global canónica ya establece el marco constitucional y funcional general.

## Criterios de Exito

- El dashboard principal de TEAM-01 consume y presenta señales de forma consistente con la spec global.
- La integracion con IBKR y Alpaca queda encapsulada en contratos claros y verificables.
- El modelo de datos cubre la persistencia minima requerida para evidencia y trazabilidad.
- Las decisiones humanas y los intentos de ejecucion quedan auditables de extremo a extremo.
- El alcance del equipo no invade responsabilidades funcionales de otros TEAM-XX.

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
- La siguiente etapa natural es generar el plan de TEAM-01 a partir de esta spec.
