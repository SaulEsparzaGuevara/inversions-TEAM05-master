# Team Task Allocation Canonica
## Plataforma de Inversiones con IA

Generado por: /diana.teams action="generate"
Proyecto: DIANA Inversions
Iniciativa: 001-inversions
Backlog base: ../001-inv-tasks.md
Fecha: 2026-05-03

---

## Matriz de Asignacion

| team_id | team_alias       | task_id | stream     | priority | dependency_note                    | acceptance_note                         |
| ------- | ---------------- | ------- | ---------- | -------- | ---------------------------------- | --------------------------------------- |
| TEAM-01 | DIANArchiTEC     | T000    | Setup      | High     | Debe cerrar antes de T001-T005     | Estructura monorepo del portafolio validada |
| TEAM-01 | DIANArchiTEC     | T001    | Setup      | High     | Inicio de estructura base          | Estructura raíz creada                  |
| TEAM-02 | CocaDe6Lts       | T002    | Setup      | High     | Tras T001 puede correr en paralelo | Workspace frontend listo                |
| TEAM-01 | DIANArchiTEC     | T003    | Setup      | High     | Tras T001 puede correr en paralelo | Workspace backend listo                 |
| TEAM-02 | CocaDe6Lts       | T004    | Setup      | High     | Tras T001 puede correr en paralelo | Scripts raíz disponibles                |
| TEAM-01 | DIANArchiTEC     | T005    | Setup      | High     | Requiere estructura base           | Plantilla de entorno publicada          |
| TEAM-01 | DIANArchiTEC     | T059    | Setup      | High     | Depende de T005 y habilita Fase 2 | Esquema baseline Supabase versionado    |
| TEAM-01 | DIANArchiTEC     | T006    | Foundation | High     | Bloquea auth y ejecución           | JWT y contexto activos                  |
| TEAM-01 | DIANArchiTEC     | T007    | Foundation | High     | Depende de T006                    | RBAC activo                             |
| TEAM-01 | DIANArchiTEC     | T008    | Foundation | High     | Depende de T006                    | MFA activo                              |
| TEAM-06 | CodersTMNT      | T009    | Foundation | High     | Base de lifecycle de orden         | Tipos y transiciones definidas          |
| TEAM-06 | CodersTMNT      | T010    | Foundation | High     | Base de auditoría                  | Evento audit canónico definido          |
| TEAM-06 | CodersTMNT      | T011    | Foundation | Medium   | Contrato para aprobación           | Helper de disclaimer disponible         |
| TEAM-01 | DIANArchiTEC     | T012    | Foundation | High     | Seguridad transversal              | Rate limit sensible activo              |
| TEAM-01 | DIANArchiTEC     | T013    | Foundation | High     | Concurrency para ejecución         | Optimistic locking activo               |
| TEAM-06 | CodersTMNT      | T014    | Foundation | Medium   | Alimenta observabilidad            | Métricas de frescura disponibles        |
| TEAM-01 | DIANArchiTEC     | T015    | Foundation | Medium   | Gobernanza de datos                | Política de retención definida          |
| TEAM-01 | DIANArchiTEC     | T016    | Foundation | High     | Soporta adaptadores broker         | Política de resiliencia definida        |
| TEAM-02 | CocaDe6Lts       | T017    | US1        | High     | Tras Fase 2                        | Configuración de fuentes operativa      |
| TEAM-02 | CocaDe6Lts       | T018    | US1        | High     | Tras Fase 2                        | Motor de confluencia operativo          |
| TEAM-02 | CocaDe6Lts       | T019    | US1        | High     | Tras Fase 2                        | Explicabilidad operativa                |
| TEAM-02 | CocaDe6Lts       | T020    | US1        | High     | Depende de T017-T019               | Endpoint de evaluación publicado        |
| TEAM-02 | CocaDe6Lts       | T021    | US1        | High     | Depende de T017-T019               | Endpoint de detalle publicado           |
| TEAM-01 | DIANArchiTEC     | T022    | US1        | High     | Paralelo con T023, parte confluencia | Pantalla de evaluación funcional        |
| TEAM-01 | DIANArchiTEC     | T023    | US1        | High     | Paralelo con T022, parte confluencia | Panel de evidencia funcional            |
| TEAM-01 | DIANArchiTEC     | T024    | US1        | High     | Depende de T020-T021, wiring frontend | Wiring frontend API completado          |
| TEAM-02 | CocaDe6Lts       | T025    | US1        | Medium   | Depende de T010 y T020             | Auditoría de señal emitida              |
| TEAM-01 | DIANArchiTEC     | T026    | US2        | High     | Depende de T007-T008               | Servicio de aprobación disponible       |
| TEAM-01 | DIANArchiTEC     | T027    | US2        | High     | Depende de T009 y T016             | Orquestación de ejecución lista         |
| TEAM-01 | DIANArchiTEC     | T028    | US2        | High     | Depende de T016 (owner broker contract) | Contrato broker normalizado          |
| TEAM-04 | DiviNoSQL        | T029    | US2        | Medium   | Depende de T028                    | Adaptador IBKR listo                    |
| TEAM-05 | TurboPapus       | T030    | US2        | Medium   | Depende de T028                    | Adaptador Alpaca listo                  |
| TEAM-01 | DIANArchiTEC     | T031    | US2        | High     | Depende de T026                    | Endpoint de aprobación funcional        |
| TEAM-01 | DIANArchiTEC     | T032    | US2        | High     | Depende de T027 y T013             | Endpoint de ejecución funcional         |
| TEAM-01 | DIANArchiTEC     | T033    | US2        | High     | Depende de T032                    | Fail-fast recovery listo                |
| TEAM-01 | DIANArchiTEC     | T034    | US2        | High     | Depende de contratos de aprobación | Flujo UI de aprobación funcional        |
| TEAM-01 | DIANArchiTEC     | T035    | US2        | High     | Depende de T032                    | Panel UI de ejecución funcional         |
| TEAM-01 | DIANArchiTEC     | T036    | US2        | Medium   | Depende de T010 y T032             | Eventos de ejecución emitidos           |
| TEAM-07 | SixPackDevs    | T037    | US3        | High     | Depende de T010 y T036             | Servicio de historial operativo         |
| TEAM-08 | GlassCoke    | T038    | US3        | Medium   | Tras Fase 2                        | Analítica de portafolio operativa       |
| TEAM-07 | SixPackDevs    | T039    | US3        | High     | Depende de T037                    | Endpoint de historial operativo         |
| TEAM-08 | GlassCoke    | T040    | US3        | High     | Depende de T037                    | Endpoint de detalle operativo funcional |
| TEAM-01 | DIANArchiTEC     | T041    | US3        | Medium   | Depende de T039                    | Dashboard de historial listo            |
| TEAM-01 | DIANArchiTEC     | T042    | US3        | Medium   | Depende de T040                    | Timeline operativo listo                |
| TEAM-07 | SixPackDevs    | T043    | US3        | Medium   | Depende de T014 y T039             | Métricas de historial listas            |
| TEAM-01 | DIANArchiTEC     | T044    | Polish     | Medium   | Contrato compartido                | Broker contract sincronizado            |
| TEAM-06 | CodersTMNT      | T045    | Polish     | Medium   | Contrato compartido                | Lifecycle contract sincronizado         |
| TEAM-01 | DIANArchiTEC     | T046    | Polish     | Medium   | Contrato compartido                | Auth contract sincronizado              |
| TEAM-01 | DIANArchiTEC     | T047    | Polish     | Medium   | Depende del cierre del backlog     | Matriz de trazabilidad actualizada      |
| TEAM-01 | DIANArchiTEC     | T048    | Polish     | Medium   | Depende de quickstart              | Validación quickstart documentada       |
| TEAM-03 | SQLitoNo         | T049    | Polish     | Medium   | Observabilidad SLO                 | SLI/SLO definidos                       |
| TEAM-03 | SQLitoNo         | T050    | Polish     | Medium   | Depende de T049                    | Reporte mensual consolidado             |
| TEAM-07 | SixPackDevs    | T051    | Polish     | Medium   | Quickstart y resiliencia           | Runbook definido                        |
| TEAM-07 | SixPackDevs    | T052    | Polish     | Medium   | Depende de T051                    | Simulacro ejecutado                     |
| TEAM-04 | DiviNoSQL        | T053    | Polish     | Medium   | Cobertura MFA                      | Auditoría MFA implementada              |
| TEAM-05 | TurboPapus       | T054    | Polish     | Medium   | Depende de T053 y T046             | Reporte MFA implementado                |
| TEAM-08 | GlassCoke    | T055    | Polish     | Medium   | Gobierno estructural               | Checklist de ownership disponible       |
| TEAM-01 | DIANArchiTEC     | T056    | Polish     | Medium   | Depende de T055                    | Gate estructural activo                 |
| TEAM-01 | DIANArchiTEC     | T057    | Polish     | Low      | Documentación operativa            | Español técnico normalizado             |
| TEAM-08 | GlassCoke    | T058    | Polish     | Medium   | Cumplimiento constitucional        | Política FIC implementada               |
| TEAM-01 | DIANArchiTEC     | T060    | TEAM-01    | High     | Depende de T059                    | Cliente Supabase y repositories base listos |
| TEAM-01 | DIANArchiTEC     | T061    | TEAM-01    | High     | Depende de T060 y T059             | Migraciones versionadas en lugar        |
| TEAM-01 | DIANArchiTEC     | T062    | TEAM-01    | High     | Depende de T061                    | Validador .env activo en startup       |
| TEAM-01 | DIANArchiTEC     | T063    | TEAM-01    | High     | Depende de T062 y T018/T019        | Dashboard principal funcional           |
| TEAM-01 | DIANArchiTEC     | T064    | TEAM-01    | High     | Paralelo con T063                  | Panel de activación de cores funcional  |
| TEAM-01 | DIANArchiTEC     | T065    | TEAM-01    | High     | Depende de T063                    | Overlay de señales operativo            |
| TEAM-01 | DIANArchiTEC     | T066    | TEAM-01    | Medium   | Depende de T063                    | Tabla de explicabilidad completa        |
| TEAM-01 | DIANArchiTEC     | T067    | TEAM-01    | High     | Depende de T020/T021/T037/T038     | Orquestador API consolidado             |
| TEAM-01 | DIANArchiTEC     | T068    | TEAM-01    | High     | Depende de T016 y T062             | Integración broker wiring completado    |
| TEAM-02 | CocaDe6Lts       | T069    | TEAM-02    | High     | Depende de T017                    | Contrato de parámetros de indicadores definido |
| TEAM-02 | CocaDe6Lts       | T070    | TEAM-02    | High     | Depende de T069                    | Motor multi-indicador operativo         |
| TEAM-02 | CocaDe6Lts       | T071    | TEAM-02    | High     | Depende de T070                    | API de evaluación de indicadores publicada |
| TEAM-02 | CocaDe6Lts       | T072    | TEAM-02    | High     | Depende de T070                    | Confluencia estricta BUY/SELL operativa |
| TEAM-02 | CocaDe6Lts       | T073    | TEAM-02    | High     | Depende de T071                    | Explicabilidad por señal disponible     |
| TEAM-02 | CocaDe6Lts       | T074    | TEAM-02    | High     | Depende de T060                    | Chat IA de indicadores disponible       |
| TEAM-02 | CocaDe6Lts       | T075    | TEAM-02    | Medium   | Depende de T074                    | Reportes HTML descargables disponibles  |
| TEAM-02 | CocaDe6Lts       | T076    | TEAM-02    | Medium   | Depende de T074                    | Gráficas analíticas generadas           |
| TEAM-03 | SQLitoNo         | T077    | TEAM-03    | High     | Depende de T059                    | Contrato de campos fundamentales definido |
| TEAM-03 | SQLitoNo         | T078    | TEAM-03    | High     | Depende de T077                    | Integración con fuentes externas activa |
| TEAM-03 | SQLitoNo         | T079    | TEAM-03    | High     | Depende de T078                    | Motor de viabilidad fundamental operativo |
| TEAM-03 | SQLitoNo         | T080    | TEAM-03    | High     | Depende de T079                    | API de perfil fundamental publicada     |
| TEAM-03 | SQLitoNo         | T081    | TEAM-03    | High     | Depende de T079                    | Screener S&P500 operativo               |
| TEAM-03 | SQLitoNo         | T082    | TEAM-03    | High     | Depende de Fase 2                  | Contrato base de estrategias de opciones definido |
| TEAM-03 | SQLitoNo         | T083    | TEAM-03    | High     | Depende de T082                    | Core Long Call operativo                |
| TEAM-03 | SQLitoNo         | T084    | TEAM-03    | High     | Depende de T082                    | Core Long Put operativo                 |
| TEAM-03 | SQLitoNo         | T085    | TEAM-03    | High     | Depende de T082                    | Core Short Call operativo               |
| TEAM-03 | SQLitoNo         | T086    | TEAM-03    | High     | Depende de T082                    | Core Short Put operativo                |
| TEAM-03 | SQLitoNo         | T087    | TEAM-03    | High     | Depende de T083/T084/T085/T086     | Motor de simulación temporal operativo  |
| TEAM-03 | SQLitoNo         | T088    | TEAM-03    | High     | Depende de T087                    | Alertas y stop-loss en tiempo real activos |
| TEAM-03 | SQLitoNo         | T089    | TEAM-03    | High     | Depende de T087                    | Comparador de estrategias con recomendación operativo |
| TEAM-03 | SQLitoNo         | T090    | TEAM-03    | Medium   | Depende de T060                    | Chat IA de fundamental y estrategias disponible |
| TEAM-04 | DiviNoSQL        | T091    | TEAM-04    | High     | Depende de T059                    | Contrato técnico estructural definido   |
| TEAM-04 | DiviNoSQL        | T092    | TEAM-04    | High     | Depende de T091                    | Algoritmo de soportes/resistencias operativo |
| TEAM-04 | DiviNoSQL        | T093    | TEAM-04    | High     | Depende de T091                    | Algoritmo de tendencias operativo       |
| TEAM-04 | DiviNoSQL        | T094    | TEAM-04    | Medium   | Depende de T091                    | Integración técnica externa operativa   |
| TEAM-04 | DiviNoSQL        | T095    | TEAM-04    | High     | Depende de T092/T093/T094          | Selector interno/externo activo         |
| TEAM-04 | DiviNoSQL        | T096    | TEAM-04    | High     | Depende de T095                    | API de soportes/resistencias/tendencias publicada |
| TEAM-04 | DiviNoSQL        | T097    | TEAM-04    | High     | Depende de T096                    | Pronóstico de velas operativo           |
| TEAM-04 | DiviNoSQL        | T098    | TEAM-04    | High     | Depende de T097 y contexto multi-core | Agregación contextual para pronóstico lista |
| TEAM-04 | DiviNoSQL        | T099    | TEAM-04    | High     | Depende de T098                    | API de pronóstico explicable publicada  |
| TEAM-04 | DiviNoSQL        | T100    | TEAM-04    | High     | Depende de Fase 2                  | Contrato base Wheel definido            |
| TEAM-04 | DiviNoSQL        | T101    | TEAM-04    | High     | Depende de T100                    | Core Covered Call operativo             |
| TEAM-04 | DiviNoSQL        | T102    | TEAM-04    | High     | Depende de T100                    | Core Cash-Secured Put operativo         |
| TEAM-04 | DiviNoSQL        | T103    | TEAM-04    | High     | Depende de T101/T102               | Orquestador Wheel con alertas/stop-loss operativo |
| TEAM-04 | DiviNoSQL        | T104    | TEAM-04    | High     | Depende de T103                    | Comparador Wheel con recomendación operativo |
| TEAM-04 | DiviNoSQL        | T105    | TEAM-04    | Medium   | Depende de T060                    | Chat IA técnico/Wheel disponible        |
| TEAM-05 | TurboPapus       | T106    | TEAM-05    | High     | Depende de T059                    | Contrato de parámetros institucionales definido |
| TEAM-05 | TurboPapus       | T107    | TEAM-05    | High     | Depende de T106                    | Servicio de integración con fuentes externas operativo |
| TEAM-05 | TurboPapus       | T108    | TEAM-05    | High     | Depende de T107                    | Motor de zonas S/R institucionales operativo |
| TEAM-05 | TurboPapus       | T109    | TEAM-05    | High     | Depende de T107                    | Motor de tendencias MAs largas operativo |
| TEAM-05 | TurboPapus       | T110    | TEAM-05    | High     | Depende de T107                    | Motor de análisis de vencimientos operativo |
| TEAM-05 | TurboPapus       | T111    | TEAM-05    | High     | Depende de T108/T109/T110          | API de análisis institucional publicada |
| TEAM-05 | TurboPapus       | T112    | TEAM-05    | High     | Depende de T108/T109/T110          | API de posiciones y reportes regulatorios publicada |
| TEAM-05 | TurboPapus       | T113    | TEAM-05    | High     | Depende de Fase 2                  | Contrato base de estrategias de cobertura definido |
| TEAM-05 | TurboPapus       | T114    | TEAM-05    | High     | Depende de T113                    | Core Protective Put/Married Put operativo |
| TEAM-05 | TurboPapus       | T115    | TEAM-05    | High     | Depende de T113                    | Core Collar Put operativo               |
| TEAM-05 | TurboPapus       | T116    | TEAM-05    | High     | Depende de T113                    | Core Covered Straddle operativo         |
| TEAM-05 | TurboPapus       | T117    | TEAM-05    | High     | Depende de T114/T115/T116          | Motor de simulación Monte Carlo/backtesting operativo |
| TEAM-05 | TurboPapus       | T118    | TEAM-05    | High     | Depende de T117                    | Servicio de alertas y stop-loss automático operativo |
| TEAM-05 | TurboPapus       | T119    | TEAM-05    | Medium   | Depende de T114/T115/T116/T117     | Módulo de reporting de cobertura disponible |
| TEAM-05 | TurboPapus       | T120    | TEAM-05    | Medium   | Depende de T114/T115/T116/T117     | Comparador de estrategias con recomendación operativo |
| TEAM-05 | TurboPapus       | T121    | TEAM-05    | Medium   | Depende de T060                    | Chat IA institucional/cobertura disponible |
| TEAM-06 | CodersTMNT      | T122    | TEAM-06    | High     | Depende de T059                    | Contrato de parámetros de noticias definido |
| TEAM-06 | CodersTMNT      | T123    | TEAM-06    | High     | Depende de T122                    | Integración multi-fuente de noticias/regulatorio operativa |
| TEAM-06 | CodersTMNT      | T124    | TEAM-06    | High     | Depende de T123                    | Clasificador de impacto noticioso operativo |
| TEAM-06 | CodersTMNT      | T125    | TEAM-06    | High     | Depende de T123                    | Correlación noticias con estructura técnica operativa |
| TEAM-06 | CodersTMNT      | T126    | TEAM-06    | High     | Depende de T124/T125               | API de noticias para overlay en velas publicada |
| TEAM-06 | CodersTMNT      | T127    | TEAM-06    | High     | Depende de T123                    | API regulatoria/institucional para confluencia publicada |
| TEAM-06 | CodersTMNT      | T128    | TEAM-06    | High     | Depende de Fase 2                  | Contrato base de estrategias Spread definido |
| TEAM-06 | CodersTMNT      | T129    | TEAM-06    | High     | Depende de T128                    | Core Protective Debit Spread operativo |
| TEAM-06 | CodersTMNT      | T130    | TEAM-06    | High     | Depende de T128                    | Core Credit Spread operativo            |
| TEAM-06 | CodersTMNT      | T131    | TEAM-06    | High     | Depende de T129/T130               | Motor de simulación transversal de spreads operativo |
| TEAM-06 | CodersTMNT      | T132    | TEAM-06    | High     | Depende de T131                    | Gestión de riesgo, alertas y stop-loss operativa |
| TEAM-06 | CodersTMNT      | T133    | TEAM-06    | Medium   | Depende de T129/T130/T131          | Reporting de spreads y métricas riesgo/beneficio disponible |
| TEAM-06 | CodersTMNT      | T134    | TEAM-06    | Medium   | Depende de T129/T130/T131          | Comparador Debit vs Credit con recomendación operativo |
| TEAM-06 | CodersTMNT      | T135    | TEAM-06    | High     | Depende de T126/T127/T129/T130     | Orquestador noticias-estrategias con ajuste de parámetros operativo |
| TEAM-06 | CodersTMNT      | T136    | TEAM-06    | Medium   | Depende de T060                    | Chat IA de noticias y spreads disponible |
| TEAM-07 | SixPackDevs       | T137    | TEAM-07    | High     | Depende de Fase 2                  | Contrato de orquestación AI multi-agente definido |
| TEAM-07 | SixPackDevs       | T138    | TEAM-07    | High     | Depende de T137                    | Strategy Registry con versionado semántico operativo |
| TEAM-07 | SixPackDevs       | T139    | TEAM-07    | High     | Depende de T137                    | Router multi-agente (Copilot/Gemini/Claude) operativo |
| TEAM-07 | SixPackDevs       | T140    | TEAM-07    | High     | Depende de T137                    | Policy Engine de investigación y fuentes confiables operativo |
| TEAM-07 | SixPackDevs       | T141    | TEAM-07    | High     | Depende de T138/T139/T140          | Pipeline de investigación híbrida con verificación operativa |
| TEAM-07 | SixPackDevs       | T142    | TEAM-07    | High     | Depende de T141                    | Report Engine profesional con gráficas operativo |
| TEAM-07 | SixPackDevs       | T143    | TEAM-07    | High     | Depende de T141                    | Evaluador de viabilidad de señales multi-core operativo |
| TEAM-07 | SixPackDevs       | T144    | TEAM-07    | High     | Depende de T142/T143               | API de orquestación AI publicada         |
| TEAM-07 | SixPackDevs       | T145    | TEAM-07    | High     | Depende de Fase 2                  | Contrato de estrategias de volatilidad definido |
| TEAM-07 | SixPackDevs       | T146    | TEAM-07    | High     | Depende de T145                    | Core Long Straddle operativo             |
| TEAM-07 | SixPackDevs       | T147    | TEAM-07    | High     | Depende de T145                    | Core Long Strangle operativo             |
| TEAM-07 | SixPackDevs       | T148    | TEAM-07    | High     | Depende de T145                    | Core Short Straddle con guardrails operativo |
| TEAM-07 | SixPackDevs       | T149    | TEAM-07    | High     | Depende de T145                    | Core Short Strangle con guardrails operativo |
| TEAM-07 | SixPackDevs       | T150    | TEAM-07    | High     | Depende de T146/T147/T148/T149     | Motor cuantitativo de volatilidad y simulación operativo |
| TEAM-07 | SixPackDevs       | T151    | TEAM-07    | High     | Depende de T150                    | Risk Engine con hard limits y kill-switch operativo |
| TEAM-07 | SixPackDevs       | T152    | TEAM-07    | Medium   | Depende de T144/T150/T151          | APIs dedicadas y comparador de volatilidad publicados |
| TEAM-08 | GlassCoke          | T153    | TEAM-08    | High     | Depende de Fase 2                  | Contrato base de estrategias complejas definido |
| TEAM-08 | GlassCoke          | T154    | TEAM-08    | High     | Depende de T153                    | Core Iron Condor (short/wide/delta) operativo |
| TEAM-08 | GlassCoke          | T155    | TEAM-08    | High     | Depende de T153                    | Core Iron Butterfly (short/broken) operativo |
| TEAM-08 | GlassCoke          | T156    | TEAM-08    | High     | Depende de T153                    | Core Butterfly Spread operativo         |
| TEAM-08 | GlassCoke          | T157    | TEAM-08    | High     | Depende de T153                    | Core Condor (call/put) operativo        |
| TEAM-08 | GlassCoke          | T158    | TEAM-08    | High     | Depende de T154/T155/T156/T157     | Simulación avanzada de estrategias complejas operativa |
| TEAM-08 | GlassCoke          | T159    | TEAM-08    | High     | Depende de T158                    | Risk Engine de estrategias complejas operativo |
| TEAM-08 | GlassCoke          | T160    | TEAM-08    | Medium   | Depende de T158/T159               | Visualización y reporting de estrategias complejas disponible |
| TEAM-08 | GlassCoke          | T161    | TEAM-08    | Medium   | Depende de T160                    | APIs dedicadas y comparador de estrategias complejas publicados |
| TEAM-09 | SquadISC           | T162    | TEAM-09    | High     | Depende de Fase 2                  | Contrato base Calendar/Diagonal definido |
| TEAM-09 | SquadISC           | T163    | TEAM-09    | High     | Depende de T162                    | Core Calendar Spread (call/put) operativo |
| TEAM-09 | SquadISC           | T164    | TEAM-09    | High     | Depende de T162                    | Core Diagonal Spread (call/put) operativo |
| TEAM-09 | SquadISC           | T165    | TEAM-09    | High     | Depende de T163/T164               | Simulación temporal Calendar/Diagonal operativa |
| TEAM-09 | SquadISC           | T166    | TEAM-09    | High     | Depende de T165                    | Risk Engine Calendar/Diagonal operativo |
| TEAM-09 | SquadISC           | T167    | TEAM-09    | Medium   | Depende de T165/T166               | Visualización y reporting Calendar/Diagonal disponible |
| TEAM-09 | SquadISC           | T168    | TEAM-09    | Medium   | Depende de T167                    | APIs dedicadas y comparador Calendar vs Diagonal publicados |
| TEAM-09 | SquadISC           | T169    | TEAM-09    | Medium   | Depende de T163/T164/T166          | Orquestador de roll/ajustes temporales operativo |
| TEAM-01 | DIANArchiTEC       | T170    | Cross-Team | High     | Depende de T152/T161/T168          | Estándar transversal de outputs de estrategias definido |
| TEAM-03 | SQLitoNo           | T171    | Cross-Team | Medium   | Depende de T170                    | Estrategias Long/Short Call/Put alineadas al estándar |
| TEAM-04 | DiviNoSQL          | T172    | Cross-Team | Medium   | Depende de T170                    | Estrategia Wheel alineada al estándar   |
| TEAM-05 | TurboPapus         | T173    | Cross-Team | Medium   | Depende de T170                    | Estrategias de cobertura alineadas al estándar |
| TEAM-06 | CodersTMNT         | T174    | Cross-Team | Medium   | Depende de T170                    | Estrategias Spread alineadas al estándar |
| TEAM-07 | SixPackDevs        | T175    | Cross-Team | Medium   | Depende de T170                    | Estrategias Volatility alineadas al estándar |
| TEAM-08 | GlassCoke          | T176    | Cross-Team | Medium   | Depende de T170                    | Estrategias complejas alineadas al estándar |
| TEAM-09 | SquadISC           | T177    | Cross-Team | Medium   | Depende de T170                    | Estrategias Calendar/Diagonal alineadas al estándar |

