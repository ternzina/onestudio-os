# Generated Documents 1.0

Generated Documents turns document templates into immutable business records.

## Scope

- Generate a document from an active template.
- Use optional CRM client or booking context.
- Store `draft` or `final` snapshots.
- Keep print/PDF and email send actions on the generated record.
- Record `created`, `sent` and `send_failed` events through `document_events`.

## Notes

- Existing `generated_documents` remain valid.
- Existing records receive a backfilled `created` event if one is missing.
- Payment setup is intentionally outside this layer.
