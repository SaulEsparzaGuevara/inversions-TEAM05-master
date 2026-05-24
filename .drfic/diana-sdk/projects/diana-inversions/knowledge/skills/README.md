# Skills Modulares — Diana Inversions

## Proposito

Esta carpeta contiene una skill por archivo para ejecucion granular y portabilidad entre engines SDD.

## Estandar

Cada archivo `NNN-inv-skill-name-predictivo.md` debe incluir:
- Identificador de skill
- Objetivo operativo
- Fuentes canonicas
- Knowledge docs relacionados
- Criterios de exito
- Comportamiento de fallback

## Relacion con indexes/

- `indexes/skills-manifest.yaml`: catalogo maestro de skills.
- `indexes/agent-skill-matrix.yaml`: mapeo por agente/etapa.
- `indexes/sdd-engine-matrix.yaml`: mapeo por engine (Speckit/OpenSpec/Generic-SDD).

## Regla de funcionamiento

Si una skill modular no existe o esta incompleta, el engine debe continuar con su metodologia nativa y reportar gap.

## Convencion de nombres

- `NNN`: consecutivo automatico de 3 digitos.
- `inv`: codigo fijo del proyecto en minusculas.
- `skill-name-predictivo`: nombre amplio, legible y en minusculas.
- Usar guiones para separar palabras clave.
- Evitar abreviaturas opacas salvo que el nombre se vuelva excesivamente largo.
