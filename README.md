# مكتب معاذ الضحيان للعقارات — منصة عقارية متكاملة

Production real estate platform for **مكتب معاذ الضحيان للعقارات** — Arabic-first, full RTL,
database-backed, with a protected administration dashboard.

| | |
|---|---|
| **Stack** | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 |
| **Database** | PostgreSQL 17 on Supabase |
| **Storage** | Supabase Storage (`mp-media` bucket) |
| **Auth** | bcrypt(12) + HttpOnly JWT sessions with server-side revocation |
| **Hosting** | Vercel (see `docs/DEPLOYMENT.md` — **blocked, see status**) |
| **Language / Direction** | Arabic / `dir="rtl"` throughout |

---

## Quick start

```bash
npm install
cp .env.example .env.local     # then fill the values
npm run dev                    # http://0.0.0.0:3000
```

### Environment variables

| Key | Scope | Purpose |
|---|---|---|
| `SUPABASE_URL` | server | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | database + storage access (never sent to the browser) |
| `SESSION_SECRET` | server | ≥32 chars; signs admin session JWTs and salts IP hashes |
| `NEXT_PUBLIC_SUPABASE_HOST` | public | allowed host for `next/image` |
| `NEXT_PUBLIC_SITE_URL` | public | canonical origin for SEO/sitemap |
| `DEMO_DATA` | optional | `1` = render from the offline fixture instead of the database |

> `NEXT_PUBLIC_*` values are inlined into the client bundle. Never put a secret behind that prefix.

---

## Structure

```
src/
  app/
    (site)/            public website (shared header/footer)
      sale|rent|management|auctions   category listings
      search/          advanced search & filters
      property/[ref]   listing detail + gallery + inquiry
      contact/ about/ privacy/ terms
    admin/
      login/           public login screen
      (dashboard)/     auth-guarded: overview, properties, inquiries, settings, audit
    api/admin/upload/  authenticated media upload (magic-byte validation)
    actions/           server actions (auth, property CRUD, settings, inquiries)
  components/          UI: cards, gallery, filters, admin widgets
  lib/
    taxonomy.ts        single source of truth for the Arabic taxonomy
    properties.ts      public data access (never selects owner fields)
    auth.ts            sessions, RBAC, throttling, audit
    db.ts              service-role client (server-only)
    demo.ts            offline preview fixture (disabled in production)
supabase/migrations/   schema + seed SQL
docs/                  deployment, security, testing, handover
```

---

## Data model (abbreviated)

`mp_properties` · `mp_property_media` · `mp_categories` · `mp_admins` ·
`mp_admin_sessions` · `mp_login_attempts` · `mp_inquiries` · `mp_audit_logs` ·
`mp_office_settings`

All tables are prefixed `mp_` because this Supabase project is shared with another
application. Nothing outside the `mp_` namespace is read or modified. See `DECISIONS.md`.

Owner contact data (`owner_name`, `owner_phone`, `internal_notes`) lives on
`mp_properties` but is **structurally absent** from the public projection view
`mp_public_properties`, and the public data layer never selects those columns.

---

## Scripts

```bash
npm run dev        # development server
npm run build      # production build (also type-checks)
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
```

---

## Documentation

| Document | Contents |
|---|---|
| `DECISIONS.md` | architecture decision record |
| `RISKS.md` | live risk register |
| `docs/DEPLOYMENT.md` | deployment procedure + current blocker |
| `docs/SECURITY.md` | threat model and implemented controls |
| `docs/TEST_REPORT.md` | executed tests with actual results |
| `docs/HANDOVER.md` | operations guide, limitations, readiness gates |
| `docs/DATABASE_SCHEMA.md` | tables, relationships, policies |
| `docs/INTEGRATIONS.md` | connector/capability registry and status |

© مكتب معاذ الضحيان للعقارات
