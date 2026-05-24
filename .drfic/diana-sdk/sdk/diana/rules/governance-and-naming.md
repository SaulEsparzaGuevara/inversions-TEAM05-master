# DIANA‑SDK by DRFIC
## Reglas Oficiales de Gobernanza por Proyecto y Convenciones de Identificación

---

## 1. Propósito

Este documento define las reglas oficiales de DIANA‑SDK by DRFIC para:

- Gobernanza por proyecto
- Organización de controles de cambio y tickets
- Convenciones obligatorias de identificación (IDs) para artefactos SDD

Su objetivo es:
- Evitar mezcla de proyectos
- Garantizar consecutivos independientes por proyecto
- Mantener trazabilidad clara negocio → canon → ejecución
- Permitir operación segura de Speckit y agentes IA
- Facilitar auditoría y escalabilidad multi‑proyecto

Estas reglas son **obligatorias** para todos los proyectos DIANA‑SDK.

---

## 2. Principio Rector

> **La gobernanza pertenece al proyecto.**  
> **El canon pertenece a la iniciativa.**  
> **Speckit solo ejecuta canon.**

Nunca se mezclan controles de cambio, tickets ni consecutivos entre proyectos.

---

## 3. Gobernanza por Proyecto (Estructura Obligatoria)

Cada proyecto DIANA‑SDK **DEBE** contener su propio folder de gobernanza.

### Estructura mínima requerida

projects/<PROYECTO>/
├── governance/
│   ├── change-requests/
│   ├── tickets/
│   └── decision-log.md
├── <PROYECTO>-CONSTITUTION
└── initiatives/

Reglas:

No existe gobernanza global compartida entre proyectos
Cada proyecto mantiene su propio historial y consecutivos
La auditoría siempre se realiza a nivel proyecto

---

## 4. Convenciones Oficiales de Identificación (OBLIGATORIAS)
Todas las convenciones utilizan numeración secuencial por proyecto
(<NNN> reinicia en cada proyecto).

4.1 Control de Cambios (Change Requests)
Identificador obligatorio
<NNN>-<PROYECTO>-CC

Ejemplos:

001-DIANA-CC
002-DIANA-CC
003-INVERSIONES-CC

Ubicación del archivo


projects/<PROYECTO>/governance/change-requests/001-<PROYECTO>-CC.md

Reglas:

Todo proyecto nuevo inicia con al menos un Control de Cambios
El CC describe el problema y la necesidad, nunca la solución técnica
Speckit NO lee controles de cambio


### 4.2 Tickets
Identificador obligatorio
<NNN>-<PROYECTO>-TKT

Ejemplos:

001-DIANA-TKT
014-INVERSIONES-TKT

Ubicación del archivo
projects/<PROYECTO>/governance/tickets/001-<PROYECTO>-TKT.md

Reglas:

Todo ticket puede (y normalmente debe) referenciar un CC
Puede existir ticket sin CC únicamente para bugfix
El ticket no define canon ni arquitectura


### 4.3 Constitución del Proyecto
Identificador y nombre obligatorio
<PROYECTO>-CONSTITUTION

Ubicación
projects/<PROYECTO>/<PROYECTO>-CONSTITUTION


Reglas:

Existe una sola constitución activa por proyecto
Nace únicamente en proyectos greenfield
Cambia solo por decisión explícita de alto nivel
Speckit la lee como contexto, nunca la modifica

### 4.4 Especificaciones (SPEC)
Identificador obligatorio
<NNN>-<PROYECTO>-SPEC

Ejemplos:

001-DIANA-SPEC
002-INVERSIONES-SPEC

Ubicación del archivo
projects/<PROYECTO>/initiatives/<NNN>-<PROYECTO>/spec.md

Encabezado obligatorio dentro de spec.md
Identificador: <NNN>-<PROYECTO>-SPEC

Reglas:

El número representa orden histórico funcional
No es versión semántica
Cada SPEC vive en una iniciativa distinta

### 4.5 Planes Técnicos (PLAN)
Identificador obligatorio
<NNN>-<PROYECTO>-PLAN

Ejemplos:

001-INV-PLAN
002-EDU-PLAN

Ubicación del archivo
projects/<PROYECTO>/initiatives/<NNN>-<PROYECTO>/plan.md

Reglas:

Existe exactamente un PLAN por iniciativa
El PLAN implementa una SPEC
El PLAN nunca redefine alcance funcional


### 4.6 Tareas (TASK)
Identificador obligatorio
<NNN>-<PROYECTO>-TASK

Ubicación del archivo
projects/<PROYECTO>/initiatives/<NNN>-<PROYECTO>/tasks/

Reglas:

Las tareas derivan directamente del PLAN
No crean funcionalidad nueva
Speckit puede generarlas automáticamente


## 5. Relación entre Gobernanza y Canon
La relación entre CC, Ticket y Canon SIEMPRE se declara en meta.md.
Ejemplo obligatorio:

Origen:
- Control de cambios: 001-DIANA-CC
- Ticket: 001-DIANA-TK

Reglas:

meta.md es informativo
No es ejecutable
Speckit NO interpreta meta.md

## 6. Flujo Oficial en Proyectos Nuevos (Greenfield)

1. Usuario genera <NNN>-<PROYECTO>-CC
2. Usuario genera <NNN>-<PROYECTO>-TKT
3. Se crea <PROYECTO>-CONSTITUTION
4. Se crea <NNN>-<PROYECTO>-SPEC
5. Se crea <NNN>-PLAN
6. Entra Speckit:
   - speckit.constitution
   - speckit.specification
   - speckit.clarify
   - speckit.plan

Speckit NUNCA entra antes del paso 6.


## 7. Flujo en Evolución / Mantenimiento

1. Usuario genera <NNN>-<PROYECTO>-CC o <NNN>-<PROYECTO>-TKT
2. Se crea nueva iniciativa
3. Se crea nuevo <NNN>-<PROYECTO>-SPEC (si cambia el “qué”)
4. Se crea nuevo <NNN>-PLAN
5. Speckit ejecuta

Bugfix:

No crea SPEC
No crea CONSTITUTION


## 8. Regla Final
Un proyecto gobierna sus cambios.
Una iniciativa gobierna su canon.
Los identificadores hacen auditable el sistema.
Speckit ejecuta exactamente lo definido.

## 9. Estado
Este documento define las Reglas Oficiales de Gobernanza por Proyecto
y Convenciones de Identificación en DIANA‑SDK by DRFIC.
Es vinculante para todos los proyectos actuales y futuros.


```