# Especificacion de Equipo: TEAM-02 CocaDe6Lts

**Iniciativa**: 001-inversions
**Proyecto**: diana-inversions
**Equipo**: TEAM-02
**Alias**: CocaDe6Lts
**Version**: 1.0
**Estado**: Draft
**Fuente**: 001-inv-spec.md + scope_primario.md + integration-profile.md

## Objetivo

Definir el slice canonico de TEAM-02 para el core de indicadores tecnicos y el Chat IA asociado, cubriendo calculo, exposicion y explicabilidad de señales derivadas de EMA, MACD, ADX, RSI y Bollinger.

## Alcance Funcional

- RF-001: Implementar el core de indicadores tecnicos sobre series de mercado.
- RF-002: Calcular y exponer EMA, MACD, ADX, RSI y Bollinger Bands.
- RF-003: Consolidar multiples indicadores en un motor de confluencia tecnica.
- RF-004: Exponer endpoints o contratos para consumo por el dashboard y otros cores.
- RF-005: Integrar un Chat IA para explicar estados, señales y criterios del core tecnico.
- RF-006: Mantener trazabilidad de entrada de datos, calculo y salida de señal.

## Alcance No Funcional

- RNF-001: La IA solo explica y evalua, no ejecuta operaciones.
- RNF-002: Los calculos deben ser reproducibles y consistentes.
- RNF-003: El core debe permanecer desacoplado del frontend y de otros dominios.
- RNF-004: Las salidas deben ser auditables y orientadas a explicabilidad.
- RNF-005: La latencia debe ser compatible con consumo interactivo en dashboard.

## Restricciones

- Se mantiene la arquitectura semi-automatica constitucional.
- No se permite auto-trading.
- No se modifican los artefactos canonicos globales 001-inv-spec.md, 001-inv-plan.md ni 001-inv-tasks.md.
- El alcance de TEAM-02 se limita a indicadores tecnicos y explicabilidad asociada.

## Supuestos

- La topologia activa de la iniciativa es multi_team.
- TEAM-02 consume datos de mercado y puede publicar resultados para otros equipos.
- Existen contratos comunes de persistencia y trazabilidad en el canon global.
- El Chat IA de este equipo actua como asistente explicativo, no como ejecutor.

## Criterios de Exito

- Los indicadores tecnicos calculan resultados coherentes y trazables.
- El motor de confluencia tecnica entrega salidas consumibles por el dashboard.
- El Chat IA explica la logica de la señal de forma clara y no operativa.
- El alcance del equipo no invade responsabilidades de broker, institucionales o de estrategia avanzada.
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
- La siguiente etapa natural es generar el plan de TEAM-02 a partir de esta spec.
