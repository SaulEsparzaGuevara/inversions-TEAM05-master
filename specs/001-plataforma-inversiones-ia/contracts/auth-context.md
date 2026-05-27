# Contract: Auth Context

## Proposito

Definir contrato de autenticacion y autorizacion para endpoints protegidos de la API.

## Request Contract

- Header obligatorio: `Authorization: Bearer <JWT>`.
- El backend valida firma, expiracion, issuer y audience del token.
- El rol efectivo se deriva de claims + contexto persistido del usuario.
- Para aprobacion/ejecucion de roles `trader` y `admin` se exige evidencia MFA valida.

## Evidencia MFA Requerida (trader/admin)

Para acciones sensibles (`approve`, `execute`, `retry-execution`) con rol `trader` o `admin`, la evidencia MFA minima debe incluir:

- `mfa_context_id`
- `mfa_method` (`totp|sms|hardware_key`)
- `mfa_verified_at` (timestamp UTC)
- `mfa_expires_at` (timestamp UTC)
- `mfa_verification_result` (`success|failed`)

Reglas:

- Si `mfa_verification_result != success`, la accion se rechaza con `403 AUTH_CONTEXT_MFA_REQUIRED`.
- Si `mfa_expires_at < now`, la accion se rechaza con `403 AUTH_CONTEXT_MFA_REQUIRED`.
- `viewer` no puede aprobar/ejecutar aun con MFA valido.

## Authorization Contract (RBAC)

- `viewer`: solo lectura de senales, evidencia e historial.
- `trader`: puede aprobar/rechazar y disparar ejecucion asistida con MFA.
- `admin`: capacidades de `trader` + gestion operativa/soporte.

## Validation Outcomes

| Condicion | Resultado |
|-----------|-----------|
| Falta bearer token | `401 AUTH_CONTEXT_MISSING` |
| Token invalido o expirado | `401 AUTH_CONTEXT_INVALID_TOKEN` |
| Usuario no encontrado | `404 AUTH_CONTEXT_USER_NOT_FOUND` |
| Usuario inactivo | `403 AUTH_CONTEXT_USER_INACTIVE` |
| Rol insuficiente | `403 AUTH_CONTEXT_FORBIDDEN_ROLE` |
| MFA requerida no valida | `403 AUTH_CONTEXT_MFA_REQUIRED` |

## Invariants

- Ninguna accion operativa sensible se ejecuta sin usuario autenticado activo.
- Aprobacion/ejecucion quedan auditadas con `user_id`, `role`, `mfa_session_id`, `timestamp`.
- No se aceptan headers de identidad del cliente como fuente autoritativa.
- Toda aprobacion/ejecucion de `trader|admin` debe tener evidencia MFA persistida y correlacionable por `mfa_context_id`.
- La cobertura objetivo de evidencia MFA en acciones sensibles es 100% (`SC-008`).
