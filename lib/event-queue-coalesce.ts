/**
 * Event queue coalescing policy (actor-model FIFO in `useTraitStateMachine`).
 *
 * Tick emissions are latest-state broadcasts, not command streams: when a tick
 * fires faster than the queue drains (each entry awaits the server fan-out),
 * only the newest payload of a pending same-(event, trait) tick entry matters —
 * enqueueing every firing grows an unbounded backlog of stale physics broadcasts
 * that starves user input (R-EVENT-QUEUE-TICK-STREAM-BACKLOG). Sourceless
 * (user) events and transition-originated machine events are never coalesced:
 * two OW_DAMAGE hits must land twice.
 *
 * @packageDocumentation
 */

import type { EventPayload } from '@almadar/core';

export interface QueuedEventEntry {
    eventKey: string;
    payload?: EventPayload;
    targetTrait?: string;
    /** Tick name when tick-originated — the coalesceable marker. */
    tick?: string;
    /** Emitting trait of a tick-originated entry — the server relay's BusEventSource.trait (T6). */
    sourceTrait?: string;
}

/**
 * Enqueue an entry, coalescing tick-originated duplicates: a pending entry with
 * the same eventKey + targetTrait that is itself tick-stamped has its payload
 * replaced in place (keeping its FIFO slot, so queued user events are never
 * leapfrogged). Everything else appends.
 */
export function enqueueEvent(queue: QueuedEventEntry[], entry: QueuedEventEntry): void {
    if (entry.tick !== undefined) {
        const pending = queue.find(
            (e) => e.tick !== undefined && e.eventKey === entry.eventKey && e.targetTrait === entry.targetTrait,
        );
        if (pending !== undefined) {
            pending.payload = entry.payload;
            return;
        }
    }
    queue.push(entry);
}
