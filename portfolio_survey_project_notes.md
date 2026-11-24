# Portfolio Survey SaaS --- Project Notes

*Last updated: 24 November 2026*

## 1. Project overview

Build a client-presentation-first SaaS for service professionals,
including:

-   Architects
-   Engineers
-   Interior designers
-   Contractors
-   Consultants
-   Agencies

The product helps professionals win clients by turning reusable project
information into polished, personalized presentations.

### Product direction

The reusable project library is the foundation. It can power:

1.  A public portfolio
2.  Personalized client presentations
3.  Shareable private presentation links
4.  Proposals in a later release

### MVP scope

-   User profile and branding
-   Projects / case studies
-   Public portfolio URL
-   Presentation builder
-   Private shareable presentation links
-   Mobile-friendly presentation pages

Potential later features:

-   PDF export
-   Presentation analytics
-   Proposals
-   Teams
-   AI-assisted content and presentation creation

## 2. Pricing hypotheses

These are research hypotheses, not validated prices:

  Tier       Proposed price
  -------- ----------------
  Free                 Free
  Pro            ₱399/month
  Studio         ₱999/month

Validate willingness to pay through survey responses and interviews
before committing to these prices.

## 3. Market research

A survey was prepared with 20 questions across five sections:

1.  Professional background
2.  Current workflow
3.  Pain points and business impact
4.  Solution validation
5.  Pricing and follow-up

### Suggested research rollout

-   Start with a pilot of 5--8 people.
-   Distribute through relevant professional Facebook groups, LinkedIn,
    personal networks, professional associations, and relevant Reddit
    communities.
-   Run a 2--3 week campaign.
-   Aim for approximately 75 usable responses and 12 interviews.
-   Test a prototype with interested respondents after the survey.

Before broad distribution, consider shortening the survey to 12--15
questions and using conditional logic for people who do not regularly
pitch or present to clients.

A neutral research invitation was drafted in the earlier conversation.

## 4. Survey website --- proposed technical architecture

The survey will be hosted on a home server.

### Application stack

-   Next.js
-   TypeScript
-   Tailwind CSS
-   Next.js API routes
-   PostgreSQL
-   Prisma ORM
-   Zod validation
-   Docker Compose
-   Cloudflare Tunnel

A private admin dashboard should support:

-   Response counts
-   Profession / respondent segment breakdowns
-   Preparation-time analysis
-   Pain-point analysis
-   Willingness-to-pay analysis
-   Cross-segment comparisons
-   CSV export

### Data model principles

-   Store survey answers as JSON in PostgreSQL (`JSONB`).
-   Use stable question IDs rather than relying on question wording.
-   Record a survey version so responses remain interpretable if the
    questionnaire changes.
-   Keep optional follow-up contact details separate from survey
    answers.
-   Do not collect IP addresses or other personal data unless there is a
    clear need.

Suggested logical tables:

-   `survey_responses`
-   `follow_up_contacts`
-   Optional: `survey_events`

Privacy and security considerations:

-   Make follow-up contact information optional.
-   Obtain clear consent before using contact details for interviews or
    follow-up.
-   Keep contact details separate from survey answers.
-   Provide a privacy notice and retention policy.
-   Consider obligations under the Philippine Data Privacy Act (RA
    10173).
-   Use HTTPS, rate limiting, spam protection / CAPTCHA, backups, and
    secure admin authentication.
-   Do not store passwords in plaintext.

## 5. Home server details confirmed so far

  Item                      Confirmed detail
  ------------------------- -----------------------------
  Hardware                  Old desktop PC
  NAS OS                    TrueNAS SCALE 24.10
  RAM                       32 GB
  CPU                       Intel Core i5
  Docker / app management   TrueNAS Apps interface
  Domain                    Available
  External access           Cloudflare Tunnel available
  Storage pool              `ssd-storage`
  Pool mount path           `/mnt/ssd-storage`

### Storage screenshot observations

The TrueNAS Datasets view showed:

-   Pool: `ssd-storage`
-   Existing child dataset: `apps`
-   Other visible datasets: `development-86xyc9`, `local`, and `media`

The screenshot showed `apps` using approximately 25.61 GiB, and the pool
showing approximately 1.28 TiB used / 575.9 GiB available. These are
screenshot-time figures and may change.

The `apps` dataset has not yet been expanded and inspected. Do not
create the survey datasets until its existing contents and intended use
have been checked.

### Shell command issue

The TrueNAS shell returned:

``` text
zsh: command not found: zpool
zsh: command not found: zfs
```

This may be a command-path / shell environment issue. The pool was
identified through the TrueNAS Storage → Datasets UI instead. No
command-line storage changes have been made based on that error.

## 6. Planned storage layout

Subject to checking the existing `apps` dataset first, the proposed
layout is:

``` text
ssd-storage/
└── apps/
    └── portfolio-survey/
        ├── postgres/
        └── backups/
```

Expected host paths:

``` text
/mnt/ssd-storage/apps/portfolio-survey/postgres
/mnt/ssd-storage/apps/portfolio-survey/backups
```

Do not assume these datasets or directories already exist. Create them
only after confirming that this location is appropriate within the
existing TrueNAS Apps layout.

### PostgreSQL storage permissions

