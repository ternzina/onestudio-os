# OneStudio OS — Demo Template Contract 1.0

Status: Proposed canonical contract  
Applies to: all new OneStudio demo templates created after Template Catalog 3.4  
Repository: `ternzina/onestudio-os`

## 1. Purpose

A demo template is not a standalone website that is later transplanted into OneStudio.

A demo template MUST be created directly inside the OneStudio template architecture from the beginning.

The contract exists to make every new demo:

- isolated from other demos;
- editable through the shared OneStudio editor;
- renderable in preview and public runtime;
- creatable by a customer where enabled;
- visible in Template Catalog where enabled;
- safe to merge without changing production/domain routing;
- inexpensive for Codex to create because placement rules are predetermined.

## 2. Source branch rule

Every new demo MUST start from the latest stable `main`.

One demo = one branch.

Branch naming:

`feature/demo-<template-key>`

Example:

`feature/demo-ritmo-dance-studio`

A new demo MUST NOT be started from another demo branch.

A new demo MUST NOT copy an older demo as its technical foundation.

Existing demos may be used only as visual or UX references.

## 3. Canonical template identity

Every demo MUST have one unique canonical `templateKey`.

Rules:

- lowercase;
- kebab-case;
- stable after release;
- descriptive enough to avoid collisions.

Example:

`ritmo-dance-studio`

The same key is used consistently for:

- manifest identity;
- demo route;
- asset namespace;
- generated registries;
- tests;
- template-specific bindings.

Preferred demo route:

`/demos/<template-key>`

## 4. One manually maintained registry source

The canonical manually maintained source for universal premium/demo packages remains:

`lib/public-site/premium-template-package-source.mjs`

Generated registries MUST NOT be edited manually.

After changing the source, run:

`npm run generate:premium-templates`

Then verify:

`npm run check:premium-templates`

Generated files are outputs, not sources of truth.

## 5. Required manifest

Every new template package MUST define a manifest containing at least:

- `packageVersion`
- `templateKey`
- `name`
- `description`
- `category`
- `aliases`
- `access`
- `library`
- `preview`
- `persistence`
- `capabilities`
- `nativeSectionIds`
- `assets`

Catalog visibility, tier, order and preview metadata MUST come from this manifest rather than separate hard-coded catalog entries whenever the package system supports it.

## 6. Required bindings

A complete new demo package SHOULD use the existing package binding model.

Required bindings when the corresponding capability is enabled:

### Seed
Creates the initial editable template content.

Pattern:

`lib/public-site/<template>-premium-template-seed.ts`

### Contract
Defines template-native structure/section behavior.

Pattern:

`lib/public-site/<template>-premium-template-contract.ts`

### Editor adapter
Connects the template to the shared OneStudio editor.

Pattern:

`lib/public-site/<template>-premium-template-editor-adapter.ts`

### Public home runtime adapter
Renders the template as the public home page.

Pattern:

`lib/public-site/<template>-premium-template-runtime-adapter.ts`

### Custom page runtime adapter
Renders custom pages where supported.

Pattern:

`lib/public-site/<template>-premium-template-custom-page-runtime-adapter.ts`

A new demo MUST NOT introduce a second editor architecture if the shared adapter/registry system can express the feature.

## 7. Asset isolation contract

This rule is mandatory for all new demos.

Every new demo owns exactly one asset namespace:

`public/templates/<template-key>/`

Example:

`public/templates/ritmo-dance-studio/`

All unique template images, videos, local decorative assets and template-specific icons MUST live inside that namespace.

Example:

```text
public/
  templates/
    ritmo-dance-studio/
      hero.webp
      classes-01.webp
      classes-02.webp
      instructors/
        anna.webp
        mark.webp
```

A new demo MUST NOT copy asset folders from previous demos.

A new demo MUST NOT place its unique images into another template's namespace.

A new demo MUST NOT use generic accumulating directories such as a shared `/images/demos/...` location for new unique template media.

## 8. Shared assets

An asset may be placed in:

`public/templates/shared/`

ONLY when it is genuinely universal and intentionally reused by multiple templates.

Examples:

- generic placeholder;
- universal OneStudio icon;
- shared neutral texture;
- platform-owned common graphic.

A photograph or artwork chosen for one demo is NOT a shared asset merely because another demo could technically use it.

Shared assets must be deliberate, not a dumping ground.

## 9. Asset manifest rule

Every shipped local template asset used by the package MUST be declared in the package manifest `assets` list where the current package model expects asset declaration.

For a new template, asset paths SHOULD begin with:

`/templates/<template-key>/`

The preview image MUST also belong to the template namespace unless it is an intentional platform-shared asset.

## 10. No inherited demo media

When Codex creates a new demo, it MUST NOT:

- duplicate images from BEMBI;
- duplicate images from VELORA;
- duplicate images from GLOSS;
- duplicate images from LUMEA;
- duplicate images from RITMO;
- copy another demo's asset directory;
- leave unused reference images in the new template namespace.

Visual references may be studied, but their files must not be copied unless the product owner explicitly requests reuse.

## 11. Editable content requirement

A demo is not complete merely because it looks correct.

Content that a customer reasonably expects to edit MUST connect to the shared OneStudio editing system.

This includes, where applicable:

- headings;
- body text;
- buttons;
- button labels;
- button appearance through shared controls;
- images/media;
- image sizing/crop/layout through shared controls;
- section order;
- supported block composition;
- links;
- SEO metadata;
- custom pages.

Template-specific hard-coded editing controls SHOULD NOT be added when a shared control already exists.

## 12. Native sections and shared blocks

