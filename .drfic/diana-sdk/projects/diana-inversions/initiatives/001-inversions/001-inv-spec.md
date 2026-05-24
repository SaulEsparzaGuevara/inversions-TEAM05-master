# Especificación Canónica
## Plataforma de Inversiones con IA

Identificador: 001-DIANA-INVERSIONS-SPEC  
Proyecto: DIANA Inversions  
Iniciativa: 001-inversions  
Estado: Activa  

Autoridad:
Este documento está estrictamente subordinado a la Constitución del Proyecto
(**inv-constitution.md**) como fuente de verdad primaria.
Ante cualquier conflicto, prevalece la Constitución.

Framework de ejecución:
Spec‑Driven Development (DIANA‑SDK + Speckit)

## Relación con Speckit

Esta especificación es la **fuente canónica completa** del proyecto.

Para efectos de ejecución automática con Speckit:
- Se generará una **especificación operativa derivada**
- Dicha especificación debera incluir todos los temas aqui plasmados pero transformados de acuerdo al framework de speckitnicamente:
  - User stories
  - Acceptance scenarios
  - Requisitos funcionales
- La especificación operativa NO sustituye este documento
- La autoridad arquitectónica y constitucional permanece aquí

Speckit NO debe sobrescribir este archivo.


## Origen y Trazabilidad Canónica

Esta especificación canónica se deriva de una necesidad de negocio
formalmente documentada y aprobada mediante los siguientes artefactos
organizacionales del proyecto **DIANA Inversions**:

- Control de Cambios: **001-INV-UCC**
- Ticket de Usuario: **001-INV-TKT**
- Constitución del Proyecto: **inv-constitution.md**

Relación de autoridad:
- El Control de Cambios define la necesidad de negocio.
- El Ticket describe el problema desde la perspectiva del usuario.
- La Constitución

Nota de versión:
Esta especificación corresponde a la iniciativa canónica **001-inversions**.
Cualquier regeneración de este documento debe sobrescribir esta misma especificación
y no generar una nueva versión, ya que no existe cambio funcional.

## Idioma de la Especificación

Esta especificación canónica se redacta en **español**,
en cumplimiento de la Constitución del Proyecto.

Cualquier artefacto derivado de esta especificación,
incluyendo planes técnicos, contratos y documentación generada
por herramientas SDD como Speckit,
DEBE mantenerse en español.

El uso de términos técnicos en inglés está permitido
únicamente cuando sea necesario y no ambiguo.

 
---

## 0. AUTORIDAD CONSTITUCIONAL

Esta especificación deriva directamente de la Constitución del Proyecto y está subordinada a ella como fuente de verdad primaria.

Reglas no negociables:
- Modelo semi-automático obligatorio
- La IA no ejecuta operaciones
- Control humano explícito en toda ejecución
- Arquitectura por cores desacoplados
- Señales explicables y trazables

Ante cualquier conflicto, prevalece constitution.md.

---

## 1. OBJETIVO GENERAL

Diseñar, construir y operar una Plataforma Web Profesional de Inversiones asistida por Inteligencia Artificial, enfocada en acciones y opciones del mercado estadounidense, que:

- Genere señales BUY / SELL / HOLD de alta confianza
- Combine múltiples fuentes de verdad especializadas (cores)
- Utilice IA únicamente como confirmador y evaluador de riesgo
- Integre brokers profesionales reales
- Mantenga control humano obligatorio sobre toda ejecución

---

## 2. FILOSOFÍA DEL SISTEMA

### 2.1 Modelo Semi-Automático

- No existe auto-trading en la versión 1.0
- La IA no ejecuta ni decide
- El usuario aprueba o rechaza toda operación
- La automatización se limita a análisis, correlación y recomendación

### 2.2 Arquitectura por Cores Desacoplados

El sistema se compone de cores independientes, activables por el usuario:

