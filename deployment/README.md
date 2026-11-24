# Step-by-Step Home Server Deployment Guide (TrueNAS SCALE)

This guide walks through deploying the **Portfolio Survey** app (`web` + `postgres` + `cloudflared`) onto your TrueNAS SCALE home server (`ssd-storage`) safely, without exposing PostgreSQL to the internet or breaking existing Apps datasets.

---

## Phase 0 — TrueNAS SCALE Safety & Upgrade Check (Before Going Public)

Your server notes record **TrueNAS SCALE 24.10**, which is end-of-life. Before exposing any new public-facing service:

1. In TrueNAS UI go to **System → General Settings → Manage Configuration → Download File** and save a backup of your TrueNAS config (including the Password Secret Seed).
2. Review the TrueNAS SCALE release notes and confirm your existing Apps (`ssd-storage/apps`) are compatible with the target supported release.
3. Upgrade TrueNAS SCALE to a currently supported release, reboot, and confirm existing pools and Apps are healthy before continuing.

---

## Phase 1 — Inspect `ssd-storage/apps` & Create Dedicated Datasets

> **CRITICAL:** Never recursively `chown` or `chmod` `/mnt/ssd-storage` or `/mnt/ssd-storage/apps`. Only configure permissions on the new child datasets created for this app.

1. Open TrueNAS UI → **Storage → Datasets**.
2. Expand `ssd-storage` → expand `apps` and verify its existing child datasets so you don't collide with existing App directories.
3. Create three datasets under `ssd-storage/apps` (using the **Add Dataset** button):
   - `ssd-storage/apps/portfolio-survey` (Preset: **Apps** or **Generic**)
   - `ssd-storage/apps/portfolio-survey/postgres` (Recordsize: **16K** is ideal for PostgreSQL, Compression: `lz4`)
   - `ssd-storage/apps/portfolio-survey/backups`
4. Verify the PostgreSQL container's runtime UID/GID before setting dataset permissions (in TrueNAS Shell or on any Docker host):
   ```bash
   docker run --rm postgres:17.4-alpine id postgres
   ```
   *(For `postgres:17.4-alpine`, this is typically `uid=70(postgres) gid=70(postgres)`—if you ever switch to a Debian image, it is typically `999:999`.)*
5. Check the ACL type of `ssd-storage/apps/portfolio-survey/postgres` in **Storage → Datasets → Permissions**:
   - **If POSIX:** Set Owner = `70` (or the verified UID), Group = `70` (verified GID), Mode = `700` on `postgres` **only**.
   - **If NFSv4 ACL:** Edit permissions inside the TrueNAS UI (grant Full Control to the verified Postgres UID on `postgres` only) rather than running CLI `chown`/`chmod`.

---

## Phase 2 — Generate Production Secrets (Never Commit to Git)

Generate all secrets once and store them in your password manager (they will be pasted into TrueNAS Custom App environment variables or a root-only `.env` file on TrueNAS):

1. **PostgreSQL Password (hex avoids URL-encoding issues in `DATABASE_URL`):**
   ```bash
   openssl rand -hex 32
   ```
2. **Admin Session Secret (64-char hex):**
   ```bash
   openssl rand -hex 32
   ```
3. **Admin Password Hash (base64-encoded bcrypt — avoids `$` interpolation bugs in Docker Compose):**
   On your dev PC inside `d:\saas_survey\app`:
   ```bash
   node scripts/hash-admin-password.mjs
   ```
   Copy the `ADMIN_PASSWORD_HASH=...` line it prints.
