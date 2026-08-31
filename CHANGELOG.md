# @almadar/ui

## 6.0.0

### Major Changes

- **BREAKING — removed `action?: EventKey` from 5 descriptor types.** The member
  was dead: an audit of the full corpus found 0 of 174 descriptor entries setting
  it, and no component ever read it. Emitting an event from a descriptor is, and
  always was, `event` — `action` was a second spelling that never resolved.

  This removal first shipped in `5.166.0`, which was a mistake: a breaking change
  to a public type went out as a MINOR, under a commit message that read
  "regenerate cascade artifacts". `6.0.0` re-cuts it honestly so that consumers
  pinning `^5` do not silently inherit a type removal. If you are on `5.166.0`
  and typecheck cleanly, upgrading to `6.0.0` requires no source change.

### Minor Changes

- 15 descriptor `event?: string` props retyped to `EventKey`. The pattern parser
  tags an array prop `kind: "event-list"` only when its element interface types
  the event field as `EventKey`, and that tag is what makes an authored
  `events { EDIT: X }` rename fold into config literals. Typed `string`, the tag
  was never emitted and renames silently under-applied.
- `StateGraph` / `StateJsonView` keep `event: string` deliberately, now with
  comments explaining why: those props carry displayed player data, not event-bus
  vocabulary, and must never be tagged.

## 1.0.1

### Patch Changes

- Updated dependencies
  - @almadar/patterns@1.0.1
  - @almadar/core@1.0.1
  - @almadar/evaluator@1.0.1
