/**
 * Tick send relay (R-CLIENT-TICK-POST-BACKLOG).
 *
 * The client→server leg of the tick doctrine: one fire-and-forget POST per
 * tick firing backlogged the browser's per-origin connection pool behind a
 * never-ending tick stream, so command fetches (keyup STOP) arrived later
 * and later. The relay caps each (orbital, event) lane at one send in flight
 * and coalesces firings during flight newest-wins.
 */

import { describe, it, expect } from 'vitest';
import { createTickSendRelay } from '../lib/tick-send-relay';

interface Snap {
    x: number;
}

interface Deferred {
    resolve: () => void;
    reject: (err: Error) => void;
}

function deferred(): { promise: Promise<void>; control: Deferred } {
    let control: Deferred = { resolve: () => undefined, reject: () => undefined };
    const promise = new Promise<void>((resolve, reject) => {
        control = { resolve, reject };
    });
    return { promise, control };
}

describe('createTickSendRelay', () => {
    it('coalesces firings during flight newest-wins: N sends → 2 underlying, newest payload', async () => {
        const sent: Snap[] = [];
        const first = deferred();
        const relay = createTickSendRelay<Snap>((_key, value) => {
            sent.push(value);
            return first.promise;
        });
        for (let i = 0; i < 5; i++) {
            relay.send('Orb:EV', { x: i });
        }
        expect(sent).toEqual([{ x: 0 }]); // first went out immediately
        first.control.resolve();
        await Promise.resolve();
        await Promise.resolve();
        expect(sent).toEqual([{ x: 0 }, { x: 4 }]); // trailing edge carries the NEWEST
    });

    it('sends every firing when the transport settles faster than the tick rate', async () => {
        const sent: Snap[] = [];
        const relay = createTickSendRelay<Snap>((_key, value) => {
            sent.push(value);
            return Promise.resolve();
        });
        for (let i = 0; i < 3; i++) {
            relay.send('Orb:EV', { x: i });
            await Promise.resolve();
            await Promise.resolve();
        }
        expect(sent).toEqual([{ x: 0 }, { x: 1 }, { x: 2 }]);
    });

    it('keeps lanes independent: one in flight per key', async () => {
        const sent: Array<[string, Snap]> = [];
        const gate = deferred();
        const relay = createTickSendRelay<Snap>((key, value) => {
            sent.push([key, value]);
            return gate.promise;
        });
        relay.send('Orb:A', { x: 1 });
        relay.send('Orb:B', { x: 2 });
        expect(sent).toEqual([['Orb:A', { x: 1 }], ['Orb:B', { x: 2 }]]);
    });

    it('clear() drops the pending snapshot — no trailing send after unmount', async () => {
        const sent: Snap[] = [];
        const gate = deferred();
        const relay = createTickSendRelay<Snap>((_key, value) => {
            sent.push(value);
            return gate.promise;
        });
        relay.send('Orb:EV', { x: 1 });
        relay.send('Orb:EV', { x: 2 });
        relay.clear();
        gate.control.resolve();
        await Promise.resolve();
        await Promise.resolve();
        expect(sent).toEqual([{ x: 1 }]);
    });

    it('a rejected send settles the lane and still flushes the pending newest', async () => {
        const sent: Snap[] = [];
        const gate = deferred();
        let settled = true;
        const relay = createTickSendRelay<Snap>((_key, value) => {
            sent.push(value);
            if (settled) return Promise.resolve();
            return gate.promise;
        });
        settled = false;
        relay.send('Orb:EV', { x: 1 }); // in flight (gate)
        relay.send('Orb:EV', { x: 2 }); // pending
        gate.control.reject(new Error('network down'));
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        expect(sent).toEqual([{ x: 1 }, { x: 2 }]); // lane unwedged, newest flushed
        relay.send('Orb:EV', { x: 3 }); // lane free again
        await Promise.resolve();
        await Promise.resolve();
        expect(sent).toEqual([{ x: 1 }, { x: 2 }, { x: 3 }]);
    });
});
