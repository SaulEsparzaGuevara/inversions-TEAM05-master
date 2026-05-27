# Plan Tecnico Canonico
## Plataforma de Inversiones con IA

Identificador: 001-INV-PLAN
Proyecto: DIANA Inversions
Iniciativa: 001-inversions
Version de regeneracion: 2026-05-12
Accion: /diana.plan action="regenerate" scope="project" project="diana-inversions" initiative="001-inversions"

---

## Autoridad

Este plan tecnico canonico esta subordinado a:
1. inv-constitution.md
2. 001-inv-spec.md
3. spec.md (operativa derivada, cuando aplique)

Ante conflicto, prevalece la constitucion.

---

## Entradas Oficiales Consumidas

Fuentes canonicas:
- .drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml
- .drfic/diana-sdk/projects/diana-inversions/inv-constitution.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-spec.md
- .drfic/diana-sdk/projects/diana-inversions/governance/change-requests/001-inv-ucc.md
- .drfic/diana-sdk/projects/diana-inversions/governance/tickets/001-inv-tkt.md
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/meta.md

Fuentes operativas derivadas:
- specs/001-plataforma-inversiones-ia/spec.md
- specs/001-plataforma-inversiones-ia/plan.md previo

Fuente vigente de alcance para esta regeneracion:
- .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-tasks.md

Skills y knowledge first cargados:
- .drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/skills-manifest.yaml
- .drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/agent-skill-matrix.yaml
- .drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/sdd-engine-matrix.yaml
- .drfic/diana-sdk/sdk/diana/knowledge/indexes/shared-skills-manifest.yaml
- .drfic/diana-sdk/projects/knowledge/indexes/master-index.md
- .drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/master-index.md
- .drfic/diana-sdk/sdk/diana/knowledge/indexes/master-index.md

Estado de cobertura de knowledge:
- Required skills de speckit.plan presentes en manifest y matrices del proyecto.
- Knowledge SDK-level disponible como contexto de apoyo; varias entradas permanecen en estado esqueleto y no bloquean la regeneracion.

---

## Objetivo del Plan

Definir el como tecnico para implementar la iniciativa 001-inversions de forma consistente con constitucion, especificacion canonica, especificacion operativa y backlog canonico vigente, sin introducir nuevos requisitos funcionales fuera de lo ya aprobado y dejando la salida lista para /speckit.plan.

---

## Alcance y Exclusiones

Incluye:
- Arquitectura objetivo para PWA, REST API, datos, brokers, cores analiticos y servicios de estrategia.
- Cobertura explicita de Fase 1 a Fase 16 del backlog canonico, incluyendo dependencias entre ondas de equipos y estandarizacion transversal.
- Guardrails tecnicos para seguridad, resiliencia, observabilidad, cumplimiento y gobierno de automatismos de riesgo/cierre.
- Criterios de validacion tecnica y readiness hacia Speckit.

Excluye:
- Reescritura o renumeracion del backlog canonico.
- Nuevos requisitos funcionales no sustentados por constitucion, specs o backlog canonico vigente.
- Auto-trading, ejecucion sin aprobacion humana o interpretaciones que conviertan IA/risk engines en ejecutores autonomos.
- Cambios a artefactos de teams o a 001-inv-tasks.md.

---

## Skills Requeridas para Etapa de Plan

Required skills de speckit.plan:
- 001-inv-technical-analysis-structure
- 002-inv-indicator-signal-logic
- 004-inv-options-strategy-engine
- 005-inv-institutional-options-flow
- 006-inv-realtime-news-impact
- 007-inv-ai-confluence-orchestration
- 008-inv-market-data-and-realtime
- 010-inv-broker-integration-ibkr-alpaca
- 011-inv-portfolio-and-performance-analytics

Skills compartidos de apoyo:
- 001-SDK-SDDCORE
- 002-SDK-TSSTACK

Estado de cobertura por skill:
- Cobertura del proyecto: completa para la etapa plan.
- Cobertura SDK compartida: suficiente como apoyo metodologico.

Politica de fallback:
- Si un skill o knowledge local quedara incompleto en futuras regeneraciones, continuar con metodologia estandar del engine, reportar el gap y recomendar /diana.knowledge.

---

## Arquitectura Tecnica Objetivo

### Vista de capas

1. Capa de experiencia
- PWA React/Vite/TypeScript con modulos de senales, dashboard, ejecucion, auditoria y workbenches de estrategias.
- Visualizacion de evidencia, overlays de mercado, explicabilidad, reportes y disclaimers de no-asesoria.

2. Capa de API y seguridad
- REST API Node.js/Express con JWT Bearer, RBAC, MFA, rate limiting y contratos estables por feature.
- Endpoints segregados para evaluacion, aprobacion, ejecucion asistida, historial, dashboard, cores analiticos y estrategias.

3. Capa de dominio y politicas
- Ciclo de vida canonico de senal, propuesta, decision humana e intento de ejecucion.
- Politicas de versionado, optimistic locking, auditoria, retencion, disclaimer y resiliencia de dependencias.
- Politicas explicitas para separar analisis, recomendacion, aprobacion y ejecucion broker-side.

