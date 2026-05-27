# Team Agent Bootstrap Canonico
## Plataforma de Inversiones con IA

Generado por: /diana.teams action="generate"
Proyecto: DIANA Inversions
Iniciativa: 001-inversions
Fase activa por default: speckit.implement
Fecha: 2026-05-03

---

## Carga Global Obligatoria

1. .drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml
2. .drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/skills-manifest.yaml
3. .drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/agent-skill-matrix.yaml
4. .drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/sdd-engine-matrix.yaml
5. .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-spec.md
6. .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-plan.md
7. .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/001-inv-tasks.md
8. .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/speckit/team-task-allocation.md

---

## Bootstrap por Equipo

### TEAM-01
- team_alias: CRUD-X
- phase: speckit.implement
- required_skills:
  - 009-inv-execution-governance-human-control
  - 010-inv-broker-integration-ibkr-alpaca
  - 012-inv-compliance-audit-retention
- required_knowledge_docs:
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/009-inv-execution-governance-human-control.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/010-inv-broker-integration-ibkr-alpaca.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/012-inv-compliance-audit-retention.md
- contracts_in_scope:
  - specs/001-plataforma-inversiones-ia/contracts/auth-context.md
  - specs/001-plataforma-inversiones-ia/contracts/broker-adapter.md
- output_expected:
  - slices backend de seguridad, ejecución y gates estructurales
- known_gaps:
  - github_user pendientes de registro en roster

### TEAM-02
- team_alias: CF-DASH
- phase: speckit.implement
- required_skills:
  - 007-inv-ai-confluence-orchestration
  - 008-inv-market-data-and-realtime
  - 012-inv-compliance-audit-retention
- required_knowledge_docs:
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/007-inv-ai-confluence-orchestration.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/008-inv-market-data-and-realtime.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/012-inv-compliance-audit-retention.md
- contracts_in_scope:
  - specs/001-plataforma-inversiones-ia/contracts/auth-context.md
  - specs/001-plataforma-inversiones-ia/contracts/signal-lifecycle.md
- output_expected:
  - UI de señales, aprobación, ejecución e historial
- known_gaps:
  - confirmar ownership de cambios cross-team de frontend

### TEAM-03
- team_alias: STRAT-WHEEL
- phase: speckit.implement
- required_skills:
  - 004-inv-options-strategy-engine
  - 007-inv-ai-confluence-orchestration
  - 010-inv-broker-integration-ibkr-alpaca
- required_knowledge_docs:
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/004-inv-options-strategy-engine.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/007-inv-ai-confluence-orchestration.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/010-inv-broker-integration-ibkr-alpaca.md
- contracts_in_scope:
  - specs/001-plataforma-inversiones-ia/contracts/broker-adapter.md
- output_expected:
  - confluencia, explicabilidad, contrato broker y observabilidad SLO
- known_gaps:
  - documentar reglas específicas de estrategia Wheel si se amplía alcance

### TEAM-04
- team_alias: DiviNoSQL
- phase: speckit.implement
- required_skills:
  - 004-inv-options-strategy-engine
  - 010-inv-broker-integration-ibkr-alpaca
  - 012-inv-compliance-audit-retention
- required_knowledge_docs:
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/004-inv-options-strategy-engine.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/010-inv-broker-integration-ibkr-alpaca.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/012-inv-compliance-audit-retention.md
- contracts_in_scope:
  - specs/001-plataforma-inversiones-ia/contracts/broker-adapter.md
  - specs/001-plataforma-inversiones-ia/contracts/auth-context.md
- output_expected:
  - adaptador IBKR y auditoría de cobertura MFA
- known_gaps:
  - alinear IBKR con pruebas de integración futuras

### TEAM-05
- team_alias: TurboPapus
- phase: speckit.implement
- required_skills:
  - 004-inv-options-strategy-engine
  - 005-inv-institutional-analysis
  - 008-inv-market-data-and-realtime
  - 010-inv-broker-integration-ibkr-alpaca
  - 012-inv-compliance-audit-retention
- required_knowledge_docs:
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/004-inv-options-strategy-engine.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/005-inv-institutional-analysis.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/008-inv-market-data-and-realtime.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/010-inv-broker-integration-ibkr-alpaca.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/012-inv-compliance-audit-retention.md
- contracts_in_scope:
  - specs/001-plataforma-inversiones-ia/contracts/broker-adapter.md
  - specs/001-plataforma-inversiones-ia/contracts/auth-context.md
  - specs/001-plataforma-inversiones-ia/contracts/signal-lifecycle.md
