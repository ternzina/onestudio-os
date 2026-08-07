# Site Editor Rich Text 2.6.1

Extends Rich Text 2.6 across suitable system-section text fields and column-card descriptions.

## Editor controls
- bold, italic, underline
- unordered and ordered lists
- left, center and right alignment
- links
- text color
- font family: site font, Arial, Georgia, Times New Roman, Verdana, Trebuchet MS, Courier New
- font sizes: 12, 14, 16, 18, 20, 24, 28, 32 px
- visible Clear formatting action

## Covered text areas
- hero introduction
- about text
- membership introduction
- booking text
- gift text
- contact visitor note
- footer note
- custom block body text
- column-card descriptions

Headings, SEO fields, button labels/URLs, phone/email/address and other structural fields remain plain text.

## Compatibility
- Existing plain strings continue to render unchanged.
- Rich text remains versioned JSON encoded inside the existing string fields.
- No database migration is required by this layer.
- Public rendering uses React nodes rather than dangerouslySetInnerHTML.
