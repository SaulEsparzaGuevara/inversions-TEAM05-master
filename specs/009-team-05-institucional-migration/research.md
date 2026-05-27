# Research: 009-team-05-institucional-migration

## Key Decisions

### Source Data Architecture (As-Is 2026-05-26)

Las 4 fuentes reales implementadas y sus características:

| Fuente | Tipo | Frecuencia | Delay | Rate Limit |
|--------|------|------------|-------|------------|
| SEC EDGAR 13F | Batch diario | Diaria | Hasta 24h | ~10 req/min |
| FINRA Short Interest | Intradiario | Intradiario | ~5-15min | Paginación 6×5000 registros |
| Yahoo Finance Options v7 | Near-realtime | Tiempo real | Ninguno | Sin API key, requiere crumb |
| Yahoo Finance Institutional v10 | Near-realtime | Refresh diario | Ninguno | Sin API key, requiere crumb |

### Source Error Code Standardization

| Código | Significado | Cuándo ocurre |
|--------|-------------|---------------|
| `HTTP_ERROR` | Error HTTP de la fuente (status ≠ 2xx) | SEC, FINRA, Yahoo responden con error |
| `TIMEOUT` | Timeout de red / aborto por tiempo | Fuente no respondió en 12s |
| `RATE_LIMITED` | Límite de tasa excedido | >10 req/min a SEC, rate limits de Yahoo |
| `EMPTY_RESPONSE` | Parser retornó null sin datos utilizables | SEC no encuentra filings, ticker no en CUSIP map |
| `PARSE_ERROR` | Error en parsing del payload | XML malformado, JSON inesperado |

### Confidence Scale

- `confidence` se expresa en rango decimal [0.00, 1.00] en todos los endpoints
- El frontend multiplica por 100 para display porcentual
- Ninguna fuente o servicio retorna valores en escala 0-100
- Verificado contra: `computeConfidence()` retorna 0.55–0.95, contrato `observation.confidence` validado como `[0, 1]`
- Máximo global: 0.95 (nunca 1.0)

### Parallel Fetch Architecture (Phase 8)

- `resolve()` usa `Promise.allSettled` para ejecutar 4 fuentes en paralelo
- Routes comparten un solo `preResolvedResult` entre múltiples engines
- `yahooCrumbSession` compartida entre `yahooOptionsParser` y `yahooInstitutionalParser`
- Resultado: latencia ~10-20s vs ~30-90s secuencial

### Coverage Engine Sign Convention (Collar)

- `netPremiumPerShare = putPremium - callPremium`
- Débito neto (put>call): valor positivo
- Crédito neto (call>put): valor negativo
- `maxProfit` y `protectionCeilingPrice` usan − `netPremiumPerShare`
- `maxLoss` y `protectionFloorPrice` usan + `netPremiumPerShare`
- Convención ya implementada y corregida en spec 008

### Monte Carlo Iterations Tradeoff

- 256 iteraciones default: adecuado para demo/visualización rápida
- Mínimo 10,000 para producción con VaR/ES estadísticamente robustos
- `monteCarloIterations=0`: skip total para payoff-only instantáneo

### Coverage Strategy Default Values (Routes)

| Parámetro | Default | Descripción |
|-----------|---------|-------------|
| `price` | 450 | Precio del subyacente |
| `expiry` | 90d | Días a vencimiento |
| `shares` | 100 | Cantidad de acciones |
| `capital` | 100000 | Capital disponible |
| `risk` | 5% | Tolerancia al riesgo |
| `putStrike` | 95% × price | Strike del put |
| `callStrike` | 105% × price | Strike del call |
| `IV` | 0.25 | Volatilidad implícita |
| `DTE` | 90 | Días a vencimiento |

### Source Replacements (Histórico)

| Original | Reemplazada por | Razón |
|----------|-----------------|-------|
| Unusual Whales (paid) | Yahoo Finance Options Flow (free) | API paga ~$50/mes → gratuita sin API key |
| Finviz Institutional (no API) | Yahoo Finance Institutional (free) | Finviz no tiene API oficial; scraping frágil |

### Caching Strategy

| Fuente | Tipo de Cache | TTL | Persistencia |
|--------|--------------|-----|-------------|
| SEC EDGAR 13F | Map en módulo (searchEftsCache) | 24h (86400000ms) | En memoria |
| FINRA Short Interest | Module-level Map + disco | 24h (86400000ms) | `/tmp/inversions-api-finra-cache.json` |
| Yahoo Crumb Session | Singleton | 15min (900000ms) | En memoria |
| InstitutionalDataService | LRU cache | 5min (300000ms) | En memoria |

### FINRA Cache File Format

```json
{
  "fetchedAt": "2026-05-26T12:00:00.000Z",
  "records": [
    {
      "symbol": "AAPL",
      "currentShort": 12345678,
      "prevShort": 12000000,
      "avgDailyVol": 50000000,
      "daysToCover": 1.2,
      "changePct": 2.88,
      "settleDate": "2026-05-23",
      "dateStr": "2026-05-26"
    }
  ]
}
```