4. Capa de cores analiticos y estrategias
- Cores desacoplados para indicadores, estructura tecnica, fundamental, institucional, noticias, opciones, confluencia e IA.
- Motores de estrategia por familias: basicas, Wheel, cobertura, spreads, volatilidad, complejas y term structure.
- Orquestacion AI multi-agente solo para consolidacion, investigacion y reporteria, nunca para ejecucion autonoma.

5. Capa de integraciones, datos y retencion
- Supabase como store operacional primario con esquema baseline versionado y migraciones controladas.
- MongoDB opcional para historicos o archivos analiticos cuando el caso lo justifique.
- Adaptadores para IBKR y Alpaca, conectores de market data y conectores de fuentes externas con cache/fallback.

### Controles tecnicos obligatorios

- Seguridad: JWT server-side, RBAC por rol, MFA obligatorio en aprobacion/ejecucion y credenciales solo en .env.
- Resiliencia: fail-fast en broker, RTO <= 30 min, RPO <= 5 min, politicas de dependencia y rollback operativo.
- Observabilidad: logs estructurados, trazas de auditoria, metricas de market freshness, disponibilidad y cobertura MFA.
- Cumplimiento: disclaimer explicito, retencion minima de 365 dias, evidencia auditable y comentarios FIC en codigo critico.
- Determinismo: los calculos financieros, señales y risk metrics deben permanecer en motores deterministas; LLMs solo generan narrativa, resumen o consolidacion explicable.
- Guardrail constitucional de automatismos: cualquier stop-loss automatico, cierre sugerido, roll o gestion de riesgo que termine en orden real hacia broker debe pasar por aprobacion humana explicita, MFA, validacion de version y auditoria. Se permite automatizar deteccion, alerta, simulacion, pre-armado de propuesta o bloqueo preventivo de nuevas ordenes, pero no la ejecucion sin humano en el loop.

---

## Fases Tecnicas de Implementacion

### Fase 1: Preparacion de plataforma

Backlog soportado:
- T000-T005, T059

Objetivo:
- Establecer estructura base, convenciones de calidad y baseline operacional de datos antes del resto del delivery.

Entregables:
- Estructura canonica del workspace y ownership tecnico inicial.
- Scripts de calidad y entorno para frontend/backend.
- Esquema baseline versionado en Supabase para entidades operacionales nucleares.

Trazabilidad a requisitos:
- FR-007, FR-012, FR-017, FR-019
- SC-005
- Constitucion secciones 7, 8 y 9

### Fase 2: Fundacional bloqueante

Backlog soportado:
- T006-T016

Objetivo:
- Cerrar prerrequisitos de seguridad, gobernanza, concurrencia, auditoria y observabilidad que bloquean las historias y fases de equipos.

Entregables:
- Middleware de autenticacion, RBAC y MFA.
- Dominio de lifecycle, auditoria, disclaimer, versionado y rate limiting.
- Metricas base de market data, retencion y resiliencia de dependencias.

Trazabilidad a requisitos:
- FR-004, FR-005, FR-012, FR-013, FR-015, FR-016, FR-017, FR-018, FR-019
- SC-005, SC-006, SC-007, SC-008
- Constitucion secciones 3.1, 6, 7 y 10

### Fase 3: US1 evaluacion de oportunidades

Backlog soportado:
- T017-T025

Objetivo:
- Generar senales explicables por confluencia con evidencia trazable y configuracion de fuentes.

Entregables:
- Configuracion de fuentes, confluence engine y ensamblado de explicabilidad.
- Endpoints de evaluacion/detalle y servicios frontend de senales.
- Eventos de auditoria de generacion de senales.

Trazabilidad a requisitos:
- FR-001, FR-002, FR-003, FR-006, FR-010
- SC-001, SC-004
- Constitucion secciones 3.2, 3.3 y 4

### Fase 4: US2 control humano en ejecucion

Backlog soportado:
- T026-T036

Objetivo:
- Garantizar aprobacion humana estricta y ejecucion asistida desacoplada por broker.

Entregables:
- Servicio de aprobacion MFA y orquestacion de ejecucion asistida.
- Contrato de adaptador broker, adaptadores IBKR y Alpaca.
- Endpoints de aprobacion/ejecucion, recuperacion fail-fast y auditoria operativa.

Trazabilidad a requisitos:
- FR-004, FR-005, FR-008, FR-009, FR-014, FR-016, FR-019
- SC-002, SC-008
- Constitucion secciones 3.1, 5 y 6

### Fase 5: US3 auditoria y resultados

Backlog soportado:
- T037-T043

Objetivo:
- Exponer historial auditable y analitica operacional para seguimiento y mejora post-evento.

Entregables:
- Servicio y endpoints de historial/detalle operativo.
- Dashboard y timeline de auditoria en frontend.
- Metricas de historial y analitica de portafolio auditable.

Trazabilidad a requisitos:
- FR-006, FR-007, FR-011, FR-013
- SC-003
- Constitucion secciones 6, 7 y 10

### Fase 6: Cierre y hardening transversal

