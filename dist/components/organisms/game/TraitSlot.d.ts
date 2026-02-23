/**
 * TraitSlot Component
 *
 * A generic equippable slot with drag-and-drop support.
 * Shows a TraitStateViewer tooltip on hover for equipped items.
 * Used across game tiers:
 * - Sequencer (5-8): action slots in the sequence bar
 * - Event Handler (9-12): rule slots on world objects
 * - State Architect (13+): transition slots on state nodes
 *
 * **State categories (closed-circuit compliant):**
 * - Data (equippedItem, slotNumber, locked, selected, feedback) → received via props
 * - UI-transient (isHovered, isDragOver) → local only
 * - Events → emitted via `useEventBus()` (click, remove)
 *
 * Local state is hover/drag-over detection only — rendering-only concerns.
 *
 * @packageDocumentation
 */
import React from 'react';
import { type TraitStateMachineDefinition } from './TraitStateViewer';
/** Data shape for a slot's equipped item */
export interface SlotItemData {
    id: string;
    name: string;
    category: string;
    description?: string;
    /** Emoji or text icon */
    iconEmoji?: string;
    /** Image URL icon (takes precedence over iconEmoji) */
    iconUrl?: string;
    /** Optional state machine for tooltip display */
    stateMachine?: TraitStateMachineDefinition;
}
export interface TraitSlotProps {
    /** Slot index (1-based) */
    slotNumber: number;
    /** Currently equipped item, if any */
    equippedItem?: SlotItemData;
    /** Whether slot is locked */
    locked?: boolean;
    /** Label shown when locked */
    lockLabel?: string;
    /** Whether slot is selected */
    selected?: boolean;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Show tooltip on hover */
    showTooltip?: boolean;
    /** Category → color mapping */
    categoryColors?: Record<string, {
        bg: string;
        border: string;
    }>;
    /** Optional tooltip frame image URL */
    tooltipFrameUrl?: string;
    /** Additional CSS classes */
    className?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Called when an item is dropped on this slot */
    onItemDrop?: (item: SlotItemData) => void;
    /** Whether this slot's equipped item is draggable */
    draggable?: boolean;
    /** Called when drag starts from this slot */
    onDragStart?: (item: SlotItemData) => void;
    /** Per-slot correctness feedback after a failed attempt */
    feedback?: 'correct' | 'wrong' | null;
    /** Click handler */
    onClick?: () => void;
    /** Remove handler */
    onRemove?: () => void;
    /** Emits UI:{clickEvent} with { slotNumber } */
    clickEvent?: string;
    /** Emits UI:{removeEvent} with { slotNumber } */
    removeEvent?: string;
}
export declare function TraitSlot({ slotNumber, equippedItem, locked, lockLabel, selected, size, showTooltip, categoryColors, tooltipFrameUrl, className, feedback, onItemDrop, draggable, onDragStart, onClick, onRemove, clickEvent, removeEvent, }: TraitSlotProps): React.JSX.Element;
export declare namespace TraitSlot {
    var displayName: string;
}
export default TraitSlot;
