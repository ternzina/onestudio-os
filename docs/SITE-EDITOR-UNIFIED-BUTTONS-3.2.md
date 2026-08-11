# Site Editor Unified Buttons 3.2

## Outcome

OneStudio now presents an editable call to action as one inspector control instead of unrelated text and URL inputs. The control owns the button label, current destination, common page-section shortcuts, invalid-link feedback and package-original reset. It never owns the public button design.

## Template boundary

- Standard, GLOSS and VELORA keep their existing label and URL persistence paths.
- BEMBI and NOIR actions whose destinations belong to the template expose the same label editor with a read-only destination explanation.
- Universal CTA and media/text blocks use their existing `button_label` and `button_url` fields.
- GLOSS membership and gift cards keep their delimited persistence format while rendering the same action control per card.
- Button color, radius, typography, motion and placement remain template or design-system concerns.

## Link safety

The editor recognizes the common persisted destination contract: a local `#section`, an internal `/path`, or a secure `https://` URL. Unsafe and malformed destinations are visibly rejected. Public Standard, GLOSS, universal-block, BEMBI-universal and VELORA renderers use the same bounded runtime helper and fall back to their established safe destination.

No database migration is required. Existing drafts and published sites keep the same JSON shape and runtime fallbacks.
