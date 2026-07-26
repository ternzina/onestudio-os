# OneStudio OS Legal Engine 1.0

## Scope
- workspace-scoped company legal profile;
- UA/EN templates for Public Offer, Privacy, Refund and Cookies;
- draft/published lifecycle;
- immutable version snapshot on publish;
- variable rendering;
- public legal routes;
- browser Print / Save PDF workflow;
- footer links.

## Install
1. Apply `20260726000000_legal_engine.sql` locally and remotely.
2. Run the database tests.
3. Open `/admin/legal` and initialize the workspace.
4. Complete the address and any missing company details.
5. Review each document and publish it.
6. Open `/legal/uk/public-offer` before submitting the URL or PDF to LiqPay.

## Security
Company profiles and drafts are visible only to workspace members. Only owner/admin/manager roles can change or publish. Public users can read published documents only.

## Legal note
The included text is a product-specific operational draft, not a substitute for review by a qualified Ukrainian lawyer, especially before international sales, consumer subscriptions, or custom licensing at scale.