- Market Data
- Technical Indicators
- Technical Structure
- Institutional Flow
- News & Events
- Options Analysis
- Confluence Engine
- AI Advisor (confirmador)

Cada core representa una fuente de verdad explicable.

---

## 3. ALCANCE FUNCIONAL (VERSIÓN 1.0)

### Incluye
- Señales en acciones y opciones US
- Dashboard profesional
- Integración con IBKR y Alpaca
- Persistencia y trazabilidad
- Evidencia operativa por ticket

### Excluye
- Auto-trading
- IA como única fuente
- Señales black-box
- Crypto

---

## 4. ARQUITECTURA GENERAL

- PWA (React + TypeScript)
- Backend REST API (Node.js + Express)
- Supabase como base principal
- MongoDB opcional para logs y señales históricas
- Integración con IBKR y Alpaca
- AI Advisor (Claude API)

---

## 5. STACK TECNOLÓGICO OBLIGATORIO

### PWA
- Vite
- React 18 o superior
- TypeScript
- Zustand
- TailwindCSS
- TradingView Lightweight Charts

### Backend
- Node.js
- Express
- Supabase
- MongoDB (opcional)
- Interactive Brokers API
- Alpaca Trading API
- Claude API

---

## 6. BACKEND REST API — RESPONSABILIDADES

- Conectividad con brokers
- Sincronización de portafolio
- Persistencia server-side
- Ingesta de market data
- Ejecución asistida
- Seguridad y observabilidad

---

## 7. AUTH CONTEXT (FASE TRANSICIONAL)

Header requerido:
- x-user-id: UUID

Reglas de validación:
- 401 AUTH_CONTEXT_MISSING
- 400 AUTH_CONTEXT_INVALID_UUID
- 404 AUTH_CONTEXT_USER_NOT_FOUND
- 403 AUTH_CONTEXT_USER_INACTIVE

---

## 9. PERSISTENCIA DE DATOS

Fuentes:
- Supabase: usuarios, cuentas, posiciones, órdenes
- MongoDB (opcional): señales históricas, reasoning IA, logs

Reglas:
- Persistencia únicamente server-side
- Sincronización idempotente
- Evidencia técnica obligatoria por ticket
- Debe generarse un esquema inicial versionado en Supabase con migración baseline antes de iniciar la fase fundacional
- El esquema baseline debe cubrir como mínimo Usuario, ActivoInversion, FuenteAnalitica, SenalInversion, EvidenciaAnalitica, PropuestaOperativa, DecisionHumana, IntentoEjecucion y RegistroAuditoria

---

## 10. INTELIGENCIA ARTIFICIAL (AI ADVISOR)

Rol constitucional:
- Core adicional
- Confirmador de confluencia
- Evaluador de riesgo
- Nunca ejecutor
- Nunca fuente única

Capacidades:
- Ajuste de score de confianza
- Explicación de señales
- Identificación de riesgos
- Justificación de no-operación

---

## 11. GOBIERNO DE AGENTES

Agentes oficiales:
- Picoro: arquitectura y especificación
- Goku: implementación
- Vegeta: optimización y seguridad
- Krilin: REST API y bases de datos
- Bulma: testing y validación
- Dr.FIC: aprobación humana

Orden obligatorio:
Picoro → (Goku ∥ Krilin) → (Vegeta ∥ Bulma) → Dr.FIC

---

## 12. CRITERIOS DE ACEPTACIÓN GLOBALES

- Respeto total a la Constitución
- IA no ejecuta operaciones
- Señales explicables
- Brokers desacoplados
- Credenciales solo en .env
- Evidencia funcional por ticket
- Logs y trazabilidad activos

---

## 13. DECLARACIÓN FINAL

Este documento:
- Es un único archivo Markdown
- Está listo para ejecutarse con /speckit.specification
- Es constitucionalmente válido
- Es ejecutable por agentes IA
- Representa fielmente el estado actual del proyecto
``