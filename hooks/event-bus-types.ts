/**
 * Event Bus Types
 *
 * Re-exports from @almadar/core so every package agrees on the same
 * bus event envelope. @almadar/ui no longer owns its own KFlowEvent —
 * that type was folded into core's BusEvent.
 *
 * @packageDocumentation
 */

import type {
  BusEvent,
  BusEventSource,
  BusEventListener,
  Unsubscribe,
} from "@almadar/core";

export type { BusEvent, BusEventSource, Unsubscribe };
export type EventListener = BusEventListener;

/**
 * Event bus context type.
 *
 * `emit` accepts `Record<string, unknown>` on its public surface so
 * generic UI components (DataGrid, SortableList, ...) can pass
 * consumer-defined row data without a cast at every emit site. The
 * envelope stored in `BusEvent.payload` is narrowed to `EventPayload`
 * inside the bus implementation — listeners always receive the typed
 * shape.
 */
export interface EventBusContextType {
  /**
   * Emit an event to all listeners.
   *
   * @param type - Event type identifier
   * @param payload - Optional payload data (object-shaped)
   * @param source - Optional origin info (orbital/trait/...)
   */
  emit: (type: string, payload?: Record<string, unknown>, source?: BusEventSource) => void;

  /**
   * Subscribe to an event type.
   *
   * @param type - Event type to listen for
   * @param listener - Callback function
   * @returns Unsubscribe function
   */
  on: (type: string, listener: BusEventListener) => Unsubscribe;

  /**
   * Subscribe to an event type, but only fire once.
   *
   * @param type - Event type to listen for
   * @param listener - Callback function
   * @returns Unsubscribe function
   */
  once: (type: string, listener: BusEventListener) => Unsubscribe;

  /**
   * Check if there are any listeners for an event type.
   *
   * @param type - Event type to check
   * @returns True if there are listeners
   */
  hasListeners: (type: string) => boolean;

  /**
   * Subscribe to ALL events regardless of type.
   * Useful for verification, debugging, and analytics.
   *
   * @param listener - Callback function invoked for every emitted event
   * @returns Unsubscribe function
   */
  onAny?: (listener: BusEventListener) => Unsubscribe;
}
