# File: sdk/diana/checklists/plan-quality-checklist.md
# DIANA‑SDK by DRFIC
## Checklist Automático de Calidad de PLAN (BULMA + VEGETA)

Propósito:
Validar que plan.md implementa spec.md sin redefinirla y está listo para /speckit.plan o para generar tareas.

---

## 1. Alineación plan → spec (BLOCKER)

[ ] El plan referencia explícitamente la spec de la iniciativa (o asume spec.md como canon)  
[ ] Cada fase del plan se puede trazar a una parte de la spec (sin inventar funcionalidades)  
[ ] No hay entregables que contradigan requisitos/limitaciones de la spec  
[ ] Si el plan detecta huecos en la spec, los marca como riesgos o pendientes (no los completa)

---

## 2. Estructura ejecutable (BLOCKER)

[ ] El plan está dividido en fases o hitos  
[ ] Cada fase tiene objetivo y entregables verificables  
[ ] Hay orden lógico y dependencias implícitas razonables (por ejemplo: auth antes de permisos)  
[ ] El plan incluye estrategia de validación (cómo comprobar que se cumplió)

---

## 3. IA: control y seguridad (WARN → BLOCKER si aplica por política)

[ ] Se define el rol de la IA (asistente, analítico, copiloto)  
[ ] Se declaran límites (no decisiones autónomas, supervisión)  
[ ] Se contempla trazabilidad/auditoría de prompts/respuestas si aplica  
[ ] Se considera control de costos (tokens, cache, RAG) si aplica

---

## 4. No reescribir el canon (BLOCKER)

[ ] El plan no redefine alcance funcional  
[ ] No agrega nuevos escenarios de usuario si no existen en la spec  
[ ] Si el plan requiere nuevos requisitos, se propone una nueva iniciativa/spec derivada (no se “cuelan”)

---

## 5. Listo para tareas (WARN)

[ ] El plan tiene granularidad suficiente para dividirse en tareas atómicas  
[ ] Existen “puntos de verificación” por fase  
[ ] Riesgos y mitigaciones están listados

---

## Resultado

- Estado:
  - [ ] PLAN APROBADO para /speckit.plan
  - [ ] PLAN APROBADO para /speckit.tasks
  - [ ] PLAN REQUIERE AJUSTES

Notas:
- Ajustes requeridos:
- Riesgos abiertos:
``