# PathoFix Diagnostics — Deployment Guide

There are two ways to deploy. **The recommended path puts everything on one
server** — database, API, and website together — so there is a single place to
look when something breaks and nothing to keep in sync across providers.

- **Recommended: single-host** — one VPS running Docker Compose
  (Postgres + API + the site behind Caddy, with automatic HTTPS).
- **Alternative: multi-provider** — Cloudflare Pages + Neon + Fly.io. More
  moving parts, but a generous free tier.

Either fits a ~₹300/month budget for ~500 visitors/month.

---

## Recommended: single-host (one VPS)

Everything runs in one place via `docker-compose.prod.yml`: Postgres, the API,
and the static site behind **Caddy**, which obtains HTTPS certificates
automatically. Only ports 80/443 are exposed to the internet; the database and
API stay on the private Docker network.

### What you need
- A small VPS — 1 vCPU / 1 GB RAM is plenty. Budget options with an India or
  nearby region: **Hostinger** KVM, **DigitalOcean** (Bangalore), **Contabo**.
  Roughly ₹300–₹500/mo.
- Docker + Compose on it: `curl -fsSL https://get.docker.com | sh`.
- Your domain. For this path you just add an **A record** pointing at the VPS
  (step 1) — no nameserver change needed.

### Steps
1. **Point the domain at the VPS.** In GoDaddy → `dcc.godaddy.com` → your domain
   → **DNS**, add an **A record** `@ → <your VPS IP>`, and either a CNAME
   `www → yourdomain.com` or a second A record for `www`. (This is a normal DNS
   record change, not a nameserver change.)
2. **Get the code onto the VPS** — `git clone` it, or `scp` the project folder up.
3. **Generate the admin credentials:**
   ```bash
   node scripts/hash-admin-password.mjs "choose-a-strong-password"
   ```
   Copy the two lines it prints.
4. **Fill `.env`** (copy from `.env.example`) and set at least:
   ```bash
   cp .env.example .env
   #   POSTGRES_PASSWORD=...          any strong random string
   #   ADMIN_PASSWORD_HASH=...        from step 3
   #   ADMIN_SESSION_SECRET=...       from step 3
   #   SITE_DOMAIN=yourdomain.com, www.yourdomain.com
   #   ACME_EMAIL=you@example.com
   #   (optional) SMTP_* and TG_* for booking alerts
   ```
5. **Launch:**
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
   The `migrate` step creates the tables, then the API and Caddy start. Caddy
   fetches TLS certificates automatically once the domain resolves to the VPS
   (give it a couple of minutes on first boot).
6. **Verify:** open `https://yourdomain.com` (site),
   `https://yourdomain.com/api/healthz` (returns `{"status":"ok"}`), and
   `https://yourdomain.com/admin` (the console).

### Day-to-day
```bash
docker compose -f docker-compose.prod.yml ps            # what's running
docker compose -f docker-compose.prod.yml logs -f api   # follow API logs
docker compose -f docker-compose.prod.yml logs -f caddy # follow proxy/TLS logs
docker compose -f docker-compose.prod.yml restart api   # restart one service
docker compose -f docker-compose.prod.yml up -d --build # redeploy after changes
```
Because it is one machine, "debugging a failure" is mostly `logs -f` on the
service that is unhappy. Postgres data lives in the `pgdata` volume and TLS
certificates in `caddy_data`, so restarts and rebuilds lose nothing.

> **Trade-off:** a single VPS has no automatic failover — if the machine goes
> down, the site is down until it is back. For a small lab that is usually an
> acceptable trade for the simplicity and the single bill. Take regular backups
> from the admin console (below), and optionally enable VPS snapshots.

---

## Admin console

A password-protected dashboard at **`/admin`** (e.g.
`https://yourdomain.com/admin`) showing **bookings per month**, **partner
requests**, **website visits**, and **total page views**, plus one-click
**database backup and restore**. It is unlinked from the public site and blocked
in `robots.txt`.

### Enable it
The console needs two secrets on the API — `ADMIN_PASSWORD_HASH` and
`ADMIN_SESSION_SECRET`. Generate them once:
```bash
node scripts/hash-admin-password.mjs "your-admin-password"
```
- **Single-host:** put the two printed lines in `.env`, then
  `docker compose -f docker-compose.prod.yml up -d` again.
