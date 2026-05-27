# Plan Quality Checklist: Plataforma de Inversiones con IA

**Purpose**: Validar la calidad del plan como especificacion ejecutable en ingles tecnico (completitud, claridad, consistencia, cobertura y trazabilidad) tras cambios manuales de estructura.
**Created**: 2026-04-30
**Feature**: [spec.md](../spec.md), [plan.md](../plan.md)

**Note**: Checklist generada por `/speckit.checklist` enfocada en calidad de requisitos (no en pruebas de implementacion).

## Requirement Completeness

- [x] CHK001 Estan definidos los entregables obligatorios del plan para cada area funcional critica (senales, aprobacion humana, ejecucion asistida, auditoria)? [Completeness, Plan §Resumen, Spec §FR-001, Spec §FR-004, Spec §FR-008, Spec §FR-011] | Estado: OK | Evidencia: El resumen cubre las capacidades nucleares y sus restricciones operativas. | Accion sugerida: Mantener una tabla de entregables por capacidad para facilitar seguimiento.
- [x] CHK002 Estan documentados requisitos de plan para traducir cada restriccion constitucional a actividades verificables? [Completeness, Plan §Constitution Check, Spec §FR-005, Spec §FR-009, Spec §FR-010] | Estado: OK | Evidencia: Se agrego la seccion "Matriz Restriccion -> Actividad -> Evidencia" con mapeo directo a FR criticos. | Accion sugerida: Mantener la matriz actualizada ante cada cambio de alcance.
- [x] CHK003 Estan explicitadas dependencias externas y sus supuestos operativos minimos para brokers y proveedores de datos? [Dependency, Spec §Assumptions, Spec §FR-008, Gap] | Estado: OK | Evidencia: Se agrego la seccion "Dependencias Externas y SLO Minimos" con disponibilidad, timeouts, reintentos y modo degradado. | Accion sugerida: Versionar SLO por proveedor en cada release.

## Requirement Clarity

- [x] CHK004 Estan definidos con precision los limites entre "store operacional primario" y "store opcional historico" para evitar ambiguedad de responsabilidad de datos? [Clarity, Plan §Contexto Tecnico, Spec §FR-006, Spec §FR-007] | Estado: OK | Evidencia: Se agrego la seccion "Particion de Datos y Responsabilidad de Stores" por tipo de dato y retencion. | Accion sugerida: Revisar la particion al incorporar nuevos dominios de datos.
- [x] CHK005 Son inequivocos los terminos de la estructura de proyecto para distinguir artefactos de producto vs artefactos de gobierno/documentacion? [Clarity, Plan §Project Structure, Ambiguity] | Estado: OK | Evidencia: Se agregaron "Ownership y Proposito por Raiz" y criterios de conformidad estructural. | Accion sugerida: Usar estos criterios como gate de PR de reorganizacion.
- [x] CHK006 Estan cuantificados en el plan los criterios de aceptacion operativos para "cooldown definido" y politicas de rate limiting? [Clarity, Spec §FR-015, Gap] | Estado: OK | Evidencia: Se agrego "Politica de Rate Limiting Operacional" con ventana, umbral, cooldown y payload 429. | Accion sugerida: Ajustar umbrales con telemetria real de produccion.

## Requirement Consistency

- [x] CHK007 Son consistentes los requisitos de seguridad entre autenticacion JWT, autorizacion RBAC y MFA en los documentos de spec y plan? [Consistency, Spec §FR-012, Spec §FR-017, Spec §FR-019, Plan §Constraints] | Estado: OK | Evidencia: El plan replica los tres controles como restricciones explicitas sin contradicciones visibles. | Accion sugerida: Mantener referencia cruzada de estos tres controles en contratos.
- [x] CHK008 Es consistente el alcance funcional v1 en brokers y tipos de orden entre definicion de spec y supuestos del plan? [Consistency, Spec §FR-008, Spec §FR-014, Plan §Contexto Tecnico] | Estado: OK | Evidencia: Ambos artefactos fijan IBKR/Alpaca y Market/Limit como alcance obligatorio. | Accion sugerida: Preservar este alcance como criterio de control de cambios.
- [x] CHK009 Son consistentes los objetivos de recuperacion (RTO/RPO) entre restricciones, criterios de exito y orientacion de implementacion? [Consistency, Spec §FR-018, Spec §SC-007, Plan §Performance Goals] | Estado: OK | Evidencia: Se reflejan los mismos umbrales en spec y plan. | Accion sugerida: Vincular estos objetivos con una seccion de evidencia operacional esperada.

## Acceptance Criteria Quality

