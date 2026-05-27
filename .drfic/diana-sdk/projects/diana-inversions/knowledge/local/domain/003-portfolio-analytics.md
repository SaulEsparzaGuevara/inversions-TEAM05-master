# Portfolio Analytics — Diana Inversiones Knowledge

> **ID**: INV-D-003  
> **Generado**: 2026-04-27  
> **Scope**: project — diana-inversions  
> **Estado**: 🟢 Completo

## TL;DR

Este core consolida posiciones, operaciones y valuación para medir desempeño real del portafolio por activo, broker y estrategia.  
Debe separar claramente P&L realizado y no realizado, e incorporar costos (fees/slippage) para evitar sesgos optimistas.  
Las métricas deben ser auditables y reproducibles con corte temporal explícito.

## Entradas

- Posiciones actuales por broker.
- Historial de fills/órdenes ejecutadas.
- Mark-to-market (precio actual y precio de cierre previo).
- Comisiones, fees e impuestos estimados.
- FX rates cuando aplique conversión de moneda.

## Salidas Estandar

- total_equity
- cash_balance
- pnl_realized
- pnl_unrealized
- return_total_pct
- drawdown_max_pct
- sharpe_estimate
- exposure_by_asset
- exposure_by_broker
- exposure_by_strategy

## Cálculos Nucleares

- P&L realizado: suma de ganancias/pérdidas de posiciones cerradas netas de costos.
- P&L no realizado: (precio actual - precio promedio) * cantidad abierta.
- Retorno total: (equity_actual - equity_inicial + retiros - depósitos) / equity_inicial.
- Drawdown: caída desde máximo histórico de equity.
- Sharpe estimado: retorno excedente / volatilidad (ventana definida).

## Reglas de Calidad

- No mezclar costo promedio con FIFO sin indicarlo explícitamente.
- Incluir comisiones en todos los cálculos de rentabilidad.
- Definir timestamp de corte para snapshots analíticos.
- Validar conciliación diaria entre broker y base interna.

## Segmentación

- Por activo (symbol).
- Por clase (acciones/opciones).
- Por broker (IBKR/Alpaca).
- Por estrategia (spot, wheel, condor, etc).

## Frecuencia de Actualización

- Intradía: snapshots cada 30-60s para dashboard.
- Cierre de mercado: consolidación diaria oficial.
- Backfill histórico: job nocturno para consistencia.

## Retención y Auditoría

- Retener histórico mínimo 365 días.
- Versionar metodología de cálculo para trazabilidad.
- Guardar eventos de recálculo y reconciliación.

## Contenido

```
/diana.knowledge topic="portfolio-analytics" scope="project" type="local"
```
