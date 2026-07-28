# Document Template Editor 1.0

The existing document template fields are promoted into a safer editing workflow.

## Included

- Saved and unsaved state for the selected template.
- Save and discard actions.
- Browser warning when leaving with unsaved template changes.
- Generation is blocked until the selected template is saved, keeping the preview and immutable snapshot consistent.
- Clickable allow-list of supported template variables.
- Read-only editor controls for workspace roles without template configuration access.

This layer uses the existing `document_templates` table and manager RLS policy. No database migration is required.
