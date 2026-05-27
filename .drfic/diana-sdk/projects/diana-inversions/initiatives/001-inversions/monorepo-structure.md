# Estructura Canónica del Monorepo

**Tarea**: T000  
**Iniciativa**: 001-inversions  
**Propósito**: Definir la estructura oficial del monorepo `inversions_app_pwa`, criterios de reutilización, ownership y reglas de dependencia.

---

## Árbol Canónico

```text
inversions_app_pwa/
│
└── projects/                           # Portafolio completo de proyectos y shared code
    ├── packages/                       # Librerías/código reutilizable para cualquier proyecto
    │   ├── ui-library/                 # Librería interna de componentes UI (React + TailwindCSS)
    │   │   ├── src/
    │   │   │   ├── components/         # Componentes agnósticos de dominio (Button, Card, Modal, etc)
    │   │   │   ├── hooks/              # Hooks reutilizables (useModal, useForm, etc)
    │   │   │   ├── utils/              # Helpers (styling, animations, etc)
    │   │   │   └── index.ts
    │   │   ├── package.json
    │   │   ├── tsconfig.json
    │   │   └── README.md
    │   ├── utils/                      # Funciones utilitarias compartidas (helpers, validators, formatters)
    │   │   ├── src/
    │   │   │   ├── validators/         # Validadores agnósticos (email, date, número, etc)
    │   │   │   ├── formatters/         # Formateadores (moneda, fecha, número, etc)
    │   │   │   ├── parsers/            # Parseadores (CSV, JSON, etc)
    │   │   │   └── index.ts
    │   │   ├── package.json
    │   │   ├── tsconfig.json
    │   │   └── README.md
    │   └── types/                      # Tipos TypeScript globales compartidos
    │       ├── src/
    │       │   ├── domain/             # Tipos de dominio compartido (Usuario, Activo, etc)
    │       │   ├── common/             # Tipos comunes (HTTP, pagination, etc)
    │       │   └── index.ts
    │       ├── package.json
    │       ├── tsconfig.json
    │       └── README.md
    │
    ├── pwa/                            # Todos los proyectos PWA del portafolio
    │   └── inversions_app/             # Proyecto: Plataforma de Inversiones IA (Vite + React 18)
    │       ├── public/
    │       ├── data/                   # Contratos/modelos de referencia por base de datos
    │       │   ├── supabase/
    │       │   │   ├── models/         # Modelos de datos (Usuario, SenalConfluente, etc)
    │       │   │   ├── schema/         # Definiciones de tablas
    │       │   │   └── data/           # Seeds/fixtures
    │       │   ├── mongodb/
    │       │   │   ├── models/
    │       │   │   ├── schema/
    │       │   │   └── data/
    │       │   └── ...                 # Otras BD si aplica
    │       ├── src/                    # Código ejecutable de la PWA
    │       │   ├── assets/             # Imágenes, fuentes, SVGs
    │       │   ├── components/         # Componentes específicos de la app (NO reutilizables)
    │       │   │   └── ui/             # Componentes que envuelven ui-library
    │       │   ├── features/           # Módulos de funcionalidad por dominio (reutiliza componentes)
    │       │   │   ├── dashboard/      # Feature: Dashboard principal
    │       │   │   ├── market-scanner/ # Feature: Scanner de mercado
    │       │   │   ├── options-chain/  # Feature: Cadena de opciones
    │       │   │   ├── signals/        # Feature: Gestión de señales
    │       │   │   ├── portfolio/      # Feature: Portafolio
    │       │   │   ├── broker-connect/ # Feature: Integración con brokers
    │       │   │   ├── backtesting/    # Feature: Backtesting
    │       │   │   ├── execution/      # Feature: Ejecución y aprobación
    │       │   │   ├── audit/          # Feature: Auditoría
    │       │   │   └── alerts/         # Feature: Alertas
    │       │   ├── hooks/              # Custom hooks específicos de la app
    │       │   ├── layouts/            # Layouts de página
    │       │   ├── pages/              # Páginas (mapean a routes)
    │       │   ├── routes/             # Configuración de rutas
    │       │   ├── services/           # Servicios: integración con backend y 3ros
    │       │   │   ├── broker/         # Servicio de integración con brokers (IBKR, Alpaca)
    │       │   │   ├── market-data/    # Servicio de datos de mercado
    │       │   │   ├── indicators/     # Servicio de indicadores técnicos
    │       │   │   ├── technical-analysis/
    │       │   │   ├── fundamental-analysis/
    │       │   │   ├── ai-analysis/    # Servicio de análisis IA
    │       │   │   ├── institutional-analysis/
    │       │   │   ├── news/           # Servicio de noticias
    │       │   │   ├── strategies/     # Servicio de estrategias
    │       │   │   └── signals/        # Servicio de señales (orquestación)
    │       │   ├── store/              # Estado global (Zustand)
    │       │   ├── styles/             # Estilos globales (TailwindCSS config)
    │       │   ├── utils/              # Utilidades específicas de app
    │       │   ├── types/              # Tipos específicos de app
    │       │   ├── App.tsx
    │       │   ├── main.tsx
    │       │   └── vite-env.d.ts
    │       ├── tests/
    │       │   ├── unit/               # Tests unitarios de servicios y hooks
    │       │   ├── components/         # Tests de componentes React
    │       │   ├── integration/        # Tests de integración (feature workflows)
    │       │   └── e2e/                # Tests end-to-end
    │       ├── index.html
    │       ├── package.json
    │       ├── tsconfig.json
    │       ├── vite.config.ts
    │       └── README.md
    │
    └── rest-api/                       # Todos los proyectos REST API del portafolio
        └── inversions_api/  # Persistencia real y exposición de endpoints (Express + Node.js 22)
            ├── src/
            │   ├── routes/             # Endpoints REST por recurso
            │   │   ├── dashboard/      # /api/dashboard/*
            │   │   ├── signals/        # /api/signals/*
            │   │   ├── execution/      # /api/execution/*
            │   │   ├── audit/          # /api/audit/*
            │   │   ├── brokers/        # /api/brokers/*
            │   │   └── ...
            │   ├── modules/            # Módulos de lógica de negocio por dominio
            │   │   ├── signals/        # Orquestación de señales y confluencia
            │   │   ├── execution/      # Aprobación, ejecución y fail-fast
            │   │   ├── brokers/        # Integración con brokers IBKR y Alpaca
            │   │   ├── strategies/     # Orquestación de estrategias
            │   │   ├── audit/          # Historial y auditoría
            │   │   └── ...
            │   ├── repositories/       # Patrones base de acceso a datos
            │   │   ├── baseRepository.ts
            │   │   └── ...
            │   ├── database/           # Capa de conexión y migraciones
            │   │   ├── supabase/
            │   │   │   ├── client.ts   # Cliente Supabase compartido
            │   │   │   ├── migrations/ # Migraciones versionadas
            │   │   │   └── scripts/    # Scripts de setup/rollback
            │   │   └── mongodb/        # (opcional) para históricos y contextos IA
            │   ├── middleware/         # Middlewares transversales
            │   │   ├── authContext.ts  # JWT + RLS claims
            │   │   ├── rbac.ts         # Control de acceso por rol
            │   │   ├── mfaGuard.ts     # MFA
            │   │   ├── rateLimit.ts    # Rate limiting
            │   │   └── errorHandler.ts
            │   ├── config/             # Configuración global
            │   │   ├── environment.ts  # Bootstrap seguro
            │   │   ├── envValidator.ts # Validación de .env
            │   │   ├── dataGovernance.ts # Retención, partición
            │   │   ├── dependencySlo.ts  # Políticas de resiliencia
            │   │   └── ...
            │   ├── domain/             # Lógica agnóstica de frameworks
            │   │   ├── versioning.ts   # Optimistic locking
            │   │   └── ...
            │   ├── observability/      # Observabilidad transversal
            │   │   ├── logger.ts       # Logs estructurados
            │   │   ├── metrics.ts      # Métricas (decision_latency, etc)
            │   │   ├── traces.ts       # Distributed tracing (trace_id, senal_id)
            │   │   └── ...
            │   ├── types/              # Tipos TypeScript del backend
            │   ├── utils/              # Utilidades del backend
            │   ├── main.ts             # Punto de entrada
            │   └── app.ts              # Configuración de app (Express)
            ├── tests/
            │   ├── unit/               # Tests unitarios de servicios y repos
            │   ├── integration/        # Tests de endpoints y workflows
            │   └── e2e/                # Tests end-to-end
            ├── DATABASE_CONFIG.yaml    # Configuración de BD por ambiente
            ├── .env.example
            ├── package.json
            ├── tsconfig.json
            └── README.md
```

