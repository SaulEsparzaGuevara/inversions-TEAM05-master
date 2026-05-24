# Order Lifecycle — Diana Inversiones Knowledge

> **ID**: INV-D-001  
> **Generado**: 2026-04-27  
> **Scope**: project — diana-inversions  
> **Estado**: 🟢 Completo

## TL;DR

El flujo de orden de este proyecto es de tipo human-in-the-loop: la IA sugiere, el usuario aprueba y el backend envía al broker.  
Solo se soportan Market y Limit en v1, con estados explícitos y trazabilidad para auditoría.  
Cuando el broker falla, la orden pasa a FAILED y requiere re-aprobación antes de reintento.

## Alcance v1

- Tipos de orden: MARKET, LIMIT.
- Brokers obligatorios: IBKR y Alpaca.
- Ejecución automática sin aprobación humana: fuera de alcance.

## Modelo de Estados

Estados canónicos:
- DRAFT: propuesta de orden creada por usuario o IA.
- PENDING_APPROVAL: pendiente de confirmación explícita del usuario.
- APPROVED: autorizada para envío al broker.
- SUBMITTED: aceptada por API de broker, pendiente ejecución.
- PARTIALLY_FILLED: ejecución parcial.
- FILLED: ejecución completa.
- CANCELLED: cancelada por usuario o broker.
- REJECTED: rechazada por reglas previas (riesgo/validación).
- FAILED: error técnico o de negocio en integración broker.

Transiciones mínimas válidas:
- DRAFT -> PENDING_APPROVAL
- PENDING_APPROVAL -> APPROVED | REJECTED | CANCELLED
- APPROVED -> SUBMITTED | FAILED
- SUBMITTED -> PARTIALLY_FILLED | FILLED | CANCELLED | FAILED
- PARTIALLY_FILLED -> FILLED | CANCELLED | FAILED
- FAILED -> PENDING_APPROVAL (solo con re-aprobación explícita)

## Reglas de Negocio Críticas

- Regla R1: toda orden sugerida por IA debe llegar a PENDING_APPROVAL.
- Regla R2: no enviar órdenes a broker sin APPROVED.
- Regla R3: una orden en FAILED no puede reenviarse directo; requiere regresar a PENDING_APPROVAL.
- Regla R4: registrar correlation_id para unir eventos frontend, backend y broker.
- Regla R5: los cambios de estado deben registrar actor (user_id/system/broker) y timestamp UTC.

## Validaciones Previas a Envío

- Símbolo válido y negociable para el broker seleccionado.
- Cantidad > 0 y dentro de límites de cuenta.
- Para LIMIT: limit_price > 0.
- Mercado abierto o política de orden fuera de horario explícita.
- Idempotency key presente para evitar doble envío accidental.

## Manejo de Fallas y Reintentos

- Error 4xx de broker: FAILED no reintentable automático.
- Error 5xx/red: FAILED con flag retryable=true, pero siempre con re-aprobación humana.
- Timeout de confirmación broker: estado intermedio SUBMITTED con reconciliación asíncrona.
- Reconciliación periódica: consultar estado remoto y corregir drift local.

## Rate Limiting y Throttling

- Aplicar control por usuario + endpoint de trading.
- Si se excede cuota: responder 429 con ventana de enfriamiento.
- Backoff exponencial en backend para errores transitorios del broker.

## Contratos Mínimos de Datos

- order_id (UUID interno)
- broker_order_id (nullable hasta SUBMITTED)
- user_id
- broker (IBKR|ALPACA)
- order_type (MARKET|LIMIT)
- side (BUY|SELL)
- symbol
- qty
- limit_price (nullable)
- status
- last_error_code (nullable)
- last_error_message (nullable)
- created_at, updated_at

## Criterios de Calidad

- Toda transición inválida debe rechazarse con código de dominio explícito.
- Debe existir auditoría completa de eventos por orden.
- Debe ser posible reconstruir la historia completa de una orden sin ambigüedad.
