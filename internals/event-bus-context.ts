'use client';
/**
 * EventBus Context Singleton
 *
 * This file is the SINGLE source of truth for EventBusContext.
 * Both EventBusProvider and useEventBus import from here.
 *
 * This prevents the dual-instance problem where Vite pre-bundles
 * @almadar/ui and @almadar/ui/providers as separate chunks,
 * each creating their own EventBusContext symbol.
 *
 * By isolating the context in its own module, all import paths
 * resolve to the same createContext call.
 */

import { createContext } from 'react';
import type { EventBusContextType } from '../hooks/event-bus-types';

/**
 * Extended context type for backward compatibility.
 */
export interface EventBusContextTypeExtended extends EventBusContextType {
  /** @deprecated Use useSelection from SelectionProvider instead. */
  getSelectedEntity: () => unknown | null;
  /** @deprecated Use useSelection from SelectionProvider instead. */
  clearSelectedEntity: () => void;
}

/**
 * The one and only EventBusContext.
 * Imported by EventBusProvider (to provide) and useEventBus (to consume).
 */
export const EventBusContext = createContext<EventBusContextTypeExtended | null>(null);