- output_expected:
  - Contrato de parámetros institucionales (T106)
  - Servicio de integración con fuentes 13F/SEC/FINRA (T107)
  - Motor de zonas S/R institucionales y tendencias MAs largas (T108, T109)
  - Motor de análisis de vencimientos (T110)
  - APIs institucionales para overlay en gráfico (T111, T112)
  - Contrato base de estrategias de cobertura (T113)
  - Cores Protective Put, Collar Put, Covered Straddle (T114, T115, T116)
  - Motor Monte Carlo/backtesting y alertas/stop-loss (T117, T118)
  - Reporting, comparador multi-estrategia y chat IA (T119, T120, T121)
  - Adaptador Alpaca (T030) y reporte MFA (T054)
- known_gaps:
  - validar disponibilidad y costos de APIs externas institucionales (13F, FINRA, Unusual Whales)
  - confirmar formato de overlay esperado por TEAM-01 para zonas S/R en gráfico principal
  - alinear contrato de alertas push/email con infraestructura de notificaciones del backend

### TEAM-06
- team_alias: CodersTMNT
- phase: speckit.implement
- required_skills:
  - 004-inv-options-strategy-engine
  - 006-inv-news-and-event-driven-signals
  - 008-inv-market-data-and-realtime
  - 010-inv-broker-integration-ibkr-alpaca
- required_knowledge_docs:
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/004-inv-options-strategy-engine.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/006-inv-news-and-event-driven-signals.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/008-inv-market-data-and-realtime.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/010-inv-broker-integration-ibkr-alpaca.md
- contracts_in_scope:
  - specs/001-plataforma-inversiones-ia/contracts/signal-lifecycle.md
  - specs/001-plataforma-inversiones-ia/contracts/auth-context.md
  - specs/001-plataforma-inversiones-ia/contracts/broker-adapter.md
- output_expected:
  - Contrato de parámetros de noticias y agregación multi-fuente (T122, T123)
  - Clasificador de impacto y correlación técnica de noticias (T124, T125)
  - APIs de confluencia noticiosa y contexto regulatorio (T126, T127)
  - Contrato base Spread y cores Debit/Credit (T128, T129, T130)
  - Simulación transversal, riesgo/alertas, reporting y comparador (T131, T132, T133, T134)
  - Orquestador noticias-estrategias y chat IA (T135, T136)
  - Componentes fundacionales previos mantenidos (T009, T010, T011, T014, T045)
- known_gaps:
  - validar disponibilidad y costo de APIs de noticias (Finnhub, Polygon, NewsAPI)
  - definir política de reconciliación de eventos duplicados entre proveedores
  - acordar formato de anotaciones sobre velas con TEAM-01 y TEAM-04

### TEAM-07
- team_alias: SixPackDevs
- phase: speckit.implement
- required_skills:
  - 004-inv-options-strategy-engine
  - 007-inv-ai-confluence-orchestration
  - 008-inv-market-data-and-realtime
  - 010-inv-broker-integration-ibkr-alpaca
  - 011-inv-portfolio-and-performance-analytics
- required_knowledge_docs:
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/004-inv-options-strategy-engine.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/007-inv-ai-confluence-orchestration.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/008-inv-market-data-and-realtime.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/010-inv-broker-integration-ibkr-alpaca.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/011-inv-portfolio-and-performance-analytics.md
- contracts_in_scope:
  - specs/001-plataforma-inversiones-ia/contracts/signal-lifecycle.md
  - specs/001-plataforma-inversiones-ia/contracts/auth-context.md
  - specs/001-plataforma-inversiones-ia/contracts/broker-adapter.md
- output_expected:
  - Orquestación AI multi-agente con Request Envelope, Registry y Policy Engine (T137-T140)
  - Pipeline de investigación local/remota + nube con verificación de fuentes (T141)
  - Plantilla profesional de reporte con gráficas y análisis de viabilidad (T142, T143)
  - API de inteligencia orquestada para UI principal (T144)
  - Contrato de volatilidad y cores Long/Short Straddle/Strangle (T145-T149)
  - Simulación cuantitativa con griegas, shocks de IV/precio y costos reales (T150)
  - Risk engine con hard limits, kill-switch, alertas y stop-loss (T151)
  - APIs dedicadas y comparador contextual de volatilidad (T152)
  - Componentes previos de historial/resiliencia mantenidos (T037, T039, T043, T051, T052)
