/**
 * TraitFrame — renders the current frame of a referenced trait.
 *
 * Resolves the `@trait.X[.slot]` binding at render time by looking up the
 * referenced trait's last `render-ui` payload from the orbital's
 * `UISlotManager`. Re-renders automatically when that trait transitions
 * via the per-trait subscription channel (`subscribeTrait`).
 *
 * This is the single rendering primitive both runtime paths converge on:
 *
 * - **Interpreted path** — the trait-binding resolver in
 *   `renderer/trait-binding-resolver.ts` walks pattern trees at render
 *   time, substituting `"@trait.X"` string children with this component.
 * - **Compiled path** — the TypeScript shell codegen in
 *   `orbital-shell-typescript/src/backend.rs::pattern_to_jsx_with_data`
 *   emits this component directly into generated JSX wherever a
 *   `@trait.*` string appears in a pattern tree.
 *
 * Embedding is passive: the referenced trait's state machine runs
 * unchanged; TraitFrame is only a read-only lens on its current frame.
 * Event propagation happens over the shared event bus, not through this
 * component.
 *
 * @see docs/Almadar_Std_Gaps.md §3.8 for the full language design.
 */

import React, { useEffect, useState } from "react";
import { useUISlots } from "../../context/UISlotContext";
import type { SlotContent } from "../../hooks/useUISlots";
import { TraitScopeProvider } from "../../providers/TraitScopeProvider";
import { useEntitySchemaOptional } from "../../runtime/EntitySchemaContext";

export interface TraitFrameProps {
  /**
   * Name of the trait whose current frame to embed. Must match a trait
   * declared in the current orbital. Compiler validates that the name
   * exists at build time (see `ORB_BINDING_TRAIT_UNKNOWN`).
   */
  traitName: string;
  /**
   * Rendered when the referenced trait has not (yet) emitted any
   * render-ui. Use a skeleton, spinner, or message. Defaults to `null`
   * (renders nothing), so an unfulfilled reference drops cleanly out of
   * a parent `children:` array.
   */
  fallback?: React.ReactNode;
}

/**
 * Subscribe to a trait's render-output changes and return the current
 * content. Internal hook — callers usually want the `<TraitFrame>`
 * component below, which also renders.
 */
function useTraitContent(traitName: string): SlotContent | null {
  const slotManager = useUISlots();
  // Initial read happens synchronously so first render has the latest
  // content without an extra effect cycle.
  const [content, setContent] = useState<SlotContent | null>(() =>
    slotManager.getTraitContent(traitName),
  );

  useEffect(() => {
    // Re-read on mount in case the trait rendered between initial state
    // computation and effect fire. Also covers remounting after a
    // traitName prop change.
    setContent(slotManager.getTraitContent(traitName));

    const unsubscribe = slotManager.subscribeTrait(traitName, (nextContent) => {
      setContent(nextContent ?? slotManager.getTraitContent(traitName));
    });
    return unsubscribe;
  }, [slotManager, traitName]);

  return content;
}

/**
 * Render the embedded trait's current frame via the registered pattern
 * component for its `SlotContent.pattern` + `props`. Falls back when the
 * referenced trait has no content in the target slot.
 *
 * The import path for pattern rendering matches what `SlotContentRenderer`
 * uses, so both the top-level slot render path and this embedded path go
 * through the same resolver (`getComponentForPattern` + prop handling).
 */
export function TraitFrame({
  traitName,
  fallback = null,
}: TraitFrameProps): React.ReactElement | null {
  const content = useTraitContent(traitName);
  // Look up the embedded trait's owning orbital so we can wrap its
  // rendered subtree in a `<TraitScopeProvider>` scoped to that
  // (orbital, trait) pair. Without this wrap, bare `UI:CLEAR`-style
  // emits from buttons inside the embedded content qualify against
  // whatever scope is at the embedding site (the parent layout's
  // scope), so an atom's button click ends up dispatched as
  // `UI:Orbital.Layout.CLEAR` instead of `UI:Orbital.Atom.CLEAR` —
  // which the atom's state machine never sees, breaking the
  // composition contract.
  const entitySchema = useEntitySchemaOptional();
  const orbital = entitySchema?.orbitalsByTrait.get(traitName);

  if (!content) {
    return <>{fallback}</>;
  }

  // We lean on the existing slot-renderer machinery so children of
  // embedded patterns (including nested `@trait.*` references) go
  // through the same recursive walker. The import is lazy-required
  // below to avoid a module-graph cycle — `TraitFrame` is referenced
  // from the renderer, and importing it up-front would close the loop.
  const SlotContentRenderer = getSlotContentRenderer();

  const rendered = (
    <SlotContentRenderer
      content={content}
      onDismiss={() => {
        // Embedded frames are read-only lenses. Dismissals surface via
        // the host trait's own state-machine transitions (its emits on
        // the shared event bus), not through this component.
      }}
    />
  );

  if (!orbital) {
    return rendered;
  }

  return (
    <TraitScopeProvider orbital={orbital} trait={traitName}>
      {rendered}
    </TraitScopeProvider>
  );
}
TraitFrame.displayName = "TraitFrame";

// Lazy, deferred module resolution to sidestep a circular-import loop:
// `UISlotRenderer.tsx` imports from this file via
// `trait-binding-resolver`, which embeds `<TraitFrame>`. Requiring the
// SlotContentRenderer at module top would close the cycle.
type SlotContentRendererComponent = React.ComponentType<{
  content: SlotContent;
  onDismiss: () => void;
}>;
let _slotContentRenderer: SlotContentRendererComponent | null = null;
function getSlotContentRenderer(): SlotContentRendererComponent {
  if (_slotContentRenderer) return _slotContentRenderer;
  // Runtime require is intentional — breaks the TraitFrame ↔ UISlotRenderer
  // module cycle. `require` here is CommonJS-style resolution inside the
  // bundled output; the function is only invoked after both modules have
  // finished their top-level initialization.
  const mod = require("../organisms/UISlotRenderer") as {
    SlotContentRenderer: SlotContentRendererComponent;
  };
  _slotContentRenderer = mod.SlotContentRenderer;
  return _slotContentRenderer;
}
