# SECURITY — الأمان والخصوصية

## Threat model

| Asset | Threat | Control |
|---|---|---|
| Owner phone numbers | scraping / leakage | columns absent from the public view and never selected by the public data layer |
| Admin accounts | credential stuffing | bcrypt cost 12, generic error messages (no user enumeration), 6 failures / 15 min lockout per email |
| Admin sessions | token theft / replay | HttpOnly + Secure + SameSite=Lax cookie, 8h expiry, server-side session row that can be revoked, JWT bound to `sid` + `sub` |
| Upload endpoint | malicious file execution | session + `editor` role required, 20 MB cap, magic-byte sniffing (extension never trusted), private storage path with UUID |
| Database | privilege escalation | RLS enabled on every table; `anon`/`authenticated` have all privileges revoked on sensitive tables; the browser never receives the service key |
| Inquiries | spam / flooding | schema validation, honeypot field, 5 submissions / 10 min per IP hash |
| Secrets | repository leakage | `.env*` git-ignored; service key only read server-side; `server-only` import guard makes misuse a build error |

## Implemented controls (with evidence)

1. **Password storage** — bcrypt cost 12. Verification always runs a hash comparison even
   when the account does not exist, so response timing does not leak account existence.
2. **Session architecture** — signed JWT carries only a session id; the authoritative record
   is `mp_admin_sessions`. Logout sets `revoked_at`, so a stolen cookie dies immediately.
   *Verified:* forged token with a valid signature but unknown session id → `307` (rejected).
3. **Authorisation** — four roles (`viewer < editor < manager < super_admin`).
   `requireRole()` is called inside every mutating server action, not just in the UI.
   Permanent deletion requires `manager`; archiving (reversible) requires `editor`.
4. **Owner-data isolation** — `mp_public_properties` view omits `owner_name`, `owner_phone`,
   `internal_notes`; `PUBLIC_COLUMNS` in `properties.ts` lists selected fields explicitly
   (no `select("*")` on public paths). *Verified:* grep over 6 rendered public pages found
   no owner phone.
5. **Upload hardening** — content type is derived from magic bytes (JPEG/PNG/WebP/AVIF/MP4/WebM);
   the declared `content-type` header and filename are ignored. Files land under
   `properties/<uuid>/<uuid>.<ext>`.
6. **HTTP headers** — `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
   `Permissions-Policy`, `HSTS` (2 years, includeSubDomains, preload). Next's
   `poweredByHeader` disabled.
7. **Audit trail** — every create/update/delete/status change/media action/login writes to
   `mp_audit_logs` with actor, entity, and IP hash. Read-only in the UI.
8. **No secret in the browser** — the Supabase client is created only in `db.ts`, which
   imports `server-only`. `NEXT_PUBLIC_*` is limited to a hostname and the public site URL.

## Deliberate non-choices

- **No Supabase Auth** — the project's `auth.users` is shared with another application;
  mixing tenants there would be a cross-app risk. See `DECISIONS.md` D-002.
- **No third-party analytics or chat widget** — both would add a data-processing party for
  personal data without a signed agreement or a stated need.
- **No client-side Supabase calls** — service-role access stays on the server.

## Residual risks (accepted, tracked in `RISKS.md`)

- `SameSite=Lax` means the cookie is not sent on cross-site POSTs; combined with no CORS
  wildcard on the upload route this limits CSRF. A dedicated CSRF token is **not** implemented;
  Next's server actions include a same-origin check as the primary defence.
- IP hashes are salted with the session secret; rotating that secret resets throttling history.
- Rate limiting is per-instance in Postgres, not a dedicated WAF. A sustained distributed
  attack would need edge-level protection (e.g. Vercel Firewall).
- Demo imagery is AI-generated illustration and is disclosed as such in the UI.

## Saudi regulatory notes (not legal advice)

- **PDPL** (نظام حماية البيانات الشخصية): inquiries and owner data are personal data.
  The platform collects the minimum needed, states the purpose, publishes a privacy policy,
  and separates owner data from public data. A **lawful basis, retention period, and DPO
  contact must be confirmed by the office**, and a consultant should review before launch.
- **No identifiers are invented.** Commercial registration, real-estate licence (الفال),
  and address remain empty until the office supplies verified documents. The UI shows
  neutral placeholders instead.
- Real-estate advertising rules (الهيئة العامة للعقار) on displaying valid licence numbers
  and truthful listings should be reviewed with the office's own licence data.

**Nothing here constitutes a claim of legal compliance.** `COMMERCIAL_LAUNCH_READY`
requires an explicit sign-off on the above.
