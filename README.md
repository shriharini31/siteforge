# SiteForge

SiteForge is a full-stack construction project and resource management application. It provides authentication, projects, phases, budgets, resource allocation, and reporting workflows.

For the full codebase, API, architecture, deployment, and interview explanation, read [Complete Project Documentation](docs/COMPLETE_PROJECT_DOCUMENTATION.md).

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

## Vercel frontend + Render backend

Vercel is suitable for the Vite frontend. The Express API requires a long-running Node service and PostgreSQL, so deploy it on Render using the included `render.yaml` (or an equivalent Railway/Fly configuration), not as a Vercel static site.

1. In Render, create a PostgreSQL database and a Blueprint service from this repository. Set `DATABASE_URL` to Render's internal database URL and set `CLIENT_ORIGIN` to the Vercel URL, for example `https://siteforge-xxxx.vercel.app`.
2. Copy the generated Render API URL, for example `https://siteforge-api.onrender.com`.
3. In Vercel, import this repository with the **repository root** as the project root. The included `vercel.json` installs and builds `client` and rewrites React routes to `index.html`.
4. In Vercel **Settings → Environment Variables**, add `VITE_API_BASE_URL` with the Render API URL. Redeploy after saving it.
5. Update Render `CLIENT_ORIGIN` with the final Vercel URL. Use `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=none` when the sites use different domains.

Required production variables:

| Platform | Variables |
| --- | --- |
| Render API | `DATABASE_URL`, `CLIENT_ORIGIN`, `JWT_SECRET`, `REFRESH_SECRET`, `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=none`, `NODE_ENV=production` |
| Vercel frontend | `VITE_API_BASE_URL=https://your-render-api.onrender.com` |

## Troubleshooting

- `Unexpected token 'T' ... is not valid JSON` means the frontend called an HTML page instead of the API. Set `VITE_API_BASE_URL` in Vercel to the public Render API URL and redeploy.
- `CORS` errors mean the browser origin is missing from `CLIENT_ORIGIN`. Multiple origins can be separated by commas.
- `401` after deployment usually means the cookie settings do not match the deployment topology. For different HTTPS domains use `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=none`.
- Check `https://your-api-domain/health` before testing login. It must return JSON with `{"status":"ok"}`.

## Production checklist

- [ ] Render API `/health` returns JSON.
- [ ] Render migration has completed against the production database.
- [ ] Vercel has `VITE_API_BASE_URL` configured and has been redeployed.
- [ ] Render `CLIENT_ORIGIN` matches the exact Vercel HTTPS URL.
- [ ] Strong unique JWT and refresh secrets are configured.
- [ ] Register, login, refresh, projects, and budgets have been tested from a mobile and desktop browser.

## Verification

GitHub Actions runs the server test suite and a production client build on pushes and pull requests to `main` and `master`.
