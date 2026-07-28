# OneStudio OS Document Engine 1.0

Document Engine turns workspace data into immutable document snapshots.

## Scope

- Workspace-scoped templates for contracts, invoices, acts, commercial offers and consents.
- Dotted variables such as `{{company.legal_name}}`, `{{client.name}}`, `{{booking.total}}`.
- Generation from Company Profile, Clients CRM, Booking Core and Catalog Core.
- Immutable generated snapshots with document number, variables and issue date.
- Admin editor, live preview and browser Print / Save PDF.
- RLS policies and guarded RPC generation.

## Route

`/admin/documents`

## Migration

`20260726160000_document_engine.sql`

## Document Templates 1.0

`20260728120000_document_templates_1_0_defaults.sql` completes the default library for existing and future workspaces:

- Contract
- Invoice
- Service act
- Commercial offer
- Privacy consent
