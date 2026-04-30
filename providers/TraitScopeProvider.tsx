'use client';
/**
 * TraitScopeProvider
 *
 * Wraps a trait's rendered subtree with its owning `{ orbital, trait }`
 * pair. Pure components inside the subtree (Button, Form, etc.) keep
 * calling `useEventBus().emit('UI:X', ...)` exactly as today; the
 * scoped wrapper that `useEventBus` returns inside this provider
 * rewrites bare `UI:X` keys into the qualified
 * `UI:Orbital.Trait.X` form that `useTraitStateMachine` (and the rest
 * of the post-Phase 4 subscriber side) listens on.
 *
 * Producer-side fix for the gap where Button-emitted bare keys never
 * reached the trait state machine in the runtime path. The compiled
 * path's codegen wraps each trait view with the same provider so both
 * paths share the qualification contract.
 *
 * @packageDocumentation
 */

import React, { createContext, useContext, useMemo } from 'react';

export interface TraitScope {
  /** Owning orbital name (e.g. `"ContactOrbital"`). */
  orbital: string;
  /** Trait name within the orbital (e.g. `"ContactBrowse"`). */
  trait: string;
}

const TraitScopeContext = createContext<TraitScope | null>(null);

export interface TraitScopeProviderProps {
  orbital: string;
  trait: string;
  children: React.ReactNode;
}

/**
 * Wrap a trait's rendered subtree to qualify bare `UI:*` emits with the
 * trait's scope. Mount this at the slot-content boundary in runtime
 * mode (UISlotRenderer) and at each generated trait view's outermost
 * element in compiled mode (orbital-shell-typescript codegen).
 */
export function TraitScopeProvider({
  orbital,
  trait,
  children,
}: TraitScopeProviderProps): React.ReactElement {
  const value = useMemo<TraitScope>(() => ({ orbital, trait }), [orbital, trait]);
  return (
    <TraitScopeContext.Provider value={value}>
      {children}
    </TraitScopeContext.Provider>
  );
}

/**
 * Read the current trait scope. Returns `null` when called outside
 * any `TraitScopeProvider` (e.g. Storybook, design-system catalog).
 */
export function useTraitScope(): TraitScope | null {
  return useContext(TraitScopeContext);
}

export default TraitScopeProvider;
