/**
 * Tick send relay (client→server leg of the tick doctrine, T8).
 *
 * A tick emission is a latest-state broadcast, not a command stream: it is
 * coalesced newest-wins at every hop — client queue (`event-queue-coalesce`),
 * client→server transport (this module), server relay
 * (`OrbitalServerRuntime.queueTickRelay`). Pre-T8 this leg was missing: every
 * tick firing issued one fire-and-forget HTTP POST, and when aggregate RTT ×
 * rate exceeded the browser's per-origin connection pool, command fetches
 * (keyup STOP) queued behind a never-ending tick stream — input lag that grew
 * with play time (R-CLIENT-TICK-POST-BACKLOG).
 *
 * Backpressure by construction: at most one send in flight per key. Firings
 * during flight replace the pending snapshot (newest-wins); on settle the
 * newest pending goes out (trailing edge). Rate self-limits to 1/RTT — a fast
 * server sees every tick, a slow one drops stale intermediates instead of
 * growing a backlog. Commands never pass through here.
 *
 * @packageDocumentation
 */

export interface TickSendRelay<T> {
    /** Dispatch a snapshot; coalesces onto the in-flight key's lane if busy. */
    send: (key: string, value: T) => void;
    /** Drop all pending snapshots (unmount / transport swap). */
    clear: () => void;
}

interface TickSendLane<T> {
    inFlight: boolean;
    pending?: T;
}

export function createTickSendRelay<T>(
    send: (key: string, value: T) => Promise<void>,
): TickSendRelay<T> {
    const lanes = new Map<string, TickSendLane<T>>();

    const flush = (key: string, lane: TickSendLane<T>): void => {
        const next = lane.pending;
        lane.pending = undefined;
        if (next === undefined) {
            lane.inFlight = false;
            return;
        }
        lane.inFlight = true;
        // A rejected send must not wedge the lane: settle and flush on.
        void send(key, next)
            .catch(() => undefined)
            .then(() => flush(key, lane));
    };

    return {
        send(key, value) {
            const lane = lanes.get(key) ?? { inFlight: false };
            lanes.set(key, lane);
            if (lane.inFlight) {
                lane.pending = value;
                return;
            }
            lane.pending = value;
            flush(key, lane);
        },
        clear() {
            for (const lane of lanes.values()) {
                lane.pending = undefined;
            }
        },
    };
}