- [x] CHK010 Puede medirse objetivamente la trazabilidad completa exigida para historial y auditoria en todos los flujos criticos? [Measurability, Spec §SC-003, Spec §FR-006, Spec §FR-011] | Estado: OK | Evidencia: Se agrego "Trazabilidad Operativa Completa (campos minimos)" con campos obligatorios por evento. | Accion sugerida: Mantener este contrato alineado con data model y contratos API.
- [x] CHK011 Estan mapeados los criterios de exito a responsabilidades de plan por componente para evitar criterios huerfanos? [Traceability, Spec §Success Criteria, Plan §Resumen, Gap] | Estado: OK | Evidencia: Se agrego "Matriz de Trazabilidad SC -> Componente Responsable" para SC-001 a SC-008. | Accion sugerida: Incorporar owner nominal por componente en la siguiente iteracion.
- [x] CHK012 Estan definidos umbrales de aceptacion para estructura de proyecto que permitan evaluar si cambios manuales preservan la arquitectura objetivo? [Acceptance Criteria, Plan §Project Structure, Gap] | Estado: OK | Evidencia: Se agrego "Criterios de Conformidad Estructural (No-regresion)" con condiciones minimas. | Accion sugerida: Ejecutar revision estructural en cada cambio de layout del repo.

## Scenario And Edge Case Coverage

- [x] CHK013 Estan cubiertos en requisitos de plan los escenarios alternos cuando falla la ejecucion asistida y se requiere nueva aprobacion humana? [Coverage, Exception Flow, Spec §FR-009, Spec §Edge Cases] | Estado: OK | Evidencia: El flujo fail-fast y nueva aprobacion esta descrito como restriccion central. | Accion sugerida: Conservar un estado intermedio estandarizado para reintento autorizado.
- [x] CHK014 Estan cubiertos los escenarios de concurrencia y version obsoleta con reglas de resolucion no ambiguas? [Coverage, Spec §FR-016, Spec §Edge Cases] | Estado: OK | Evidencia: Se agrego "Concurrencia y Resolucion Deterministica" con `409 CONFLICT` y `ORDER_VERSION_STALE`. | Accion sugerida: Sincronizar codigos de error con contrato de API.
- [x] CHK015 Estan especificados los requisitos de recuperacion para escenarios de caida parcial de dependencias externas (broker/data/IA)? [Coverage, Recovery, Spec §FR-018, Assumption] | Estado: OK | Evidencia: Se agrego "Recuperacion y Modos Degradados por Dependencia" para broker, data e IA. | Accion sugerida: Vincular runbooks operativos a esta seccion.

## Non-Functional Requirements

- [x] CHK016 Estan definidos requisitos de frescura de datos y observabilidad con criterios verificables por instrumento y ventana temporal? [Non-Functional, Spec §SC-006, Plan §Performance Goals] | Estado: OK | Evidencia: Se agrego "Observabilidad y Frescura de Datos" con formula, segmentacion, agregacion y alertas. | Accion sugerida: Alinear nombres de metricas con estandar de monitoreo.
- [x] CHK017 Estan documentados requisitos de cumplimiento para disclaimer no-asesoria en todos los puntos de decision y ejecucion? [Non-Functional, Compliance, Spec §FR-013, Gap] | Estado: OK | Evidencia: Se agrego "Superficies Obligatorias para Disclaimer No-Asesoria" en UI y endpoints backend. | Accion sugerida: Verificar que todos los eventos de aceptacion queden auditados.

## Ambiguities And Conflicts

- [x] CHK018 Esta establecido un esquema de identificadores para requisitos del plan (ademas de FR/SC del spec) que permita trazabilidad bidireccional sin perdida? [Traceability, Gap] | Estado: OK | Evidencia: Se agrego la seccion "Plan Requirement IDs (PL)" con 12 requisitos PL-001..PL-012 enlazables a FR/SC. | Accion sugerida: Referenciar IDs PL en tasks cuando se genere descomposicion.

## Notes

- Marcar cada item como `[x]` cuando quede resuelto en los artefactos fuente.
- Estado inicial `OK/Pendiente` refleja una lectura documental preliminar y debe confirmarse en revision formal.

## Ownership Checklist (PL-004)

- [x] OWN001 Existe ownership explicito para `frontend/` (equipo frontend) en artefactos de plan.
- [x] OWN002 Existe ownership explicito para `backend/` (equipo backend) en artefactos de plan.
- [x] OWN003 Existe ownership explicito para `specs/` (producto + arquitectura) en artefactos de plan.
- [x] OWN004 Existe ownership explicito para `.drfic/` (arquitectura/gobernanza) en artefactos de plan.
- [x] OWN005 Se mantiene separacion entre codigo de producto y artefactos de gobierno/documentacion.
