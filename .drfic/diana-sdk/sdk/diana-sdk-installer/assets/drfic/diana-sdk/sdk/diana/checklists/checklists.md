# DIANA‑SDK by DRFIC
## Reglas Oficiales de Ejecución de Checklists (Quality Gates SDD)

---

## 1. Propósito

Este documento define **cuándo, cómo y por quién** se ejecutan los checklists
automáticos de calidad SDD en DIANA‑SDK by DRFIC.

Su objetivo es:
- Convertir métricas SDD en **gates operativos**
- Evitar ejecución prematura de Speckit
- Detectar ambigüedad antes de que llegue al código
- Garantizar trazabilidad, claridad y control del canon
- Estandarizar validaciones para humanos y agentes IA

Estas reglas son **obligatorias** para todos los proyectos DIANA‑SDK.

---

## 2. Principio Rector

> **Ninguna iniciativa se ejecuta sin pasar por checklists.**  
> **Los checklists son preventivos, no post‑mortem.**  
> **Si un gate falla, la ejecución se detiene.**

Los checklists protegen el canon y reducen inferencias de IA.

---

## 3. Tipos de Checklists Oficiales

DIANA‑SDK define los siguientes checklists oficiales:

- SDD Quality Gate (entrada general)
- Checklist de Calidad de SPEC
- Checklist de Calidad de PLAN
- Checklist de Calidad de TASKS
- Checklist de Auditoría de Iniciativa

Cada checklist tiene un **momento específico** de ejecución.

---

## 4. Momentos del Lifecycle donde se Ejecutan

### 4.1 Antes de cualquier ejecución SDD

Checklists obligatorios:
- sdd-quality-gate.md
- initiative-audit-checklist.md

Objetivo:
- Validar estructura
- Validar idioma
- Validar autoridad del canon
- Confirmar que Speckit puede operar sin inferencias

Resultado:
- Si hay BLOCKERS → ejecución detenida

---

### 4.2 Antes de `/speckit.plan`

Checklists obligatorios:
- spec-quality-checklist.md
- sdd-quality-gate.md

Objetivo:
- Confirmar que spec.md es clara, completa y no ambigua
- Evitar que el plan “invente” requisitos

Resultado:
- Solo SPEC APROBADA permite `/speckit.plan`

---

### 4.3 Antes de `/speckit.tasks`

Checklists obligatorios:
- plan-quality-checklist.md
- sdd-quality-gate.md

Objetivo:
- Confirmar que el plan implementa la spec sin redefinirla
- Confirmar que el plan es descomponible en tareas

Resultado:
- PLAN APROBADO permite `/speckit.tasks`

---

### 4.4 Antes de implementación / ejecución de tareas

Checklists obligatorios:
- tasks-quality-checklist.md

Objetivo:
- Confirmar atomicidad y trazabilidad de tareas
- Evitar ejecución caótica o fuera de canon

Resultado:
- TASKS APROBADAS permiten implementación

---

### 4.5 Antes de cierre o auditoría de iniciativa

Checklists obligatorios:
- initiative-audit-checklist.md

Objetivo:
- Confirmar trazabilidad completa
- Confirmar versionado correcto
- Confirmar reproducibilidad

Resultado:
- Iniciativa auditable y cerrable

---

## 5. Responsables por Checklist (Agentes IA)

La ejecución de checklists se asigna a agentes específicos:

- VEGETA  
  Responsable principal de:
  - sdd-quality-gate.md
  - initiative-audit-checklist.md  
  Rol: guardián del rigor y la coherencia

- PICCOLO  
  Responsable principal de:
  - spec-quality-checklist.md  
  Rol: guardián del canon funcional

- BULMA  
  Responsable principal de:
  - plan-quality-checklist.md  
  Rol: guardián del diseño técnico

- KRILIN  
  Responsable principal de:
  - tasks-quality-checklist.md  
  Rol: ejecución disciplinada

- GOHAN  
  Responsable de validación final y cumplimiento

- GOKU  
  Copiloto para reportes, resúmenes y visibilidad

---

## 6. Estados de Resultado Permitidos

Cada checklist puede emitir únicamente uno de estos estados:

- APROBADO  
- APROBADO CON RIESGOS  
- REQUIERE AJUSTES  
- BLOQUEADO

Reglas:
- Cualquier estado BLOQUEADO detiene el flujo
- APROBADO CON RIESGOS requiere registro explícito
- REQUIERE AJUSTES debe resolverse antes de continuar

---

## 7. Relación con Speckit

Reglas obligatorias:

- Speckit NO ejecuta checklists
- Speckit asume que los checklists ya fueron aprobados
- Si un checklist falla, Speckit NO debe ejecutarse
- Los checklists gobiernan el “si se ejecuta”
- Speckit gobierna el “cómo se ejecuta”

---

## 8. Registro de Resultados

Los resultados de cada checklist deben:
- Quedar registrados en la iniciativa
- Ser visibles para auditoría
- No sobrescribir el canon

Formato recomendado:
- Sección “Resultado de Checklists” en initiative-readme.md
- O archivo dedicado `checklist-results.md`

---

## 9. Automatización Progresiva

Inicialmente:
- Los checklists pueden ejecutarse manualmente o con agentes IA

Evolución recomendada:
- Conversión a validadores automáticos
- Integración con CI
- Bloqueo automático de flujos Speckit
- Dashboards de calidad SDD

La automatización **no reemplaza el criterio humano**.

---

## 10. Regla Final

Si una iniciativa no pasa los checklists,  
no está lista para ser ejecutada.

El canon se valida primero.  
La ejecución viene después.

---

## 11. Estado

Este documento define las **Reglas Oficiales de Ejecución de Checklists**
en DIANA‑SDK by DRFIC y es vinculante para todos los proyectos.

---
``