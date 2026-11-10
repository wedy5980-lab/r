# HANDOVER — التسليم التشغيلي

**Project:** منصة مكتب معاذ الضحيان للعقارات
**Date:** 2026-11-10
**Code:** branch `arena/f10851ee-r` (commit `3f544a2` + documentation)

---

## 1. Completion status (evidence-based)

Statuses are independent. A green row does not imply the rows below it.

| Status | Reached? | Evidence |
|---|---|---|
| `DEVELOPMENT_COMPLETE` | ✅ | production build clean, 0 vulnerabilities, all routes implemented |
| `FUNCTIONALLY_VERIFIED` | ⚠️ **partial** | HTTP-level verification of every route; CRUD/login/media flows **not** exercised against the live database (sandbox DNS) |
| `SECURITY_REVIEWED` | ✅ | 11 executed security tests; see `docs/TEST_REPORT.md` §3 |
| `DEPLOYED_ONLINE` | ❌ | Vercel write access denied (R-01) |
| `PUBLIC_URL_VERIFIED` | ❌ | no deployment exists |
| `CUSTOM_DOMAIN_CONFIGURED` | ❌ | no domain supplied and none may be purchased without approval |
| `BUSINESS_INFORMATION_VERIFIED` | ❌ | phone, WhatsApp, email, address, CR hours are empty by design |
| `COMMERCIAL_LAUNCH_READY` | ❌ | blocked by the three rows above, plus PDPL sign-off |

**Bottom line: this is a complete, tested codebase — not yet a live commercial product.**
Two of the eight gates depend on credentials and information only the office can provide.

---

## 2. Delivered

**Application**
- Public site: home (hero, category cards, featured listings, about, CTA), category pages for
  البيع / الإيجار / إدارة الأملاك / المزادات, advanced search with filters and pagination,
  property detail with gallery (keyboard + swipe + lightbox), contact page with inquiry form,
  about, privacy, terms, custom 404.
- Administration: secure login, overview metrics from real records, property table with
  filters, create/edit forms, media upload and ordering, status changes, archive,
  guarded permanent delete, inquiries inbox with call/WhatsApp actions, office settings,
  read-only audit log.
- Arabic-first RTL, responsive from 360 px up, reduced-motion support, keyboard navigation,
  focus states, skip link.

**Data**
- 9 tables + 1 public projection view, RLS on all, taxonomy seeded exactly per specification
  (البيع 11 نوعًا، الإيجار 11 نوعًا، إدارة الأملاك 5 أنواع، المزادات بلا أنواع).
- 7 demo listings with 11 media rows, all flagged `is_demo`.

**Documentation**
`README.md`, `DECISIONS.md`, `RISKS.md`, `docs/DEPLOYMENT.md`, `docs/SECURITY.md`,
`docs/TEST_REPORT.md`, `docs/DATABASE_SCHEMA.md`, `docs/INTEGRATIONS.md`, this file.

---

## 3. Administrator onboarding

**Login URL:** `/admin/login` (after deployment: `https://<your-domain>/admin/login`)

| Field | Value |
|---|---|
| Email | `admin@muath-realestate.sa` |
| Password | *(delivered separately — it is not stored in this repository)* |
| Role | `super_admin` |

> **Change this password immediately after the first login.** It was generated during setup
> and its hash is the only thing stored in the database.

**Roles:** `viewer` (read) → `editor` (add/edit media) → `manager` (settings, permanent delete,
role management) → `super_admin` (everything).

### Daily tasks
1. **Add a property** → العقارات → «+ إضافة عقار». Required: title, category, status.
   A reference number is generated automatically (`MP-YYYY-NNNN`).
2. **Add photos** → open the property → «رفع ملفات» (max 20 MB each; JPG/PNG/WebP/AVIF/MP4/WebM).
   The first image is the card thumbnail — reorder with the arrows.
3. **Mark as sold/rented** → إدارة الحالة. The listing leaves the public site immediately;
   it is **not** shown as an available offer.
4. **Archive instead of deleting** — reversible. Permanent delete requires typing `DELETE`
   and the `manager` role, and is recorded in the audit log.
5. **Read inquiries** → الاستفسارات. Contact the customer with the call/WhatsApp buttons,
   then set the status so the team knows it was handled.
6. **Office details** → بيانات المكتب. Everything published publicly is edited here.

### Before the commercial launch
- [ ] Replace the vision/password with the office's own account.
- [ ] Delete or replace the 7 demo listings (they carry an «بيانات تجريبية» marker).
- [ ] Fill phone, WhatsApp, email, address, working hours.
- [ ] Upload the official logo and set brand colours if they differ.
- [ ] Review `/privacy` and `/terms` with the office (or a lawyer).
- [ ] Confirm the commercial registration / licence wording with the office — do **not**
  invent identifiers.

---

## 4. Known limitations (stated plainly)

1. **Not deployed.** No public URL exists; see `docs/DEPLOYMENT.md`.
2. **No email/SMS notifications.** Inquiries are stored and shown in the dashboard only.
3. **No interactive map.** Coordinates are stored but no map provider is connected.
4. **No auctions module.** Per specification there are none; the category displays
   «لا توجد مزادات حالياً». The data model already accommodates `auction` rows.
5. **No automated test suite in CI.** Tests in this report were run manually per commit.
6. **Demo imagery is AI-generated illustration**, disclosed in the UI — never present it as
   a real property.
7. **No multi-language switching.** Arabic is the only locale, as specified.

---

## 5. Immediate next actions (in order)

1. **Grant Vercel write access** (or import the repo manually) and deploy.
2. Set `NEXT_PUBLIC_SITE_URL` to the live URL and redeploy.
3. Run the post-deployment checklist in `docs/DEPLOYMENT.md` and record results.
4. Change the admin password; create real staff accounts.
5. Fill the office contact details; replace demo listings with real ones.
6. Confirm backup coverage and perform one restore test.
7. Obtain PDPL / licensing review sign-off, then re-evaluate `COMMERCIAL_LAUNCH_READY`.
