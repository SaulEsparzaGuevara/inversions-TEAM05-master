# Contract: Broker Adapter

## Proposito

Definir interfaz interna estable para integracion de brokers soportados en v1.

## Brokers Soportados

- `IBKR`
- `ALPACA`

## Capacidades Obligatorias

1. Validar conectividad y estado de sesion.
2. Consultar market data en formato normalizado.
3. Sincronizar cuenta/posiciones.
4. Preparar orden aprobada (`MARKET`/`LIMIT`).
5. Enviar orden solo si existe aprobacion humana valida.
6. Normalizar estados de ejecucion a contrato canonico.
7. Normalizar errores tecnicos/negocio para auditoria.

## Estado Canonico de Orden

- `SUBMITTED`
- `PARTIALLY_FILLED`
- `FILLED`
- `CANCELLED`
- `REJECTED`
- `FAILED`

## Errores Canonicos de API Operativa

### `409 ORDER_VERSION_STALE`

Se retorna cuando la version enviada por cliente no coincide con la version persistida.

Payload esperado:

```json
{
	"error": "order_version_stale",
	"code": "ORDER_VERSION_STALE",
	"details": {
		"clientVersion": 1,
		"serverVersion": 2,
		"message": "Another request updated this proposal. Please refresh and re-approve."
	}
}
```

### `429 RATE_LIMITED`

Se retorna cuando el usuario supera el umbral de solicitudes en endpoints sensibles de ejecucion.

Payload esperado:

```json
{
	"error": "rate_limited",
	"code": "RATE_LIMITED",
	"retryAfterSeconds": 120,
	"details": {
		"window": "60s",
		"threshold": 10,
		"cooldown": "120s"
	}
}
```

## Invariants

- El dominio nunca consume SDK/REST broker de forma directa.
- Cualquier timeout/error transitorio se registra como `FAILED` con metadata de retry.
- Un reintento requiere nueva aprobacion humana previa.
- Debe existir idempotency key por intento para evitar duplicados.
- En conflicto de concurrencia se debe rechazar con `409 ORDER_VERSION_STALE` y sin side-effects parciales.
- En limite de tasa se debe rechazar con `429 RATE_LIMITED` y `retryAfterSeconds` consistente.

## Resultado Minimo de Submission

- `proposal_id`
- `broker`
- `broker_order_id` (nullable en timeout)
- `status` (canonico)
- `error_code` (nullable)
- `error_message` (nullable)
- `occurred_at`
