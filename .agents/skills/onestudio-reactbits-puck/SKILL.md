---
name: onestudio-reactbits-puck
description: Official-source-first installation, audit, cataloguing, preview, adaptation, and fidelity work for React Bits Starter/Pro, Marketing Blocks, Application UI, and Puck in OneStudio OS.
---

# OneStudio React Bits + Puck

Use this Skill for every React Bits Starter/Pro, Marketing Blocks, Application UI,
Puck, component-catalogue, preview, adapter, Puck-field, or fidelity task in this
repository. Read [the integration contract](references/integration-contract.md)
before implementation.

## Baseline before mutation

1. Read the root `AGENTS.md` and this Skill completely.
2. Report the current branch, existing working-tree changes relevant to the task,
   and the current pipeline stage for each target item.
3. Inspect `components.json` and only verify the presence of
   `REACTBITS_LICENSE_KEY`; never print its value or another secret.
4. Do not change code during this baseline audit.

## Source of truth

Use evidence in this order:

1. Current official React Bits documentation.
2. Current official React Bits Skill.
3. Official registry item installed through the supported shadcn CLI flow.
4. The installed physical original source file.
5. Official example and official demo props.

Old generated catalogues, adapters, READY statuses, and assumptions are not source
of truth. Do not copy components manually from web pages, invent registry slugs, or
reconstruct a component from screenshots, DOM captures, or minified code.

## Installation

Use only the official `@reactbits-starter` and `@reactbits-pro` registries with the
current shadcn CLI. First prove three controls: one animated component, one Marketing
Block, and one Application UI block. Only then may a bulk installation proceed.

Bulk installation must be sequential, resumable, and safe under HTTP 429. Before
overwriting any existing changed file, inspect its diff and explain the target and
reason. Do not change package files solely to validate this Skill.

### Source diff classification

Byte-for-byte mismatch alone is not `BLOCKED_SOURCE_DIFF`. Classify every
existing local source against the live official registry before deciding whether
it can enter the pipeline:

- `NORMALIZATION_ONLY`: final newline or blank final line, LF/CRLF,
  trailing whitespace, or another formatting-only difference with no changed
  tokens, imports, props, JSX, assets, dependencies, or runtime behaviour.
  This does not block the item. Do not overwrite or auto-format the local
  source; it may be used as semantically equivalent and continue through the
  direct/Puck pipeline.
- `MATERIAL_SOURCE_DIFF`: import, prop/type, JSX/content, executable logic,
  asset, callback/runtime-behaviour, or dependency change. Mark the item
  `BLOCKED_SOURCE_DIFF`; do not overwrite it, skip it, and continue the batch.

## Mandatory lifecycle

Every item moves through these stages in order:

1. `INSTALLED`
2. `DIRECT_RENDER_PASS`
3. `PUCK_RENDER_PASS`
4. `CONTROLS_READY`
5. `FIDELITY_PASS`

Declare `READY` only after all five. A present source file is not READY, and
synthetic READY status is forbidden.

Before an adapter exists, prove the original component in a direct React preview:
appearance, required data/assets, interaction, console state, mount/unmount, and
resize. If it works directly but fails in Puck, repair only the Puck integration
layer. If it fails directly, diagnose installation, dependencies, assets, and
official required props first.

## Integration constraints

Keep official source intact. Thin Puck adapters may provide a technical host,
minimum dimensions, client-only rendering, serializable-data conversion, lifecycle
cleanup, and callback isolation. They must not redesign, replace, imitate, or supply
invented demo content/assets.

Create only explicit, safe Puck fields. Never auto-generate fields for `style`,
uncontracted `className`, `children`, refs, callbacks, ReactNode/render functions,
or non-serializable scene/material/camera/complex-object values. Each item needs an
explicit contract covering original source, safe fields, required and preview defaults,
host, minimum dimensions, client-only status, interactions, assets, and cleanup.

Defaults may come only from official source, example, documentation, or demo props.
If no official value exists, use `UNKNOWN` or `REQUIRED_NO_OFFICIAL_VALUE`; do not
fill a preview by guessing.

Maintain three distinct libraries: Animated Components, Marketing Blocks, and
Application UI. Application UI is not automatically a public landing-page section;
do not collapse the three into a generic “Pro Blocks” category.

## Fidelity and stop conditions

Grant `FIDELITY_PASS` only after comparison with the official example: layout,
typography, colours, assets, element count/position, initial state, interaction,
animation, controls, and responsive behaviour. “Similar” is not fidelity. First
distinguish docs-site wrapper/controls from installed component behaviour.

Stop changes to an item and report `UNKNOWN` if the official registry item, required
props, official demo values, or component-vs-docs boundary is unknown; if a handmade
replacement is required; or if one fix requires an unproven mass change to verified
items.

## Reporting and authority

After each stage report: branch; instructions read; files changed; official sources;
commands; proven and unproven results; `UNKNOWN`; errors; what was not changed; and
commit/push/deploy status. Commit, push, PR, and deploy are prohibited unless the
user separately asks for them.

## Permanent registry authentication