Backlog soportado:
- T044-T058

Objetivo:
- Consolidar contratos, runbooks, SLOs, simulacros y gates de cumplimiento antes de ampliar el alcance multi-equipo.

Entregables:
- Contratos actualizados, matriz de trazabilidad y quickstart validado.
- SLI/SLO de disponibilidad, runbook de recuperacion y simulacro RTO/RPO.
- Cobertura MFA, gates estructurales y checklist FIC bilingue.

Trazabilidad a requisitos:
- FR-007, FR-011, FR-012, FR-013, FR-018, FR-019
- SC-005, SC-007, SC-008
- Constitucion secciones 7, 8 y 10

### Fase 7: TEAM-01 dashboard e integracion broker

Backlog soportado:
- T060-T068

Objetivo:
- Habilitar la capa visible de dashboard principal y el wiring de datos/brokers sobre una base operacional versionada.

Entregables:
- Cliente Supabase, repositories base, migraciones versionadas y validador de entorno.
- Dashboard principal con selector de instrumentos, activacion de cores, overlay de senales y tabla de explicabilidad.
- API orquestadora de dashboard e integracion broker en sandbox.

Trazabilidad a requisitos:
- FR-001, FR-002, FR-003, FR-008, FR-012
- SC-001, SC-004, SC-006
- Constitucion secciones 3.2, 4, 7 y 9

### Fase 8: TEAM-02 indicadores tecnicos y chat IA

Backlog soportado:
- T069-T076

Objetivo:
- Implementar el core de indicadores tecnicos parametrizados y su capa de consumo analitico/reporteria.

Entregables:
- Contratos y motor multi-indicador con API de evaluacion.
- Confluencia estricta y explicabilidad por indicador.
- Chat IA de solo lectura y servicios de reportes/graficas basados en resultados almacenados.

Trazabilidad a requisitos:
- FR-001, FR-002, FR-003, FR-010, FR-011
- SC-001, SC-004
- Constitucion secciones 3.2, 3.3, 4 y 6

### Fase 9: TEAM-03 fundamental y estrategias basicas de opciones

Backlog soportado:
- T077-T090

Objetivo:
- Incorporar analisis fundamental y el primer bloque de estrategias de opciones con simulacion y comparacion.

Entregables:
- Integracion de fuentes fundamentales, viability engine y screener S&P500.
- Cores Long Call, Long Put, Short Call y Short Put con simulacion temporal, alertas y comparador.
- Chat IA de solo lectura para analisis fundamental y estrategias.

Trazabilidad a requisitos:
- FR-001, FR-002, FR-003, FR-010, FR-011
- SC-001, SC-004
- Constitucion secciones 1, 3.2, 3.3, 4 y 6

### Fase 10: TEAM-04 estructura tecnica y estrategia Wheel

Backlog soportado:
- T091-T105

Objetivo:
- Sumar analisis tecnico estructural y estrategia Wheel con pronostico explicable y comparacion contextual.

Entregables:
- Contratos, algoritmos internos y proveedor externo para soportes, resistencias y tendencias.
- API de estructura y pronostico de velas enriquecido por contexto multi-core.
- Cores Covered Call y Cash-Secured Put, orquestador Wheel, comparador y chat IA de solo lectura.

Trazabilidad a requisitos:
- FR-001, FR-002, FR-003, FR-010, FR-011
- SC-001, SC-004
- Constitucion secciones 1, 3.2, 3.3 y 4

### Fase 11: TEAM-05 analisis institucional y estrategias de cobertura

Backlog soportado:
- T106-T121

Objetivo:
- Integrar el core institucional y estrategias de cobertura con simulacion avanzada, reporting y riesgo.

Entregables:
- Integracion de fuentes regulatorias/mercado, motores de zonas, tendencias y vencimientos institucionales.
- APIs institucionales y de posiciones regulatorias.
- Cores Protective Put, Collar y Covered Straddle con simulacion, riesgo, reportes y comparador.
- Chat IA de solo lectura para datos institucionales y resultados de simulacion.

Trazabilidad a requisitos:
- FR-001, FR-002, FR-003, FR-007, FR-010, FR-011
- SC-001, SC-003
- Constitucion secciones 1, 3.2, 3.3, 4 y 6

### Fase 12: TEAM-06 noticias y spreads

Backlog soportado:
- T122-T136

Objetivo:
- Operacionalizar noticias y contexto regulatorio como core explicable y conectarlo con estrategias debit/credit spread.

Entregables:
- Contratos, integradores de noticias y clasificador de impacto.
- APIs de confluencia noticiosa y contexto regulatorio/institucional.
- Cores debit/credit spread, simulacion, riesgo, reporting, comparador y orquestador noticias-estrategias.
- Chat IA de solo lectura sobre noticias procesadas y simulaciones.

Trazabilidad a requisitos:
- FR-001, FR-002, FR-003, FR-010, FR-011
- SC-001, SC-004
- Constitucion secciones 1, 3.2, 3.3 y 4

### Fase 13: TEAM-07 core AI multi-agente y estrategias long/short volatility

Backlog soportado:
- T137-T152

