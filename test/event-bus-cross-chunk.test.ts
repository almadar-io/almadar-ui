/**
 * EventBus cross-chunk singleton guard.
 *
 * The EventBus is the one channel every trait state machine, ServerBridge
 * re-broadcast, and `<Button action="X">` host emits through. For a
 * `<EventBusProvider>` mounted from one entry point to reach a `useEventBus()`
 * consumer rendered from another, BOTH must reference the SAME React
 * `EventBusContext` object — a single module instance shared across chunks.
 *
 * tsup builds each entry (`.`, `./avl`, `./runtime`, `./hooks`, …) with
 * `splitting: false`, so any chunk that imports `EventBusContext` WITHOUT the
 * `dedupe-event-bus-context` / `dedupe-providers` plugins inlines its OWN
 * `createContext(null)` — a second, unrelated context. A Provider from one
 * chunk then never reaches a consumer from another: cross-chunk emits land on
 * a dead bus and the runtime logs `emit:no-listeners`. This is invisible to a
 * behavioural `emit → on` test, which runs against SOURCE where only one copy
 * of the context exists — the split exists only in the built, chunk-split
 * dist. So this guard asserts the invariant on the build OUTPUT.
 *
 * Real regression this caught (2026-06-12): the `avl` build was missing the
 * dedupe plugins the main build has, so the canvas (FlowCanvas → OrbPreview →
 * ServerBridge, all bundled into `dist/avl`) ran on its own EventBusContext.
 * Entity-list traits emitted `*Loaded` into a bus no host listener was on, so
 * the lists never left `loading` — the canvas showed a perpetual spinner while
 * the Run tab (on `dist/runtime`, correctly deduped) worked.
 *
 * Requires `npm run build` first — it reads `dist/`.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pkg from '../package.json' assert { type: 'json' };

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

// The ESM dist file backing each subpath export.
function distFor(subpath: string): string {
  const entry = (pkg as { exports: Record<string, { import?: string } | string> }).exports[subpath];
  const rel = typeof entry === 'string' ? entry : entry?.import;
  if (!rel) throw new Error(`no import export for "${subpath}"`);
  return resolve(root, rel);
}

// `createContext` for the bus, tolerant of esbuild's `/* @__PURE__ */` marker
// and the numeric suffix tsup appends on collision (`EventBusContext2`).
const DEFINES_CONTEXT = /EventBusContext\d*\s*=\s*(?:\/\*[^*]*\*\/\s*)?(?:React\.)?createContext/;
const IMPORTS_SHARED = /@almadar\/ui\/providers/;

// `./providers` is the single home of EventBusContext; every other
// bus-consuming entry must IMPORT it, never redefine it.
const HOME = './providers';
const BUS_CONSUMERS = ['.', './avl', './runtime', './hooks'];

function read(subpath: string): string {
  const file = distFor(subpath);
  if (!existsSync(file)) {
    throw new Error(`${file} missing — run \`npm run build\` before this test`);
  }
  return readFileSync(file, 'utf8');
}

describe('EventBusContext is a cross-chunk singleton', () => {
  it('is defined exactly once, in the ./providers chunk', () => {
    expect(read(HOME)).toMatch(DEFINES_CONTEXT);
    for (const sub of BUS_CONSUMERS) {
      expect(read(sub), `${sub} must not inline its own EventBusContext`).not.toMatch(DEFINES_CONTEXT);
    }
  });

  it.each(BUS_CONSUMERS)('%s imports the shared @almadar/ui/providers chunk', (sub) => {
    expect(read(sub), `${sub} must import the shared EventBusContext, not redefine it`).toMatch(IMPORTS_SHARED);
  });
});
