# IBKR Client Portal API — Diana Inversiones Knowledge

> **ID**: INV-B-002  
> **Generado**: 2026-04-27  
> **Scope**: project — diana-inversions  
> **Estado**: 🟢 Completo

## TL;DR

IBKR Client Portal API es el canal REST de Interactive Brokers, útil para operaciones administrativas y ciertos flujos de trading con menor complejidad de socket.  
Depende de Client Portal Gateway y gestión de sesión activa; sin tickle periódico la sesión expira.  
En este proyecto funciona como complemento de TWS, no como sustituto para casos de baja latencia intensiva.

## Arquitectura y Dependencias

- Requiere Client Portal Gateway corriendo (proxy local/servicio dedicado).
- Flujo HTTP REST sobre sesión autenticada.
- Mantener sesión viva con endpoint de keepalive/tickle.

## Endpoints Clave (familias)

- Cuenta y contexto: `/iserver/accounts`, `/portfolio/accounts`
- Órdenes: `/iserver/account/{accountId}/orders`, `/iserver/reply/{replyId}`
- Market data snapshot: `/iserver/marketdata/snapshot`
- Salud de sesión: `/tickle`, `/iserver/auth/status`

## Gestión de Sesión

- Validar autenticación al iniciar y antes de operaciones sensibles.
- Ejecutar keepalive periódico.
- Si sesión caduca: bloquear envío de órdenes y disparar reautenticación controlada.

## Mapeo Operativo

- Orden interna APPROVED -> POST order CP API.
- Respuesta aceptada -> SUBMITTED.
- Error validación -> REJECTED.
- Error técnico/timeout -> FAILED con reconciliación posterior.

## Cuándo Usar Client Portal vs TWS

- Client Portal: flujos REST, simplicidad operativa, consultas y acciones administrativas.
- TWS: mejor para streaming y flujos de trading más exigentes en latencia.

## Limitaciones Relevantes

- Menor idoneidad para alta frecuencia.
- Dependencia fuerte de sesión viva.
- Posibles confirmaciones interactivas (reply flow) en ciertos escenarios.

## Hardening Recomendado

- Encapsular en adaptador específico de broker.
- Timeouts y retries acotados para endpoints idempotentes.
- Circuit breaker cuando gateway esté degradado.
- Logging estructurado con request_id y broker_order_id.

## Contenido

```
/diana.knowledge topic="ibkr-client-portal" scope="project" type="local"
```
