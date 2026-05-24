# Protocolo de Investigación

**Instituto Tecnológico de Tepic**
**Dirección de Posgrado e Investigación**

---

| Campo | Detalle |
|---|---|
| **Título del proyecto** | Enseñanza de Frameworks de Desarrollo de Software Asistido por Inteligencia Artificial mediante Metodologías SDD: Del Uso de Herramientas Existentes al Diseño de un SDD Autónomo (DIANA) |
| **Línea de investigación TECNM** | Tecnologías de la Información y Sistemas Computacionales |
| **Área de conocimiento** | Ingeniería de Software · Inteligencia Artificial aplicada · Educación en Tecnologías |
| **Institución** | Instituto Tecnológico de Tepic — TecNM |
| **Departamento** | Sistemas y Computación |
| **Nivel** | Proyecto de investigación aplicada (vinculado a titulación / posgrado) |
| **Duración estimada** | 18 meses (3 semestres) |
| **Fecha de elaboración** | Mayo 2026 |

---

## 1. Planteamiento del Problema

El desarrollo de software asistido por Inteligencia Artificial (AI-assisted software development) está transformando de manera acelerada la práctica profesional de la ingeniería de software. Herramientas como GitHub Copilot, Cursor, Windsurf y Claude Code integran modelos de lenguaje de gran escala (LLMs) directamente en el flujo de trabajo del desarrollador, reduciendo tiempos de codificación y aumentando la complejidad manejable por un equipo pequeño.

Sin embargo, la efectividad de estas herramientas depende en gran medida de la calidad de las especificaciones que las guían. Han emergido metodologías conocidas como **Specification-Driven Development (SDD)** —o desarrollo dirigido por especificaciones— que establecen contratos formales entre lo que el sistema debe hacer y lo que la IA debe generar. Entre los frameworks SDD con mayor adopción en la comunidad de desarrolladores se encuentran:

- **Speckit** — flujo estructurado de specs, planes y tareas orientado a agentes de IA.
- **OpenSpec** — estándar abierto de especificación de API y comportamiento de sistemas.
- **BMAD (Business-Model Agile Development)** — metodología orientada a historias de usuario como fuente de verdad para la generación asistida.
- **Kiro** — agente SDD de AWS que convierte requerimientos en especificaciones verificables y código.
- **DIANA SDK Dr.FIC.** — framework SDD autónomo en desarrollo en el Instituto Tecnológico de Tepic, diseñado para colaborar con los frameworks anteriores y eventualmente operar de forma independiente.

A pesar de la relevancia de estas metodologías, los planes de estudio de ingeniería de sistemas en el TecNM no contemplan su enseñanza sistemática. Los estudiantes egresan sin experiencia práctica en el uso de SDD frameworks, sin conocimiento de cómo colaborar con agentes de IA de forma estructurada, y sin las competencias necesarias para diseñar metodologías propias adaptadas a contextos organizacionales específicos.

**Pregunta de investigación central:**

> ¿De qué manera la enseñanza de frameworks SDD en el contexto del desarrollo de software asistido por IA —incluyendo el diseño de un SDD propio (Diana)— mejora las competencias técnicas y metodológicas de los estudiantes del Instituto Tecnológico de Tepic?

**Preguntas secundarias:**

1. ¿Cuáles son las diferencias conceptuales y prácticas entre los principales frameworks SDD (Speckit, OpenSpec, BMAD, Kiro) en el contexto del desarrollo asistido por IA?
2. ¿Qué competencias adicionales desarrollan los estudiantes al diseñar e implementar un SDD propio (DIANA) en comparación con los que sólo aprenden a usar frameworks existentes?
3. ¿Puede DIANA SDK colaborar de forma efectiva con frameworks SDD existentes sin pérdida de trazabilidad ni consistencia?
4. ¿Qué modelo pedagógico es más efectivo para enseñar SDD en educación superior tecnológica?

---

## 2. Justificación

### 2.1 Relevancia Tecnológica

