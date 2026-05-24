# Spec: 006-team-05-institucional-cobertura

## Resumen

Feature para TEAM-05 (TurboPapus): análisis institucional y estrategias de cobertura (Protective Put, Married Put, Collar Put, Covered Straddle) con apoyo de Chat IA explicativo. Esta spec deriva de la fuente canónica: .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-05/spec.md

## Clarifications

### Session 2026-05-22

- Q: ¿Qué comportamiento debe tener el sistema cuando las fuentes de datos upstream (SEC EDGAR, FINRA, Yahoo Finance) están caídas o retornan error? → A: El sistema retorna análisis parcial con las fuentes disponibles. Cada fuente inaccesible se reporta individualmente en `sourceReports[].status = "error"` con detalle del error, sin bloquear la respuesta completa. Si todas las fuentes fallan, retorna HTTP 503 con `{"error":"all_sources_unavailable","sourceReports":[...]}`.

### Session 2026-05-19

- Q: ¿Qué nivel de trazabilidad debe registrar el módulo de IA por cada explicación? → A: Registrar trazabilidad completa por respuesta IA: `context_id`, estrategia, evidencia usada, timestamp, versión de modelo y hash de salida.
- Q: ¿Qué objetivo de latencia debe cumplir la respuesta completa (cálculo + explicación IA)? → A: p95 <= 5s; si excede, devolver estado asíncrono con polling.
- Q: ¿Qué política de acceso aplica a consulta/explicación en este módulo? → A: Solo roles `analyst` y `risk_manager` pueden consultar/explicar; ningún rol puede ejecutar órdenes desde este módulo.
- Q: ¿Qué comportamiento debe tener el sistema si falla el proveedor de IA? → A: Devolver cálculo/estrategia estructurada sin narrativa IA y marcar `ai_unavailable`.
- Q: ¿Cuál debe ser la ventana de retención para trazas y evidencias de auditoría? → A: Retener trazas y evidencias por 365 días.
- Q: ¿Qué SLO operativo define el polling asíncrono de fallback? → A: Polling cada 2s, timeout total de 30s y máximo 15 intentos.

## Identificadores de backlog (rango derivado)

- T106..T121 (ver 001-inv-tasks.md para contexto y dependencias)

## Objetivo

Entregar un componente modular que produzca análisis institucional accionable y modelos de estrategias de cobertura reproducibles, con salidas estructuradas para consumo por otros equipos y una interfaz de explicación por Chat IA.

## Alcance Funcional

- Implementar análisis de contexto institucional (RF-001).
- Exponer lectura de contexto institucional útil para evaluar coberturas (RF-002).
- Calcular y modelar estrategias Protective Put, Married Put, Collar Put, Covered Straddle (RF-003).
- Exponer endpoints de salida estructurada y contratos para consumo (RF-005).
- Integrar un módulo de explicación basado en Chat IA (RF-004) que genere narrativas y escenarios.
- Mantener trazabilidad entre contexto institucional, estrategia y evidencia operativa (RF-006).
- Soportar degradación funcional: si la IA no está disponible, devolver análisis/cálculo estructurado sin narrativa y con señal explícita de indisponibilidad.

## Alcance No Funcional

- La IA no ejecuta operaciones y no sustituye el juicio humano (RNF-001).
- Reproducibilidad y auditabilidad de cálculos (RNF-002).
- Estrategias desacopladas de broker y frontend (RNF-003).
- La salida debe ser clara, defendible y orientada a control de riesgo (RNF-004).
- No invadir otros dominios de análisis (técnico, noticias, ejecución) (RNF-005).
- Cobertura de tests mínima 80% en rutas críticas (RNF-006).
- Trazabilidad operacional de IA por respuesta: registrar `context_id`, estrategia, evidencia usada, timestamp, versión de modelo y hash de salida para auditoría y reproducción.
- Rendimiento: la respuesta completa (cálculo + explicación IA) debe cumplir p95 <= 5s; si excede, el sistema debe responder en modo asíncrono con polling cada 2s, timeout total de 30s y máximo 15 intentos.
- Seguridad de acceso: solo roles `analyst` y `risk_manager` pueden consultar o solicitar explicaciones; este módulo no expone operaciones de ejecución para ningún rol.
- Retención de auditoría: conservar trazas y evidencias operativas durante 365 días para revisión, cumplimiento y análisis post-incidente.
- Degradación por fuentes externas: si una fuente upstream (SEC EDGAR, FINRA, Yahoo Finance) falla, el sistema retorna análisis parcial con las fuentes restantes, reportando cada fuente fallida individualmente con `sourceReports[].status = "error"`. Si todas las fuentes fallan, retorna HTTP 503.

