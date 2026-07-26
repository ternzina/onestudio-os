# OneStudio OS Document Workflow 1.1

Document Workflow extends Document Engine with delivery and auditable history.

## Included

- generated documents retain client and booking links;
- documents can be sent to the linked CRM client by email;
- Resend delivery ID, recipient, sent time and errors are stored;
- `document_events` keeps append-only delivery history;
- documents remain printable and exportable through the browser PDF dialog;
- RLS keeps all records inside the active workspace.

## Email configuration

The workflow uses the existing environment variables:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

The company profile email is used as Reply-To when valid.
