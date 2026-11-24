# Portfolio Survey SaaS

Market-research survey web app and private analytics dashboard for a client-presentation-first SaaS targeting service professionals (architects, engineers, interior designers, contractors, consultants, and agencies) in the Philippines.

## Documentation

- [Client Presentation & Portfolio Workflow Survey](./client_presentation_portfolio_survey.md) — 20-question research questionnaire (5 sections)
- [Project Notes](./portfolio_survey_project_notes.md) — product direction, pricing hypotheses, technical stack, TrueNAS SCALE setup, and rollout checklist
- [TrueNAS & Docker Deployment Guide](./deployment/README.md) — Compose networking, ACL/UID safety checks, Cloudflare Tunnel/Access, and `pg_dump` restore verification

## Repository Structure

```text
.
├── .agents/skills/          # Installed open-source & custom project agent skills
├── AGENTS.md                # Workspace rules & architecture invariants
├── app/                     # Next.js 16 (App Router) + Astryx + Tailwind v4 + Prisma 7
│   ├── prisma/schema.prisma # PostgreSQL JSONB survey_responses + separated follow_up_contacts
│   ├── scripts/             # Admin bcrypt password hash helper
│   ├── src/
│   │   ├── app/             # /, /survey, /survey/thank-you, /privacy, /admin, /api/*
│   │   ├── components/      # SurveyWizard, PrivacyDialog, TurnstileWidget, AdminDashboardClient
│   │   ├── lib/             # db, survey-config (v1.0.0), validation, auth, turnstile, analytics, csv
│   │   └── themes/          # Compiled studio-folio Astryx theme (Stone #ECEBE6 / Graphite / Cobalt)
│   └── Dockerfile           # Multi-stage standalone production build
├── deployment/
│   ├── compose.yaml         # Production Compose (web + isolated postgres + cloudflared)
│   ├── compose.dev.yaml     # Local dev PostgreSQL container
│   ├── backup-postgres.sh   # Rolling pg_dump cron script
│   └── README.md
├── .env.example             # Environment variable template (placeholder-only)
└── .gitignore
```

## Local Development Quick Start

1. **Start local PostgreSQL:**
   ```bash
   docker compose -f deployment/compose.dev.yaml up -d
   ```
2. **Configure environment (`app/.env`):**
   Copy `.env.example` to `app/.env` and generate a bcrypt password hash for `/admin`:
   ```bash
   cd app
   node scripts/hash-admin-password.mjs
   ```
3. **Apply schema & run dev server:**
   ```bash
   cd app
   npx prisma migrate dev --name init
   npm run dev
   ```
   - Public Survey: `http://localhost:3000`
   - Admin Analytics: `http://localhost:3000/admin`

## Rebuilding the Custom Astryx Theme

If you edit tokens in `app/src/themes/studio-folio/studioFolioTheme.ts`:

```bash
cd app
npx astryx theme build src/themes/studio-folio/studioFolioTheme.ts
```
