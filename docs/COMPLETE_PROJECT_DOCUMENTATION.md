# SiteForge Complete Project Documentation

## 1. What SiteForge is

SiteForge is a full-stack construction project management application. A project manager can register, sign in, create and view projects, organise phases, track budgets, and use prototype resource, material, and budget-line workflows.

The application is deliberately split into a React frontend, an Express REST API, and PostgreSQL. This separation keeps browser presentation, HTTP/security concerns, and persistence independent and testable.

## 2. Architecture

```text
Browser (mobile, tablet, laptop, desktop)
        |
        | HTTPS / JSON API
        v
React + Vite client
        |
        | /api through Nginx locally, or VITE_API_BASE_URL after deployment
        v
Express API
        |
        v
PostgreSQL
```

For Docker, Nginx serves the built React files and proxies `/api` to Express. For public deployment, Vercel serves the client and Render runs the Express service plus PostgreSQL.

## 3. Folder and file guide

| Path | Responsibility |
| --- | --- |
| `client/` | React frontend built by Vite. |
| `client/src/main.jsx` | React browser entry point. |
| `client/src/App.jsx` | Routes, login/register UI, dashboard navigation, responsive layout. |
| `client/src/index.css` | Tailwind import, responsive baseline, touch targets, and focus styles. |
| `client/src/api/client.js` | Shared API client. Reads `VITE_API_BASE_URL`, sends credentials/JWTs, and validates JSON API responses. |
| `client/src/context/AuthContext.jsx` | Session state: login, registration, refresh, logout, and access-token sharing. |
| `client/src/components/ProtectedRoute.jsx` | Blocks private pages until a signed-in user has been restored. |
| `client/src/components/BudgetPanel.jsx` | Authenticated budget-line form. |
| `client/src/pages/ProjectsPage.jsx` | Project list, status filter, and links to details. |
| `client/src/pages/ProjectDetailPage.jsx` | Project, phases, and budget detail loading. |
| `server/server.js` | Starts the Express process on `PORT`. |
| `server/src/app.js` | Middleware, CORS, routes, health endpoint, and error handler. |
| `server/src/routes/` | REST endpoint definitions. |
| `server/src/services/` | Parameterized PostgreSQL queries and business operations. |
| `server/src/middleware/` | JWT authentication, roles, and JSON error responses. |
| `server/src/db/pool.js` | Shared PostgreSQL connection pool. |
| `server/migrations/001_init_schema.sql` | Database schema for users, projects, phases, budgets, transactions, resources, materials, and attachments. |
| `docker-compose.yml` | Local database, API, and client deployment topology. |
| `vercel.json` | Builds the Vite client from the repository root and supports SPA routing. |
| `render.yaml` | Render blueprint for the long-running Express backend. |
| `.github/workflows/ci.yml` | CI: installs dependencies, migrates a PostgreSQL test database, runs server tests, and builds the client. |

## 4. Frontend flow

1. `main.jsx` renders `App`.
2. `App` wraps routes with `AuthProvider`.
3. `AuthProvider` calls `/api/auth/refresh` when the page opens. If the HTTP-only refresh cookie is valid, it restores `user` and `accessToken`.
4. `ProtectedRoute` shows private routes only after the session check finishes.
5. `api/client.js` attaches the bearer access token and sends browser credentials. It reads `VITE_API_BASE_URL`; an empty value keeps same-origin `/api` requests for Docker/Nginx.
6. Project pages fetch JSON and keep loading/error/page state in React hooks.

The UI uses responsive Tailwind breakpoints. On narrow screens headers, filters, project cards, phase rows, forms, and dashboard sections stack vertically. Buttons have a 44px minimum touch target and keyboard focus states.

## 5. Backend and authentication flow

`server/src/app.js` installs Helmet, CORS, JSON parsing, cookies, rate limiting, routes, a 404 JSON handler, and `errorHandler`.

### Authentication

1. Register validates input with Zod and hashes the password with bcrypt.
2. The user is stored in PostgreSQL.
3. The server returns a short-lived access JWT in JSON and a refresh JWT as an HTTP-only cookie.
4. The client uses the access JWT in `Authorization: Bearer <token>`.
5. A refresh request verifies the cookie and returns a replacement access token and user profile.

`COOKIE_SECURE` and `COOKIE_SAME_SITE` make the same authentication code work for local HTTP and public HTTPS deployments.

### API response contract

Every API route returns JSON in the same form:

```json
{
  "data": {},
  "error": null,
  "meta": { "status": 200 }
}
```