## Restricciones

- Arquitectura: se mantiene la arquitectura semi-automática constitucional (restricción constitucional).
- No modificar artefactos canónicos globales: `001-inv-spec.md`, `001-inv-plan.md` ni `001-inv-tasks.md`.
- Alcance limitado: el alcance del feature se restringe a análisis institucional y estrategias de cobertura; no incluye dominios externos.

## Entregables

- API/JSON contract para salidas de análisis y señales.
- Módulo de cálculo de estrategias con tests unitarios e integración.
- Servicio de Chat IA que consume evidencias y produce explicaciones (solo lectura/explicación).
- Documentación operativa y criterios de validación.

## Criterios de Aceptación

- Los cálculos son reproducibles con datasets de ejemplo y pruebas automatizadas.
- Las salidas cumplen el contrato JSON y pasan validadores de esquema.
- El Chat IA presenta explicaciones consistentes y trazables a la evidencia usada.
- No existen paths que permitan auto-trading; todas las recomendaciones requieren validación humana.
- El análisis produce criterios útiles y accionables para decidir coberturas y protección (Criterio de éxito).
- Cada estrategia incluye una representación clara de riesgo vs recompensa, expresada y verificable (Criterio de éxito).
- Las salidas son integrables con Speckit sin reinterpretar el canon global; cualquier reestructura debe preservar trazabilidad 1:1 (Criterio de éxito).
- Cada respuesta del Chat IA persiste los campos de trazabilidad definidos (`context_id`, estrategia, evidencia, timestamp, versión de modelo, hash de salida) y permite reconstruir la explicación en auditoría.
- En pruebas de rendimiento, el flujo completo cumple p95 <= 5s y, cuando se supera ese umbral, retorna estado asíncrono consultable por polling cada 2s con timeout total de 30s y máximo 15 intentos, sin perder trazabilidad.
- En pruebas de autorización, solo `analyst` y `risk_manager` acceden a consulta/explicación; cualquier intento de ejecución de órdenes desde este módulo debe responder `forbidden`.
- Ante falla del proveedor IA, el endpoint responde con cálculo/estrategia estructurada y flag `ai_unavailable`, sin bloquear la salida principal de cobertura.
- Las trazas y evidencias requeridas para auditoría permanecen disponibles durante 365 días y son recuperables para inspección.

## Dependencias

- Datos normalizados (ver especificación global de datos y contratos en 001-inv-spec.md).
- Contratos de persistencia y evidencias definidos por el canon global.
- Coordinación con TEAM-02/TEAM-01 para ingest y visualización.

## Riesgos y Mitigaciones

- Riesgo: Ambigüedad en parámetros de estrategia → Mitigación: definir parámetros explícitos y defaults, pruebas de sensibilidad.
- Riesgo: Fuga de responsabilidad por interpretaciones IA → Mitigación: marcar claramente salidas como informativas y requerir firma humana.
- Riesgo: Fuentes upstream no disponibles → Mitigación: degradación parcial con reporte por fuente (`sourceReports[].status`), respuesta parcial con fuentes disponibles, y 503 solo si todas fallan.

## Trazabilidad

- Fuente canónica de entrada: .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-05/spec.md
- Handoff de integración: .drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/integrations/speckit-specify-TEAM-05.md

## Notas de Implementación

- Estructura de código recomendada: `services/coverage/`, `modules/strategies/coverage/`, `api/contracts/coverage/`.
- Pruebas: incluir fixtures con escenarios institucionales y mercados extremos.

## Próximos pasos

1. Revisar spec con stakeholders de TEAM-05 y dar aprobación.
2. Ejecutar `/diana.integrate action="all" engine="speckit" team="TEAM-05" until="specify"` para que Speckit genere su artefacto `specify` formal si se desea.
