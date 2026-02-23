// stores/filtering.ts
function getDateString(value) {
  if (!value) return null;
  if (typeof value === "string") {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
  }
  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }
  return null;
}
function matchesFilter(record, filter) {
  const fieldToCompare = filter.targetField || filter.field;
  const recordValue = record[fieldToCompare];
  const filterValue = filter.value;
  const operator = filter.operator || "eq";
  if (filterValue === null || filterValue === void 0 || filterValue === "") {
    return true;
  }
  switch (operator) {
    case "eq":
      if (typeof recordValue === "string" && typeof filterValue === "string") {
        return recordValue.toLowerCase() === filterValue.toLowerCase();
      }
      return recordValue === filterValue;
    case "contains":
      if (typeof recordValue !== "string") return false;
      return recordValue.toLowerCase().includes(String(filterValue).toLowerCase());
    case "in":
      if (Array.isArray(filterValue)) {
        const normalizedFilterValues = filterValue.map(
          (v) => typeof v === "string" ? v.toLowerCase() : v
        );
        const normalizedRecordValue = typeof recordValue === "string" ? recordValue.toLowerCase() : recordValue;
        return normalizedFilterValues.includes(normalizedRecordValue);
      }
      return false;
    case "date_eq": {
      const recordDate = getDateString(recordValue);
      const filterDate = getDateString(filterValue);
      return Boolean(recordDate && filterDate && recordDate === filterDate);
    }
    case "date_gte": {
      const recordDate = getDateString(recordValue);
      const filterDate = getDateString(filterValue);
      return Boolean(recordDate && filterDate && recordDate >= filterDate);
    }
    case "date_lte": {
      const recordDate = getDateString(recordValue);
      const filterDate = getDateString(filterValue);
      return Boolean(recordDate && filterDate && recordDate <= filterDate);
    }
    case "search": {
      if (typeof filterValue !== "string" || !filterValue.trim()) {
        return true;
      }
      const searchTerm = filterValue.toLowerCase();
      return Object.values(record).some((value) => {
        if (value === null || value === void 0) return false;
        return String(value).toLowerCase().includes(searchTerm);
      });
    }
    default:
      return true;
  }
}
function applyFilters(records, entityFilters) {
  if (entityFilters.size === 0) return records;
  return records.filter((record) => {
    for (const [, filter] of entityFilters) {
      if (!matchesFilter(record, filter)) {
        return false;
      }
    }
    return true;
  });
}
function createFilter(field, value, operator = "eq", targetField) {
  return {
    field,
    value,
    operator,
    targetField: targetField || field
  };
}

// stores/entityStore.ts
var entities = /* @__PURE__ */ new Map();
var filters = /* @__PURE__ */ new Map();
var listeners = /* @__PURE__ */ new Set();
var idCounter = 0;
function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function notify() {
  listeners.forEach((listener) => listener());
}
function getEntities() {
  return entities;
}
function getEntity(id) {
  return entities.get(id);
}
function getByType(type) {
  const types = Array.isArray(type) ? type : [type];
  return [...entities.values()].filter((e) => types.includes(e.type));
}
function getAllEntities() {
  return [...entities.values()];
}
function getSingleton(type) {
  return [...entities.values()].find((e) => e.type === type);
}
function spawnEntity(config) {
  const id = config.id ?? `entity_${++idCounter}`;
  const entity = { ...config, id };
  entities = new Map(entities);
  entities.set(id, entity);
  notify();
  return id;
}
function updateEntity(id, updates) {
  const entity = entities.get(id);
  if (entity) {
    entities = new Map(entities);
    entities.set(id, { ...entity, ...updates });
    notify();
  }
}
function updateSingleton(type, updates) {
  const entity = getSingleton(type);
  if (entity) {
    updateEntity(entity.id, updates);
  }
}
function removeEntity(id) {
  if (entities.has(id)) {
    entities = new Map(entities);
    entities.delete(id);
    notify();
  }
}
function clearEntities() {
  entities = /* @__PURE__ */ new Map();
  notify();
}
function setFilter(entityType, field, value, operator = "eq", targetField) {
  filters = new Map(filters);
  const entityFilters = new Map(filters.get(entityType) || []);
  entityFilters.set(field, createFilter(field, value, operator, targetField));
  filters.set(entityType, entityFilters);
  notify();
}
function clearFilter(entityType, field) {
  const entityFilters = filters.get(entityType);
  if (entityFilters && entityFilters.has(field)) {
    filters = new Map(filters);
    const newFilters = new Map(entityFilters);
    newFilters.delete(field);
    filters.set(entityType, newFilters);
    notify();
  }
}
function clearAllFilters(entityType) {
  if (filters.has(entityType)) {
    filters = new Map(filters);
    filters.set(entityType, /* @__PURE__ */ new Map());
    notify();
  }
}
function getFilters(entityType) {
  return filters.get(entityType) || /* @__PURE__ */ new Map();
}
function getByTypeFiltered(type) {
  const types = Array.isArray(type) ? type : [type];
  let result = [...entities.values()].filter((e) => types.includes(e.type));
  for (const t of types) {
    const typeFilters = filters.get(t);
    if (typeFilters && typeFilters.size > 0) {
      result = applyFilters(result, typeFilters);
    }
  }
  return result;
}
function getSnapshot() {
  return entities;
}
function getFilterSnapshot() {
  return filters;
}

export { applyFilters, clearAllFilters, clearEntities, clearFilter, createFilter, getAllEntities, getByType, getByTypeFiltered, getDateString, getEntities, getEntity, getFilterSnapshot, getFilters, getSingleton, getSnapshot, matchesFilter, removeEntity, setFilter, spawnEntity, subscribe, updateEntity, updateSingleton };
