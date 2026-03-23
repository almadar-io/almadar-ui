/**
 * avl-3d-context.ts
 *
 * React context for AVL 3D model overrides and configuration.
 * Allows replacing primitive geometry with custom GLB/GLTF models.
 *
 * @packageDocumentation
 */

import { createContext, useContext } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Avl3DModelOverrides {
  /** GLB URL for orbital nodes (replaces sphere) */
  orbital?: string;
  /** GLB URL for entity core (replaces icosahedron) */
  entity?: string;
  /** GLB URL for state nodes (replaces sphere) */
  state?: string;
  /** GLB URL for guard gates (replaces octahedron) */
  guard?: string;
  /** GLB URL for page portals (replaces plane) */
  page?: string;
}

export interface Avl3DConfig {
  /** Custom 3D model URLs to replace default primitive geometry */
  modelOverrides: Avl3DModelOverrides;
  /** Whether postprocessing effects are enabled */
  effectsEnabled: boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const DEFAULT_CONFIG: Avl3DConfig = {
  modelOverrides: {},
  effectsEnabled: true,
};

export const Avl3DContext = createContext<Avl3DConfig>(DEFAULT_CONFIG);

/**
 * Access the current AVL 3D configuration.
 * Returns model overrides and effect settings.
 */
export function useAvl3DConfig(): Avl3DConfig {
  return useContext(Avl3DContext);
}
