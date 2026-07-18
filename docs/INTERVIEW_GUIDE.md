# SiteForge: Architecture and Interview Guide

## One-minute explanation

SiteForge is a full-stack construction-project management MVP. The React single-page application handles sign-in, project browsing, project phases, and budget views. Express exposes a JSON REST API. PostgreSQL stores the durable business entities, while the Phase 2 resource/budget-line prototype uses a small in-memory store. Authentication uses a short-lived access JWT and an HTTP-only refresh-token cookie. Docker Compose runs PostgreSQL, the API, and an Nginx-served React build as one application at `http://localhost:5173`.

## Repository map

| Path | Purpose |
| --- | --- |
| `client/` | Vite + React frontend. |
| `client/src/main.jsx` | Browser entry point; creates the React root and loads global CSS. |
| `client/src/App.jsx` | Router, page-level components, navigation, and login/register form handling. |
| `client/src/context/` | Authentication provider, context definition, and `useAuth` hook. |
| `client/src/api/client.js` | Shared `fetch` wrapper; adds JSON headers, cookie support, and bearer token. |
| `client/src/components/` | Reusable UI: protected-route guard and the budget-line form. |
| `client/src/pages/` | Data-fetching project list and project-detail views. |
| `client/src/index.css` | Tailwind import plus app-wide baseline styles. `App.css` is legacy starter CSS and is not imported. |
| `server/server.js` | Small process bootstrap: listens with the Express app. |
| `server/src/app.js` | Express middleware stack and route mounting. |
| `server/src/routes/` | HTTP-layer route handlers. |
| `server/src/services/` | PostgreSQL access and transaction logic. |
| `server/src/middleware/` | JWT authentication, role authorization, and consistent errors. |
| `server/src/db/pool.js` | Shared `pg` connection pool. |
| `server/migrations/001_init_schema.sql` | PostgreSQL schema. |
| `server/src/data/store.js` | In-memory prototype state used only by `phase2Routes.js`. |
| `docker-compose.yml` | Local three-service deployment topology. |

## Frontend flow

`main.jsx` calls `createRoot(...).render(<App />)`. `App` composes `AuthProvider`, `BrowserRouter`, and `AppRoutes`. Public routes are `/login` and `/register`; `/dashboard`, `/projects`, and `/projects/:projectId` are wrapped by `ProtectedRoute`. An unknown URL redirects to `/login`.

`AuthProvider` owns `user`, `accessToken`, and `loading`. Login and registration call the auth API and save both returned values. On a page refresh, it posts to `/api/auth/refresh`; the API now returns both a fresh access token and user profile, so the route guard can restore the signed-in state instead of redirecting to login. Whenever the token changes, the provider supplies it to `api/client.js`.

`ProtectedRoute` waits for bootstrap, redirects anonymous users, and otherwise renders the nested route through React Router's `Outlet`.

`ProjectsPage` fetches `/api/projects`, filters the returned array by status, and uses `Link` for client-side navigation. It deliberately reads PostgreSQL's real fields: `title`, `owner_id`, `start_date`, and `end_date`.

`ProjectDetailPage` loads a project and its phases in parallel. Selecting a phase loads its budgets. This is a small but useful example of stateful async UI: it owns project, phases, selected phase, budgets, and request-error state.

`BudgetPanel` demonstrates an authenticated mutation by posting a budget line. The API permits this only for `admin`, `pm`, or `supervisor`; a normal `client-viewer` will receive a visible Forbidden message.

## API and backend logic

All normal responses use `{ data, error, meta }`, allowing the frontend to have one predictable response shape.

