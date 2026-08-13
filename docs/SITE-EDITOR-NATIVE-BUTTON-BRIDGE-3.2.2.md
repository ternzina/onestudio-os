# Site Editor Native Button Bridge 3.2.2

Native template buttons can now use the same OneStudio action editor as universal blocks.

## Contract

- Text remains owned by the template's existing content field.
- A native button may optionally persist a link override plus `small`, `medium` or `large` size, background color and text color.
- No override means the template keeps its exact original CSS and destination.
- The public runtime applies only fields the user explicitly changed.
- Universal blocks continue to use `PublicSiteCustomBlock` button fields and the same shared button appearance helpers.

## BEMBI bridge

BEMBI hero primary/secondary actions and the final CTA now expose text, link, size, background and text color through `SiteEditorActionField`. Their native design remains the fallback until an override is saved.

No database migration is required because the native button map is optional JSON inside the existing premium block props.
