# DEPLOYMENT — النشر

## Current status: **BLOCKED** ⚠️

The application is built and committed but **is not publicly deployed**. Do not treat any
part of this document as confirmation of a live URL — there is none yet.

### What was attempted

| Attempt | Command/tool | Result |
|---|---|---|
| Create Vercel project (team scope) | `create_project` with `team_id` | `Access denied. Your token may not have the required permissions.` |
| Create Vercel project (personal scope) | `create_project` without `team_id` | `Access denied.` (same class of error) |
| List Vercel teams | `list_teams` | `Access denied.` |
| List Vercel projects | `list_projects` | **success** — returns `[]`, so the read side works and no project already exists |
| `get_authenticated_user` | — | returns `"limited": true` |

**Diagnosis:** the connected Vercel account token is **read-only** (the API reports
`limited: true`; every mutation is refused while reads succeed). Nothing in this repository
can change that — it is an account/token permission, not a code defect.

### What you must do (one of the two paths)

**Path A — reconnect Vercel with write scope**
1. In Arena, disconnect and reconnect the Vercel app, granting project/deployment write access.
2. Tell the agent to deploy. It will: create the project linked to `wedy5980-lab/r`,
   set the environment variables below, deploy, and verify the URL with HTTP checks.

**Path B — deploy yourself (5 minutes)**
1. Go to <https://vercel.com/new> → import `wedy5980-lab/r`.
2. Framework preset: **Next.js** (auto-detected). Root directory: `./`. No custom build command.
3. Add the environment variables from the table below (Production **and** Preview).
4. Deploy.

Either way, the branch to deploy is `arena/f10851ee-r` until it is merged.

---

## Required environment variables

| Key | Value source | Notes |
|---|---|---|
| `SUPABASE_URL` | `https://cpubqmmlznflahmijdlu.supabase.co` | server-only |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (secret key) | **server-only**; do not prefix with `NEXT_PUBLIC_` |
| `SESSION_SECRET` | generate: `openssl rand -base64 48` | ≥32 chars; rotating it invalidates all sessions |
| `NEXT_PUBLIC_SUPABASE_HOST` | `cpubqmmlznflahmijdlu.supabase.co` | used by `next/image` allowlist |
| `NEXT_PUBLIC_SITE_URL` | your final URL, e.g. `https://muath-realestate.vercel.app` | canonical + sitemap + OG |
| `DEMO_DATA` | **do not set in production** | only for offline UI previews |

## Post-deployment verification checklist

Run these against the live URL and record the results in `docs/TEST_REPORT.md` §6.

- [ ] `GET /` → 200, Arabic RTL rendering, hero image loads
- [ ] `GET /auctions` → 200 and shows `لا توجد مزادات حالياً`
- [ ] `GET /property/<real-ref>` → 200, gallery and inquiry form work
- [ ] HTTPS certificate valid; `http://` redirects to `https://`
- [ ] `GET /robots.txt` → disallows `/admin`
- [ ] `GET /sitemap.xml` → lists real listings
- [ ] Admin login succeeds with the office credentials
- [ ] Create → edit → archive a property; confirm it appears/disappears on the site
- [ ] Upload a real photo; confirm it persists in Supabase Storage and renders
- [ ] Set a property to «تم البيع»; confirm it leaves the public listing
- [ ] Submit the inquiry form; confirm the row appears in the dashboard
- [ ] Confirm no owner phone number is present in any public page source
- [ ] Run Core Web Vitals on `/` and one property page

## Custom domain

No domain was supplied, and buying one requires explicit approval (see governance in
`DECISIONS.md`). To attach an approved domain later:

1. Vercel → Project → Settings → Domains → add the domain.
2. At the registrar, point DNS: `A @ 76.76.21.21` and `CNAME www <cname>.vercel-dns.com`
   (use the exact values Vercel shows — do not guess).
3. Set the apex domain as canonical; add a 308 redirect from `www`.
4. Update `NEXT_PUBLIC_SITE_URL` and redeploy so canonical tags and the sitemap follow.
5. Confirm certificate issuance, then update `docs/TEST_REPORT.md`.

## Rollback

Vercel keeps every deployment immutable. To roll back: Project → Deployments → select the
last known-good deployment → **Promote to Production**. No database migration runs
automatically, so a rollback never corrupts data.

## Backups

Supabase daily backups depend on the project plan. **Verify the actual setting** in
Dashboard → Database → Backups before claiming backup coverage; it has not been verified here.
For an off-platform copy: `pg_dump` the `mp_*` tables on a schedule, or export via
Dashboard → Database → Backups. See `docs/HANDOVER.md`.
