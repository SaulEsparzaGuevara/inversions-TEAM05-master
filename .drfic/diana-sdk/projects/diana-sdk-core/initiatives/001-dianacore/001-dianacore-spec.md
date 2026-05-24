# Especificación Canónica
## Dashboard de Calidad SDD

Identificador: 001-dianacore-spec
Estado: Activa
Iniciativa: 001-dianacore

## 1. Objetivo

Definir de manera clara, explícita y auditable los requisitos funcionales y no funcionales
de un **Dashboard de Calidad SDD**, cuyo propósito es medir, validar y visualizar
la calidad del uso de Spec‑Driven Development (SDD) dentro de proyectos que utilizan
DIANA‑SDK y herramientas de ejecución como Speckit.

El dashboard debe permitir identificar, **antes de la ejecución automática**,
si una iniciativa está lista para:
- `/speckit.plan`
- `/speckit.tasks`
- implementación técnica

sin depender de inferencias humanas o de agentes IA.

---

## 2. Contexto

En el uso actual de desarrollo asistido por IA, se ha identificado que:
- Las especificaciones pueden ser ambiguas
- Los planes pueden redefinir alcance sin control
- Los agentes IA pueden inferir información faltante
- Speckit puede ejecutarse sin que el canon esté maduro

Este sistema surge para **prevenir** estos problemas,
proporcionando un mecanismo formal, reproducible y auditable
de evaluación de calidad SDD.

---

## 3. Alcance

### Incluye

- Evaluación de calidad SDD por **proyecto** e **iniciativa**
- Lectura estructurada de:
  - especificaciones (spec.md)
  - planes técnicos (plan.md)
  - resultados de checklists
- Cálculo de métricas oficiales DIANA‑SDK
- Visualización de estados:
  - APROBADO
  - APROBADO CON RIESGOS
  - REQUIERE AJUSTES
  - BLOQUEADO
- Generación de reportes en formatos:
  - Markdown
  - JSON
- Integración con flujos previos y posteriores a Speckit

### Excluye

- Gestión de tickets o controles de cambio como sistema
- Modificación del canon (spec, plan, constitution)
- Análisis profundo de código fuente
- Ejecución de tareas o pipelines CI/CD

---

## 4. Requisitos Funcionales

### RF‑01 – Descubrimiento de proyectos e iniciativas

El sistema debe identificar proyectos y sus iniciativas
siguiendo la estructura DIANA‑SDK:

- `projects/<PROYECTO>/`
- `initiatives/<NNN>-<nombre>/`

Debe detectar la existencia de:
- meta.md
- spec.md
- plan.md
- carpetas de derivados (speckit/, tasks/, quality/)

---

### RF‑02 – Ingesta de resultados de checklists

El sistema debe ingerir resultados de los checklists oficiales DIANA‑SDK, incluyendo:

- SDD Quality Gate
- Checklist de calidad de SPEC
- Checklist de calidad de PLAN
- Checklist de calidad de TASKS
- Checklist de auditoría de iniciativa

Los resultados pueden provenir de:
- Un archivo dedicado `checklist-results.md`
- Secciones de resultado dentro de otros documentos

---

### RF‑03 – Cálculo de métricas SDD

El sistema debe calcular métricas de calidad basadas en reglas explícitas, incluyendo:

- Completitud del canon
- Índice de ambigüedad
- Riesgo de inferencia
- Trazabilidad origen → canon
- Trazabilidad canon → ejecución
- Determinismo de ejecución
- Dependencia de intervención humana

Cada métrica debe producir un puntaje normalizado (0–100).

---

### RF‑04 – Estado de calidad por iniciativa

Para cada iniciativa, el sistema debe determinar un estado global:

- APROBADO
- APROBADO CON RIESGOS
- REQUIERE AJUSTES
- BLOQUEADO

Este estado debe derivarse de reglas explícitas
y no de interpretación subjetiva.

---

### RF‑05 – Decisión de gates para Speckit