---

## Vista por Equipo

### TEAM-01
- alias: DIANArchiTEC
- tasks: T000, T001, T003, T005, T059, T006, T007, T008, T012, T013, T015, T016, T022, T023, T024, T026, T027, T028, T031, T032, T033, T034, T035, T036, T041, T042, T044, T046, T047, T048, T056, T057, T060, T061, T062, T063, T064, T065, T066, T067, T068, T170
- blocked_by: Ninguno fuera de dependencias del backlog
- contracts_owned: auth-context, broker-adapter
- contracts_consumed: signal-lifecycle

### TEAM-02
- alias: CocaDe6Lts
- tasks: T002, T004, T017, T018, T019, T020, T021, T025, T069, T070, T071, T072, T073, T074, T075, T076
- blocked_by: Fase 2, baseline de datos T059/T060 y contratos API de señales
- contracts_owned: ninguno
- contracts_consumed: auth-context, broker-adapter, signal-lifecycle

### TEAM-03
- alias: SQLitoNo
- tasks: T049, T050, T077, T078, T079, T080, T081, T082, T083, T084, T085, T086, T087, T088, T089, T090, T171
- blocked_by: Fase 2 (estrategias), T059 (fundamental), T060 (chat IA)
- contracts_owned: ninguno
- contracts_consumed: auth-context, signal-lifecycle

