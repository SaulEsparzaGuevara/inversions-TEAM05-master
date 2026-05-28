# Quickstart: 011-team-05-full-migration

## Prerrequisitos

- Node.js ≥ 18
- Git — rama `main` del repo principal (destino de la migración)
- Variables de entorno configuradas (ver Phase 8 de tasks.md)

## Orden de implementación recomendado

```
Backend (Phases 1-7) → Backend Tests (Phases 8-11) → Frontend (Phases 12-17)
```

Se puede avanzar el frontend en paralelo con Phases 5-7 del backend usando mocks.

## Setup backend

```bash
cd projects/rest-api/inversions_api
npm install
cp .env.example .env
# Editar .env: GEMINI_API_KEY=<tu key>

npx tsc --noEmit   # debe pasar sin errores
npx vitest run     # debe dar 32 passed (32), 158 passed (158)
npm run dev        # levanta en localhost:3000
```

## Setup frontend

```bash
cd projects/pwa/inversions_app
npm install
npx tsc --noEmit   # debe pasar sin errores
npx vitest run     # debe pasar todos los tests
npm run dev        # levanta en localhost:5173
```

## Smoke tests rápidos

```bash
# Backend: análisis institucional
curl "http://localhost:3000/api/institutional/analysis?ticker=SPY" \
  -H "Authorization: Bearer dev-bypass-token" | jq '.overallStatus'
# → "ok" o "partial"

# Backend: cobertura
curl -X POST http://localhost:3000/api/coverage/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-bypass-token" \
  -d '{"ticker":"AAPL","currentPrice":175,"shares":100}' | jq '.results | length'
# → 4 (protective_put, married_put, collar_put, covered_straddle)

# Backend: AI copilot
curl -X POST http://localhost:3000/api/ai/institutional-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-bypass-token" \
  -d '{"ticker":"AAPL","currentPrice":175,"zones":[],"question":"¿Cuál estrategia recomiendas?","userRole":"analyst"}' | jq '.status // "completed"'
# → "pending" (202 async) o campo narrative presente (200 sync)

# Backend: confluenceViewPresets
curl "http://localhost:3000/api/dashboard/confluence-columns" \
  -H "Authorization: Bearer dev-bypass-token" | jq '.columns | length'
# → número de columnas configuradas en Supabase
```

## Verificaciones críticas de bugfixes

```bash
# En Node REPL o test script:
# 1. normalCdf(0) debe ser ≈0.500
node -e "
  import('./src/modules/strategies/coverage/coverageTypes.js').then(m => {
    // normalCdf no se exporta directamente, verificar via estimateOptionPremium
    const result = m.estimateOptionPremium({underlyingPrice:100, strike:100, type:'call', daysToExpiry:30, impliedVol:0.20});
    console.log('ATM call premium (approx):', result);
    // debe ser un número positivo razonable (~2-5 para este caso)
  });
"

# 2. Collar: stopLossLowPrice y stopLossHighPrice presentes
curl -X POST http://localhost:3000/api/coverage/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-bypass-token" \
  -d '{"ticker":"SPY","currentPrice":450,"shares":100}' | \
  jq '.results[] | select(.strategyKind=="collar_put") | .riskMetrics | {stopLossPrice, stopLossLowPrice, stopLossHighPrice}'
# → ambos campos stopLossLowPrice y stopLossHighPrice deben estar presentes y ser distintos

# 3. TrendEngine determinístico: misma llamada → mismo resultado
curl "http://localhost:3000/api/institutional/analysis?ticker=AAPL" \
  -H "Authorization: Bearer dev-bypass-token" | jq '.trends.currentTrend'
# ejecutar 2 veces → misma dirección de tendencia

# 4. Sesgo estacional noviembre
# mes=11 → bias="bullish" (verificar en expirationAnalysisEngine directamente)
```

## Archivos de referencia en repo local TEAM-05

Los archivos fuente completos están en rama `emiliano`:

| Archivo fuente local | Destino en repo principal |
|---------------------|--------------------------|
| `projects/rest-api/inversions_api/src/modules/institutional/` | mismo path |
| `projects/rest-api/inversions_api/src/modules/strategies/coverage/` | mismo path |
| `projects/rest-api/inversions_api/src/modules/ai/` | mismo path |
| `projects/rest-api/inversions_api/src/routes/institutional/` | mismo path |
| `projects/rest-api/inversions_api/src/routes/coverage/` | mismo path |
| `projects/rest-api/inversions_api/src/routes/ai/` | mismo path |
| `projects/pwa/inversions_app/src/` | mismo path |

## Rutas frontend disponibles post-implementación

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | MainDashboard | Dashboard principal (existente) |
| `/institutional/analysis` | InstitutionalAnalysisPage | Análisis institucional con zonas S/R |
| `/institutional/positions` | RegulatoryPositionsPage | Tabla 13F y flujos |
| `/coverage/strategies` | CoverageStrategiesPage | Comparador de estrategias de cobertura |
| `/ai/chat` | AIChatPage | Chat IA con Gemini 2.5 Flash |

## Endpoints REST disponibles post-implementación

| Método | Ruta | Auth |
|--------|------|------|
| GET | `/api/institutional/analysis` | Bearer |
| GET | `/api/institutional/positions` | Bearer |
| POST | `/api/coverage/analyze` | Bearer |
| POST | `/api/coverage/compare` | Bearer |
| POST | `/api/coverage/simulate` | Bearer |
| POST | `/api/ai/institutional-chat` | Bearer |
| GET | `/api/ai/institutional-chat/poll/:id` | Bearer |
| GET | `/api/dashboard/confluence-columns` | Bearer |