Objetivo:
- Implementar una capa de orquestacion AI multi-agente gobernada y estrategias de volatilidad con controles reforzados por su riesgo operacional.

Entregables:
- Contrato de orquestacion, strategy registry, agent router, policy engine, pipeline de investigacion hibrida, report engine y viability evaluator.
- API de inteligencia orquestada con trazabilidad de fuentes/versiones.
- Cores Long/Short Straddle y Long/Short Strangle con simulacion avanzada, griegas, costos reales, risk engine y APIs dedicadas.

Guardrails especificos de fase:
- Ningun agente AI puede emitir ordenes a broker, mutar estados de ejecucion ni eludir aprobacion humana.
- El policy engine debe bloquear contenido no verificable y separar calculo determinista de narrativa.
- En estrategias short volatility, kill-switch y alertas pueden congelar nuevas ordenes o abrir una propuesta de defensa, pero la orden real de cierre/roll exige aprobacion humana explicita.

Trazabilidad a requisitos:
- FR-001, FR-002, FR-007, FR-010, FR-011
- SC-001, SC-003
- Constitucion secciones 3.1, 3.3, 4, 6 y 7

### Fase 14: TEAM-08 estrategias complejas

Backlog soportado:
- T153-T161

Objetivo:
- Implementar el bloque de estrategias complejas con simulacion profesional, reporting y riesgo homologado.

Entregables:
- Contrato base y cores de Iron Condor, Iron Butterfly, Butterfly Spread y Condor.
- Motor de simulacion, risk engine y report engine con salidas profesionales.
- APIs dedicadas y comparador contextual.

Guardrails especificos de fase:
- Las estrategias multi-leg deben conservar trazabilidad por pata, validacion de margen y bloqueo de ejecucion sin propuesta aprobada.
- Cualquier automatismo de ajuste o defensa se limita a recomendacion, alerta o propuesta pre-armada hasta que exista aprobacion humana.

Trazabilidad a requisitos:
- FR-001, FR-002, FR-007, FR-010, FR-011
- SC-001, SC-003
- Constitucion secciones 1, 3.1, 3.3, 4 y 6

### Fase 15: TEAM-09 estrategias Calendar y Diagonal

Backlog soportado:
- T162-T169

Objetivo:
- Implementar estrategias de estructura temporal con riesgo, reporting y reglas de roll gobernadas constitucionalmente.

Entregables:
- Contrato base Calendar/Diagonal y cores dedicados.
- Motor de simulacion temporal, risk engine, reporting y comparador.
- Orquestador de roll/ajuste con control de deterioro temporal.

Guardrails especificos de fase:
- El orquestador de roll puede recomendar o preparar ajustes, pero no ejecutar cierres/rolls automaticamente contra broker.
- Las reglas temporales deben preservar versionado, auditoria y necesidad de aprobacion humana previa a cualquier orden derivada.

Trazabilidad a requisitos:
- FR-001, FR-002, FR-007, FR-010, FR-011
- SC-001, SC-003
- Constitucion secciones 1, 3.1, 3.3, 4 y 6

### Fase 16: estandarizacion transversal de estrategias

Backlog soportado:
- T170-T177

Objetivo:
- Normalizar contratos, outputs, simulacion, riesgo, reporting y auditoria de todas las familias de estrategia para comparabilidad homogena.

Entregables:
- Estandar transversal de request/response y salidas de estrategia.
- Ajustes de alineacion para TEAM-03 a TEAM-09 bajo un mismo envelope de payoff, escenarios, metricas de riesgo, senales y audit trail.
- Base estable para comparadores globales, testing transversal y control de regresion estrategica.

Trazabilidad a requisitos:
- FR-002, FR-006, FR-007, FR-011, FR-016
- SC-001, SC-003
- Constitucion secciones 4, 7 y 10

---

## Dependencias y Secuencia de Implementacion

- Fase 1 habilita el baseline estructural y de datos; T059 permanece como prerrequisito tecnico para las fases analiticas y de equipos.
- Fase 2 bloquea seguridad, concurrencia, resiliencia y auditoria antes de ampliar superficie funcional.
- Fases 3, 4 y 5 consolidan el MVP constitucional de senales, control humano y auditoria.
- Fase 6 cierra contratos, runbooks y gates transversales antes del escalamiento multi-equipo.
- Fase 7 depende de Fase 2 y de T059; estabiliza dashboard, Supabase client y wiring broker para el resto.
- Fases 8 a 15 pueden ejecutarse por ondas con alto paralelismo despues de T059/T060, manteniendo contratos, repositorios y observabilidad comunes.
- Fase 13 introduce el mayor riesgo constitucional por orquestacion AI y estrategias short volatility; requiere aplicar guardrails reforzados antes de exponer automatismos operativos.
- Fase 16 solo inicia tras cerrar funcionalmente las familias de estrategias TEAM-03 a TEAM-09 y sirve como gate de homogeneizacion previo a mayor automatizacion analitica.

---

## Riesgos, Supuestos y Mitigaciones

