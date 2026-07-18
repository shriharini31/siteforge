Running tests locally

1. From the repository root, install server dev deps:

```powershell
cd server
npm install
```

2. Run tests:

```powershell
npm test
```

Notes:
- Tests use Jest and Supertest and exercise the in-memory auth routes (no database required).
- CI workflow runs `npm ci` and `npm test` for the `server` folder.