El mercado de herramientas de AI-assisted development crece a una tasa compuesta anual superior al 25% (McKinsey, 2025). GitHub reporta que más del 46% del código nuevo en repositorios activos es generado o completado por modelos de IA (GitHub Octoverse, 2025). En este escenario, la diferenciación competitiva del ingeniero de software radica no en la velocidad de escritura de código, sino en su capacidad de **especificar, razonar y validar** el comportamiento del sistema.

Los frameworks SDD proveen la estructura formal que permite a los ingenieros comunicarse con agentes de IA de forma precisa, reproducible y auditabe. Sin dominar estas metodologías, el desarrollador reduce el agente de IA a un autocompletador sofisticado, desaprovechando su capacidad de generación de soluciones completas.

### 2.2 Relevancia Educativa

El TecNM busca alinear sus programas educativos con las necesidades del sector productivo. La incorporación de SDD frameworks en el currículo de Ingeniería en Sistemas Computacionales responde directamente a:

- El Programa Nacional de Posgrado e Investigación del CONACYT/CONAHCYT en áreas de IA y software.
- Los lineamientos del Modelo Educativo del TecNM para el desarrollo de competencias profesionales emergentes.
- La demanda de las empresas de la región nayarita y del corredor tecnológico Guadalajara-Tepic por perfiles con dominio de herramientas de IA aplicada.

### 2.3 Originalidad

El proyecto tiene una dimensión de **investigación aplicada original**: el desarrollo de **DIANA SDK Dr.FIC.** como un SDD autónomo diseñado desde una institución educativa pública mexicana. Diana no es un wrapper de herramientas existentes; es una metodología con:

- Ciclo de vida propio (constitución → especificación → planeación → tareas → implementación → revisión).
- Capacidad de colaboración con Speckit, BMAD y Kiro mediante adaptadores de formato.
- Motor de agentes configurables para distintos LLMs (Claude, GPT-4o, Gemini).
- Gobernanza académica orientada a la reproducibilidad y la trazabilidad investigativa.

El diseño de DIANA en un contexto educativo garantiza que su arquitectura sea comprensible, modificable y enseñable, a diferencia de herramientas comerciales cuyos internos son opacos.

---

## 3. Objetivos

### 3.1 Objetivo General

Diseñar, implementar y evaluar un modelo educativo para la enseñanza de frameworks SDD en el desarrollo de software asistido por IA, que comprenda el uso de herramientas existentes (Speckit, OpenSpec, BMAD, Kiro) y el diseño de un SDD autónomo propio (Diana), en estudiantes del Instituto Tecnológico de Tepic.

### 3.2 Objetivos Específicos

| ID | Objetivo Específico |
|---|---|
| OE1 | Analizar y comparar los principales frameworks SDD (Speckit, OpenSpec, BMAD, Kiro) en términos de estructura, ciclo de vida, compatibilidad con LLMs y curva de aprendizaje. |
| OE2 | Diseñar un currículo modular de 18 semanas para la enseñanza progresiva de SDD frameworks en el contexto de desarrollo asistido por IA. |
| OE3 | Implementar el currículo en grupos piloto del Instituto Tecnológico de Tepic y medir el impacto en competencias técnicas y metodológicas mediante instrumentos de evaluación validados. |
| OE4 | Evolucionar DIANA SDK hasta un estado de SDD autónomo capaz de gestionar proyectos de software completos sin dependencia de otros frameworks. |
| OE5 | Desarrollar adaptadores de interoperabilidad entre DIANA y los frameworks Speckit, BMAD y Kiro, verificando trazabilidad y consistencia de artefactos. |
| OE6 | Publicar los resultados en revistas indexadas y/o congresos del TecNM, y liberar DIANA SDK como proyecto de código abierto con documentación académica. |

---

## 4. Hipótesis

**Hipótesis principal (H₁):**
Los estudiantes de Ingeniería en Sistemas Computacionales que reciben instrucción explícita en frameworks SDD y participan en el diseño de un SDD propio (DIANA) logran competencias significativamente superiores en especificación de software, colaboración con agentes de IA y gestión de proyectos complejos, en comparación con estudiantes que sólo desarrollan sin metodología SDD.

**Hipótesis nula (H₀):**
No existe diferencia estadísticamente significativa en las competencias de los estudiantes independientemente de si reciben o no instrucción en frameworks SDD.

