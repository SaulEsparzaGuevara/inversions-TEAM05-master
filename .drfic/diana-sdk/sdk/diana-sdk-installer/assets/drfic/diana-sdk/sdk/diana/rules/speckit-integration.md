# DIANA‑SDK by DRFIC
## Integración Oficial DIANA‑SDK ↔ Speckit

---

## 1. Propósito

Este documento define la integración formal entre **DIANA‑SDK by DRFIC**
y el framework de ejecución **Speckit (Spec‑Driven Development Toolkit)**.

Su objetivo es:
- Establecer límites claros de responsabilidad
- Evitar inferencias automáticas no autorizadas
- Garantizar trazabilidad y control del canon
- Permitir ejecución confiable con agentes IA

Esta integración es **obligatoria** para todo proyecto DIANA‑SDK que utilice Speckit.

---

## 2. Principio Rector de Integración

> **DIANA‑SDK gobierna.  
> Speckit ejecuta.  
> El canon no se infiere.**

Speckit **no es un framework de decisión**,  
es un **motor de ejecución SDD** que opera bajo reglas explícitas.

---

## 3. Roles en la Integración

### 3.1 Rol de DIANA‑SDK

DIANA‑SDK es responsable de:
- Definir la metodología
- Establecer el canon
- Determinar el ciclo de vida
- Definir agentes IA y sus límites
- Declarar idioma, nomenclatura y reglas

DIANA‑SDK **nunca ejecuta código**.

---

### 3.2 Rol de Speckit

Speckit es responsable de:
- Leer artefactos canónicos
- Generar artefactos derivados
- Planificar tareas
- Ejecutar flujos SDD

Speckit **nunca decide alcance, arquitectura o requisitos por sí mismo**.

---

## 4. Nivel de Operación Permitido para Speckit

Speckit **SOLO puede operar a nivel de INICIATIVA**.

Estructura mínima esperada:

projects//initiatives//
├── meta.md
├── constitution.md (si aplica)
├── spec.md
├── plan.md
└── speckit/


Speckit:
- ✅ Lee `spec.md` y `plan.md`
- ✅ Genera artefactos dentro de `speckit/`
- ❌ NO modifica `constitution.md`
- ❌ NO interpreta `meta.md`
- ❌ NO opera fuera de la iniciativa

---

## 5. Artefactos que Speckit PUEDE Generar

Dentro del folder `speckit/`, Speckit puede generar:

- plan.md (derivado)
- research.md
- data-model.md
- contratos técnicos
- quickstart.md
- tasks.md

Estos artefactos:
- Son **derivados**
- No son canónicos
- Pueden regenerarse
- No tienen autoridad sobre el canon

---

## 6. Artefactos que Speckit NO PUEDE Crear ni Modificar

Speckit **NO PUEDE**:

- Crear o modificar constituciones
- Crear especificaciones funcionales nuevas
- Inferir requisitos ausentes
- Interpretar tickets o controles de cambio
- Cambiar idioma declarado
- Decidir arquitectura sin plan explícito

---

## 7. Relación con el Canon

### 7.1 Canon Funcional

- `spec.md` es la autoridad funcional
- Speckit debe cumplirla estrictamente
- Si hay ambigüedad, Speckit **se detiene**

---

### 7.2 Canon Técnico

- `plan.md` define cómo implementar
- Speckit puede estructurar, no redefinir
- Cambios al plan requieren aprobación humana

---

## 8. Relación con Agentes DIANA‑SDK

Los agentes DIANA‑SDK **gobiernan el comportamiento** de Speckit.

Flujo recomendado:

1. **PICCOLO** define o valida `spec.md`
2. **BULMA** define o valida `plan.md`
3. **VEGETA** revisa coherencia del canon
4. **Speckit** ejecuta planificación (`/speckit.plan`)
5. **KRILIN** genera tareas (`/speckit.tasks`)
6. **GOHAN** valida cumplimiento
7. **GOKU** asiste a humanos

Speckit **no sustituye agentes**, los ejecuta indirectamente.

---

## 9. Idioma en la Integración

- Speckit adopta el idioma del canon
- DIANA‑SDK define el idioma oficial
- Mezcla de idiomas sin autorización es una violación metodológica

---

## 10. Manejo de Errores e Inferencias

Si Speckit detecta:
- Ambigüedad
- Información incompleta
- Conflicto entre artefactos

Debe:
- Detener ejecución
- Reportar el problema
- Solicitar intervención humana o del agente correspondiente

---

## 11. Versionado y Regeneración

- Los artefactos Speckit son regenerables
- El canon NO se sobrescribe automáticamente
- Regenerar no implica aprobar

La aprobación del canon es siempre humana.

---

## 12. Regla Final de Integración

DIANA‑SDK define las reglas.  
DIANA‑SDK define la verdad.  
Speckit ejecuta exactamente eso, y nada más.

---

## 13. Estado

Este documento define la **integración oficial y vinculante**
entre DIANA‑SDK by DRFIC y Speckit.

---

``