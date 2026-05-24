# Quickstart: 006-team-05-institucional-cobertura

## Prerrequisitos

- Node.js ≥ 18
- Proyecto REST API clonado en `projects/rest-api/inversions_api/`

## Inicialización

```bash
cd projects/rest-api/inversions_api
npm install
npm run dev
```

La API arranca en `http://localhost:3000`.

## Endpoints

### Institutional Analysis

```bash
curl -X POST http://localhost:3000/api/institutional/analysis \
  -H "Content-Type: application/json" \
  -d '{"ticker":"AAPL","period":"daily","horizon":"medium"}'
```

### Regulatory Positions

```bash
curl -X POST http://localhost:3000/api/institutional/positions \
  -H "Content-Type: application/json" \
  -d '{"ticker":"AAPL","period":"daily","horizon":"medium"}'
```

### Coverage Strategy Analysis

```bash
curl -X POST http://localhost:3000/api/coverage/analyze \
  -H "Content-Type: application/json" \
  -d '{"ticker":"AAPL","currentPrice":192.25,"shares":100,"strikes":[180,185,190,200,210],"capital":20000,"riskTolerancePct":0.1}'
```

### Coverage Compare

```bash
curl -X POST http://localhost:3000/api/coverage/compare \
  -H "Content-Type: application/json" \
  -d '{"ticker":"AAPL","currentPrice":192.25,"shares":100,"strikes":[180,185,190,200,210],"capital":20000,"riskTolerancePct":0.1,"horizon":"medium"}'
```

### AI Chat

```bash
curl -X POST http://localhost:3000/api/ai/institutional-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"ticker":"AAPL","currentPrice":192.25,"zones":{"all":[],"support":[],"resistance":[]},"question":"¿Qué riesgo tiene esta posición?","userRole":"analyst"}'
```

## Tests

```bash
cd projects/rest-api/inversions_api
npm run test
npm run lint
```

## Estructura de directorios (código)

```
projects/rest-api/inversions_api/src/
├── modules/
│   ├── institutional/
│   │   ├── institutionalContract.ts      # Interfaces y tipos
│   │   ├── institutionalDataService.ts    # Integración con fuentes
│   │   ├── institutionalZonesEngine.ts    # Motor de zonas S/R
│   │   ├── institutionalTrendEngine.ts    # Motor de tendencias
│   │   ├── expirationAnalysisEngine.ts   # Análisis de vencimientos
│   │   └── realSourceParsers.ts          # Parsers reales (SEC, FINRA, Yahoo)
│   ├── strategies/coverage/
│   │   ├── coverageStrategyContract.ts   # Contrato base
│   │   ├── protectivePutEngine.ts        # Motor Protective Put
│   │   ├── collarEngine.ts               # Motor Collar Put
│   │   ├── coveredStraddleEngine.ts      # Motor Covered Straddle
│   │   ├── coverageSimulationEngine.ts   # Simulación Monte Carlo
│   │   ├── coverageComparator.ts         # Comparador de estrategias
│   │   ├── coverageRiskService.ts        # Servicio de alertas/riesgo
│   │   └── coverageReportService.ts      # Reporting
│   └── ai/
│       └── institutionalCopilotChat.ts   # Chat IA explicativo
├── routes/
│   ├── institutional/
│   │   ├── bootstrap.ts                  # Config y mock (a eliminar en T340)
│   │   ├── institutionalAnalysis.ts      # GET /api/institutional/analysis
│   │   └── regulatoryPositions.ts        # GET /api/institutional/positions
│   ├── coverage/
│   │   └── coverageRouter.ts             # POST /api/coverage/*
│   └── ai/
│       └── institutionalChat.ts          # POST /api/ai/institutional-chat
└── db/
    └── migrations/                       # Esquemas de persistencia
```
