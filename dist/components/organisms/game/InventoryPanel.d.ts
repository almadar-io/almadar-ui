/**
 * InventoryPanel Component
 *
 * Grid-based inventory UI with item selection and tooltips.
 *
 * **State categories (closed-circuit compliant):**
 * - Data (items, slots, selectedSlot) → received via props
 * - UI-transient (hoveredSlot, tooltipPosition) → local only
 * - Events → emitted via `useEventBus()` (selectSlot, useItem, dropItem)
 *
 * Local state is hover/tooltip only — rendering-only concerns.
 */
import React from 'react';
export interface InventoryItem {
    id: string;
    type: string;
    quantity: number;
    sprite?: string;
    name?: string;
    description?: string;
}
export interface InventoryPanelProps {
    /** Array of items in inventory */
    items: InventoryItem[];
    /** Total number of slots */
    slots: number;
    /** Number of columns in grid */
    columns: number;
    /** Currently selected slot index */
    selectedSlot?: number;
    /** Called when a slot is selected */
    onSelectSlot?: (index: number) => void;
    /** Called when an item is used (double-click or Enter) */
    onUseItem?: (item: InventoryItem) => void;
    /** Called when an item is dropped */
    onDropItem?: (item: InventoryItem) => void;
    /** Declarative event: emits UI:{selectSlotEvent} with { index } when a slot is selected */
    selectSlotEvent?: string;
    /** Declarative event: emits UI:{useItemEvent} with { item } when an item is used */
    useItemEvent?: string;
    /** Declarative event: emits UI:{dropItemEvent} with { item } when an item is dropped */
    dropItemEvent?: string;
    /** Show item tooltips on hover */
    showTooltips?: boolean;
    /** Optional className */
    className?: string;
    /** Slot size in pixels */
    slotSize?: number;
}
/**
 * Inventory panel component with grid layout
 *
 * @example
 * ```tsx
 * <InventoryPanel
 *   items={playerInventory}
 *   slots={20}
 *   columns={5}
 *   selectedSlot={selectedSlot}
 *   onSelectSlot={setSelectedSlot}
 *   onUseItem={(item) => console.log('Used:', item.name)}
 *   showTooltips
 * />
 * ```
 */
export declare function InventoryPanel({ items, slots, columns, selectedSlot, onSelectSlot, onUseItem, onDropItem, selectSlotEvent, useItemEvent, dropItemEvent, showTooltips, className, slotSize, }: InventoryPanelProps): React.JSX.Element;
export default InventoryPanel;