- **Multi-provider (Fly):** `fly secrets set ADMIN_PASSWORD_HASH='...' ADMIN_SESSION_SECRET='...'` (this redeploys the API).

Only the password *hash* is stored — never the plaintext. Then open `/admin` and
sign in. If the secrets are missing, `/admin` shows a "not configured" notice.

### Visit tracking
The site sends a lightweight, anonymous page-view beacon to your own API — no
third-party analytics, no cookies, no IP address stored. "Visits" counts
distinct browser sessions; "page views" counts loads.

### Backup & restore
- **Download backup** saves a JSON snapshot of all bookings, partner requests,
  and page views. It is generated on demand and streamed over HTTPS — nothing is
  written to the server, so no unencrypted backup sits on disk there.
- **Restore** replaces current data with an uploaded backup. Before it runs, the
  console automatically downloads a safety copy of the *current* data to your
  machine, and the restore itself runs inside a single database transaction, so
  any failure rolls back and changes nothing.
- Backup files contain customers' personal details — keep them somewhere secure
  (an encrypted disk or a private location), not a shared folder.

---

## Alternative: multi-provider (Cloudflare Pages + Neon + Fly.io)

More moving parts than the single-host path, but every piece has a free tier.
The frontend calls the API on a different origin, so the production build must
be given `VITE_API_URL` (the Fly URL), and the API's `CORS_ORIGIN` must list the
site origin.

| Piece | Service | Cost |
|---|---|---|
| Frontend (static Vite build) | **Cloudflare Pages** | Free |
| Database (Postgres) | **Neon** free tier | Free |
| API server (Express) | **Fly.io** (shared-cpu 256 MB, scale-to-zero) | ~₹0–₹250/mo |

---

## 0. One-time prerequisites

