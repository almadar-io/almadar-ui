'use client';
/**
 * EntityStoreProvider
 *
 * Normalized reactive entity store for Orbital applications.
 * Stores entities in ID-keyed Maps with ordered ID lists.
 * Provides operation-specific methods (setAll, upsertOne, addOne,
 * updateOne, removeOne) and selector hooks (useEntityRef for
 * collections, useEntityById for single entities).
 *
 * Every mutation creates new Map/array objects (immutable values).
 * Identity (the store key) advances to a new value on each write.
 * Follows the Clojure epochal time model from Almadar_Orb_IO.md.
 *
 * @packageDocumentation
 */

import React, { createContext, useContext, useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NormalizedSnapshot {
  entities: Map<string, Record<string, unknown>>;
  ids: string[];
  version: number;
}

type StoreListener = () => void;
type WatchCallback = (oldData: unknown[], newData: unknown[]) => void;

// ---------------------------------------------------------------------------
// Module-level store (shared across all hooks in the same React tree)
// ---------------------------------------------------------------------------

const store = new Map<string, NormalizedSnapshot>();
const storeListeners = new Set<StoreListener>();
const watchCallbacks = new Map<string, Set<WatchCallback>>();
let globalVersion = 0;

/** Extract a stable string ID from an entity record. */
function extractId(record: unknown): string {
  const r = record as Record<string, unknown>;
  return String(r.id ?? r._id ?? r.key ?? '');
}

/** Materialize an ordered array from a normalized snapshot. */
function materialize(snap: NormalizedSnapshot): unknown[] {
  return snap.ids.map(id => snap.entities.get(id)!);
}

/** Notify all useSyncExternalStore subscribers and fire watch callbacks. */
function notifyListeners(entityType: string, prev: NormalizedSnapshot | undefined): void {
  for (const listener of storeListeners) {
    listener();
  }
  const cbs = watchCallbacks.get(entityType);
  if (cbs) {
    const oldData = prev ? materialize(prev) : [];
    const cur = store.get(entityType);
    const newData = cur ? materialize(cur) : [];
    for (const cb of cbs) {
      try { cb(oldData, newData); } catch { /* fire-and-forget */ }
    }
  }
}

// ---------------------------------------------------------------------------
// Operations (replace advance)
// ---------------------------------------------------------------------------

/** ref / fetch-list: Replace the full collection with fresh data from the server. */
function setAll(entityType: string, records: unknown[]): void {
  const entities = new Map<string, Record<string, unknown>>();
  const ids: string[] = [];
  for (const r of records) {
    const rec = r as Record<string, unknown>;
    const id = extractId(rec);
    if (id) {
      entities.set(id, rec);
      ids.push(id);
    }
  }
  const prev = store.get(entityType);
  globalVersion++;
  store.set(entityType, { entities, ids, version: (prev?.version ?? 0) + 1 });
  notifyListeners(entityType, prev);
}

/** fetch-by-ID / persist update / swap: Upsert one entity without clobbering the list. */
function upsertOne(entityType: string, record: Record<string, unknown>): void {
  const id = extractId(record);
  if (!id) return;
  const prev = store.get(entityType);
  const snapshot: NormalizedSnapshot = prev
    ? { entities: new Map(prev.entities), ids: [...prev.ids], version: prev.version }
    : { entities: new Map(), ids: [], version: 0 };
  snapshot.entities.set(id, record);
  if (!snapshot.ids.includes(id)) snapshot.ids.push(id);
  globalVersion++;
  snapshot.version++;
  store.set(entityType, snapshot);
  notifyListeners(entityType, prev);
}

/** persist create: Add a new entity to the collection. */
function addOne(entityType: string, record: Record<string, unknown>): void {
  upsertOne(entityType, record);
}

/** persist update: Merge partial changes into an existing entity. */
function updateOne(entityType: string, id: string, changes: Partial<Record<string, unknown>>): void {
  const prev = store.get(entityType);
  if (!prev?.entities.has(id)) return;
  const snapshot: NormalizedSnapshot = {
    entities: new Map(prev.entities),
    ids: [...prev.ids],
    version: prev.version,
  };
  snapshot.entities.set(id, { ...snapshot.entities.get(id)!, ...changes });
  globalVersion++;
  snapshot.version++;
  store.set(entityType, snapshot);
  notifyListeners(entityType, prev);
}

/** persist delete: Remove an entity from the collection. */
function removeOne(entityType: string, id: string): void {
  const prev = store.get(entityType);
  if (!prev) return;
  const snapshot: NormalizedSnapshot = {
    entities: new Map(prev.entities),
    ids: prev.ids.filter(i => i !== id),
    version: prev.version,
  };
  snapshot.entities.delete(id);
  globalVersion++;
  snapshot.version++;
  store.set(entityType, snapshot);
  notifyListeners(entityType, prev);
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** Get the full collection as an ordered array (pure read, no subscription). */
function getSnapshot(entityType: string): unknown[] {
  const snap = store.get(entityType);
  if (!snap) return [];
  return materialize(snap);
}

/** Get a single entity by ID (pure read, no subscription). */
function getById(entityType: string, id: string): Record<string, unknown> | null {
  return store.get(entityType)?.entities.get(id) ?? null;
}

/** Get the per-entity-type version for change detection. */
function getVersion(entityType: string): number {
  return store.get(entityType)?.version ?? 0;
}

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

export function subscribeToStore(listener: StoreListener): () => void {
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
 * Subscribe to an entity collection reactively.
 * Returns the full ordered array. Re-renders when the collection changes.
 *
 * Client-side implementation of `["ref", "EntityType"]`.
 */
export function useEntityRef(entityType: string): unknown[] {
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
 * Subscribe to a single entity by ID reactively.
 * Returns the entity record or null. Re-renders when the entity changes.
 *
 * Client-side implementation of `["fetch", "EntityType", { id: ... }]`.
 */
export function useEntityById(entityType: string, id: string | undefined): Record<string, unknown> | null {
  const versionRef = useRef(0);
  const dataRef = useRef<Record<string, unknown> | null>(null);

  const getSnapshotStable = React.useCallback(() => {
    if (!id) return null;
    const currentVersion = getVersion(entityType);
    if (currentVersion !== versionRef.current) {
      versionRef.current = currentVersion;
      dataRef.current = getById(entityType, id);
    }
    return dataRef.current;
  }, [entityType, id]);

  return useSyncExternalStore(subscribeToStore, getSnapshotStable, () => null);
}

/**
 * Register a callback that fires when an entity collection changes.
 * Receives (oldData, newData) for side effects (notify, emit, log).
 *
 * Client-side implementation of `["watch", "EntityType", effects]`.
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
// Context
// ---------------------------------------------------------------------------

export interface EntityStoreContextValue {
  setAll: (entityType: string, records: unknown[]) => void;
  upsertOne: (entityType: string, record: Record<string, unknown>) => void;
  addOne: (entityType: string, record: Record<string, unknown>) => void;
  updateOne: (entityType: string, id: string, changes: Partial<Record<string, unknown>>) => void;
  removeOne: (entityType: string, id: string) => void;
  getSnapshot: (entityType: string) => unknown[];
  getById: (entityType: string, id: string) => Record<string, unknown> | null;
}

const contextValue: EntityStoreContextValue = {
  setAll,
  upsertOne,
  addOne,
  updateOne,
  removeOne,
  getSnapshot,
  getById,
};

export const EntityStoreContext = createContext<EntityStoreContextValue>(contextValue);

/**
 * Access the entity store operations.
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
    <EntityStoreContext.Provider value={contextValue}>
      {children}
    </EntityStoreContext.Provider>
  );
}