The official PostgreSQL container commonly runs as UID/GID 999, but
verify the selected image's runtime user before setting ownership.

If the dataset uses POSIX permissions, a dedicated PostgreSQL data
directory may need ownership by the PostgreSQL container user and
restrictive permissions. If it uses NFSv4 ACLs, configure permissions
through the TrueNAS UI instead of blindly applying POSIX `chown` /
`chmod` commands.

Do not recursively change permissions on the pool or on existing Apps
datasets.

## 7. TrueNAS version caution

The server is reported to be running TrueNAS SCALE 24.10. This release
is end-of-life according to the research performed in the earlier
conversation.

Before exposing a new public-facing application:

1.  Back up the TrueNAS configuration.
2.  Review the upgrade notes and compatibility of existing Apps.
3.  Plan an upgrade to a currently supported TrueNAS release.
4.  Confirm the existing Apps and storage are healthy after upgrading.

Do not upgrade without checking compatibility and having a recovery
plan.

## 8. Proposed source-code structure

The following is a proposed development structure, not a directory
confirmed to exist yet:

``` text
portfolio-survey/
├── app/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx
│   │   │   ├── survey/
│   │   │   ├── admin/
│   │   │   └── api/
│   │   │       └── submissions/
│   │   │           └── route.ts
│   │   ├── components/
│   │   │   ├── survey/
│   │   │   ├── admin/
│   │   │   └── ui/
│   │   └── lib/
│   │       ├── db.ts
│   │       ├── validation.ts
│   │       └── auth.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   └── next.config.ts
├── deployment/
│   ├── compose.yaml
│   └── README.md
├── .env.example
├── .gitignore
└── README.md
```

## 9. Deployment approach

Recommended approach:

1.  Develop and test the Next.js app on a development machine.
2.  Build a Docker image.
3.  Push the image to a container registry such as GitHub Container
    Registry (GHCR).
4.  Deploy the prebuilt image through TrueNAS Apps using a Custom App /
    Compose YAML workflow supported by the installed TrueNAS version.
5.  Run PostgreSQL in the same Compose project.
6.  Run `cloudflared` in the same project to connect the app to
    Cloudflare Tunnel.

Prefer a pinned image version or digest rather than an unpinned `latest`
tag for production.

### Network design

-   The web app connects to PostgreSQL over a private backend network.
-   Cloudflare Tunnel connects to the web app over a frontend network.
-   Do not publish PostgreSQL to the public internet.
-   Do not expose unnecessary host ports.
-   The Cloudflare public hostname can route to the web service by its
    Compose service name when both services share a network.

### Cloudflare

A planned public hostname could be:

``` text
survey.example.com
```

Replace `example.com` with the actual domain.

If the admin dashboard is reachable through a separate hostname, protect
it with Cloudflare Access and also implement server-side authentication
in the application. Cloudflare Access should be an additional layer, not
the only application security control.

### Secrets

Generate strong, unique secrets for:

-   PostgreSQL password
-   Admin/session secret
-   Cloudflare Tunnel token

Keep secrets out of source control and `.env.example`. Use actual secret
values only in the deployment's protected environment configuration. A
randomly generated hexadecimal database password avoids URL-encoding
complications in a PostgreSQL connection string.

## 10. Backup and recovery

Plan to:

-   Run regular PostgreSQL logical backups using `pg_dump`.
-   Store backups in the dedicated backups location.
-   Retain a sensible rolling history.
-   Enable ZFS snapshots where appropriate.
-   Keep an encrypted offsite copy.
-   Test restoring a backup; a backup that has never been restored is
    not yet proven.

If a backup script uses `docker exec` with a fixed container name,
ensure the Compose service has that matching `container_name`, or use
the actual container name discovered at runtime.

## 11. Current status and next actions

### Confirmed

-   [x] Product concept and initial MVP direction
-   [x] Survey structure and research rollout plan
-   [x] Proposed web application stack
-   [x] Home server hardware and TrueNAS version
-   [x] Domain and Cloudflare Tunnel availability
-   [x] Storage pool identified as `ssd-storage`
-   [x] Pool mount path identified as `/mnt/ssd-storage`

### Still to do

-   [ ] Expand and inspect the existing `apps` dataset in TrueNAS.
-   [ ] Confirm the correct location for the survey app's datasets.
-   [ ] Review TrueNAS upgrade path and back up configuration.
-   [ ] Create the dedicated PostgreSQL and backup datasets.
-   [ ] Confirm dataset ACL type and configure permissions safely.
-   [ ] Build the Next.js survey and admin dashboard.
-   [ ] Add validation, authentication, spam controls, and privacy
    notices.
-   [ ] Build and publish the Docker image.
-   [ ] Deploy the Compose application through TrueNAS Apps.
-   [ ] Configure the Cloudflare Tunnel hostname and admin protection.
-   [ ] Test submissions, exports, backups, and restore.

## 12. Important assumptions

-   The proposed dataset paths are targets, not confirmed existing
    paths.
-   The actual domain name has not been provided in these notes.
-   The pool's full ZFS dataset tree has not yet been inspected.
-   The app source code and Docker image have not yet been created.
-   The proposed prices are unvalidated research hypotheses.
-   The exact TrueNAS upgrade target should be checked against current
    release notes before proceeding.