- Riesgo: interpretacion de stop-loss, kill-switch, roll o cierre automatico como auto-trading. Impacto: critico. Probabilidad: alta en fases 9-15. Mitigacion: convertir cualquier accion broker-side en propuesta aprobable con MFA, auditoria y versionado; permitir solo alerta, simulacion o bloqueo preventivo sin humano en el loop. Owner: arquitectura + seguridad.
- Riesgo: la orquestacion AI multi-agente se convierta en fuente unica o no verificable de decision. Impacto: critico. Probabilidad: media. Mitigacion: separar calculo determinista de narrativa, policy engine con whitelist y verificacion de fuentes, trazabilidad por request_id y bloqueo de prompts/salidas no auditables. Owner: arquitectura AI.
- Riesgo: drift entre backlog canonico y artefactos operativos de SpecKit para fases 7-16. Impacto: alto. Probabilidad: alta. Mitigacion: mantener este plan subordinado al backlog canonico, ejecutar validacion posterior con diana.tasks validate y resincronizar specs operativos antes de implementacion masiva. Owner: gobernanza SDD.
- Riesgo: heterogeneidad de contratos y outputs entre familias de estrategias. Impacto: alto. Probabilidad: alta. Mitigacion: usar Fase 16 como gate obligatorio, con envelope estandar y comparadores alineados antes de optimizaciones posteriores. Owner: arquitectura de dominio.
- Riesgo: calidad/latencia de fuentes externas de mercado, noticias, institucional y fundamentales. Impacto: alto. Probabilidad: media. Mitigacion: cache, fallback entre proveedores, degradacion controlada de confianza y bloqueo de senal cuando la evidencia no cumpla calidad minima. Owner: integraciones.
- Supuesto: T000 y T059 permanecen como anclas canonicamente validas del backlog y no se alteran fuera de /diana.tasks. Impacto: alto si cambia. Mitigacion: cualquier ajuste debe nacer en backlog canonico y repropagarse a plan y artefactos derivados. Owner: gobernanza.

---

## Criterios de Validacion Tecnica

- Checklist de consistencia constitucional: IA no ejecuta, control humano obligatorio, arquitectura por cores desacoplados, senales explicables, no black-box.
- Checklist de consistencia con especificacion: cobertura explicita de FR-001..FR-019 y SC-001..SC-008 sin introducir requisitos nuevos fuera del alcance aprobado.
- Checklist de seguridad/resiliencia/observabilidad/cumplimiento: JWT, RBAC, MFA, rate limit, optimistic locking, RTO/RPO, retencion 365 dias, auditoria, disclaimer y cobertura FIC.
- Checklist de backlog: el plan explica y soporta T000-T177 sin renumerar, eliminar ni simplificar tareas existentes.
- Checklist de automatismos de riesgo/cierre: cualquier accion sobre broker requiere aprobacion humana; solo se automatiza deteccion, simulacion, alertamiento, pre-armado de propuesta o bloqueo preventivo.
- Readiness para descomposicion: dependencias, guardrails, owners de riesgo y gates por fase quedan explicitados para /speckit.plan.

---

## Integracion con Speckit

- estado_readiness_para_speckit_plan: listo, con fases 1-16, dependencias, trazabilidad y guardrails constitucionales explicitados.
- estado_readiness_para_speckit_tasks: condicionado a validar congruencia del backlog canonico extendido contra specs/001-plataforma-inversiones-ia/tasks.md y plan.md, ya que el backlog canonico vigente va mas alla del operativo hoy sincronizado.
- recomendaciones:
  1. Ejecutar /diana.tasks validate sobre la iniciativa para verificar congruencia backlog-plan y detectar gaps de resincronizacion operativa.
  2. Sincronizar despues los artefactos operativos derivados de SpecKit antes de usar el nuevo alcance extendido en implementacion diaria.
  3. Mantener Fase 13-Fase 15 bajo revisiones explicitas de seguridad y cumplimiento por el riesgo de automatismos de cierre/roll.

---

## Cambios Significativos vs Version Previa

- El plan fue regenerado sobre la template core obligatoria y normalizado a la estructura de autoridad, entradas, arquitectura, fases, riesgos, validacion e integracion con Speckit.
- La fuente vigente de alcance se actualizo explicitamente al backlog canonico .drfic/.../001-inv-tasks.md, en lugar de depender solo del plan operativo derivado.
- La cobertura de fases se extendio de Fase 1-Fase 6 a Fase 1-Fase 16, incorporando TEAM-01 a TEAM-09 y la fase de estandarizacion transversal.
- Se reemplazo el enfoque previo centrado en una estructura de repo hipotetica por una arquitectura orientada a capacidades, dependencias y guardrails, mas coherente con el estado actual del proyecto y del backlog.
- Se anadieron guardrails constitucionales explicitos para automatismos de riesgo/cierre, orquestacion AI multi-agente y estrategias de alta complejidad o volatilidad, sin modificar el backlog.
- Se declaro de forma explicita el gap residual de sincronizacion entre backlog canonico extendido y artefactos operativos de SpecKit.

---

## Estado

