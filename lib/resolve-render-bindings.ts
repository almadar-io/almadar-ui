'use client';
/**
 * resolve-render-bindings
 *
 * Render-time evaluation of `RenderBindingMarker` prop leaves
 * (`$renderBinding`, `@almadar/core`). The interpreted path's executor
 * carries `@entity`-dependent render-ui leaves into slot content as
 * markers instead of resolving them at flush time; SlotContentRenderer
 * resolves them here against the owning trait's live entity snapshot on
 * every React render — the same model the compiled shell uses (state-based
 * JSX reading `fields?.X` per render).
 *
 * Scoping rule: a subtree carrying its own `_sourceTrait` (multi-source
 * slot stack children, see `aggregateSlot` in useUISlots) is left raw so
 * the child's own SlotContentRenderer resolves it against ITS trait's
 * bindings — the synthetic stack wrapper has no entity of its own.
 * Everything else in one pattern's props belongs to the pattern's source
 * trait and resolves with that trait's context.
 *
 * @packageDocumentation
 */

import React from 'react';
import { interpolateValue, createContextFromBindings } from '@almadar/runtime';
import { isRenderBindingMarker, type EntityRow, type TraitConfig } from '@almadar/core';
import type { SlotProps, SlotPropValue } from '../providers/UISlotContext';

/** Evaluate one marker against the trait's live bindings. */
function resolveMarkerExpression(
  expression: Parameters<typeof interpolateValue>[0],
  entity: EntityRow,
  config: TraitConfig | undefined,
  state: string,
): SlotPropValue {
  const ctx = createContextFromBindings({
    entity,
    payload: {},
    state,
    ...(config !== undefined ? { config } : {}),
  });
  return interpolateValue(expression, ctx) as SlotPropValue;
}

function isPlainObject(value: SlotPropValue): value is { readonly [key: string]: SlotPropValue } {
  if (value === null || value === undefined || typeof value !== 'object') return false;
  if (Array.isArray(value)) return false;
  if (React.isValidElement(value)) return false;
  if (value instanceof Date) return false;
  if (typeof value === 'function') return false;
  return true;
}

// Slot content is replaced only by a flush, so a container's identity is a
// valid cache key for "does this subtree hold any marker". Tick-driven boards
// re-resolve on every entity change (30Hz+); without this the walk pays full
// tree size per render even though only the marker leaves can change.
const markerPresenceCache = new WeakMap<object, boolean>();

function subtreeHasMarker(value: object): boolean {
  const cached = markerPresenceCache.get(value);
  if (cached !== undefined) return cached;
  let found = false;
  const children: readonly SlotPropValue[] = Array.isArray(value)
    ? value
    : Object.values(value as Record<string, SlotPropValue>);
  for (const child of children) {
    if (isRenderBindingMarker(child)) { found = true; break; }
    if (Array.isArray(child) || isPlainObject(child)) {
      if (subtreeHasMarker(child)) { found = true; break; }
    }
  }
  markerPresenceCache.set(value, found);
  return found;
}

function walkValue(
  value: SlotPropValue,
  scopeTrait: string | undefined,
  entity: EntityRow,
  config: TraitConfig | undefined,
  state: string,
): { resolved: SlotPropValue; changed: boolean } {
  if (isRenderBindingMarker(value)) {
    return { resolved: resolveMarkerExpression(value.expression, entity, config, state), changed: true };
  }
  if (Array.isArray(value)) {
    if (!subtreeHasMarker(value)) return { resolved: value as SlotPropValue, changed: false };
    // A marker in array position may evaluate to an array itself (an
    // `array/map` children expression) — splice it flat so consumers keep
    // receiving plain node lists.
    const out: SlotPropValue[] = [];
    let changed = false;
    for (const item of value) {
      const element = item as SlotPropValue;
      const wasMarker = isRenderBindingMarker(element);
      const { resolved, changed: itemChanged } = walkValue(element, scopeTrait, entity, config, state);
      if (wasMarker && Array.isArray(resolved)) {
        out.push(...(resolved as SlotPropValue[]));
        changed = true;
        continue;
      }
      out.push(resolved);
      if (itemChanged) changed = true;
    }
    return changed ? { resolved: out as SlotPropValue, changed: true } : { resolved: value as SlotPropValue, changed: false };
  }
  if (isPlainObject(value)) {
    if (!subtreeHasMarker(value)) return { resolved: value as SlotPropValue, changed: false };
    // Foreign-scoped subtree (multi-source stack child) — its own
    // SlotContentRenderer resolves it against its trait's bindings.
    const sourceTrait = (value as { _sourceTrait?: SlotPropValue })._sourceTrait;
    if (typeof sourceTrait === 'string' && sourceTrait !== scopeTrait) {
      return { resolved: value as SlotPropValue, changed: false };
    }
    const out: Record<string, SlotPropValue> = {};
    let changed = false;
    for (const [key, item] of Object.entries(value)) {
      const { resolved, changed: itemChanged } = walkValue(item as SlotPropValue, scopeTrait, entity, config, state);
      out[key] = resolved;
      if (itemChanged) changed = true;
    }
    return changed ? { resolved: out as SlotPropValue, changed: true } : { resolved: value as SlotPropValue, changed: false };
  }
  return { resolved: value, changed: false };
}

/**
 * Resolve every `RenderBindingMarker` in a pattern's props against the
 * source trait's live bindings. Identity-preserving: with no markers the
 * ORIGINAL `props` reference is returned, so memoized downstream consumers
 * (and Form's normalizedInitialData contract) see a stable identity
 * whenever the entity snapshot did not change.
 */
export function resolveRenderBindingMarkers(
  props: SlotProps,
  scopeTrait: string | undefined,
  entity: EntityRow,
  config: TraitConfig | undefined,
  state: string,
): SlotProps {
  const out: Record<string, SlotPropValue> = {};
  let changed = false;
  for (const [key, value] of Object.entries(props)) {
    const { resolved, changed: propChanged } = walkValue(value, scopeTrait, entity, config, state);
    out[key] = resolved;
    if (propChanged) changed = true;
  }
  return changed ? (out as SlotProps) : props;
}
