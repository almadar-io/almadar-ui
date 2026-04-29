/**
 * Verification Registry - Tracks runtime verification checks and transition traces
 *
 * Provides:
 * 1. A checklist of pass/fail checks (INIT has fetch, bridge connected, etc.)
 * 2. A full transition timeline with effect execution results
 * 3. ServerBridge health snapshot
 * 4. window.__orbitalVerification for Playwright/automation
 *
 * @packageDocumentation
 */

import { createLogger } from './logger';
import type {
  AssetLoadStatus,
  BridgeHealth,
  BusEvent,
  CheckStatus,
  EffectTrace,
  EventLogEntry,
  EventPayload,
  OrbitalVerificationAPI,
  ServerResponseTrace,
  TraitStateSnapshot,
  TransitionTrace,
  VerificationCheck,
  VerificationSnapshot,
  VerificationSummary,
} from '@almadar/core';

const log = createLogger('almadar:bridge');

// Re-export the wire types so existing `@almadar/ui/lib` consumers
// (generated trait hooks, storybook fixtures) keep working without
// flipping their imports. New code should import straight from
// `@almadar/core`.
export type {
  AssetLoadStatus,
  BridgeHealth,
  CheckStatus,
  EffectTrace,
  EventLogEntry,
  OrbitalVerificationAPI,
  ServerResponseTrace,
  TraitStateSnapshot,
  TransitionTrace,
  VerificationCheck,
  VerificationSnapshot,
  VerificationSummary,
};

// ============================================================================
// State — stored on window to survive duplicate module instances (Vite dev)
// ============================================================================

const MAX_TRANSITIONS = 500;

type ChangeListener = () => void;

/**
 * Per-trait snapshot getter. Each generated trait logic hook (or
 * `useTraitStateMachine` trait binding) registers one on mount so the
 * verifier can read the live reducer state for that trait.
 */
export type TraitSnapshotGetter = () => TraitStateSnapshot;

interface RegistryState {
  checks: Map<string, VerificationCheck>;
  transitions: TransitionTrace[];
  bridgeHealth: BridgeHealth | null;
  listeners: Set<ChangeListener>;
  /**
   * Per-trait snapshot providers, keyed by trait name. Readers iterate
   * this map inside `getTraitSnapshots()`.
   */
  traitSnapshots: Map<string, TraitSnapshotGetter>;
}

function getState(): RegistryState {
  if (typeof window !== 'undefined') {
    const w = window as unknown as { __verificationRegistryState?: RegistryState };
    if (!w.__verificationRegistryState) {
      w.__verificationRegistryState = {
        checks: new Map(),
        transitions: [],
        bridgeHealth: null,
        listeners: new Set(),
        traitSnapshots: new Map(),
      };
    }
    return w.__verificationRegistryState;
  }
  // SSR fallback
  return {
    checks: new Map(),
    transitions: [],
    bridgeHealth: null,
    listeners: new Set(),
    traitSnapshots: new Map(),
  };
}

// Direct accessors — no proxies, just use getState() in every function

function notifyListeners(): void {
  getState().listeners.forEach((l) => l());
  exposeOnWindow();
}

// ============================================================================
// Checks API
// ============================================================================

export function registerCheck(
  id: string,
  label: string,
  status: CheckStatus = "pending",
  details?: string,
): void {
  getState().checks.set(id, { id, label, status, details, updatedAt: Date.now() });
  notifyListeners();
}

export function updateCheck(
  id: string,
  status: CheckStatus,
  details?: string,
): void {
  const check = getState().checks.get(id);
  if (check) {
    check.status = status;
    if (details !== undefined) check.details = details;
    check.updatedAt = Date.now();
  } else {
    getState().checks.set(id, { id, label: id, status, details, updatedAt: Date.now() });
  }
  notifyListeners();
}

export function getAllChecks(): VerificationCheck[] {
  return Array.from(getState().checks.values());
}

