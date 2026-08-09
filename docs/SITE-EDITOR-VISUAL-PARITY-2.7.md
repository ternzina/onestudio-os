# Site Editor 2.7 — Visual Control Consistency and Runtime Parity

This milestone completes the existing Hero system-section contract and activates canonical visual fields for BEMBI universal blocks without changing storage or SEO architecture.

## Hero

The Standard inspector now exposes the shared system-section controls for content width, top/bottom padding, minimum height, alignment, background, animation/mobile animation, and desktop/tablet/mobile visibility. Standard and GLOSS public Hero variants use the same system-section class, style, content-width, and reveal helpers. Helpers apply layout overrides only when stored, preserving template-owned CSS for sparse legacy drafts. Existing Hero layout, media, buttons, announcement, header, typography, and color controls remain intact.

## Premium universal blocks

Text, media + text, and columns expose the existing width, spacing, height, colors, animation, and mobile-animation fields. Media + text additionally exposes existing position, size, aspect, height, fit, and frame fields. The BEMBI renderer consumes the same visual token helpers used by the control contract. Semantic BEMBI sections, required Hero, header, and footer are unchanged.

## Capability and parity model

`publicSiteCustomBlockVisualCapabilities` explicitly describes Standard/Premium support groups. `visual-tokens.ts` centralizes the touched width, spacing, height, media, fit, and frame semantics. Unsupported Premium kinds return an all-false capability set and receive no controls.

## Deferred

Device-specific custom-block controls, margins, focal points, background images/video, video/calendar Premium universal blocks, semantic-section controls, new block types, animation timelines, parallax, and preview architecture changes remain out of scope.

No database migration is required. Existing canonical `blocks[]`, serialization, ordering, undo/redo, publishing, tenant SEO isolation, and BEMBI semantic design constraints are preserved.

## Validation

Validation commands and their final results are recorded in the implementation report.
