# OneStudio OS Release Readiness 1.0

Date: 2026-08-02
Branch: release-readiness-1.0

## Validation

- Next.js production build: PASS
- Supabase database tests: PASS
- Test files: 49
- Tests: 1320
- Git working tree before audit changes: clean
- Local and production Supabase migrations: synchronized
- Legacy Sisters Studio references: not found
- Production environment variables: reviewed
- BOOKING_EMAIL_RATE_LIMIT_SECRET: configured in Vercel and documented in .env.example

## Environment defaults

- STUDIO_NAME defaults to OneStudio OS
- STUDIO_ADDRESS may be empty
- STUDIO_TIME_ZONE defaults to Europe/Kyiv

## Known historical note

Migration 20260801046000 has a nonstandard timestamp identifier containing minute 60.
It is already applied both locally and remotely and must not be renamed.
