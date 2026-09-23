/**
 * useEntityBindingSource — W5b (docs/Almadar_Runtime_Stateless_Stateful_PLAN.md §5.1).
 *
 * The `EntityBindingSource` surface (`RenderBindingMarker` resolution) over
 * `CircuitStore` frames, subscribed via `useSyncExternalStore(store.subscribe,
 * store.getVersion)`. Replaces the old hook's dual-track
 * `bindingSnapshotsRef`/`sharedEntityStore` split entirely: `frames` is
 * already keyed by `IndexedTrait.frameKey` (`$shared::<entity>` for a
 * `[shared]` entity, the trait's own name otherwise — `trait-index.ts`), so
 * a shared entity's traits already read/write the SAME frame with no
 * separate store, and `IndexedTrait.config` already carries the resolved
 * three-layer config merge (plan §5.1 G4) — nothing left to recompute here.
 *
 * @packageDocumentation
 */
import { useMemo, useSyncExternalStore } from 'react';
import type { EntityRow } from '@almadar/core';
import type { CircuitStore, TraitIndex } from '@almadar/runtime';
import type { EntityBindingSource } from '../../providers/EntityBindingContext';

const EMPTY_ENTITY: EntityRow = {};

export function useEntityBindingSource(store: CircuitStore, traitIndex: TraitIndex): EntityBindingSource {
  // Re-render every binding-source consumer on any circuit commit — the
  // store's own `notify()` is global (one version counter for the whole
  // circuit), so this hook subscribes once here rather than per trait; each
  // consumer's own `useSyncExternalStore(source.subscribe(traitName, ...))`
  // call still only repaints when ITS OWN `getEntitySnapshot`/`getState`
  // result actually changed reference.
  useSyncExternalStore(store.subscribe, store.getVersion);

  return useMemo<EntityBindingSource>(() => ({
    getEntitySnapshot: (traitName) => {
      const entry = traitIndex.byName.get(traitName);
      const frameKey = entry?.frameKey ?? traitName;
      return store.frames.get(frameKey) ?? EMPTY_ENTITY;
    },
    getConfig: (traitName) => traitIndex.byName.get(traitName)?.config,
    getState: (traitName) => store.manager.getState(traitName)?.currentState ?? '',
    subscribe: (_traitName, callback) => store.subscribe(callback),
  }), [store, traitIndex]);
}
