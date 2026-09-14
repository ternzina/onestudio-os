# CashPath Bulk Corpus — Known dedupe / supersession notes

This archive is a raw snapshot of **all 104 files** currently present in `/Google Drive/CashPath SEO/Ready to Publish` on 2026-09-14. It intentionally includes older approved versions where Drive still keeps both copies. **Do not import blindly.** Build an inventory and choose one canonical/latest winner for each intent before adding to the repo.

## Already published / already in current registry

The current main already contains these 12 guide slugs. Existing pages must win by slug and must not be duplicated:

- `appliance-financing-personal-loan-vs-store-bnpl-rent-to-own`
- `apr-vs-interest-rate`
- `home-ev-charger-installation-financing`
- `how-to-compare-personal-loan-offers`
- `hvac-financing-personal-loan-vs-contractor-heloc`
- `personal-loan-for-car-lease-buyout`
- `personal-loan-for-dental-work`
- `personal-loan-for-insurance-deductible`
- `personal-loan-vs-sba-disaster-loan`
- `solar-panel-financing-personal-loan-vs-solar-loan-lease-ppa`
- `what-fees-can-personal-loans-include`
- `what-is-apr-on-a-personal-loan`

## Exact duplicate slugs found in this 104-file snapshot

- `personal-loan-for-medical-bills`
  - `2026-09-10-personal-loan-for-medical-bills.md`
  - `2026-09-11-personal-loan-for-medical-bills-2026-reporting-update.md`
- `personal-loan-prequalification-vs-preapproval`
  - `2026-09-10-personal-loan-prequalification-vs-preapproval.md`
  - `2026-09-11-personal-loan-prequalification-vs-preapproval.md`
- `personal-loan-request-vs-application-vs-approval`
  - `2026-09-10-personal-loan-request-vs-application-vs-approval-v2.md`
  - `2026-09-10-personal-loan-request-vs-application-vs-approval.md`
- `personal-loan-vs-credit-card-cash-advance`
  - `2026-09-10-personal-loan-vs-credit-card-cash-advance.md`
  - `2026-09-11-personal-loan-vs-credit-card-cash-advance.md`
- `secured-vs-unsecured-personal-loan`
  - `2026-09-10-secured-vs-unsecured-personal-loan.md`
  - `2026-09-11-secured-vs-unsecured-personal-loan.md`

## Known same-intent / supersession families that use different slugs or old article format

Review these manually and retain the latest QA-approved canonical winner rather than publishing both:

- Cosigner vs. Co-Borrower:
  - `2026-09-10-cosigner-vs-co-borrower-on-a-personal-loan.md`
  - `2026-09-11-personal-loan-cosigner-vs-co-borrower.md` (later version)
- Identity theft / loan opened in my name:
  - `2026-09-10-someone-opened-a-loan-in-my-name.md`
  - `2026-09-11-someone-took-out-personal-loan-in-my-name.md` (later version)
- IRS/tax payment plan comparison:
  - `2026-09-10-personal-loan-vs-irs-payment-plan.md`
  - `2026-09-11-personal-loan-to-pay-taxes-vs-irs-payment-plan.md` (later version)
- Personal loan vs. line of credit:
  - `2026-09-10-personal-loan-vs-line-of-credit.md`
  - `2026-09-11-personal-loan-vs-personal-line-of-credit.md` (later version)
- Request vs. application vs. approval:
  - `2026-09-10-personal-loan-request-vs-application-vs-approval.md`
  - `2026-09-10-personal-loan-request-vs-application-vs-approval-v2.md` (treat v2 as candidate winner; verify QA metadata/content before import)

The archive also contains older/newer exact-slug versions for medical bills, prequalification vs preapproval, credit-card cash advance, and secured vs unsecured. Prefer the later QA-approved version unless a Reviewed publication plan explicitly says otherwise.

## Parser note

`CORPUS_MANIFEST.csv` includes a coarse `parser_flags` scan for syntax that the current fail-closed generator may reject. This scan is only a triage aid. The actual project generator is the authority. Do not weaken the parser to make a source pass.
