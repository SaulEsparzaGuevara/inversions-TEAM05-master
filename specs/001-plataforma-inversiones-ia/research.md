# Research: Plataforma de Inversiones con IA

## Decision 1

- Decision: Mantener arquitectura separada en `frontend` (PWA) y `backend` (REST API) con dominio y adaptadores desacoplados. La arquitectura soporta multiproyectos, es decir varios proyectos `frontend` (PWA) y varios `backend` (REST API) dentro de la estructura.
- Rationale: La constitucion exige separacion estricta UI/API y trazabilidad operativa; el acoplamiento directo compromete seguridad y auditabilidad.
- Alternatives considered:
  - Monolito con logica mezclada de UI y ejecucion: descartado por menor gobernanza y mantenibilidad.
  - Frontend consumiendo brokers directo: descartado por exposicion de credenciales y falta de control server-side.

## Decision 2

- Decision: Usar Supabase como store operacional primario y mantener MongoDB/vector store como soporte opcional para historico y contexto IA.
- Rationale: Alinea el stack activo del proyecto y evita dependencia obligatoria de componentes no esenciales para v1.
- Alternatives considered:
  - Solo MongoDB: descartado por conflicto con la base operativa definida.
  - Sin store opcional para contexto IA: descartado porque limita evolucion de explicabilidad y eficiencia de IA.

## Decision 3

- Decision: Enforzar ciclo de orden human-in-the-loop con estados canonicos y re-aprobacion obligatoria tras `FAILED`.
- Rationale: `FR-004`,`FR-005`,`FR-009` y conocimiento `INV-D-001` exigen control humano previo y posterior a fallas.
- Alternatives considered:
  - Reintento automatico de orden fallida: descartado por violar control humano.
  - Estado fallido sin retroceso a aprobacion: descartado por riesgo operacional.

## Decision 4

- Decision: Definir contrato unico de market data normalizado y pipeline realtime con objetivo p95<=1s.
- Rationale: `SC-006` y `INV-D-002` requieren frescura acotada, fallback y desacoplamiento de formatos nativos de broker.
- Alternatives considered:
  - Payload broker nativo en frontend: descartado por alto acoplamiento y complejidad multi-broker.
  - Polling como estrategia principal: descartado por no sostener objetivo de frescura.

## Decision 5

- Decision: Integrar IBKR y Alpaca exclusivamente mediante adaptadores internos con mapeo de estados e idempotencia.
- Rationale: `FR-008`,`FR-014` y knowledge de brokers (`INV-B-001`,`INV-B-002`,`INV-B-003`) demandan aislamiento de SDKs y trazabilidad robusta.
- Alternatives considered:
  - Un solo broker en v1: descartado por incumplir alcance.
  - Uso directo de SDKs dentro de servicios de dominio: descartado por acoplamiento.

## Decision 6

- Decision: Tratar IA como subsistema asesor de confluencia, nunca como ejecutor autonomo.
- Rationale: Constitucion y `FR-010` obligan a mantener IA como apoyo explicable y no como autoridad de ejecucion.
- Alternatives considered:
  - IA como fuente unica de senal: descartado por violar principio de confluencia.
  - IA con auto-ejecucion condicionada: descartado por inconstitucional en v1.

## Decision 7

- Decision: Incorporar gobernanza de seguridad operativa con JWT, RBAC, MFA, rate limit, optimistic locking y auditoria.
- Rationale: Cobertura directa de `FR-012`,`FR-015`,`FR-016`,`FR-017`,`FR-019`, ademas de compliance y resiliencia (`FR-007`,`FR-013`,`FR-018`).
- Alternatives considered:
  - Seguridad minima solo por autenticacion: descartado por no cubrir autorizacion granular ni operaciones sensibles.
  - Locks pesimistas globales para concurrencia: descartado por costo y baja escalabilidad frente a optimistic locking.

## Cobertura de Clarificaciones

No quedan elementos `NEEDS CLARIFICATION` para la fase de planificacion. Las dudas operativas criticas (brokers, market/limit, p95, fail-fast, MFA, RBAC, RTO/RPO, retention) quedaron resueltas en `spec.md`.
