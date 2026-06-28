/**
 * @almadar/ui/runtime — perf instrumentation
 *
 * Ring buffer of timing events for the canvas render path, plus mark/measure
 * helpers and a React.Profiler onRender callback. All gated behind
 * `createLogger('almadar:perf:canvas')` so production (LOG_LEVEL >= WARN)
 * skips both `performance.*` calls and the ring write.
 */

import { useSyncExternalStore } from 'react';
import type { ProfilerOnRenderCallback } from 'react';
import { createLogger, isLogLevelEnabled } from '@almadar/logger';

export const PERF_NAMESPACE = 'almadar:perf:canvas';

const log = createLogger(PERF_NAMESPACE);

export interface PerfEntry {
  readonly name: string;
  readonly durationMs: number;
  readonly ts: number;
  // eslint-disable-next-line almadar/no-record-string-unknown, almadar/no-unknown-type -- open-ended perf metadata (durationMs, baseDuration, caller-supplied context); no @almadar/core type covers arbitrary timing breakdown fields
  readonly detail?: Readonly<Record<string, unknown>>;
}

const RING_SIZE = 50;
const ring: PerfEntry[] = [];
let writeIdx = 0;

const subscribers = new Set<() => void>();
let notifyScheduled = false;
let revision = 0;
let cachedSnapshot: readonly PerfEntry[] = [];
let cachedRevision = -1;

function scheduleNotify(): void {
  // Deferred: pushes happen synchronously during render (compose-graph
  // useMemo, buildMockData on the render path). Notifying subscribers
  // synchronously would trigger setState in PerfHUD while the parent
  // ProjectWorkspacePage is still rendering. queueMicrotask hops out of
  // the current task so React can finish the in-flight render first; it
  // also coalesces a burst of pushes into one notify.
  if (notifyScheduled) return;
  notifyScheduled = true;
  queueMicrotask(() => {
    notifyScheduled = false;
    revision++;
    for (const fn of subscribers) fn();
  });
}

function push(entry: PerfEntry): void {
  if (ring.length < RING_SIZE) {
    ring.push(entry);
  } else {
    ring[writeIdx] = entry;
  }
  writeIdx = (writeIdx + 1) % RING_SIZE;
  scheduleNotify();
}

function isEnabled(): boolean {
  return isLogLevelEnabled('DEBUG', PERF_NAMESPACE);
}

function now(): number {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

/**
 * Start a phase. Returns an opaque token; pass to {@link perfEnd}.
 * Returns -1 when the namespace is gated off, so call sites pay only one comparison.
 */
export function perfStart(name: string): number {
  if (!isEnabled()) return -1;
  if (typeof performance !== 'undefined' && typeof performance.mark === 'function') {
    try { performance.mark(`${name}-start`); } catch { /* ignore */ }
  }
  return now();
}

// eslint-disable-next-line almadar/no-record-string-unknown, almadar/no-unknown-type -- open-ended perf metadata; no @almadar/core type covers arbitrary timing breakdown fields
export function perfEnd(name: string, startToken: number, detail?: Record<string, unknown>): void {
  if (startToken < 0 || !isEnabled()) return;
  const endTs = now();
  const durationMs = endTs - startToken;
  if (typeof performance !== 'undefined' && typeof performance.measure === 'function') {
    try {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    } catch { /* ignore */ }
  }
  push({ name, durationMs, ts: endTs, detail });
  log.debug(name, () => ({ durationMs, ...(detail ?? {}) }));
}

/** Synchronous wrapper that times a fn end-to-end. */
// eslint-disable-next-line almadar/no-record-string-unknown, almadar/no-unknown-type -- open-ended perf metadata; no @almadar/core type covers arbitrary timing breakdown fields
export function perfTime<T>(name: string, fn: () => T, detail?: Record<string, unknown>): T {
  const t = perfStart(name);
  try {
    return fn();
  } finally {
    perfEnd(name, t, detail);
  }
}

/**
 * React.Profiler `onRender` callback. Records `actualDuration` per commit.
 * Phase is `"mount" | "update" | "nested-update"`.
 */
export const profilerOnRender: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  _startTime,
  commitTime,
) => {
  if (!isEnabled()) return;
  push({
    name: `profiler:${id}:${phase}`,
    durationMs: actualDuration,
    ts: commitTime,
    detail: { baseDuration },
  });
  log.debug(`profiler:${id}:${phase}`, () => ({ actualDuration, baseDuration }));
};

/** Snapshot in insertion order (oldest first). Stable identity until next push. */
function getPerfSnapshot(): readonly PerfEntry[] {
  if (ring.length < RING_SIZE) return ring.slice();
  return [...ring.slice(writeIdx), ...ring.slice(0, writeIdx)];
}

function getSnapshot(): readonly PerfEntry[] {
  if (cachedRevision !== revision) {
    cachedSnapshot = getPerfSnapshot();
    cachedRevision = revision;
  }
  return cachedSnapshot;
}

function subscribe(fn: () => void): () => void {
  subscribers.add(fn);
  return () => { subscribers.delete(fn); };
}

/** React hook: returns the current ring snapshot, re-renders on push. */
export function usePerfBuffer(): readonly PerfEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function clearPerf(): void {
  ring.length = 0;
  writeIdx = 0;
  scheduleNotify();
}
