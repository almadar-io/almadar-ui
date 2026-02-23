/**
 * RepeatableFormSection
 *
 * A form section that can be repeated multiple times.
 * Used for collecting multiple entries (participants, findings, etc.)
 *
 * Enhanced with trackAddedInState for inspection audit trails.
 *
 * Event Contract:
 * - Emits: UI:SECTION_ADDED { sectionType, index, addedInState? }
 * - Emits: UI:SECTION_REMOVED { sectionType, index, itemId }
 */
import React from "react";
export interface RepeatableItem {
    id: string;
    /** State in which this item was added (for audit trails) */
    addedInState?: string;
    /** Timestamp when item was added */
    addedAt?: string;
    [key: string]: unknown;
}
export interface RepeatableFormSectionProps {
    /** Section type identifier */
    sectionType: string;
    /** Section title */
    title: string;
    /** Items in the section */
    items: RepeatableItem[];
    /** Render function for each item */
    renderItem: (item: RepeatableItem, index: number) => React.ReactNode;
    /** Minimum items required */
    minItems?: number;
    /** Maximum items allowed */
    maxItems?: number;
    /** Allow reordering */
    allowReorder?: boolean;
    /** Add button label */
    addLabel?: string;
    /** Empty state message */
    emptyMessage?: string;
    /** Read-only mode */
    readOnly?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Add handler */
    onAdd?: () => void;
    /** Remove handler */
    onRemove?: (itemId: string, index: number) => void;
    /** Reorder handler */
    onReorder?: (fromIndex: number, toIndex: number) => void;
    /** Track the state in which items are added (for inspection audit) */
    trackAddedInState?: boolean;
    /** Current inspection state (used when trackAddedInState is true) */
    currentState?: string;
    /** Show audit metadata (addedInState, addedAt) */
    showAuditInfo?: boolean;
}
export declare const RepeatableFormSection: React.FC<RepeatableFormSectionProps>;
