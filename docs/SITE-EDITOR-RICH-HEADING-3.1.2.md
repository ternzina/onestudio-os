# Site Editor Rich Heading 3.1.2

Rich Heading 3.1.2 extends the existing shared text editor. It does not introduce a template-specific editing surface.

## Editing contract

- A heading paired with a typography field automatically uses the heading variant of `RichTextEditor`.
- The user can select a letter, word, or phrase and apply a safe color, font family, font size, bold, italic, or underline.
- Whole-heading typography controls remain directly below the field and continue to define the base style.
- Plain-text mode intentionally removes fragment formatting when the value is edited there.

## Public rendering

- `PublicRichHeading` renders validated Rich Text 2.6 nodes as safe inline elements inside the existing semantic `h1`–`h3` elements.
- Fragment sizes are rendered as a scale of the heading's responsive base size, so a fragment that is larger in the editor cannot become smaller in preview or on the published site.
- No raw HTML is stored or rendered, and no `dangerouslySetInnerHTML` path is added.
- Existing untouched headings remain plain strings and preserve their template CSS and motion treatment.
- Standard, GLOSS, BEMBI, NOIR, VELORA, custom blocks, and custom pages share the same fragment renderer.

## Persistence

- Migration `20260812013000_site_editor_rich_heading_3_1_2.sql` preserves valid rich-heading documents through the established draft and publish lifecycle.
- Documents are limited to 16 KB and must have the Rich Text 2.6 prefix and root shape.
- Existing plain-heading length validation remains unchanged.
- System headings, manual block titles, custom-page titles, and nested custom-page block titles are restored only after the existing save validator succeeds.
