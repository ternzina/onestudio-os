# Public Requests 1.0

Public Requests is a separate written-enquiry flow for work that must not reserve a date, time or resource.

- Public route: `/request/[businessSlug]`
- Admin route: `/admin/requests`
- Guarded anonymous RPC with an idempotency key
- Private request table protected by RLS
- Status workflow: new, in progress, answered, closed
- Internal notes never appear in the public response

Public Requests and Public Booking can be enabled side by side. A business may use either or both.