El sistema debe generar una decisión explícita indicando si una iniciativa:

- Puede ejecutar `/speckit.plan`
- Puede ejecutar `/speckit.tasks`
- Puede pasar a implementación

Esta decisión debe ser exportable en formato legible por humanos y máquinas.

---

### RF‑06 – Visualización por proyecto

El dashboard debe permitir visualizar por proyecto:

- Lista de iniciativas
- Estado de calidad por iniciativa
- Número de iniciativas bloqueadas
- Principales causas de bloqueo
- Tendencia de calidad SDD en el tiempo

---

### RF‑07 – Visualización por iniciativa

Para una iniciativa específica, el dashboard debe mostrar:

- Estado de cada checklist
- Métricas calculadas
- Blockers y warnings
- Evidencias utilizadas para el cálculo
- Relación con artefactos generados por Speckit

---

### RF‑08 – Reportes y exportación

El sistema debe generar reportes exportables en:

- Markdown (para auditoría y revisión humana)
- JSON (para automatización, CI y agentes IA)

---

## 5. Requisitos No Funcionales

### RNF‑01 – No contaminación del canon

El sistema **NO debe modificar**:
- spec.md
- plan.md
- constitution

Toda salida debe ubicarse en carpetas de derivados (`quality/`).

---

### RNF‑02 – Reproducibilidad

Ejecutar el análisis múltiples veces con los mismos insumos
debe producir resultados idénticos.

---

### RNF‑03 – Auditabilidad

Cada métrica, estado o bloqueo debe:
- Explicar su causa
- Referenciar la regla o checklist que lo originó

---

### RNF‑04 – Portabilidad

El sistema debe poder ejecutarse:
- En entorno local
- En pipelines CI
- Sin dependencia de interfaces gráficas

---

### RNF‑05 – Idioma

Los reportes y visualizaciones deben estar en español,
permitiendo términos técnicos en inglés cuando sea necesario.

---

## 6. Arquitectura Funcional (alto nivel)

El sistema se compone de:

- Scanner de estructura DIANA‑SDK
- Parser de checklists
- Motor de métricas
- Generador de reportes
- (Opcional) API y UI

No se define implementación técnica en esta especificación.

---

## 7. Modelo Conceptual de Datos

El sistema debe manejar entidades conceptuales como:

- Proyecto
- Iniciativa
- Resultado de checklist
- Métrica SDD
- Decisión de gate

El modelo debe permitir snapshots históricos por iniciativa.

---

## 8. Casos de Uso

### CU‑01 – Evaluar iniciativa antes de Speckit

Como líder técnico,
quiero saber si una iniciativa está lista para ejecutar Speckit,
para evitar ejecuciones con alto riesgo de inferencia.

---

### CU‑02 – Identificar causas de bloqueo

Como desarrollador,
quiero saber exactamente qué reglas o checklists bloquean una iniciativa,
para corregirlas sin ambigüedad.

---

### CU‑03 – Auditoría SDD

Como auditor o arquitecto,
quiero evidencias claras de trazabilidad y calidad SDD,
para validar cumplimiento metodológico.

---

## 9. Criterios de Aceptación

- El sistema identifica correctamente proyectos e iniciativas.
- El sistema detecta y calcula métricas sin inferencias.
- El estado global de una iniciativa es consistente con los checklists.
- Ningún archivo canónico es modificado.
- Los reportes son reproducibles.
- Las decisiones de gate son explícitas y exportables.

---

## 10. Fuera de Alcance

Quedan explícitamente fuera de esta especificación:

- Implementación de UI específica
- Integración directa con repositorios externos
- Gestión de usuarios
- Autorización o autenticación avanzada
- Análisis semántico profundo del código

---

## 11. Estado de la Especificación

Esta especificación define el **canon funcional inicial**
del Dashboard de Calidad SDD y es apta para:

- Revisión humana
- Proceso de clarify
- Planificación con Speckit
``