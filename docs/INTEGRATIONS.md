# INTEGRATIONS — سجل الموصلات والقدرات

Status vocabulary: `CONNECTED` · `READ_ONLY` · `WRITE_ENABLED` · `REQUIRES_APPROVAL` ·
`NOT_CONNECTED` · `UNAVAILABLE` · `BLOCKED`

| Capability | Provider | Status | Evidence | Notes |
|---|---|---|---|---|
| Database (PostgreSQL) | Supabase | **WRITE_ENABLED** | schema created, 7 properties + 11 media rows inserted, constraints verified | shared project; `mp_` namespace only |
| Object storage | Supabase Storage | **WRITE_ENABLED** (setup) / runtime untested | bucket `mp-media` created: public, 20 MB cap, MIME allowlist | upload path not exercised end-to-end (sandbox DNS) |
| Serverless hosting | Vercel | **READ_ONLY** ❌ | `list_projects` ok; `create_project` → `Access denied`; token reports `limited: true` | **blocks public deployment** |
| Domain & DNS | Vercel Domains | **BLOCKED** | depends on the hosting permission above | no domain supplied either |
| Source control | GitHub | **WRITE_ENABLED** | branch pushed: `arena/f10851ee-r` | PR can be opened on request |
| Email delivery | — | **NOT_CONNECTED** | no provider configured | inquiries are stored in the DB and shown in the dashboard; **no email is sent** |
| WhatsApp | wa.me deep links | **IMPLEMENTED (no API)** | links rendered only when the office enters a number | no Business API, no credentials |
| Maps / geocoding | — | **NOT_CONNECTED** | `latitude`/`longitude` columns reserved | no map provider or key |
| Analytics | — | **NOT_CONNECTED** | — | deliberately omitted (privacy: no third-party processor) |
| Payments | — | **NOT_CONNECTED** | not in scope | — |
| Backup tooling | Supabase | **UNVERIFIED** | plan-level setting not inspected | see `docs/DEPLOYMENT.md` → Backups |

## What this means for the office

- The platform **is not contacting customers on its own**. When someone submits the inquiry
  form, the record is saved and appears in the dashboard. Staff must open the dashboard
  (or use the direct call/WhatsApp buttons on each inquiry) to respond. Email or SMS
  notifications require a provider account and approval.
- Everything customer-facing runs on the platform's own database — there is no hidden
  third-party dependency for listings, search, or media.

## Adding an integration later

1. Obtain credentials and confirm the cost model **with the office** before activating.
2. Store secrets in the host's environment variables — never in the repository.
3. Add a server-only module; never call the provider from the browser.
4. Log failures and surface a friendly message; keep the inquiry saved even if a
   notification channel fails.
5. Record the integration in this table with its verification evidence.
