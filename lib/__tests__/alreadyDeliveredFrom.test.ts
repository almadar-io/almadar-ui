/**
 * Retargeted from `cascadeEcho.test.ts` (deleted with `lib/cascadeEcho.ts` —
 * W5b, docs/Almadar_Runtime_Stateless_Stateful_PLAN.md §5.1 item 10).
 *
 * `stampLocallyDeliveredEchoes`'s job — telling apart "this event was
 * already delivered by THIS client's own local run" from "the server (or a
 * different client) produced it, deliver it" — is now
 * `@almadar/runtime`'s `alreadyDeliveredFrom`, keyed by `(trait, event)`
 * pairs off a `ClientDispatch` instead of a bare event-name multiset off a
 * bus rebroadcast (there is no bus rebroadcast left to key off — see
 * `hooks/circuit/useBusIngress.ts`'s header comment).
 */
import { describe, it, expect } from 'vitest';
import { alreadyDeliveredFrom, type ClientDispatch } from '@almadar/runtime';
import type { OrbitalEventResponse } from '@almadar/core';

function dispatchWith(
  emittedEvents: OrbitalEventResponse['emittedEvents'],
  serverLeg?: ClientDispatch['serverLeg'],
): ClientDispatch {
  const response: OrbitalEventResponse = {
    success: true,
    transitioned: true,
    states: {},
    emittedEvents,
  };
  return { response, serverLeg, mode: 'persistedAwaited', writtenTraits: new Set(), trait: 'Seed', frameKey: 'Seed' };
}

describe('alreadyDeliveredFrom', () => {
  it('keys by (trait, event) — the local run\'s own emitted events are all marked delivered', () => {
    const delivered = alreadyDeliveredFrom(dispatchWith([
      { event: 'POSE_ROTATE', source: { trait: 'Mover' } },
      { event: 'REFRESH', source: { trait: 'Mover' } },
    ]));
    expect(delivered.has('Mover\u0000POSE_ROTATE')).toBe(true);
    expect(delivered.has('Mover\u0000REFRESH')).toBe(true);
  });

  it('a same-named event from a DIFFERENT trait is not marked delivered', () => {
    const delivered = alreadyDeliveredFrom(dispatchWith([
      { event: 'REFRESH', source: { trait: 'Mover' } },
    ]));
    expect(delivered.has('OtherTrait\u0000REFRESH')).toBe(false);
  });

  it('includes the seed dispatch\'s own (targetTrait, event) from the posted server leg', () => {
    const delivered = alreadyDeliveredFrom(dispatchWith(
      [],
      { event: 'SEND', targetTrait: 'Composer', sourceTrait: 'Composer' },
    ));
    expect(delivered.has('Composer\u0000SEND')).toBe(true);
  });

  it('an event with no source trait keys under the empty-string trait, never colliding with a named one', () => {
    const delivered = alreadyDeliveredFrom(dispatchWith([{ event: 'FETCHED' }]));
    expect(delivered.has('\u0000FETCHED')).toBe(true);
    expect(delivered.has('SomeTrait\u0000FETCHED')).toBe(false);
  });

  it('no local emits and no server leg — an empty delivered set', () => {
    const delivered = alreadyDeliveredFrom(dispatchWith([]));
    expect(delivered.size).toBe(0);
  });
});
