# Non-Advisory Disclaimer — Diana Inversiones Knowledge

> **ID**: INV-C-001  
> **Generado**: 2026-04-27  
> **Scope**: project — diana-inversions  
> **Estado**: 🟢 Completo  
> **Referencia**: FR-013 (clarificado 2026-04-27)

## Contexto

La plataforma es **informativa y operativa, no asesora de inversiones**.
Toda recomendación de IA es sugerencia educativa; el usuario decide y ejecuta.

## TL;DR

La plataforma brinda analítica y ejecución operativa, pero no asesoría financiera personalizada.  
Todo output de IA debe mostrarse como contenido informativo y sujeto a validación del usuario.  
El disclaimer debe ser visible en puntos críticos del journey, no solo en términos y condiciones.

## Texto Canónico Base

Texto corto (header/footer y login):
"Esta plataforma proporciona información y herramientas operativas. No constituye asesoría financiera, legal o fiscal."

Texto en recomendaciones IA:
"Las recomendaciones generadas por IA son informativas y no sustituyen asesoría profesional. La decisión final es del usuario."

Texto en confirmación de orden:
"Confirmo que comprendo los riesgos y que esta operación es decisión propia. La plataforma no actúa como asesor financiero."

## Ubicación Obligatoria

- Pantalla principal/dashboard: banner o bloque visible.
- Vista de recomendaciones IA: junto al componente de sugerencias.
- Modal de confirmación de orden: antes del botón final de envío.
- Página legal/FAQ: versión extendida del disclaimer.

## Reglas de UX y Cumplimiento

- No ocultar disclaimer detrás de interacción secundaria.
- Debe ser legible en desktop y mobile (sin truncar el sentido legal).
- Debe mantenerse consistente en español en toda la aplicación.

## Trazabilidad

- Registrar versión del texto aceptado por el usuario al confirmar operación.
- Guardar timestamp y user_id de aceptación en eventos de trading.

## Riesgos que Mitiga

- Riesgo de interpretar el sistema como asesoría personalizada.
- Riesgo reputacional y regulatorio por comunicación ambigua.
- Riesgo de reclamación por ausencia de advertencia visible.

## Contenido

```
/diana.knowledge topic="non-advisory-disclaimer" scope="project" type="local"
```
