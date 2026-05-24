
# DIANA‑SDK by DRFIC
## Reglas Oficiales de Nomenclatura (SDD)

---

## 1. Propósito

Este documento define las reglas oficiales de nomenclatura de DIANA‑SDK by DRFIC.

Su objetivo es:
- Garantizar coherencia documental
- Evitar ambigüedades para agentes IA
- Permitir escalabilidad a múltiples proyectos
- Mantener compatibilidad con frameworks SDD como Speckit

Estas reglas son de cumplimiento obligatorio en todos los proyectos
que adopten DIANA‑SDK.

---

## 2. Principio Rector

En DIANA‑SDK, los nombres indican autoridad y contexto, no solo orden.

La nomenclatura define:
- Qué documento manda
- Qué artefacto es ejecutable
- Qué información es solo referencial

---

## 3. Jerarquía Canónica

La jerarquía obligatoria es:

DRFIC (organización / programa)  
→ Proyecto  
→ Iniciativa  
→ Artefactos SDD

Cada nivel tiene responsabilidades distintas y no intercambiables.

---

## 4. Organización / Programa (DRFIC)

Representa:
- La empresa
- El programa estratégico
- El dueño de la metodología DIANA‑SDK

Reglas:
- No representa proyectos
- No contiene especificaciones ejecutables
- Contiene únicamente gobernanza transversal

---

## 5. Proyecto

Un proyecto es un producto o sistema con ciclo de vida propio.

Convención obligatoria de nombre:

<dominio>-<producto>

Ejemplos válidos:
- diana-investments
- diana-learning
- diana-sdk-core
- diana-analytics

Reglas:
- Sin espacios
- Sin mayúsculas
- Sin versiones
- Sin tickets

---

## 6. Iniciativa (Unidad SDD)

La iniciativa es la unidad fundamental de trabajo en DIANA‑SDK.

Convención obligatoria:

NNN-descripcion-corta

Donde:
- NNN es un número secuencial (001, 002, 003…)
- descripcion-corta describe el propósito del cambio

Ejemplos válidos:
- 001-foundation
- 002-user-auth
- 003-chat-ia
- 004-bugfix-brokers

Reglas:
- El número no es versión
- No usar tickets, CR ni fechas
- Una iniciativa pertenece a un solo proyecto

---

## 7. Archivos Canónicos de una Iniciativa

Los nombres de archivos dentro de una iniciativa son fijos:

meta.md  
constitution.md (solo si aplica)  
spec.md  
plan.md  

Significado:
- meta.md: contexto organizacional (no ejecutable)
- constitution.md: reglas del sistema
- spec.md: autoridad funcional
- plan.md: autoridad técnica

---

## 8. Proyecto Nuevo vs Mantenimiento

Proyecto nuevo:
- Se crea constitution.md
- La iniciativa suele llamarse 001-foundation

Evolución funcional:
- No se crea nueva constitución
- Se crea nueva iniciativa

Corrección de errores:
- No se crea constitución
- No se crea spec funcional nueva
- La iniciativa es técnica

---

## 9. Idioma Oficial

Idioma principal:
- Español

Permitido en inglés:
- Identificadores técnicos
- Acrónimos
- Estándares

Los nombres de carpetas se mantienen en inglés técnico
por compatibilidad con tooling.

---

## 10. Regla Final

Proyecto define el sistema.  
Iniciativa define el cambio.  
Canon define la verdad.  
Herramientas ejecutan, no deciden.

---
``