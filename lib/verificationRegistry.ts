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

// ============================================================================
// Types
// ============================================================================

export type CheckStatus = "pass" | "fail" | "pending" | "warn";

export interface VerificationCheck {
  id: string;
  label: string;
  status: CheckStatus;
  details?: string;
  /** Timestamp when status last changed */
  updatedAt: number;
}

export interface EffectTrace {
  type: string;
  args: unknown[];
  status: "executed" | "failed" | "skipped";
  error?: string;
  durationMs?: number;
}

/** Captures what the server returned for a given event */
export interface ServerResponseTrace {
  orbitalName: string;
  success: boolean;
  clientEffects: number;
  dataEntities: Record<string, number>;
  emittedEvents: string[];
  error?: string;
  timestamp: number;
}

export interface TransitionTrace {
  id: string;
  traitName: string;
  from: string;
  to: string;
  event: string;
  guardExpression?: string;
  guardResult?: boolean;
  effects: EffectTrace[];
  /** Server response data when event was forwarded to server bridge */
  serverResponse?: ServerResponseTrace;
  timestamp: number;
}

export interface BridgeHealth {
  connected: boolean;
  eventsForwarded: number;
  eventsReceived: number;
  lastError?: string;
  lastHeartbeat: number;
}

export interface VerificationSummary {
  totalChecks: number;
  passed: number;
  failed: number;
  warnings: number;
  pending: number;
}

export interface VerificationSnapshot {
  checks: VerificationCheck[];
  transitions: TransitionTrace[];
  bridge: BridgeHealth | null;
  summary: VerificationSummary;
}

// ============================================================================
// State — stored on window to survive duplicate module instances (Vite dev)
// ============================================================================

const MAX_TRANSITIONS = 500;

type ChangeListener = () => void;

interface RegistryState {
  checks: Map<string, VerificationCheck>;
  transitions: TransitionTrace[];
  bridgeHealth: BridgeHealth | null;
  listeners: Set<ChangeListener>;
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
      };
    }
    return w.__verificationRegistryState;
  }
  // SSR fallback
  return { checks: new Map(), transitions: [], bridgeHealth: null, listeners: new Set() };
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
  };
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

/** Asset load status for canvas verification */
export type AssetLoadStatus = "loaded" | "failed" | "pending";

/** Event bus log entry for verification */
export interface EventLogEntry {
  type: string;
  payload?: Record<string, unknown>;
  timestamp: number;
}

/** Exposed on window for Playwright to query */
interface OrbitalVerificationAPI {
  getSnapshot: () => VerificationSnapshot;
  getChecks: () => VerificationCheck[];
  getTransitions: () => TransitionTrace[];
  getBridge: () => BridgeHealth | null;
  getSummary: () => VerificationSummary;
  /** Wait for a specific event to be processed */
  waitForTransition: (
    event: string,
    timeoutMs?: number,
  ) => Promise<TransitionTrace | null>;
  /** Send an event into the runtime (requires eventBus binding) */
  sendEvent?: (event: string, payload?: Record<string, unknown>) => void;
  /** Get current trait state */
  getTraitState?: (traitName: string) => string | undefined;
  /** Capture a canvas frame as PNG data URL. Registered by game organisms. */
  captureFrame?: () => string | null;
  /** Asset load status map. Registered by game organisms. */
  assetStatus?: Record<string, AssetLoadStatus>;
  /** Event bus log. Records all emit() calls for verification. */
  eventLog?: EventLogEntry[];
  /** Clear the event log. */
  clearEventLog?: () => void;
}

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
    };
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
  emit: (type: string, payload?: Record<string, unknown>) => void;
  onAny?: (listener: (event: { type: string; payload?: Record<string, unknown> }) => void) => () => void;
}): void {
  if (typeof window === "undefined") return;

  exposeOnWindow();
  if (window.__orbitalVerification) {
    window.__orbitalVerification.sendEvent = (event, payload) => {
      // Use UI: prefix — useTraitStateMachine and useOrbitalBridge
      // subscribe to UI:* events for user-initiated actions
      const prefixed = event.startsWith('UI:') ? event : `UI:${event}`;
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
      eventBus.onAny((event) => {
        if (eventLog.length < 200) {
          eventLog.push({
            type: event.type,
            payload: event.payload as Record<string, unknown> | undefined,
            timestamp: Date.now(),
          });
        }
      });
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
