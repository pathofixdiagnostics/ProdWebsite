# Run PathoFix locally with Docker

One command brings up the whole app — website, API, Postgres, and a
database browser. No Node or pnpm needed on your machine, just Docker.

## Two ways to run locally

- **Test the production stack** (recommended before deploying) — the exact
  topology you deploy: Caddy serving the site and proxying `/api`, over plain
  HTTP on `http://localhost:8080`. Uses `docker-compose.local.yml`. See the
  next section.
- **Dev stack with a DB browser** — nginx + API + Postgres + **Adminer** (a web
  DB viewer). Uses `docker-compose.yml`. See ["Start"](#start) further down.

Use one at a time (both listen on port 8080).

## Test the production stack locally

This runs the same Caddy + API + Postgres setup as production, so what you see
locally is what you'll get on the VPS — just without a domain or HTTPS. No Node
needed on your machine, only Docker.

```bash
docker compose -f docker-compose.local.yml up --build
```

Then open:

| What | URL |
|---|---|
| **Website** | http://localhost:8080 |
| API health check | http://localhost:8080/api/healthz → `{"status":"ok"}` |
| **Admin console** | http://localhost:8080/admin |

Sign in to the admin console with password **`password`**.

> This plaintext password is a local-testing shortcut only — it works because
> the local stack runs in development mode. In production the same code ignores
> it and requires the hashed `ADMIN_PASSWORD_HASH` instead, so nothing insecure
> ships. To use a different local password, run
> `ADMIN_PASSWORD=your-choice docker compose -f docker-compose.local.yml up --build`.

Things worth clicking through: submit a booking and a partner request on the
site, then open **/admin** and hit **Refresh** — the counts should tick up, and
browsing the public pages bumps the visit/page-view numbers. Try **Download
backup**, then **Restore from backup** with that file (it downloads a safety
copy first, then reloads the stats).

Stop with `Ctrl-C`, or wipe everything (including the database) with:

```bash
docker compose -f docker-compose.local.yml down -v
```

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Mac/Windows)
  or Docker Engine + Compose plugin (Linux). Make sure Docker is running.

## Start

From the project root (the folder containing `docker-compose.yml`):

```bash
docker compose up --build
```

First run takes a few minutes (it builds the images and downloads Postgres).
When you see `Server listening` from the `api` service, it's ready.

| What | URL |
|---|---|
| **Website** | http://localhost:8080 |
| API health check | http://localhost:8080/api/healthz → `{"status":"ok"}` |
| **Admin console** | http://localhost:8080/admin (needs the two admin env vars — see below) |
| **Database browser (Adminer)** | http://localhost:8081 |
| Postgres (for a desktop DB tool) | `localhost:5432` |

## Check the database

Open **http://localhost:8081** and log in with:

- **System:** PostgreSQL
- **Server:** `db`
- **Username:** `pathofix`
- **Password:** `pathofix`
- **Database:** `pathofix`

Then open the `bookings` or `partner_requests` table. Submit the booking
form on the site at http://localhost:8080/book, refresh the table, and your
new row appears.

Prefer a desktop tool (TablePlus, DBeaver, pgAdmin)? Connect to
`postgresql://pathofix:pathofix@localhost:5432/pathofix`.

## Notifications (optional)

Bookings save to the database and succeed **without** any email/Telegram
setup — fine for checking the UI and data. If you also want the email and
Telegram alerts to fire locally, create a `.env` file next to
`docker-compose.yml` (copy from `.env.example`) and fill in `SMTP_*` and/or
`TG_*`. Compose loads it automatically. Then restart:

```bash
docker compose up --build
```

## Admin console (optional)

The dashboard at **http://localhost:8080/admin** shows bookings, partner
requests and visit counts, and lets you back up / restore the database. It only
turns on when two secrets are set. Generate them once and add them to your
`.env` (next to `docker-compose.yml`):

```bash
node scripts/hash-admin-password.mjs "a-local-password"
# paste the two printed lines (ADMIN_PASSWORD_HASH / ADMIN_SESSION_SECRET) into .env
docker compose up -d --build   # restart so the API picks them up
```

Without those vars, `/admin` shows a "not configured" notice. Visit counts fill
in as you browse the site (each page load is beaconed to the API). Backups
download as JSON; restore replaces current data and auto-downloads a safety copy
of the current data first.

## Everyday commands

```bash
docker compose up            # start (after the first --build)
docker compose up -d         # start in the background
docker compose logs -f api   # follow the API logs
docker compose down          # stop everything (keeps the database data)
docker compose down -v       # stop AND wipe the database volume (fresh start)
```

## Rebuilding after code changes

The images bake in a build of the code, so after editing files:

```bash
docker compose up --build
```

Tip: if you're actively iterating on the **UI**, running the frontend
outside Docker gives instant hot-reload while still using the Dockerized
database and API:

```bash
# leave `docker compose up` running for db + api, then in another terminal:
cd artifacts/krishnagiri-lab
PORT=5173 BASE_PATH=/ pnpm install && pnpm run dev
# open http://localhost:5173  (its /api proxy targets localhost:5000)
```

## Troubleshooting

- **Port already in use** (`8080`, `5000`, `5432`, or `8081`): another program
  is using it. Stop that program, or change the left-hand number in the
  `ports:` mapping in `docker-compose.yml` (e.g. `"8090:80"`).
- **`web` can't reach the API / 502 from nginx:** make sure the `api`
  service started cleanly (`docker compose logs api`). It waits for the
  database and the one-time `migrate` step to finish first.
- **Start completely fresh:** `docker compose down -v` then
  `docker compose up --build` — this recreates the database from scratch.
