import { executeClientEffects } from '../chunk-PL7MD6GF.js';
export { OfflineExecutor, createOfflineExecutor, executeClientEffects, filterEffectsByType, getEmitEffects, getNavigateEffects, getNotifyEffects, getRenderUIEffects, parseClientEffect, parseClientEffects, useOfflineExecutor } from '../chunk-PL7MD6GF.js';
import '../chunk-PKBMQBKP.js';
import { createContext, useRef, useCallback, useEffect, useContext, useMemo, useState } from 'react';
import { jsx } from 'react/jsx-runtime';
import { componentMapping as componentMapping$1, patternsRegistry } from '@almadar/patterns';

// renderer/pattern-resolver.ts
var componentMapping = {};
var patternRegistry = {};
function initializePatternResolver(config) {
  componentMapping = config.componentMapping;
  patternRegistry = config.patternRegistry;
}
function setComponentMapping(mapping) {
  componentMapping = mapping;
}
function setPatternRegistry(registry) {
  patternRegistry = registry;
}
function resolvePattern(config) {
  const { type, ...props } = config;
  const mapping = componentMapping[type];
  if (!mapping) {
    if (Object.keys(componentMapping).length === 0) {
      console.warn(
        "[PatternResolver] Component mapping not initialized. Call initializePatternResolver() at app startup."
      );
    }
    throw new Error(`Unknown pattern type: ${type}`);
  }
  if (mapping.deprecated) {
    console.warn(
      `[PatternResolver] Pattern "${type}" is deprecated.` + (mapping.replacedBy ? ` Use "${mapping.replacedBy}" instead.` : "")
    );
  }
  const validatedProps = validatePatternProps(type, props);
  return {
    component: mapping.component,
    importPath: mapping.importPath,
    category: mapping.category,
    validatedProps
  };
}
function validatePatternProps(patternType, props) {
  const definition = patternRegistry[patternType];
  if (!definition || !definition.propsSchema) {
    return props;
  }
  const validated = { ...props };
  const schema = definition.propsSchema;
  for (const [propName, propDef] of Object.entries(schema)) {
    if (propDef.required && !(propName in validated)) {
      console.warn(
        `[PatternResolver] Missing required prop "${propName}" for pattern "${patternType}"`
      );
    }
  }
  return validated;
}
function isKnownPattern(type) {
  return type in componentMapping;
}
function getKnownPatterns() {
  return Object.keys(componentMapping);
}
function getPatternsByCategory(category) {
  return Object.entries(componentMapping).filter(([, mapping]) => mapping.category === category).map(([type]) => type);
}
function getPatternMapping(type) {
  return componentMapping[type];
}
function getPatternDefinition(type) {
  return patternRegistry[type];
}
function useClientEffects(effects, options) {
  const {
    enabled = true,
    debug = false,
    onComplete,
    ...config
  } = options;
  const executedRef = useRef(/* @__PURE__ */ new Set());
  const executingRef = useRef(false);
  const executedCountRef = useRef(0);
  const getEffectKey = useCallback((effect) => {
    return JSON.stringify(effect);
  }, []);
  const execute = useCallback((effectsToExecute) => {
    if (executingRef.current || effectsToExecute.length === 0) {
      return;
    }
    executingRef.current = true;
    const newEffects = effectsToExecute.filter((effect) => {
      const key = getEffectKey(effect);
      if (executedRef.current.has(key)) {
        if (debug) {
          console.log("[useClientEffects] Skipping duplicate effect:", effect);
        }
        return false;
      }
      return true;
    });
    if (newEffects.length === 0) {
      executingRef.current = false;
      return;
    }
    if (debug) {
      console.log("[useClientEffects] Executing effects:", newEffects);
    }
    newEffects.forEach((effect) => {
      executedRef.current.add(getEffectKey(effect));
    });
    executeClientEffects(newEffects, {
      ...config,
      onComplete: () => {
        executedCountRef.current = newEffects.length;
        executingRef.current = false;
        onComplete?.();
      }
    });
  }, [config, debug, getEffectKey, onComplete]);
  useEffect(() => {
    if (!enabled || !effects || effects.length === 0) {
      return;
    }
    execute(effects);
  }, [effects, enabled, execute]);
  const prevEffectsRef = useRef(void 0);
  useEffect(() => {
    if (effects !== prevEffectsRef.current) {
      prevEffectsRef.current = effects;
    }
  }, [effects]);
  return {
    executedCount: executedCountRef.current,
    executing: executingRef.current,
    execute
  };
}
var ClientEffectConfigContext = createContext(null);
var ClientEffectConfigProvider = ClientEffectConfigContext.Provider;
function useClientEffectConfig() {
  const context = useContext(ClientEffectConfigContext);
  if (!context) {
    throw new Error(
      "useClientEffectConfig must be used within a ClientEffectConfigProvider. Make sure your component tree is wrapped with OrbitalProvider."
    );
  }
  return context;
}
function useClientEffectConfigOptional() {
  return useContext(ClientEffectConfigContext);
}

