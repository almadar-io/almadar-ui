/**
 * Debug utilities for development
 */

const DEBUG_ENABLED = typeof window !== 'undefined' &&
  (localStorage.getItem('debug') === 'true' || process.env.NODE_ENV === 'development');

interface VerifyWindow { __ALMADAR_DEBUG_VERIFY__?: boolean }

export function isDebugEnabled(): boolean {
  if (DEBUG_ENABLED) return true;
  return typeof window !== 'undefined'
    && (window as unknown as VerifyWindow).__ALMADAR_DEBUG_VERIFY__ === true;
}

export function debug(...args: unknown[]): void {
  if (isDebugEnabled()) {
    console.log('[DEBUG]', ...args);
  }
}

export function debugGroup(label: string): void {
  if (isDebugEnabled()) {
    console.group(`[DEBUG] ${label}`);
  }
}

export function debugGroupEnd(): void {
  if (isDebugEnabled()) {
    console.groupEnd();
  }
}

export function debugWarn(...args: unknown[]): void {
  if (isDebugEnabled()) {
    console.warn('[DEBUG]', ...args);
  }
}

export function debugError(...args: unknown[]): void {
  if (isDebugEnabled()) {
    console.error('[DEBUG]', ...args);
  }
}

export function debugTable(data: unknown): void {
  if (isDebugEnabled()) {
    console.table(data);
  }
}

export function debugTime(label: string): void {
  if (isDebugEnabled()) {
    console.time(`[DEBUG] ${label}`);
  }
}

export function debugTimeEnd(label: string): void {
  if (isDebugEnabled()) {
    console.timeEnd(`[DEBUG] ${label}`);
  }
}

// =============================================================================
// Game-specific debug utilities
// =============================================================================

/**
 * Debug input events (keyboard, mouse, touch)
 * @param inputType - Type of input (e.g., 'keydown', 'keyup', 'mouse')
 * @param data - Input data to log
 */
export function debugInput(inputType: string, data: unknown): void {
  if (isDebugEnabled()) {
    console.log(`[DEBUG:INPUT] ${inputType}:`, data);
  }
}

/**
 * Debug collision events between entities
 * @param entityA - First entity in collision
 * @param entityB - Second entity in collision
 * @param details - Additional collision details
 */
export function debugCollision(
  entityA: { id?: string; type?: string },
  entityB: { id?: string; type?: string },
  details?: unknown
): void {
  if (isDebugEnabled()) {
    console.log(
      `[DEBUG:COLLISION] ${entityA.type || entityA.id} <-> ${entityB.type || entityB.id}`,
      details ?? ''
    );
  }
}

/**
 * Debug physics updates (position, velocity)
 * @param entityId - Entity identifier
 * @param physics - Physics data to log
 */
export function debugPhysics(entityId: string, physics: unknown): void {
  if (isDebugEnabled()) {
    console.log(`[DEBUG:PHYSICS] ${entityId}:`, physics);
  }
}

/**
 * Debug game state changes
 * @param stateName - Name of the state that changed
 * @param value - New state value
 */
export function debugGameState(stateName: string, value: unknown): void {
  if (isDebugEnabled()) {
    console.log(`[DEBUG:GAME_STATE] ${stateName}:`, value);
  }
}
