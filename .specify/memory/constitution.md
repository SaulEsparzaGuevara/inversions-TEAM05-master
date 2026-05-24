<!--
Sync Impact Report
- Version change: 1.0.0 -> 1.1.0
- Modified principles:
  - "12. Gobierno Constitucional de Agentes de IA" -> "12. Gobierno Constitucional de Agentes de IA"
  - "14. Evolucion y Enmiendas" -> "14. Evolucion y Enmiendas"
- Added sections:
  - 16. Gobierno de la Constitucion
- Removed sections:
  - Ninguna
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (alineado; sin cambios)
  - ✅ .specify/templates/spec-template.md (alineado; sin cambios)
  - ✅ .specify/templates/tasks-template.md (alineado; sin cambios)
  - ✅ .specify/templates/commands/*.md (no existe en este repositorio)
  - ✅ .drfic/diana-sdk/projects/diana-inversions/README.md (sin contenido; no aplica)
  - ✅ .drfic/readme.md (sin contenido; no aplica)
- Follow-up TODOs:
  - Ninguno
-->

# Constitucion del Proyecto
## Plataforma Profesional de Inversiones Asistida por Inteligencia Artificial

Identificador: DIANA-INVERSIONS-CONSTITUTION
Proyecto: DIANA Inversions
Tipo: Constitucion Canonica del Proyecto

Autoridad:
Este documento constituye la fuente de verdad primaria y superior del proyecto
DIANA Inversions. Define principios inmutables, limites, reglas no negociables,
gobierno de agentes, estandares tecnicos minimos y criterios rectores bajo los
cuales DEBEN alinearse especificaciones, planes, tareas, decisiones y codigo.

Ninguna especificacion, plan, ticket, agente o implementacion puede contradecir
esta constitucion sin una enmienda constitucional explicita y documentada.

## Idioma Oficial del Proyecto

El idioma oficial del proyecto DIANA Inversions es espanol.

Todas las especificaciones, planes tecnicos, tareas, contratos,
documentacion, reportes y artefactos derivados del proceso
Spec-Driven Development DEBEN redactarse en espanol.

Se permite ingles tecnico unicamente cuando:
- No exista traduccion clara o estandar
- Se trate de nombres propios, tecnologias, librerias o estandares

Esta regla aplica tambien a artefactos generados por herramientas
automaticas como Speckit.

---

## 1. Proposito Estrategico

Disenar, construir y evolucionar una plataforma web de inversiones profesional,
orientada a acciones y opciones del mercado estadounidense, que asista
decisiones humanas de inversion mediante:

- Analisis tecnico cuantitativo multicapa
- Analisis fundamental, estructural e institucional
- Evaluacion especializada de opciones
- Confirmacion y razonamiento asistido por Inteligencia Artificial
- Integracion con brokers profesionales reales

La plataforma no busca sustituir al inversionista; busca incrementar precision,
trazabilidad y calidad de decisiones.

---

## 2. Objetivo Constitucional

Desarrollar una plataforma web de inversiones asistida por Inteligencia
Artificial que:

- Detecte senales de compra y venta de alta confianza
- Combine multiples fuentes de verdad desacopladas (cores)
- Permita al usuario configurar, activar y ponderar dichas fuentes
- Integre brokers profesionales reales
- Mantenga control humano obligatorio sobre cualquier ejecucion (v1.0)
- Sea escalable, auditable, segura y extensible

Este objetivo es independiente del stack tecnologico especifico, pero queda
sujeto a los estandares minimos definidos en esta constitucion.

---

## 3. Filosofia Fundamental del Sistema

### 3.1 Modelo Semi-Automatico

El sistema adopta por definicion constitucional un modelo semi-automatico:

- NO existe ejecucion automatica sin aprobacion humana explicita
- La automatizacion se limita a analisis, correlacion y recomendacion
- La decision final pertenece siempre al usuario

---

### 3.2 Arquitectura por Cores Desacoplados

El sistema se compone de cores independientes. Cada core:

- Representa una fuente de verdad especializada
- Es desacoplado funcional y tecnicamente
- Puede activarse o desactivarse por el usuario

Ejemplos de cores:

- Analisis fundamental
- Analisis tecnico de soportes, resistencias y tendencias
- Analisis tecnico de indicadores (RSI, MACD, BB, EMA/SMA, volumen)
- Estructura y tendencia
- Cadena de opciones
- Flujo institucional
- Noticias y eventos
- Inteligencia Artificial

---

### 3.3 Rol de la Inteligencia Artificial

La IA:

- Es un core adicional
- Actua como confirmador, correlador y evaluador de riesgo
- No reemplaza la logica deterministica base
- No ejecuta operaciones por si misma en v1.0

Esto garantiza transparencia, auditabilidad y control humano.

---

## 4. Principio de Confluencia

Una senal solo puede considerarse valida cuando:

- Existe coincidencia entre cores activos o seleccionados por el usuario
- Se alcanza score y nivel de confianza configurados
- El razonamiento de cada core es explicable y trazable

No existen senales black-box.

---

## 5. Rol del Usuario

El usuario:

- Decide que cores participan
- Configura estrategias, pesos y umbrales
- Aprueba o rechaza toda ejecucion
- Puede auditar por que una senal fue generada

El sistema asiste, no sustituye.

---

## 6. Alcance Constitucional de la Version 1.0

### Incluye

- Generacion de senales de trading de compra o venta
- Evaluacion de oportunidades en acciones y opciones
- Integracion con brokers profesionales
- Confirmacion por IA
- Dashboard profesional trazable
- Persistencia, logs y evidencia operativa

### Excluye

- Auto-trading sin intervencion humana
- IA como unica fuente de decision
- Operacion sin trazabilidad
- Senales no explicables

---

## 7. Principios de Ingenieria y Calidad

El proyecto se rige por principios no negociables:

- Spec-Driven Development como metodologia base
- Separacion estricta entre PWA y REST API
- Arquitectura modular y escalable
- Seguridad estricta de credenciales
- Evidencia funcional obligatoria
- Testing, observabilidad y control de errores obligatorios

---

## 8. Metodologia de Ejecucion

El proyecto se rige por la metodologia AI Skill Development &
Spec Driven Assistance AI, que establece:

- Agentes con roles claros
- Skills reutilizables
- Knowledge previo a tickets
- Gates obligatorios
- Trazabilidad completa desde necesidad hasta codigo

Esta metodologia no es opcional.

---

## 9. Stack Tecnologico Constitucional

### 9.1 PWA - Stack Base Obligatorio

La PWA DEBE construirse sobre:

- Vite como bundler y entorno de desarrollo
- React como framework de UI
- TypeScript como lenguaje principal
- JavaScript solo para interoperabilidad o legado
- Arquitectura modular por features

### 9.2 Backend - Stack Base Obligatorio

La capa backend DEBE implementarse como:

- REST API
- Node.js
- Express como framework base

El backend es responsable de:

- Persistencia real
- Integracion con brokers
- Seguridad de credenciales
- Exposicion de contratos estables a la PWA

---

## 10. Estandar Constitucional de Documentacion de Codigo

Todo codigo generado por humanos o agentes de IA DEBE cumplir el siguiente
estandar de documentacion:

- Comentarios con prefijo `FIC:`
- Comentarios bilingues ingles/espanol (EN/ES)
- Cobertura minima en modulos, servicios, hooks publicos, logica critica,
  integraciones con brokers y motores de senales

Ejemplo:

```ts
// FIC: Calculates RSI indicator for trading signals (EN)
// FIC: Calcula el indicador RSI para senales de trading (ES)
export function calculateRSI(...) { ... }
```

La ausencia de este estandar bloquea el cierre de tickets.

---

## 11. Integracion con Brokers

### 11.1 Brokers Obligatorios (v1.0)

La plataforma DEBE operar como minimo con:

- Interactive Brokers (IBKR)
- Alpaca

Ambos brokers DEBEN soportar:

- Conectividad
- Market data
- Sincronizacion de portafolio
- Preparacion de ordenes asistidas

### 11.2 Arquitectura Estandar de Brokers

El sistema DEBE implementar una arquitectura de brokers estandarizada que
permita:

- Agregar nuevos brokers sin reescribir logica de senales
- Encapsular brokers como adaptadores
- Mantener contratos internos estables
- Desacoplar logica de trading del broker concreto

Ejemplos de extension futura:

- Tradier
- TD Ameritrade / Schwab
- NinjaTrader
- Brokers crypto (en specs futuras)

La logica de trading no puede acoplarse a un broker especifico.

---

## 12. Gobierno Constitucional de Agentes de IA

### 12.1 Naturaleza de los Agentes

Los agentes (Picoro, Goku, Vegeta, Krilin, Bulma) son roles documentados,
no entidades autonomas sin control.

Los agentes:

- No toman decisiones fuera de su rol
- No ejecutan trabajo sin trazabilidad
- No sustituyen la aprobacion humana

### 12.2 Reglas Obligatorias para Todo Agente

Todo agente de IA que participe en el desarrollo:

- DEBE declarar explicitamente el skill activo
- DEBE mostrar cabecera de actividad
- DEBE dejar evidencia verificable de salida
- NO puede ejecutar trabajo fuera de su fase asignada

La ausencia de cualquiera de estos elementos bloquea el avance del trabajo.

### 12.3 Orden Operativo Constitucional Obligatorio

El flujo operativo de agentes es obligatorio e inmutable:

Picoro -> (Goku || Krilin) -> (Vegeta || Bulma) -> Aprobacion Dr.FIC.

Roles:

- Picoro: analisis, investigacion y diseno
- Goku: implementacion
- Krilin: bases de datos y servicios REST API
- Vegeta: optimizacion y seguridad
- Bulma: validacion y testing
- Dr.FIC.: aprobacion y validacion humana explicita

Violaciones a este flujo bloquean el avance, el cierre de tickets y el
paso de fase.

### 12.4 Independencia de Frameworks

Los agentes definidos en esta constitucion:

- Son independientes de agentes internos de SpecKit u otros frameworks
- Funcionan como modelo de gobierno y orquestacion
- Pueden operar sobre SpecKit, OpenSpec u otros frameworks

SpecKit no reemplaza este gobierno; se subordina a el.

---

## 13. Escalabilidad del Ecosistema

Estos principios aplican a todas las aplicaciones del ecosistema para
asegurar consistencia tecnica y escalabilidad organizacional, incluyendo:

- Plataformas educativas (cursos, tutoriales, LMS empresariales)
- Sistemas con agentes y Copilot integrado
- Aplicaciones futuras PWA + REST API con AI Skill Development

---

## 14. Evolucion y Enmiendas

La plataforma puede evolucionar hacia:

- Backtesting avanzado
- Automatizacion progresiva opt-in
- Nuevos brokers y mercados
- Nuevos cores especializados

Cualquier cambio que modifique filosofia, altere rol de IA o habilite
ejecucion automatica REQUIERE enmienda constitucional explicita y documentada.

---

## 15. Declaracion Final

Esta constitucion define que es y que no es la plataforma.

Toda SPEC, ticket, agente, skill o linea de codigo DEBE respetar, reflejar y
reforzar esta constitucion.

---

## 16. Gobierno de la Constitucion

### 16.1 Jerarquia Normativa

Esta constitucion prevalece sobre specs, planes, tareas, prompts, tickets,
contratos y decisiones tecnicas del proyecto.

### 16.2 Politica de Versionado

La constitucion utiliza Semantic Versioning:

- MAJOR: cambios incompatibles en principios, alcance o gobierno
- MINOR: nuevas secciones o ampliaciones normativas sustanciales
- PATCH: aclaraciones, redaccion o correcciones sin cambio de significado

### 16.3 Procedimiento de Enmienda

Toda enmienda DEBE incluir:

- Justificacion y alcance
- Impacto en artefactos dependientes
- Version nueva y tipo de incremento
- Fecha de enmienda en formato ISO (YYYY-MM-DD)

La enmienda entra en vigor al actualizar este archivo y sincronizar
artefactos dependientes.

### 16.4 Revision de Cumplimiento

Cada ejecucion de /speckit.plan, /speckit.tasks y /speckit.implement DEBE
incluir chequeo de cumplimiento constitucional. Cualquier incumplimiento DEBE
registrarse como bloqueo hasta su correccion o enmienda formal.

---

**Version**: 1.1.0 | **Ratified**: 2026-04-22 | **Last Amended**: 2026-04-27
**Estado**: Activa
**Rol**: Fuente de verdad primaria
**Framework**: Spec-Driven Development (SpecKit / OpenSpec)
