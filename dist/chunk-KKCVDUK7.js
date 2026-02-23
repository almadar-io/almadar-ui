import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// lib/cn.ts
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// lib/debug.ts
var DEBUG_ENABLED = typeof window !== "undefined" && (localStorage.getItem("debug") === "true" || process.env.NODE_ENV === "development");
function isDebugEnabled() {
  return DEBUG_ENABLED;
}
function debug(...args) {
  if (DEBUG_ENABLED) {
    console.log("[DEBUG]", ...args);
  }
}
function debugGroup(label) {
  if (DEBUG_ENABLED) {
    console.group(`[DEBUG] ${label}`);
  }
}
function debugGroupEnd() {
  if (DEBUG_ENABLED) {
    console.groupEnd();
  }
}
function debugWarn(...args) {
  if (DEBUG_ENABLED) {
    console.warn("[DEBUG]", ...args);
  }
}
function debugError(...args) {
  if (DEBUG_ENABLED) {
    console.error("[DEBUG]", ...args);
  }
}
function debugTable(data) {
  if (DEBUG_ENABLED) {
    console.table(data);
  }
}
function debugTime(label) {
  if (DEBUG_ENABLED) {
    console.time(`[DEBUG] ${label}`);
  }
}
function debugTimeEnd(label) {
  if (DEBUG_ENABLED) {
    console.timeEnd(`[DEBUG] ${label}`);
  }
}
function debugInput(inputType, data) {
  if (DEBUG_ENABLED) {
    console.log(`[DEBUG:INPUT] ${inputType}:`, data);
  }
}
function debugCollision(entityA, entityB, details) {
  if (DEBUG_ENABLED) {
    console.log(
      `[DEBUG:COLLISION] ${entityA.type || entityA.id} <-> ${entityB.type || entityB.id}`,
      details ?? ""
    );
  }
}
function debugPhysics(entityId, physics) {
  if (DEBUG_ENABLED) {
    console.log(`[DEBUG:PHYSICS] ${entityId}:`, physics);
  }
}
function debugGameState(stateName, value) {
  if (DEBUG_ENABLED) {
    console.log(`[DEBUG:GAME_STATE] ${stateName}:`, value);
  }
}

// lib/getNestedValue.ts
function getNestedValue(obj, path) {
  if (obj === null || obj === void 0) {
    return void 0;
  }
  if (!path.includes(".")) {
    return obj[path];
  }
  const parts = path.split(".");
  let value = obj;
  for (const part of parts) {
    if (value === null || value === void 0) {
      return void 0;
    }
    if (typeof value !== "object") {
      return void 0;
    }
    value = value[part];
  }
  return value;
}
function formatNestedFieldLabel(path) {
  const lastPart = path.includes(".") ? path.split(".").pop() : path;
  return lastPart.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).replace(/Id$/, "").trim();
}

export { cn, debug, debugCollision, debugError, debugGameState, debugGroup, debugGroupEnd, debugInput, debugPhysics, debugTable, debugTime, debugTimeEnd, debugWarn, formatNestedFieldLabel, getNestedValue, isDebugEnabled };
