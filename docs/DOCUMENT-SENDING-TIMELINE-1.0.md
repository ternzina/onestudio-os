# Document Sending / Timeline 1.0

Document Sending / Timeline 1.0 makes the existing document delivery ledger visible in the admin UI.

## Scope

- Generated document cards show recent `document_events`.
- Timeline entries include created, sent, send failed and voided events.
- Delivery events keep using the existing `record_document_delivery` RPC.
- Generated Documents 1.0 remains the source of the `created` event backfill and trigger.

## Out of Scope

- Payment setup.
- Legal advice or final contract wording.
- External signing flows.
- Provider-neutral document queue.
