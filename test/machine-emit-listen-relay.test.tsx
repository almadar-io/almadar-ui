/**
 * Machine emits must reach id-carrying listen relays (2026-09-22, the chat
 * SAVE → DO_CREATE chain dying on the stateful path).
 *
 * Two holes killed the relay chain for a trait's OWN `(emit …)` effects:
 *
 * 1. DELIVERY: a machine emit lands on the BARE `UI:EVENT` key by design
 *    (`createClientEffectHandlers`'s emit), while the listen relay
 *    subscribed only on the QUALIFIED `UI:Orbital.Trait.EVENT` key — a
 *    local machine emit never reached it. The relay now ALSO subscribes on
 *    the bare key, gated by the canonical `buildSourceMatcher`.
 * 2. IDENTITY: the emit source (`EffectExecutor.sourceStamp`) carried no
 *    V4 ids, and `buildSourceMatcher` compares ids ONLY when the listen
 *    source carries one — an id-carrying listen never matched. The stamp
 *    now carries `traitId`/`orbitalId`/`eventId` from the context
 *    (populated from the resolved trait's `id`/`emits` and the orbital's
 *    `id`, preserved by `@almadar/core`'s resolver).
 *
 * A foreign trait's same-named emit must NOT fire the relay (the matcher
 * rejects it on source identity, name OR id).
 */
import React, { useEffect } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { EventBusProvider } from '../providers/EventBusProvider';
import { EntitySchemaProvider } from '../providers/EntitySchemaContext';
import { UISlotProvider, useUISlots } from '../providers/UISlotContext';
import { useTraitStateMachine, type TraitStateMachineResult } from '../hooks/useTraitStateMachine';
import {
  asTraitId,
  asEventId,
  asOrbitalId,
  createEmptyResolvedTrait,
  inferTsType,
  type OrbitalSchema,
  type ResolvedEntity,
  type ResolvedTraitBinding,
} from '@almadar/core';

const ORBITAL = 'ChatOrbital';
const COMPOSER = 'ChatComposer';
const PERSISTOR = 'ChatPersistor';
const ORBITALS_BY_TRAIT: Record<string, string> = { [COMPOSER]: ORBITAL, [PERSISTOR]: ORBITAL };
const ORBITAL_IDS_BY_TRAIT: Record<string, ReturnType<typeof asOrbitalId>> = {
  [COMPOSER]: asOrbitalId('orb_chat'),
  [PERSISTOR]: asOrbitalId('orb_chat'),
};
const SCHEMA: OrbitalSchema = { name: 'chat-app', orbitals: [] };
/** Identity-stable (a fresh `{}` per render would recreate the manager memo
 *  every render → setState loop). */
const TRAIT_CONFIGS = {};

let smRef: TraitStateMachineResult | null = null;

function Probe({ bindings }: { bindings: ResolvedTraitBinding[] }) {
  const uiSlots = useUISlots();
  const sm = useTraitStateMachine(bindings, uiSlots, {
    orbitalsByTrait: ORBITALS_BY_TRAIT,
    orbitalIdsByTrait: ORBITAL_IDS_BY_TRAIT,
    traitConfigsByName: TRAIT_CONFIGS,
  });
  useEffect(() => {
    smRef = sm;
  });
  return null;
}

function makeTraits(options: { withIds: boolean; listenSourceTraitId?: boolean }): ResolvedTraitBinding[] {
  const composer = createEmptyResolvedTrait(COMPOSER, 'inline');
  composer.linkedEntity = 'ChatMessage';
  composer.states = [{ name: 'ready', isInitial: true, isFinal: false }];
  composer.events = [{ key: 'SEND', name: 'Send' }];
  composer.transitions = [
    { from: 'ready', to: 'ready', event: 'SEND', effects: [['emit', 'SAVE', { data: { content: 'hi' } }]] },
  ];

  const persistor = createEmptyResolvedTrait(PERSISTOR, 'inline');
  persistor.linkedEntity = 'ChatMessage';
  persistor.states = [{ name: 'idle', isInitial: true, isFinal: false }];
  persistor.events = [{ key: 'DO_CREATE', name: 'Do create' }];
  persistor.listens = [
    {
      event: 'SAVE',
      triggers: 'DO_CREATE',
      source: {
        kind: 'trait',
        trait: COMPOSER,
        ...(options.listenSourceTraitId ? { traitId: asTraitId('trt_composer') } : {}),
      },
    },
  ];
  persistor.transitions = [
    { from: 'idle', to: 'idle', event: 'DO_CREATE', effects: [['set', '@entity.persisted', true]] },
  ];

  if (options.withIds) {
    composer.id = asTraitId('trt_composer');
    composer.emits = [{ event: 'SAVE', eventId: asEventId('evt_save') }];
  }
  return [{ trait: composer }, { trait: persistor }];
}

function makeEntities(): ResolvedEntity[] {
  return [
    { name: 'ChatMessage', collection: 'chat-messages', fields: [{ name: 'id', type: 'string', tsType: inferTsType('string'), required: true }, { name: 'persisted', type: 'boolean', tsType: inferTsType('boolean'), required: true }], usedByTraits: [], usedByPages: [] },
  ];
}

async function mountAndSend(bindings: ResolvedTraitBinding[]): Promise<void> {
  render(
    <EventBusProvider>
      <EntitySchemaProvider entities={makeEntities()}>
        <UISlotProvider>
          <Probe bindings={bindings} />
        </UISlotProvider>
      </EntitySchemaProvider>
    </EventBusProvider>,
  );
  await act(async () => {
    smRef!.sendEvent('SEND');
    await new Promise((r) => setTimeout(r, 20));
  });
}

describe('machine emit → listen relay (delivery + V4 identity)', () => {
  beforeEach(() => {
    smRef = null;
  });

  it('a name-only listen fires on a machine emit (bare-key delivery via buildSourceMatcher)', async () => {
    await mountAndSend(makeTraits({ withIds: false, listenSourceTraitId: false }));
    expect(smRef!.entityBindingSource.getEntitySnapshot(PERSISTOR).persisted).toBe(true);
  });

  it('an id-carrying listen fires on a machine emit whose source carries the V4 ids', async () => {
    await mountAndSend(makeTraits({ withIds: true, listenSourceTraitId: true }));
    expect(smRef!.entityBindingSource.getEntitySnapshot(PERSISTOR).persisted).toBe(true);
  });

  it('an id-carrying listen does NOT fire when the source lacks the id (no name fallback)', async () => {
    // The matcher compares ids ONLY when the listen source carries one —
    // a name-only stamp never matches a `traitId`-carrying listen.
    await mountAndSend(makeTraits({ withIds: false, listenSourceTraitId: true }));
    expect(smRef!.entityBindingSource.getEntitySnapshot(PERSISTOR).persisted).toBeUndefined();
  });
});