**Hipótesis secundaria (H₂):**
DIANA SDK, al ser diseñado en un contexto educativo con criterios de legibilidad y extensibilidad, puede interoperar con al menos dos frameworks SDD existentes (Speckit y BMAD) con pérdida de trazabilidad inferior al 5% en los artefactos intercambiados.

---

## 5. Marco Teórico

### 5.1 Specification-Driven Development (SDD)

El SDD es un paradigma de ingeniería de software en el que la especificación formal del sistema —no el código— constituye el artefacto primario del desarrollo. El SDD establece que:

1. Toda funcionalidad debe estar descrita en un contrato formal antes de ser implementada.
2. Los agentes de IA o desarrolladores consumen esas especificaciones para generar código verificable.
3. La trazabilidad entre especificación, código y pruebas es un requisito no negociable.

El SDD se distingue del TDD (Test-Driven Development) en que el nivel de abstracción es mayor: no comienza con una prueba, sino con una descripción semántica del sistema que puede derivar tanto pruebas como implementaciones.

### 5.2 Frameworks SDD en el Ecosistema de IA

| Framework | Origen | Enfoque principal | Compatibilidad IA |
|---|---|---|---|
| **Speckit** | Open Source (comunidad) | Flujo spec → plan → tasks → implement | Claude, GPT-4, Gemini |
| **OpenSpec** | Open Source | Estándares de API y contratos de sistema | Agnóstico |
| **BMAD** | Open Source | Historias de usuario como especificación | Claude, GPT-4 |
| **Kiro** | AWS (2025) | Especificaciones verificables por agente | Claude (Bedrock) |
| **DIANA SDK Dr.FIC.** | TecNM / ITT | SDD autónomo con motor de agentes | Claude, extensible |

### 5.3 Aprendizaje Basado en Proyectos (ABP) en Ingeniería de Software

El modelo ABP (Kilpatrick, 1918; Krajcik & Shin, 2014) propone que los estudiantes aprenden mejor cuando enfrentan problemas auténticos que requieren la aplicación integrada de conocimientos. En ingeniería de software, el ABP ha demostrado mejoras en competencias de:

- Análisis y especificación de requerimientos (Tomayko & Hazzan, 2004).
- Comunicación técnica y documentación (Bruegge & Dutoit, 2009).
- Trabajo colaborativo en equipos de desarrollo (Topi et al., 2010).

El presente protocolo adopta ABP como eje metodológico, integrando los frameworks SDD como herramientas de andamiaje cognitivo para proyectos de complejidad creciente.

### 5.4 Evaluación de Competencias en Educación Superior Tecnológica

Se utilizará el marco de competencias de la ACM/IEEE Software Engineering Curriculum Guidelines (SE2024) como referente para la definición de indicadores de logro. Las competencias objetivo incluyen:

- **C1** — Especificación formal de requerimientos.
- **C2** — Diseño de arquitectura con trazabilidad documental.
- **C3** — Uso efectivo de herramientas de generación asistida por IA.
- **C4** — Validación y pruebas basadas en contratos.
- **C5** — Adaptación y extensión de metodologías de desarrollo.

### 5.5 Fundamentos de Diana SDK

DIANA SDK Dr.FIC. es un framework SDD desarrollado en el Instituto Tecnológico de Tepic que implementa un ciclo de vida completo de especificación orientado a agentes de IA:

```
Diana Lifecycle
├── /diana.constitution  → Constitución del proyecto (principios, restricciones)
├── /diana.specify       → Especificación de funcionalidades (spec.md)
├── /diana.plan          → Planeación técnica (plan.md, data-model.md, contracts/)
├── /diana.tasks         → Generación de tareas ordenadas (tasks.md)
├── /diana.implement     → Ejecución de tareas por agentes
├── /diana.change        → Gestión de cambios con trazabilidad (UCC)
└── /diana.knowledge     → Base de conocimiento local/remoto por dominio
```

DIANA SDK es distribuido como paquete Python (`diana-sdk-installer`) e integra agentes especializados para cada fase del ciclo de vida, configurables para distintos modelos de lenguaje.

---

## 6. Metodología

### 6.1 Diseño de la Investigación

