# Data Retention México — Diana Inversiones Knowledge

> **ID**: INV-C-002  
> **Generado**: 2026-04-27  
> **Scope**: project — diana-inversions  
> **Estado**: 🟢 Completo  
> **Referencia**: Clarificación 2026-04-27 (365 días)

## Contexto

Retención de datos de operaciones: **365 días mínimo**.
Marco regulatorio: LFPDPPP (Ley Federal de Protección de Datos Personales en Posesión de los Particulares).

## TL;DR

La política mínima operativa es retener trazas de trading y eventos críticos por 365 días.  
Debe existir separación entre datos operativos, auditoría y analítica para facilitar cumplimiento y borrado controlado.  
Toda eliminación debe ser verificable y auditable.

## Política de Retención

- Mínimo obligatorio: 365 días desde creación del registro.
- Aplicable a: órdenes, ejecuciones, posiciones históricas, eventos de IA relacionados con trading, logs de seguridad.
- Excepciones legales: si una obligación normativa requiere mayor retención, prevalece la norma aplicable.

## Clasificación de Datos

- Datos operativos de trading: alta criticidad.
- Datos personales de perfil: criticidad alta por privacidad.
- Logs de observabilidad: criticidad media, anonimizar cuando sea posible.
- Datos analíticos agregados: baja criticidad si están despersonalizados.

## Borrado y Depuración

- Ejecutar job diario de elegibilidad por edad de registro.
- Aplicar soft-delete inicial para ventana de recuperación corta.
- Ejecutar hard-delete tras ventana de seguridad y sin bloqueo legal.
- Registrar evidencia de borrado (batch_id, timestamp, volumen).

## Derechos ARCO y Atención al Usuario

- Debe existir procedimiento para solicitudes de acceso/corrección/cancelación/oposición.
- Validar identidad del solicitante antes de exponer o modificar datos.
- Registrar SLA interno de respuesta y estado de cada solicitud.

## Seguridad y Control de Acceso

- Cifrado en reposo y en tránsito.
- RLS en Supabase para restringir acceso por usuario.
- Principio de mínimo privilegio para personal interno.
- Logging de accesos administrativos a datos sensibles.

## Auditoría

Eventos auditables mínimos:
- Creación/modificación/cancelación de orden.
- Cambio de estado de orden y causa.
- Acceso a datos sensibles por rol administrativo.
- Ejecución de jobs de borrado/retención.

## Contenido

```
/diana.knowledge topic="data-retention-mx" scope="project" type="local"
```