Errors use the same structure. The frontend now detects an HTML/non-JSON response and reports an API deployment configuration problem instead of throwing `Unexpected token`.

## 6. Important API endpoints

| Endpoint | Use | Access |
| --- | --- | --- |
| `POST /api/auth/register` | Create a user and session. | Public |
| `POST /api/auth/login` | Sign in and receive access/refresh tokens. | Public |
| `POST /api/auth/refresh` | Restore a session from refresh cookie. | Cookie |
| `GET, POST /api/projects` | List or create projects. | JWT |
| `GET, PATCH, DELETE /api/projects/:id` | View or manage one project. | JWT; mutations owner/admin |
| `GET, POST /api/projects/:projectId/phases` | Read or create phases. | JWT |
| `GET, PATCH, DELETE /api/phases/:id` | Manage a phase. | JWT |
| `GET, POST /api/phases/:phaseId/budgets` | Read or create budgets. | JWT |
| `GET, POST /api/budgets/:budgetId/transactions` | Budget spending history and creation. | JWT |
| `/api/budget-lines`, `/api/resources`, `/api/resource-assignments`, `/api/materials` | Prototype resource/material workflow. | JWT + staff role for writes |
| `GET /health` | Deployment health probe. | Public |

## 7. Database logic

The durable relationship is:

```text
users -> projects -> phases -> budgets -> budget_transactions
```

PostgreSQL foreign keys preserve this relationship. `transactionsService` uses a database transaction when recording spending: it inserts the transaction, updates `amount_spent`, commits only if both succeed, and rolls back on failure. This prevents a budget total from changing without a matching transaction record.

## 8. Environment variables

| Variable | Where used | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | API | PostgreSQL connection string. |
| `PORT` | API | Express listening port. |
| `NODE_ENV` | API | Production behaviour and error handling. |
| `CLIENT_ORIGIN` | API | Allowed frontend origin(s), comma-separated. |
| `JWT_SECRET` | API | Signs access tokens. |
| `REFRESH_SECRET` | API | Signs refresh tokens. |
| `COOKIE_SECURE` | API | `true` for HTTPS production deployments. |
| `COOKIE_SAME_SITE` | API | `lax` for same origin; `none` for separate HTTPS domains. |
| `VITE_API_BASE_URL` | Client build | Public backend URL; empty for same-origin Nginx proxy. |
| `VITE_DEV_API_URL` | Vite development only | Local API address for Vite proxy. |

Never commit real production secrets. Use `.env.example`, `client/.env.example`, and `server/.env.example` as templates only.

## 9. Local, Docker, and public deployment

### Local development

```bash
cd server
npm ci
npm run dev

cd ../client
npm ci
npm run dev
```

### Docker

```bash
docker compose up --build
```

Open `http://localhost:5173`.

### Public deployment

- Deploy the API and PostgreSQL to Render using `render.yaml`.
- Confirm `https://YOUR-RENDER-URL/health` returns JSON.
- Deploy the repository root to Vercel. `vercel.json` runs the client build and supports React routes.
- Add `VITE_API_BASE_URL=https://YOUR-RENDER-URL` in Vercel, then redeploy.
- Set Render `CLIENT_ORIGIN` to the exact Vercel URL.

## 10. Conflicts and limitations

There are no unresolved Git merge-conflict markers in the committed source.

There is one intentional business conflict: resource assignment checks date overlap for the same resource and returns HTTP `409 Conflict` with the conflicting assignment.

The `phase2Routes.js` prototype keeps budget-line/resource/material state in `server/src/data/store.js`. Core users, projects, phases, budgets, and transactions are durable PostgreSQL data. A future production enhancement should move all Phase 2 prototype state into SQL services and tables.

## 11. Interview explanation

Use this summary:

> “I chose React and Vite for a fast component-based responsive frontend, Express for a simple REST API and middleware-based security, and PostgreSQL for relational construction and budget data. React handles routes, forms, responsive UI, and session state. Express validates requests, enforces JWT/role permissions, and sends a predictable JSON response contract. PostgreSQL gives referential integrity, and transactions keep budget spending consistent. Docker Compose provides a repeatable local environment, GitHub Actions verifies the build and API tests, and Vercel plus Render provide a practical public deployment architecture.”

## 12. Final submission checklist

- [ ] GitHub `main` contains the latest commit.
- [ ] GitHub Actions is green.
- [ ] Render `/health` returns JSON.
- [ ] Vercel has `VITE_API_BASE_URL` and was redeployed.
- [ ] Register and login were tested from the public URL.
- [ ] Mobile and desktop browser layouts were checked.
