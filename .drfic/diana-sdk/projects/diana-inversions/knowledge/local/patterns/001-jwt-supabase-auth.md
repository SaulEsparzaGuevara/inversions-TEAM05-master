# JWT + Supabase Auth — Diana Inversiones Knowledge

> **ID**: INV-P-001  
> **Generado**: 2026-04-27  
> **Scope**: project — diana-inversions  
> **Estado**: 🟢 Completo  
> **Referencia**: Clarificación auth 2026-04-27 (JWT Bearer)

## TL;DR

El backend debe validar JWT Bearer emitido por Supabase en cada endpoint protegido.  
El frontend debe manejar sesión y refresh de forma segura sin exponer tokens en almacenamiento inseguro.  
La autorización fina debe apoyarse en RLS y claims del token.

## Flujo de Referencia

1. Usuario inicia sesión en frontend con Supabase Auth.
2. Supabase emite access token JWT + refresh token.
3. Cliente envía Authorization: Bearer <token> al backend.
4. Backend valida firma, expiración y claims relevantes.
5. Backend aplica autorización por recurso y user_id.

## Reglas de Seguridad

- No usar localStorage para tokens sensibles.
- Preferir almacenamiento en memoria + refresh controlado.
- Rotar tokens al renovar sesión.
- Rechazar tokens expirados sin excepción.

## Middleware Backend (Express)

Debe hacer:
- Parse de header Bearer.
- Verificación JWT con issuer/audience correctos.
- Inyección de contexto auth en request (user_id, roles, claims).
- Respuesta 401 para token inválido/expirado.
- Respuesta 403 para token válido sin permiso.

## RLS y Políticas de Datos

- Tablas con owner_id/user_id deben usar política por identidad.
- Evitar bypass de RLS desde rutas públicas.
- Accesos administrativos solo con rol explícito y auditado.

## Manejo de Sesión en Frontend

- Interceptor HTTP para adjuntar token.
- En 401: intentar refresh una vez; si falla, forzar re-login.
- Evitar bucles infinitos de refresh.
- Limpiar estado sensible al cerrar sesión.

## Observabilidad

Métricas mínimas:
- auth_requests_total
- auth_401_total
- auth_403_total
- refresh_success_total
- refresh_failure_total

## Contenido

```
/diana.knowledge topic="jwt-supabase-auth" scope="project" type="local"
```
