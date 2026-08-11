# VELORA — Premium Template Package 1.0

`velora-event-venue` is the canonical OneStudio premium package for an event venue. The 2026-08 visual revision keeps the Package 1.0 runtime/editor/persistence boundaries and replaces the former document-like presentation with a cinematic, Polish-language sales story.

## Implemented public experience

The home route contains 17 native, reorderable/visible/resettable scenes: cinematic hero, proof, three signature venues, six event formats, keyboard/touch before-and-after transformation, staged space story, Essential/Signature/Iconic packages, included-service mosaic, menu and drinks, decor direction, personal coordinator, explicitly fictional demo stories, accessible gallery/lightbox, five-step process, ten-question FAQ, availability form, and footer. The narrative moves from aspiration and trust through venue choice and concrete scope to the existing availability request.

`/venues` and `/packages` use dedicated editorial heroes and large photographic comparisons rather than tables. Every venue/package CTA returns to home with the existing allow-listed query selection and focuses the relevant form field. Arbitrary custom pages still render their own blocks and are not treated as a built-in route.

## Media and licensing context

Twelve local WebP files under `public/templates/velora/` total approximately 2.5 MB. They were downloaded through Unsplash's image CDN (not hotlinked) from the following Unsplash photo IDs: `1519167758481-83f550bb49b3`, `1507504031003-b417219a0fde`, `1464366400600-7168b8af9bc3`, `1519225421980-715cb0215aed`, `1511795409834-ef04bbd61622`, `1515003197210-e0cd71810b5f`, `1492684223066-81342ee5ff30`, and `1521737711867-e3b97375f902`. Use is subject to the Unsplash License: <https://unsplash.com/license>. No temporary originals are tracked.

All public image slots have an independent URL and alt field in the canonical VELORA inspector. They use the shared OneStudio media picker. Normalization repairs missing/unsafe sources from local defaults and merges partially saved list items without discarding Unicode or unrelated namespaces. `next/image` receives responsive `sizes`; only the hero LCP image is priority-loaded.

## Motion, mobile, and accessibility

Small client boundaries use Motion for cinematic hero/scene reveals while server components retain the page structure. CSS provides depth hover, image crop transitions, ambient gradients, asymmetric collage assembly, horizontal mobile rails, and route-consistent visual transitions. `prefers-reduced-motion` disables movement and transitions; Motion's `useReducedMotion` prevents reveal transforms. There is no scroll hijacking or WebGL.

The 390px composition shortens the hero, changes venue photography to portrait crops, turns format/story/gallery sequences into touch rails, stacks photographic split scenes deliberately, expands controls, and provides an IntersectionObserver-managed fixed availability CTA which hides over the form/footer. Root overflow is never hidden or clipped.

There is one `h1` per route, semantic sections and landmarks, a skip link, visible focus, labelled form controls, `aria-live` status, touch-size controls, and a modal lightbox with focus entry, trap, return, Escape, ArrowLeft/ArrowRight, explicit previous/next controls, body scroll lock, and responsive media. The before/after range is native keyboard and touch input and shows both images when JavaScript is unavailable.

## Editor and runtime contracts

The canonical contract declares the 17 native sections. All meaningful Polish copy, lists, CTA labels, statistics, package/venue attributes, FAQ, image URLs and alt text have individual inspector paths; prose uses the shared rich-text field/runtime. No pipe-delimited or bulk JSON editor is used.

The palette inspector drives runtime CSS variables for background, elevated background, foreground, muted foreground, champagne accent, secondary accent, border, warm light, overlay, and button foreground. Reset restores the package palette. Layout order, visibility, custom blocks/pages, immutable deep media paths, namespace isolation, restore behavior, lazy public runtime, editor/public import boundaries, route SEO/canonical, and `create_public_request` remain unchanged.

## Verification

- `npm ci`: pass, 403 packages, 0 vulnerabilities.
- package generation/check: pass.
- `node --test tests/*.test.ts`: pass, 206 tests.
- `npx tsc --noEmit`: pass.
- `npm run build`: pass on Next.js 16.3.0/Turbopack.
- changed-file ESLint: pass after fixes.
- full `npm run lint`: existing baseline remains (2 errors, 8 warnings) in `app/admin/site/page.tsx`, `tests/universal-premium-contract-1.0-phase3.test.ts`, booking/GLOSS/base files; none is changed by this revision.

Browser verification is blocked in this sandbox. The `agent-browser` executable is absent; Playwright Chromium was attempted as the local fallback but macOS terminated it with `MachPortRendezvousServer ... Permission denied (1100)`. Therefore no route, interaction, console, overflow, visual/editor, or screenshot claim is made here. The dev server itself started successfully at `http://localhost:3000`. No screenshot files are tracked.
