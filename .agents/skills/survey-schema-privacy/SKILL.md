---
name: survey-schema-privacy
description: >-
  Guides schema design, Zod validation, conditional branching, JSONB analytics,
  CSV exports, and Philippine Data Privacy Act (RA 10173) compliance for the
  Client Presentation & Portfolio Workflow Survey app. Use when designing or
  editing Prisma models, survey question definitions, submission API routes,
  admin analytics queries, or privacy notices.
---

# Survey Schema, Validation & Privacy Runbook

## 1. Survey Configuration & Versioning
- Define the questionnaire in a single typed config module (e.g., `app/src/lib/survey-config.ts`) exported with a semantic `SURVEY_VERSION` (e.g., `v1.0.0`).
- Assign every question a **stable snake_case ID** (e.g., `q01_profession`, `q17_top_capabilities`, `q20_followup_opt_in`) independent of display copy so wording edits never break historical responses.
- Support conditional branching cleanly (e.g., skipping presentation-prep questions when a respondent pitches `0` times / `Never` presented, and only revealing contact fields when Q20 is `yes` or `maybe`).

## 2. Database Model (`Prisma` + PostgreSQL `JSONB`)
Keep logical separation between anonymous research answers and optional personal contact data:
- **`SurveyResponse` (`survey_responses`)**
  - `id` (UUID/CUID), `surveyVersion` (string), `submittedAt` (DateTime), `answers` (`Json` / `JSONB`), `completionSeconds` (optional Int), `metadata` (non-PII only, e.g., coarse device category or locale—**no IP addresses**).
- **`FollowUpContact` (`follow_up_contacts`)**
  - Stored in its own table **without** a foreign key back to `survey_responses` unless explicitly required for interview sampling; if linked for research segmentation, store only coarse segment tags (e.g., profession + willingness-to-pay bucket) rather than linking raw responses.
  - Fields: `id`, `name` (optional), `contact` (email/phone/handle), `availability` (`yes` | `maybe`), `consentGiven` (Boolean, must be `true` on write), `consentTimestamp`, `privacyNoticeVersion`, `createdAt`.
- **Optional `SurveyEvent` (`survey_events`)**
  - Funnel drop-off events (section viewed / submitted) keyed by an ephemeral client-generated session token—never by IP or user fingerprint.

## 3. Validation Rules (`Zod`)
Enforce identical rules on client UX and server API (`POST /api/submissions`):
- Multi-select questions with `Other`: allow array of valid option keys + optional trimmed `otherText` (capped at 200 chars).
- **Q17 (`top_capabilities`)**: enforce `.max(3)` selections both in UI state and Zod schema.
- **Free-text questions (Q12, Q14)**: sanitize/trim and cap length (e.g., 1,000 chars).
- **Q20 + Follow-up contact**: reject contact details unless `consentGiven === true`; strip contact fields completely if Q20 is `no`.
- **Bot & abuse control**: verify Cloudflare Turnstile token server-side (`turnstile-spin` skill) and apply privacy-preserving rate limiting (in-memory/reverse-proxy token bucket without persisting raw IPs to PostgreSQL).

## 4. Admin Analytics & CSV Export
- Protect `/admin` and `/api/admin/*` with server-side session authentication (Argon2id/bcrypt password hash + signed HttpOnly/SameSite=Lax cookie) in addition to Cloudflare Access.
- Support filters by `surveyVersion`, profession segment, firm size, and willingness-to-pay tier.
- **CSV Export safety**:
  - Neutralize spreadsheet formula injection by prefixing values starting with `=`, `+`, `-`, `@`, `\t`, or `\r` with a single quote `'`.
  - Provide separate CSV downloads for **Survey Responses** and **Follow-up Contacts** so raw research exports stay PII-free.

## 5. Philippine Data Privacy Act (RA 10173) Checklist
Before launch, verify the public UI includes:
- Clear **Privacy Notice** on the landing page and before the contact opt-in (purpose of research, data collected, no IP storage, retention period, deletion contact).
- Explicit unchecked **consent checkbox** whenever optional name/contact info is entered.
- Documented retention & deletion workflow (delete `follow_up_contacts` once interviews/beta invites conclude).