### TEAM-04
- alias: DiviNoSQL
- tasks: T029, T053, T091, T092, T093, T094, T095, T096, T097, T098, T099, T100, T101, T102, T103, T104, T105, T172
- blocked_by: T028, T059, T060 y salidas multi-core para pronóstico
- contracts_owned: ninguno
- contracts_consumed: broker-adapter, auth-context

### TEAM-05
- alias: TurboPapus
- tasks: T030, T054, T106, T107, T108, T109, T110, T111, T112, T113, T114, T115, T116, T117, T118, T119, T120, T121, T173
- blocked_by: T028 (Alpaca), T053 (MFA), T059 (Supabase schema), T060 (client repo)
- contracts_owned: coverageStrategyContract, institutionalContract
- contracts_consumed: broker-adapter, auth-context, signal-lifecycle

### TEAM-06
- alias: CodersTMNT
- tasks: T009, T010, T011, T014, T045, T122, T123, T124, T125, T126, T127, T128, T129, T130, T131, T132, T133, T134, T135, T136, T174
- blocked_by: Fase 2, T059/T060 para persistencia y contratos de confluencia multi-core
- contracts_owned: newsContract, spreadStrategyContract, signal-lifecycle base
- contracts_consumed: auth-context, broker-adapter, signal-lifecycle