Use the ignored main-worktree `.env.local` and `REACTBITS_LICENSE_KEY` as the
permanent source for official registry access. Temporary worktrees and browsers
are validation environments, not authentication sources. Before reporting registry
access unavailable, re-check from the main worktree without printing or copying the
key.

## Fast Batch / Ship Mode

Read this section before any mass React Bits integration. The OneStudio React Bits
and Puck foundation is built. Do not re-investigate these established shared
boundaries for every batch:

- official React Bits registry flow;
- clean checkout foundation;
- direct render pipeline;
- Puck render pipeline;
- safe editable API rule;
- fidelity-versus-host distinction;
- universal React Bits host contract and its `flow`, `section`, `app-surface`,
  `canvas`, and `aspect-media` profiles;
- official-source-first rule; and
- blocked-item handling.

### Operating modes

`FAST BATCH MODE` is the default after Control-6. Use `FOUNDATION MODE` only for a
proven shared-architecture problem: one that affects several items, Puck Core, or
the ability of the universal host contract to express official source contracts.
Do not enter Foundation Mode merely because one optional component is difficult.

The Fast Batch Mode pipeline is:

```text
registry verify
  → host classify
  → direct render
  → Puck render
  → obvious safe controls
  → short fidelity/interaction check
  → READY or BLOCKED
  → NEXT ITEM
```

For each new item, classify it with the existing universal host contract, prove
direct and Puck rendering, and expose fields only when a serializable official
editable API is obvious and proven. Perform a short visual/interaction check, then
continue with PASS items. Do not add audit loops by default.

Animated scenes whose visual children do not contribute reliable intrinsic flow
height must use provenance-backed `technicalHeight` rather than intrinsic host sizing.

### Batch scope and selection

The default working batch is 20–30 simple, low/medium-risk items. Keep Animated
Components, Marketing Blocks, and Application UI distinct. Do not put a large
number of WebGL, Three.js, Canvas-heavy, browser-global-heavy, or
backend-dependent blocks in the same batch.

Work continues on the current branch unless the user explicitly chooses otherwise.
Do not create `control-9`, `control-12`, `control-15`, or other branch-per-batch
branches automatically. Use a small commit or a logical series of commits per batch
in that current branch when commits are authorized.

### Blocked items and audit limits

**A BLOCKED ITEM DOES NOT BLOCK A BATCH.** If an item has a browser-global issue,
fidelity uncertainty, no official editable API, a complex GPU/WebGL lifecycle, or
an unusual official contract, assign an exact status and reason, record it in the
blocker list, and move to the next item. Valid final outcomes include:

- `READY`
- `BLOCKED_NO_OFFICIAL_EDITABLE_API`
- `BLOCKED_FIDELITY`
- `BLOCKED_BROWSER_RUNTIME`
- `BLOCKED_GPU_RUNTIME`
- `BLOCKED_HOST_CONTRACT_GAP`
- `BLOCKED_REQUIRED_DATA`
- `BLOCKED_OTHER_PROVEN_REASON`

Do not run a deep audit simply to make one non-critical item READY. A deep audit is
allowed only when at least one condition holds:

1. the problem breaks shared architecture or several components;
2. the problem breaks Puck Core;
3. the problem breaks the batch-wide build or typecheck;
4. the user directly requests that component be completed; or
5. the item is critical to the product or release.

After two distinct diagnostics/audits for one item, if it is not a shared
architecture blocker, mark it BLOCKED and move on. A third deep audit requires an
explicit user decision.

### Frozen-by-default architecture

The universal host architecture, block contract, Puck shell, global registry
architecture, and host profiles are frozen by default. Do not change them because
one new item is inconvenient. An architecture change requires proof that the
current host contract cannot express the official source contract, that the problem
repeats across multiple items or breaks a system function, and that a
component-specific solution would create clear architectural debt. Otherwise use
`BLOCKED_HOST_CONTRACT_GAP` and continue the batch.

### Visual review and ship target

After every large batch, leave a working localhost review available for the user.
Do not begin a new multi-hour audit before that visual review unless a hard
technical blocker requires it. User visual feedback takes priority for cosmetic
polish; do not create component-specific cosmetic fixes automatically before review.
Validate `flow` / `content` hosts with intrinsic-width source roots at Desktop,
Tablet, and Mobile before assigning their rendering pass.

The editor is ready for the next product stage when Puck Core and the universal host
contract are stable; the library has a meaningful usable/READY set; safe fields
work; blocked items do not break the library; build/typecheck pass; and the user
visually accepts the editor. It is not necessary to make every React Bits item READY
before product launch.

### Puck interaction QA mode

Verify add, selection, duplication, deletion, and layout editing in Puck's normal
editor mode. Verify scrolling, tabs, dropdowns, accordions, inputs, buttons,
hover/pointer behaviour, and all native component interaction in **Interact with
page** mode. A component must not be classified as interaction-broken before that
mode has been checked; if it works there, interaction QA passes. Selection overlays
intercepting normal editor clicks are expected Puck editing behaviour, not a React
Bits defect.
<!-- Editor preview contract: Day/Night uses one shared source of truth across the Puck canvas and every editor preview surface. Editor/lab preview boundaries must suppress anchor navigation while leaving official href values untouched for public runtime. -->
