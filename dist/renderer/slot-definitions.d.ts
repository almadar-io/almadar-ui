/**
 * Slot Definitions
 *
 * Defines the available UI slots and their rendering behavior.
 * Slots are either inline (rendered in the component tree) or
 * portal (rendered to document.body via React Portal).
 *
 * @packageDocumentation
 */
import type { UISlot, SlotDefinition, SlotType } from './types';
/**
 * Definitions for all available UI slots.
 *
 * Inline slots render within the component hierarchy.
 * Portal slots render to document.body, breaking out of overflow containers.
 */
export declare const SLOT_DEFINITIONS: Record<UISlot, SlotDefinition>;
/**
 * Get the slot definition for a slot name.
 */
export declare function getSlotDefinition(slot: UISlot): SlotDefinition;
/**
 * Check if a slot is a portal slot.
 */
export declare function isPortalSlot(slot: UISlot): boolean;
/**
 * Check if a slot is an inline slot.
 */
export declare function isInlineSlot(slot: UISlot): boolean;
/**
 * Get all slots of a specific type.
 */
export declare function getSlotsByType(type: SlotType): UISlot[];
/**
 * Get all inline slots.
 */
export declare function getInlineSlots(): UISlot[];
/**
 * Get all portal slots.
 */
export declare function getPortalSlots(): UISlot[];
/**
 * All valid slot names.
 */
export declare const ALL_SLOTS: UISlot[];
