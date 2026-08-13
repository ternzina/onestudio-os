# VOW FILMS Premium Demo 1.0

## Purpose

VOW FILMS upgrades the existing wedding-videography demo identity into a universal OneStudio Premium Template Package. The template stays inside the shared creation, editor, preview, publication, custom-block and custom-page architecture instead of introducing a parallel one-off editor.

Template key: `vow-films`  
Demo route: `/demos/vow-films`  
English demo route: `/demos/vow-films/en`  
Currency: EUR  
Locales: RU / EN

## Visual direction

Cinematic wedding editorial with midnight navy, ivory and champagne. The layout uses full-bleed imagery, restrained serif display typography, asymmetric film cards, quiet borders and subtle motion. The same existing `public/images/demos/vow-films.webp` asset is intentionally used as the initial editable placeholder in several crops, so Premium Demo 1.0 does not ship copied third-party wedding imagery or heavy video binaries. Every primary VOW media slot is exposed through the existing template-content media picker and can later be replaced from OneStudio Media Library.

## Native sections

1. `hero` — cinematic cover, brand/navigation, RU/EN switch, two CTAs and showreel cue.
2. `manifesto` — editorial statement.
3. `films` — three featured wedding-film stories.
4. `story` — documentary approach.
5. `experience` — before / during / after experience.
6. `process` — date-to-premiere workflow.
7. `packages` — Light, Story and Cinema collections.
8. `gallery` — latest premieres.
9. `reviews` — demo testimonials with explicit demo disclaimer.
10. `availability` — date enquiry form using the shared `create_public_request` Supabase RPC.
11. `faq` — booking questions.
12. `contact` — cinematic final CTA.
13. `footer` — brand/footer navigation.

Hero and footer are pinned in canonical composition. Other native sections support visibility, reordering and reset through the universal premium editor adapter. Shared OneStudio custom blocks can be inserted before the footer and are rendered by `PublicCustomBlock`.

## Editor integration

VOW FILMS provides its own data schema and adapter, but reuses the shared OneStudio editor primitives and registries. Text, rich text, CTA labels/URLs, package copy/prices, gallery metadata, availability copy, FAQ copy, major images/alt text and section heading typography are exposed to the inspector. Hero, story, film and gallery media use `PremiumTemplateEditorMediaTarget` with `kind: "template-content"`, so Media Library remains the common editing mechanism.

The package source is registered in `lib/public-site/premium-template-package-source.mjs`. Running `npm run generate:premium-templates` regenerates all capability-scoped registries and the manifest catalog. Generated registry files must not be edited manually.

## Custom pages

The seed includes editable custom-page definitions for:

- `/films`
- `/packages`

The VOW custom-page runtime keeps the template visual language while still supporting shared `PublicCustomBlock` blocks for future customer-created pages.

## Checks

Run:

```bash
npm run generate:premium-templates
node --test tests/vow-films-premium-demo-1.0.test.ts
npm test
npm run build
```

The installer also updates the existing premium-package regression test so its canonical key set contains `vow-films`, and removes duplicate standard-demo rendering on `/demos` once the same slug is present in the Premium Collection.

## Local visual review

Start Next.js:

```bash
npm run dev
```

Open:

- `http://localhost:3000/demos/vow-films`
- `http://localhost:3000/demos/vow-films/en`
- `http://localhost:3000/demos/vow-films/films`
- `http://localhost:3000/demos/vow-films/packages`

Check desktop and mobile widths, hero readability, editorial rhythm, film crops, package cards, RU/EN switching, form layout, section ordering in Site Editor and media replacement from Media Library.

## 1.1 visual polish candidates

Premium Demo 1.0 deliberately uses the already-owned VOW placeholder image. A future 1.1 pass can replace it with a dedicated licensed/generated wedding asset set and an optional lightweight showreel poster/video. This does not require changing the package/editor architecture.