**Capacidad de Escalado:**
- ✅ Múltiples PWAs bajo `projects/pwa/` (ej: `inversions_app/`, `crypto_portfolio_app/`, etc)
- ✅ Múltiples REST APIs bajo `projects/rest-api/` (ej: `inversions_api/`, `rest_api_reports/`, etc)
- ✅ Código compartido centralizado en `projects/packages/` usado por todos
│   │       ├── public/
│   │       ├── data/                   # Contratos y modelos de referencia
│   │       │   ├── supabase/
│   │       │   │   ├── models/
│   │       │   │   ├── schema/
│   │       │   │   └── data/
│   │       │   ├── mongodb/
│   │       │   └── ...
│   │       ├── src/
│   │       │   ├── assets/
│   │       │   ├── components/         # Componentes específicos de la app (no reutilizables)
│   │       │   │   └── ui/
│   │       │   ├── features/           # Módulos de funcionalidad por dominio
│   │       │   │   ├── dashboard/
│   │       │   │   ├── market-scanner/
│   │       │   │   ├── options-chain/
│   │       │   │   ├── signals/
│   │       │   │   ├── portfolio/
│   │       │   │   ├── broker-connect/
│   │       │   │   ├── backtesting/
│   │       │   │   └── alerts/
│   │       │   ├── hooks/
│   │       │   ├── layouts/
│   │       │   ├── pages/
│   │       │   ├── routes/
│   │       │   ├── services/           # Servicios específicos de negocio
│   │       │   │   ├── broker/
│   │       │   │   ├── market-data/
│   │       │   │   ├── indicators/
│   │       │   │   ├── technical-analysis/
│   │       │   │   ├── fundamental-analysis/
│   │       │   │   ├── ai-analysis/
│   │       │   │   ├── institutional-analysis/
│   │       │   │   ├── news/
│   │       │   │   └── strategies/
│   │       │   ├── store/              # Estado global (Zustand)
│   │       │   ├── styles/
│   │       │   ├── utils/              # Utilidades específicas de app
│   │       │   ├── types/              # Tipos específicos de app
│   │       │   ├── App.tsx
│   │       │   ├── main.tsx
│   │       │   └── vite-env.d.ts
│   │       ├── tests/
│   │       │   ├── unit/
│   │       │   ├── components/
│   │       │   ├── integration/
│   │       │   └── e2e/
│   │       ├── index.html
│   │       ├── package.json
│   │       ├── tsconfig.json
│   │       ├── vite.config.ts
│   │       ├── vitest.config.ts
│   │       └── README.md
│   └── rest-api/                       # Todos los proyectos REST API del portafolio
│       └── inversions_api/  # API REST: Persistencia y orquestación de backend
│           ├── src/
│           │   ├── database/           # Capa de acceso a datos
│           │   │   ├── supabase/
│           │   │   │   ├── client.ts   # Cliente Supabase compartido
│           │   │   │   ├── migrations/
│           │   │   │   └── scripts/
│           │   │   └── mongodb/        # (opcional) para históricos y contextos IA
│           │   ├── repositories/       # Patrones de acceso a datos
│           │   │   ├── baseRepository.ts
│           │   │   └── ...
│           │   ├── modules/            # Módulos de negocio por dominio
│           │   │   ├── signals/
│           │   │   ├── execution/
│           │   │   ├── brokers/
│           │   │   ├── strategies/
│           │   │   ├── audit/
│           │   │   └── ...
│           │   ├── routes/             # Endpoints REST por recurso
│           │   │   ├── dashboard/
│           │   │   ├── signals/
│           │   │   ├── execution/
│           │   │   ├── audit/
│           │   │   └── ...
│           │   ├── middleware/         # Middlewares: autenticación, autorización, etc
│           │   │   ├── authContext.ts
│           │   │   ├── rbac.ts
│           │   │   ├── mfaGuard.ts
│           │   │   ├── rateLimit.ts
│           │   │   └── ...
│           │   ├── config/             # Configuración global
│           │   │   ├── environment.ts
│           │   │   ├── envValidator.ts
│           │   │   ├── dataGovernance.ts
│           │   │   ├── dependencySlo.ts
│           │   │   └── ...
│           │   ├── domain/             # Lógica de dominio agnóstica de frameworks
│           │   │   ├── versioning.ts   # Optimistic locking
│           │   │   └── ...
│           │   ├── observability/      # Observabilidad, métricas, logs
│           │   │   ├── logger.ts
│           │   │   ├── metrics.ts
│           │   │   ├── traces.ts
│           │   │   └── ...
│           │   ├── types/              # Tipos TypeScript compartidos del backend
│           │   ├── utils/              # Utilidades del backend
│           │   ├── main.ts             # Punto de entrada
│           │   └── app.ts              # Configuración de app (Express)
│           ├── tests/
│           │   ├── unit/
│           │   ├── integration/
│           │   └── e2e/
│           ├── DATABASE_CONFIG.yaml
│           ├── .env.example
│           ├── package.json
│           ├── tsconfig.json
│           ├── vitest.config.ts
│           └── README.md
├── specs/                              # Especificaciones y planificación de features
│   ├── 001-plataforma-inversiones-ia/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   ├── tasks.md
│   │   ├── research.md
│   │   ├── data-model.md
│   │   ├── quickstart.md
│   │   ├── checklists/
│   │   └── contracts/
│   ├── 002-team-01-dashboard-brokers/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   ├── tasks.md
│   │   ├── checklists/
│   │   └── contracts/
│   └── ...
├── scripts/                            # Scripts de operación, validación, build
│   ├── validate-structure.ps1          # Gate de validación estructural
│   ├── diana-sync-team.ps1             # Sincronización Diana -> Speckit
│   └── ...
├── .github/                            # Agentes y prompts de Diana
│   ├── agents/
│   ├── prompts/
│   └── ...
├── .drfic/                             # SDK de Diana (no commiteable a menos que sea setup)
│   └── diana-sdk/
│       └── projects/diana-inversions/
├── .specify/                           # Especkit configuración
│   ├── extensions/
│   ├── scripts/
│   └── ...
├── tests/                              # Tests de integración end-to-end
├── package.json                        # Workspace root (monorepo)
├── tsconfig.json                       # TypeScript base config
├── .gitignore
└── README.md
```

---

## Criterios de Reutilización

### `projects/packages/` → Librerías Compartidas

**Cuándo poner código aquí:**
- Componentes React reutilizables en múltiples features o apps PWA
- Funciones utilidad que aplican a múltiples proyectos (formatters, validators, helpers)
- Tipos TypeScript globales que usan múltiples módulos
- Lógica agnóstica del contexto (ej: cálculos matemáticos, conversiones)

**Criterios de inclusión:**
- Sin dependencias de negocio específico (no conoce de "señales", "brokers", etc)
- Sin efectos secundarios (no hace llamadas a APIs, no lee/escribe en storage)
- Documentada y con tests básicos (≥ 70% cobertura)
- Tiene al menos 2 consumidores confirmados en el monorepo

**Naming:**
- Nombres genéricos, agnósticos de dominio: `ui-library`, `utils`, `types`
- Versión en package.json para rastrear cambios
- Changelog en README.md

### `projects/pwa/inversions_app/` → Frontend PWA

**Cuándo poner código aquí:**
- Componentes específicos del dominio de inversiones
- Servicios que consumen APIs REST específicas
- Features que integran múltiples servicios de backend
- Lógica de presentación y UX

**Estructura:**
- `src/features/` agrupa por dominio: `dashboard`, `signals`, `execution`, `audit`, etc
- `src/services/` encapsula consumo de APIs y lógica de negocio frontend
- `src/hooks/` reutiliza estado y efectos dentro de la app
- `src/components/` (dentro de features) son específicos; si son reutilizables, suben a `packages/ui-library`

### `projects/rest-api/inversions_api/` → Backend REST API

**Cuándo poner código aquí:**
- Módulos de negocio: `signals`, `execution`, `brokers`, `audit`, `strategies`
- Persistencia: repositorios, migraciones, esquemas
- Endpoints REST que exponen servicios
- Middlewares: autenticación, autorización, rate limiting
- Configuración global del servidor

**Estructura:**
- `src/modules/` agrupa por dominio funcional
- `src/routes/` agrupa por recurso REST (no por módulo)
- `src/database/` centraliza Supabase, MongoDB, etc
- `src/middleware/` solo middlewares transversales
- `src/config/` configuración global y validación

---

## Ownership y Responsabilidades

### Package Owner (Responsable por `projects/packages/`)

**Responsable:** Equipo de Plataforma / Tech Lead  
**Tareas:**
- Revisar PRs que agregan código a packages
- Mantener documentación de interfaces públicas
- Asegurar compatibilidad semántica (no breaking changes sin mayor version)
- Coordinar upgrades de paquetes

### PWA Owner (Responsable por `projects/pwa/inversions_app/`)

**Responsable:** TEAM-01 (inicialmente) / Tech Lead PWA  
**Tareas:**
- Mantener calidad de componentes y servicios
- Coordinar features entre features
- Asegurar tests ≥ 80% en features críticas
- Revisar consumo de APIs y manejo de errores

### Backend Owner (Responsable por `projects/rest-api/`)

**Responsable:** TEAM-01 (inicialmente) / Tech Lead Backend  
**Tareas:**
- Mantener calidad de módulos y persistencia
- Coordinar versionado de migraciones
- Asegurar observabilidad y logging estructurado
- Revisar endpoints y contratos

---

## Reglas de Dependencia

### ✅ Permitido

```
packages/ui-library → packages/utils
packages/ui-library → packages/types
packages/utils → packages/types

