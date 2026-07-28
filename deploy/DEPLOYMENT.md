# Deploying Vrindavan to your Bluehost VPS

This deploys the whole stack — Postgres, the NestJS API, the Flutter web app, and an HTTPS
reverse proxy — as one Docker Compose project on a single VPS. Everything below runs on the
Bluehost box over SSH.

**What you get:** `https://your-domain` serves the app; `https://your-domain/api` is the API;
HTTPS certificate is issued and renewed automatically; product images and the database live on
persistent disk and are covered by the backup script.

---

## 0. Before you start — the two prerequisites

1. **A git repository.** This project is *not* in git yet. Before shipping to a server, get it
   in version control (even a private GitHub/GitLab repo) so you can clone it onto the VPS and
   pull updates. On your Mac, from the project root:
   ```bash
   git init && git add -A && git commit -m "Vrindavan: initial commit"
   # then create a private remote and: git remote add origin <url> && git push -u origin main
   ```
   Make sure `deploy/.env` is **never** committed (it holds secrets) — it isn't tracked as long
   as you only ever create it on the server.

2. **Your domain's DNS.** In your domain registrar, add an **A record** pointing your chosen
   hostname (e.g. `app.yourdomain.com`) to the VPS's public IPv4 address. HTTPS won't issue until
   this resolves. (Add a second A record for `www` if you want it.)

---

## 1. Prepare the VPS (one time)

SSH in as root (Bluehost gives you the IP + root password/SSH key), then install Docker:

```bash
ssh root@YOUR_VPS_IP

# Docker Engine + Compose plugin (official convenience script)
curl -fsSL https://get.docker.com | sh

# Basic firewall: allow SSH + HTTP + HTTPS only
apt-get install -y ufw
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
```

> If the VPS came with the "Claude Code" image, that's just Ubuntu with an extra CLI — ignore it,
> none of it is used here. You only need Docker.

---

## 2. Get the code onto the VPS

```bash
git clone <your-repo-url> vrindavan
cd vrindavan/deploy
```

---

## 3. Configure secrets

```bash
cp .env.prod.example .env
nano .env
```

Fill in every `CHANGE_ME`. Generate strong secrets right on the box:

```bash
openssl rand -base64 24   # -> POSTGRES_PASSWORD (also paste into DATABASE_URL)
openssl rand -hex 32      # -> ACCESS_TOKEN_SECRET
openssl rand -hex 32      # -> REFRESH_TOKEN_SECRET
```

Set `SITE_ADDRESS=app.yourdomain.com` and `API_BASE_URL=https://app.yourdomain.com/api`.
Make sure `DATABASE_URL`'s password matches `POSTGRES_PASSWORD` exactly.

---

## 4. Build and start

```bash
docker compose build          # builds the backend image + Flutter web bundle (first run is slow)
docker compose up -d          # starts db -> migrate (runs once) -> backend -> web
docker compose ps             # all should be "running", except `migrate` which shows "exited (0)"
```

What happens on first `up`:
- **db** initialises and applies the genesis schema once (creates `public` + `tenant_template`).
- **migrate** baselines that schema and applies `tenant_changes/*.sql`, then exits 0.
- **backend** starts the API; **web** (Caddy) requests a Let's Encrypt cert for your domain.

Watch the logs until it's healthy:

```bash
docker compose logs -f backend        # look for the Nest "listening" line
docker compose logs -f web            # look for the certificate being obtained
```

---

## 5. Verify

```bash
curl -s https://app.yourdomain.com/health          # backend health (through Caddy + TLS)
```

Then open **`https://app.yourdomain.com`** in a browser. You'll land on the login screen. Create
your company with **Sign up** — that provisions your tenant (clones `tenant_template`, seeds
roles/permissions/units, creates your admin user) and logs you in.

You can now share `https://app.yourdomain.com` with your client.

