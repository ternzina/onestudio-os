<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## React Bits integration rule

CRITICAL RULE FOR ONESTUDIO PUCK / REACT BITS:

- Do NOT manually reconstruct React Bits components or blocks from screenshots, captured HTML, minified chunks, visual comparisons, or guessed demo behavior.
- Do NOT recreate individual Hero, Carousel, controls, resize behavior, demo shell, Props panels, or other React Bits features block-by-block when an official registry source exists.
- Do NOT solve React Bits integration by manually fixing 134 components one at a time.

The required source of truth is the OFFICIAL React Bits distribution:

1. Use the official React Bits registry.
2. Use the official React Bits AI SKILL.md / installation instructions.
3. Install official component/block source through the supported shadcn/registry installation flow.
4. Keep the official source code as the component implementation.
5. Connect those official source components to Puck through a generic shared adapter/registry mechanism.
6. Before implementing any missing React Bits feature manually, first prove that it is NOT available from the official registry/source/skill.
7. Docs-site-only chrome must not be mistaken for component source. Only integrate docs/demo tooling when it is actually required by the product.
8. Prefer fixing the generic official-source → Puck pipeline over component-specific patches.

If a proposed task suggests manually reproducing React Bits visuals or behavior, STOP and first check the official registry/source/AI skill.

This rule takes priority over previous experimental React Bits reconstruction approaches in this branch.

## React Bits + Puck Integration Contract

For every task involving React Bits, Puck, the block library, component catalogues,
previews, adapters, Puck fields, or fidelity, load and read the repo-local
`onestudio-reactbits-puck` Skill before changing code. Code changes are forbidden
until that Skill has been read.

- Official React Bits source is the reference implementation.
- Do not replace an official component with a handmade lookalike, create synthetic
  READY components, or guess props, defaults, assets, or behaviour.
- Do not automatically turn all TypeScript props into Puck fields.
- Follow the stages defined by the Skill; physical file presence alone is not READY.
- Commit, push, PR, and deploy require a separate direct user instruction.

## React Bits + Puck Fast Batch / Ship Mode

Before any mass React Bits integration, read the repo-local
`onestudio-reactbits-puck` Skill's **Fast Batch / Ship Mode** policy. The React
Bits + Puck foundation is established: preserve the official-source-first rule,
the universal host contract and profiles, the lifecycle gates, safe editable API
rule, and the fidelity-versus-host distinction. After Control-6, Fast Batch Mode
is the default: process low/medium-risk items in batches of 20–30, record exact
BLOCKED reasons, and continue. A blocked item does not stop a batch.

Do not reopen Foundation Mode, alter the frozen-by-default host/Puck/registry
architecture, create a branch per batch, or start a third deep audit for an
optional item unless the repo Skill's explicit exception criteria are met. Leave
each large batch available for user visual review before starting another long
audit, unless a hard technical blocker requires action.

## React Bits source-diff classification

Byte-for-byte mismatch alone is not `BLOCKED_SOURCE_DIFF`. Classify an existing
official source before deciding whether it can enter the pipeline:

- `NORMALIZATION_ONLY` includes a final newline or blank final line, LF/CRLF,
  trailing whitespace, or another formatting-only difference with no changed
  tokens, imports, props, JSX, assets, dependencies, or runtime behaviour. Do
  not overwrite or auto-format the file; its semantically equivalent local
  source may proceed through direct and Puck validation.
- `MATERIAL_SOURCE_DIFF` includes changed imports, props/types, JSX/content,
  executable logic, assets, callbacks/runtime behaviour, or dependencies. Mark
  it `BLOCKED_SOURCE_DIFF`, do not overwrite it, skip that item, and continue
  the batch.

## Permanent React Bits registry authentication

The main OneStudio worktree's ignored `.env.local` is the permanent registry
authentication source through `REACTBITS_LICENSE_KEY`. Temporary worktrees and
temporary browsers are validation environments, not authentication sources.
Before declaring official registry access unavailable, re-check it from the main
worktree without printing or copying the key.

### Puck interaction QA mode

- Use normal editor mode to verify add, select, duplicate, delete, and layout
  editing.
- Use **Interact with page** to verify scrolling, tabs, dropdowns, accordions,
  inputs, buttons, hover/pointer behaviour, and other native component
  interactions.
- Do not classify a component interaction as broken until it has been checked in
  **Interact with page**. If it works there, it passes interaction QA.
- Selection overlays intercepting clicks in normal editor mode are Puck editing
  behaviour, not a React Bits component defect.
