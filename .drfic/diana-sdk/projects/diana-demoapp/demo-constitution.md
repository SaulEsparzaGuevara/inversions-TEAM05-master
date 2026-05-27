# Constitucion del Proyecto
## diana-demoapp

---

## Metadatos

- Proyecto: diana-demoapp
- Alias: demo
- Version: 1.0.0
- Estado: Active
- Fecha: 2026-04-29
- Fuente primaria (UCC): .drfic/diana-sdk/projects/diana-demoapp/governance/change-requests/001-demo-ucc.md
- Plantilla base: .drfic/diana-sdk/sdk/diana/templates/constitution.md

---

## 1. Proposito

Definir principios, limites y reglas fundamentales para el proyecto diana-demoapp, orientado a analisis asistido por IA en acciones y opciones de EE.UU., con trazabilidad de decisiones y ejecucion asistida en brokers.

Esta constitucion establece que el sistema debe operar con control humano, explicabilidad tecnica y gobernanza de cambios basada en UCC.

---

## 2. Alcance del Sistema

Este proyecto MUST:
- Analizar datos de mercado en tiempo real para construir senales de oportunidad.
- Integrar analisis tecnico, fundamentales, flujo institucional, cadena de opciones y noticias.
- Priorizar oportunidades y sugerir estrategias de opciones.
- Mantener trazabilidad de senales, reglas aplicadas y decisiones.
- Permitir ejecucion asistida en adaptadores broker compatibles.

Fuera de alcance en esta version:
- Ejecucion automatica sin validacion humana previa.
- Expansion de dominio fuera del alcance definido por el UCC vigente.

---

## 3. Principios Rectores

- La especificacion y el UCC vigente MUST gobernar el alcance funcional.
- No se permiten inferencias funcionales no documentadas en artefactos canonicos.
- La IA SHOULD actuar como asistente de analisis y nunca como autoridad autonoma de ejecucion.
- Toda decision relevante MUST quedar documentada y ser auditable.
- La arquitectura SHOULD mantener integraciones desacopladas para reducir dependencia tecnica.

---

## 4. Reglas Tecnicas de Alto Nivel

- Las salidas de analisis MUST incluir evidencia tecnica suficiente para explicabilidad.
- Los componentes criticos SHOULD contar con pruebas unitarias/integracion para flujos de senales y trazabilidad.
- El sistema MUST registrar eventos operativos para auditoria y diagnostico.
- Toda implementacion MUST preservar coherencia entre UCC, constitucion, spec y plan.
- Las integraciones broker y fuentes externas MUST operar mediante adaptadores desacoplados.

(No se detallan implementaciones de bajo nivel en esta constitucion.)

---

## 5. Relacion con IA

- La IA no toma decisiones autonomas de ejecucion.
- Toda accion asistida por IA MUST ser auditable y trazable.
- Los prompts y reglas de orquestacion SHOULD tratarse como artefactos de diseno y gobernanza.

---

## 6. Evolucion de la Constitucion

Esta constitucion puede cambiar cuando:
- Cambia el proposito del proyecto.
- Se redefine el dominio funcional.
- Se aprueba explicitamente un cambio de principios de gobernanza.

Politica de versionado:
- Cambios editoriales menores: PATCH (x.y.Z).
- Ajustes de gobernanza sin ruptura de principios: MINOR (x.Y.z).
- Cambios de principios no negociables o alcance constitucional: MAJOR (X.y.z).

Regla de vigencia:
- La version activa MUST ser la de fecha mas reciente aprobada para el proyecto.

---

## 7. Trazabilidad UCC -> Constitucion

| Fuente UCC | Seccion constitucional derivada | Regla resultante |
|------------|---------------------------------|------------------|
| Objetivo del Requerimiento | 1. Proposito, 2. Alcance del Sistema | Define dominio del producto y cobertura inicial |
| Descripcion del Requerimiento (analisis tecnico, institucional, fundamentales, IA) | 2. Alcance, 3. Principios Rectores | Obliga analisis multicapa y explicabilidad |
| Descripcion del Requerimiento (ejecucion asistida en brokers) | 3. Principios, 4. Reglas Tecnicas | Exige control humano y adaptadores broker desacoplados |
| Requisito de trazabilidad y validacion de senales | 3. Principios, 5. Relacion con IA | Exige auditoria y evidencia tecnica de decisiones |
| Secciones de impactos/entregables del UCC | 4. Reglas Tecnicas, 6. Evolucion | Vincula alcance con validacion y coherencia documental |

---

## 8. Gaps Detectados y Decision

Gaps:
- El UCC fuente conserva secciones plantilladas sin contenido completo (beneficios, impactos, KPI, responsables).

Decision:
- Se adopta constitucion base version 1.0.0 con principios obligatorios suficientes para avanzar a especificacion.
- Los gaps MUST cerrarse en iteraciones siguientes de UCC y en una regeneracion posterior de la constitucion.

---

## Estado

Este documento es la Constitucion Canonica del Proyecto diana-demoapp.
