# Site Editor Block Workflow 2.1.3

Date: 2026-08-05

## Purpose

Remove the duplicate compact `Разделы` navigation from the client editor route and keep the existing full OneStudio admin navigation as the single editor shell.

## Changes

- `/dashboard/site` now redirects to `/admin/site`.
- The selected `business` query parameter is preserved during the redirect.
- The compact black Site Editor header and `Разделы` flyout were removed from the editor page.
- The existing full OneStudio sidebar remains the only navigation.
- The existing sidebar can now be collapsed and restored.
- The collapsed state is remembered in local storage.
- When collapsed on desktop, the admin header and content expand into the freed space.
- Site Editor 2.1 features remain intact:
  - drag-and-drop block ordering;
  - duplicate block;
  - undo and redo;
  - unsaved-change protection;
  - improved button contrast.

## Files

- `app/admin/site/page.tsx`
- `app/dashboard/site/page.tsx`
- `components/admin/AdminSidebar.tsx`

## Database

No database migration is required.
