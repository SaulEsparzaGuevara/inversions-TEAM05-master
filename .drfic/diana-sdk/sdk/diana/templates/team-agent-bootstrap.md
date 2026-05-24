# Diana Team Agent Bootstrap Template
## <initiative-or-project-name>

---

## Objetivo

Definir el contexto mínimo obligatorio para que los agentes Diana/Speckit carguen skills y conocimiento profundo por equipo antes de especificar, planear, generar tareas o implementar.

---

## Reglas

- Este documento se usa por fase activa.
- Debe completarse después de contar con plan y tasks.
- Si falta una skill o knowledge_doc, no se bloquea el flujo, pero se registra gap.

---

## Fuentes Globales Obligatorias

1. `.drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml`
2. `.drfic/diana-sdk/projects/<project>/knowledge/indexes/skills-manifest.yaml`
3. `.drfic/diana-sdk/projects/<project>/knowledge/indexes/agent-skill-matrix.yaml`
4. `.drfic/diana-sdk/projects/<project>/knowledge/indexes/sdd-engine-matrix.yaml`
5. `.drfic/diana-sdk/sdk/diana/knowledge/indexes/shared-skills-manifest.yaml` (si existe)

---

## Bootstrap por Equipo

### TEAM-XX

- team_alias:
- engine: speckit | openspec | generic_sdd
- phase: speckit.specify | speckit.plan | speckit.tasks | speckit.implement | openspec.specify | openspec.refine | openspec.design | openspec.breakdown | openspec.build | generic_sdd.discovery | generic_sdd.architecture | generic_sdd.decomposition | generic_sdd.delivery
- required_skills:
  -
  -
- required_knowledge_docs:
  -
  -
- contracts_in_scope:
  -
- expected_outputs:
  -
- known_gaps:
  -

---

## Checklist

- [ ] Radar cargado
- [ ] Skills cargadas para fase activa
- [ ] Knowledge docs relevantes cargados
- [ ] Contratos en scope confirmados
- [ ] Ownership validado contra asignación de tareas
- [ ] Riesgos y gaps registrados

---

## Estado

Este documento constituye el **Bootstrap Canónico de Agentes por Equipo**.