// renderer/data-resolver.ts
function resolveEntityData(entityName, context) {
  if (context.fetchedData && entityName in context.fetchedData) {
    const data = context.fetchedData[entityName];
    return {
      data: Array.isArray(data) ? data : [],
      loading: false
    };
  }
  if (context.entityStore) {
    try {
      const data = context.entityStore.getRecords(entityName);
      return {
        data: Array.isArray(data) ? data : [],
        loading: false
      };
    } catch (error) {
      console.warn(
        `[DataResolver] Error getting records from entity store for "${entityName}":`,
        error
      );
    }
  }
  const hasAnySources = context.fetchedData || context.entityStore;
  return {
    data: [],
    loading: !hasAnySources
    // Only loading if no sources configured
  };
}
function resolveEntityDataWithQuery(entityName, queryRef, context) {
  const resolution = resolveEntityData(entityName, context);
  if (!queryRef || !context.querySingleton) {
    return resolution;
  }
  try {
    const filters = context.querySingleton.getFilters(queryRef);
    const filteredData = applyFilters(resolution.data, filters);
    return {
      ...resolution,
      data: filteredData
    };
  } catch (error) {
    console.warn(
      `[DataResolver] Error applying query filters for "${queryRef}":`,
      error
    );
    return resolution;
  }
}
function applyFilters(data, filters) {
  if (!filters || Object.keys(filters).length === 0) {
    return data;
  }
  return data.filter((item) => {
    if (typeof item !== "object" || item === null) {
      return false;
    }
    const record = item;
    return Object.entries(filters).every(([key, value]) => {
      if (value === void 0 || value === null) {
        return true;
      }
      const recordValue = record[key];
      if (Array.isArray(value)) {
        return value.includes(recordValue);
      }
      if (typeof value === "string" && typeof recordValue === "string") {
        if (value.startsWith("*") && value.endsWith("*")) {
          const pattern = value.slice(1, -1);
          return recordValue.toLowerCase().includes(pattern.toLowerCase());
        }
      }
      return recordValue === value;
    });
  });
}
function resolveEntityById(entityName, id, context) {
  const { data } = resolveEntityData(entityName, context);
  return data.find((item) => {
    if (typeof item !== "object" || item === null) {
      return false;
    }
    const record = item;
    return record.id === id || record._id === id;
  }) ?? null;
}
function resolveEntityCount(entityName, context, filters) {
  const { data } = resolveEntityData(entityName, context);
  if (filters) {
    return applyFilters(data, filters).length;
  }
  return data.length;
}
function hasEntities(entityName, context) {
  const { data } = resolveEntityData(entityName, context);
  return data.length > 0;
}
function createFetchedDataContext(data) {
  return { fetchedData: data };
}
function mergeDataContexts(...contexts) {
  const merged = {};
  for (const context of contexts) {
    if (context.fetchedData) {
      merged.fetchedData = {
        ...merged.fetchedData,
        ...context.fetchedData
      };
    }
    if (context.entityStore) {
      merged.entityStore = context.entityStore;
    }
    if (context.querySingleton) {
      merged.querySingleton = context.querySingleton;
    }
  }
  return merged;
}