**Tipo:** Investigación mixta (cuantitativa + cualitativa) con diseño cuasi-experimental de grupos paralelos.

**Diseño experimental:**
- **Grupo experimental (GE):** estudiantes que reciben el currículo SDD completo (frameworks existentes + DIANA).
- **Grupo control (GC):** estudiantes que siguen el programa regular de Ingeniería de Software sin instrucción explícita en SDD.
- **Asignación:** no aleatoria por disponibilidad de grupos (cuasi-experimental), con equivalencia estadística verificada en pre-test.

### 6.2 Participantes

| Característica | Detalle |
|---|---|
| Institución | Instituto Tecnológico de Tepic |
| Carrera | Ingeniería en Sistemas Computacionales |
| Semestre | 6° a 8° semestre (materias de Ingeniería de Software e IA) |
| Tamaño de muestra estimado | 60–80 estudiantes (30–40 por grupo) |
| Criterios de inclusión | Haber cursado Programación Orientada a Objetos y Bases de Datos |
| Criterios de exclusión | Estudiantes con experiencia laboral previa en SDD frameworks |

### 6.3 Fases del Proyecto

#### Fase 1 — Diagnóstico y Diseño Curricular (Meses 1–3)

| Actividad | Responsable | Entregable |
|---|---|---|
| Revisión sistemática de literatura sobre SDD y AI-assisted development | Equipo investigador | Reporte de estado del arte |
| Análisis comparativo de frameworks SDD (Speckit, OpenSpec, BMAD, Kiro) | Equipo investigador | Matriz comparativa |
| Diseño del instrumento de evaluación de competencias (pre/post-test) | Equipo investigador + expertos | Instrumento validado (α ≥ 0.80) |
| Diseño curricular modular (18 semanas) | Equipo investigador | Sílabo y materiales de apoyo |
| Validación de currículo por expertos externos | Expertos académicos e industriales | Dictamen de validación |

#### Fase 2 — Implementación Piloto (Meses 4–9)

| Semana | Módulo | Contenido | Framework |
|---|---|---|---|
| 1–2 | M0: Fundamentos | IA generativa en software, LLMs, prompting estructurado | — |
| 3–4 | M1: Introducción a SDD | Ciclos de vida SDD, comparativa de frameworks | Conceptual |
| 5–6 | M2: Speckit | Spec → Plan → Tasks → Implement con agentes | Speckit |
| 7–8 | M3: BMAD | User stories como especificación, generación asistida | BMAD |
| 9–10 | M4: OpenSpec & Kiro | Contratos de API, especificaciones verificables | OpenSpec / Kiro |
| 11–12 | M5: Diseño de SDD propio | Fundamentos de DIANA: constitución, ciclo de vida, agentes | DIANA SDK |
| 13–14 | M6: DIANA — Implementación | Uso de Diana para un proyecto real desde cero | Diana SDK |
| 15–16 | M7: Interoperabilidad | DIANA ↔ Speckit, DIANA ↔ BMAD: adaptadores y trazabilidad | DIANA + otros |
| 17 | M8: Proyecto integrador | Equipo elige framework(s) para proyecto complejo | Libre elección |
| 18 | M9: Presentación | Defensa del proyecto, demostración y evaluación | — |

#### Fase 3 — Análisis y Validación (Meses 10–14)

| Actividad | Responsable | Entregable |
|---|---|---|
| Aplicación de post-test y recolección de datos | Equipo investigador | Base de datos de resultados |
| Análisis estadístico (t de Student, U de Mann-Whitney, tamaño del efecto d de Cohen) | Estadístico del equipo | Reporte estadístico |
| Análisis cualitativo (entrevistas semi-estructuradas, grupos focales) | Investigador cualitativo | Reporte temático |
| Validación de interoperabilidad DIANA ↔ frameworks externos | Equipo de desarrollo | Reporte técnico de trazabilidad |
| Triangulación de datos y redacción de conclusiones | Equipo investigador | Borrador de artículo |

#### Fase 4 — Publicación y Transferencia (Meses 15–18)