Este documento constituye el Plan Tecnico Canonico de la iniciativa 001-inversions y queda listo como base de /speckit.plan, sujeto a la validacion posterior de congruencia backlog-operativo indicada arriba.

Salida canónica hacia descomposición:
- `/diana.tasks` genera `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-tasks.md` a partir de esta planificación técnica.
- `specs/001-plataforma-inversiones-ia/tasks.md` se trata como backlog operativo derivado para ejecución con SpecKit.
|       |   |   +---initiatives
|       |   |   |   \---001-dianacore
|       |   |   |           001-dianacore-plan.md
|       |   |   |           001-dianacore-spec.md
|       |   |   |           meta.md
|       |   |   \---knowledge
|       |   |       |   README.md
|       |   |       +---indexes
|       |   |       |       master-index.md
|       |   |       +---local
|       |   |       |   +---dev
|       |   |       |   |       001-developing-with-diana.md
|       |   |       |   +---domain
|       |   |       |   |       001-sdk-dashboard-overview.md
|       |   |       |   |
|       |   |       |   \---ui-patterns
|       |   |       |           001-admin-panel-patterns.md
|       |   |       \---remote
|       |   |               sources.md
|       |   \---knowledge
|       |       |   README.md
|       |       +---indexes
|       |       |       command-routing.md
|       |       |       master-index.md
|       |       |       projects-knowledge-radar.yaml
|       |       +---local
|       |       |   \---cores
|       |       |           001-technical-analysis-baseline.md
|       |       |           002-fundamental-analysis-baseline.md
|       |       |           003-buy-sell-signals-baseline.md
|       |       |           004-options-strategies-baseline.md
|       |       |           005-institutional-options-flow-baseline.md
|       |       |           006-realtime-news-impact-baseline.md
|       |       |           007-ai-confluence-baseline.md
|       |       +---remote
|       |       |       sources.md
|       |       |
|       |       +---skills
|       |       |       001-fin-risk-taxonomy-baseline.md
|       |       |       002-fin-human-approval-trade-governance.md
|       |       |       003-fin-realtime-market-data-slo.md
|       |       |       README.md
|       |       \---snapshots
|       |               .gitkeep
|       \---sdk
|           \---diana
|               |   constitution.md
|               +---checklists
|               |       checklists.md
|               |       initiative-audit-checklist.md
|               |       plan-quality-checklist.md
|               |       sdd-quality-gate.md
|               |       spec-quality-checklist.md
|               |       tasks-quality-checklist.md
|               +---knowledge
|               |   |   README.md
|               |   +---indexes
|               |   |       by-agent.md
|               |   |       master-index.md
|               |   |       shared-skills-manifest.yaml
|               |   +---local
|               |   |   +---agents
|               |   |   |       001-agent-roles-deep.md
|               |   |   +---glossaries
|               |   |   |       001-diana-terms.md
|               |   |   +---methodology
|               |   |   |       001-sdd-lifecycle.md
|               |   |   \---patterns
|               |   |           001-speckit-integration-patterns.md
|               |   +---remote
|               |   |       sources.md
|               |   \---skills
|               |           001-SDK-SDDCORE.md
|               |           002-SDK-TSSTACK.md
|               |           README.md
|               +---prompts
|               |       agent-copilot.md
|               |       agent-plan-architect.md
|               |       agent-qa-validator.md
|               |       agent-reviewer.md
|               |       agent-spec-writer.md
|               |       agent-task-generator.md
|               +---rules
|               |       agents.md
|               |       governance-and-naming.md
|               |       lifecycle.md
|               |       naming-conventions.md
|               |       sdd-quality-metrics.md
|               |       spec-versioning.md
|               |       speckit-integration.md
|               \---templates
|                       constitution.md
|                       initiative-readme.md
|                       meta.md
|                       spec.md
+---.github
|   |   copilot-instructions.md
|   +---agents
|   |       diana.knowledge.agent.md
|   |       diana.plan.agent.md
|   |       diana.skills.agent.md
|   |       speckit.analyze.agent.md
|   |       speckit.checklist.agent.md
|   |       speckit.clarify.agent.md
|   |       speckit.constitution.agent.md
|   |       speckit.git.commit.agent.md
|   |       speckit.git.feature.agent.md
|   |       speckit.git.initialize.agent.md
|   |       speckit.git.remote.agent.md
|   |       speckit.git.validate.agent.md
|   |       speckit.implement.agent.md
|   |       speckit.plan.agent.md
|   |       speckit.specify.agent.md
|   |       speckit.tasks.agent.md
|   |       speckit.taskstoissues.agent.md
|   +---instructions
|   |       speckit-knowledge-enrichment.instructions.md
|   \---prompts
|           diana.knowledge.prompt.md
|           diana.plan.prompt.md
|           diana.skills.prompt.md
|           speckit.analyze.prompt.md
|           speckit.checklist.prompt.md
|           speckit.clarify.prompt.md
|           speckit.constitution.prompt.md
|           speckit.git.commit.prompt.md
|           speckit.git.feature.prompt.md
|           speckit.git.initialize.prompt.md
|           speckit.git.remote.prompt.md
|           speckit.git.validate.prompt.md
|           speckit.implement.prompt.md
|           speckit.plan.prompt.md
|           speckit.specify.prompt.md
|           speckit.tasks.prompt.md
|           speckit.taskstoissues.prompt.md
+---.specify
|   |   extensions.yml
|   |   feature.json
|   |   init-options.json
|   |   integration.json
|   +---extensions
|   |   |   .registry
|   |   \---git
|   |       |   config-template.yml
|   |       |   extension.yml
|   |       |   git-config.yml
|   |       |   README.md
|   |       +---commands
|   |       |       speckit.git.commit.md
|   |       |       speckit.git.feature.md
|   |       |       speckit.git.initialize.md
|   |       |       speckit.git.remote.md
|   |       |       speckit.git.validate.md
|   |       \---scripts
|   |           +---bash
|   |           |       auto-commit.sh
|   |           |       create-new-feature.sh
|   |           |       git-common.sh
|   |           |       initialize-repo.sh
|   |           \---powershell
|   |                   auto-commit.ps1
|   |                   create-new-feature.ps1
|   |                   git-common.ps1
|   |                   initialize-repo.ps1
|   +---integrations
|   |   |   copilot.manifest.json
|   |   |   speckit.manifest.json
|   |   \---copilot
|   |       \---scripts
|   |               update-context.ps1
|   |               update-context.sh
|   +---memory
|   |       constitution.md
|   +---scripts
|   |   \---powershell
|   |           check-prerequisites.ps1
|   |           common.ps1
|   |           create-new-feature.ps1
|   |           setup-plan.ps1
|   |           update-agent-context.ps1
|   +---templates
|   |       agent-file-template.md
|   |       checklist-template.md
|   |       constitution-template.md
|   |       plan-template.md
|   |       spec-template.md
|   |       tasks-template.md
|   \---workflows
|       |   workflow-registry.json
|       \---speckit
|               workflow.yml
+---.vscode
|       settings.json
\---specs
    \---001-plataforma-inversiones-ia
        |   data-model.md
        |   plan.md
        |   quickstart.md
        |   research.md
        |   spec.md
        +---checklists
        |       requirements.md
        \---contracts
                auth-context.md
                broker-adapter.md
                signal-lifecycle.md
