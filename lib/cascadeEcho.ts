/**
 * Shared contract between `ServerBridge.sendEvent` and
 * `useTraitStateMachine`'s self-subscription skip (R-DUAL-EXEC-SERVER-ECHO):
 * a response-cascade echo is stamped `dispatched: true` iff this tab's own
 * effect execution already delivered an event of that name locally on the
 * bare-cascade key — one stamp per local emit, by count, not by name alone
 * (two local `REFRESH`s stamp two echoes; a third is a genuine server-only
 * result and passes through unstamped). The dispatched event's own echo is
 * always dropped: the click-time qualified emit already reached every
 * subscriber.
 *
 * `dispatched` therefore means EXACTLY "locally delivered" — never "the
 * server consumed it". A SERVER-stamped `dispatched: true` (the server's own
 * cascade/fan-out consumed the event for a next hop,
 * `TraitCascade.ts`/`transition-handler.ts`) is cleared here: the local
 * machine never ran that transition, so the self-subscribe must NOT drop
 * the echo — its payload is the only delivery of server-produced render
 * data (fetch results bound as `@payload.data`). Dropping it stranded every
 * server-consumed echo's payload (the chat thread's post-refetch render,
 * 2026-09-22).
 */
import type { BusEventSource } from '@almadar/core';

export interface CascadeEcho {
  event: string;
  source?: BusEventSource;
}

export function stampLocallyDeliveredEchoes<T extends CascadeEcho>(
  dispatchedEvent: string,
  emitted: readonly T[],
  locallyEmitted: readonly string[],
): T[] {
  const remainingLocal = new Map<string, number>();
  for (const name of locallyEmitted) {
    remainingLocal.set(name, (remainingLocal.get(name) ?? 0) + 1);
  }
  const result: T[] = [];
  for (const entry of emitted) {
    if (entry.event === dispatchedEvent) continue;
    const remaining = remainingLocal.get(entry.event) ?? 0;
    if (remaining > 0) {
      remainingLocal.set(entry.event, remaining - 1);
      result.push({ ...entry, source: { ...entry.source, dispatched: true } });
    } else {
      result.push({ ...entry, source: { ...entry.source, dispatched: false } });
    }
  }
  return result;
}