### TEAM-07
- alias: SixPackDevs
- tasks: T037, T039, T043, T051, T052, T137, T138, T139, T140, T141, T142, T143, T144, T145, T146, T147, T148, T149, T150, T151, T152, T175
- blocked_by: Fase 2, T059/T060 para persistencia y salidas de otros cores para orquestación global
- contracts_owned: orchestrationContract, volatilityStrategyContract
- contracts_consumed: auth-context, broker-adapter, signal-lifecycle

### TEAM-08
- alias: GlassCoke
- tasks: T038, T040, T055, T058, T153, T154, T155, T156, T157, T158, T159, T160, T161, T176
- blocked_by: Fase 2, T059/T060 para persistencia y estandarización transversal T170
- contracts_owned: complexStrategyContract
- contracts_consumed: auth-context, broker-adapter, signal-lifecycle

### TEAM-09
- alias: SquadISC
- tasks: T162, T163, T164, T165, T166, T167, T168, T169, T177
- blocked_by: Fase 2, T059/T060 para persistencia y estandarización transversal T170
- contracts_owned: termStrategyContract
- contracts_consumed: auth-context, broker-adapter, signal-lifecycle

---

## Reglas

- Toda tarea tiene exactamente un equipo owner.
- T034 y T035 se reasignan a TEAM-01 para mantener consistencia del dashboard/flujo operativo en un solo owner de UX principal.
- Cualquier cambio en contratos compartidos requiere PR contract-first antes del PR de implementación.

---

## Estado

Cobertura de backlog: completa para T000-T177.
Este documento constituye la Asignación Canónica Equipo-Tarea para la iniciativa 001-inversions.




