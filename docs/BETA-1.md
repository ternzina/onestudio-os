# OneStudio OS Beta 1

## Sprint 1: Unified Activity Timeline

The booking and client cards now show one chronological activity stream instead of isolated module histories.

Included sources:

- booking creation, edits, status changes and cancellation;
- payment and refund ledger entries;
- generated documents and delivery results;
- scheduled, queued, sent, failed and cancelled notifications;
- canonical client profile events.

The database exposes workspace-protected RPCs:

- `get_admin_booking_timeline(uuid)`
- `get_admin_client_timeline(uuid)`

Both functions enforce the existing workspace authorization boundary and return a stable provider-neutral row contract for the admin UI.
