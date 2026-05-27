# Research: 007-team-05-frontend-cobertura

## Phase 0 Output

Todas las dependencias técnicas y requerimientos funcionales fueron validados y clarificados mediante `speckit.clarify` y la especificación de `spec.md`.

- **react-router-dom v6**: Se usará para el routing global.
- **lightweight-charts**: Validado; ya existe en el proyecto PWA y soporta el renderizado dinámico de payoff charts para opciones financieras (las simulaciones Monte Carlo se mapean a Price/Value arrays).
- **Store con `useSyncExternalStore`**: Validado para la persistencia del estado en el Chat IA, siguiendo el mismo patrón que `src/store/signals.ts` existente. No se necesita Zustand ni ninguna librería externa de estado.
- **Polling Backend**: Degradación visual confirmada y modelada a un máximo de 15 reintentos x 2s.

*Todos los Needs Clarification fueron resueltos en spec.md.*