4. **Cloudflare Turnstile (Bot Protection):**
   - In Cloudflare Dashboard → **Turnstile → Add widget**.
   - Add your production domain (e.g., `survey.yourdomain.com`), mode **Managed**.
   - Copy **Site Key** (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`) and **Secret Key** (`TURNSTILE_SECRET_KEY`).
   - Set `TURNSTILE_HOSTNAMES=survey.yourdomain.com` (never include `localhost` in production).
5. **Cloudflare Tunnel Token:**
   - In Cloudflare Zero Trust Dashboard → **Networks → Tunnels → Create a tunnel** (Cloudflared).
   - Copy the tunnel token (`CLOUDFLARE_TUNNEL_TOKEN`).
   - Add a **Public Hostname** route:
     - Subdomain/Domain: `survey.yourdomain.com`
     - Service Type: `HTTP`
     - URL: `web:3000` *(works directly over the private Compose `frontend` network—no host ports needed!)*

---

## Phase 3 — Build & Push a Pinned Docker Image to GHCR

Because `NEXT_PUBLIC_*` variables are baked into the client bundle at Next.js build time, pass `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` as build args or bake them in via a GitHub Actions workflow (recommended since Docker Desktop isn't required on your Windows PC).

### Option A — Build with Docker (on a machine with Docker or via SSH on TrueNAS)

1. Create a GitHub Personal Access Token (Classic) with `write:packages` scope, then log in to GHCR:
   ```bash
   echo "$GHCR_TOKEN" | docker login ghcr.io -u <your-github-username> --password-stdin
   ```
2. Build and push with a **pinned version tag** (`v1.0.0`, never unpinned `latest`):
   ```bash
   cd app
   docker build \
     --build-arg NEXT_PUBLIC_SITE_URL="https://survey.yourdomain.com" \
     --build-arg NEXT_PUBLIC_TURNSTILE_SITE_KEY="<your-turnstile-site-key>" \
     -t ghcr.io/<your-github-username>/portfolio-survey:v1.0.0 .
   docker push ghcr.io/<your-github-username>/portfolio-survey:v1.0.0
   ```
3. In GitHub → your package settings → verify visibility (or add GHCR credentials on TrueNAS if private).

### Option B — Build Automatically with GitHub Actions

Push this repo to a private GitHub repository and add a workflow using `docker/build-push-action` targeting `ghcr.io/<owner>/portfolio-survey:v1.0.0` (passing `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` from GitHub Actions Secrets/Variables).

---

## Phase 4 — Deploy via TrueNAS SCALE Apps (Custom App / Compose YAML)

1. Open TrueNAS UI → **Apps → Discover Apps → Custom App** (click the **Install via YAML** button in the top-right on TrueNAS 24.10+ / Electric Eel & Fangtooth).
2. Name the app `portfolio-survey`.
3. Paste the contents of [`deployment/compose.yaml`](./compose.yaml) and substitute the `${...}` placeholders with your actual values (or load from a root-only `.env` file if deploying via Compose CLI):
   - `APP_IMAGE`: `ghcr.io/<your-github-username>/portfolio-survey:v1.0.0` (or pinned `@sha256:...` digest)
   - `POSTGRES_DATA_DIR`: `/mnt/ssd-storage/apps/portfolio-survey/postgres`
   - `POSTGRES_USER`: `survey_app`
   - `POSTGRES_PASSWORD`: `<hex password from Phase 2>`
   - `POSTGRES_DB`: `portfolio_survey`
   - `NEXT_PUBLIC_SITE_URL`: `https://survey.yourdomain.com`
   - `ADMIN_USERNAME`: `admin`
   - `ADMIN_PASSWORD_HASH`: `<base64 bcrypt hash from Phase 2>`
   - `ADMIN_SESSION_SECRET`: `<hex secret from Phase 2>`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `TURNSTILE_HOSTNAMES`
   - `CLOUDFLARE_TUNNEL_TOKEN`: `<tunnel token from Phase 2>`
4. Click **Save / Install** and wait for all 3 containers to show **Healthy / Running**:
   - `portfolio-survey-postgres` (isolated on `backend` internal network; zero exposed ports)
   - `portfolio-survey-web` (joins `frontend` + `backend`)
   - `portfolio-survey-cloudflared` (joins `frontend` only)

---

## Phase 5 — Apply the Initial PostgreSQL Schema Migration

Apply the generated SQL migration (`app/prisma/migrations/20261124000000_init/migration.sql`) directly to your running PostgreSQL container on TrueNAS:

```bash
docker exec -i portfolio-survey-postgres \
  psql -U survey_app -d portfolio_survey < app/prisma/migrations/20261124000000_init/migration.sql
```

Verify the 3 tables exist (`survey_responses`, `follow_up_contacts`, `survey_events`):

```bash
docker exec portfolio-survey-postgres \
  psql -U survey_app -d portfolio_survey -c "\dt"
```

---

## Phase 6 — Layer Cloudflare Access Over `/admin` (Defense-in-Depth)

Even though `/admin` enforces server-side bcrypt + signed HttpOnly session cookies, add Cloudflare Access in front of it:

1. In Cloudflare Zero Trust → **Access → Applications → Add an application → Self-hosted**.
2. Application domain: `survey.yourdomain.com`, Path: `admin` (and add a second path rule for `api/admin`).
3. Create an **Allow** policy restricted to your own email address (OTP or identity provider).
4. Save. Now anyone hitting `/admin` or `/api/admin/*` must pass **both** Cloudflare Access and your app's own admin login.

---

## Phase 7 — Automated Backups, ZFS Snapshots & Verified Restore Test

### 1. Schedule Daily `pg_dump` Cron Job in TrueNAS
1. Copy [`deployment/backup-postgres.sh`](./backup-postgres.sh) to `/mnt/ssd-storage/apps/portfolio-survey/backups/backup-postgres.sh` and `chmod 700` it.
2. In TrueNAS UI → **System → Advanced Settings → Cron Jobs → Add**:
   - Command: `/mnt/ssd-storage/apps/portfolio-survey/backups/backup-postgres.sh`
   - User: `root`
   - Schedule: Daily (e.g., `03:00`)

### 2. Enable ZFS Snapshots & Offsite Copy
- In TrueNAS UI → **Data Protection → Periodic Snapshot Tasks → Add**:
  - Dataset: `ssd-storage/apps/portfolio-survey` (Recursive: checked), Daily, 14–30 day retention.
- In **Data Protection → Cloud Sync Tasks → Add**:
  - Sync `/mnt/ssd-storage/apps/portfolio-survey/backups` to an encrypted offsite destination (Cloudflare R2, Backblaze B2, or encrypted Google Drive) with **Filename & Data Encryption** enabled.

### 3. Mandatory Restore Verification Test (Before Launching the Survey!)
A backup that has never been restored is unproven. After running your first manual backup, verify it into a throwaway container:

```bash
# 1. Run a test backup
/mnt/ssd-storage/apps/portfolio-survey/backups/backup-postgres.sh

# 2. Restore into a disposable Postgres container and verify row counts
LATEST_DUMP="$(ls -t /mnt/ssd-storage/apps/portfolio-survey/backups/portfolio_survey_*.dump | head -n 1)"
docker run --rm -d --name pg-restore-test -e POSTGRES_PASSWORD=test postgres:17.4-alpine
sleep 5
docker exec -i pg-restore-test pg_restore -U postgres -d postgres --clean --if-exists < "$LATEST_DUMP"
docker exec pg-restore-test psql -U postgres -c "SELECT count(*) AS responses FROM survey_responses; SELECT count(*) AS contacts FROM follow_up_contacts;"
docker rm -f pg-restore-test
```

---

## Phase 8 — Final Pre-Launch Smoke Test Checklist

- [ ] Open `https://survey.yourdomain.com` on your phone (cellular data, off Wi-Fi) and verify it loads over HTTPS.
- [ ] Submit one pilot response (including opting in on Q20 with consent checked) and verify Turnstile passes.
- [ ] Open `https://survey.yourdomain.com/admin` → verify Cloudflare Access prompts first, then app login works.
- [ ] Confirm your pilot submission appears in KPIs, charts, and the separate **Contacts** tab (and **not** in DEV DEMO MODE).
- [ ] Download both **Responses CSV** and **Contacts CSV** and confirm columns open cleanly in Excel / Google Sheets.
- [ ] Delete your test rows before sharing the survey link with your 5–8 person pilot group!
