/**
 * Embed-aware slot routing — static analysis pass.
 *
 * Walks every trait's `transitions[].effects` looking for `render-ui`
 * patterns whose tree contains `@trait.<Name>` string literals. Returns
 * the flat set of trait names that are referenced this way by some
 * sibling layout.
 *
 * Used by `<OrbPreview>` to route `applyServerEffects` — when an
 * embedded trait's render-ui effect arrives, the runtime updates that
 * trait's per-trait sidecar (`traitIndexRef`) only and skips the slot
 * write. The sibling layout owns the slot and embeds the trait's frame
 * via `<TraitFrame>`. Mirrors the compiled-path codegen which inlines
 * the atom views as JSX inside the layout's pattern, never having them
 * write a shared slot.
 *
 * The walker is a structural twin of
 * `packages/almadar-runtime/src/resolver/reference-resolver.ts`'s
 * `renameEventsInRenderUiConfig` — same recursive pattern shape, just
 * collecting `@trait.X` substrings instead of renaming events.
 *
 * @packageDocumentation
 */
import type { OrbitalSchema } from '@almadar/core';

/**
 * Bare-trait reference prefix. Author writes `"@trait.FilteredItemBrowse"`
 * inside a `render-ui` pattern child or prop.
 */
const TRAIT_BINDING_PREFIX = '@trait.';

function collectTraitRefsFromValue(value: unknown, into: Set<string>): void {
  if (value === null || value === undefined) return;
  if (typeof value === 'string') {
    if (value.startsWith(TRAIT_BINDING_PREFIX)) {
      const rest = value.slice(TRAIT_BINDING_PREFIX.length);
      // `@trait.X` or `@trait.X.slot` — single-segment is the trait name.
      const dot = rest.indexOf('.');
      const traitName = dot === -1 ? rest : rest.slice(0, dot);
      if (traitName.length > 0) into.add(traitName);
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectTraitRefsFromValue(item, into);
    return;
  }
  if (typeof value === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) {
      collectTraitRefsFromValue(v, into);
    }
  }
}

function collectTraitRefsFromEffects(
  effects: readonly unknown[] | undefined,
  into: Set<string>,
): void {
  if (!effects) return;
  for (const effect of effects) {
    if (!Array.isArray(effect)) continue;
    // `["render-ui", slot, config, ...]` — config is the pattern tree.
    if (effect[0] === 'render-ui' && effect.length >= 3) {
      collectTraitRefsFromValue(effect[2], into);
      continue;
    }
    // Other effects can nest SExprs; walk them too in case authors use
    // (do (render-ui ...) ...) or similar wrappers.
    for (let i = 1; i < effect.length; i++) {
      const arg = effect[i];
      if (Array.isArray(arg)) collectTraitRefsFromEffects([arg], into);
      else collectTraitRefsFromValue(arg, into);
    }
  }
}

/**
 * Build the flat set of trait names that are referenced via `@trait.X`
 * by at least one trait's render-ui in the resolved schema.
 *
 * Safe to call on the resolved (post-inline) schema. Memoize by
 * reference at the call site.
 */
export function collectEmbeddedTraits(schema: OrbitalSchema | undefined | null): ReadonlySet<string> {
  const out = new Set<string>();
  if (!schema?.orbitals) return out;
  for (const orbital of schema.orbitals) {
    if (!orbital || typeof orbital !== 'object') continue;
    const traits = (orbital as { traits?: unknown[] }).traits;
    if (!Array.isArray(traits)) continue;
    for (const trait of traits) {
      if (!trait || typeof trait !== 'object') continue;
      // The runtime's `preprocessSchema` may wrap a resolved trait as
      // `{ ref, _resolved: <full trait> }` for ref-style entries. Read
      // the `_resolved` shape if present, otherwise the trait itself.
      const resolved = (trait as { _resolved?: unknown })._resolved;
      const target = (resolved && typeof resolved === 'object') ? resolved : trait;
      const stateMachine = (target as { stateMachine?: { transitions?: unknown[] } }).stateMachine;
      const transitions = stateMachine?.transitions;
      if (!Array.isArray(transitions)) continue;
      for (const t of transitions) {
        if (!t || typeof t !== 'object') continue;
        const effects = (t as { effects?: unknown[] }).effects;
        collectTraitRefsFromEffects(effects, out);
      }
      // Initial effects (run on trait mount) — same shape.
      const initialEffects = (target as { initialEffects?: unknown[] }).initialEffects;
      collectTraitRefsFromEffects(initialEffects, out);
      // Tick effects.
      const ticks = (target as { ticks?: Array<{ effects?: unknown[] }> }).ticks;
      if (Array.isArray(ticks)) {
        for (const tick of ticks) {
          collectTraitRefsFromEffects(tick?.effects, out);
        }
      }
    }
  }
  return out;
}
