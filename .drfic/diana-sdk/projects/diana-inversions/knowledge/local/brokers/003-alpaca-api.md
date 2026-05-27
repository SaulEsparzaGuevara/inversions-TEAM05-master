# Alpaca Trading API — Diana Inversiones Knowledge

> **ID**: INV-B-003  
> **Generado**: 2026-04-27  
> **Scope**: project — diana-inversions  
> **Estado**: 🟢 Completo

## TL;DR

Alpaca es broker secundario obligatorio en v1, útil para redundancia operativa y paper trading rápido.  
Su modelo REST + streaming simplifica integración inicial, pero requiere control explícito de cuotas y manejo de sesión por claves.  
Debe normalizarse al mismo contrato interno que IBKR para evitar lógica duplicada por broker.

## Autenticación y Entornos

- Credenciales por header: API key + secret.
- Separar claves paper y live por entorno.
- Nunca exponer claves en cliente; solo backend.

## Capacidades Relevantes para v1

- Órdenes: market y limit (alineado a alcance de producto).
- Cuenta y posiciones: lectura de salud operativa.
- Market data y trade updates por streaming.

## Endpoints y Flujos Base

- Crear orden: POST /v2/orders
- Cancelar orden: DELETE /v2/orders/{id}
- Consultar orden: GET /v2/orders/{id}
- Posiciones: GET /v2/positions
- Cuenta: GET /v2/account

## Mapeo de Estados

Estados Alpaca -> estado canónico interno:
- new/accepted -> SUBMITTED
- partially_filled -> PARTIALLY_FILLED
- filled -> FILLED
- canceled -> CANCELLED
- rejected/expired -> REJECTED
- api_error/timeouts -> FAILED

## Rate Limits y Gobernanza

- Respetar límites por minuto con bucket por usuario/endpoint.
- En 429: aplicar cooldown y retry con backoff.
- Evitar ráfagas por refresh de UI; usar cache + fan-out.

## Riesgos y Mitigaciones

- Drift de estado por eventos fuera de orden: resolver con secuencia temporal y reconciliación.
- Cambios de mercado fuera de horario: validar order acceptance policy.
- Fallas de red en confirmación: idempotency key para evitar doble orden.

## Buenas Prácticas

- Adaptador Alpaca desacoplado del dominio.
- Contratos compartidos con IBKR para órdenes/market data.
- Paper trading como prueba obligatoria antes de live.
- Logs estructurados con request_id interno y broker_order_id.

## Contenido

```
/diana.knowledge topic="alpaca-api" scope="project" type="local"
```
