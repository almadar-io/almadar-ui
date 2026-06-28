'use client';
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

import React, { useState, useCallback } from 'react';
import type { EventEmit, EventPayload } from "@almadar/core";
import { cn } from '../../../../lib/cn';
import { useEventBus } from '../../../../hooks/useEventBus';

export type InventoryItem = EventPayload & {
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
  selectSlotEvent?: EventEmit<{ index: number }>;
  /** Declarative event: emits UI:{useItemEvent} with { item: InventoryItem } when an item is used */
  useItemEvent?: EventEmit<{ item: InventoryItem }>;
  /** Declarative event: emits UI:{dropItemEvent} with { item: InventoryItem } when an item is dropped */
  dropItemEvent?: EventEmit<{ item: InventoryItem }>;
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
const DEFAULT_INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'item-1', type: 'weapon', name: 'Iron Sword', quantity: 1, description: 'A sturdy iron blade.' },
  { id: 'item-2', type: 'potion', name: 'Health Potion', quantity: 3, description: 'Restores 50 HP.' },
  { id: 'item-3', type: 'armor', name: 'Leather Helm', quantity: 1, description: 'Light head protection.' },
];

export function InventoryPanel({
  items = DEFAULT_INVENTORY_ITEMS,
  slots = 12,
  columns = 4,
  selectedSlot,
  onSelectSlot,
  onUseItem,
  onDropItem,
  selectSlotEvent,
  useItemEvent,
  dropItemEvent,
  showTooltips = true,
  className,
  slotSize = 48,
}: InventoryPanelProps): React.JSX.Element {
  const eventBus = useEventBus();
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Defensive: ensure items is always a valid array even if props are malformed
  const safeItems = Array.isArray(items) ? items : [];
  const safeSlots = typeof slots === 'number' && slots > 0 ? slots : 0;
  const safeColumns = typeof columns === 'number' && columns > 0 ? columns : 1;

  // Create slot array with items mapped to indices
  const slotArray = Array.from({ length: safeSlots }, (_, index) => {
    return safeItems[index] ?? null;
  });

  const rows = Math.ceil(safeSlots / safeColumns);

  const handleSlotClick = useCallback((index: number) => {
    if (selectSlotEvent) eventBus.emit(`UI:${selectSlotEvent}`, { index });
    onSelectSlot?.(index);
  }, [onSelectSlot, selectSlotEvent, eventBus]);

  const handleSlotDoubleClick = useCallback((index: number) => {
    const item = slotArray[index];
    if (item) {
      if (useItemEvent) eventBus.emit(`UI:${useItemEvent}`, { item });
      onUseItem?.(item);
    }
  }, [slotArray, onUseItem, useItemEvent, eventBus]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    const item = slotArray[index];

    switch (e.key) {
      case 'Enter':
      case ' ':
        if (item) {
          e.preventDefault();
          if (useItemEvent) eventBus.emit(`UI:${useItemEvent}`, { item });
          onUseItem?.(item);
        }
        break;
      case 'Delete':
      case 'Backspace':
        if (item) {
          e.preventDefault();
          if (dropItemEvent) eventBus.emit(`UI:${dropItemEvent}`, { item });
          onDropItem?.(item);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        onSelectSlot?.(Math.min(index + 1, safeSlots - 1));
        break;
      case 'ArrowLeft':
        e.preventDefault();
        onSelectSlot?.(Math.max(index - 1, 0));
        break;
      case 'ArrowDown':
        e.preventDefault();
        onSelectSlot?.(Math.min(index + safeColumns, safeSlots - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        onSelectSlot?.(Math.max(index - safeColumns, 0));
        break;
    }
  }, [slotArray, onUseItem, onDropItem, onSelectSlot, safeColumns, safeSlots, useItemEvent, dropItemEvent, eventBus]);

  const handleMouseEnter = useCallback((e: React.MouseEvent, index: number) => {
    if (showTooltips && slotArray[index]) {
      setHoveredSlot(index);
      setTooltipPosition({
        x: e.clientX + 10,
        y: e.clientY + 10,
      });
    }
  }, [showTooltips, slotArray]);

  const handleMouseLeave = useCallback(() => {
    setHoveredSlot(null);
  }, []);

  const hoveredItem = hoveredSlot !== null ? slotArray[hoveredSlot] : null;

  return (
    <div className={cn('relative', className)}>
      {/* Inventory Grid */}
      <div
        className="grid gap-1 bg-[var(--color-card)] p-2 rounded-container border border-border"
        style={{
          gridTemplateColumns: `repeat(${safeColumns}, ${slotSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${slotSize}px)`,
        }}
      >
        {slotArray.map((item, index) => (
          <button
            key={index}
            type="button"
            className={cn(
              'relative flex items-center justify-center',
              'bg-[var(--color-card)] border rounded transition-colors',
              'hover:bg-[var(--color-surface,#374151)] focus:outline-none focus:ring-2 focus:ring-info',
              selectedSlot === index
                ? 'border-warning bg-[var(--color-surface,#374151)]'
                : 'border-muted'
            )}
            style={{ width: slotSize, height: slotSize }}
            onClick={() => handleSlotClick(index)}
            onDoubleClick={() => handleSlotDoubleClick(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onMouseEnter={(e) => handleMouseEnter(e, index)}
            onMouseLeave={handleMouseLeave}
            tabIndex={0}
            aria-label={item ? `${item.name || item.type || 'Item'}, quantity: ${item.quantity}` : `Empty slot ${index + 1}`}
          >
            {item && (
              <>
                {/* Item sprite or placeholder */}
                {item.sprite ? (
                  <img
                    src={item.sprite}
                    alt={item.name || item.type || 'Item'}
                    className="w-8 h-8 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : (
                  <div className="w-8 h-8 bg-muted rounded-interactive flex items-center justify-center text-xs text-muted-foreground">
                    {(item.type ?? item.name ?? 'I').charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Quantity badge */}
                {item.quantity > 1 && (
                  <span className="absolute bottom-0 right-0 bg-background/70 text-foreground text-xs px-1 rounded-tl">
                    {item.quantity}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </div>

      {/* Tooltip */}
      {showTooltips && hoveredItem && (
        <div
          className="fixed z-50 bg-[var(--color-card)] border border-border rounded-container p-2 shadow-elevation-card pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            maxWidth: 200,
          }}
        >
          <div className="font-semibold text-[var(--color-foreground)]">
            {hoveredItem.name || hoveredItem.type}
          </div>
          {hoveredItem.description && (
            <div className="text-sm text-muted-foreground mt-1">
              {hoveredItem.description}
            </div>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            Quantity: {hoveredItem.quantity}
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryPanel;
