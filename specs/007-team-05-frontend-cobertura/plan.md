# Implementation Plan: 007-team-05-frontend-cobertura

**Branch**: `007-team-05-frontend-cobertura` | **Date**: 2026-05-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/007-team-05-frontend-cobertura/spec.md`

## Summary

Construir la web PWA que consuma los 4 endpoints REST de análisis institucional, estrategias de cobertura y Chat IA provistos por la API backend (TEAM-05). Esto incluye routing SPA con React Router, state management con `useSyncExternalStore` para persistencia del chat IA (mismo patrón que `signals.ts`), manejo de errores y escenarios de degradación, gráficos interactivos con `lightweight-charts`, y el diseño de la UI respetando las variables CSS existentes en el proyecto.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18, HTML5, CSS Variables  
**Primary Dependencies**: Vite, React Router v6, lightweight-charts  
**Storage**: `useSyncExternalStore` (in-memory para chat session, mismo patrón que `signals.ts`)  
**Testing**: Vitest + React Testing Library (80% min coverage)  
**Target Platform**: Navegadores Desktop (Responsive) y PWA  
**Project Type**: Web Application / PWA frontend  
**Performance Goals**: Tiempo de carga inicial < 2s en entorno dev  
**Constraints**: fetch nativo (sin axios), degradación IA limpia, polling cada 2s máx 30s (15 intentos)  
**Scale/Scope**: 4 páginas nuevas (`/institutional/analysis`, `/institutional/positions`, `/coverage/strategies`, `/ai/chat`), 3 servicios API frontend, wrapper de layout

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Idioma Oficial**: El plan, spec, UI y documentación están especificados en español técnico.
- [x] **Modelo Semi-Automático**: IA no ejecuta operaciones, solo recomienda estrategias de cobertura. Las pre-alertas de indisponibilidad del modelo reflejan la soberanía humana al dar fallbacks manuales.
- [x] **PWA - Stack Base Obligatorio**: Vite, React, TypeScript.
- [x] **Backend - Stack Base Obligatorio**: Consumiendo una REST API en Node.js/Express.

## UX Architecture & Control Strategy

- **Target Experience**: SPA de gestión financiera ágil y sin recargas de página. Multi-tabs (análisis, posiciones, estrategias, chat IA local a la sesión).
- **Critical Controls**: 
  - `Selectors`: Dropdowns cerrados para `period` y `horizon` en vez de inputs de texto para ajustarse al contrato.
  - `Comparador de Estrategias`: Uso intensivo de visualización a través de graficado 2D real mediante `lightweight-charts`, no solo numérico.
  - `Polling Indicator`: Spinner y timer para requests asíncronas extendidas del LLM.
- **State Strategy**: 
  - `Server State`: Consumido por REST con `fetch` en capas de servicio.
  - `Client State`: Store con `useSyncExternalStore` para historial local del chat de IA (mismo patrón que `src/store/signals.ts`, evitando instalar librerías externas), en `src/store/chat.ts`.
- **Performance Boundaries**: Polling delimitado a (máximo) 15 intentos (30 segundos), evitando saturación de conexiones. Carga inicial ágil.

## Data Source Routing & Runtime Modes

- **Source Domains**: `Institutional Analysis`, `Coverage Strategies`, `AI Institutional Chat`.
- **Routing Rules**: Redirigido localmente como `/api` a `http://localhost:3000` vía Vite proxy.
- **Runtime Modes**: PWA development mode (`npm run dev`) / Production mode.
- **Credential/Account Strategy**: Reúso estricto del helper `getAuthHeaders()` usando `localStorage('inversions.dev.token')` o la variable de entorno `VITE_DEV_BEARER_TOKEN`.

## Real Data Sources

Además del frontend, esta feature integra **fuentes de datos reales** para los parsers institucionales que alimentan las páginas de análisis y posiciones.

### FINRA Short Interest — Caching de dataset completo

**Problema original**: El parser FINRA consultaba archivos `CNMSshvol{date}.txt` que ya no existen (404). La API de FINRA (`POST /data/group/otcmarket/name/consolidatedShortInterest`) retorna datos históricos desde 2019, pero solo 5000 registros por página.

**Solución**: Cache perezoso con carga completa del dataset:
- `ensureFinraCache()` en `realSourceParsers.ts` — carga hasta 6 páginas (×5000 registros) de la fecha más reciente
- Almacena en un `Map<string, FinraRecord[]>` a nivel de módulo
- Promise compartida para deduplicar inicios concurrentes
- **Eager preload** en `bootstrap.ts` — se dispara al arrancar el servidor sin bloquear
- Primer llamado: ~4.6s (carga todas las páginas). Llamados subsecuentes: ~0.06ms

