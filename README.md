# Card PokeAPI

Pokédex moderno construido sobre PokéAPI, con data layer robusto, filtros avanzados y UI responsiva.

Demo: `TODO` (agregar link de deploy cuando esté disponible)

**Features**
- Listado con paginación, prefetch y cache.
- Cards con imagen, tipos y stats resumidas.
- Detalle deep‑link `/pokemon/:name`.
- Búsqueda con debounce.
- Filtros por tipo y generación.
- Orden por id, nombre y stats.
- URL state: búsqueda, filtros y orden persistidos en query params.
- Skeleton loaders, estados empty/error y retry.
- Dark mode con toggle.

**Stack**
- Next.js (App Router) + TypeScript
- Zod para DTOs
- Vitest + Testing Library
- MSW para mocks de API
- Playwright para E2E
- ESLint + Prettier + Husky + lint-staged

**Scripts**
- `npm install`
- `npm run dev`
- `npm run test`
- `npm run build`
- `npm run lint`
- `npm run test:e2e` (requiere `npx playwright install`)
- `npm run perf:lighthouse` (requiere servidor en `http://localhost:3000`)

**Arquitectura (diagrama simple)**
```
UI (app router)
  └─ features/pokedex/ui
       ├─ components (Card, Grid, Pagination, Skeleton)
       └─ pages (Listado, Detalle)
            └─ hooks (usePokemonList, usePokemonDetail)
                 └─ api (pokeapi.service)
                      ├─ http client (cache + dedupe + retries + SWR)
                      └─ DTOs (Zod) + mappers (model)
```

**Decisiones técnicas clave**
- Cache en memoria + dedupe + retries + timeouts para minimizar latencia y errores.
- SWR para mostrar datos inmediatos y refrescar en background.
- DTOs validados con Zod antes de mapear a modelos internos.
- Virtualización condicional para listas grandes.

**Testing**
- Unit: mappers + http client.
- Integration (UI): render, búsqueda y filtros.
- E2E: listado, navegación a detalle y búsqueda (Playwright).
- Mocks de API con MSW (no se llama a PokéAPI en tests).

**CI**
- GitHub Actions: `lint`, `test`, `build` en push y PR.

**Deploy**
- Recomendado: Vercel.
- Configuración: conectar repo y usar los scripts por defecto de Next.js.

**Observabilidad (opcional)**
- Sentry recomendado.
- Variables de entorno: `SENTRY_DSN`, `SENTRY_ENV`, `SENTRY_TRACES_SAMPLE_RATE`.

**PWA (opcional)**
- Se puede añadir Service Worker con estrategia cache‑first para assets.
- Se puede añadir SWR para datos en cache.

**Notas**
- El folder `legacy/` conserva el HTML/JS original.