| Actividad | Responsable | Entregable |
|---|---|---|
| Redacción de artículo para revista indexada | Investigador principal | Artículo enviado |
| Presentación en congreso TecNM / IEEE LACLO / ICSE-SEET | Equipo investigador | Ponencia presentada |
| Liberación de DIANA SDK v1.0 como código abierto | Equipo de desarrollo | Repositorio público + documentación |
| Diseño de propuesta de integración curricular permanente | Investigador principal + Departamento | Propuesta formal al Departamento |

### 6.4 Instrumentos de Recolección de Datos

| Instrumento | Tipo | Momento | Variables medidas |
|---|---|---|---|
| Pre-test de competencias SDD | Cuantitativo (rúbrica + quiz) | Inicio del piloto | Conocimiento previo (C1–C5) |
| Post-test de competencias SDD | Cuantitativo (rúbrica + quiz) | Final del piloto | Competencias logradas (C1–C5) |
| Portafolio de proyectos | Cualitativo-cuantitativo | Durante el piloto | Calidad de artefactos SDD |
| Entrevista semi-estructurada | Cualitativo | Al final del piloto | Percepción, dificultades, aprendizajes |
| Grupo focal docentes | Cualitativo | Mes 10 | Aplicabilidad curricular |
| Métricas de trazabilidad DIANA | Cuantitativo (automatizado) | Fase 3 | H₂: pérdida de trazabilidad < 5% |

### 6.5 Análisis de Datos

**Cuantitativo:**
- Estadística descriptiva: media, desviación estándar, distribución de puntajes.
- Prueba de normalidad: Shapiro-Wilk.
- Comparación de grupos: t de Student (paramétrica) o U de Mann-Whitney (no paramétrica).
- Tamaño del efecto: d de Cohen.
- Nivel de significancia: α = 0.05.

**Cualitativo:**
- Análisis temático (Braun & Clarke, 2006) sobre transcripciones de entrevistas y grupos focales.
- Codificación abierta → categorías → temas emergentes.
- Validación por triangulación (datos cualitativos + cuantitativos + revisión de expertos).

---

## 7. Consideraciones Éticas

| Aspecto | Medida |
|---|---|
| Participación voluntaria | Consentimiento informado firmado por estudiantes (y padres si son menores) |
| Confidencialidad | Los datos individuales serán anonimizados; sólo se publicarán agregados |
| Equidad | El GC recibirá acceso al currículo SDD al concluir el estudio |
| Propiedad intelectual | DIANA SDK se liberará bajo licencia MIT; los proyectos de los estudiantes son propiedad de sus autores |
| Uso de IA | El uso de herramientas de IA en el currículo es explícito y transparente; no constituye deshonestidad académica dentro del marco del estudio |
| Revisión institucional | El protocolo será sometido al Comité de Investigación del ITT antes de iniciar el piloto |

---

## 8. Recursos y Presupuesto Estimado

### 8.1 Recursos Humanos

| Rol | Dedicación | Fuente de financiamiento |
|---|---|---|
| Investigador principal | 20 h/semana | TECNM / IEI |
| Co-investigador (estadístico) | 8 h/semana | TECNM |
| Desarrollador DIANA SDK | 20 h/semana | Proyecto de titulación |
| Estudiantes colaboradores | Variable | Estancias de investigación |

### 8.2 Recursos Tecnológicos

| Recurso | Costo estimado (MXN) | Observación |
|---|---|---|
| API de Claude (Anthropic) — 18 meses | $25,000 | Uso académico; aplicar a descuento educativo |
| API de OpenAI GPT-4o — 18 meses | $20,000 | Respaldo y comparación |
| Servidor VPS para backend DIANA | $15,000 | 18 meses, 8 vCPU / 16 GB RAM |
| Licencias software adicional | $5,000 | Herramientas de análisis estadístico |
| **Total estimado** | **$65,000** | Sujeto a aprobación de fondos TECNM/PRODEP |

### 8.3 Fuentes de Financiamiento Potenciales

- **PRODEP** (Programa para el Desarrollo Profesional Docente) — TecNM.
- **CONAHCYT** — Convocatoria de Ciencia Básica y de Frontera (Modalidad Postdoctoral / Proyecto).
- **Colaboración industrial** — empresas de software de la región (Tepic, Guadalajara).
- **AWS Educate / GitHub Education** — créditos para herramientas de IA.

