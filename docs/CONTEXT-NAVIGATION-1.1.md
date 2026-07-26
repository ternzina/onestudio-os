# Context Navigation 1.1

Extends client context across Bookings and Documents.

## Behaviour

- `/admin/bookings?client=<id>` filters the booking list to the selected client and prefills the new-booking form.
- `/admin/documents?client=<id>` filters generated documents to the selected client while keeping generation controls preselected.
- Both screens show an active client-context banner, a link back to the client card, and a clear-filter action.
- Existing `?booking=<id>` deep links remain supported.
