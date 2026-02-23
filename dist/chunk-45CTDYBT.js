// lib/verificationRegistry.ts
var checks = /* @__PURE__ */ new Map();
var transitions = [];
var bridgeHealth = null;
var MAX_TRANSITIONS = 500;
var listeners = /* @__PURE__ */ new Set();
function notifyListeners() {
  listeners.forEach((l) => l());
  exposeOnWindow();
}
function registerCheck(id, label, status = "pending", details) {
  checks.set(id, { id, label, status, details, updatedAt: Date.now() });
  notifyListeners();
}
function updateCheck(id, status, details) {
  const check = checks.get(id);
  if (check) {
    check.status = status;
    if (details !== void 0) check.details = details;
    check.updatedAt = Date.now();
  } else {
    checks.set(id, { id, label: id, status, details, updatedAt: Date.now() });
  }
  notifyListeners();
}
function getAllChecks() {
  return Array.from(checks.values());
}
function recordTransition(trace) {
  const entry = {
    ...trace,
    id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  };
  transitions.push(entry);
  if (transitions.length > MAX_TRANSITIONS) {
    transitions.shift();
  }
  if (entry.event === "INIT") {
    const hasFetch = entry.effects.some((e) => e.type === "fetch");
    const checkId = `init-fetch-${entry.traitName}`;
    if (hasFetch) {
      registerCheck(
        checkId,
        `INIT transition for "${entry.traitName}" has fetch effect`,
        "pass"
      );
    } else {
      const hasRenderUI = entry.effects.some((e) => e.type === "render-ui");
      if (hasRenderUI) {
        registerCheck(
          checkId,
          `INIT transition for "${entry.traitName}" missing fetch effect`,
          "fail",
          "Entity-bound render-ui without a fetch effect will show empty data"
        );
      }
    }
  }
  const failedEffects = entry.effects.filter((e) => e.status === "failed");
  if (failedEffects.length > 0) {
    registerCheck(
      `effects-${entry.id}`,
      `Effects failed in ${entry.traitName}: ${entry.from} -> ${entry.to}`,
      "fail",
      failedEffects.map((e) => `${e.type}: ${e.error}`).join("; ")
    );
  }
  notifyListeners();
}
function getTransitions() {
  return [...transitions];
}
function getTransitionsForTrait(traitName) {
  return transitions.filter((t) => t.traitName === traitName);
}
function updateBridgeHealth(health) {
  bridgeHealth = { ...health };
  const checkId = "server-bridge";
  if (health.connected) {
    registerCheck(checkId, "Server bridge connected", "pass");
  } else {
    registerCheck(
      checkId,
      "Server bridge disconnected",
      "fail",
      health.lastError || "Bridge is not connected"
    );
  }
  notifyListeners();
}
function getBridgeHealth() {
  return bridgeHealth ? { ...bridgeHealth } : null;
}
function getSummary() {
  const allChecks = getAllChecks();
  return {
    totalChecks: allChecks.length,
    passed: allChecks.filter((c) => c.status === "pass").length,
    failed: allChecks.filter((c) => c.status === "fail").length,
    warnings: allChecks.filter((c) => c.status === "warn").length,
    pending: allChecks.filter((c) => c.status === "pending").length
  };
}
function getSnapshot() {
  return {
    checks: getAllChecks(),
    transitions: getTransitions(),
    bridge: getBridgeHealth(),
    summary: getSummary()
  };
}
function subscribeToVerification(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function exposeOnWindow() {
  if (typeof window === "undefined") return;
  if (!window.__orbitalVerification) {
    window.__orbitalVerification = {
      getSnapshot,
      getChecks: getAllChecks,
      getTransitions,
      getBridge: getBridgeHealth,
      getSummary,
      waitForTransition
    };
  }
}
function waitForTransition(event, timeoutMs = 1e4) {
  return new Promise((resolve) => {
    const existing = transitions.find((t) => t.event === event);
    if (existing) {
      resolve(existing);
      return;
    }
    const timeout = setTimeout(() => {
      unsub();
      resolve(null);
    }, timeoutMs);
    const unsub = subscribeToVerification(() => {
      const found = transitions.find((t) => t.event === event);
      if (found) {
        clearTimeout(timeout);
        unsub();
        resolve(found);
      }
    });
  });
}
function bindEventBus(eventBus) {
  if (typeof window === "undefined") return;
  exposeOnWindow();
  if (window.__orbitalVerification) {
    window.__orbitalVerification.sendEvent = (event, payload) => {
      eventBus.emit(event, payload);
    };
  }
}
function bindTraitStateGetter(getter) {
  if (typeof window === "undefined") return;
  exposeOnWindow();
  if (window.__orbitalVerification) {
    window.__orbitalVerification.getTraitState = getter;
  }
}
function clearVerification() {
  checks.clear();
  transitions.length = 0;
  bridgeHealth = null;
  notifyListeners();
}
exposeOnWindow();

export { bindEventBus, bindTraitStateGetter, clearVerification, getAllChecks, getBridgeHealth, getSnapshot, getSummary, getTransitions, getTransitionsForTrait, recordTransition, registerCheck, subscribeToVerification, updateBridgeHealth, updateCheck, waitForTransition };