- Accounts: [neon.tech](https://neon.tech), [fly.io](https://fly.io) (needs a card, but this setup stays in the free/cheap range), [Cloudflare](https://dash.cloudflare.com).
- Tools on your machine: Node 24, `pnpm` (`npm i -g pnpm`), and `flyctl`:
  ```bash
  curl -L https://fly.io/install.sh | sh   # macOS/Linux
  # Windows (PowerShell): iwr https://fly.io/install.ps1 -useb | iex
  fly auth login
  ```
- Copy `.env.example` to `.env` locally and fill it as you complete the steps below. **Never commit `.env`.**

---

## 1. Database — Neon

1. Create a Neon project. Region: **AWS ap-southeast-1 (Singapore)** — nearest to India.
2. Copy the **pooled** connection string (looks like `postgresql://user:pass@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`).
3. Create the tables by pushing the Drizzle schema **from your machine**:
   ```bash
   pnpm install
   DATABASE_URL="postgresql://...your-neon-url..." pnpm --filter @workspace/db run push
   ```
   Re-run this same command any time the schema in `lib/db/src/schema/` changes.

## 2. Notification credentials

**Gmail (email alerts)** — regular passwords do NOT work:
1. Google Account → Security → enable **2-Step Verification**.
2. Security → **App passwords** → create one for "Mail". You get a 16-character password.
3. That's your `SMTP_PASS`; `SMTP_USER` is the Gmail address (e.g. pathofixdiagnostics@gmail.com).

**Telegram (instant alerts)**:
1. Message **@BotFather** → `/newbot` → copy the token → `TG_BOT_TOKEN`.
2. Send any message to your new bot from the lab's Telegram account.
3. Open `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser and copy `"chat":{"id": ...}` → `TG_CHAT_ID`.

## 3. API server — Fly.io

From the repo root (where `fly.toml` and `Dockerfile` live):

```bash
# 1) Create the app (name in fly.toml must be globally unique — edit if taken)
fly apps create pathofix-api

# 2) Set secrets — NEVER put these in fly.toml or git
fly secrets set \
  DATABASE_URL="postgresql://...your-neon-pooled-url..." \
  SMTP_HOST="smtp.gmail.com" \
  SMTP_USER="pathofixdiagnostics@gmail.com" \
  SMTP_PASS="your-16-char-app-password" \
  LAB_EMAIL="pathofixdiagnostics@gmail.com" \
  TG_BOT_TOKEN="123456:ABC..." \
  TG_CHAT_ID="123456789" \
  DEBUG_TOKEN="$(openssl rand -hex 16)" \
  CORS_ORIGIN="https://yourdomain.com,https://www.yourdomain.com" \
  ADMIN_PASSWORD_HASH='...from scripts/hash-admin-password.mjs...' \
  ADMIN_SESSION_SECRET='...from scripts/hash-admin-password.mjs...'

# 3) Deploy (builds the Dockerfile on Fly's builders)
fly deploy
```

Verify:
```bash
curl https://pathofix-api.fly.dev/api/healthz
# → {"status":"ok"}

# One-time notification test (uses the DEBUG_TOKEN you set above):
fly secrets list                     # confirm DEBUG_TOKEN digest exists
curl -H "X-Debug-Token: <your DEBUG_TOKEN value>" \
  https://pathofix-api.fly.dev/api/test-notifications
```
The test endpoint returns 404 in production without the correct token, so
strangers can't spam your inbox/Telegram. (The token goes in a header, not the
URL, so it isn't logged in request URLs.)

Cost control: `fly.toml` uses scale-to-zero (`min_machines_running = 0`), so
you pay only for actual usage — effectively ₹0–₹100/mo at your traffic. If you
ever want the machine always-on, set `min_machines_running = 1`
(~$2–3/mo ≈ ₹170–₹250, still within budget).

## 4. Frontend — Cloudflare Pages

### Option A — simplest (build locally, upload)

```bash
BASE_PATH="/" VITE_API_URL="https://pathofix-api.fly.dev" \
  pnpm --filter @workspace/krishnagiri-lab run build
```
Then Cloudflare dashboard → **Workers & Pages → Create → Pages → Upload assets**
and drag-drop the folder `artifacts/krishnagiri-lab/dist/public`.
Repeat build+upload whenever you change the site.

### Option B — auto-deploy from GitHub

1. Push this repo to GitHub (`.gitignore` already excludes `.env`).
2. Cloudflare → Pages → **Connect to Git** → pick the repo.
3. Build settings:
   - **Build command:** `npm i -g pnpm@10 && pnpm install --frozen-lockfile && pnpm --filter @workspace/krishnagiri-lab run build`
   - **Build output directory:** `artifacts/krishnagiri-lab/dist/public`
   - **Environment variables:** `NODE_VERSION=22`, `BASE_PATH=/`, `VITE_API_URL=https://pathofix-api.fly.dev`
4. Every push to `main` now redeploys the site.

### SPA routing fix (both options)

The site uses client-side routing (wouter), so deep links like `/tests` must
serve `index.html`. Add a file `artifacts/krishnagiri-lab/public/_redirects`
containing exactly:
```
/*  /index.html  200
```
(Vite copies `public/` into the build output automatically.)

## 5. Custom domain

You already have a domain — point it at the site. Recommended setup:
**Cloudflare Pages + move the domain's nameservers to Cloudflare.** It's the
simplest path because using the apex (`yourdomain.com`) with Pages requires
the domain to be a Cloudflare zone anyway, and it puts the site domain and the
`api.` subdomain in one dashboard with free SSL and CDN. Replace
`yourdomain.com` below with your real domain.

### Cloudflare Pages (recommended)

1. **Add the domain to Cloudflare.** Dashboard → "Add a site" → enter your
   domain → Free plan. Cloudflare scans your existing records and then shows
   **two nameservers** (e.g. `xxx.ns.cloudflare.com`).
2. **Change nameservers at your registrar.** Wherever you bought the domain,
   open its nameserver setting and replace the existing entries with
   Cloudflare's two. Propagation takes minutes to a few hours; Cloudflare
   emails you when the zone goes active. (Registrar-specific click paths are
   in section 5a below.)
3. **Attach it to the Pages project.** Workers & Pages → your project →
   Custom domains → **Set up a domain**. Add **both** `yourdomain.com` and
   `www.yourdomain.com`. Because DNS is now on Cloudflare, the needed DNS
   records are created for you automatically.
4. **SSL mode.** SSL/TLS → Overview → set to **Full**. (A wrong SSL mode is
   the usual cause of a 522 error right after setup.)
5. **Canonical redirect (optional).** Both apex and www will serve the site.
   To force one to redirect to the other, add a rule under
   Rules → Redirect Rules.

### Wire the API so the booking form works

The frontend is static on Cloudflare; the API runs on Fly — a different
origin. In production the app must call the API by its URL. Relative `/api`
paths only work in the local Docker stack (where nginx proxies them).

1. Give the API a subdomain: `fly certs add api.yourdomain.com`.
2. In Cloudflare DNS, add the record Fly prints **as "DNS only" (grey cloud)**
   so Fly's Let's Encrypt certificate can be issued. You can switch the proxy
   on later if you want.
3. Rebuild the frontend with `VITE_API_URL=https://api.yourdomain.com` and
   redeploy to Pages — set it as a Pages environment variable (Option B) or
   pass it to the build command (Option A) from the frontend section above.

Skip this and live form submissions will hit the static site instead of the
API.

### Vercel (alternative)

If you host the frontend on Vercel instead, add the domain under the project's
**Settings → Domains**, then set DNS records (at Cloudflare or your registrar):

- Apex `yourdomain.com` → an **A record**. A CNAME isn't allowed at the zone
  apex, so Vercel gives you an IP — the general value is `76.76.21.21`, but use
  the exact IP shown in your project's Domain Settings if it differs.
- `www` → a **CNAME** to `cname.vercel-dns-0.com`.

Vercel provisions SSL automatically once DNS verifies and will offer to
redirect the apex to `www`. Set `VITE_API_URL` and rebuild the same way.

### Verify

Check propagation at whatsmydns.net (or run `dig yourdomain.com`), open the
site over HTTPS, then submit a booking and confirm the row appears in your
database.

## 5a. Registrar nameserver steps — GoDaddy

Do this at **step 2** of the Cloudflare Pages setup above, once Cloudflare has
shown you its two nameservers.

1. **Before switching**, confirm Cloudflare's "Add a site" scan imported any
   DNS records you rely on — especially email/MX records. Anything not present
   in Cloudflare's DNS stops working once GoDaddy hands over control. (If your
   email is plain Gmail on an `@gmail.com` address, there's nothing on the
   domain to lose.)