---

## 9. Cronograma

```
Mes:        1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18
Fase 1      ████████████
Fase 2                  ████████████████████████████
Fase 3                                              ████████████████████
Fase 4                                                                  ████████████
Difusión        ·           ·               ·               ·               ·
```

| Hito | Mes | Criterio de éxito |
|---|---|---|
| H1: Currículo validado | 3 | Dictamen positivo de ≥ 3 expertos |
| H2: Piloto iniciado | 4 | GE y GC con pre-test aplicado |
| H3: DIANA SDK v0.5 | 9 | Módulos M5–M7 operativos |
| H4: Datos recolectados | 10 | Post-test aplicado, entrevistas transcritas |
| H5: Análisis completo | 14 | Reporte estadístico y cualitativo aprobado |
| H6: Publicación enviada | 16 | Artículo enviado a revista indexada |
| H7: DIANA SDK v1.0 | 17 | Repositorio público con documentación completa |
| H8: Propuesta curricular | 18 | Documento entregado al Departamento de ISC |

---

## 10. Resultados Esperados

### 10.1 Productos Académicos

| Producto | Tipo | Indicador de calidad |
|---|---|---|
| Artículo de investigación | Revista indexada (Scopus / WoS / Latindex Núcleo) | Enviado en mes 16; aceptado en mes 18+ |
| Ponencia en congreso | IEEE LACLO, ICSE-SEET, o Congreso Internacional TecNM | Aceptada y presentada |
| Tesis de licenciatura / posgrado | Dirigida a 2–3 estudiantes | Examen recepcional aprobado con distinción |
| Manual pedagógico SDD | Documento técnico con licencia CC-BY | Publicado en repositorio institucional |

### 10.2 Productos Tecnológicos

| Producto | Descripción | Licencia |
|---|---|---|
| DIANA SDK Dr.FIC. v1.0 | SDD autónomo con CLI, motor de agentes, 8 comandos, documentación completa | MIT |
| Adaptadores de interoperabilidad | DIANA ↔ Speckit, DIANA ↔ BMAD, DIANA ↔ Kiro | MIT |
| Currículo SDD abierto | 18 módulos, materiales, rúbricas, casos de uso | CC-BY 4.0 |
| Dataset de evaluación | Portafolios anonimizados + métricas de trazabilidad | CC-BY-NC 4.0 |

### 10.3 Impacto Esperado

- **Estudiantil:** Mejora estadísticamente significativa (d de Cohen ≥ 0.5) en competencias C1–C5.
- **Curricular:** Integración de al menos 1 módulo SDD en el programa oficial de Ingeniería en Sistemas del ITT.
- **Tecnológico:** DIANA SDK adoptado por ≥ 2 instituciones TecNM adicionales en el ciclo siguiente.
- **Académico:** Al menos 1 artículo indexado y 2 ponencias en congreso reconocido.

---

## 11. Referencias Preliminares

1. Braun, V., & Clarke, V. (2006). Using thematic analysis in psychology. *Qualitative Research in Psychology*, 3(2), 77–101.
2. Bruegge, B., & Dutoit, A. H. (2009). *Object-Oriented Software Engineering: Using UML, Patterns, and Java* (3rd ed.). Prentice Hall.
3. GitHub. (2025). *Octoverse 2025: The state of open source and AI-assisted development*. GitHub Inc.
4. IEEE/ACM Joint Task Force on Computing Curricula. (2024). *Software Engineering 2024 Curriculum Guidelines (SE2024)*. ACM.
5. Krajcik, J. S., & Shin, N. (2014). Project-based learning. In R. K. Sawyer (Ed.), *The Cambridge Handbook of the Learning Sciences* (2nd ed., pp. 275–297). Cambridge University Press.
6. McKinsey & Company. (2025). *The state of AI in 2025: Generative AI's impact on software development*. McKinsey Global Institute.
7. Tomayko, J. E., & Hazzan, O. (2004). *Human Aspects of Software Engineering*. Charles River Media.
8. Topi, H., et al. (2010). IS 2010: Curriculum guidelines for undergraduate degree programs in information systems. *Communications of the AIS*, 26(18).
9. Anthropic. (2025). *Claude: Model family documentation*. Anthropic PBC. https://www.anthropic.com/claude
10. Amazon Web Services. (2025). *Kiro: Specification-driven development with AI agents*. AWS Documentation.
11. TecNM. (2023). *Modelo Educativo del Tecnológico Nacional de México*. Dirección General del TecNM.

