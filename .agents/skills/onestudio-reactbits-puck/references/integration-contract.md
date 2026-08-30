# React Bits + Puck integration contract

## Architecture

```text
official registry
  → original installed source
  → direct React preview
  → thin Puck adapter
  → Puck preview
  → explicit safe controls
  → fidelity verification
  → READY
```

Each arrow is an evidence boundary. Do not skip an earlier boundary because a file
exists or a prior generated catalogue labels an item READY.

## What each boundary proves

### Official registry → original source

This proves provenance and the supported installation path. The installed original
source remains the implementation; it is not edited merely to fit Puck.

### Original source → direct React preview

This proves the component outside the editor. Confirm its required props, official
defaults, assets, dimensions, animation/interaction, resize behaviour, mount and
unmount, and browser errors. A failure here is an installation/source/dependency/data
question, not an adapter problem.

### Direct React preview → thin Puck adapter

This isolates editor concerns. An adapter may add a technical host, client boundary,
serialized official data, cleanup, or a safe callback boundary. It must not replace
the visual implementation, author alternate content, or mimic the original effect.

### Thin Puck adapter → Puck preview

This proves that the original component survives the iframe/editor lifecycle:
selection, dimensions, resize, cleanup, and native interactions. If direct rendering
passes and Puck rendering fails, diagnose the integration layer rather than changing
the canonical source.

### Puck preview → safe controls

Controls are not inferred from a TypeScript prop list. Use the official component or
demo contract to expose only serializable, meaningful fields with proven defaults,
ranges, options, and bindings. Keep editor layout controls separate from the official
component control group.

### Safe controls → fidelity verification → READY

Compare the local result with the official example at the same initial state. Verify
layout, typography, colours, assets, quantity/placement of elements, behaviour,
animation, interaction, controls, and responsive behaviour. READY means every
pipeline stage has proof, not that a component happens to render.

## Separate concepts

| Concept | Meaning | Does not prove |
| --- | --- | --- |
| Installation | Official registry source is present. | Direct rendering, Puck compatibility, controls, or fidelity. |
| Direct rendering | Original source works in normal React. | Editor lifecycle or Puck controls. |
| Puck rendering | Original source works through its thin adapter. | Official control semantics or visual fidelity. |
| Editor controls | Explicit safe fields are bound to proven behaviour. | That every public prop is safe or official. |
| Fidelity | Local behaviour matches the official example. | That docs-only chrome is component source. |

## Library boundaries

Keep Animated Components, Marketing Blocks, and Application UI distinct in the
catalogue and verification reports. They have different intended contexts and cannot
be automatically substituted for one another.

## Unknowns

Use `UNKNOWN` or `REQUIRED_NO_OFFICIAL_VALUE` rather than guessing. Record the
missing official source/evidence and stop that item until it is available. This is a
successful safety result, not a reason to synthesize a component or status.
