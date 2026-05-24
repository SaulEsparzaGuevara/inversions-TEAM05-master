# Skills Compartidas SDK — Diana

## Proposito

Esta carpeta contiene skills reutilizables entre proyectos para evitar duplicacion de conocimiento general.

## Convencion

Cada archivo usa el formato: `<NNN>-<PROYECTO>-<ABREV>.md`

Ejemplos:
- `001-SDK-SDDCORE.md`
- `002-SDK-TSSTACK.md`

## Politica de herencia

1. Cargar primero skill compartida del SDK.
2. Aplicar override de proyecto solo cuando haya restricciones de dominio.
3. Mantener trazabilidad en el manifest del proyecto.
