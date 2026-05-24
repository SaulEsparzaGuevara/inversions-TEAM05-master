# File: sdk/diana/checklists/tasks-quality-checklist.md
# DIANA‑SDK by DRFIC
## Checklist Automático de Calidad de TASKS (KRILIN + GOHAN)

Propósito:
Validar que las tareas son ejecutables, atómicas y trazables al plan y a la spec.

---

## 1. Trazabilidad (BLOCKER)

[ ] Cada tarea referencia fase/hito del plan (explícita o por sección)  
[ ] No hay tareas que introduzcan funcionalidades fuera de la spec  
[ ] No hay tareas duplicadas o conflictivas

---

## 2. Atomicidad (BLOCKER)

[ ] Cada tarea tiene un resultado verificable  
[ ] Cada tarea es lo suficientemente pequeña para completarse sin redefinir diseño  
[ ] Las tareas no agrupan demasiadas responsabilidades (“hacer todo el backend”)

---

## 3. Orden y dependencias (BLOCKER)

[ ] Dependencias técnicas están en orden lógico  
[ ] Prerrequisitos (entornos, scaffolding, auth, data) se ejecutan antes de features  
[ ] No hay tareas que dependan de algo no definido

---

## 4. Validación incluida (WARN → recomendado)

[ ] Tareas incluyen pasos de verificación (tests, lint, builds, validaciones)  
[ ] Hay al menos un checkpoint por fase

---

## Resultado

- Estado:
  - [ ] TASKS APROBADAS
  - [ ] TASKS REQUIEREN REFINO
  - [ ] TASKS BLOQUEADAS

Notas:
- Bloqueos:
- Observaciones:
``