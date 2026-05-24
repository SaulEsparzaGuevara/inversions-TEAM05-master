# File: sdk/diana/checklists/initiative-audit-checklist.md
# DIANA‑SDK by DRFIC
## Checklist Automático de Auditoría de Iniciativa (VEGETA + GOKU)

Propósito:
Asegurar que una iniciativa es auditable y que el flujo negocio→canon→ejecución está íntegro.

---

## 1. Origen (WARN → BLOCKER en entornos regulados)

[ ] meta.md incluye origen organizacional (ticket, CR o decisión estratégica)  
[ ] meta.md declara tipo de iniciativa: greenfield / brownfield / bugfix  
[ ] meta.md aclara que es informativo y no ejecutable

---

## 2. Canon limpio (BLOCKER)

[ ] spec.md no contiene referencias a tickets como requisitos  
[ ] plan.md no contiene “mandatos” de negocio no presentes en la spec  
[ ] Speckit artifacts están separados y no contaminan el canon

---

## 3. Versionado (WARN)

[ ] La iniciativa indica si reemplaza una spec previa (cuando aplica)  
[ ] Si hay reemplazo, se declara “reemplaza SPEC-xxx” en la spec o en meta

---

## 4. Reproducibilidad (WARN)

[ ] Se puede regenerar speckit/ sin cambiar el canon  
[ ] No hay dependencia de “memoria de chat” para entender decisiones críticas

---

## Resultado

- Estado:
  - [ ] AUDITORÍA OK
  - [ ] AUDITORÍA CON RIESGOS
  - [ ] AUDITORÍA BLOQUEADA

Notas:
- Riesgos:
- Acciones sugeridas:
``