**Graceful fallback**: Si un ticker no está en el dataset cachead, se retorna una observación sintética de baja confianza (0.3) con nota aclaratoria, en lugar de null (que mostraría error rojo en la UI).

### SEC EDGAR 13F — EFTS search + XML parsing

**Problema original**: El parser buscaba el 13F *de la propia empresa* via `submissions/CIK{cik}.json`. Las empresas no filing 13F — los filing son las *instituciones* que las poseen.

**Solución**: 
1. Buscar en EFTS (SEC Elasticsearch) filing 13F-HR que mencionen el ticker objetivo
2. Para los primeros 5 resultados, listar el directorio del filing y encontrar el XML con la tabla de holdings
3. Extraer las posiciones del ticker objetivo por `nameOfIssuer` o CUSIP
4. Paralelizar con `Promise.all` (3.4s vs 19s anterior)

### Yahoo Finance Options Flow — Reemplazo de Unusual Whales

**Problema original**: Unusual Whales requería API paga (~$50/mes) y no tenía parser real.

**Solución**: Usar la API gratuita de Yahoo Finance options chain para detectar actividad "unusual":
1. `fetchYahooOptions(ticker)` — obtiene cadena de opciones desde `query1.finance.yahoo.com/v7/finance/options/{ticker}`
2. `computeOptionsFlowSignal()` — identifica strikes donde volumen > 2× OI (señal de flujo inusual)
3. `parseYahooOptionsFlow()` — normaliza a `InstitutionalSourceObservation` con confidence basado en cantidad de señales detectadas
4. Registrado como source `yahoo-options-flow` con tier `free` en `bootstrap.ts`

### Yahoo Finance Institutional — Reemplazo de Finviz

**Problema original**: Finviz no tiene API pública oficial (solo scraping frágil). Su data de ownership era redundante con SEC EDGAR.

**Solución**: Usar la API gratuita de Yahoo Finance para datos institucionales:
1. `fetchYahooInstitutional(ticker)` — obtiene `quoteSummary.institutionOwnership` desde `query1.finance.yahoo.com/v10/finance/quoteSummary/{ticker}?modules=institutionOwnership`
2. `parseYahooInstitutional()` — extrae holders count, % held, change en shares → deriva inflows/outflows direccionales
3. Complementa a SEC EDGAR (que es quarterly) con datos más frecuentes
4. Registrado como source `yahoo-institutional` con tier `free` en `bootstrap.ts`

### Data Source Matrix

| Fuente | Tier | Estado | URL base | Implementada en |
|--------|------|--------|----------|-----------------|
| SEC EDGAR 13F | free | ✅ REAL | `https://efts.sec.gov` | T334 |
| FINRA Short Interest | free | ✅ REAL | `https://api.finra.org` | T333 |
| Yahoo Finance Options Flow | free | ✅ REAL | `https://query2.finance.yahoo.com/v7/finance/options` | T338 |
| Yahoo Finance Institutional | free | ✅ REAL | `https://query2.finance.yahoo.com/v10/finance/quoteSummary` | T339 |

> Unusual Whales y Finviz Institutional eliminados — reemplazados por Yahoo Finance (completado).

## Project Structure

### Documentation (this feature)
```text
specs/007-team-05-frontend-cobertura/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/
├── checklists/
└── tasks.md
```

### Source Code (repository root)

```text
projects/rest-api/inversions_api/src/
├── routes/
│   └── coverage/
│       └── coverageRouter.ts          # POST /api/coverage/analyze, /compare, /simulate

projects/pwa/inversions_app/
├── package.json
├── src/
│   ├── main.tsx
│   ├── layouts/
│   │   └── MainLayout.tsx
│   ├── pages/
│   │   ├── institutional/
│   │   │   ├── InstitutionalAnalysisPage.tsx
│   │   │   └── RegulatoryPositionsPage.tsx
│   │   ├── coverage/
│   │   │   └── CoverageStrategiesPage.tsx
│   │   └── ai/
│   │       └── AIChatPage.tsx
│   ├── services/
│   │   ├── institutional/
│   │   │   └── institutionalApi.ts
│   │   ├── coverage/
│   │   │   └── coverageApi.ts
│   │   └── ai/
│   │       └── aiChatApi.ts
│   ├── store/
│   │   └── chat.ts
│   └── components/
│       ├── coverage/
│       │   └── PayoffChart.tsx
│       └── ai/
│           ├── ChatHistory.tsx
│           └── ScenarioAnalysisCards.tsx
└── tests/
    ├── pages/
    ├── services/
    └── components/
```