// ============================================================================
// Transition Timeline API
// ============================================================================

export function recordTransition(trace: Omit<TransitionTrace, "id">): void {
  const entry: TransitionTrace = {
    ...trace,
    id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  };
  log.info('transition:recorded', { trait: trace.traitName, from: trace.from, to: trace.to, event: trace.event, effectCount: trace.effects.length });
  getState().transitions.push(entry);

  if (getState().transitions.length > MAX_TRANSITIONS) {
    getState().transitions.shift();
  }

  // Auto-validate: check INIT transitions for fetch effects
  if (entry.event === "INIT") {
    const hasFetch = entry.effects.some((e) => e.type === "fetch");
    const checkId = `init-fetch-${entry.traitName}`;
    if (hasFetch) {
      registerCheck(
        checkId,
        `INIT transition for "${entry.traitName}" has fetch effect`,
        "pass",
      );
    } else {
      // Only warn if the trait renders entity-bound patterns
      const hasRenderUI = entry.effects.some((e) => e.type === "render-ui");
      if (hasRenderUI) {
        registerCheck(
          checkId,
          `INIT transition for "${entry.traitName}" missing fetch effect`,
          "fail",
          "Entity-bound render-ui without a fetch effect will show empty data",
        );
      }
    }
  }

  // Auto-validate: check effects executed successfully
  const failedEffects = entry.effects.filter((e) => e.status === "failed");
  if (failedEffects.length > 0) {
    registerCheck(
      `effects-${entry.id}`,
      `Effects failed in ${entry.traitName}: ${entry.from} -> ${entry.to}`,
      "fail",
      failedEffects.map((e) => `${e.type}: ${e.error}`).join("; "),
    );
  }

  notifyListeners();
}

export function getTransitions(): TransitionTrace[] {
  return [...getState().transitions];
}

export function getTransitionsForTrait(traitName: string): TransitionTrace[] {
  return getState().transitions.filter((t) => t.traitName === traitName);
}

/**
 * Record a server response as a timeline entry.
 * Creates a synthetic transition entry with type "server-response" to show
 * what the server returned (clientEffects, data counts, emitted events).
 */
