# TEAM-05 "TurboPapus" — Documentación Completa del Proyecto

> **Proyecto**: Plataforma de Inversiones con IA — Módulo de Cobertura Institucional  
> **Equipo**: TEAM-05 TurboPapus  
> **Versión**: 1.0.0  
> **Última actualización**: Mayo 2026

---

## Índice

1. [Visión General](#1-visión-general)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Backend — Estructura y Componentes](#3-backend--estructura-y-componentes)
4. [Frontend — Estructura y Componentes](#4-frontend--estructura-y-componentes)
5. [Fuentes de Datos](#5-fuentes-de-datos)
6. [Estrategias de Cobertura](#6-estrategias-de-cobertura)
7. [Resiliencia y Degradación](#7-resiliencia-y-degradación)
8. [Motor de Análisis de Tendencias](#8-motor-de-análisis-de-tendencias)
9. [Motor de Expiración de Opciones](#9-motor-de-expiración-de-opciones)
10. [Chat IA con Gemini](#10-chat-ia-con-gemini)
11. [API — Endpoints REST](#11-api--endpoints-rest)
12. [Tests](#12-tests)
13. [Cómo Probar el Proyecto](#13-cómo-probar-el-proyecto)
14. [Glosario](#14-glosario)

---

## 1. Visión General

### 1.1 ¿Qué es este proyecto?

Es un **módulo de análisis institucional y cobertura** dentro de una plataforma de inversiones con inteligencia artificial. Permite a inversores institucionales:

- **Analizar** posiciones regulatorias (SEC 13F, FINRA Short Interest) de forma automatizada
- **Detectar** zonas de soporte y resistencia basadas en flujo institucional
- **Simular** estrategias de cobertura (Protective Put, Collar, Covered Straddle)
- **Comparar** estrategias y recibir recomendaciones
- **Consultar** un asistente IA (Gemini 2.5 Flash) para análisis contextual

### 1.2 ¿Por qué se construyó?

Reemplazar fuentes de datos pagadas (Unusual Whales, Finviz) con **APIs gratuitas** (Yahoo Finance, SEC EDGAR, FINRA), añadiendo **degradación gradual** para que el sistema nunca falle por completo aunque todas las fuentes externas estén caídas.

### 1.3 Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Backend | Node.js + Express + TypeScript | Node 20+, TS 5.x |
| Frontend | React 19 + TypeScript + Vite | React 19 |
| Tests | Vitest | 3.x |
| IA | Google Gemini 2.5 Flash | API REST |
| Fuentes | SEC EDGAR, FINRA, Yahoo Finance | APIs públicas |
| Base de datos | Supabase (PostgreSQL) | Migraciones SQL |
| Resolución de paquetes | npm workspaces (monorepo) | npm 10+ |

### 1.4 Estructura del Monorepo

```
inversions-TEAM05/
├── projects/
│   ├── rest-api/inversions_api/   ← Backend (Express + TypeScript)
│   │   ├── src/
│   │   │   ├── modules/           ← Lógica de negocio (institutional, ai, strategies)
│   │   │   ├── routes/            ← Express routers
│   │   │   ├── lib/               ← Utilidades (resilience)
│   │   │   ├── jobs/              ← Tareas programadas
│   │   │   ├── observability/     ← Métricas y monitoreo
│   │   │   ├── database/          ← Migraciones SQL
│   │   │   └── index.ts           ← Punto de entrada
│   │   ├── tests/                 ← Tests unitarios e integración
│   │   ├── tools/                 ← Herramientas auxiliares
│   │   └── scripts/               ← Scripts de validación
│   └── pwa/inversions_app/        ← Frontend (React + Vite)
│       └── src/
│           ├── pages/             ← Páginas de la app
│           ├── components/        ← Componentes reutilizables
│           ├── services/          ← Llamadas API
│           ├── store/             ← Estado global (Zustand)
│           ├── layouts/           ← Layout principal
│           ├── features/          ← Módulos de features
│           └── main.tsx           ← Entry point
├── specs/                         ← Especificaciones del proyecto
│   ├── 006-team-05-institucional-cobertura/
│   └── 007-team-05-frontend-cobertura/
└── docs/                          ← Documentación
```

---

## 2. Arquitectura del Sistema

### 2.1 Diagrama de Flujo de Datos

```
Usuario (Frontend)
      │
      ▼
┌─────────────────────┐     ┌──────────────────────┐
│   Express Router     │────→│  Auth Middleware      │
│   (/api/institutional│     │  (AUTH_BYPASS/.env)   │
│    /api/ai,          │     └──────────────────────┘
│    /api/coverage)    │
└─────────┬───────────┘
          │
          ▼
┌──────────────────────────────────────────────┐
│          getInstitutionalRouteContext()       │
│  ┌────────────────┐  ┌──────────────────┐    │
│  │DataService     │  │ZonesEngine       │    │
│  │(4 fuentes)     │  │(S/R detection)   │    │
│  ├────────────────┤  ├──────────────────┤    │
│  │TrendEngine     │  │ExpirationEngine  │    │
│  │(MA, crossovers)│  │(OpEx, catalysts) │    │
│  └────────────────┘  └──────────────────┘    │
└──────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────┐
│  CoverageStrategyEngine                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ProtPut   │ │Collar    │ │CovStraddle   │  │
│  ├──────────┤ ├──────────┤ ├──────────────┤  │
│  │SimEngine │ │RiskSvc   │ │ReportSvc     │  │
│  └──────────┘ └──────────┘ └──────────────┘  │
└──────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────┐
│  Gemini Chat (IA)    │
│  (polling asíncrono) │
└──────────────────────┘
```

### 2.2 Flujo de Solicitud de Análisis Institucional

1. El frontend envía GET a `/api/institutional/analysis?ticker=AAPL&period=daily&horizon=medium`
2. El middleware de autenticación verifica `AUTH_BYPASS` o API key
3. `institutionalAnalysis.ts` construye el contrato de análisis
4. `InstitutionalDataService.resolve()` ejecuta las 4 fuentes en paralelo:
   - SEC EDGAR 13F → fetch → parse → observación
   - FINRA Short Interest → fetch → parse → observación
   - Yahoo Options Flow → fetch (crumb auth) → parse → observación
   - Yahoo Institutional → fetch (crumb auth) → parse → observación
5. Cada fuente registra su estado individual en `sourceReports[]`
6. `mergeObservations()` combina todos los datos en un solo `InstitutionalAnalysisContract`
7. `InstitutionalZonesEngine.analyze()` detecta soportes y resistencias
8. `InstitutionalTrendEngine.analyze()` calcula tendencias y promedios móviles
9. `ExpirationAnalysisEngine.analyze()` detecta eventos de expiración
10. Se devuelve la respuesta JSON completa al frontend

### 2.3 Flujo de Simulación de Cobertura

1. El frontend envía POST a `/api/coverage/analyze` con ticker, precio, strikes
2. `CoverageSimulationEngine.analyze()` ejecuta Monte Carlo para Protective Put, Collar, Covered Straddle
3. `CoverageRiskService.evaluate()` analiza riesgos de cada estrategia
4. `CoverageReportService.generateReport()` crea reporte completo
5. `CoverageComparator.compare()` rankea y recomienda la mejor estrategia
6. Se devuelve resultado con gráficos de payoff, métricas y alertas

### 2.4 Flujo de Chat IA

1. Frontend POST a `/api/ai/institutional-chat` con mensaje + contexto
2. Backend responde 202 con `pollingUrl` + `responseId`
3. Backend inicia llamada async a Gemini 2.5 Flash con el prompt contextual
4. Frontend hace polling GET a `/api/ai/institutional-chat/poll/:id`
5. Cuando Gemini responde, el backend cachea el resultado y el polling lo recoge
6. Si Gemini falla o no hay API key, se retorna un mensaje de degradación

---

## 3. Backend — Estructura y Componentes

### 3.1 Módulo Institutional

#### `src/modules/institutional/institutionalContract.ts`
**Propósito**: Define los tipos y validadores para TODO el análisis institucional.

- `InstitutionalAnalysisRequestSchema` — Schema Zod que valida: ticker (1-10 mayúsculas), period (intraday/daily/weekly/monthly/quarterly), horizon (short/medium/long)
- `InstitutionalAnalysisContract` — Interfaz que define qué campos componen una solicitud de análisis
- `createInstitutionalAnalysisContract()` — Factory que valida un payload contra el schema Zod y lanza error si es inválido

**¿Por qué Zod?** Para tener validación runtime (no solo TypeScript compile-time) en los endpoints Express.

#### `src/modules/institutional/institutionalDataService.ts`
**Propósito**: Servicio central que consume las 4 fuentes de datos externas.

- `InstitutionalDataService` — Clase singleton con:
  - **Caché en memoria** (`Map<string, CacheEntry>`) con TTL configurable por fuente
  - **Rate limiting** por fuente con sliding window de 60 segundos
  - **Resolución paralela** de fuentes con `Promise.allSettled`
  - **Merge de observaciones**: promedia ownership, suma flujos, máximo volumen
  - **Timeouts** con `AbortController` (default 12s)
  - **Degradación gradual**: nunca lanza error, siempre retorna `overallStatus`
- `resolve()` — Método principal, retorna `InstitutionalDataServiceResult`
- `resolveAnalysis()` — Conveniencia: retorna solo el contrato mergeado

**¿Por qué este diseño?** Para que el sistema sea resiliente: si una fuente falla, las demás continúan. El `overallStatus` informa al frontend si todo está bien, parcial o totalmente caído.

#### `src/modules/institutional/institutionalZonesEngine.ts`
**Propósito**: Detecta zonas de soporte y resistencia a partir de velas OHLC y datos institucionales.

- **Algoritmo**: Encuentra pivotes (máximos/mínimos locales), los clusteriza por precio cercano, asigna fuerza basada en número de toques, volumen acumulado y confianza de fuentes.
- **Configuración por constructor**: `pivotWindow` (velas a izq/der), `clusterTolerancePct`, `maxZones`
- Retorna: `InstitutionalZonesResult` con zonas (support/resistance), métricas por zona y sourceReports

**¿Por qué clusterizar?** Para evitar zonas redundantes (ej: dos pivotes a $99.8 y $100.2 se fusionan en una zona ~$100).

#### `src/modules/institutional/institutionalTrendEngine.ts`
**Propósito**: Analiza tendencias de mercado usando promedios móviles y datos institucionales.

- Calcula **MA50 y MA200** (fast/slow moving averages) con pendientes
- Detecta **cruce dorado** (golden cross: MA50 > MA200) y **cruce de la muerte** (death cross: MA50 < MA200)
- Calcula **niveles S/R** desde los precios OHLC
- Calcula **correlación precio-volumen**
- Calcula **probabilidad de continuación** de tendencia usando 4 factores: MA alignment, volume confirmation, ownership trend, flow momentum
- `analyzeTrend()` — Método de conveniencia que retorna solo el resumen

**¿Por qué solo MA50/MA200?** Son los estándares de la industria para análisis institucional a mediano/largo plazo.

#### `src/modules/institutional/expirationAnalysisEngine.ts`
**Propósito**: Detecta eventos de expiración de opciones y catalizadores de mercado.

- **Expiración mensual** (Monthly OpEx): tercer viernes de cada mes
- **Expiración trimestral** (Quarterly OpEx): tercer viernes de mar, jun, sep, dic
- **Triple Witching**: ocurre en meses trimestrales (futuros + opciones sobre índices + opciones sobre futuros expiran el mismo día)
- **Slippery Slope**: análisis de skew call/put basado en flujo institucional
- **Catalyst Windows**: FOMC (8 reuniones/año), CPI (12 publicaciones/año), earnings seasons
- **Time Decay Profile**: régimen (far/near/at_expiration), theta, gamma exposure, vanna, charm
- **Quarterly Report Correlation**: correlación entre ventanas de reportes trimestrales y expiraciones

**¿Por qué es importante?** Las expiraciones de opciones causan volatilidad significativa. Detectar estos eventos ayuda a los inversores a anticipar movimientos.

#### `src/modules/institutional/yahooOptionsParser.ts`
**Propósito**: Parser de la API v7 de Yahoo Finance para cadena de opciones (T338).

- Autenticación de 3 pasos: cookie → crumb → request autenticado
- Parseo de `optionChain.result[0].options[0].calls/puts`
- Detección de strikes "unusual" (volumen > 2× open interest)
- Put/Call ratio por strike y global
- Confidence scoring dinámico basado en: expiraciones detectadas, strikes inusuales, volumen total, OI total
- **Fallback sintético**: si la API falla, retorna observación con `confidence: 0.3`

**¿Por qué crumb auth?** Yahoo Finance requiere autenticación para APIs no oficiales. El flujo cookie → crumb es el método estándar.

#### `src/modules/institutional/yahooInstitutionalParser.ts`
**Propósito**: Parser de la API v10 de Yahoo Finance para tenencias institucionales (T339).

- Mismo flujo de autenticación que el parser de opciones
- Extrae `institutionOwnership.ownershipList` (holders individuales con name, shares, change)
- Extrae `majorHoldersBreakdown` (% held por instituciones)
- Calcula `fundsOwnershipPct`, flujos netos agregados (inflows/outflows)
- Confidence scoring: holders count, breakdown disponible, flujos calculados, stale data penalty
- **Fallback sintético**: si la API falla, retorna observación con `confidence: 0.3`

#### `src/modules/institutional/realSourceParsers.ts`
**Propósito**: Parsers para fuentes regulatorias reales (SEC EDGAR 13F, FINRA Short Interest).

- `parseSecEdgar13fReal()` — Obtiene datos desde EFTS (Exchange Feed Time Series) usando SEC EDGAR XML
  - Busca CUSIP en `cusipForTicker()` → construye URL de SEC.gov → parsea XML → normaliza
  - Cache de CUSIPs en `CUSIP_CACHE` (Map estático)
- `parseFinraShortInterestReal()` — Obtiene datos desde la API REST de FINRA
  - Construye URL con ticker y fecha → parsea JSON de respuesta
  - Usa `finraCache` que se precarga al arrancar el servidor

**Limitaciones conocidas**: `cusipForTicker()` solo tiene 12 tickers mapeados (AAPL, MSFT, GOOGL, GOOG, AMZN, META, TSLA, NVDA, JPM, V, SPY, QQQ). Para tickers sin CUSIP, la fuente SEC falla.

### 3.2 Módulo AI

#### `src/modules/ai/institutionalCopilotChat.ts`
**Propósito**: Integración con Google Gemini 2.5 Flash para chat contextual.

- Construye un **system prompt** con contexto institucional detallado (ticker, precio, tenencia, flujos, posiciones abiertas)
- Llama a la API de Gemini con `generateContent()` usando el SDK de Google Generative AI
- **Polling asíncrono**: guarda resultados en `Map<string, ChatSessionState>`, el frontend hace polling
- **Degradación**: si no hay `GEMINI_API_KEY` o la API falla, retorna mensaje de servicio no disponible
- Timeout de 30 segundos para la respuesta de Gemini

**¿Por qué polling y no WebSocket?** Simplicidad de implementación y compatibilidad con entornos serverless donde los WebSockets no siempre están disponibles.

### 3.3 Routes

#### `src/routes/institutional/bootstrap.ts`
**Propósito**: Fábrica singleton que construye y expone todos los servicios institucionales.

- `getInstitutionalRouteContext()` — Función principal que:
  1. Crea `InstitutionalDataService` con `globalThis.fetch` real y 4 fuentes configuradas
  2. Crea `InstitutionalZonesEngine` con configuración optimizada
  3. Crea `InstitutionalTrendEngine` con períodos MA estándar (50/200)
  4. Crea `ExpirationAnalysisEngine` con look-ahead de 6 meses
  5. Retorna objeto con `{ service, engine, trendEngine, expirationEngine }`
- `buildDefaultSourceConfigs()` — Define las 4 fuentes con sus URLs, prioridades, rate limits
- `buildInstitutionalAnalysisContractFromRequest()` — Convierte query params en contrato
- `groupInstitutionalZones()` — Agrupa zonas en support/resistance para el frontend
- `buildInstitutionalTrendSummary()` — Resumen de tendencia para la respuesta
- `buildInstitutionalMetricsSummary()` — Métricas agregadas

**¿Por qué singleton?** Para compartir la misma instancia de servicios entre los endpoints de analysis y positions, incluyendo la caché en memoria.

#### `src/routes/institutional/institutionalAnalysis.ts`
**Propósito**: Endpoint GET `/analysis` que retorna análisis institucional completo.

- Recibe query params: ticker, period, horizon
- Valida con `InstitutionalAnalysisRequestSchema`
- Ejecuta: data service → zones engine → trend engine → expiration engine
- Retorna: `{ request, zones, trends, metrics, catalystWindows, sourceReports }`

#### `src/routes/institutional/regulatoryPositions.ts`
**Propósito**: Endpoint GET `/positions` que retorna posiciones regulatorias 13F.

- Mismos query params que analysis (ticker, period, horizon)
- Ejecuta data service y construye respuesta con posiciones, flujos y sourceReports
- Retorna: `{ request, positions13F, flows, sourceReports, cacheHit, usedSourceIds }`

#### `src/routes/ai/institutionalCopilot.ts`
**Propósito**: Endpoints POST `/chat` y GET `/chat/poll/:id` para el chat IA.

- POST: recibe `{ message, ticker, price }`, inicia sesión de chat, retorna 202 con pollingUrl
- GET /poll/:id: verifica estado de la sesión y retorna resultado o "processing..."

### 3.4 Módulo de Estrategias de Cobertura

#### `src/modules/strategies/coverage/coverageTypes.ts`
**Propósito**: Define todos los tipos y schemas Zod para estrategias de cobertura.

- `CoverageStrategyKind` — Union type: "protective_put" | "married_put" | "collar_put" | "covered_straddle"
- `CoverageStrategyRequest` — Input del usuario para la simulación
- `CoverageStrategyResult` — Output del engine (payoff, riskMetrics, alerts)
- `CoverageComparisonResult` — Output del comparador (ranked entries, recommended)
- Schemas Zod para validación runtime

#### `src/modules/strategies/coverage/coverageStrategyContract.ts`
**Propósito**: Contrato base que todos los engines de cobertura implementan.

- Define interfaz `CoverageStrategyEngine` con método `analyze()`
- Todos los engines (ProtectivePut, Collar, CoveredStraddle) implementan esta interfaz

#### `src/modules/strategies/coverage/coverageStrategyAdapter.ts`
**Propósito**: Adaptador al estándar transversal de salida de estrategias (T173).

- Toma el resultado de cualquier engine y lo transforma al formato estándar `StrategyOutputStandard`
- Permite que cualquier estrategia sea consumida por el mismo pipeline de reporting

#### `src/modules/strategies/coverage/protectivePutEngine.ts`
**Propósito**: Engine para la estrategia Protective Put.

- **Qué hace**: Compra de una put para proteger una posición larga existente
- **Payoff**: Limitado a la baja (el strike de la put es el piso), upside ilimitado
- **Risk Metrics**: riskProfile="limited", maxProtection, protectionFloorPrice
- **Alertas**: STOP_LOSS_TRIGGERED (si el precio subyacente < strike de la put)
- **Fórmula**: Payoff = max(0, strike - precio) - prima + (precio - precio_compra)

#### `src/modules/strategies/coverage/marriedPutEngine.ts`
**Propósito**: Engine para Married Put (compra simultánea de acción + put).

- Similar al Protective Put pero la acción se compra al mismo tiempo que la put
- Mismas métricas de riesgo, perfil limitado

#### `src/modules/strategies/coverage/collarEngine.ts`
**Propósito**: Engine para Collar Put (protective put + short call).

- **Qué hace**: Compra una put (piso) y vende una call (techo) sobre la misma acción
- **Payoff**: Limitado en ambos lados (entre strike de put y strike de call)
- **Risk Metrics**: riskProfile="limited", protectionFloorPrice, protectionCeilingPrice
- **Alertas**: COLLAR_TARGET_MOVE (si se definió un targetMovePct)
- **Ventaja**: La prima de la call vendida financia parcial o totalmente la put comprada

#### `src/modules/strategies/coverage/coveredStraddleEngine.ts`
**Propósito**: Engine para Covered Straddle (acción + short put + short call).

- **Qué hace**: Vende una put y una call sobre una acción que ya se posee
- **Payoff**: Riesgo ilimitado a la baja (la put corta puede obligar a comprar más acciones)
- **Risk Metrics**: riskProfile="unlimited", marginRequirement
- **Alertas**: MARGIN_STRESS (alto capital en riesgo)
- **Advertencia**: Es la estrategia más riesgosa de las 4

#### `src/modules/strategies/coverage/coverageSimulationEngine.ts`
**Propósito**: Simulación Monte Carlo y backtest de estrategias.

- **Deterministic Scenarios**: Calcula payoff en 20 puntos de precio alrededor del precio actual
- **Monte Carlo**: 10,000 iteraciones con distribución normal de retornos
  - Media = 0 (retorno esperado neutral), desviación = volatilidad histórica
  - Calcula: expectedPnL, medianPnL, bestPnL, worstPnL, VaR 95%, Expected Shortfall
- **Backtest**: Toma muestras de velas históricas y calcula P&L histórico
- Retorna: CoverageSimulationResult con los 3 conjuntos de datos

**¿Por qué Monte Carlo?** Para simular la distribución de resultados posibles bajo condiciones de mercado realistas, no solo un escenario único.

#### `src/modules/strategies/coverage/coverageRiskService.ts`
**Propósito**: Evaluación de riesgos de cada estrategia.

- Evalúa si se disparó stop-loss
- Evalúa alertas de margen
- Genera acciones recomendadas (ej: "Comprar protección adicional", "Reducir tamaño de posición")
- Genera notificaciones para el usuario

#### `src/modules/strategies/coverage/coverageReportService.ts`
**Propósito**: Generación de reportes completos de cobertura.

- Combina: strategy result + simulation + risk evaluation
- Genera summary con: expectedPnL, winRate, riskRewardRatio, alertCount
- Prepara datos para exportación (logs, exports)

#### `src/modules/strategies/coverage/coverageComparator.ts`
**Propósito**: Compara y rankea múltiples estrategias de cobertura.

- Para la estrategia base del usuario, genera las 3 variantes (protective put, collar, covered straddle, married put)
- Ejecuta simulación + riesgo + reporte para cada una
- Asigna score compuesto basado en: expected PnL, win rate, risk profile, risk-reward ratio
- Rankea por score total
- Recomienda la estrategia con mayor score (`recommendedKind`)

### 3.5 Estándar de Salida de Estrategias

#### `src/modules/strategies/standards/strategyOutputStandard.ts`
**Propósito**: Define el formato estándar para TODAS las salidas de estrategias.

- `StrategyOutputStandard` — Interfaz que unifica: engineId, ticker, strategyKind, payoff, riskMetrics, alerts
- `StandardPayoff` — Puntos de payoff para gráficos
- `StandardRiskMetrics` — Métricas de riesgo normalizadas
- Permite que cualquier frontend consuma cualquier estrategia sin cambios

### 3.6 Módulo de Resiliencia

#### `src/lib/resilience/retryWithBackoff.ts`
**Propósito**: Reintentos con backoff exponencial para operaciones fallidas.

- `retryWithBackoff<T>(fn, options?)` — Ejecuta una función async, reintenta si falla
- Opciones: `maxAttempts` (default 5), `baseMs` (default 200), `maxMs` (default 10000), `jitter` (default true)
- El jitter aleatorio evita el "thundering herd" cuando múltiples servicios reintentan simultáneamente

#### `src/lib/resilience/staleInput.ts`
**Propósito**: Detecta si un timestamp de datos es "stale" (obsoleto).

- `isStale(timestamp, options?)` — Verifica si la antigüedad supera el threshold (default 1 día)
- `handleStaleInput(timestamp, options?)` — Como isStale pero con callback onStale
- Útil para decidir si usar datos cacheados o refrescar

#### `src/lib/resilience/partialDataHandler.ts`
**Propósito**: Mergea datos parciales con defaults completos.

- `mergePartialWithDefaults<T>(partial, defaults)` — Combina un objeto parcial con defaults
- Si partial tiene `undefined` o `null`, se usa el default
- Usado en las estrategias de cobertura para mergear configuración parcial del usuario

### 3.7 Jobs y Observabilidad

#### `src/jobs/purgeEvidenceJob.ts`
**Propósito**: Tarea programada que purga evidencia de análisis antiguo.

- Elimina datos de análisis con más de 90 días de antigüedad
- Previene acumulación de datos obsoletos en la base de datos

#### `src/observability/coverageMetrics.ts`
**Propósito**: Métricas de monitoreo para el módulo de cobertura.

- `trackCoverageAnalysis()` — Registra cada análisis ejecutado
- `trackStrategyComparison()` — Registra cada comparación
- `getCoverageMetrics()` — Recupera métricas acumuladas

### 3.8 Database y Migraciones

#### `src/database/supabase/migrations/008_institutional_copilot.sql`
**Propósito**: Migración SQL que crea las tablas para el chat IA institucional.

- `institutional_chat_sessions` — Almacena sesiones de chat (id, ticker, precio, contexto, timestamps)
- `institutional_chat_messages` — Almacena mensajes individuales (rol: user/assistant, contenido)
- Políticas RLS (Row Level Security) para aislamiento por usuario

### 3.9 Tools y Scripts

#### `tools/reconstruct_explanation.ts`
**Propósito**: Herramienta de auditoría que reconstruye una explicación de estrategia.

- Toma un resultado de análisis y genera un texto explicativo detallado
- Útil para debugging o para generar reportes legibles

#### `scripts/validate-contract-compat.sh`
**Propósito**: Script bash que valida la compatibilidad entre contratos.

- Verifica que los tipos definidos en los contratos sean consistentes
- Corre como parte del pipeline CI

---

## 4. Frontend — Estructura y Componentes

### 4.1 Páginas

#### `src/pages/institutional/InstitutionalAnalysisPage.tsx`
**Propósito**: Página principal de análisis institucional.

- Formulario con inputs: Ticker (text), Período (select: intraday/daily/weekly/monthly/quarterly), Horizonte (select: short/medium/long)
- Al buscar, muestra:
  - **Zonas S/R** en tabla con precio, tipo (soporte/resistencia), fuerza, confianza, toques
  - **Tendencia**: alcista/bajista/neutral con fuerza, golden/death cross
  - **Métricas**: zonaCount, precioActual
  - **Source Reports**: tabla con status individual de cada fuente
- Estados: loading (spinner), error (alerta roja), datos (tablas + cards)
- `useEffect` para carga inicial con SPY por defecto
- Llamada a API: `getInstitutionalAnalysis()` en `services/institutional/institutionalApi.ts`

#### `src/pages/institutional/RegulatoryPositionsPage.tsx`
**Propósito**: Página de posiciones regulatorias (13F).

- Formulario con mismos campos que analysis
- Al buscar, muestra:
  - **Flujos**: inflows, outflows, netFlow en cards con indicadores de color
  - **Tenencia**: fundsOwnershipPct, openPositions count
  - **Tabla 13F**: filas con issuer, cusip, value, shares, weight, change
  - **Source Reports** con status de caché y fuentes
- Llamada a API: `getRegulatoryPositions()` en `services/institutional/institutionalApi.ts`

#### `src/pages/coverage/CoverageStrategiesPage.tsx`
**Propósito**: Página de simulación de estrategias de cobertura.

- Formulario: Ticker, Precio, Acciones, Strikes (input separado por comas)
- Al simular, muestra 4 tarjetas (Protective Put, Married Put, Collar, Covered Straddle) con:
  - **Payoff Chart**: gráfico de líneas con payoff vs precio (usando Recharts)
  - **Métricas**: break-even, protección, prima neta, max profit/loss, win rate, risk-reward ratio
  - **Alertas**: tarjetas de advertencia si aplican
- La tarjeta recomendada tiene un badge "⭐ Recomendada"
- Llamada a API: `analyzeCoverage()` en `services/coverage/coverageApi.ts`

#### `src/pages/ai/AIChatPage.tsx`
**Propósito**: Página de chat con asistente IA.

- Input de mensaje + campos de contexto (ticker, precio)
- **Historial**: burbujas de chat (usuario azul, asistente gris)
- **Estados**: idle, processing (spinner), success, error
- **Degradación**: si el servicio IA no está disponible, muestra banner rojo con botón "Reintentar"
- Componentes internos: `ChatHistory`, `ScenarioAnalysisCards`
- Llamada a API: `sendMessage()`, `pollResponse()` en `services/ai/aiChatApi.ts`

### 4.2 Componentes Reutilizables

#### `src/components/ai/ChatHistory.tsx`
**Propósito**: Renderiza el historial de mensajes del chat IA.

- Mapa de mensajes con burbujas, roles (user/assistant) y timestamps

#### `src/components/ai/ScenarioAnalysisCards.tsx`
**Propósito**: Muestra tarjetas de análisis de escenarios generadas por Gemini.

- Interpreta markdown de la respuesta de Gemini y renderiza cards

#### `src/components/coverage/PayoffChart.tsx`
**Propósito**: Gráfico de payoff usando Recharts.

- Línea de payoff con precio en eje X, P&L en eje Y
- Punto de break-even marcado
- Colores: verde (ganancia), rojo (pérdida)

### 4.3 Servicios (API Calls)

#### `src/services/institutional/institutionalApi.ts`
**Propósito**: Llamadas a los endpoints de análisis institucional y posiciones.

- `getInstitutionalAnalysis(ticker, period, horizon)` → GET `/api/institutional/analysis`
- `getRegulatoryPositions(ticker, period, horizon)` → GET `/api/institutional/positions`

#### `src/services/coverage/coverageApi.ts`
**Propósito**: Llamada al endpoint de simulación de coberturas.

- `analyzeCoverage(params)` → POST `/api/coverage/analyze`

#### `src/services/ai/aiChatApi.ts`
**Propósito**: Llamadas al chat IA con polling.

- `sendChatMessage(ticker, price, message)` → POST `/api/ai/institutional-chat` → devuelve `{ responseId, pollingUrl }`
- `pollResponse(responseId)` → GET `/api/ai/institutional-chat/poll/{responseId}` → devuelve `{ status, response }`

#### `src/services/signals/signalApi.ts`
**Propósito**: Endpoint de señales de trading (futuro).

- `getSignals()` → GET `/api/signals`
- Actualmente es un placeholder para integraciones futuras

### 4.4 Store (Estado Global)

#### `src/store/chat.ts`
**Propósito**: Estado global del chat IA usando Zustand.

- `messages`: array de mensajes
- `status`: idle | processing | success | error
- `sendMessage()`: acción que llama a la API y maneja polling
- `clearChat()`: resetea el estado

#### `src/store/signals.ts`
**Propósito**: Estado global de señales de trading.

- `signals`: array de señales
- `fetchSignals()`: acción que llama a la API
- Actualmente es placeholder

### 4.5 Layout

#### `src/layouts/MainLayout.tsx`
**Propósito**: Layout principal con sidebar de navegación.

- Sidebar con enlaces a las 4 páginas + dashboard
- Usa React Router para navegación SPA
- Diseño responsive (sidebar se colapsa en móvil)

### 4.6 Entry Point

#### `src/main.tsx`
**Propósito**: Punto de entrada de la aplicación React.

- Configura React Router con rutas para las 4 páginas
- Renderiza `MainLayout` como wrapper
- Monta en `#root`

---

## 5. Fuentes de Datos

### 5.1 SEC EDGAR 13F

| Propiedad | Valor |
|-----------|-------|
| **sourceId** | `sec-edgar-13f` |
| **API** | SEC.gov EDGAR + EFTS |
| **Parser** | `parseSecEdgar13fReal()` en `realSourceParsers.ts` |
| **Cache TTL** | 600,000 ms (10 min) |
| **Rate Limit** | 10 req/min |
| **Prioridad** | 1 (más alta) |
| **Tier** | free |
| **Datos que extrae** | Holdings por CUSIP, valor de mercado, cambios en posición |
| **Fallback** | Ninguno (es la fuente primaria) |

### 5.2 FINRA Short Interest

| Propiedad | Valor |
|-----------|-------|
| **sourceId** | `finra-short-interest` |
| **API** | FINRA Regulatory Dashboard API |
| **Parser** | `parseFinraShortInterestReal()` en `realSourceParsers.ts` |
| **Cache TTL** | 600,000 ms (10 min) |
| **Rate Limit** | 10 req/min |
| **Prioridad** | 2 |
| **Tier** | free |
| **Datos que extrae** | Short interest, average daily volume |
| **Precarga** | `ensureFinraCache()` al arrancar el servidor |

### 5.3 Yahoo Finance Options Flow

| Propiedad | Valor |
|-----------|-------|
| **sourceId** | `yahoo-options-flow` |
| **API** | query2.finance.yahoo.com/v7/finance/options |
| **Parser** | `parseYahooOptionsFlow()` en `yahooOptionsParser.ts` |
| **Cache TTL** | 120,000 ms (2 min) |
| **Rate Limit** | 20 req/min |
| **Prioridad** | 3 |
| **Tier** | free |
| **Autenticación** | Cookie → crumb flow (3 pasos) |
| **Datos que extrae** | Cadena de opciones, strikes unusuales, put/call ratio |
| **Fallback** | Sintético con confidence 0.3 |

### 5.4 Yahoo Finance Institutional

| Propiedad | Valor |
|-----------|-------|
| **sourceId** | `yahoo-institutional` |
| **API** | query2.finance.yahoo.com/v10/finance/quoteSummary |
| **Parser** | `parseYahooInstitutional()` en `yahooInstitutionalParser.ts` |
| **Cache TTL** | 300,000 ms (5 min) |
| **Rate Limit** | 20 req/min |
| **Prioridad** | 4 |
| **Tier** | free |
| **Autenticación** | Cookie → crumb flow (3 pasos) |
| **Datos que extrae** | Holders institucionales, % held, flujos netos |
| **Fallback** | Sintético con confidence 0.3 |

### 5.5 Matriz Comparativa de Fuentes

| Característica | SEC 13F | FINRA | Yahoo Options | Yahoo Inst |
|---------------|---------|-------|---------------|------------|
| Disponibilidad | Alta (gubernamental) | Alta (gubernamental) | Media (API no oficial) | Media (API no oficial) |
| Latencia | ~2-5s | ~1-3s | ~1-2s | ~1-2s |
| Actualización | Trimestral | Bimensual | Tiempo real | Tiempo real |
| Confianza | Muy alta | Muy alta | Media | Media |
| Cobertura tickers | 12 mapeados | Todos | Todos | Todos |
| Requiere API key | No | No | No | No |

---

## 6. Estrategias de Cobertura

### 6.1 Protective Put

| Propiedad | Valor |
|-----------|-------|
| **Perfil de riesgo** | Limitado |
| **Upside** | Ilimitado |
| **Downside** | Limitado (strike de la put) |
| **Costo** | Prima de la put |
| **Mejor para** | Proteger ganancias, inversores que esperan subida pero quieren protección |

**Cuándo usarla**: Cuando el inversor es alcista pero quiere un piso de protección. El costo es la prima de la put.

### 6.2 Married Put

| Propiedad | Valor |
|-----------|-------|
| **Perfil de riesgo** | Limitado |
| **Upside** | Ilimitado |
| **Downside** | Limitado (strike de la put) |
| **Costo** | Prima de la put + compra de acciones |
| **Mejor para** | Nuevas posiciones con protección inmediata |

**Cuándo usarla**: Idéntico al Protective Put pero la acción se compra simultáneamente. Útil para entradas nuevas.

### 6.3 Collar Put

| Propiedad | Valor |
|-----------|-------|
| **Perfil de riesgo** | Limitado |
| **Upside** | Limitado (strike de la call vendida) |
| **Downside** | Limitado (strike de la put comprada) |
| **Costo** | Prima neta (put comprada - call vendida) |
| **Mejor para** | Cobertura de bajo costo o cero costo |

**Cuándo usarla**: Cuando el inversor quiere protección pero no quiere pagar la prima completa. Vender la call financia parcial o totalmente la put.

### 6.4 Covered Straddle

| Propiedad | Valor |
|-----------|-------|
| **Perfil de riesgo** | Ilimitado |
| **Upside** | Limitado (call vendida) |
| **Downside** | Ilimitado (put vendida) |
| **Costo** | Prima recibida (por vender ambas opciones) |
| **Mejor para** | Mercados laterales con baja volatilidad |

**⚠️ Advertencia**: Es la estrategia más riesgosa. Si el precio cae bruscamente, la put corta obliga a comprar más acciones al strike.

---

## 7. Resiliencia y Degradación

### 7.1 Degradación Gradual (T214)

El `InstitutionalDataService.resolve()` **nunca lanza error**. Cada fuente produce un `sourceReport` individual:

```typescript
sourceReport = {
  sourceId: string          // "sec-edgar-13f", "finra-short-interest", etc.
  status: "ok"              // Datos obtenidos correctamente
        | "error"           // Error de red o HTTP
        | "cached"          // Datos servidos desde caché
        | "rate_limited"    // Límite de tasa excedido
        | "skipped"         // Fuente deshabilitada
        | "failed";         // Parser devolvió null (datos no utilizables)
  latencyMs: number;
  error?: {
    code: "FETCH_ERROR" | "HTTP_4XX" | "HTTP_5XX" | "RATE_LIMITED" | "SOURCE_DISABLED" | "EMPTY_OR_UNSUPPORTED_RESPONSE";
    message: string;
    retryable: boolean;
  };
  observation?: InstitutionalSourceObservation;
}
```

El `overallStatus` se computa automáticamente:
- **`"ok"`** — todas las fuentes retornaron datos utilizables
- **`"partial"`** — algunas fuentes fallaron, pero al menos una retornó datos
- **`"all_failed"`** — ninguna fuente retornó datos utilizables → el endpoint retorna HTTP 503

### 7.2 Reintentos con Backoff (retryWithBackoff)

```
Intento 1: espera 200ms
Intento 2: espera 400ms
Intento 3: espera 800ms
Intento 4: espera 1,600ms
Intento 5: espera 3,200ms
Máximo: 10,000ms (cap)
Opción: jitter aleatorio (±25%) evita "thundering herd"
```

### 7.3 Detección de Datos Obsoletos (staleInput)

- Threshold por defecto: 1 día (86,400,000 ms)
- Función de callback `onStale` para acciones como refrescar datos o notificar al usuario

### 7.4 Merge de Datos Parciales (partialDataHandler)

- Si una fuente retorna datos incompletos, se mergean con defaults
- `null` y `undefined` en el parcial son reemplazados por defaults

---

## 8. Motor de Análisis de Tendencias

### 8.1 Moving Averages (Promedios Móviles)

| Período | Nombre | Uso |
|---------|--------|-----|
| 50 días | Fast MA | Tendencia de corto plazo |
| 200 días | Slow MA | Tendencia de largo plazo |

### 8.2 Cruces de MAs

| Cruce | Señal | Interpretación |
|-------|-------|----------------|
| Golden Cross | MA50 cruza arriba de MA200 | Alcista |
| Death Cross | MA50 cruza abajo de MA200 | Bajista |
| None | MAs demasiado cercanos | Neutro |

### 8.3 Factores de Continuidad de Tendencia

| Factor | Peso | Descripción |
|--------|------|-------------|
| MA Alignment | 0-1 | Qué tanto se alinean MAs con la dirección de la tendencia |
| Volume Confirmation | 0-1 | Si el volumen confirma la dirección (sube en tendencia, baja en corrección) |
| Ownership Trend | 0-1 | Dirección del cambio en tenencia institucional |
| Flow Momentum | 0-1 | Momentum de flujos institucionales |

---

## 9. Motor de Expiración de Opciones

### 9.1 Tipos de Eventos

| Tipo | Frecuencia | Significancia |
|------|-----------|---------------|
| Monthly OpEx | Mensual (tercer viernes) | 0.6 |
| Quarterly OpEx | Trimestral (mar, jun, sep, dic) | 0.8 |
| Triple Witching | Trimestral (mismos meses) | 1.0 |
| FOMC | 8 veces/año | 0.7 |
| CPI | 12 veces/año | 0.5 |

### 9.2 Slippery Slope

| Dirección | Interpretación |
|-----------|---------------|
| `call_skew` | Alta tenencia institucional + flujos positivos → mercado alcista |
| `put_skew` | Baja tenencia + flujos negativos → mercado bajista |
| `symmetric` | Balanceado → mercado neutral |

### 9.3 Time Decay Profile

| Régimen | Días hasta expiración | Theta (decaimiento) | Gamma Exposure |
|---------|----------------------|---------------------|----------------|
| `far` | > 30 días | Bajo | Bajo |
| `near` | 7-30 días | Medio | Medio |
| `at_expiration` | < 7 días | Alto (>0.5) | Alto |

---

## 10. Chat IA con Gemini

### 10.1 Flujo de Comunicación

```
POST /api/ai/institutional-chat { message, ticker, price }
  → 202 Accepted { responseId, pollingUrl }
  → Backend inicia llamada async a Gemini 2.5 Flash
  → GET /api/ai/institutional-chat/poll/{responseId}
  → 200 { status: "completed", response: "...", context: {...} }
     o 200 { status: "processing" }
     o 200 { status: "unavailable", error: "..." }
```

### 10.2 Contexto Enviado a Gemini

```typescript
{
  ticker: "AAPL",
  currentPrice: 150,
  institutionalOwnership: 62.3%,  // fundsOwnershipPct
  netFlows: "+$1,300,000",       // inflows - outflows
  openPositions: 2247,
  period: "daily",
  horizon: "medium"
}
```

### 10.3 System Prompt

El system prompt instruye a Gemini a:
1. Analizar el ticker solicitado y su contexto institucional
2. Responder preguntas sobre cobertura, riesgo y estrategias
3. Proporcionar análisis de escenarios (alcista, bajista, neutral)
4. Mencionar fuentes de datos relevantes
5. Advertir si los datos están desactualizados

### 10.4 Degradación

- Sin `GEMINI_API_KEY` → `status: "unavailable"` con sugerencia de configuración
- Timeout (30s) → `status: "unavailable"`
- Error de API → `status: "unavailable"`

---

## 11. API — Endpoints REST

### 11.1 Análisis Institucional

```
GET /api/institutional/analysis
Params: ?ticker=AAPL&period=daily&horizon=medium
Response 200:
{
  request: { ticker, period, horizon },
  zones: {
    support: [{ price, strength, confidence, touches, ... }],
    resistance: [{ price, strength, confidence, touches, ... }]
  },
  trends: {
    currentTrend: "bullish" | "bearish" | "neutral",
    trendStrength: number,
    crossover: { type: "golden_cross" | "death_cross" | "none", ... },
    movingAverages: [{ period, value, slope, rising }],
    continuityProbability: { probability, factors },
    volumeCorrelation: { ... }
  },
  metrics: { zoneCount, currentPrice, candlesAnalyzed },
  catalystWindows: [{ type, date, label, daysUntil, ... }],
  sourceReports: [{ sourceId, status, latencyMs, ... }],
  generatedAt: ISO timestamp
}
Response 503: { error: "All sources failed", overallStatus: "all_failed" }
```

### 11.2 Posiciones Regulatorias

```
GET /api/institutional/positions
Params: ?ticker=AAPL&period=daily&horizon=medium
Response 200:
{
  request: { ticker, period, horizon },
  positions13F: [{ issuer, cusip, value, shares, weight, change, ... }],
  flows: { inflows, outflows, netFlow, asOf },
  sourceReports: [{ sourceId, status, cacheHit, latencyMs, ... }],
  cacheHit: boolean,
  usedSourceIds: string[],
  overallStatus: "ok" | "partial" | "all_failed"
}
```

### 11.3 Simulación de Cobertura

```
POST /api/coverage/analyze
Body:
{
  ticker: "AAPL",
  underlyingPrice: 150,
  shares: 100,
  strikes: [140, 150, 160],
  capital: 15000,
  riskTolerancePct: 0.3
}
Response 200:
{
  results: [{
    strategyKind: "protective_put" | "married_put" | "collar_put" | "covered_straddle",
    ticker, shares, currentPrice,
    payoff: { baselinePrice, breakevenPrice, maxProfit, maxLoss, points: [{price, pnl}] },
    riskMetrics: { riskProfile, maxProtection, netPremium, ... },
    alerts: [{ code, severity, message, ... }],
    simulation: { monteCarlo: { expectedPnL, winRate, ... }, backtest }
  }],
  comparison: {
    entries: [{ rank, strategyKind, score: { total, riskScore, returnScore, ... } }],
    recommendedKind: "protective_put",
    multiCoreContext: { executionMode: "serial" }
  }
}
```

### 11.4 Chat IA

```
POST /api/ai/institutional-chat
Body: { message: "¿Cuál es la mejor cobertura?", ticker: "AAPL", price: 150 }
Response 202:
{ responseId: "abc-123", pollingUrl: "/api/ai/institutional-chat/poll/abc-123" }

GET /api/ai/institutional-chat/poll/abc-123
Response 200 (processing):
{ status: "processing" }

Response 200 (completed):
{
  status: "completed",
  response: "Para AAPL a $150, recomiendo...",
  context: { ticker, price, institutionalData: {...} }
}

Response 200 (unavailable):
{ status: "unavailable", error: "GEMINI_API_KEY no configurada" }
```

---

## 12. Tests

### 12.1 Resumen

| Tipo | Suites | Tests | Estado |
|------|--------|-------|--------|
| Unitarios - Institutional | 9 | ~55 | ✅ Pasando |
| Unitarios - Coverage | 4 | ~15 | ✅ Pasando |
| Unitarios - Resilience | 3 | ~15 | ✅ Pasando |
| Unitarios - Contracts | 1 | ~3 | ✅ Pasando |
| Integración - Institutional | 3 | ~20 | ✅ Pasando |
| **Total** | **~20** | **~158** | **✅ 0 fallos** |

### 12.2 Comando para Ejecutar Tests

```bash
# Todos los tests del backend
cd projects/rest-api/inversions_api
npx vitest run

# Tests con watch mode (desarrollo)
npx vitest

# Tests específicos
npx vitest run tests/unit/institutional/  # Solo institucionales
npx vitest run tests/unit/strategies/      # Solo coberturas
npx vitest run tests/integration/          # Solo integración

# TypeScript check
cd projects/rest-api/inversions_api
npx tsc --noEmit

# Frontend type check (si hay errores verificar tsconfig)
cd projects/pwa/inversions_app
npx tsc --noEmit
```

### 12.3 Archivos de Test

| Archivo | Lo que prueba |
|---------|---------------|
| `tests/unit/institutional/institutionalContract.test.ts` | Validación del contrato Zod |
| `tests/unit/institutional/institutionalZonesEngine.test.ts` | Detección de zonas S/R con 7 velas |
| `tests/unit/institutional/institutionalTrendEngine.test.ts` | MAs, crossovers, tendencia, 12 casos |
| `tests/unit/institutional/expirationAnalysisEngine.test.ts` | OpEx, Triple Witching, catalysts, slippery slope |
| `tests/unit/institutional/yahooOptionsParser.test.ts` | 6 casos: nominal, fallback, HTTP error, unusual volume, exception |
| `tests/unit/institutional/yahooInstitutionalParser.test.ts` | 5 casos: nominal, empty, HTTP error, net flows, fallback |
| `tests/unit/institutional/institutionalDataService.test.ts` | Degradación gradual: ok/partial/all_failed |
| `tests/unit/strategies/coverage/protectivePutEngine.test.ts` | Payoff, risk metrics, stop-loss alert |
| `tests/unit/strategies/coverage/collarEngine.test.ts` | Capped payoff, ceiling/floor, target move alert |
| `tests/unit/strategies/coverage/coveredStraddleEngine.test.ts` | Unlimited risk, margin, stress alert |
| `tests/unit/strategies/coverage/coverageComparator.test.ts` | Ranking de 4 estrategias, recomendación |
| `tests/unit/resilience/retryWithBackoff.test.ts` | 7 casos: éxito, retry, throw, maxAttempts, defaults, jitter, maxMs |
| `tests/unit/resilience/staleInput.test.ts` | 8 casos: stale/not stale, custom threshold, future, callbacks |
| `tests/unit/resilience/partialDataHandler.test.ts` | 6 casos: empty, merge, undefined, null, defaults |
| `tests/integration/institutional/institutionalDataService.test.ts` | 14 casos: orchestration completa con 4 fuentes |
| `tests/integration/institutional/institutionalAnalysis.test.ts` | Ruta /analysis con mock de bootstrap |
| `tests/integration/institutional/regulatoryPositions.test.ts` | Ruta /positions con mock de bootstrap |

---

## 13. Cómo Probar el Proyecto

### 13.1 Prerrequisitos

- Node.js 20+ (recomendado: 22)
- npm 10+
- Git
- (Opcional) Gemini API key para chat IA

### 13.2 Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd inversions-TEAM05

# Instalar dependencias (monorepo npm workspaces)
npm install

# (Opcional) Configurar Gemini API key
echo "GEMINI_API_KEY=tu-api-key-aqui" > .env
```

### 13.3 Arrancar el Proyecto

```bash
# Terminal 1 — Backend (puerto 3000)
cd projects/rest-api/inversions_api
npm run dev

# Terminal 2 — Frontend (puerto 5173)
cd projects/pwa/inversions_app
npm run dev
```

El frontend en `http://localhost:5173` tiene un proxy Vite que redirige `/api/*` → `http://localhost:3000`.

### 13.4 Probar el Backend Directamente

```bash
# Health check
curl http://localhost:3000/health

# Análisis institucional
curl "http://localhost:3000/api/institutional/analysis?ticker=AAPL&period=daily&horizon=medium"

# Posiciones regulatorias
curl "http://localhost:3000/api/institutional/positions?ticker=MSFT&period=weekly&horizon=long"

# Simulación de cobertura
curl -X POST http://localhost:3000/api/coverage/analyze \
  -H "Content-Type: application/json" \
  -d '{"ticker":"SPY","underlyingPrice":450,"shares":100,"strikes":[440,450,460],"capital":45000,"riskTolerancePct":0.3}'

# Chat IA (requiere GEMINI_API_KEY)
curl -X POST http://localhost:3000/api/ai/institutional-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"¿Cuál es el mejor collar para SPY?","ticker":"SPY","price":450}'
```

### 13.5 Probar el Frontend

Abre `http://localhost:5173` y navega:

| Ruta | Página | Qué probar |
|------|--------|------------|
| `/` | Dashboard | Sidebar visible con enlaces |
| `/institutional/analysis` | Análisis | Buscar AAPL weekly long → ver zonas S/R, tendencia, source reports |
| `/institutional/positions` | Posiciones | Buscar SPY quarterly medium → ver tabla 13F, flujos |
| `/coverage/strategies` | Coberturas | Ticker SPY, precio 450, acciones 100, strikes 440,450,460 → ver 4 tarjetas con payoff |
| `/ai/chat` | Chat IA | Ticker SPY, precio 450, preguntar sobre cobertura |

### 13.6 Probar Degradación

Para probar la degradación gradual, puedes:
1. Desconectarte de internet
2. Hacer una solicitud de análisis → debe retornar `overallStatus: "all_failed"` con HTTP 503
3. Con una fuente caída y otras funcionando → `overallStatus: "partial"`

---

## 14. Glosario

| Término | Definición |
|---------|------------|
| **13F** | Reporte trimestral que los gestores de inversiones institucionales deben presentar a la SEC |
| **Collar** | Estrategia que combina una put comprada (protección) con una call vendida (financiamiento) |
| **Crossover** | Cruce de dos promedios móviles (golden cross = alcista, death cross = bajista) |
| **Crumb** | Token de autenticación requerido por las APIs no oficiales de Yahoo Finance |
| **CUSIP** | Identificador único de 9 caracteres para valores financieros (acciones, bonos) |
| **FINRA** | Autoridad Reguladora de la Industria Financiera de EE.UU. |
| **FOMC** | Comité Federal de Mercado Abierto — define la política monetaria de EE.UU. |
| **Gamma Exposure** | Sensibilidad del delta de una opción a cambios en el precio del subyacente |
| **Monte Carlo** | Simulación que genera miles de escenarios aleatorios para estimar distribución de resultados |
| **OHLC** | Open, High, Low, Close — precios de apertura, máximo, mínimo y cierre de una vela |
| **OpEx** | Options Expiration — día de expiración de opciones (tercer viernes del mes) |
| **Payoff** | Gráfico que muestra la ganancia/pérdida de una estrategia a diferentes precios |
| **Protective Put** | Compra de una put para proteger una posición larga existente |
| **SEC** | Securities and Exchange Commission — regulador del mercado de valores de EE.UU. |
| **Slippery Slope** | Análisis de skew (inclinación) entre calls y puts basado en flujo institucional |
| **Theta** | Tasa de decaimiento temporal de una opción (pierde valor con el tiempo) |
| **Triple Witching** | Expiración simultánea de futuros sobre índices, opciones sobre índices y opciones sobre futuros |
| **Vanna** | Sensibilidad del delta de una opción a cambios en la volatilidad implícita |
| **Zones S/R** | Zonas de soporte (precio donde la demanda es fuerte) y resistencia (precio donde la oferta es fuerte) |

---

> **Documentación generada para TEAM-05 "TurboPapus"**  
> Proyecto: Plataforma de Inversiones con IA — Módulo de Cobertura Institucional  
> Mayo 2026