> **Tip — smoke test before DNS is ready:** use the local override (verified end-to-end):
> set `SITE_ADDRESS=:80` and `API_BASE_URL=http://localhost:8088/api` in `.env`, then
> `docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build` and hit
> `http://localhost:8088` (health: `curl http://localhost:8088/health`). Tear down with the same
> `-f` flags plus `down -v`. Switch `.env` back to the real domain + `https://…/api` and rebuild
> `web` for the real run. (On the VPS itself you can substitute the server IP for `localhost`.)

---

## 6. Backups (set up on day one)

The DB and images live in Docker volumes on this box. `backup.sh` dumps both to `deploy/backups/`
and prunes old files.

```bash
./backup.sh                    # run once by hand to confirm it works
ls -lh backups/                # db-*.sql.gz and uploads-*.tar.gz
```

Schedule a nightly run at 02:30 with cron:

```bash
crontab -e
# add:
30 2 * * * cd /root/vrindavan/deploy && ./backup.sh >> backups/backup.log 2>&1
```

**Get an offsite copy (3-2-1).** A backup on the same box won't survive losing the box. Install
`rclone` (`apt-get install -y rclone`), run `rclone config` to add a Google Drive remote, then
uncomment the rclone block in `backup.sh`. Optionally uncomment the `gpg` block to encrypt dumps
before they leave the server.

### Restoring from a backup

Always drill this into a *scratch* database first, never straight over production:

```bash
# DB (into a throwaway db to verify the dump is good)
docker compose exec -T db createdb -U vrindavan vrindavan_restore_test
gunzip -c backups/db-YYYYMMDD-HHMMSS.sql.gz | \
  docker compose exec -T db psql -U vrindavan -d vrindavan_restore_test
docker compose exec -T db dropdb -U vrindavan vrindavan_restore_test   # cleanup after checking

# Uploads
gunzip -c backups/uploads-YYYYMMDD-HHMMSS.tar.gz | \
  docker compose exec -T backend tar -C /app/backend -xf -
```

---

## 7. Updating after a code change

```bash
cd /root/vrindavan
git pull
cd deploy
docker compose build
docker compose up -d           # migrate re-runs automatically and applies any new tenant_changes
```

Zero schema-loss on update: your data is in the `pgdata` and `uploads` volumes, untouched by
rebuilds. New `database/migrations/tenant_changes/*.sql` files are applied by the `migrate`
service on the next `up`.

---

## 8. Operating notes

- **Logs:** `docker compose logs -f backend` (or `db` / `web`).
- **Restart one service:** `docker compose restart backend`.
- **Stop everything:** `docker compose down` (volumes/data are kept; add `-v` to wipe them — don't).
- **Real emails / OTP:** launch works with `EMAIL_PROVIDER=console` (OTPs print to the backend
  logs). For real delivery, set `EMAIL_PROVIDER=smtp` and the `SMTP_*` values in `.env`, then
  `docker compose up -d backend`.
- **Change the domain later:** update `SITE_ADDRESS` and `API_BASE_URL` in `.env`, then
  `docker compose up -d --build web` (the API origin is compiled into the web bundle, so `web`
  must be rebuilt — the backend and DB don't).
- **Sizing:** on the Bluehost NVMe-4 tier (2 vCPU / 4 GB) this whole stack runs comfortably.
  Postgres is the main memory user; the Node API and Caddy are light.

---

## Architecture recap

```
                       Internet (HTTPS)
                             │
                    ┌────────▼────────┐
                    │   web (Caddy)   │  TLS, serves Flutter app,
                    │   :80 :443      │  proxies /api /uploads /health
                    └────┬───────┬────┘
                         │       │
              /api,/uploads      │ (everything else = the SPA, from /srv)
                         │
                    ┌────▼────────┐
                    │   backend   │  NestJS API (:3000, internal only)
                    │             │  shells out to pg_dump/psql on tenant signup
                    └────┬────────┘
                         │
                    ┌────▼────────┐        volumes: pgdata (database)
                    │     db      │                 uploads (product images)
                    │  Postgres18 │                 caddy_data (TLS certs)
                    └─────────────┘
   migrate (one-shot): baselines genesis + applies tenant_changes, then exits.
```