export function recordServerResponse(
  orbitalName: string,
  event: string,
  response: Omit<ServerResponseTrace, "orbitalName" | "timestamp">,
): void {
  const serverResponse: ServerResponseTrace = {
    ...response,
    orbitalName,
    timestamp: Date.now(),
  };

  const entry: TransitionTrace = {
    id: `srv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    traitName: `server:${orbitalName}`,
    from: "server",
    to: "server",
    event,
    effects: [],
    serverResponse,
    timestamp: Date.now(),
  };

  getState().transitions.push(entry);
  if (getState().transitions.length > MAX_TRANSITIONS) {
    getState().transitions.shift();
  }

  if (!response.success && response.error) {
    registerCheck(
      `server-error-${entry.id}`,
      `Server error for ${orbitalName}:${event}`,
      "fail",
      response.error,
    );
  }

  notifyListeners();
}

// ============================================================================
// Bridge Health API
// ============================================================================

export function updateBridgeHealth(health: BridgeHealth): void {
  getState().bridgeHealth = { ...health };

  const checkId = "server-bridge";
  if (health.connected) {
    registerCheck(checkId, "Server bridge connected", "pass");
  } else {
    registerCheck(
      checkId,
      "Server bridge disconnected",
      "fail",
      health.lastError || "Bridge is not connected",
    );
  }

  notifyListeners();
}

export function getBridgeHealth(): BridgeHealth | null {
  const bh = getState().bridgeHealth;
  return bh ? { ...bh } : null;
}

// ============================================================================
// Summary
// ============================================================================

export function getSummary(): VerificationSummary {
  const allChecks = getAllChecks();
  return {
    totalChecks: allChecks.length,
    passed: allChecks.filter((c) => c.status === "pass").length,
    failed: allChecks.filter((c) => c.status === "fail").length,
    warnings: allChecks.filter((c) => c.status === "warn").length,
    pending: allChecks.filter((c) => c.status === "pending").length,
  };
}

// ============================================================================
// Snapshot (for automation)
// ============================================================================

export function getSnapshot(): VerificationSnapshot {
  return {
    checks: getAllChecks(),
    transitions: getTransitions(),
    bridge: getBridgeHealth(),
    summary: getSummary(),
    traits: getTraitSnapshots(),
  };
}

/**
 * Per-trait snapshot for the verifier.
 *
 * Iterates every registered trait getter and collects the live reducer
 * state. Empty until at least one trait hook calls `registerTraitSnapshot`.
 * A getter that throws is logged and skipped — one broken trait must not
 * poison the rest of the snapshot.
 */
export function getTraitSnapshots(): TraitStateSnapshot[] {
  const snapshots: TraitStateSnapshot[] = [];
  for (const [traitName, getter] of getState().traitSnapshots.entries()) {
    try {
      snapshots.push(getter());
    } catch (err) {
      log.error('traitSnapshot getter failed', { trait: traitName, err: String(err) });
    }
  }
  return snapshots;
}

// ============================================================================
// Subscriptions
// ============================================================================

export function subscribeToVerification(listener: ChangeListener): () => void {
  getState().listeners.add(listener);
  return () => getState().listeners.delete(listener);
}

// ============================================================================
// Window exposure for Playwright/automation
// ============================================================================

declare global {
  interface Window {
    __orbitalVerification?: OrbitalVerificationAPI;
  }
}

function exposeOnWindow(): void {
  if (typeof window === "undefined") return;

  if (!window.__orbitalVerification) {
    window.__orbitalVerification = {
      getSnapshot,
      getChecks: getAllChecks,
      getTransitions: getTransitions,
      getBridge: getBridgeHealth,
      getSummary,
      waitForTransition,
      getTraitSnapshots,
    };
  } else if (!window.__orbitalVerification.getTraitSnapshots) {
    // Back-compat: if the API was exposed before getTraitSnapshots existed
    // (older bundle loaded first), attach it on next call.
    window.__orbitalVerification.getTraitSnapshots = getTraitSnapshots;
  }
}

/**
 * Wait for a transition matching the given event to appear.
 * Returns the trace or null on timeout.
 */
export function waitForTransition(
  event: string,
  timeoutMs = 10_000,
): Promise<TransitionTrace | null> {
  return new Promise((resolve) => {
    // Check if already recorded
    const existing = getState().transitions.find((t) => t.event === event);
    if (existing) {
      resolve(existing);
      return;
    }

    const timeout = setTimeout(() => {
      unsub();
      resolve(null);
    }, timeoutMs);

    const unsub = subscribeToVerification(() => {
      const found = getState().transitions.find((t) => t.event === event);
      if (found) {
        clearTimeout(timeout);
        unsub();
        resolve(found);
      }
    });
  });
}

/**
 * Bind the EventBus so automation can send events and log emissions.
 * Call this during app initialization.
 */
export function bindEventBus(eventBus: {
  emit: (type: string, payload?: EventPayload) => void;
  onAny?: (listener: (event: BusEvent) => void) => () => void;
}): void {
  if (typeof window === "undefined") return;

  log.info('bindEventBus', { hasOnAny: !!eventBus.onAny });

  exposeOnWindow();
  if (window.__orbitalVerification) {
    window.__orbitalVerification.sendEvent = (event, payload, traitScope) => {
      // Gap #13: dispatch via the qualified bus key
      // `UI:${traitScope}.${event}` so codegen-emitted subscriptions
      // (own `useUIEvents` and cross-trait `useTraitListens`) match.
      // Bare `UI:${event}` is retained only when no traitScope is
      // provided — the kernel passes the dispatching trait per step,
      // so absent scope means a legacy / system-scope dispatch.
      const prefixed = event.startsWith('UI:')
        ? event
        : traitScope
          ? `UI:${traitScope}.${event}`
          : `UI:${event}`;
      log.debug('sendEvent', { event: prefixed, traitScope, payloadKeys: payload ? Object.keys(payload) : [] });
      eventBus.emit(prefixed, payload);
    };

    // Initialize event log
    const eventLog: EventLogEntry[] = [];
    window.__orbitalVerification.eventLog = eventLog;
    window.__orbitalVerification.clearEventLog = () => {
      eventLog.length = 0;
    };

    // Instrument event bus to log all emissions
    if (eventBus.onAny) {
      const verificationRegistryEventLogger = (event: BusEvent) => {
        if (eventLog.length < 200) {
          eventLog.push({
            type: event.type,
            payload: event.payload,
            timestamp: Date.now(),
          });
        }
      };
      // See VerificationProvider for the same defineProperty pattern.
      // Vite/Rollup minify const-binding names; a runtime name
      // assignment is preserved through the bundle so the per-listener
      // log can identify this subscriber.
      Object.defineProperty(verificationRegistryEventLogger, 'name', {
        value: 'verificationRegistry:eventLog',
      });
      eventBus.onAny(verificationRegistryEventLogger);
    }
  }
}

/**
 * Bind a trait state getter so automation can query current states.
 */
export function bindTraitStateGetter(
  getter: (traitName: string) => string | undefined,
): void {
  if (typeof window === "undefined") return;

  exposeOnWindow();
  if (window.__orbitalVerification) {
    window.__orbitalVerification.getTraitState = getter;
  }
}

/**
 * Register a per-trait snapshot provider. The generated trait logic hook
 * (or `useTraitStateMachine`) calls this once on mount, passing a getter
 * that reads the current reducer state via a ref. Returns an unregister
 * function for cleanup on unmount.
 *
 * Calling this twice for the same `traitName` replaces the previous
 * getter (e.g. page navigation remounts the trait; the new registration
 * wins).
 */
export function registerTraitSnapshot(
  traitName: string,
  getter: TraitSnapshotGetter,
): () => void {
  if (typeof window === "undefined") return () => {};
  getState().traitSnapshots.set(traitName, getter);
  exposeOnWindow();
  notifyListeners();
  return () => {
    const s = getState();
    if (s.traitSnapshots.get(traitName) === getter) {
      s.traitSnapshots.delete(traitName);
      notifyListeners();
    }
  };
}

// ============================================================================
// Canvas Frame Capture API (for game verification)
// ============================================================================

/**
 * Register a canvas frame capture function.
 * Called by game organisms (IsometricCanvas, PlatformerCanvas, SimulationCanvas)
 * so the verifier can snapshot canvas content at checkpoints.
 */
export function bindCanvasCapture(
  captureFn: () => string | null,
): void {
  if (typeof window === "undefined") return;

  exposeOnWindow();
  if (window.__orbitalVerification) {
    window.__orbitalVerification.captureFrame = captureFn;
  }
}

/**
 * Update asset load status for canvas verification.
 * Game organisms call this when images load or fail.
 */
export function updateAssetStatus(
  url: string,
  status: AssetLoadStatus,
): void {
  if (typeof window === "undefined") return;

  exposeOnWindow();
  if (window.__orbitalVerification) {
    if (!window.__orbitalVerification.assetStatus) {
      window.__orbitalVerification.assetStatus = {};
    }
    window.__orbitalVerification.assetStatus[url] = status;
  }
}

// ============================================================================
// Clear (for testing)
// ============================================================================

export function clearVerification(): void {
  getState().checks.clear();
  getState().transitions.length = 0;
  getState().bridgeHealth = null;
  notifyListeners();
}

// Auto-initialize on import
exposeOnWindow();