pwa/inversions_app → packages/*
pwa/inversions_app → rest-api (via HTTP)

rest-api → packages/types
rest-api → external (supabase, brokers, etc)
```

### ❌ Prohibido

```
packages/* → pwa              # Los packages no conocen de apps específicas
packages/* → rest-api         # Los packages son independientes
pwa → rest-api (imports)      # Pwa consume REST API via HTTP, no imports directos
rest-api → pwa                # Backend no importa de frontend

Circular: A → B → A
```

---

## Checklist de Conformidad (T000)

- [ ] Estructura de carpetas match árbol canónico (validar con `scripts/validate-structure.ps1`)
- [ ] Cada paquete en `projects/packages/` tiene `package.json` y README.md
- [ ] Cada módulo en `rest-api/src/modules/` documentado en README
- [ ] Cada feature en `pwa/src/features/` documentado en README
- [ ] No existen imports circulares (validar con `eslint`)
- [ ] Tests ≥ 70% en `packages/`, ≥ 80% en features críticas (`dashboard`, `signals`, `execution`, `audit`)
- [ ] Observabilidad: todos los endpoints tienen logs estructurados con `trace_id`
- [ ] Versionado: todos los paquetes tienen changelog
- [ ] Documentación: README.md en raíz de cada paquete, módulo y feature

---

## Próximos Pasos (Post-T000)

1. **T001-T003 (Speckit Phase 1)**: Consolidan alcance técnico, trazabilidad y validación
2. **T004-T011 (Speckit Phase 2)**: Implementan infraestructura base de persistencia, auth, contrato transversal
3. **T012+ (Speckit Phase 3+)**: Implementan features específicas (US1, US2, US3)

Una vez T000 está completo y validado, todos los equipos (TEAM-01, TEAM-02, etc) conocen exactamente dónde poner código y cómo estructurarlo.

---

## Referencias

- **Monorepo Package**: [projects/packages/](../../packages/)
- **PWA**: [projects/pwa/inversions_app/](../../pwa/inversions_app/)
- **Backend REST API**: [projects/rest-api/inversions_api/](../../rest-api/inversions_api/)
- **Specs Feature 001**: [specs/001-plataforma-inversiones-ia/](../../specs/001-plataforma-inversiones-ia/)
- **Specs Feature 002**: [specs/002-team-01-dashboard-brokers/](../../specs/002-team-01-dashboard-brokers/)
- **Validación**: [scripts/validate-structure.ps1](../../scripts/validate-structure.ps1)
