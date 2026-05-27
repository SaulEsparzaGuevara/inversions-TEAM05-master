# Quickstart: 009-team-05-institucional-migration

## Prerrequisitos

- Node.js ≥ 18
- Proyecto REST API clonado en `projects/rest-api/inversions_api/`
- Variables de entorno:
  - `EDGAR_USER_AGENT=TurboPapus/1.0 (contact@turbopapus.com)`
  - `GEMINI_API_KEY=<key>`

## Inicialización

```bash
cd projects/rest-api/inversions_api
npm install
npm run dev
```

La API arranca en `http://localhost:3000`.

## Endpoints completos

### 1. POST /api/institutional/analysis

```bash
curl -X POST http://localhost:3000/api/institutional/analysis \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"ticker":"AAPL","period":"daily","horizon":"medium"}'
```

### 2. POST /api/institutional/positions

```bash
curl -X POST http://localhost:3000/api/institutional/positions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"ticker":"AAPL","period":"daily","horizon":"medium"}'
```

### 3. POST /api/coverage/analyze

```bash
curl -X POST http://localhost:3000/api/coverage/analyze \
  -H "Content-Type: application/json" \
  -d '{"ticker":"SPY","currentPrice":450.50,"shares":100,"strikes":[440,450,460],"capital":45000,"riskTolerancePct":0.10}'
```

### 4. POST /api/coverage/simulate

```bash
curl -X POST http://localhost:3000/api/coverage/simulate \
  -H "Content-Type: application/json" \
  -d '{"ticker":"SPY","currentPrice":450.50,"shares":100,"strikes":[440],"capital":45000,"riskTolerancePct":0.10}'
```

### 5. POST /api/coverage/compare

```bash
curl -X POST http://localhost:3000/api/coverage/compare \
  -H "Content-Type: application/json" \
  -d '{"ticker":"SPY","currentPrice":450.50,"shares":100,"strikes":[440,450,460],"capital":45000,"riskTolerancePct":0.10,"horizon":"medium"}'
```

### 6. POST /api/ai/institutional-chat

```bash
curl -X POST http://localhost:3000/api/ai/institutional-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"ticker":"AAPL","currentPrice":192.25,"zones":{"all":[],"support":[],"resistance":[]},"question":"¿Qué riesgo tiene esta posición?","userRole":"analyst"}'
```

### 7. GET /api/ai/institutional-chat/poll/:responseId

```bash
curl http://localhost:3000/api/ai/institutional-chat/poll/<responseId> \
  -H "Authorization: Bearer <token>"
```

### Ejemplo Collar Crédito Neto

```bash
curl -X POST http://localhost:3000/api/coverage/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "ticker":"SPY",
    "currentPrice":450.50,
    "shares":100,
    "strikes":[440,460],
    "capital":45000,
    "riskTolerancePct":0.10,
    "expiryDays":90
  }'
```

Respuesta esperada (collar crédito neto):
```json
{
  "results": [
    {
      "kind": "collar_put",
      "riskMetrics": {
        "maxProfit": 1002,
        "maxLoss": 50,
        "protectionCeilingPrice": 468.52,
        "protectionFloorPrice": 440
      }
    }
  ]
}
```

## Tests

```bash
cd projects/rest-api/inversions_api
npm run test
npm run lint
```

## Verificación de implementación

```bash
# Verificar que todos los módulos compilan
npx tsc --noEmit

# Verificar que las rutas responden
curl -X POST http://localhost:3000/api/coverage/analyze \
  -H "Content-Type: application/json" \
  -d '{"ticker":"SPY","currentPrice":450.50,"shares":100,"strikes":[440,450,460],"capital":45000,"riskTolerancePct":0.10}'

# Verificar collar crédito neto (payoff.maxProfit debe ser > 0)
# Verificar eje X del PayoffChart (debe mostrar precios, no "1970")
```

## Estructura de directorios (código a migrar)

```
projects/rest-api/inversions_api/src/
├── modules/
│   ├── institutional/
│   │   ├── institutionalContract.ts          # Interfaces y tipos
│   │   ├── institutionalDataService.ts        # Integración con fuentes
│   │   ├── realSourceParsers.ts               # Parsers SEC, FINRA
│   │   ├── yahooCrumbSession.ts               # Sesión Yahoo compartida
│   │   ├── yahooOptionsParser.ts              # Parser Yahoo Options v7
│   │   ├── yahooInstitutionalParser.ts        # Parser Yahoo Institutional v10
│   │   ├── institutionalZonesEngine.ts        # Motor de zonas S/R
│   │   ├── institutionalTrendEngine.ts        # Motor de tendencias
│   │   └── expirationAnalysisEngine.ts        # Análisis de vencimientos
│   ├── strategies/coverage/
│   │   ├── coverageStrategyContract.ts        # Contrato base
│   │   ├── coverageTypes.ts                   # Tipos y estimateOptionPremium
│   │   ├── protectivePutEngine.ts             # Motor Protective Put
│   │   ├── collarEngine.ts                    # Motor Collar Put
│   │   ├── coveredStraddleEngine.ts           # Motor Covered Straddle
│   │   ├── coverageSimulationEngine.ts        # Simulación Monte Carlo
│   │   ├── coverageRiskService.ts             # Servicio de alertas/riesgo
│   │   ├── coverageReportService.ts           # Reporting
│   │   └── coverageComparator.ts              # Comparador de estrategias
│   └── ai/
│       └── institutionalCopilotChat.ts        # Chat IA (Gemini 2.5 Flash)
├── routes/
│   ├── institutional/
│   │   ├── bootstrap.ts                       # Config de fuentes
│   │   ├── institutionalAnalysis.ts           # POST /api/institutional/analysis
│   │   └── regulatoryPositions.ts             # POST /api/institutional/positions
│   ├── coverage/
│   │   ├── analyze.ts                         # POST /api/coverage/analyze
│   │   ├── simulate.ts                        # POST /api/coverage/simulate
│   │   └── compare.ts                         # POST /api/coverage/compare
│   └── ai/
│       └── institutionalCopilot.ts            # POST /api/ai/institutional-chat
```
