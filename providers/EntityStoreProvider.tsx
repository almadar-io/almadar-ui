'use client';
/**
 * EntityStoreProvider
 *
 * Reactive entity store for Orbital applications. Holds per-entity-type snapshots.
 * When `advance()` is called (after a persist/set/swap!/atomic response from the server),
 * all `useEntityRef` subscribers for that entity type re-render with fresh data.
 * `useEntityWatch` callbacks fire for side effects (toasts, cross-orbital emits).
 *
 * This is the client-side half of the `ref` operator. The server-side half is the
 * initial DB query and auto-fetch-after-mutation in the generated handler / runtime.
 *
 * @packageDocumentation
 */

import React, { createContext, useContext, useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Module-level store (shared across all hooks in the same React tree)
// ---------------------------------------------------------------------------

interface EntitySnapshot {
  data: unknown[];
  version: number;
}

type StoreListener = () => void;
type WatchCallback = (oldData: unknown[], newData: unknown[]) => void;

const store = new Map<string, EntitySnapshot>();
const storeListeners = new Set<StoreListener>();
const watchCallbacks = new Map<string, Set<WatchCallback>>();

// Monotonically increasing global version for useSyncExternalStore identity
let globalVersion = 0;

function advance(entityType: string, data: unknown[]): void {
  const prev = store.get(entityType);
  const oldData = prev?.data ?? [];
  globalVersion++;
  store.set(entityType, { data, version: (prev?.version ?? 0) + 1 });

  // Notify useSyncExternalStore subscribers (triggers React re-render)
  for (const listener of storeListeners) {
    listener();
  }

  // Fire watch callbacks for this entity type
  const cbs = watchCallbacks.get(entityType);
  if (cbs) {
    for (const cb of cbs) {
      try {
        cb(oldData, data);
      } catch {
        // Watch callbacks are fire-and-forget. Failures don't propagate.
      }
    }
  }
}

function getSnapshot(entityType: string): unknown[] {
  return store.get(entityType)?.data ?? [];
}

function getVersion(entityType: string): number {
  return store.get(entityType)?.version ?? 0;
}

function subscribeToStore(listener: StoreListener): () => void {
  storeListeners.add(listener);
  return () => { storeListeners.delete(listener); };
}

function addWatch(entityType: string, callback: WatchCallback): () => void {
  let cbs = watchCallbacks.get(entityType);
  if (!cbs) {
    cbs = new Set();
    watchCallbacks.set(entityType, cbs);
  }
  cbs.add(callback);
  return () => { cbs.delete(callback); };
}

// ---------------------------------------------------------------------------
// React hooks
// ---------------------------------------------------------------------------

/**
 * Subscribe to an entity type's data reactively.
 * Re-renders only when the data for this specific entity type changes.
 *
 * This is the client-side implementation of the `["ref", "EntityType"]` operator.
 */
export function useEntityRef(entityType: string): unknown[] {
  // Create a stable snapshot selector that only changes when this entity type's version changes
  const versionRef = useRef(0);
  const dataRef = useRef<unknown[]>([]);

  const getSnapshotStable = React.useCallback(() => {
    const currentVersion = getVersion(entityType);
    if (currentVersion !== versionRef.current) {
      versionRef.current = currentVersion;
      dataRef.current = getSnapshot(entityType);
    }
    return dataRef.current;
  }, [entityType]);

  return useSyncExternalStore(subscribeToStore, getSnapshotStable, () => []);
}

/**
 * Register a callback that fires when an entity type's data changes.
 *
 * This is the client-side implementation of the `["watch", "EntityType", effects]` operator.
 * The callback receives (oldData, newData) and should execute side effects (notify, emit, log).
 */
export function useEntityWatch(entityType: string, callback: WatchCallback): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    return addWatch(entityType, (oldData, newData) => {
      callbackRef.current(oldData, newData);
    });
  }, [entityType]);
}

// ---------------------------------------------------------------------------
// Context (for bridge/runtime to call advance)
// ---------------------------------------------------------------------------

export interface EntityStoreContextValue {
  advance: (entityType: string, data: unknown[]) => void;
  getSnapshot: (entityType: string) => unknown[];
}

export const EntityStoreContext = createContext<EntityStoreContextValue>({
  advance,
  getSnapshot,
});

/**
 * Access the entity store's advance function.
 * Used by useOrbitalBridge and OrbPreview to push server response data into the store.
 */
export function useEntityStore(): EntityStoreContextValue {
  return useContext(EntityStoreContext);
}

/**
 * Provider component. Wrap the app or page with this to enable entity reactivity.
 * Already included in OrbitalProvider.
 */
export function EntityStoreProvider({ children }: { children: ReactNode }): React.ReactElement {
  return (
    <EntityStoreContext.Provider value={{ advance, getSnapshot }}>
      {children}
    </EntityStoreContext.Provider>
  );
}
