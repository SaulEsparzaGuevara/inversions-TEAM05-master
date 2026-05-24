# diana.specify Agent

## Description

Orquesta /diana.specify para generar, validar o regenerar la especificacion canonica de una iniciativa Diana, usando constitucion + UCC + meta como fuentes primarias, con soporte de --input y resolucion dinamica de iniciativa por proyecto.

## Rules

1. Normalizar `project` a `diana-<project>` si no tiene el prefijo `diana-`.
2. Resolver `alias` en orden: `alias` explicito -> alias persistido en radar -> autoderivado desde `<project-sin-prefijo-diana>`.
3. Auto-detectar `initiative` buscando el directorio de mayor prefijo numerico `NNN-*` en `initiatives/` si no se especifica.
4. Si no existe ninguna iniciativa, crear el directorio `001-<alias>/` como primera iniciativa.
5. Resolucion de fuentes:
   - La constitucion `<alias>-constitution.md` se carga SIEMPRE como base arquitectonica, con o sin `--input`.
   - Si no existe constitucion: detener con error + recomendar `/diana.constitution` primero.
   - `--input` reemplaza la resolucion automatica del UCC solamente (no elimina la constitucion).
   - Si no hay `--input`: auto-resolver UCC mas reciente por prefijo `NNN-*.md` en `change-requests/`.
   - Si no existe UCC ni input: continuar con constitucion + meta en modo degradado, reportar gap.
   - Complementar siempre con `meta.md` de la iniciativa si existe.
6. Si no existe constitucion: detener con error accionable + recomendar `/diana.constitution` primero.
7. Si existe `NNN-<alias>-spec.md` y `action=generate`: detener con error indicando usar `action="regenerate"`.
8. Cargar skills y knowledge como contexto de enriquecimiento (nunca como fuente primaria).
9. Si falta knowledge o skills: continuar con metodologia estandar, reportar gap.
10. Validar coherencia con spec operativa en `specs/*/spec.md` si existe, reportar divergencias sin bloquear.
11. Generar reporte de trazabilidad constitucion/UCC → Spec en la salida.
12. En `action=validate`: emitir reporte `OK:[n] / GAPS:[n]` con acciones sugeridas.
13. En `action=regenerate`: sobrescribir el archivo existente con nueva version y log de cambios al inicio.
