import { useEventBus } from './chunk-YXZM3WCF.js';
import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { jsx } from 'react/jsx-runtime';

var I18nContext = createContext({
  locale: "en",
  direction: "ltr",
  t: (key) => key
  // passthrough fallback
});
I18nContext.displayName = "I18nContext";
var I18nProvider = I18nContext.Provider;
function useTranslate() {
  return useContext(I18nContext);
}
function createTranslate(messages) {
  return (key, params) => {
    let msg = messages[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        msg = msg.split(`{{${k}}}`).join(String(v));
      }
    }
    return msg;
  };
}
var queryStores = /* @__PURE__ */ new Map();
function getOrCreateStore(query) {
  if (!queryStores.has(query)) {
    queryStores.set(query, {
      search: "",
      filters: {},
      sortField: void 0,
      sortDirection: void 0,
      listeners: /* @__PURE__ */ new Set()
    });
  }
  return queryStores.get(query);
}
function useQuerySingleton(query) {
  const [, forceUpdate] = useState({});
  if (!query) {
    return null;
  }
  const store = useMemo(() => getOrCreateStore(query), [query]);
  useMemo(() => {
    const listener = () => forceUpdate({});
    store.listeners.add(listener);
    return () => {
      store.listeners.delete(listener);
    };
  }, [store]);
  const notifyListeners = useCallback(() => {
    store.listeners.forEach((listener) => listener());
  }, [store]);
  const setSearch = useCallback((value) => {
    store.search = value;
    notifyListeners();
  }, [store, notifyListeners]);
  const setFilter = useCallback((key, value) => {
    store.filters = { ...store.filters, [key]: value };
    notifyListeners();
  }, [store, notifyListeners]);
  const clearFilters = useCallback(() => {
    store.filters = {};
    store.search = "";
    notifyListeners();
  }, [store, notifyListeners]);
  const setSort = useCallback((field, direction) => {
    store.sortField = field;
    store.sortDirection = direction;
    notifyListeners();
  }, [store, notifyListeners]);
  return {
    search: store.search,
    setSearch,
    filters: store.filters,
    setFilter,
    clearFilters,
    sortField: store.sortField,
    sortDirection: store.sortDirection,
    setSort
  };
}
function parseQueryBinding(binding) {
  const cleaned = binding.startsWith("@") ? binding.slice(1) : binding;
  const parts = cleaned.split(".");
  return {
    query: parts[0],
    field: parts.length > 1 ? parts.slice(1).join(".") : void 0
  };
}
var EntityDataContext = createContext(null);
function EntityDataProvider({
  adapter,
  children
}) {
  return React.createElement(
    EntityDataContext.Provider,
    { value: adapter },
    children
  );
}
function useEntityDataAdapter() {
  return useContext(EntityDataContext);
}
var entityDataKeys = {
  all: ["entities"],
  lists: () => [...entityDataKeys.all, "list"],
  list: (entity, filters) => [...entityDataKeys.lists(), entity, filters],
  details: () => [...entityDataKeys.all, "detail"],
  detail: (entity, id) => [...entityDataKeys.details(), entity, id]
};
function useEntityList(entity, options = {}) {
  const { skip = false } = options;
  const adapter = useContext(EntityDataContext);
  const adapterData = useMemo(() => {
    if (!adapter || !entity || skip) return [];
    return adapter.getData(entity);
  }, [adapter, entity, skip, adapter?.isLoading]);
  const [stubData, setStubData] = useState([]);
  const [stubLoading, setStubLoading] = useState(!skip && !!entity && !adapter);
  const [stubError, setStubError] = useState(null);
  useEffect(() => {
    if (adapter || skip || !entity) {
      setStubLoading(false);
      return;
    }
    setStubLoading(true);
    const t = setTimeout(() => {
      setStubData([]);
      setStubLoading(false);
    }, 100);
    return () => clearTimeout(t);
  }, [entity, skip, adapter]);
  if (adapter) {
    return {
      data: adapterData,
      isLoading: adapter.isLoading,
      error: adapter.error ? new Error(adapter.error) : null,
      refetch: () => {
      }
    };
  }
  return { data: stubData, isLoading: stubLoading, error: stubError, refetch: () => {
  } };
}
function useEntity(entity, id) {
  const adapter = useContext(EntityDataContext);
  const adapterData = useMemo(() => {
    if (!adapter || !entity || !id) return null;
    return adapter.getById(entity, id) ?? null;
  }, [adapter, entity, id, adapter?.isLoading]);
  const [stubData, setStubData] = useState(null);
  const [stubLoading, setStubLoading] = useState(!!entity && !!id && !adapter);
  const [stubError, setStubError] = useState(null);
  useEffect(() => {
    if (adapter || !entity || !id) {
      setStubLoading(false);
      return;
    }
    setStubLoading(true);
    const t = setTimeout(() => {
      setStubData(null);
      setStubLoading(false);
    }, 100);
    return () => clearTimeout(t);
  }, [entity, id, adapter]);
  if (adapter) {
    return {
      data: adapterData,
      isLoading: adapter.isLoading,
      error: adapter.error ? new Error(adapter.error) : null
    };
  }
  return { data: stubData, isLoading: stubLoading, error: stubError };
}
function useEntityDetail(entity, id) {
  const result = useEntity(entity, id);
  return { ...result, refetch: () => {
  } };
}
var suspenseCache = /* @__PURE__ */ new Map();
function getSuspenseCacheKey(entity, type, id) {
  return id ? `${type}:${entity}:${id}` : `${type}:${entity}`;
}
function useEntityListSuspense(entity) {
  const adapter = useContext(EntityDataContext);
  if (adapter) {
    if (adapter.isLoading) {
      const cacheKey2 = getSuspenseCacheKey(entity, "list");
      let entry2 = suspenseCache.get(cacheKey2);
      if (!entry2 || entry2.status === "resolved") {
        let resolve;
        const promise = new Promise((r) => {
          resolve = r;
        });
        entry2 = { promise, status: "pending" };
        suspenseCache.set(cacheKey2, entry2);
        const check = setInterval(() => {
          if (!adapter.isLoading) {
            clearInterval(check);
            entry2.status = "resolved";
            resolve();
          }
        }, 50);
      }
      if (entry2.status === "pending") {
        throw entry2.promise;
      }
    }
    if (adapter.error) {
      throw new Error(adapter.error);
    }
    return {
      data: adapter.getData(entity),
      refetch: () => {
      }
    };
  }
  const cacheKey = getSuspenseCacheKey(entity, "list");
  let entry = suspenseCache.get(cacheKey);
  if (!entry) {
    let resolve;
    const promise = new Promise((r) => {
      resolve = r;
      setTimeout(() => {
        entry.status = "resolved";
        resolve();
      }, 100);
    });
    entry = { promise, status: "pending" };
    suspenseCache.set(cacheKey, entry);
  }
  if (entry.status === "pending") {
    throw entry.promise;
  }
  return { data: [], refetch: () => {
  } };
}
function useEntitySuspense(entity, id) {
  const adapter = useContext(EntityDataContext);
  if (adapter) {
    if (adapter.isLoading) {
      const cacheKey2 = getSuspenseCacheKey(entity, "detail", id);
      let entry2 = suspenseCache.get(cacheKey2);
      if (!entry2 || entry2.status === "resolved") {
        let resolve;
        const promise = new Promise((r) => {
          resolve = r;
        });
        entry2 = { promise, status: "pending" };
        suspenseCache.set(cacheKey2, entry2);
        const check = setInterval(() => {
          if (!adapter.isLoading) {
            clearInterval(check);
            entry2.status = "resolved";
            resolve();
          }
        }, 50);
      }
      if (entry2.status === "pending") {
        throw entry2.promise;
      }
    }
    if (adapter.error) {
      throw new Error(adapter.error);
    }
    return {
      data: adapter.getById(entity, id) ?? null,
      refetch: () => {
      }
    };
  }
  const cacheKey = getSuspenseCacheKey(entity, "detail", id);
  let entry = suspenseCache.get(cacheKey);
  if (!entry) {
    let resolve;
    const promise = new Promise((r) => {
      resolve = r;
      setTimeout(() => {
        entry.status = "resolved";
        resolve();
      }, 100);
    });
    entry = { promise, status: "pending" };
    suspenseCache.set(cacheKey, entry);
  }
  if (entry.status === "pending") {
    throw entry.promise;
  }
  return { data: null, refetch: () => {
  } };
}
var SelectionContext = createContext(null);
var defaultCompareEntities = (a, b) => {
  if (a === b) return true;
  if (!a || !b) return false;
  if (typeof a === "object" && typeof b === "object") {
    const aId = a.id;
    const bId = b.id;
    return aId !== void 0 && aId === bId;
  }
  return false;
};
function SelectionProvider({
  children,
  debug = false,
  compareEntities = defaultCompareEntities
}) {
  const eventBus = useEventBus();
  const [selected, setSelectedState] = useState(null);
  const setSelected = useCallback(
    (entity) => {
      setSelectedState(entity);
      if (debug) {
        console.log("[SelectionProvider] Selection set:", entity);
      }
    },
    [debug]
  );
  const clearSelection = useCallback(() => {
    setSelectedState(null);
    if (debug) {
      console.log("[SelectionProvider] Selection cleared");
    }
  }, [debug]);
  const isSelected = useCallback(
    (entity) => {
      return compareEntities(selected, entity);
    },
    [selected, compareEntities]
  );
  useEffect(() => {
    const handleSelect = (event) => {
      const row = event.payload?.row;
      if (row) {
        setSelected(row);
        if (debug) {
          console.log(`[SelectionProvider] ${event.type} received:`, row);
        }
      }
    };
    const handleDeselect = (event) => {
      clearSelection();
      if (debug) {
        console.log(`[SelectionProvider] ${event.type} received - clearing selection`);
      }
    };
    const unsubView = eventBus.on("UI:VIEW", handleSelect);
    const unsubSelect = eventBus.on("UI:SELECT", handleSelect);
    const unsubClose = eventBus.on("UI:CLOSE", handleDeselect);
    const unsubDeselect = eventBus.on("UI:DESELECT", handleDeselect);
    const unsubCancel = eventBus.on("UI:CANCEL", handleDeselect);
    return () => {
      unsubView();
      unsubSelect();
      unsubClose();
      unsubDeselect();
      unsubCancel();
    };
  }, [eventBus, setSelected, clearSelection, debug]);
  const contextValue = {
    selected,
    setSelected,
    clearSelection,
    isSelected
  };
  return /* @__PURE__ */ jsx(SelectionContext.Provider, { value: contextValue, children });
}
function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error("useSelection must be used within a SelectionProvider");
  }
  return context;
}
function useSelectionOptional() {
  const context = useContext(SelectionContext);
  return context;
}

export { EntityDataProvider, I18nProvider, SelectionContext, SelectionProvider, createTranslate, entityDataKeys, parseQueryBinding, useEntity, useEntityDataAdapter, useEntityDetail, useEntityList, useEntityListSuspense, useEntitySuspense, useQuerySingleton, useSelection, useSelectionOptional, useTranslate };
