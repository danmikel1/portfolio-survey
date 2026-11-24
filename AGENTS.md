# Portfolio Survey SaaS — Workspace Rules

## Project Context
This repository contains the market-research survey web app and private analytics admin dashboard for a client-presentation-first SaaS targeting service professionals (architects, engineers, interior designers, contractors, consultants, agencies) in the Philippines.

Primary source documents:
- `client_presentation_portfolio_survey.md` — 20-question survey draft (5 sections, pricing in PHP `₱`)
- `portfolio_survey_project_notes.md` — product direction, technical stack, TrueNAS SCALE home-server deployment, and operational constraints

## Tech Stack & Directory Target
- **App:** Next.js (App Router), TypeScript, Tailwind CSS, Zod validation, Prisma ORM, PostgreSQL (`JSONB`)
- **Ops:** Docker Compose (multi-stage Next.js `standalone` image via GHCR), Cloudflare Tunnel (`cloudflared`), Cloudflare Access, Cloudflare Turnstile
- **Planned layout:**
  - `app/` — Next.js application (`src/app`, `src/components`, `src/lib`, `prisma/`, `Dockerfile`)
  - `deployment/` — Docker Compose and TrueNAS deployment configs (`compose.yaml`, backup scripts)

## Non-Negotiable Architecture & Privacy Rules
1. **Stable question IDs & versioning:** Never key stored answers by raw question text. Always store answers in PostgreSQL `JSONB` keyed by stable IDs (`q01_profession`, etc.) alongside an explicit `surveyVersion`.
2. **PII separation (RA 10173):** Keep optional `follow_up_contacts` strictly separated from `survey_responses` (no unnecessary coupling). Require explicit consent before collecting contact info. Never store respondent IP addresses or unnecessary personal data.
3. **Defense-in-depth security:**
   - Validate every API payload server-side with Zod.
   - Never store passwords in plaintext (use Argon2id or bcrypt hashes).
   - Protect admin routes with server-side session authentication even when Cloudflare Access is enabled in front of them.
   - Never commit `.env` files, database passwords, session secrets, or Cloudflare Tunnel tokens. Keep `.env.example` placeholder-only.
4. **TrueNAS SCALE & storage safety:**
   - Never assume `/mnt/ssd-storage/apps/portfolio-survey/*` exists until the existing `apps` dataset is inspected.
   - Never run recursive `chown` or `chmod` on storage pools or shared `apps` datasets; respect POSIX vs NFSv4 ACLs.
   - Never expose PostgreSQL ports to the public internet; isolate the DB on a private Docker Compose backend network.
   - Pin Docker image versions/digests in production instead of unpinned `latest` tags.

## Workspace Skills
Check `.agents/skills/` and installed plugins before implementing features:
- `survey-schema-privacy` — survey versioning, Zod validation, `JSONB` analytics, CSV export, RA 10173 compliance
- `truenas-docker-deploy` — Docker multi-stage builds, Compose networking, TrueNAS dataset permissions, `pg_dump` backups
- Installed upstream & plugin skills (`modern-web-guidance`, `cloudflare`, `turnstile-spin`, `cloudflare-one`, `frontend-design`, React/Next.js, Prisma, Postgres, Playwright testing)
