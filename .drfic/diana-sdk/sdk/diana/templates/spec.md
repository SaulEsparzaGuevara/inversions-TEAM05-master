# Especificación Canónica
## <nombre-de-la-iniciativa>

---

## 1. Objetivo

Describir de forma clara y no ambigua **qué debe hacer el sistema** como resultado de esta iniciativa.

---

## 2. Contexto

Breve descripción del problema u oportunidad que se atiende.

(No incluir tickets ni control de cambios aquí)

---

## 3. Alcance

Incluye:
- Comportamientos esperados
- Capacidades funcionales

Excluye:
- Detalles de implementación
- Decisiones técnicas internas

---

## 4. Requisitos Funcionales

- RF‑01:
- RF‑02:
- RF‑03:

---

## 5. Requisitos No Funcionales

- RNF‑01: Seguridad
- RNF‑02: Rendimiento
- RNF‑03: Auditoría
- RNF‑04: Escalabilidad

---

## 6. Contrato de Experiencia y Controles (cuando aplique UI)

Definir explícitamente por atributo funcional:
- Tipo de control esperado (arbol, tabla, chart, combobox, etc.)
- Comportamiento al interactuar (selección, cambio, clic)
- Fuente de datos esperada por control
- Criterios de usabilidad/legibilidad del workspace

Ejemplo (workspace de trading):
- Watchlist tree por categorías de mercado
- Superchart de velas con overlay de señales
- Tabla de confluencia con columnas dinámicas por configuración

---

## 7. Fuentes de Datos y Modos de Operación

Definir:
- Dominios de datos (ej. instrumentos, histórico OHLC, indicadores, alertas)
- Reglas de enrutamiento por dominio a proveedor/fuente
- Modos operativos (ej. online/offline, demo/real)
- Estrategia de fallback/caché ante degradación

Ejemplo:
- symbols: API broker -> catálogo local
- OHLC: API histórica -> cache local
- modos: online/offline y demo/real

---

## 8. Configurabilidad Evolutiva

Definir si el artefacto requiere:
- Catálogos/config registries para campos/columnas/opciones
- Evolución sin cambios de código (agregar/quitar/reordenar)
- Presets por rol/usuario
- Compatibilidad ante retiro de campos

Ejemplo:
- Registro de columnas (`confluence_column_configs`)
- Presets por rol/usuario (`confluence_view_presets`)

---

## 9. Restricciones

- Restricciones legales
- Restricciones técnicas
- Restricciones organizacionales

---

## 10. Supuestos

- Supuesto explícito 1
- Supuesto explícito 2

---

## 11. Fuera de Alcance

Listado explícito de lo que **no** hace esta iniciativa.

---

## 12. Criterios de Aceptación

- CA‑01:
- CA‑02:
- CA‑03:

---

## Estado

Este documento constituye la **Especificación Canónica** de la iniciativa.

---
``