2. Go to **dcc.godaddy.com** and sign in. (This is GoDaddy's Domain Portfolio;
   the interface was updated in 2026 to take you here directly.)
3. Click your domain to open its **Domain Settings** page.
4. Select **DNS**, then the **Nameservers** tab, then **Change Nameservers**.
5. Choose **"I'll use my own nameservers"** (shown as "Enter my own
   nameservers (advanced)").
6. Remove GoDaddy's default entries (`ns*.domaincontrol.com`) and enter the
   **two Cloudflare nameservers** exactly as shown in your Cloudflare
   dashboard — no typos, no trailing dots.
7. Select **Save**, then **Continue**. If Domain Protection or 2-step
   verification is on, GoDaddy asks for a code (SMS, authenticator app, or an
   email OTP) — enter it to confirm.

Propagation is usually under an hour but can take up to 48 hours globally. It
worked when the **Nameservers** tab shows "Using custom nameservers" (not the
`domaincontrol.com` defaults) and Cloudflare emails you that the zone is
active. From then on, manage all DNS — including the `api` subdomain record
for Fly — in **Cloudflare**, not GoDaddy.

## 6. Going-live checklist

- [ ] `pnpm --filter @workspace/db run push` run against the Neon URL
- [ ] `curl .../api/healthz` returns ok
- [ ] Test notification endpoint works **with** the `X-Debug-Token` header, 404s **without**
- [ ] Submit a real booking from the live site → row appears in Neon, Telegram + email arrive
- [ ] `_redirects` file present → refresh on `/tests` works
- [ ] `.env` is not committed (check `git status`)
- [ ] (Multi-provider only) `CORS_ORIGIN` set to your site's origin(s) so the booking form works cross-origin
- [ ] (Optional) `ADMIN_PASSWORD_HASH` + `ADMIN_SESSION_SECRET` set if you want the `/admin` console

## Monthly cost recap

Cloudflare Pages ₹0 + Neon ₹0 + Fly scale-to-zero ≈ ₹0–₹250 → **within ₹300**,
with capacity for far more than 500 users/month.
