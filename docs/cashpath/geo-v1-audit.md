# CashPath GEO / AI search v1 — implementation report

Audit date: 2026-10-13. Work is on `codex/cashpath-geo-v1`; no production deployment or Supabase content write was performed.

## Before changes

- `https://cashpath.org/robots.txt`, `/sitemap.xml`, `/`, and all ten selected `/p/...` routes returned HTTP 200 to a regular browser User-Agent and `OAI-SearchBot`. The article HTML was server-rendered, each selected page had one H1, a self-referencing canonical URL, and `robots: index, follow`.
- The live homepage returned `LocalBusiness` JSON-LD despite CashPath being an online referral and education site. Selected guide pages returned only `BreadcrumbList`, with no Article/BlogPosting schema.
- The live robots file points to `https://cashpath.org/sitemap`, which returned 404. `/sitemap.xml` returned 200 and contained the custom-domain sitemap. The current repository `app/robots.ts` already points custom domains to `/sitemap.xml`; this PR leaves that route unchanged.
- Matching responses to a spoofed `OAI-SearchBot` User-Agent verifies that the endpoint serves that request. It does not prove that OpenAI crawler IPs pass Vercel/WAF rules; no Vercel firewall configuration was available for this read-only audit.
- Public pages are loaded through the `get_public_site` Supabase RPC. Markdown under `docs/cashpath/guides/` generates the reviewed guide catalog/seed, but by itself would not replace content already stored in published tenant content. This PR applies the reviewed source at the CashPath public page routes for exactly ten already-published slugs. Existing page visibility, block visibility, and extra persisted blocks remain intact. The database remains untouched; hidden pages, other CashPath pages, and all other tenants are outside the override. A direct read-only RPC from the local environment failed with a network `fetch failed`; published state was checked through the live routes and sitemap instead.

## Ten guide edits

| Public URL | Before | Added / clarified |
| --- | --- | --- |
| [/p/how-to-compare-personal-loan-offers](https://cashpath.org/p/how-to-compare-personal-loan-offers) | Broad comparison advice and a checklist | A side-by-side worksheet with the exact disclosure fields to record, plus affordability link |
| [/p/apr-vs-interest-rate](https://cashpath.org/p/apr-vs-interest-rate) | Defined APR and rate separately | Clarifies when an APR comparison is not like-for-like and links to the complete offer checklist |
| [/p/personal-loan-agreement-checklist](https://cashpath.org/p/personal-loan-agreement-checklist) | Detailed signing checklist | Adds a practical step for saving the reviewed version and resolving inconsistent explanations |
| [/p/how-much-personal-loan-payment-can-i-afford](https://cashpath.org/p/how-much-personal-loan-payment-can-i-afford) | Household budget guidance without cited source links | Separates lender DTI screening from household affordability; adds CFPB DTI source and comparison links |
| [/p/personal-loan-hardship-payment-assistance](https://cashpath.org/p/personal-loan-hardship-payment-assistance) | Detailed hardship questions | Adds a call-record checklist and CFPB general guidance with an explicit product-specific caveat |
| [/p/someone-took-out-personal-loan-in-my-name](https://cashpath.org/p/someone-took-out-personal-loan-in-my-name) | Identity-theft response steps | Adds verified-channel reminders and direct FTC/CFPB recovery sources |
| [/p/personal-loan-payoff-amount-vs-current-balance](https://cashpath.org/p/personal-loan-payoff-amount-vs-current-balance) | Payoff explanation cited CFPB mortgage guidance | Adds dated-quote follow-through and clearly limits the mortgage source to its mortgage context |
| [/p/how-to-stop-automatic-loan-payments-without-canceling-debt](https://cashpath.org/p/how-to-stop-automatic-loan-payments-without-canceling-debt) | Stop-payment steps and a payday-lender-specific source | Repeats the key distinction between blocking a debit and changing the debt; cites Regulation E directly |
| [/p/what-fees-can-personal-loans-include](https://cashpath.org/p/what-fees-can-personal-loans-include) | Fee types and APR context | Adds a consistent net-proceeds / repayment comparison and CFPB fee reference |
| [/p/what-is-apr-on-a-personal-loan](https://cashpath.org/p/what-is-apr-on-a-personal-loan) | APR definition and related topics | Clarifies what APR does not replace and adds direct links to fees and side-by-side comparison guidance |

All changes preserve the non-lender, no-approval-guarantee, provider-terms, commercial-referral, and responsible-borrowing disclosures. No unsupported APRs, payments, statistics, biographies, testimonials, or review dates were introduced. Sources used include CFPB/FTC consumer guidance and CFPB Regulation E.

## Attribution and rollout

- CashPath-only events: existing `cta_click` for “Start Your Request” and `leadsgate_form_ready` once the provider widget adds DOM elements. The observer never reads field values, form text, or provider payloads. The API accepts the new event only for slug `cashpath`.
- `docs/cashpath/geo-v1-anonymous-report.sql` is a read-only 30-day report grouped by entry page, country, referrer/UTM, anonymous session, CTA clicks, and provider-form render. It intentionally does not join to partner leads or payouts. Missing referrers are reported as `unknown`; this is not evidence that a session produced a qualified lead.
- A Supabase migration extends the analytics event constraint. It has not been applied to production. Apply it before enabling the new event in production.
- No source file for `components/public/LeadsGateForm.tsx`, the provider scripts, `aid=4848`, field handling, or submission flow was changed.
- Read-only mobile check at 390 × 844 CSS pixels returned HTTP 200, one H1, no horizontal overflow, visible loan-amount/email/last-four form controls, and no browser page errors. The analytics endpoint and LeadsGate scripts were blocked during this check, and no form was submitted; the live provider continuation/payout path was not exercised.
- GitHub reports the PR's Vercel preview deployments as successful. The main preview URL redirects to Vercel SSO; `vercel curl` and `vercel whoami` could not authenticate in this environment (`Not authorized`), so the PR preview itself could not be visually inspected.
- Rollback: revert this PR/commit. No content restoration is needed because no live page data was written. If the migration has been applied, revert only after confirming there are no `leadsgate_form_ready` rows; dropping an event constraint with existing rows would fail.
- Before production promotion: obtain preview access and review the Vercel deployment at desktop and mobile sizes; confirm migration order and analytics module status; check Vercel/WAF policy against OpenAI’s published OAI-SearchBot source IPs; recheck robots/sitemap and ten rendered article pages; and approve production rollout. Search visibility and referral revenue are not guaranteed.
