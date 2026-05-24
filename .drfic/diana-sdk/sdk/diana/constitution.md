# DIANA‑SDK by DRFIC
## Constitución Metodológica (Spec‑Driven Development)

---

## 1. Propósito

DIANA‑SDK by DRFIC es un framework metodológico de **Spec‑Driven Development (SDD)** diseñado para estructurar, gobernar y ejecutar proyectos de software asistidos por Inteligencia Artificial de forma clara, trazable y escalable.

Esta constitución define:
- Los principios fundamentales del framework
- Las reglas de autoridad documental
- La relación entre negocio, especificación y ejecución
- Los límites de acción de herramientas como Speckit
- Las bases para operar proyectos nuevos, mantenimiento y evolución

Este documento es **canónico a nivel metodología**.

---

## 2. Alcance

DIANA‑SDK aplica a:
- Proyectos de software desde cero (greenfield)
- Sistemas existentes (brownfield)
- Plataformas de inversión, analítica e IA
- Plataformas de cursos, capacitación y aprendizaje asistido por IA
- SDKs, APIs y productos internos o externos

DIANA‑SDK no reemplaza:
- Procesos de negocio
- Control de cambios organizacional
- Gestión de tickets
- Herramientas de ejecución (Speckit, CI/CD, etc.)

DIANA‑SDK **los organiza y los conecta**.

---

## 3. Principio Rector

> **La verdad del sistema se define antes del código.**  
> **La especificación gobierna a la implementación.**  
> **Las herramientas ejecutan, no deciden.**

Toda decisión relevante debe quedar reflejada en artefactos canónicos antes de ser ejecutada.

---

## 4. Jerarquía de Autoridad Documental

La autoridad en DIANA‑SDK sigue este orden estricto:

1. Constitución metodológica (este documento)
2. Constitución de proyecto (si aplica)
3. Especificación canónica
4. Plan técnico canónico
5. Artefactos generados por herramientas
6. Código y ejecución

Si existe conflicto entre documentos, **gana siempre el nivel superior**.

---

## 5. Separación de Dimensiones

DIANA‑SDK distingue explícitamente dos dimensiones:

### 5.1 Dimensión Organizacional (Origen)
Incluye:
- Controles de cambio
- Tickets de usuarios
- Solicitudes de negocio
- Decisiones de comité

Estos artefactos:
- Explican el **por qué**
- No son ejecutables
- No gobiernan la solución técnica

---

### 5.2 Dimensión Canónica (SDD)
Incluye:
- Constitución
- Especificación
- Plan
- Contratos
- Tareas

Estos artefactos:
- Definen el **qué** y el **cómo**
- Son ejecutables por herramientas SDD
- Constituyen la verdad del sistema

---

## 6. Proyecto, Iniciativa y Canon

### 6.1 Proyecto
Un proyecto es un sistema o producto con:
- Ciclo de vida propio
- Usuarios definidos
- Backlog independiente

Cada proyecto puede tener múltiples iniciativas.

---

### 6.2 Iniciativa
La iniciativa es la **unidad fundamental de trabajo en DIANA‑SDK**.

Una iniciativa:
- Surge de un ticket, control de cambios o decisión estratégica
- Traduce negocio → ingeniería
- Contiene el canon del cambio
- Es el único contexto que ejecutan herramientas como Speckit

Una iniciativa pertenece a **un solo proyecto**.

---

## 7. Constitución de Proyecto

La constitución de proyecto:
- Define principios, límites y reglas del sistema
- Solo nace cuando el proyecto es nuevo o cuando cambia la filosofía del sistema
- No se recrea en cada iniciativa

La constitución es un evento **consciente y poco frecuente**.

---

## 8. Especificación Canónica

La especificación canónica:
- Define el comportamiento esperado del sistema
- No contiene historial de tickets
- No contiene decisiones implícitas
- No se completa por inferencia automática

Toda implementación debe alinearse estrictamente con la especificación vigente.

---

## 9. Plan Técnico

El plan técnico:
- Define cómo implementar la especificación
- Puede ser propuesto por humanos o herramientas
- Es validado contra la especificación
- No redefine alcance funcional

El plan puede evolucionar sin cambiar el canon funcional.

---

## 10. Rol de las Herramientas (Speckit y otras)

Las herramientas SDD:
- Ejecutan planes
- Generan artefactos derivados
- Automatizan tareas

Las herramientas:
- No deciden arquitectura sin indicación explícita
- No infieren requisitos ausentes
- No alteran el canon sin autorización humana

---

## 11. Idioma Oficial

Idioma principal de DIANA‑SDK:
- Español

Se permite el uso de inglés para:
- Identificadores técnicos
- Acrónimos
- Estándares
- Nombres de tecnologías

La coherencia de idioma es obligatoria dentro de cada proyecto.

---

## 12. IA como Copiloto

La Inteligencia Artificial en DIANA‑SDK:
- Actúa como asistente, no como autoridad
- Debe operar con contexto explícito
- Debe dejar trazabilidad de decisiones
- No puede tomar decisiones autónomas sin supervisión

Toda acción de IA debe poder auditarse contra el canon.

---

## 13. Evolución del Framework

DIANA‑SDK es un framework vivo.

Los cambios a esta constitución:
- Deben ser explícitos
- Deben quedar versionados
- No deben romper proyectos existentes sin transición definida

---

## 14. Regla Final

Negocio origina.  
Canon gobierna.  
Plan organiza.  
Herramientas ejecutan.  
Código implementa.

---

## 15. Estado

Este documento constituye la **Constitución Oficial de DIANA‑SDK by DRFIC**  
y rige todos los proyectos que adopten este framework metodológico.

---
``