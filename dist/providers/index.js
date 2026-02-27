import { SuspenseConfigProvider } from '../chunk-LX4G4SVJ.js';
import { ThemeProvider } from '../chunk-QU4JHKVC.js';
import { recordTransition, registerCheck, bindEventBus, bindTraitStateGetter } from '../chunk-45CTDYBT.js';
import '../chunk-KKCVDUK7.js';
import { SelectionProvider, EntityDataProvider } from '../chunk-PE2H3NAW.js';
export { SelectionContext, SelectionProvider, useSelection, useSelectionOptional } from '../chunk-PE2H3NAW.js';
import { useEventBus, EventBusProvider } from '../chunk-YXZM3WCF.js';
export { EventBusContext, EventBusProvider } from '../chunk-YXZM3WCF.js';
import '../chunk-7NEWMNNU.js';
import { useOfflineExecutor } from '../chunk-PL7MD6GF.js';
import '../chunk-PKBMQBKP.js';
import { createContext, useState, useCallback, useMemo, useContext, useRef, useEffect } from 'react';
import { jsx, Fragment } from 'react/jsx-runtime';

var FetchedDataContext = createContext(null);
function FetchedDataProvider({
  initialData,
  children
}) {
  const [state, setState] = useState(() => ({
    data: initialData || {},
    fetchedAt: {},
    loading: false,
    error: null
  }));
  const getData = useCallback(
    (entityName) => {
      return state.data[entityName] || [];
    },
    [state.data]
  );
  const getById = useCallback(
    (entityName, id) => {
      const records = state.data[entityName];
      return records?.find((r) => r.id === id);
    },
    [state.data]
  );
  const hasData = useCallback(
    (entityName) => {
      return entityName in state.data && state.data[entityName].length > 0;
    },
    [state.data]
  );
  const getFetchedAt = useCallback(
    (entityName) => {
      return state.fetchedAt[entityName];
    },
    [state.fetchedAt]
  );
  const setData = useCallback((data) => {
    const now = Date.now();
    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        ...data
      },
      fetchedAt: {
        ...prev.fetchedAt,
        ...Object.keys(data).reduce(
          (acc, key) => ({ ...acc, [key]: now }),
          {}
        )
      },
      loading: false,
      error: null
    }));
  }, []);
  const clearData = useCallback(() => {
    setState((prev) => ({
      ...prev,
      data: {},
      fetchedAt: {}
    }));
  }, []);
  const clearEntity = useCallback((entityName) => {
    setState((prev) => {
      const newData = { ...prev.data };
      const newFetchedAt = { ...prev.fetchedAt };
      delete newData[entityName];
      delete newFetchedAt[entityName];
      return {
        ...prev,
        data: newData,
        fetchedAt: newFetchedAt
      };
    });
  }, []);
  const setLoading = useCallback((loading) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);
  const setError = useCallback((error) => {
    setState((prev) => ({ ...prev, error, loading: false }));
  }, []);
  const contextValue = useMemo(
    () => ({
      getData,
      getById,
      hasData,
      getFetchedAt,
      setData,
      clearData,
      clearEntity,
      loading: state.loading,
      setLoading,
      error: state.error,
      setError
    }),
    [
      getData,
      getById,
      hasData,
      getFetchedAt,
      setData,
      clearData,
      clearEntity,
      state.loading,
      setLoading,
      state.error,
      setError
    ]
  );
  return /* @__PURE__ */ jsx(FetchedDataContext.Provider, { value: contextValue, children });
}
function useFetchedDataContext() {
  return useContext(FetchedDataContext);
}
function useFetchedData() {
  const context = useContext(FetchedDataContext);
  if (!context) {
    return {
      getData: () => [],
      getById: () => void 0,
      hasData: () => false,
      getFetchedAt: () => void 0,
      setData: () => {
      },
      clearData: () => {
      },
      clearEntity: () => {
      },
      loading: false,
      setLoading: () => {
      },
      error: null,
      setError: () => {
      }
    };
  }
  return context;
}
function useFetchedEntity(entityName) {
  const context = useFetchedData();
  return {
    /** All fetched records for this entity */
    records: context.getData(entityName),
    /** Get a record by ID */
    getById: (id) => context.getById(entityName, id),
    /** Whether data has been fetched for this entity */
    hasData: context.hasData(entityName),
    /** When data was last fetched */
    fetchedAt: context.getFetchedAt(entityName),
    /** Whether data is loading */
    loading: context.loading,
    /** Current error */
    error: context.error
  };
}
var DISPATCH_SUFFIX = ":DISPATCH";
var SUCCESS_SUFFIX = ":SUCCESS";
var ERROR_SUFFIX = ":ERROR";
function parseLifecycleEvent(type) {
  if (type.endsWith(DISPATCH_SUFFIX)) {
    const traitName = type.slice(0, -DISPATCH_SUFFIX.length);
    if (traitName) return { kind: "dispatch", traitName };
  } else if (type.endsWith(SUCCESS_SUFFIX)) {
    const rest = type.slice(0, -SUCCESS_SUFFIX.length);
    const colonIdx = rest.indexOf(":");
    if (colonIdx > 0) {
      return {
        kind: "success",
        traitName: rest.slice(0, colonIdx),
        event: rest.slice(colonIdx + 1)
      };
    }
  } else if (type.endsWith(ERROR_SUFFIX)) {
    const rest = type.slice(0, -ERROR_SUFFIX.length);
    const colonIdx = rest.indexOf(":");
    if (colonIdx > 0) {
      return {
        kind: "error",
        traitName: rest.slice(0, colonIdx),
        event: rest.slice(colonIdx + 1)
      };
    }
  }
  return null;
}
function VerificationProvider({
  children,
  enabled,
  runtimeManager,
  traitStateGetter
}) {
  const isEnabled = enabled ?? (typeof process !== "undefined" && process.env?.NODE_ENV !== "production");
  const eventBus = useEventBus();
  const pendingRef = useRef(/* @__PURE__ */ new Map());
  useEffect(() => {
    if (!isEnabled) return;
    if (!eventBus.onAny) return;
    const unsub = eventBus.onAny((evt) => {
      const parsed = parseLifecycleEvent(evt.type);
      if (!parsed) return;
      const payload = evt.payload ?? {};
      if (parsed.kind === "dispatch") {
        const key = `${parsed.traitName}:${String(payload["event"] ?? "")}`;
        pendingRef.current.set(key, {
          traitName: parsed.traitName,
          event: String(payload["event"] ?? ""),
          from: payload["currentState"],
          timestamp: evt.timestamp
        });
      } else if (parsed.kind === "success" && parsed.event) {
        const key = `${parsed.traitName}:${parsed.event}`;
        const pending = pendingRef.current.get(key);
        pendingRef.current.delete(key);
        const newState = payload["newState"] ?? payload["state"] ?? "unknown";
        const effects = Array.isArray(payload["clientEffects"]) ? payload["clientEffects"].map((e) => ({
          type: String(e["type"] ?? "unknown"),
          args: Array.isArray(e["args"]) ? e["args"] : [],
          status: "executed"
        })) : [];
        recordTransition({
          traitName: parsed.traitName,
          from: pending?.from ?? "unknown",
          to: newState,
          event: parsed.event,
          effects,
          timestamp: Date.now()
        });
      } else if (parsed.kind === "error" && parsed.event) {
        const key = `${parsed.traitName}:${parsed.event}`;
        const pending = pendingRef.current.get(key);
        pendingRef.current.delete(key);
        const errorMsg = payload["error"] ?? "Unknown error";
        recordTransition({
          traitName: parsed.traitName,
          from: pending?.from ?? "unknown",
          to: pending?.from ?? "unknown",
          // state didn't change on error
          event: parsed.event,
          effects: [{
            type: "server-call",
            args: [],
            status: "failed",
            error: errorMsg
          }],
          timestamp: Date.now()
        });
      }
    });
    registerCheck(
      "verification-provider",
      "VerificationProvider active (compiled path)",
      "pass"
    );
    return unsub;
  }, [isEnabled, eventBus]);
  useEffect(() => {
    if (!isEnabled) return;
    if (!runtimeManager) return;
    runtimeManager.setObserver({
      onTransition(trace) {
        recordTransition({
          traitName: trace.traitName,
          from: trace.from,
          to: trace.to,
          event: trace.event,
          guardResult: trace.guardResult,
          effects: trace.effects,
          timestamp: Date.now()
        });
      }
    });
    registerCheck(
      "verification-provider",
      "VerificationProvider active (runtime path)",
      "pass"
    );
  }, [isEnabled, runtimeManager]);
  useEffect(() => {
    if (!isEnabled) return;
    bindEventBus(eventBus);
  }, [isEnabled, eventBus]);
  useEffect(() => {
    if (!isEnabled) return;
    if (traitStateGetter) {
      bindTraitStateGetter(traitStateGetter);
    } else if (runtimeManager?.getState) {
      const mgr = runtimeManager;
      bindTraitStateGetter((traitName) => mgr.getState(traitName));
    }
  }, [isEnabled, traitStateGetter, runtimeManager]);
  return /* @__PURE__ */ jsx(Fragment, { children });
}
VerificationProvider.displayName = "VerificationProvider";
function FetchedDataBridge({ children }) {
  const fetchedData = useFetchedData();
  const adapter = useMemo(() => ({
    getData: (entity) => fetchedData.getData(entity),
    getById: (entity, id) => fetchedData.getById(entity, id),
    isLoading: fetchedData.loading,
    error: fetchedData.error
  }), [fetchedData.getData, fetchedData.getById, fetchedData.loading, fetchedData.error]);
  return /* @__PURE__ */ jsx(EntityDataProvider, { adapter, children });
}
function OrbitalProvider({
  children,
  themes,
  defaultTheme = "wireframe",
  defaultMode = "system",
  targetRef,
  skipTheme = false,
  debug = false,
  initialData,
  suspense = false,
  verification
}) {
  const suspenseConfig = useMemo(
    () => ({ enabled: suspense }),
    [suspense]
  );
  const inner = /* @__PURE__ */ jsx(FetchedDataProvider, { initialData, children: /* @__PURE__ */ jsx(FetchedDataBridge, { children: /* @__PURE__ */ jsx(EventBusProvider, { debug, children: /* @__PURE__ */ jsx(VerificationProvider, { enabled: verification, children: /* @__PURE__ */ jsx(SelectionProvider, { debug, children: /* @__PURE__ */ jsx(SuspenseConfigProvider, { config: suspenseConfig, children }) }) }) }) }) });
  if (skipTheme) {
    return inner;
  }
  return /* @__PURE__ */ jsx(
    ThemeProvider,
    {
      themes,
      defaultTheme,
      defaultMode,
      targetRef,
      children: inner
    }
  );
}
OrbitalProvider.displayName = "OrbitalProvider";
var OfflineModeContext = createContext(null);
function OfflineModeProvider({
  children,
  ...executorOptions
}) {
  const [forceOffline, setForceOffline] = useState(false);
  const executor = useOfflineExecutor(executorOptions);
  const effectivelyOffline = executor.isOffline || forceOffline;
  const contextValue = useMemo(
    () => ({
      ...executor,
      forceOffline,
      setForceOffline,
      effectivelyOffline
    }),
    [executor, forceOffline, effectivelyOffline]
  );
  return /* @__PURE__ */ jsx(OfflineModeContext.Provider, { value: contextValue, children });
}
function useOfflineMode() {
  const context = useContext(OfflineModeContext);
  if (!context) {
    throw new Error("useOfflineMode must be used within OfflineModeProvider");
  }
  return context;
}
function useOptionalOfflineMode() {
  return useContext(OfflineModeContext);
}

export { FetchedDataContext, FetchedDataProvider, OfflineModeProvider, OrbitalProvider, VerificationProvider, useFetchedData, useFetchedDataContext, useFetchedEntity, useOfflineMode, useOptionalOfflineMode };
