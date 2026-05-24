# DIANA‑SDK by DRFIC
## Reglas Oficiales de Ciclo de Vida (Lifecycle)

---

## 1. Propósito

Este documento define las reglas oficiales de ciclo de vida de los artefactos
en DIANA‑SDK by DRFIC.

Su objetivo es:
- Evitar ambigüedad sobre cuándo crear o no crear documentos
- Distinguir proyectos nuevos, evolución y mantenimiento
- Proteger el canon de contaminación por tickets o cambios operativos
- Dar certeza a humanos y agentes IA sobre qué ejecutar

Estas reglas son obligatorias para todos los proyectos que adopten DIANA‑SDK.

---

## 2. Principio Rector del Ciclo de Vida

> **No todo cambio genera una especificación.**  
> **No toda especificación genera una constitución.**  
> **Todo lo que se ejecuta debe tener canon explícito.**

El ciclo de vida privilegia estabilidad del canon sobre velocidad improvisada.

---

## 3. Eventos de Origen (Qué detona trabajo)

En DIANA‑SDK existen únicamente tres eventos de origen válidos:

1. Control de cambios (Change Request)
2. Ticket de usuario
3. Decisión estratégica explícita

Estos eventos:
- Pertenecen a la dimensión organizacional
- No son ejecutables
- No definen por sí mismos artefactos SDD

---

## 4. Tipos de Iniciativa

Toda iniciativa pertenece exactamente a uno de los siguientes tipos:

- Proyecto nuevo (Greenfield)
- Evolución o mejora funcional (Brownfield)
- Corrección de errores (Bugfix)

El tipo de iniciativa **determina qué artefactos nacen**.

---

## 5. Proyecto Nuevo (Greenfield)

### 5.1 Condiciones

Una iniciativa es considerada proyecto nuevo cuando:
- No existe sistema previo
- No existe canon funcional
- Se requiere definir visión, límites y principios

---

### 5.2 Artefactos que NACEN

Obligatorios:
- constitution.md (constitución del proyecto)
- spec.md (SPEC‑001 canónica)
- plan.md (plan técnico inicial)

Opcionales:
- Artefactos de investigación
- Prototipos conceptuales

---

### 5.3 Artefactos que NO NACEN

- No existen iniciativas previas
- No existen specs derivadas
- No existen tareas históricas

---

### 5.4 Convención recomendada

La iniciativa fundacional debe nombrarse:

001-foundation


---

## 6. Evolución o Mejora Funcional (Brownfield)

### 6.1 Condiciones

Una iniciativa es evolución funcional cuando:
- El sistema ya existe
- Se solicita nuevo comportamiento o modificación
- Existe control de cambios y/o tickets asociados

---

### 6.2 Artefactos que NACEN

Obligatorios:
- spec.md (nueva especificación derivada)
- plan.md (plan técnico de la iniciativa)

Opcionales:
- Ajustes al modelo de datos
- Nuevos contratos técnicos

---

### 6.3 Artefactos que NO NACEN

- NO nace nueva constitución
- NO se reescribe el canon fundacional

La constitución existente **se respeta y se referencia**.

---

### 6.4 Numeración

Cada evolución funcional genera una nueva iniciativa secuencial:

002-nueva-funcionalidad
003-mejora-ia


---

## 7. Corrección de Errores (Bugfix)

### 7.1 Condiciones

Una iniciativa es bugfix cuando:
- Existe un ticket de error
- No cambia el comportamiento esperado
- El problema es de implementación, no de alcance

---

### 7.2 Artefactos que NACEN

Obligatorios:
- plan.md (plan técnico correctivo)
- tasks/ (tareas de corrección)

Opcionales:
- Documento técnico de análisis del bug

---

### 7.3 Artefactos que NO NACEN

- NO nace constitución
- NO nace nueva especificación funcional
- NO se redefine el canon

El bugfix **corrige el código para cumplir el canon existente**.

---

## 8. Constitución de Proyecto

### 8.1 Cuándo NACE una constitución

Una constitución solo nace cuando:
- El proyecto es nuevo
- O existe un cambio explícito de filosofía, alcance o principios

---

### 8.2 Cuándo NO nace una constitución

- Cambios funcionales
- Mejoras incrementales
- Corrección de errores
- Optimización técnica

La constitución es un evento **raro, consciente y deliberado**.

---

## 9. Especificación Canónica

### 9.1 Cuándo NACE una especificación

- En proyectos nuevos (SPEC‑001)
- En cambios funcionales autorizados
- Cuando el “qué” del sistema cambia

---

### 9.2 Cuándo NO nace una especificación

- Bugfix
- Refactor interno
- Ajustes técnicos sin impacto funcional

---

## 10. Plan Técnico

### 10.1 Cuándo NACE un plan técnico

- Siempre que exista una iniciativa
- Puede ser humano, generado o híbrido

---

### 10.2 Relación con la especificación

- El plan implementa la spec
- El plan NO redefine alcance
- El plan puede evolucionar sin cambiar la spec

---

## 11. Relación con Herramientas (Speckit)

Reglas obligatorias:
- Speckit solo ejecuta iniciativas
- Speckit no interpreta tickets ni CR
- Speckit opera únicamente sobre artefactos canónicos
- Speckit no infiere requisitos ausentes

---

## 12. Meta y Trazabilidad

Toda iniciativa debe incluir un archivo `meta.md` que:
- Referencie tickets y controles de cambio
- Explique el contexto organizacional
- Declare el tipo de iniciativa

El archivo `meta.md` **nunca es ejecutable**.

---

## 13. Regla Final del Ciclo de Vida

No todo problema genera una spec.  
No toda spec genera una constitución.  
Todo lo que se ejecuta debe respetar el canon.

---

## 14. Estado

Este documento define el **ciclo de vida oficial de DIANA‑SDK by DRFIC**  
y es vinculante para todos los proyectos que adopten este framework.

---

``