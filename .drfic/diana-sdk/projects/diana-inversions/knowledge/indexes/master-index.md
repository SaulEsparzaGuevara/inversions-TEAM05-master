# Diana Inversiones — Índice Maestro de Knowledge (Proyecto Level)

> **Para Speckit**: Lee este archivo al inicio de Phase 0 para enriquecer tu contexto con conocimiento profundo del dominio de inversiones.
> Si un tema no está cubierto aquí, continúa con tu metodología de investigación normal.

**Versión**: 0.1.0  
**Última actualización**: 2026-04-27  
**Proyecto**: diana-inversions  
**Stack**: IBKR + Alpaca | Supabase | React 18 | Node.js 22

---

## Documentos Disponibles

### Dominio — Finanzas e Inversiones

| ID | Archivo | Descripción | Estado |
|----|---------|-------------|--------|
| INV-D-001 | `local/domain/001-order-lifecycle.md` | Ciclo de vida de una orden: Market y Limit, estados, transiciones | 🟢 Completo |
| INV-D-002 | `local/domain/002-market-data.md` | Fuentes de datos de mercado, latencia, p95<=1s, proveedores | 🟢 Completo |
| INV-D-003 | `local/domain/003-portfolio-analytics.md` | Cálculo de portfolio, P&L, métricas de riesgo básicas | 🟢 Completo |

### Brokers — Integración Técnica

| ID | Archivo | Descripción | Estado |
|----|---------|-------------|--------|
| INV-B-001 | `local/brokers/001-ibkr-tws-api.md` | IBKR TWS API: autenticación, órdenes, market data, límites | 🟢 Completo |
| INV-B-002 | `local/brokers/002-ibkr-client-portal.md` | IBKR Client Portal API: REST endpoints, OAuth, sesiones | 🟢 Completo |
| INV-B-003 | `local/brokers/003-alpaca-api.md` | Alpaca Trading API: Paper trading, live, webhooks, límites | 🟢 Completo |

### Compliance

| ID | Archivo | Descripción | Estado |
|----|---------|-------------|--------|
| INV-C-001 | `local/compliance/001-non-advisory-disclaimer.md` | Textos legales: plataforma informativa, no asesora (FR-013) | 🟢 Completo |
| INV-C-002 | `local/compliance/002-data-retention-mx.md` | Retención 365 días, eliminación de datos, LFPDPPP México | 🟢 Completo |

### Patrones Técnicos

| ID | Archivo | Descripción | Estado |
|----|---------|-------------|--------|
| INV-P-001 | `local/patterns/001-jwt-supabase-auth.md` | JWT Bearer + Supabase: flujo completo, refresh, seguridad | 🟢 Completo |
| INV-P-002 | `local/patterns/002-realtime-market-feed.md` | WebSocket market data: Supabase Realtime + broker feeds | 🟢 Completo |

### Cores de Analisis Avanzado

| ID | Archivo | Descripción | Estado |
|----|---------|-------------|--------|
| INV-CORE-001 | `local/cores/001-technical-analysis-core.md` | Core de análisis técnico: tendencia, soportes, resistencias e indicadores | 🟢 Completo |
| INV-CORE-002 | `local/cores/002-fundamental-analysis-core.md` | Core de análisis fundamental: calidad, valuación y riesgo evento | 🟢 Completo |
| INV-CORE-003 | `local/cores/003-buy-sell-signals-core.md` | Core de generación de señales buy/sell con gestión de riesgo | 🟢 Completo |
| INV-CORE-004 | `local/cores/004-options-strategies-core.md` | Core de estrategias de opciones: Wheel, Straddle, Iron Condor | 🟢 Completo |
| INV-CORE-005 | `local/cores/005-institutional-options-flow-core.md` | Core de flujo institucional por strike y expiración | 🟢 Completo |
| INV-CORE-006 | `local/cores/006-realtime-news-core.md` | Core de noticias en tiempo real con impacto por activo | 🟢 Completo |
| INV-CORE-007 | `local/cores/007-ai-confluence-orchestrator-core.md` | Core de confluencia IA para fusionar todos los cores activos | 🟢 Completo |

---

## Fuentes Remotas Registradas

Ver `remote/sources.md` para el catálogo completo.

---

## Estado de Cobertura

| Área | Estado | Acción recomendada |
|------|--------|-------------------|
| Order lifecycle | 🟢 Completo | Mantener actualizado con cambios de broker/state machine |
| Market data | 🟢 Completo | Revisar SLO p95 tras cambios de infraestructura |
| Portfolio analytics | 🟢 Completo | Revisar metodología de P&L y reconciliación periódica |
| IBKR TWS API | 🟢 Completo | Revisar cuando cambien SDKs o versiones gateway |
| IBKR Client Portal | 🟢 Completo | Revisar cambios de sesión, endpoints y políticas IBKR |
| Alpaca API | 🟢 Completo | Revisar límites y cambios de endpoint periódicamente |
| Non-advisory disclaimer | 🟢 Completo | Validar consistencia legal en UI release notes |
| Data retention MX | 🟢 Completo | Auditar jobs de retención y borrado trimestral |
| JWT + Supabase auth | 🟢 Completo | Revisar política de refresh y hardening de sesión |
| Realtime market feed | 🟢 Completo | Monitorear p95 y failover en producción |
| Technical analysis core | 🟢 Completo | Calibrar umbrales por mercado y temporalidad |
| Fundamental analysis core | 🟢 Completo | Actualizar factores por sector y régimen macro |
| Buy/Sell signals core | 🟢 Completo | Versionar reglas y validar estabilidad de señal |
| Options strategies core | 🟢 Completo | Revisar margen y riesgos por estrategia |
| Institutional options flow core | 🟢 Completo | Validar calidad de datos OI/volumen por proveedor |
| Realtime news core | 🟢 Completo | Afinar filtros de relevancia y credibilidad |
| AI confluence orchestrator core | 🟢 Completo | Re-entrenar pesos por perfil de usuario y horizonte |

**Leyenda**: 🟢 Completo · 🟡 Esqueleto · 🔴 Faltante

---

## Instrucciones de Consumo para Speckit

```
SI master-index.md tiene documentos relevantes para la feature activa:
  → Leer los documentos marcados como 🟢 Completo
  → Usar como contexto de dominio en Phase 0
SI un documento está en 🟡 Esqueleto:
  → Ignorar su contenido vacío, continuar con investigación propia
SI hay áreas no cubiertas:
  → Proceder con investigación propia (metodología normal de Phase 0)
  → NO bloquear el plan por falta de conocimiento local
```
