# TEST REPORT — تقرير الاختبارات

**Date:** 2026-11-10 · **Commit:** `3f544a2` (+ fixes) · **Environment:** sandbox, `DEMO_DATA=1` for UI rendering

> Every result below was produced by an executed command. Nothing here is projected or assumed.
> Where a test could not run, it is listed as **NOT EXECUTED** with the reason — never as a pass.

---

## 1. Build & static analysis

| ID | Test | Command | Result | Evidence |
|---|---|---|---|---|
| B-01 | Production build | `npx next build` | **PASS** | compiled + TypeScript clean; 22 routes emitted |
| B-02 | Type checking | included in build | **PASS** | "Finished TypeScript in 453ms", 0 errors |
| B-03 | Dependency vulnerabilities | `npm audit` | **PASS** | `found 0 vulnerabilities` |
| B-04 | Supply-chain remediation | upgrade Next 15 → 16 | **PASS** | Next 15 pulled a high-severity transitive `postcss` CVE (GHSA-qx2v-qp2m-jg93, GHSA-6g55-p6wh-862q); upgraded to 16.4.6 and re-audited to zero |

## 2. Public route availability (HTTP)

| Route | Status | Bytes |
|---|---|---|
| `/` | 200 | 132,505 |
| `/sale` | 200 | 82,264 |
| `/rent` | 200 | 81,479 |
| `/management` | 200 | 57,430 |
| `/auctions` | 200 | — |
| `/search` | 200 | 110,535 |
| `/property/MP-2026-0001` | 200 | 76,649 |
| `/contact` | 200 | 40,283 |
| `/about` | 200 | 43,287 |
| `/privacy` | 200 | 41,244 |
| `/robots.txt` | 200 | — |
| `/sitemap.xml` | 200 | 2,382 |
| `/property/NOPE` | 404 | 24,491 (correct) |

**D-01 (found & fixed):** `/auctions` returned **404** — the route slug was `auctions`
while the taxonomy key was `auction`, and the resolver looked up by key. Fixed by
resolving via `categoryBySlug()`; re-tested → **200** with the spec's exact copy
`لا توجد مزادات حالياً` present in the HTML.

**D-02 (found & fixed):** `/admin/login` returned **307** (redirect loop) because route
protection lived in `app/admin/layout.tsx`, which also wrapped the login page. Moved the
guard into the `(dashboard)` route group; re-tested → **200** with the login form rendered,
while `/admin`, `/admin/properties`, `/admin/settings`, `/admin/inquiries`, `/admin/audit`
still return **307 → /admin/login** for anonymous requests.

## 3. Security tests (executed)

| ID | Test | Expected | Actual | Verdict |
|---|---|---|---|---|
| S-01 | Anonymous access to 5 admin routes | redirect to login | all → `307 http://localhost:3000/admin/login` | **PASS** |
| S-02 | Forged JWT — correct signature, non-existent session id | rejected | `307` | **PASS** |
| S-03 | Tampered payload on valid token | rejected | `307` | **PASS** |
| S-04 | Garbage cookie value | rejected | `307` | **PASS** |
| S-05 | Upload endpoint without session | 401 JSON | `{"error":"غير مصرّح."}` | **PASS** |
| S-06 | Owner phone leakage on 6 public pages (`/`, `/sale`, `/rent`, `/search`, 2× property) | absent | `clean` on all 6 | **PASS** |
| S-07 | Owner name leakage on public pages | absent | not found | **PASS** |
| S-08 | Security headers | present | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security` | **PASS** |
| S-09 | Passwords stored as plaintext | none | `password_hash` all `$2…` | **PASS** (DB) |
| S-10 | RLS enabled on every `mp_` table | all | `rls_enabled_all_tables = true` | **PASS** (DB) |
| S-11 | Public projection excludes owner columns | absent | `owner_fields_absent_from_public_view = true` | **PASS** (DB) |

## 4. Database integrity (executed against live PostgreSQL)

| ID | Test | Result |
|---|---|---|
| DB-01 | Unique reference number constraint exists | **PASS** |
| DB-02 | Status check constraint exists | **PASS** |
| DB-03 | Negative prices rejected | **PASS** (0 rows with `price < 0`) |
| DB-04 | **Negative insert test:** invalid status `bogus_status` | **PASS** — database rejected with `23514 … violates check constraint "mp_properties_status_check"` |
| DB-05 | Taxonomy seeded exactly per spec (11 sale / 11 rent / 5 management / 0 auction) | **PASS** |
| DB-06 | Shared-project isolation (`tasks` table of the other app untouched) | **PASS** |
| DB-07 | Media rows persist and relate to properties | **PASS** (11 rows) |

## 5. Internationalisation & SEO

| ID | Test | Result |
|---|---|---|
| I-01 | Root document declares Arabic + RTL | **PASS** — `<html lang="ar" dir="rtl">` |
| I-02 | Per-listing `<title>`, canonical, OG tags | **PASS** — `فلة حديثة التصميم بحي النرجس \| مكتب معاذ الضحيان للعقارات` |
| I-03 | Structured data | **PASS** — `"@type":"RealEstateListing"` emitted |
| I-04 | `robots.txt` blocks admin + api | **PASS** |
| I-05 | Sitemap generated with listings | **PASS** |

## 6. NOT EXECUTED — and why

| Test | Status | Blocker |
|---|---|---|
| Real-browser E2E (Playwright) | **NOT EXECUTED** | browser binary download blocked in sandbox (`Failed to download Chrome for Testing`); no system Chromium available |
| Visual/responsive screenshots | **NOT EXECUTED** | same as above |
| Live login + property CRUD against Supabase | **NOT EXECUTED** | sandbox DNS blocks `*.supabase.co` (`DNS BLOCKED`); all Supabase access in this session was via the connector |
| Media upload to storage | **NOT EXECUTED** end-to-end | same DNS restriction; code path validated by review + magic-byte tests |
| Public URL / HTTPS / domain | **NOT EXECUTED** | Vercel write access denied — see `docs/DEPLOYMENT.md` |
| Core Web Vitals | **NOT EXECUTED** | requires a deployed origin |

**These must be executed after deployment.** They are the remaining work, not completed work.

## 7. Defect register

| ID | Description | Severity | Status |
|---|---|---|---|
| D-01 | `/auctions` 404 — slug/key mismatch | High | **Fixed & retested** |
| D-02 | `/admin/login` redirect loop — guard scope too wide | High | **Fixed & retested** |
| D-03 | High-severity transitive `postcss` CVE via Next 15 | High | **Fixed** (Next 16.4.6), audit clean |
| D-04 | Demo imagery could be mistaken for real listings | Medium | **Mitigated** — `is_demo` flag, public banner, `robots: noindex` on demo listings |
| D-05 | Deployment blocked by read-only Vercel token | Blocker | **Open** — requires user action |
