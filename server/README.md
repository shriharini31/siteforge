# Server Docker

Run locally with Docker Compose:

```bash
docker-compose up --build
```

This composes the `db` (Postgres 15) and `server` services. The Postgres container will run any SQL files placed in `server/migrations` on initialization.

To run migrations after the DB is already created, use `node-pg-migrate` (the project includes it as a dependency). From the `server` folder you can run:

```bash
# build and run only the db and server
docker-compose up --build -d db

# run a migration command inside the server container
docker-compose run --rm server npx node-pg-migrate up
```

Adjust commands as needed for rollback or specific targets, e.g. `npx node-pg-migrate down`.
