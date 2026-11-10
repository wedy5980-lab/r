# DATABASE SCHEMA

Project: Supabase `cpubqmmlznflahmijdlu` (PostgreSQL 17, `eu-central-1`).
Namespace: all platform tables are prefixed `mp_` because this project is shared with
another application. Migration source: `supabase/migrations/0001_mp_init_schema.sql`.

## Entity relationships

```
mp_categories ──── (main_category, key) ──── logical reference ──── mp_properties
                                                                        │ 1
                                                                        │
                                                                        ▼ N
                                                              mp_property_media

mp_properties 1 ──── N mp_inquiries
mp_properties 1 ──── N mp_audit_logs (via entity_id, polymorphic)

mp_admins 1 ──── N mp_admin_sessions
mp_admins 1 ──── N mp_inquiries (handled_by)
mp_admins 1 ──── N mp_audit_logs (admin_id)

mp_office_settings  (single row, id = 1)
mp_login_attempts   (append-only)
```

## mp_properties

| Column | Type | Rule |
|---|---|---|
| `id` | uuid | PK, `gen_random_uuid()` |
| `reference_number` | text | **unique**, not null (e.g. `MP-2026-0001`) |
| `title` | text | not null, length 3–200 |
| `main_category` | text | check in (`sale`,`rent`,`management`,`auction`) |
| `subcategory` | text | validated in app against the category's allowed list |
| `description` | text | up to 5000 chars (app-level) |
| `city`, `neighborhood`, `address` | text | free text |
| `latitude`, `longitude` | numeric(9,6) | reserved for maps |
| `area`, `street_width` | numeric | > 0 when present |
| `price` | numeric(14,2) | ≥ 0 |
| `price_type` | text | `total` \| `per_year` \| `per_month` \| `per_day` \| `negotiable` |
| `bedrooms`, `bathrooms`, `floors` | int | ≥ 0 |
| `status` | text | `available` \| `sold` \| `rented` \| `unavailable` \| `archived` |
| `owner_name`, `owner_phone`, `internal_notes` | text | **confidential** |
| `is_featured` | boolean | presentation only |
| `is_demo` | boolean | marks seeded illustrative data |
| `published_at`, `created_at`, `updated_at` | timestamptz | `updated_at` maintained by trigger |
| `created_by`, `updated_by` | uuid | admin id |

Indexes: `status`, `(main_category, subcategory)`, `(city, neighborhood)`, `price`, `area`,
`created_at desc`.

## mp_property_media

`id` uuid PK · `property_id` uuid FK → `mp_properties` **on delete cascade** ·
`media_type` (`image`|`video`) · `media_url` · `thumbnail_url` · `alt_ar` · `display_order` ·
`created_at`. Index on `(property_id, display_order)`.

## mp_admins / sessions / attempts

- `mp_admins`: `email` unique, `password_hash` bcrypt, `role` in
  (`super_admin`,`manager`,`editor`,`viewer`), `is_active`, `last_login_at`.
- `mp_admin_sessions`: `token_hash` unique (SHA-256 of the random token), `expires_at`,
  `revoked_at`, `user_agent`, `ip_hash`.
- `mp_login_attempts`: `email_hash`, `ip_hash`, `success`, append-only.

## mp_inquiries

`property_id` (FK, `on delete set null`), `name` (2–100), `phone` (7–20), `email`,
`message` (≤2000), `status` (`new`|`contacted`|`closed`|`spam`), `source`, `handled_by`, `handled_at`.

## mp_audit_logs

`admin_id`, `action`, `entity`, `entity_id`, `details` jsonb, `ip_hash`, `created_at`.

## mp_office_settings

Single row (`id = 1`): office name, tagline, about, phone, whatsapp, email, address,
working hours, logo URL, brand/accent colours, social links jsonb,
`show_owner_phone` (default **false**).

## Security model

- **RLS enabled** on all nine tables (`relrowsecurity = true`, verified).
- `anon` and `authenticated` have **all privileges revoked** on `mp_admins`,
  `mp_admin_sessions`, `mp_login_attempts`, `mp_inquiries`, `mp_audit_logs`.
- Application access is exclusively server-side with the service role.
- `mp_public_properties` view exposes only `status = 'available'` rows and **omits all
  owner columns** — verified by introspection.

## Verified integrity (executed 2026-11-10)

| Check | Result |
|---|---|
| Duplicate reference blocked (unique constraint) | true |
| Invalid status rejected — live insert with `bogus_status` failed with `23514` | true |
| Negative prices present | 0 rows |
| Owner fields in public view | none |
| Plaintext passwords | none |
| RLS on all tables | true |

## Migration procedure

Migrations are plain SQL and idempotent (`create table if not exists`, `on conflict do nothing`).
Apply with `create_migration` on the Supabase connector, or:

```bash
psql "$DATABASE_URL" -f supabase/migrations/0001_mp_init_schema.sql
```

The taxonomy seed lives in the same file's companion statements; re-running it only updates
labels and ordering (`on conflict … do update`).