```

##### Estructura de codigo (repo)

│
└── projects/                           # Portafolio completo de proyectos y shared code
    ├── packages/                       # Librerías/código reutilizable para cualquier proyecto
    │   ├── ui-library/                 # Librería interna de componentes UI
    │   │   ├── src/
    │   │   ├── package.json
    │   │   └── tsconfig.json
    │   ├── utils/                      # Funciones utilitarias compartidas
    │   │   ├── src/
    │   │   ├── package.json
    │   │   └── tsconfig.json
    │   └── types/                      # Tipos globales compartidos
    │       ├── src/
    │       ├── package.json
    │       └── tsconfig.json
    ├── pwa/                            # Todos los proyectos PWA del portafolio
    │   ├── inversions_app/             # Proyecto: Plataforma de Inversiones IA
    │   │   ├── public/
    │   │   ├── data/                   # Contratos/modelos de referencia por base de datos
    │   │   │   ├── supabase/
    │   │   │   │   ├── models/
    │   │   │   │   ├── schema/
    │   │   │   │   └── data/
    │   │   │   ├── mongodb/
    │   │   │   │   ├── models/
    │   │   │   │   ├── schema/
    │   │   │   │   └── data/
    │   │   │   └── ...
    │   │   ├── src/                    # Código ejecutable de la PWA
    │   │   │   ├── assets/
    │   │   │   ├── components/
    │   │   │   │   └── ui/
    │   │   │   ├── features/
    │   │   │   │   ├── dashboard/
    │   │   │   │   ├── market-scanner/
    │   │   │   │   ├── options-chain/
    │   │   │   │   ├── signals/
    │   │   │   │   ├── portfolio/
    │   │   │   │   ├── broker-connect/
    │   │   │   │   ├── backtesting/
    │   │   │   │   └── alerts/
    │   │   │   ├── hooks/
    │   │   │   ├── layouts/
    │   │   │   ├── pages/
    │   │   │   ├── routes/
    │   │   │   ├── services/
    │   │   │   │   ├── broker/
    │   │   │   │   ├── market-data/
    │   │   │   │   ├── indicators/
    │   │   │   │   ├── technical-analysis/
    │   │   │   │   ├── fundamental-analysis/
    │   │   │   │   ├── ai-analysis/
    │   │   │   │   ├── institutional-analysis/
    │   │   │   │   ├── news/
    │   │   │   │   └── strategies/
    │   │   │   ├── store/
    │   │   │   ├── styles/
    │   │   │   ├── utils/
    │   │   │   ├── types/
    │   │   │   ├── App.tsx
    │   │   │   ├── main.tsx
    │   │   │   └── vite-env.d.ts
    │   │   ├── tests/
    │   │   │   └── e2e/
    │   │   ├── index.html
    │   │   ├── package.json
    │   │   ├── tsconfig.json
    │   │   └── vite.config.ts
    └── rest-api/                       # Todos los proyectos REST API del portafolio
        └── inversions_api/  # Persistencia real y exposición de endpoints
            ├── src/
            │   ├── routes/
            │   ├── controllers/
            │   ├── services/
            │   ├── models/
            │   ├── migrations/
            │   └── config/
            ├── DATABASE_CONFIG.yaml
            ├── .env.example
            ├── package.json
            └── tsconfig.json
```