Template-native sections may preserve a distinctive premium design.

However:

- section IDs MUST be stable and unique within the template;
- they MUST be declared in `nativeSectionIds`;
- editor labels must be understandable;
- reorder behavior must use the shared editor mechanisms where supported;
- media and typography must use shared editing primitives where supported;
- custom blocks must use the common block registry rather than a template-only parallel registry.

A premium template may have a unique visual runtime without having a unique editor architecture.

## 13. Persistence contract

Every new template MUST define persistence compatibility deliberately.

Use:

- `schemaVersion`
- `compatibleSince`
- `contentNamespace`

New templates SHOULD prefer namespaced content where needed to prevent collisions with unrelated template content.

Changing a released template's persisted shape requires compatibility consideration. Do not silently repurpose old keys.

## 14. Customer creation contract

If `capabilities.customerCreatable` is true:

- a customer must be able to create the site from the template;
- seeded content must be complete enough to render immediately;
- the resulting site must open in the normal editor;
- save/cancel/publish behavior must work;
- the site must not depend on hidden demo-only state.

## 15. Template Catalog contract

If a demo is intended to appear in Template Catalog:

- `library.visible` must be true;
- its tier/order must be set in the manifest;
- preview metadata must be complete;
- preview image must resolve;
- catalog text must support RU and EN in the current catalog model;
- the demo route must render.

Do not create a separate hard-coded catalog card when the package manifest already supplies the catalog data.

## 16. Runtime contract

A new demo MUST be validated in all enabled runtime contexts:

1. demo preview route;
2. editor preview;
3. saved draft;
4. published site;
5. customer-created instance when customer creation is enabled;
6. custom pages when custom pages are enabled.

A design that works only on `/demos/...` is not considered integrated.

## 17. Responsive contract

The demo MUST be usable on:

- desktop;
- tablet;
- mobile.

No intentional design element may force horizontal page overflow.

Large premium typography, cinematic media and motion must adapt to viewport size.

## 18. Motion and visual effects

Templates may use advanced motion and premium effects.

Effects MUST:

- preserve usability;
- not block editor interaction;
- respect responsive layouts;
- avoid turning shared editor components into template-specific forks;
- degrade safely if animation is unavailable.

Visual ambition belongs in the template runtime. Core editing behavior belongs in shared OneStudio systems.

## 19. Forbidden implementation shortcuts

For new demos, Codex MUST NOT:

1. start by cloning another demo folder;
2. copy all assets from an older template;
3. create duplicate global editor controls;
4. create a template-only media editor;
5. create a template-only typography editor;
6. create a second catalog registry;
7. manually edit generated premium-template registries;
8. hard-code a demo into production domain routing;
9. change `onestudioos.com` or `bembi.biz` routing as part of normal demo creation;
10. deploy production merely to test a new demo;
11. merge unfinished demo work directly to `main`.

## 20. Creation workflow

Canonical workflow for every future demo:

```text
latest stable main
        ↓
feature/demo-<template-key>
        ↓
define manifest + bindings
        ↓
create isolated asset namespace
        ↓
build seed + template runtime
        ↓
connect shared editor adapters
        ↓
register through package source
        ↓
generate registries
        ↓
run checks/tests/build
        ↓
local/demo verification
        ↓
PR
        ↓
merge to main only after verification
```

## 21. Codex instruction contract

When asking Codex to create a new OneStudio demo, the task MUST state:

> Create this as a new OneStudio demo template directly inside the existing template package architecture. Follow `docs/DEMO-TEMPLATE-CONTRACT-1.0.md`. Start from the current branch created from stable `main`. Do not clone or transplant another demo. Use a dedicated `/public/templates/<template-key>/` asset namespace. Do not copy assets from other demos. Reuse the existing package registry, shared editor, block registry, media controls, typography controls, button controls, preview/publish pipeline and customer-creation mechanisms. Do not change production domains or routing. Generated premium-template registries must be regenerated from the source file, not edited manually.

The visual brief is then appended after this standard instruction.

## 22. Definition of Done

A demo is complete only when all applicable items pass:

- [ ] unique `templateKey`
- [ ] branch created from stable `main`
- [ ] manifest added to canonical source
- [ ] isolated `/public/templates/<template-key>/` assets
- [ ] no copied unused assets from other demos
- [ ] preview image resolves
- [ ] bindings implemented
- [ ] shared editor used
- [ ] text editing works
- [ ] media editing works
- [ ] button editing works
- [ ] section ordering works where supported
- [ ] preview works
- [ ] save/cancel works
- [ ] publish works
- [ ] customer creation works if enabled
- [ ] custom pages work if enabled
- [ ] RU/EN catalog metadata present
- [ ] responsive desktop/tablet/mobile
- [ ] `npm run generate:premium-templates`
- [ ] `npm run check:premium-templates`
- [ ] relevant tests pass
- [ ] `npm run build` passes
- [ ] no production/domain routing changes
- [ ] PR reviewed before merge

## 23. Legacy demos

Existing demos are not required to be reorganized all at once.

Legacy cleanup should be performed separately and safely.

For old demos:

- identify actual asset references first;
- detect duplicates;
- move assets only with reference updates;
- do not delete an image merely because it appears old;
- migrate toward `/public/templates/<template-key>/` gradually;
- verify demo/editor/published runtime after each cleanup.

Do not mix large legacy asset cleanup into routine creation of a new demo unless required.

## 24. Principle

**OneStudio owns the system. Each demo owns only its design, content, template-specific runtime and its own assets.**

New demos extend OneStudio. They do not create another OneStudio beside it.
