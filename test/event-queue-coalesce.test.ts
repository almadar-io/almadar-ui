/**
 * Tick-stamped queue coalescing (R-EVENT-QUEUE-TICK-STREAM-BACKLOG).
 *
 * The actor queue in `useTraitStateMachine` awaits the server fan-out per
 * entry, so a 50ms physics tick enqueues far faster than the queue drains.
 * Tick emissions are latest-state broadcasts: a pending same-(event, trait)
 * tick entry is replaced with the newest payload instead of appending. User
 * events (no tick stamp) and transition-originated machine events are never
 * coalesced — two damage hits must land twice.
 */

import { describe, it, expect } from 'vitest';
import { enqueueEvent, type QueuedEventEntry } from '../lib/event-queue-coalesce';

function drain(queue: QueuedEventEntry[]): QueuedEventEntry[] {
    return queue.splice(0, queue.length);
}

describe('enqueueEvent tick coalescing', () => {
    it('coalesces a same-(event, trait) tick entry in place, keeping its FIFO slot and latest payload', () => {
        const queue: QueuedEventEntry[] = [];
        enqueueEvent(queue, { eventKey: 'OW_MOVED', payload: { x: 1 }, tick: 'gameTick' });
        enqueueEvent(queue, { eventKey: 'OW_RIGHT' }); // user input between the two ticks
        enqueueEvent(queue, { eventKey: 'OW_MOVED', payload: { x: 2 }, tick: 'gameTick' });
        expect(queue).toHaveLength(2);
        // The coalesced entry kept its original slot — the user event was not leapfrogged.
        expect(queue[0]).toMatchObject({ eventKey: 'OW_MOVED', payload: { x: 2 }, tick: 'gameTick' });
        expect(queue[1]).toMatchObject({ eventKey: 'OW_RIGHT' });
    });

    it('caps a tick stream at one pending entry no matter the firing rate (the riya scenario)', () => {
        const queue: QueuedEventEntry[] = [];
        for (let i = 0; i < 100; i++) {
            enqueueEvent(queue, { eventKey: 'OW_MOVED', payload: { x: i }, tick: 'gameTick' });
        }
        expect(queue).toHaveLength(1);
        expect(queue[0].payload).toEqual({ x: 99 });
    });

    it('does not coalesce across different event keys or target traits', () => {
        const queue: QueuedEventEntry[] = [];
        enqueueEvent(queue, { eventKey: 'OW_MOVED', payload: { x: 1 }, tick: 'gameTick' });
        enqueueEvent(queue, { eventKey: 'OW_OTHER', payload: { x: 2 }, tick: 'gameTick' });
        enqueueEvent(queue, { eventKey: 'OW_MOVED', payload: { x: 3 }, targetTrait: 'Hud', tick: 'gameTick' });
        expect(queue).toHaveLength(3);
    });

    it('never displaces a sourceless (user) entry, and a user entry never coalesces onto a tick entry', () => {
        const queue: QueuedEventEntry[] = [];
        enqueueEvent(queue, { eventKey: 'OW_MOVED', payload: { x: 1 }, tick: 'gameTick' });
        enqueueEvent(queue, { eventKey: 'OW_MOVED', payload: { x: 9 } }); // same key, no stamp: user/machine command
        expect(queue).toHaveLength(2);
        expect(drain(queue).map((e) => (e.payload as { x: number }).x)).toEqual([1, 9]);
    });

    it('queues every firing of a transition-originated stream (no stamp → commands land individually)', () => {
        const queue: QueuedEventEntry[] = [];
        enqueueEvent(queue, { eventKey: 'OW_DAMAGE', payload: { amount: 1 } });
        enqueueEvent(queue, { eventKey: 'OW_DAMAGE', payload: { amount: 1 } });
        expect(queue).toHaveLength(2);
    });

    it('resumes normal enqueueing after the pending tick entry drains', () => {
        const queue: QueuedEventEntry[] = [];
        enqueueEvent(queue, { eventKey: 'OW_MOVED', payload: { x: 1 }, tick: 'gameTick' });
        drain(queue);
        enqueueEvent(queue, { eventKey: 'OW_MOVED', payload: { x: 2 }, tick: 'gameTick' });
        enqueueEvent(queue, { eventKey: 'OW_MOVED', payload: { x: 3 }, tick: 'gameTick' });
        expect(queue).toHaveLength(1);
        expect(queue[0].payload).toEqual({ x: 3 });
    });

    it('carries sourceTrait through coalescing (T6 server relay needs the emitter identity)', () => {
        const queue: QueuedEventEntry[] = [];
        enqueueEvent(queue, { eventKey: 'OW_MOVED', payload: { x: 1 }, tick: 'gameTick', sourceTrait: 'RiyaMover' });
        enqueueEvent(queue, { eventKey: 'OW_MOVED', payload: { x: 2 }, tick: 'gameTick', sourceTrait: 'RiyaMover' });
        expect(queue).toHaveLength(1);
        expect(queue[0]).toMatchObject({ sourceTrait: 'RiyaMover', payload: { x: 2 } });
    });
});
