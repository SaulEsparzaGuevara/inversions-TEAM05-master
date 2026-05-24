# File: sdk/diana/checklists/sdd-quality-gate.md
# DIANA‑SDK by DRFIC
## SDD Quality Gate (Checklist Automático de Entrada)

Propósito:
Este checklist determina si una iniciativa está lista para:
- /speckit.plan
- /speckit.tasks
- implementación

Instrucciones:
- Marca cada ítem como [x] si cumple, o deja [ ] si no cumple.
- Si existe cualquier bloqueo (BLOCKER), NO se ejecuta Speckit.
- Si hay warnings (WARN), se puede ejecutar pero debe registrarse el riesgo.

---

## A. Identidad y Estructura (BLOCKER)

[ ] Existe folder de iniciativa con nombre válido: NNN-descripcion-corta  
[ ] Existe meta.md dentro de la iniciativa  
[ ] Existe spec.md dentro de la iniciativa  
[ ] Existe plan.md dentro de la iniciativa (puede ser borrador si aún no se ejecuta plan oficial)  
[ ] Si es proyecto nuevo: existe constitution.md del proyecto o constitution.md en la iniciativa fundacional  
[ ] Los artefactos generados (si existen) están dentro de speckit/ y no mezclados con el canon

---

## B. Idioma (BLOCKER)

[ ] spec.md está redactado principalmente en español  
[ ] plan.md está redactado principalmente en español  
[ ] Si hay términos en inglés, son técnicos (nombres propios, estándares, identificadores) y no texto general  
[ ] No hay mezcla caótica de idiomas dentro del mismo párrafo o sección

---

## C. Canon y Autoridad (BLOCKER)

[ ] spec.md define el “qué” y NO incluye implementación  
[ ] plan.md define el “cómo” y NO redefine alcance funcional  
[ ] meta.md contiene tickets/CR como trazabilidad, pero NO los convierte en requisitos  
[ ] Si hay conflicto entre documentos, está resuelto a favor de: constitución > spec > plan > derivados

---

## D. Ambigüedad e Inferencia (BLOCKER)

[ ] No hay requisitos vagos tipo “rápido”, “intuitivo”, “flexible” sin métrica o criterio verificable  
[ ] No hay decisiones críticas “implícitas” (si no está escrito, no existe)  
[ ] No se requiere “adivinar” arquitectura o reglas de negocio para comprender la spec

---

## E. Criterios Medibles (WARN → BLOCKER si faltan totalmente)

[ ] La spec incluye criterios de aceptación verificables  
[ ] Los criterios permiten validar cumplimiento sin depender de interpretación humana  
[ ] Los RNF relevantes (seguridad/auditoría/performance) están explícitos o declarados como fuera de alcance

---

## Resultado

- Estado:
  - [ ] APROBADO para /speckit.plan
  - [ ] APROBADO para /speckit.tasks
  - [ ] BLOQUEADO (corregir blockers)

Observaciones:
- BLOCKERS:
- WARNINGS:
``