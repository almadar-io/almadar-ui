// @vitest-environment jsdom
/**
 * Listen-source bus routing — the std-api-gateway "Create Route" class.
 *
 * Observed 2026-09-23: buttons whose event is consumed ONLY by a `listens{}`
 * subscriber (the emitter trait declares no transition on the event) do
 * nothing. std-api-gateway's RouteCreate is the canonical shape:
 *
 *   RouteCatalog   — renders the toolbar with the create Button
 *                    (action=CREATE). Declares NO CREATE transition.
 *   RouteCreate    — `listens { RouteCatalog CREATE -> CREATE }`; its CREATE
 *                    transition mounts the "New Route" form.
 *
 * The Button click emits `UI:CREATE` from the InlineButtonRender's subtree;
 * the scope-chain fan-out (R-EMBEDDED-EMIT-BUBBLE) lands it on
 * `UI:RouteOrbital.RouteCatalog.CREATE`. That key has exactly ONE meaning in
 * the circuit: RouteCreate's listen SOURCE. `useBusIngress` — the ONE
 * bus→kernel adapter — only subscribed each trait's own TRANSITION events,
 * so a listen-source key reached no subscription, the kernel never saw the
 * event, and the click was a no-op. (Pre-W5b the god hook's `listen:subscribe`
 * block covered exactly this; the W5b adapter dropped it.)
 *
 * The contract pinned here: a bus emit on a declared listen's source key
 * dispatches the LISTENER trait's `triggers` event through the kernel (one
 * settle, payload mapping applied), so the server-fan-out and the client
 * agree on who runs listen arms.
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { OrbitalId, OrbitalSchema, ResolvedTraitBinding } from '@almadar/core';
import { createEmptyResolvedTrait } from '@almadar/core';
import { useTraitStateMachine } from '../hooks/useTraitStateMachine';
import { useEventBus } from '../hooks/useEventBus';
import type { UISlotManager } from '../hooks/useUISlots';

function gatewayOrbitals(): OrbitalSchema['orbitals'] {
  return [{
    name: 'RouteOrbital',
    id: 'orb_routes' as OrbitalId,
    pages: [],
    entity: { name: 'Route', persistence: 'persistent', fields: [{ name: 'id', type: 'string' }] },
    traits: [
      {
        name: 'RouteCatalog',
        scope: 'instance' as const,
        linkedEntity: 'Route',
        stateMachine: {
          states: [{ name: 'browsing', isInitial: true }],
          events: [],
          transitions: [],
        },
      },
      {
        name: 'RouteCreate',
        scope: 'instance' as const,
        linkedEntity: 'Route',
        listens: [{ event: 'CREATE', source: { kind: 'trait', trait: 'RouteCatalog' }, triggers: 'CREATE' }],
        stateMachine: {
          states: [{ name: 'closed', isInitial: true }, { name: 'open' }],
          events: [],
          transitions: [
            { from: 'closed', to: 'open', event: 'CREATE', effects: [['set', '@entity.formOpen', true]] },
          ],
        },
      },
    ],
  }];
}

function binding(
  name: string,
  transitions: ResolvedTraitBinding['trait']['transitions'],
  listens?: ResolvedTraitBinding['trait']['listens'],
): ResolvedTraitBinding {
  const trait = createEmptyResolvedTrait(name, 'schema');
  trait.transitions = transitions;
  if (listens !== undefined) trait.listens = listens;
  return { trait, linkedEntity: 'Route' };
}

function stubSlots(): UISlotManager {
  return {
    slots: {},
    render: vi.fn(() => 'id'),
    clear: vi.fn(),
    clearBySource: vi.fn(),
    clearById: vi.fn(),
    clearAll: vi.fn(),
    subscribe: vi.fn(() => () => undefined),
    hasContent: vi.fn(() => false),
    getContent: vi.fn(() => null),
    getTraitContent: vi.fn(() => null),
    subscribeTrait: vi.fn(() => () => undefined),
    updateTraitContent: vi.fn(() => 'id'),
  };
}

describe('listen-source bus routing — RouteCatalog.CREATE -> RouteCreate', () => {
  it('a click fanned onto the listen-source key opens the form trait', async () => {
    const slots = stubSlots();
    const orbitals = gatewayOrbitals();
    const bindings = [
      binding('RouteCatalog', []),
      binding('RouteCreate', [
        { from: 'closed', to: 'open', event: 'CREATE', effects: [['set', '@entity.formOpen', true]] },
      ], [{ event: 'CREATE', source: { kind: 'trait', trait: 'RouteCatalog' }, triggers: 'CREATE' }]),
    ];

    let bus!: ReturnType<typeof useEventBus>;
    const { result } = renderHook(() => {
      bus = useEventBus();
      return useTraitStateMachine(bindings, slots, { orbitals });
    });

    // The exact key the Button's scope-chain fan-out produces (the button
    // renders inside RouteCatalog's subtree; RouteCatalog declares no CREATE
    // transition of its own).
    await act(async () => {
      bus.emit('UI:RouteOrbital.RouteCatalog.CREATE', {});
    });

    await vi.waitFor(() => {
      expect(result.current.getTraitState('RouteCreate')?.currentState).toBe('open');
    });
    expect(result.current.entityBindingSource.getEntitySnapshot('RouteCreate')['formOpen']).toBe(true);
  });
});
