# Data Model: 008-team-05-cobertura-bugfix-visual

## Cambios al Modelo de Datos

Esta spec no introduce nuevas entidades ni modifica contratos públicos. Solo se documentan los cambios internos en campos calculados de los engines de cobertura.

### Cambios en RiskMetrics (collarEngine output)

| Campo | Tipo | Antes | Después | Nota |
|-------|------|-------|---------|------|
| maxProfit | number | Incorrecto en crédito neto | Correcto con `- netPremiumPerShare` | Bug T900 |
| protectionCeilingPrice | number | Incorrecto en crédito neto | Correcto con `- netPremiumPerShare` | Bug T901 |
| exerciseRiskScore | number [0,1] | Pesos 0.6+0.6 (rango hasta 1.2 pre-clamp) | Pesos 0.5+0.5 (rango hasta 1.0) | Bug T905 |
| stopLossPrice | number | putStrike * 0.97 (hardcoded) | putStrike * (1 - buffer dinámico) | Bug T904 |

### Sin cambios en interfaces TypeScript públicas

- No se modificaron tipos en `coverageTypes.ts`.
- No se modificaron interfaces en `coverageStrategyContract.ts`.
- No se modificaron contratos JSON (`strategy.v1.json`, etc.).

### Sin cambios en entidades de persistencia

- No se agregaron ni modificaron tablas de base de datos.
- No se agregaron ni modificaron migraciones.
