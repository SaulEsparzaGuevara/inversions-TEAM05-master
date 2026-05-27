# Quickstart: 007-team-05-frontend-cobertura

## Inicialización y Flujo

1. Instalar `react-router-dom`:
   ```bash
   cd projects/pwa/inversions_app
   npm install react-router-dom
   ```

2. Arrancar la API existente (`rest-api` del team-05):
   ```bash
   cd projects/rest-api/inversions_api
   npm run dev
   ```

3. Arrancar la PWA:
   ```bash
   cd projects/pwa/inversions_app
   npm run dev
   ```

## Workflow de Desarrollo Componentes

- Los nuevos servicios deben ir en `src/services/institutional/` y `src/services/coverage/`, y **asegurar** importar `getAuthHeaders()` centralizado.
- El chat se estructura creando primero `src/store/chat.ts` (usando `useSyncExternalStore` como `signals.ts`), proveyéndolo a la página `/ai/chat`, y construyendo visualmente la UI con `PollIndicator` y fallback manual.

## Running Tests

```bash
cd projects/pwa/inversions_app
npm run test
npm run lint
```