---

## Apéndices

### Apéndice A — Glosario de Términos

| Término | Definición |
|---|---|
| **SDD** | Specification-Driven Development. Paradigma en el que la especificación formal precede y guía la generación de código. |
| **LLM** | Large Language Model. Modelo de lenguaje de gran escala entrenado en corpus masivos de texto y código. |
| **Agente de IA** | Sistema autónomo que utiliza un LLM para percibir contexto, razonar y ejecutar acciones (leer/escribir archivos, llamar APIs, etc.). |
| **Speckit** | Framework SDD open source que estructura el desarrollo en las fases: specify → plan → tasks → implement. |
| **BMAD** | Business-Model Agile Development. Framework SDD que usa historias de usuario como especificación primaria. |
| **Kiro** | Herramienta SDD de AWS que convierte requerimientos en especificaciones verificables y código mediante agentes de IA. |
| **OpenSpec** | Estándar abierto para la especificación de contratos de API y comportamiento de sistemas. |
| **DIANA SDK Dr.FIC.** | Framework SDD autónomo desarrollado en el ITT, con CLI propia, motor de agentes y ciclo de vida completo. |
| **UCC** | Unidad de Control de Cambios. Artefacto de DIANA para gestionar cambios con trazabilidad completa. |
| **Trazabilidad** | Capacidad de seguir la relación entre un requerimiento, su especificación, el código generado y las pruebas que lo verifican. |
| **Interoperabilidad** | Capacidad de dos frameworks SDD de intercambiar artefactos sin pérdida de información ni trazabilidad. |
| **ABP** | Aprendizaje Basado en Proyectos. Modelo pedagógico en el que los estudiantes aprenden resolviendo problemas auténticos. |

### Apéndice B — Estructura Técnica de DIANA SDK Dr.FIC.

```
Diana SDK — Arquitectura de Comandos
├── diana init           → Inicializa proyecto DIANA (constitución + estructura)
├── diana specify        → Genera spec.md desde descripción en lenguaje natural
├── diana plan           → Genera plan.md, data-model.md, contracts/
├── diana tasks          → Genera tasks.md con dependencias y prioridades
├── diana implement      → Ejecuta tasks.md tarea por tarea con agentes
├── diana change         → Registra y aplica cambios (UCC)
├── diana knowledge      → Gestiona base de conocimiento local/remoto
└── diana ticket         → Crea tickets de servicio vinculados a UCC
```

### Apéndice C — Rúbrica de Evaluación de Competencias SDD

| Competencia | Nivel 1 (Básico) | Nivel 2 (Intermedio) | Nivel 3 (Avanzado) | Nivel 4 (Experto) |
|---|---|---|---|---|
| **C1** Especificación | Identifica requerimientos informales | Redacta spec.md estructurada | Especifica contratos y casos edge | Diseña especificaciones reutilizables |
| **C2** Arquitectura | Describe componentes básicos | Genera plan.md con decisiones técnicas | Diseña data-model y contratos de API | Propone arquitecturas con trazabilidad completa |
| **C3** Uso de IA | Usa prompts libres con IA | Usa un framework SDD con agentes | Combina múltiples frameworks SDD | Configura y extiende motores de agentes |
| **C4** Validación | Escribe pruebas ad-hoc | Genera pruebas desde contratos | Automatiza validación de trazabilidad | Diseña pipelines de calidad SDD |
| **C5** Adaptación | Sigue un framework dado | Adapta un framework a su contexto | Extiende un framework con plugins | Diseña un SDD propio funcional |

---

*Documento elaborado por el equipo de investigación del Instituto Tecnológico de Tepic.*
*Versión 1.0 — Mayo 2026*
*Para comentarios o colaboración: contactar al Departamento de Sistemas y Computación del ITT.*
