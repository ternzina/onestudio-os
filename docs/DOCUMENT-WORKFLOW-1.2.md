# Document Workflow 1.2

Connects Document Engine to real CRM clients and bookings.

## Features
- Detailed client and booking selectors with record counts.
- Booking list filters automatically when a client is selected.
- Source data can be preselected with `?client=<uuid>` or `?booking=<uuid>`.
- “Create document” entry points in client and booking details.
- Clear empty states when a workspace has no clients or bookings.
- Generated documents continue to persist canonical `client_id` and `booking_id`.
