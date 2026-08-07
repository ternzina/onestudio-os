# Site Editor Workspace 2.5

UX foundation for the OneStudio OS visual site editor.

## Changes

- The block navigator, preview canvas and inspector now have independent vertical scrolling.
- The workspace uses a viewport-bound three-pane layout rather than growing with the full page.
- Selecting a home-page system section or custom block smoothly centers it in the preview canvas.
- Manual preview scrolling synchronizes the active home-page section/custom block and inspector.
- The compact Global Design System 2.4 sidebar uses the same independent inspector scroll.
- Existing block editing, drag-and-drop, undo/redo, device preview, design controls and publish flow remain in place.

## Scope

No database schema or production migration is required. Premium runtime routing is unchanged.

## Local verification

1. Run `git diff --check`.
2. Run `npm run build`.
3. Open the site editor locally.
4. Verify the left block list, center preview and right inspector scroll independently.
5. Click several blocks in the left navigator and confirm the center canvas scrolls to them.
6. Scroll the center canvas manually and confirm the active block/inspector follows.
7. Verify Global Design System sidebar scrolling still works.
