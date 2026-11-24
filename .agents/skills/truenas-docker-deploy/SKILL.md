---
name: truenas-docker-deploy
description: >-
  Guides production containerization, Docker Compose network isolation, TrueNAS
  SCALE dataset/ACL safety, Cloudflare Tunnel + Access routing, and PostgreSQL
  pg_dump backup/restore workflows for the Portfolio Survey app. Use when
  writing Dockerfiles, compose.yaml, deployment docs, or backup scripts.
---

# TrueNAS SCALE & Docker Compose Deployment Runbook

## 1. Next.js Production Container (`app/Dockerfile`)
- Enable `output: "standalone"` in `next.config.ts`.
- Use a **3-stage multi-stage Dockerfile** (`deps` -> `builder` -> `runner`) on a pinned Node LTS Alpine image (e.g., `node:22.18-alpine`).
- Run `npx prisma generate` in `builder` before `npm run build`.
- Run the final `runner` stage as a non-root user (`nextjs:nodejs`, UID/GID `1001`), exposing only port `3000`.
- Publish images to **GHCR** with **pinned version tags or SHA digests** (never unpinned `latest` in production Compose).

## 2. Docker Compose Architecture (`deployment/compose.yaml`)
Run three services in one Compose stack:
1. **`web`** (prebuilt Next.js GHCR image) — attached to both `frontend` and `backend` networks. Do **not** publish host ports unless needed for local LAN debugging.
2. **`postgres`** (pinned `postgres:17-alpine` or `postgres:16-alpine`) — attached **only** to `backend` (`internal: true`). Never publish `5432` to the host or internet. Include a `pg_isready` healthcheck and `depends_on: condition: service_healthy` on `web`.
3. **`cloudflared`** (pinned `cloudflare/cloudflared:<version>`) — attached **only** to `frontend`. Routes `survey.<domain>` directly to `http://web:3000` using `TUNNEL_TOKEN`.

## 3. TrueNAS SCALE Storage & Permission Safety
Confirmed pool: `ssd-storage` mounted at `/mnt/ssd-storage`. Planned datasets (create **only after** inspecting `ssd-storage/apps`):
- `/mnt/ssd-storage/apps/portfolio-survey/postgres`
- `/mnt/ssd-storage/apps/portfolio-survey/backups`

Safety checks before deployment:
1. Verify TrueNAS SCALE upgrade plan first (24.10 is EOL; back up TrueNAS config before upgrading).
2. Inspect the existing `apps` dataset in TrueNAS UI (`Storage -> Datasets`) before creating child datasets.
3. Check the Postgres container runtime UID/GID (commonly `999:999` on Debian images or `70:70` on `postgres:*-alpine` — **verify via `docker run --rm <image> id postgres`** before setting permissions!).
4. Check dataset ACL type:
   - **POSIX:** set ownership only on the dedicated `postgres` child dataset.
   - **NFSv4 ACL:** configure via TrueNAS UI; do not blindly run `chown`/`chmod`.
   - **Never** recursively change permissions on `/mnt/ssd-storage` or `/mnt/ssd-storage/apps`.

## 4. Secrets & Cloudflare Defense-in-Depth
- Generate hex secrets (`openssl rand -hex 32`) for `POSTGRES_PASSWORD` (avoids URL-encoding issues in `DATABASE_URL`) and `ADMIN_SESSION_SECRET`.
- Store secrets only in TrueNAS Apps environment config or a root-only `.env` file outside Git.
- If routing admin via a dedicated hostname or path, layer **Cloudflare Access** (`cloudflare-one` skill) in front of the app's own server-side admin authentication.

## 5. Backups & Verified Restore
- Schedule daily logical backups via `pg_dump --format=custom --compress=9` into `/mnt/ssd-storage/apps/portfolio-survey/backups/` with rolling retention (e.g., 14–30 days).
- Enable ZFS snapshots on `ssd-storage/apps/portfolio-survey` and replicate/sync an encrypted offsite copy.
- **Verification step (mandatory before launch):** restore a generated dump into a fresh throwaway Postgres container (`pg_restore`) and confirm row counts match for both `survey_responses` and `follow_up_contacts`.
