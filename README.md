# SiteForge

SiteForge is a full-stack construction project and resource management application. It provides authentication, projects, phases, budgets, resource allocation, and reporting workflows.

## Run with Docker

Prerequisites: Docker Desktop with Docker Compose.

```bash
git clone https://github.com/shriharini31/siteforge.git
cd siteforge
docker compose up --build
```

The Compose defaults make the command above runnable immediately. To customize local secrets or database credentials, copy `.env.example` to `.env` first (`cp .env.example .env` on macOS/Linux or `Copy-Item .env.example .env` in PowerShell).

Open [http://localhost:5173](http://localhost:5173). The API is available through the frontend at `/api` and directly at [http://localhost:4000](http://localhost:4000).

The supplied `.env.example` is for local development only. Change `JWT_SECRET`, `REFRESH_SECRET`, and the database password before deployment.

## Local development

```bash
cd server && npm ci && npm test
cd ../client && npm ci && npm run build
```

Use `npm run dev` in `server` and `client` in separate terminals for hot reload. The Vite development server proxies `/api` requests to `http://localhost:4000`.

## Deploying publicly

Deploy the client and API behind the same HTTPS domain when possible; this keeps API requests at `/api` and the refresh cookie is same-origin. Set `CLIENT_ORIGIN` to the public frontend URL and use strong, unique `JWT_SECRET` and `REFRESH_SECRET` values.

If the frontend and API use separate public domains, build the client with `VITE_API_BASE_URL=https://api.example.com`, set `CLIENT_ORIGIN=https://app.example.com`, and set `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=none`.

## Verification

GitHub Actions runs the server test suite and a production client build on pushes and pull requests to `main` and `master`.