### Fase 2: Core de Analisis y Confluencia

Objetivo:
Construir pipeline analitico multi-core y salida explicable.

Entregables:
- Evaluacion de fuentes activas.
- Motor de confluencia con evidencia trazable.
- Definicion de propuesta operativa asociada a senal.

Trazabilidad:
- FR-001, FR-002, FR-003, FR-010, SC-001, SC-004

### Fase 3: Flujo Operativo Human-in-the-loop

Objetivo:
Implementar ciclo de vida operativo con aprobacion humana estricta.

Entregables:
- Estados de propuesta/orden e historial.
- Bloqueo de ejecucion sin aprobacion valida.
- Fail-fast y reintento controlado post-falla.
- Optimistic locking en acciones concurrentes.

Trazabilidad:
- FR-004, FR-005, FR-006, FR-009, FR-016, SC-002

### Fase 4: Integracion Broker y Market Data

Objetivo:
Habilitar ejecucion asistida y datos de mercado en tiempo real.

Entregables:
- Adaptadores IBKR y Alpaca para Market/Limit.
- Normalizacion de estados broker -> dominio.
- Telemetria de latencia y frescura de market data.

Trazabilidad:
- FR-008, FR-014, SC-006

### Fase 5: Auditoria, Cumplimiento y Resiliencia

Objetivo:
Completar requisitos de cumplimiento, evidencia y recuperacion.

Entregables:
- Registro de auditoria inmutable.
- Politicas de retencion 365 dias y evidencia operativa.
- Disclaimer explicito en puntos de decision/ejecucion.
- Estrategia operativa para RTO/RPO objetivos.

Trazabilidad:
- FR-007, FR-011, FR-013, FR-018, SC-003, SC-007, SC-008

### Fase 6: Endurecimiento y Readiness Speckit

Objetivo:
Dejar artefactos listos para descomposicion en /speckit.plan y /speckit.tasks.

Entregables:
- Matriz final FR/SC -> componentes -> pruebas.
- Lista de riesgos residuales y mitigaciones activas.
- Criterios de salida por fase y checkpoints.

## 6. Matriz de Trazabilidad Minima

- Analisis y confluencia: FR-001/002/003/010 -> Fase 2.
- Control humano y ciclo de orden: FR-004/005/006/009/016 -> Fase 3.
- Integracion de brokers y tipos de orden: FR-008/014 -> Fase 4.
- Seguridad y acceso: FR-012/017/019 -> Fase 1.
- Cumplimiento y auditoria: FR-007/011/013/015/018 -> Fases 5 y 1.
- Resultados medibles: SC-001..SC-008 -> Fases 2..5.

## 7. Riesgos Tecnicos y Mitigaciones

1. Deriva entre estados internos y broker.
Mitigacion: reconciliacion periodica, idempotencia y mapeo canonico de estados.

2. Degradacion de market data en alta volatilidad.
Mitigacion: buffering, fallback de feed y alertas de p95.

3. Riesgo de bypass de controles de aprobacion.
Mitigacion: enforce server-side de aprobacion, RBAC y MFA.

4. Falla de servicios criticos fuera de objetivos RTO/RPO.
Mitigacion: runbooks, backups, restauracion probada y simulacros.

5. Ambiguedad futura por cambios no trazados al canon.
Mitigacion: gate de trazabilidad obligatorio previo a tareas/implementacion.

## 8. Validacion de Consistencia Plan/Spec

Resumen de validacion actual:
- OK: 9
- GAPS: 0

Chequeos OK:
1. El plan no contradice constitucion ni especificacion canonica.
2. El plan mantiene modelo semi-automatico y control humano obligatorio.
3. Cada fase mapea a FR/SC verificables.
4. Se consideran skills requeridas para etapa plan.
5. Se contempla seguridad minima (JWT, RBAC, MFA).
6. Se contempla resiliencia minima (RTO/RPO).
7. Se contempla observabilidad para operaciones criticas.
8. Se contempla cumplimiento (disclaimer, auditoria, retencion).
9. El resultado es apto como entrada de /speckit.plan.

## 9. Cambios Significativos vs Version Previa

1. Se alineo el plan a FR-016..FR-019 y SC-006..SC-008.
2. Se reemplazo enfoque generico por trazabilidad explicita a canon operativo.
3. Se incorporaron controles operativos obligatorios:
- optimistic locking
- fail-fast con nueva aprobacion
- RBAC
- MFA
- RTO/RPO
4. Se adiciono matriz de skills requeridas para etapa plan.
5. Se formalizo resumen de consistencia OK/GAPS.

## 10. Salida

Este documento queda listo como plan tecnico canonico regenerado para consumo en:
- /diana.plan action="validate"
- /speckit.plan
