# Research: 006-team-05-institucional-cobertura

## Key Decisions

### Upstream Failure Degradation (Clarified 2026-05-22)

| Source | Behavior on failure |
|--------|---------------------|
| SEC EDGAR 13F | Skip source, include `sourceReports[].status = "error"` in response |
| FINRA Short Interest | Skip source, include `sourceReports[].status = "error"` in response |
| Yahoo Finance Options Flow | Skip source, include `sourceReports[].status = "error"` in response |
| Yahoo Finance Institutional | Skip source, include `sourceReports[].status = "error"` in response |
| All sources fail | Return HTTP 503 with `{"error":"all_sources_unavailable","sourceReports":[...]}` |

### Data Source Replacements

| Original | Replaced by | Rationale |
|----------|-------------|-----------|
| Unusual Whales (paid) | Yahoo Finance Options Flow (free) | API paga ~$50/mes → gratuita sin API key |
| Finviz Institutional (no API) | Yahoo Finance Institutional (free) | Finviz no tiene API oficial; scraping frágil |

### Source SLAs

| Source | Availability | Latency / Freshness | Key Limitation |
|--------|-------------|---------------------|----------------|
| SEC EDGAR 13F | ~99.5% | Batch daily, up to 24h delay | Rate limit ~10 req/min recommended |
| FINRA Short Interest | ~99.8% | Intraday, ~5-15m delay | 5000 records per page; pagination required |
| Yahoo Finance Options | ~99.5% | Near-realtime | No formal SLA; unannounced rate limits |
| Yahoo Finance Institutional | ~99.5% | Daily refresh | No formal SLA; unannounced rate limits |

### Architecture Decisions

- **Caching**: FINRA uses full-dataset lazy cache (6 pages × 5000 records, Map at module level). SEC and Yahoo use per-request TTL-based caching (configurable in source configs).
- **Graceful fallback**: If a ticker is not found in the FINRA cached dataset, return synthetic low-confidence (0.3) observation instead of null.
- **SEC parser optimization**: MAX_FILINGS = 5, no artificial delay, parallelized with Promise.all.
- **No persistence for analysis results**: Every analysis request is computed live from source data. Only audit traces (evidence, explanations) are persisted for 365 days.

### Coverage Strategy Parameters (MVP Defaults)

| Parameter | Default | Range |
|-----------|---------|-------|
| Strike selection | ATM ±5% | [ATM-20%, ATM+20%] |
| Tenor (tactical) | 7-90 days | ≥7 days |
| Tenor (strategic) | 91-365 days | ≤365 days |
| Premium budget | 0.5% per leg | Configurable in strategy_policy |
| Liquidity filter | ADV ≥ 100,000 or OI ≥ 500 | Configurable |
| Delta reduction target | ≥60% | Configurable |
