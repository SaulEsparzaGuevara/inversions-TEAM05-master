# Quickstart: 008-team-05-cobertura-bugfix-visual

## Prerrequisitos

- Node.js ≥ 18
- Proyecto REST API clonado en `projects/rest-api/inversions_api/`
- Proyecto PWA clonado en `projects/pwa/inversions_app/`

## Verificación de Correcciones

```bash
# Verificar correcciones del módulo de cobertura
cd projects/rest-api/inversions_api
npx tsc --noEmit
npx vitest run tests/unit/strategies/coverage/

cd projects/pwa/inversions_app
npx tsc --noEmit
```

## Test Manual — Collar Crédito Neto

```bash
curl -X POST http://localhost:3000/api/coverage/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "SPY",
    "currentPrice": 450.50,
    "shares": 100,
    "strikes": [440, 450, 460],
    "capital": 45000,
    "riskTolerancePct": 0.10
  }'
```

Verificar en la respuesta del collar:
- `payoff.maxProfit` > 0 (no $0.00)
- `riskMetrics.protectionCeilingPrice` > 450.50 (no $441.48)
- `riskMetrics.stopLossPrice` ≈ putStrike * 0.95 (buffer 5%)

## Verificación Visual — PayoffChart

1. Abrir http://localhost:5173/coverage/strategies
2. Ingresar SPY, 450.50, 100 acciones, strikes 440/450/460
3. Verificar: eje X muestra "$225", "$360", "$428", "$473" (no "1970")
4. Hover sobre el chart cerca del break-even → tooltip "Break-even: $XXX.XX"

## Tests

```bash
cd projects/rest-api/inversions_api
npx vitest run tests/unit/strategies/coverage/
npx vitest run tests/unit/strategies/coverage/collarEngine.test.ts
npx vitest run tests/unit/strategies/coverage/protectivePutEngine.test.ts
```

## Archivos Modificados

```
projects/rest-api/inversions_api/src/modules/strategies/coverage/
├── collarEngine.ts               # T900, T901, T902, T905
├── protectivePutEngine.ts        # T903, T904
└── coveredStraddleEngine.ts      # T906

projects/pwa/inversions_app/src/components/charts/
└── PayoffChart.tsx               # T907, T908

projects/rest-api/inversions_api/tests/unit/strategies/coverage/
├── collarEngine.test.ts          # T909
└── protectivePutEngine.test.ts   # T910
```
