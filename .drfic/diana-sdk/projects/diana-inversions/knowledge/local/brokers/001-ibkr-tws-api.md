# IBKR TWS API — Diana Inversiones Knowledge

> **ID**: INV-B-001  
> **Generado**: 2026-04-27  
> **Scope**: project — diana-inversions  
> **Estado**: 🟢 Completo

## TL;DR

IBKR TWS API ofrece baja latencia y control fino para ejecución de órdenes, ideal como broker primario en este proyecto.  
Requiere operación de TWS/IB Gateway estable y una estrategia robusta de reconexión y reconciliación.  
Debe encapsularse detrás de un adaptador interno para no propagar complejidad del protocolo al resto del backend.

## TWS vs Client Portal

- TWS API: mejor para ejecución frecuente y streaming de mercado.
- Client Portal: útil para operaciones REST y casos de soporte, no ideal como canal principal de tiempo real.

## Conectividad y Sesión

- Requiere TWS o IB Gateway corriendo y autenticado.
- Conexión socket con clientId único por servicio.
- Verificar heartbeats y estado de sesión continuamente.

## Operaciones Críticas

- Place order: mapear order_id interno a permId/orderId de IBKR.
- Cancel order: idempotente, tolerante a orden ya ejecutada/cancelada.
- Market data request: suscripción y cancelación por símbolo.

## Mapeo de Estados

Estados IBKR deben mapearse a estado canónico interno:
- Submitted/PreSubmitted -> SUBMITTED
- Filled -> FILLED
- PartiallyFilled -> PARTIALLY_FILLED
- Cancelled -> CANCELLED
- ApiCancelled/Inactive/Error -> FAILED o REJECTED según causa

## Errores y Recuperación

- Clasificar errores en: validación, conectividad, sesión, mercado.
- Reintento automático solo para fallas transitorias de red.
- Siempre reconciliar órdenes abiertas tras reconexión.
- Persistir último checkpoint de órdenes para recovery.

## Riesgos Operativos

- Reinicio de TWS/IB Gateway rompe sesión si no hay watchdog.
- Desfase de relojes afecta trazabilidad temporal.
- Cambios de contratos (symbol/exchange/currency) pueden invalidar requests.

## Buenas Prácticas de Integración

- Adaptador único IBKR en backend.
- Cola de comandos con control de concurrencia.
- Telemetría por tipo de operación y error code IB.
- Sandbox/paper como ambiente obligatorio previo a live.

## Contenido

```
/diana.knowledge topic="ibkr-tws-api" scope="project" type="local"
```