| Endpoint | What it does | Permission |
| --- | --- | --- |
| `POST /api/auth/register` | Validates with Zod, hashes password with bcrypt, creates a user, issues access JWT and refresh cookie. | Public |
| `POST /api/auth/login` | Checks email/password and issues the same token pair. | Public |
| `POST /api/auth/refresh` | Verifies the refresh cookie, loads the user, and returns a new access JWT plus profile. | Refresh cookie |
| `GET/POST /api/projects` | Lists projects or creates one; POST defaults `owner_id` to the caller. | JWT |
| `GET/PATCH/DELETE /api/projects/:id` | Reads, updates, or deletes a project. Mutations require owner or admin. | JWT |
| `GET/POST /api/projects/:projectId/phases` | Reads phases or creates one for a project. Creates require owner or admin. | JWT |
| `GET/PATCH/DELETE /api/phases/:id` | Reads or mutates one phase. | JWT; mutations owner/admin |
| `GET/POST /api/phases/:phaseId/budgets` | Reads or creates phase budgets. | JWT |
| `GET/PATCH /api/budgets/:id` | Reads or updates one budget. | JWT |
| `GET/POST /api/budgets/:budgetId/transactions` | Reads transactions or creates one. Creation calls a database transaction. | JWT |
| `/api/budget-lines`, `/resources`, `/resource-assignments`, `/materials` | Phase 2 prototype endpoints for cost/resource/material workflows. | JWT + staff role for writes |

`auth.js` reads `Authorization: Bearer <token>`, verifies it, and assigns the claims to `req.user`. `requireRole.js` then admits only the named roles. `errorHandler.js` converts Zod errors to 400 responses and hides unexpected production error details.

Refresh cookies are HTTP-only and `SameSite=Lax`. `COOKIE_SECURE=false` is used only by local HTTP Compose; a TLS deployment must set `COOKIE_SECURE=true` so browsers require HTTPS for the cookie.

The SQL services are intentionally thin: route handlers decide authorization and HTTP status; services issue parameterized SQL. `transactionsService.createTransaction` is the important exception: it begins a PostgreSQL transaction, inserts a budget transaction, increments `budgets.amount_spent`, commits, and rolls back on failure. That preserves accounting consistency.

## Data model

The durable relationships are `users -> projects -> phases -> budgets -> budget_transactions`. Foreign keys cascade phases/budgets/transactions when their parent is deleted; a deleted user leaves projects and transaction authors intact but nulls the user reference. The migration also defines resources, assignments, materials, and attachments for future durable implementations.

## Running it

For the complete containerized app, run `docker compose up --build` from the repository root, then open `http://localhost:5173`. Nginx serves the React build and proxies `/api` to Express; this is why the client uses relative API URLs in production.

For development, start PostgreSQL first (for example `docker compose up db`), then run `npm run dev` in `client/` and `node server.js` in `server/`. Vite proxies `/api` to port 4000.

## Conflicts and limitations to discuss honestly

There are no unresolved Git conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) in the source tree. “Conflict” in this codebase means a business conflict: `POST /api/resource-assignments` detects overlapping dates for the same resource and returns HTTP 409 with the existing conflicting assignment.

The initial frontend/backend contract had real integration defects: refresh returned only a token (so the route guard had no user), the UI used nonexistent `name`, `owner`, and `budget` fields, direct API URLs bypassed the production proxy, and Compose launched no client service. Those are repaired in this version.

The Phase 2 endpoints still use `data/store.js`, not PostgreSQL. They are useful as a prototype and are covered by tests, but production work should move them behind SQL services and migration tables. Project and phase `PATCH` services also construct column names from request keys; production code should whitelist editable fields before generating SQL. Finally, the current server test files mix Node's built-in test API and Jest while `package.json` runs Jest without ESM configuration; that test command needs standardizing before it can be a reliable CI gate.

## Good interview close

“I separated HTTP concerns, authorization, and persistence so each layer is testable. I used JWT access tokens for API calls and an HTTP-only refresh cookie for session continuity. For money-changing operations I used a database transaction. The next production hardening steps are to replace the in-memory Phase 2 store, add request schemas to every mutation, enforce project-level read authorization, and make the test runner consistently ESM-aware.”
