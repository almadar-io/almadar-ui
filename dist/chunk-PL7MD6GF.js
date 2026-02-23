import { __publicField } from './chunk-PKBMQBKP.js';
import { useRef, useState, useEffect, useCallback } from 'react';

// renderer/client-effect-executor.ts
function executeClientEffects(effects, config) {
  if (!effects || effects.length === 0) {
    return;
  }
  for (const effect of effects) {
    try {
      executeEffect(effect, config);
    } catch (error) {
      console.error(
        `[ClientEffectExecutor] Error executing effect:`,
        effect,
        error
      );
    }
  }
  config.onComplete?.();
}
function executeEffect(effect, config) {
  const [effectType, ...args] = effect;
  switch (effectType) {
    case "render-ui": {
      const [slot, patternConfig] = args;
      executeRenderUI(slot, patternConfig, config);
      break;
    }
    case "navigate": {
      const [path, params] = args;
      executeNavigate(path, params, config);
      break;
    }
    case "notify": {
      const [message, options] = args;
      executeNotify(message, options, config);
      break;
    }
    case "emit": {
      const [event, payload] = args;
      executeEmit(event, payload, config);
      break;
    }
    default:
      console.warn(`[ClientEffectExecutor] Unknown effect type: ${effectType}`);
  }
}
function executeRenderUI(slot, patternConfig, config) {
  config.renderToSlot(slot, patternConfig);
}
function executeNavigate(path, params, config) {
  config.navigate(path, params);
}
function executeNotify(message, options, config) {
  config.notify(message, options);
}
function executeEmit(event, payload, config) {
  config.eventBus.emit(event, payload);
}
function parseClientEffect(raw) {
  if (!Array.isArray(raw) || raw.length < 1) {
    console.warn("[ClientEffectExecutor] Invalid effect format:", raw);
    return null;
  }
  const [type, ...args] = raw;
  if (typeof type !== "string") {
    console.warn("[ClientEffectExecutor] Effect type must be string:", raw);
    return null;
  }
  switch (type) {
    case "render-ui":
      return ["render-ui", args[0], args[1]];
    case "navigate":
      return ["navigate", args[0], args[1]];
    case "notify":
      return ["notify", args[0], args[1]];
    case "emit":
      return ["emit", args[0], args[1]];
    default:
      console.warn(`[ClientEffectExecutor] Unknown effect type: ${type}`);
      return null;
  }
}
function parseClientEffects(raw) {
  if (!raw || !Array.isArray(raw)) {
    return [];
  }
  return raw.map((effect) => parseClientEffect(effect)).filter((effect) => effect !== null);
}
function filterEffectsByType(effects, type) {
  return effects.filter(
    (effect) => effect[0] === type
  );
}
function getRenderUIEffects(effects) {
  return filterEffectsByType(effects, "render-ui");
}
function getNavigateEffects(effects) {
  return filterEffectsByType(effects, "navigate");
}
function getNotifyEffects(effects) {
  return filterEffectsByType(effects, "notify");
}
function getEmitEffects(effects) {
  return filterEffectsByType(effects, "emit");
}
var effectIdCounter = 0;
function generateEffectId() {
  return `offline-effect-${++effectIdCounter}-${Date.now()}`;
}
var OfflineExecutor = class {
  constructor(config) {
    __publicField(this, "config");
    __publicField(this, "state");
    __publicField(this, "storage");
    /**
     * Handle going online
     */
    __publicField(this, "handleOnline", () => {
      this.state.isOffline = false;
    });
    /**
     * Handle going offline
     */
    __publicField(this, "handleOffline", () => {
      this.state.isOffline = true;
    });
    this.config = {
      enableSyncQueue: true,
      maxQueueSize: 100,
      ...config
    };
    this.state = {
      isOffline: !this.checkOnline(),
      syncQueue: [],
      localEffectsProcessed: 0,
      effectsSynced: 0
    };
    this.storage = typeof localStorage !== "undefined" ? localStorage : null;
    this.loadSyncQueue();
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.handleOnline);
      window.addEventListener("offline", this.handleOffline);
    }
  }
  /**
   * Check if we're online (browser API)
   */
  checkOnline() {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  }
  /**
   * Load sync queue from localStorage
   */
  loadSyncQueue() {
    if (!this.storage) return;
    try {
      const stored = this.storage.getItem("orbital-offline-queue");
      if (stored) {
        this.state.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.warn("[OfflineExecutor] Failed to load sync queue:", error);
    }
  }
  /**
   * Save sync queue to localStorage
   */
  saveSyncQueue() {
    if (!this.storage) return;
    try {
      this.storage.setItem("orbital-offline-queue", JSON.stringify(this.state.syncQueue));
    } catch (error) {
      console.warn("[OfflineExecutor] Failed to save sync queue:", error);
    }
  }
  /**
   * Add an effect to the sync queue
   */
  queueForSync(type, payload) {
    if (!this.config.enableSyncQueue) return;
    const effect = {
      id: generateEffectId(),
      timestamp: Date.now(),
      type,
      payload,
      retries: 0,
      maxRetries: 3
    };
    this.state.syncQueue.push(effect);
    if (this.state.syncQueue.length > (this.config.maxQueueSize ?? 100)) {
      this.state.syncQueue.shift();
    }
    this.saveSyncQueue();
    this.config.onEffectQueued?.(effect);
    this.config.onQueueChange?.(this.state.syncQueue);
  }
  /**
   * Execute client effects immediately.
   */
  executeClientEffects(effects) {
    if (effects.length === 0) return;
    executeClientEffects(effects, this.config);
    this.state.localEffectsProcessed += effects.length;
  }
  /**
   * Process an event in offline mode.
   *
   * Returns a simulated EventResponse with mock data.
   * Client effects are executed immediately.
   * Server effects are queued for sync.
   */
  processEventOffline(event, payload, effects) {
    const clientEffects = [];
    const fetchedData = {};
    if (effects) {
      for (const effect of effects) {
        if (!Array.isArray(effect) || effect.length < 1) continue;
        const [type, ...args] = effect;
        switch (type) {
          // Client effects - execute immediately
          case "render-ui":
          case "navigate":
          case "notify":
          case "emit":
            clientEffects.push(effect);
            break;
          // Fetch effect - use mock data
          case "fetch": {
            const [entityName, _query] = args;
            if (typeof entityName === "string" && this.config.mockDataProvider) {
              fetchedData[entityName] = this.config.mockDataProvider(entityName);
            }
            break;
          }
          // Server effects - queue for sync
          case "persist":
          case "call-service":
          case "spawn":
          case "despawn":
            this.queueForSync(type, { args, event, payload });
            break;
          default:
            console.warn(`[OfflineExecutor] Unknown effect type: ${type}`);
        }
      }
    }
    if (clientEffects.length > 0) {
      this.executeClientEffects(clientEffects);
    }
    return {
      success: true,
      data: Object.keys(fetchedData).length > 0 ? fetchedData : void 0,
      clientEffects: clientEffects.length > 0 ? clientEffects : void 0
    };
  }
  /**
   * Sync pending effects to server.
   *
   * @param serverUrl - Base URL for the orbital server
   * @param authToken - Optional auth token for requests
   * @returns Number of successfully synced effects
   */
  async syncPendingEffects(serverUrl, authToken) {
    if (this.state.syncQueue.length === 0) {
      return 0;
    }
    this.state.lastSyncAttempt = Date.now();
    let syncedCount = 0;
    const failedEffects = [];
    const headers = {
      "Content-Type": "application/json"
    };
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }
    for (const effect of this.state.syncQueue) {
      try {
        const response = await fetch(`${serverUrl}/sync-effect`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            type: effect.type,
            payload: effect.payload,
            offlineId: effect.id,
            offlineTimestamp: effect.timestamp
          })
        });
        if (response.ok) {
          syncedCount++;
        } else {
          effect.retries++;
          if (effect.retries < effect.maxRetries) {
            failedEffects.push(effect);
          }
        }
      } catch (error) {
        effect.retries++;
        if (effect.retries < effect.maxRetries) {
          failedEffects.push(effect);
        }
      }
    }
    this.state.syncQueue = failedEffects;
    this.state.effectsSynced += syncedCount;
    if (syncedCount > 0) {
      this.state.lastSuccessfulSync = Date.now();
    }
    this.saveSyncQueue();
    this.config.onQueueChange?.(this.state.syncQueue);
    return syncedCount;
  }
  /**
   * Get current executor state
   */
  getState() {
    return { ...this.state };
  }
  /**
   * Get number of pending effects
   */
  getPendingCount() {
    return this.state.syncQueue.length;
  }
  /**
   * Clear the sync queue
   */
  clearQueue() {
    this.state.syncQueue = [];
    this.saveSyncQueue();
    this.config.onQueueChange?.(this.state.syncQueue);
  }
  /**
   * Dispose the executor and clean up listeners
   */
  dispose() {
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.handleOnline);
      window.removeEventListener("offline", this.handleOffline);
    }
  }
};
function createOfflineExecutor(config) {
  return new OfflineExecutor(config);
}
function useOfflineExecutor(options) {
  const executorRef = useRef(null);
  const [state, setState] = useState({
    isOffline: false,
    syncQueue: [],
    localEffectsProcessed: 0,
    effectsSynced: 0
  });
  useEffect(() => {
    const executor = new OfflineExecutor({
      ...options,
      onQueueChange: (queue) => {
        setState(executor.getState());
        options.onQueueChange?.(queue);
      }
    });
    executorRef.current = executor;
    setState(executor.getState());
    return () => {
      executor.dispose();
      executorRef.current = null;
    };
  }, []);
  useEffect(() => {
    if (!options.autoSync || !options.serverUrl) return;
    const handleOnline = async () => {
      if (executorRef.current) {
        await executorRef.current.syncPendingEffects(
          options.serverUrl,
          options.authToken
        );
        setState(executorRef.current.getState());
      }
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [options.autoSync, options.serverUrl, options.authToken]);
  const executeEffects = useCallback((effects) => {
    executorRef.current?.executeClientEffects(effects);
    if (executorRef.current) {
      setState(executorRef.current.getState());
    }
  }, []);
  const processEventOffline = useCallback(
    (event, payload, effects) => {
      const result = executorRef.current?.processEventOffline(event, payload, effects);
      if (executorRef.current) {
        setState(executorRef.current.getState());
      }
      return result ?? { success: false, error: "Executor not initialized" };
    },
    []
  );
  const sync = useCallback(async () => {
    if (!executorRef.current || !options.serverUrl) return 0;
    const count = await executorRef.current.syncPendingEffects(
      options.serverUrl,
      options.authToken
    );
    setState(executorRef.current.getState());
    return count;
  }, [options.serverUrl, options.authToken]);
  const clearQueue = useCallback(() => {
    executorRef.current?.clearQueue();
    if (executorRef.current) {
      setState(executorRef.current.getState());
    }
  }, []);
  return {
    state,
    isOffline: state.isOffline,
    pendingCount: state.syncQueue.length,
    executeClientEffects: executeEffects,
    processEventOffline,
    sync,
    clearQueue
  };
}

export { OfflineExecutor, createOfflineExecutor, executeClientEffects, filterEffectsByType, getEmitEffects, getNavigateEffects, getNotifyEffects, getRenderUIEffects, parseClientEffect, parseClientEffects, useOfflineExecutor };
