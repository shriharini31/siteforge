# SiteForge

SiteForge is a full-stack construction project and resource management application. It provides authentication, projects, phases, budgets, resource allocation, and reporting workflows.

## Run with Docker

Prerequisites: Docker Desktop with Docker Compose.

```bash
git clone https://github.com/shriharini31/siteforge.git
cd siteforge
copy .env.example .env
docker compose up --build
```

Open [http://localhost:5173](http://localhost:5173). The API is available through the frontend at `/api` and directly at [http://localhost:4000](http://localhost:4000).

The supplied `.env.example` is for local development only. Change `JWT_SECRET`, `REFRESH_SECRET`, and the database password before deployment.

## Local development

```bash
cd server && npm ci && npm test
cd ../client && npm ci && npm run build
```

Use `npm run dev` in `server` and `client` in separate terminals for hot reload. The Vite development server proxies `/api` requests to `http://localhost:4000`.

## Verification

GitHub Actions runs the server test suite and a production client build on pushes and pull requests to `main` and `master`.
