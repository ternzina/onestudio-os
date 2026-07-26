# Context Navigation 1.2

Bugfix release for URL-driven client and booking context.

- Bookings now re-read `client` and `booking` whenever the URL changes.
- Documents now clear or switch context when query parameters change.
- Payments now use Next.js navigation for clearing client context.
- No database migration is required.
