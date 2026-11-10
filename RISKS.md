# RISKS — سجل المخاطر

| ID | Risk | Impact | Likelihood | Mitigation | Owner |
|---|---|---|---|---|---|
| R-01 | **Vercel token is read-only → platform cannot be published** | High (blocks launch) | Certain (observed) | reconnect Vercel with write scope, or import the repo manually at vercel.com/new — see `docs/DEPLOYMENT.md` | user |
| R-02 | Shared Supabase project with another application (`wedy-project-hub`) | Medium | Low | strict `mp_` prefix, no touch of existing tables, verified `tasks` table intact; monitor compute/storage quota | agent |
| R-03 | Demo listings with AI-generated imagery could be read as real | Medium (trust, legal) | Medium | `is_demo` flag, visible banner on the listing page, `robots: noindex` on demo listings, admin warning banner | office |
| R-04 | Office contact details are empty → no public phone/WhatsApp | Medium | Certain until supplied | UI shows neutral placeholders, never invents numbers; fill via dashboard → بيانات المكتب | office |
| R-05 | No email/SMS notification for inquiries → delayed response | Medium | Certain | dashboard badge + direct call/WhatsApp buttons on each inquiry; add a provider when approved | office |
| R-06 | Backup policy on the Supabase plan unverified | High if lost | Unknown | verify in Dashboard → Backups; schedule `pg_dump` off-platform; test a restore | agent + office |
| R-07 | PDPL compliance not signed off | High (legal) | Unknown | privacy policy published, data minimisation, owner data isolated; legal review required before launch | office |
| R-08 | Rate limiting is per-instance (Postgres), not edge-level | Low | Medium | acceptable at launch volume; add Vercel Firewall/WAF if abuse appears | agent |
| R-09 | Real-browser E2E not executed in the build sandbox | Medium | Certain | must run Playwright against the deployed URL; checklist in `docs/TEST_REPORT.md` §6 | agent |
| R-10 | `NEXT_PUBLIC_SITE_URL` left as localhost → wrong canonical/OG URLs | Low | Medium | set it to the production URL and redeploy; checklist item in deployment doc | agent |
| R-11 | Session secret rotation logs out all admins | Low | Low | documented behaviour; rotate deliberately, not casually | agent |
| R-12 | Owner phone exposure if `show_owner_phone` is switched on carelessly | High (privacy) | Low | default off, requires `manager` role, warning text beside the toggle | office |

## Open blockers

- **R-01** is the single blocker preventing the `DEPLOYED_ONLINE` / `PUBLIC_URL_VERIFIED` statuses.
- **R-04** blocks `BUSINESS_INFORMATION_VERIFIED`.
- **R-07** blocks `COMMERCIAL_LAUNCH_READY`.