- known_gaps:
  - definir alcance final de estilo de opción (americano/europeo) por mercado de operación
  - validar lista blanca de fuentes y licenciamiento para investigación en tiempo real
  - acordar formato final de gráficas/reportes con TEAM-01 para integración de dashboard

### TEAM-08
- team_alias: GlassCoke
- phase: speckit.implement
- required_skills:
  - 004-inv-options-strategy-engine
  - 008-inv-market-data-and-realtime
  - 010-inv-broker-integration-ibkr-alpaca
  - 011-inv-portfolio-and-performance-analytics
  - 012-inv-compliance-audit-retention
- required_knowledge_docs:
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/004-inv-options-strategy-engine.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/008-inv-market-data-and-realtime.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/010-inv-broker-integration-ibkr-alpaca.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/011-inv-portfolio-and-performance-analytics.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/012-inv-compliance-audit-retention.md
- contracts_in_scope:
  - specs/001-plataforma-inversiones-ia/contracts/auth-context.md
  - specs/001-plataforma-inversiones-ia/contracts/broker-adapter.md
  - specs/001-plataforma-inversiones-ia/contracts/signal-lifecycle.md
- output_expected:
  - Contrato base de estrategias complejas y cores Iron Condor/Butterfly/Condor (T153-T157)
  - Simulación avanzada y risk engine para estrategias complejas (T158, T159)
  - Visualización, reporting y APIs dedicadas con comparador contextual (T160, T161)
  - Alineación al estándar transversal de estrategias (T176)
  - Componentes previos de analítica/cumplimiento mantenidos (T038, T040, T055, T058)
- known_gaps:
  - definir matriz de selección de strikes/deltas y reglas de wing width por activo
  - validar supuestos de liquidez/slippage para estrategias de 4 patas en mercados locales
  - acordar formato de comparador de payoff/riesgo con TEAM-01 para dashboard unificado

### TEAM-09
- team_alias: SquadISC
- phase: speckit.implement
- required_skills:
  - 004-inv-options-strategy-engine
  - 008-inv-market-data-and-realtime
  - 010-inv-broker-integration-ibkr-alpaca
  - 011-inv-portfolio-and-performance-analytics
  - 012-inv-compliance-audit-retention
- required_knowledge_docs:
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/004-inv-options-strategy-engine.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/008-inv-market-data-and-realtime.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/010-inv-broker-integration-ibkr-alpaca.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/011-inv-portfolio-and-performance-analytics.md
  - .drfic/diana-sdk/projects/diana-inversions/knowledge/skills/012-inv-compliance-audit-retention.md
- contracts_in_scope:
  - specs/001-plataforma-inversiones-ia/contracts/auth-context.md
  - specs/001-plataforma-inversiones-ia/contracts/broker-adapter.md
  - specs/001-plataforma-inversiones-ia/contracts/signal-lifecycle.md
- output_expected:
  - Contrato base Calendar/Diagonal y cores call/put (T162-T164)
  - Simulación temporal y risk engine de term-structure (T165, T166)
  - Visualización, reporting y APIs comparativas Calendar vs Diagonal (T167, T168)
  - Orquestador de roll y ajustes temporales operativo (T169)
  - Alineación al estándar transversal de estrategias (T177)
- known_gaps:
  - definir supuestos de modelado de curva temporal e IV term structure por mercado
  - validar reglas de roll (calendario, triggers, costos) con política de riesgo institucional
  - acordar formato de métricas de theta decay y sensibilidad temporal para UI consolidada

---

## Checklist

- [x] Radar cargado
- [x] Skills definidas por equipo para fase activa
- [x] Knowledge docs relevantes identificados
- [x] Contratos en scope confirmados
- [x] Ownership validado contra asignación de tareas
- [x] Riesgos y gaps registrados

---

## Política de Gaps

Si falta una skill o knowledge doc requerido:
- Continuar con metodología estándar.
- Registrar gap en este archivo y en el artefacto del equipo.
- Recomendar cierre con /diana.knowledge.

---

## Estado

Este documento constituye el Bootstrap Canónico de Agentes por Equipo para la iniciativa 001-inversions.

