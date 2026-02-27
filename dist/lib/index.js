export { DEFAULT_CONFIG, extractOutputsFromTransitions, extractStateMachine, formatGuard, getEffectSummary, parseContentSegments, parseMarkdownWithCodeBlocks, renderStateMachineToDomData, renderStateMachineToSvg } from '../chunk-N6DJVKZ6.js';
export { ApiError, apiClient } from '../chunk-XSEDIUM6.js';
export { bindEventBus, bindTraitStateGetter, clearVerification, getAllChecks, getBridgeHealth, getSnapshot, getSummary, getTransitions, getTransitionsForTrait, recordTransition, registerCheck, subscribeToVerification, updateBridgeHealth, updateCheck, waitForTransition } from '../chunk-45CTDYBT.js';
export { cn, debug, debugCollision, debugError, debugGameState, debugGroup, debugGroupEnd, debugInput, debugPhysics, debugTable, debugTime, debugTimeEnd, debugWarn, formatNestedFieldLabel, getNestedValue, isDebugEnabled } from '../chunk-KKCVDUK7.js';
import '../chunk-PKBMQBKP.js';

// lib/debugUtils.ts
var DEBUG_STORAGE_KEY = "orbital-debug";
var listeners = /* @__PURE__ */ new Set();
function isDebugEnabled2() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DEBUG_STORAGE_KEY) === "true";
}
function setDebugEnabled(enabled) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEBUG_STORAGE_KEY, String(enabled));
  listeners.forEach((listener) => listener(enabled));
}
function toggleDebug() {
  const newValue = !isDebugEnabled2();
  setDebugEnabled(newValue);
  return newValue;
}
function onDebugToggle(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function initDebugShortcut() {
  if (typeof window === "undefined") return () => {
  };
  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === "D") {
      e.preventDefault();
      toggleDebug();
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}

// lib/entityDebug.ts
var entityProvider = null;
function setEntityProvider(provider) {
  entityProvider = provider;
}
function clearEntityProvider() {
  entityProvider = null;
}
function getEntitySnapshot() {
  if (!entityProvider) {
    return null;
  }
  const entities = entityProvider();
  return {
    entities,
    timestamp: Date.now(),
    totalCount: entities.length,
    singletons: {},
    runtime: entities.map((e) => ({ id: e.id, type: e.type, data: e.fields })),
    persistent: {}
  };
}
function getEntityById(id) {
  if (!entityProvider) {
    return void 0;
  }
  return entityProvider().find((e) => e.id === id);
}
function getEntitiesByType(type) {
  if (!entityProvider) {
    return [];
  }
  return entityProvider().filter((e) => e.type === type);
}

// lib/debugRegistry.ts
var events = [];
var listeners2 = /* @__PURE__ */ new Set();
var MAX_EVENTS = 500;
function notifyListeners() {
  listeners2.forEach((listener) => listener());
}
function logDebugEvent(type, source, message, data) {
  const event = {
    id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    source,
    message,
    data,
    timestamp: Date.now()
  };
  events.unshift(event);
  if (events.length > MAX_EVENTS) {
    events.pop();
  }
  notifyListeners();
}
function logStateChange(source, from, to, event) {
  logDebugEvent("state-change", source, `${from} \u2192 ${to}`, { from, to, event });
}
function logEventFired(source, eventName, payload) {
  logDebugEvent("event-fired", source, eventName, { eventName, payload });
}
function logEffectExecuted(source, effectType, details) {
  logDebugEvent("effect-executed", source, effectType, { effectType, details });
}
function logError(source, message, error) {
  logDebugEvent("error", source, message, { error });
}
function logWarning(source, message, data) {
  logDebugEvent("warning", source, message, data);
}
function logInfo(source, message, data) {
  logDebugEvent("info", source, message, data);
}
function getDebugEvents() {
  return [...events];
}
function getRecentEvents(count) {
  return events.slice(0, count);
}
function getEventsByType(type) {
  return events.filter((e) => e.type === type);
}
function getEventsBySource(source) {
  return events.filter((e) => e.source === source);
}
function subscribeToDebugEvents(listener) {
  listeners2.add(listener);
  return () => listeners2.delete(listener);
}
function clearDebugEvents() {
  events.length = 0;
  notifyListeners();
}

// lib/guardRegistry.ts
var guardHistory = [];
var listeners3 = /* @__PURE__ */ new Set();
var MAX_HISTORY = 100;
function notifyListeners2() {
  listeners3.forEach((listener) => listener());
}
function recordGuardEvaluation(evaluation) {
  const entry = {
    ...evaluation,
    id: `guard-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: Date.now()
  };
  guardHistory.unshift(entry);
  if (guardHistory.length > MAX_HISTORY) {
    guardHistory.pop();
  }
  notifyListeners2();
}
function getGuardHistory() {
  return [...guardHistory];
}
function getRecentGuardEvaluations(count) {
  return guardHistory.slice(0, count);
}
function getGuardEvaluationsForTrait(traitName) {
  return guardHistory.filter((g) => g.traitName === traitName);
}
function subscribeToGuardChanges(listener) {
  listeners3.add(listener);
  return () => listeners3.delete(listener);
}
function clearGuardHistory() {
  guardHistory.length = 0;
  notifyListeners2();
}

// lib/tickRegistry.ts
var ticks = /* @__PURE__ */ new Map();
var listeners4 = /* @__PURE__ */ new Set();
function notifyListeners3() {
  listeners4.forEach((listener) => listener());
}
function registerTick(tick) {
  ticks.set(tick.id, tick);
  notifyListeners3();
}
function updateTickExecution(id, timestamp) {
  const tick = ticks.get(id);
  if (tick) {
    tick.lastExecuted = timestamp;
    tick.nextExecution = timestamp + tick.interval;
    tick.executionCount++;
    notifyListeners3();
  }
}
function setTickActive(id, isActive) {
  const tick = ticks.get(id);
  if (tick) {
    tick.isActive = isActive;
    notifyListeners3();
  }
}
function unregisterTick(id) {
  ticks.delete(id);
  notifyListeners3();
}
function getAllTicks() {
  return Array.from(ticks.values());
}
function getTick(id) {
  return ticks.get(id);
}
function subscribeToTickChanges(listener) {
  listeners4.add(listener);
  return () => listeners4.delete(listener);
}
function clearTicks() {
  ticks.clear();
  notifyListeners3();
}

// lib/traitRegistry.ts
var traits = /* @__PURE__ */ new Map();
var listeners5 = /* @__PURE__ */ new Set();
function notifyListeners4() {
  listeners5.forEach((listener) => listener());
}
function registerTrait(info) {
  traits.set(info.id, info);
  notifyListeners4();
}
function updateTraitState(id, newState) {
  const trait = traits.get(id);
  if (trait) {
    trait.currentState = newState;
    trait.transitionCount++;
    notifyListeners4();
  }
}
function updateGuardResult(traitId, guardName, result) {
  const trait = traits.get(traitId);
  if (trait) {
    const guard = trait.guards.find((g) => g.name === guardName);
    if (guard) {
      guard.lastResult = result;
      notifyListeners4();
    }
  }
}
function unregisterTrait(id) {
  traits.delete(id);
  notifyListeners4();
}
function getAllTraits() {
  return Array.from(traits.values());
}
function getTrait(id) {
  return traits.get(id);
}
function subscribeToTraitChanges(listener) {
  listeners5.add(listener);
  return () => listeners5.delete(listener);
}
function clearTraits() {
  traits.clear();
  notifyListeners4();
}

export { clearDebugEvents, clearEntityProvider, clearGuardHistory, clearTicks, clearTraits, getAllTicks, getAllTraits, getDebugEvents, getEntitiesByType, getEntityById, getEntitySnapshot, getEventsBySource, getEventsByType, getGuardEvaluationsForTrait, getGuardHistory, getRecentEvents, getRecentGuardEvaluations, getTick, getTrait, initDebugShortcut, logDebugEvent, logEffectExecuted, logError, logEventFired, logInfo, logStateChange, logWarning, onDebugToggle, recordGuardEvaluation, registerTick, registerTrait, setDebugEnabled, setEntityProvider, setTickActive, subscribeToDebugEvents, subscribeToGuardChanges, subscribeToTickChanges, subscribeToTraitChanges, toggleDebug, unregisterTick, unregisterTrait, updateGuardResult, updateTickExecution, updateTraitState };
