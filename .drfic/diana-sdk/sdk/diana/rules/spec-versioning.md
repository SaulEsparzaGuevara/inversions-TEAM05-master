# DIANA‑SDK by DRFIC
## Reglas Oficiales de Versionado de Especificaciones (Spec Versioning)

---

## 1. Propósito

Este documento define las reglas oficiales para el **versionado de especificaciones**
en proyectos que adoptan DIANA‑SDK by DRFIC.

Su objetivo es:
- Evitar ambigüedad entre cambios funcionales y técnicos
- Proteger la estabilidad del canon
- Garantizar trazabilidad histórica
- Permitir ejecución segura con herramientas SDD como Speckit
- Evitar versionado innecesario o caótico

Estas reglas son **obligatorias** para todos los proyectos DIANA‑SDK.

---

## 2. Principio Rector del Versionado

> **La especificación versiona el “qué”, no el “cómo”.**  
> **Si el comportamiento cambia, la spec cambia.**  
> **Si solo la implementación cambia, la spec NO versiona.**

El versionado protege el significado del sistema, no su implementación.

---

## 3. Qué es una Versión de Especificación

Una versión de especificación representa:
- Un estado estable del comportamiento esperado del sistema
- Un acuerdo explícito entre negocio, ingeniería y agentes IA
- Un punto de referencia para validación y auditoría

Una versión **no es**:
- Un commit de código
- Un parche técnico
- Un cambio cosmético

---

## 4. Tipos de Cambios y su Impacto en Versionado

### 4.1 Cambios que SÍ requieren nueva versión de spec

Se debe crear una **nueva versión de especificación** cuando ocurre cualquiera de los siguientes:

- Se agrega nueva funcionalidad
- Se modifica un comportamiento existente
- Se elimina una capacidad del sistema
- Cambian reglas de negocio
- Cambian criterios de aceptación
- Cambian requisitos no funcionales relevantes (seguridad, auditoría, SLA)

Estos cambios afectan el **“qué”** del sistema.

---

### 4.2 Cambios que NO requieren nueva versión de spec

NO se debe versionar la especificación cuando el cambio es únicamente:

- Refactor interno
- Optimización de performance
- Corrección de bugs
- Cambio de librerías o frameworks
- Reorganización de arquitectura interna
- Ajustes de implementación

Estos cambios afectan solo el **“cómo”**.

---

## 5. Modelo de Versionado Adoptado

DIANA‑SDK utiliza **versionado secuencial por iniciativa**, no semver clásico.

Formato conceptual:

SPEC‑001  
SPEC‑002  
SPEC‑003  

Donde:
- El número indica **orden histórico de cambio funcional**
- No representa compatibilidad binaria
- No representa releases técnicos

---

## 6. Relación entre Versión y Iniciativa

### Regla Fundamental

> **Cada nueva versión de especificación vive en una nueva iniciativa.**

No existen múltiples versiones de spec dentro de una misma iniciativa.

Ejemplo correcto:

initiatives/
├── 001-foundation/
│   └── spec.md   # SPEC‑001
├── 002-portfolio-ia/
│   └── spec.md   # SPEC‑002

Ejemplo incorrecto:

initiatives/001-foundation/
├── spec-v1.md
├── spec-v2.md


---

## 7. Ubicación y Nombre del Archivo

Dentro de una iniciativa:
- El archivo siempre se llama `spec.md`
- La versión se declara **dentro del contenido**, no en el nombre del archivo

Ejemplo de encabezado recomendado:

```markdown
# Especificación Canónica
## Plataforma de Inversiones IA

Versión: SPEC‑002  
Estado: Activa  
Iniciativa: 002-portfolio-ia

## 8. Estado de una Especificación
Cada especificación debe declarar su estado:

Borrador: en elaboración, no ejecutable
Activa: canónica y ejecutable
Deprecada: reemplazada por una versión posterior
Archivada: histórica, solo referencia

Solo las specs Activas pueden ser ejecutadas por Speckit.

## 9. Relación con el Plan Técnico

Cada versión de spec tiene su propio plan técnico
Cambios en el plan NO implican nueva versión de spec
Si el plan requiere cambiar la spec, se crea nueva iniciativa

Relación uno a uno:

SPEC‑002 → PLAN‑002


## 10. Relación con Bugfix

Bugfix NO crea nueva versión de spec
Bugfix corrige el código para cumplir la spec vigente
Si el bug revela ambigüedad en la spec:

Se aclara sin cambiar comportamiento
O se versiona explícitamente (nueva iniciativa)


## 11. Relación con Speckit
Reglas obligatorias:

Speckit ejecuta una sola versión de spec por iniciativa
Speckit NO versiona specs
Speckit NO migra versiones
Speckit NO interpreta compatibilidad entre versiones

Speckit:

Lee spec.md
Asume que es la versión activa del cambio


## 12. Trazabilidad entre Versiones
La trazabilidad entre versiones debe declararse explícitamente
en la nueva iniciativa:

## Trazabilidad

Esta especificación (SPEC‑002) reemplaza a:
- SPEC‑001 (Iniciativa 001-foundation)

Motivo del cambio:
- Nueva funcionalidad de portafolios con IA

## 13. Deprecación de Especificaciones
Cuando una spec es reemplazada:

Se marca como Deprecada
No se elimina
No se modifica
Se conserva como referencia histórica

El código debe alinearse siempre con la versión activa.

## 14. Regla Final de Versionado
Si el comportamiento cambia, la spec versiona.
Si solo cambia el código, la spec no se toca.
Cada versión vive en su iniciativa.
El canon se protege siempre.

## 15. Estado
Este documento define las Reglas Oficiales de Versionado de Especificaciones
en DIANA‑SDK by DRFIC y es vinculante para todos los proyectos.


``