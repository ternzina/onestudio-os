# Site Editor Premium Native Action Persistence 3.2.7

## Root cause

The shared editor and public runtime use `PublicSiteContent.native_action_styles`, but the database save pipeline predates that top-level field. `save_public_site_draft_v22` reconstructs content from an explicit allow-list and drops the map. Later compatibility wrappers restore their own fields, ending with Rich Heading 3.1.2, but none restores `native_action_styles`. Saving therefore returned and stored a document without the edited Premium native-button appearance. Publish copies the saved draft exactly and was not itself the stripping point.

## Persistence contract

Migration `20260813090000_premium_native_action_persistence_3_2_7.sql` wraps the complete current save entry point and delegates to it unchanged. It then validates and restores one shared `native_action_styles` map for every template that uses the shared Premium native-action API.

Keys must contain exactly three bounded lowercase kebab-case components: `template:section:action`. At most 128 entries are retained. Each value may contain `size` (`small`, `medium`, or `large`) and six-digit hex `background_color` / `text_color`; colors are normalized to lowercase. Invalid keys, entries, and individual properties are ignored without failing the whole draft save.

The submitted editor draft is authoritative. An absent `native_action_styles` field and an explicit empty object both clear all stored shared Premium native-action overrides. The save wrapper never falls back to the previous map. This preserves reset/restore behavior.

BEMBI remains on its existing `template_content` / `native_buttons` persistence path and is not migrated to this map.

## Round-trip guard

The Site Editor compares the requested map with both the save RPC response and the publish RPC response. Empty and absent maps are treated as the same cleared state. If a server strips or changes valid styles, Save or Publish reports an explicit error and keeps the edited draft in the editor instead of reloading reverted values.

The migration must be applied to production Supabase in a later, separately authorized deployment before the production fix becomes active.
