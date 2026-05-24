# File: sdk/diana/checklists/spec-quality-checklist.md
# DIANA‑SDK by DRFIC
## Checklist Automático de Calidad de SPEC (PICCOLO + VEGETA)

Propósito:
Validar que spec.md cumple el estándar DIANA‑SDK antes de planificar o implementar.

---

## 1. Estructura mínima (BLOCKER)

[ ] La spec tiene objetivo claro en 1–3 párrafos  
[ ] La spec define alcance (incluye/excluye) explícitamente  
[ ] La spec define requisitos funcionales (lista numerada o identificadores RF-xx)  
[ ] La spec define requisitos no funcionales relevantes (RNF-xx) o declara explícitamente “no definidos aún”  
[ ] La spec declara fuera de alcance  
[ ] La spec incluye criterios de aceptación (CA-xx)

---

## 2. Claridad y no-ambigüedad (BLOCKER)

[ ] Cada requisito funcional es verificable (se puede comprobar con pruebas o validación)  
[ ] No hay lenguaje subjetivo sin medición  
[ ] No hay contradicciones internas (una sección no niega otra)  
[ ] No hay requisitos duplicados con distinto wording que sugiera conflicto  
[ ] No hay “saltos” lógicos (dependencias no explicadas)

---

## 3. No mezclar “qué” con “cómo” (BLOCKER)

[ ] No se dictan frameworks, carpetas, clases o librerías como si fueran requisito funcional (a menos que sea una restricción explícita)  
[ ] No hay diseño de base de datos en detalle de implementación (DDL/índices/migraciones)  
[ ] No se describen endpoints específicos si no son parte del “qué” acordado

---

## 4. Riesgo de inferencia (BLOCKER)

[ ] No hay huecos críticos (por ejemplo: “IA recomienda inversiones” sin decir con qué límites o supervisión)  
[ ] No hay supuestos ocultos (por ejemplo: “usuario autenticado” sin definir si existe auth)  
[ ] Si algo falta, está señalado como “pendiente” y NO se completa por inferencia

---

## 5. Alineación con constitución (BLOCKER)

[ ] La spec respeta principios y límites de constitution.md del proyecto  
[ ] No contradice reglas de IA (no decisiones autónomas, auditabilidad, etc.)  
[ ] Si hay cambios filosóficos, se elevan a constitución (no se parchean en spec)

---

## Resultado

- Estado:
  - [ ] SPEC APROBADA
  - [ ] SPEC REQUIERE CLARIFY
  - [ ] SPEC BLOQUEADA

Notas:
- Hallazgos críticos:
- Hallazgos menores:
``