// renderer/slot-definitions.ts
var SLOT_DEFINITIONS = {
  // -------------------------------------------------------------------------
  // Inline Slots - Render in place within the component tree
  // -------------------------------------------------------------------------
  main: {
    name: "main",
    type: "inline"
  },
  sidebar: {
    name: "sidebar",
    type: "inline"
  },
  // -------------------------------------------------------------------------
  // Portal Slots - Render to document.body via React Portal
  // -------------------------------------------------------------------------
  modal: {
    name: "modal",
    type: "portal",
    portalTarget: "body",
    zIndex: 1e3
  },
  drawer: {
    name: "drawer",
    type: "portal",
    portalTarget: "body",
    zIndex: 900
  },
  overlay: {
    name: "overlay",
    type: "portal",
    portalTarget: "body",
    zIndex: 1100
  },
  center: {
    name: "center",
    type: "portal",
    portalTarget: "body",
    zIndex: 1e3
  },
  toast: {
    name: "toast",
    type: "portal",
    portalTarget: "body",
    zIndex: 1200
  },
  // -------------------------------------------------------------------------
  // Game HUD Slots - Portal for game overlay UI
  // -------------------------------------------------------------------------
  "hud-top": {
    name: "hud-top",
    type: "portal",
    portalTarget: "body",
    zIndex: 500
  },
  "hud-bottom": {
    name: "hud-bottom",
    type: "portal",
    portalTarget: "body",
    zIndex: 500
  },
  floating: {
    name: "floating",
    type: "portal",
    portalTarget: "body",
    zIndex: 800
  }
};
function getSlotDefinition(slot) {
  return SLOT_DEFINITIONS[slot];
}
function isPortalSlot(slot) {
  return SLOT_DEFINITIONS[slot]?.type === "portal";
}
function isInlineSlot(slot) {
  return SLOT_DEFINITIONS[slot]?.type === "inline";
}
function getSlotsByType(type) {
  return Object.entries(SLOT_DEFINITIONS).filter(([, def]) => def.type === type).map(([name]) => name);
}
function getInlineSlots() {
  return getSlotsByType("inline");
}
function getPortalSlots() {
  return getSlotsByType("portal");
}
var ALL_SLOTS = Object.keys(SLOT_DEFINITIONS);
function matchPath(pattern, path) {
  const normalizeSegment = (p) => {
    let normalized = p.trim();
    if (!normalized.startsWith("/")) normalized = "/" + normalized;
    if (normalized.length > 1 && normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  };
  const normalizedPattern = normalizeSegment(pattern);
  const normalizedPath = normalizeSegment(path);
  const patternParts = normalizedPattern.split("/").filter(Boolean);
  const pathParts = normalizedPath.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) {
    return null;
  }
  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];
    if (patternPart.startsWith(":")) {
      const paramName = patternPart.slice(1);
      params[paramName] = decodeURIComponent(pathPart);
    } else if (patternPart !== pathPart) {
      return null;
    }
  }
  return params;
}
function extractRouteParams(pattern, path) {
  return matchPath(pattern, path) || {};
}
function pathMatches(pattern, path) {
  return matchPath(pattern, path) !== null;
}
function isInlineOrbital(orbital) {
  return "name" in orbital && typeof orbital.name === "string";
}
function isInlinePage(page) {
  return typeof page === "object" && page !== null && "name" in page && typeof page.name === "string";
}
function findPageByPath(schema, path) {
  if (!schema.orbitals) return null;
  for (const orbital of schema.orbitals) {
    if (!isInlineOrbital(orbital)) continue;
    if (!orbital.pages) continue;
    for (const pageRef of orbital.pages) {
      if (!isInlinePage(pageRef)) continue;
      const page = pageRef;
      const pagePath = page.path;
      if (!pagePath) continue;
      const params = matchPath(pagePath, path);
      if (params !== null) {
        return { page, params, orbitalName: orbital.name };
      }
    }
  }
  return null;
}
function findPageByName(schema, pageName) {
  if (!schema.orbitals) return null;
  for (const orbital of schema.orbitals) {
    if (!isInlineOrbital(orbital)) continue;
    if (!orbital.pages) continue;
    for (const pageRef of orbital.pages) {
      if (!isInlinePage(pageRef)) continue;
      const page = pageRef;
      if (page.name === pageName) {
        return { page, orbitalName: orbital.name };
      }
    }
  }
  return null;
}
function getDefaultPage(schema) {
  if (!schema.orbitals) return null;
  for (const orbital of schema.orbitals) {
    if (!isInlineOrbital(orbital)) continue;
    if (!orbital.pages) continue;
    for (const pageRef of orbital.pages) {
      if (isInlinePage(pageRef)) {
        return { page: pageRef, orbitalName: orbital.name };
      }
    }
  }
  return null;
}
function getAllPages(schema) {
  const pages = [];
  if (!schema.orbitals) return pages;
  for (const orbital of schema.orbitals) {
    if (!isInlineOrbital(orbital)) continue;
    if (!orbital.pages) continue;
    for (const pageRef of orbital.pages) {
      if (isInlinePage(pageRef)) {
        pages.push({ page: pageRef, orbitalName: orbital.name });
      }
    }
  }
  return pages;
}
var NavigationContext = createContext(null);
function NavigationProvider({
  schema,
  initialPage,
  updateUrl = true,
  onNavigate,
  children
}) {
  const initialState = useMemo(() => {
    let page = null;
    let path = "/";
    if (initialPage) {
      const found = findPageByName(schema, initialPage);
      if (found) {
        page = found.page;
        path = page.path || "/";
      }
    }
    if (!page) {
      const defaultPage = getDefaultPage(schema);
      if (defaultPage) {
        page = defaultPage.page;
        path = page.path || "/";
      }
    }
    return {
      activePage: page?.name || "",
      currentPath: path,
      initPayload: {},
      navigationId: 0
    };
  }, [schema, initialPage]);
  const [state, setState] = useState(initialState);
  const navigateTo = useCallback((path, payload) => {
    const result = findPageByPath(schema, path);
    if (!result) {
      console.error(`[Navigation] No page found for path: ${path}`);
      return;
    }
    const { page, params } = result;
    const finalPayload = { ...params, ...payload };
    console.log("[Navigation] Navigating to:", {
      path,
      page: page.name,
      params,
      payload,
      finalPayload
    });
    setState((prev) => ({
      activePage: page.name,
      currentPath: path,
      initPayload: finalPayload,
      navigationId: prev.navigationId + 1
    }));
    if (updateUrl && typeof window !== "undefined") {
      try {
        window.history.pushState(finalPayload, "", path);
      } catch (e) {
        console.warn("[Navigation] Could not update URL:", e);
      }
    }
    if (onNavigate) {
      onNavigate(page.name, path, finalPayload);
    }
  }, [schema, updateUrl, onNavigate]);
  const navigateToPage = useCallback((pageName, payload) => {
    const result = findPageByName(schema, pageName);
    if (!result) {
      console.error(`[Navigation] No page found with name: ${pageName}`);
      return;
    }
    const { page } = result;
    const path = page.path || `/${pageName.toLowerCase()}`;
    console.log("[Navigation] Navigating to page:", {
      pageName,
      path,
      payload
    });
    setState((prev) => ({
      activePage: page.name,
      currentPath: path,
      initPayload: payload || {},
      navigationId: prev.navigationId + 1
    }));
    if (updateUrl && typeof window !== "undefined") {
      try {
        window.history.pushState(payload || {}, "", path);
      } catch (e) {
        console.warn("[Navigation] Could not update URL:", e);
      }
    }
    if (onNavigate) {
      onNavigate(page.name, path, payload || {});
    }
  }, [schema, updateUrl, onNavigate]);
  const contextValue = useMemo(() => ({
    state,
    navigateTo,
    navigateToPage,
    schema,
    isReady: !!state.activePage
  }), [state, navigateTo, navigateToPage, schema]);
  return /* @__PURE__ */ jsx(NavigationContext.Provider, { value: contextValue, children });
}
function useNavigation() {
  return useContext(NavigationContext);
}
function useNavigateTo() {
  const context = useContext(NavigationContext);
  const noOp = useCallback((path, _payload) => {
    console.warn(`[Navigation] navigateTo called outside NavigationProvider. Path: ${path}`);
  }, []);
  return context?.navigateTo || noOp;
}
function useNavigationState() {
  const context = useContext(NavigationContext);
  return context?.state || null;
}
function useInitPayload() {
  const context = useContext(NavigationContext);
  return context?.state.initPayload || {};
}
function useActivePage() {
  const context = useContext(NavigationContext);
  return context?.state.activePage || null;
}
function useNavigationId() {
  const context = useContext(NavigationContext);
  return context?.state.navigationId || 0;
}
function initializePatterns() {
  console.log("[PatternResolver] initializePatterns called");
  console.log("[PatternResolver] componentMappingJson:", componentMapping$1);
  console.log("[PatternResolver] registryJson keys:", Object.keys(patternsRegistry));
  const componentMappingData = componentMapping$1;
  const componentMapping2 = componentMappingData.mappings || {};
  console.log("[PatternResolver] Extracted mappings count:", Object.keys(componentMapping2).length);
  console.log("[PatternResolver] Sample mappings:", Object.keys(componentMapping2).slice(0, 5));
  const registryData = patternsRegistry;
  const patternRegistry2 = registryData.patterns || {};
  console.log("[PatternResolver] Extracted patterns count:", Object.keys(patternRegistry2).length);
  initializePatternResolver({
    componentMapping: componentMapping2,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    patternRegistry: patternRegistry2
  });
  console.log(`[PatternResolver] Initialized with ${Object.keys(componentMapping2).length} component mappings and ${Object.keys(patternRegistry2).length} pattern definitions`);
  return Object.keys(componentMapping2).length;
}

export { ALL_SLOTS, ClientEffectConfigContext, ClientEffectConfigProvider, NavigationProvider, SLOT_DEFINITIONS, createFetchedDataContext, extractRouteParams, findPageByName, findPageByPath, getAllPages, getDefaultPage, getInlineSlots, getKnownPatterns, getPatternDefinition, getPatternMapping, getPatternsByCategory, getPortalSlots, getSlotDefinition, getSlotsByType, hasEntities, initializePatternResolver, initializePatterns, isInlineSlot, isKnownPattern, isPortalSlot, matchPath, mergeDataContexts, pathMatches, resolveEntityById, resolveEntityCount, resolveEntityData, resolveEntityDataWithQuery, resolvePattern, setComponentMapping, setPatternRegistry, useActivePage, useClientEffectConfig, useClientEffectConfigOptional, useClientEffects, useInitPayload, useNavigateTo, useNavigation, useNavigationId, useNavigationState };
