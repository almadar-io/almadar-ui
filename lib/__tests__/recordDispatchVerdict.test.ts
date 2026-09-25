/**
 * Every client-kernel dispatch records the runtime's own verdict where the
 * verifier reads it (`server:<Orbital>` timeline entry, matched by event).
 * Before this, a dispatch that threw inside its effects — `ui-pirate-board-3d`'s
 * FxDecay BURST self-loop, `(s ?? []).map is not a function` — was only a
 * console line, and the walk credited it because the state "reached" `to`.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import type { OrbitalEventResponse } from '@almadar/core';
import { recordDispatchVerdict } from '../circuitVerificationObserver';
import { clearVerification, getTransitions } from '../verificationRegistry';

function response(overrides: Partial<OrbitalEventResponse>): OrbitalEventResponse {
  return { success: true, transitioned: true, states: {}, emittedEvents: [], ...overrides };
}

function verdictFor(event: string) {
  return [...getTransitions()].reverse().find((t) => t.traitName === 'server:Board' && t.event === event)?.serverResponse;
}

describe('recordDispatchVerdict', () => {
  beforeEach(() => clearVerification());

  it('records a thrown dispatch as a failed verdict carrying the error', () => {
    recordDispatchVerdict('Board', 'BURST', { error: new TypeError('(s ?? []).map is not a function') });
    const verdict = verdictFor('BURST');
    expect(verdict?.success).toBe(false);
    expect(verdict?.error).toContain('(s ?? []).map is not a function');
  });

  it('records a rejected dispatch with the runtime error and transitioned flag', () => {
    recordDispatchVerdict('Board', 'BURST', {
      response: response({ success: false, transitioned: false, error: "Payload validation failed for event 'BURST'" }),
    });
    const verdict = verdictFor('BURST');
    expect(verdict?.success).toBe(false);
    expect(verdict?.transitioned).toBe(false);
    expect(verdict?.error).toContain('Payload validation failed');
  });

  it('control: records a clean dispatch as success with its transitioned flag', () => {
    recordDispatchVerdict('Board', 'MOVE', { response: response({ transitioned: false }) });
    const verdict = verdictFor('MOVE');
    expect(verdict?.success).toBe(true);
    expect(verdict?.transitioned).toBe(false);
    expect(verdict?.error).toBeUndefined();
  });

  it('counts emitted events and client effects from the response', () => {
    recordDispatchVerdict('Board', 'END_TURN', {
      response: response({
        emittedEvents: [{ event: 'AI_TURN', payload: { turn: 1 } }],
        clientEffects: [['render-ui', 'main', { type: 'game-shell' }]],
      }),
    });
    const verdict = verdictFor('END_TURN');
    expect(verdict?.emittedEvents).toEqual(['AI_TURN']);
    expect(verdict?.clientEffects).toBe(1);
  });
});
