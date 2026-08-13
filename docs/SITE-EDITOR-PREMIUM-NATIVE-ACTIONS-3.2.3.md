# Premium Native Action Appearance 3.2.3

Registered premium templates now use one OneStudio appearance bridge for native buttons.

- Premium adapters keep ownership of button text and destination.
- The premium editor registry decorates every `action` field with the shared Appearance UI.
- Overrides are persisted in `PublicSiteContent.native_action_styles`.
- Public runtimes expose matching `data-premium-action` markers.
- A shared style injector applies only saved overrides for the active template.
- No override means the original template CSS remains untouched.

Covered:
- GLOSS: hero primary and secondary.
- VELORA: header CTA, hero primary, hero secondary, footer CTA.
- NOIR: hero CTA and contact CTA.
- BEMBI remains on the already-tested 3.2.2 bridge.

No database migration is required.
