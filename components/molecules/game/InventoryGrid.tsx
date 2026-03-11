'use client';
import * as React from 'react';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { ItemSlot } from '../../atoms/game/ItemSlot';
import { Box } from '../../atoms/Box';

export interface InventoryGridItem {
  id: string;
  icon?: React.ReactNode;
  label?: string;
  quantity?: number;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface InventoryGridProps {
  /** Array of items to display in the grid */
  items: InventoryGridItem[];
  /** Number of columns in the grid */
  columns?: number;
  /** Total number of slots (empty slots fill remaining space) */
  totalSlots?: number;
  /** Currently selected item ID */
  selectedId?: string;
  /** Callback when an item is selected */
  onSelect?: (id: string) => void;
  /** Event bus event name for selection */
  selectEvent?: string;
  /** Size variant for all item slots */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

const columnMap = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
};

export function InventoryGrid({
  items,
  columns = 4,
  totalSlots,
  selectedId,
  onSelect,
  selectEvent,
  size = 'md',
  className,
}: InventoryGridProps) {
  const eventBus = useEventBus();

  const slotCount = totalSlots ?? items.length;
  const emptySlotCount = Math.max(0, slotCount - items.length);

  const handleSelect = React.useCallback(
    (id: string) => {
      onSelect?.(id);
      if (selectEvent) {
        eventBus.emit(selectEvent, { id });
      }
    },
    [onSelect, selectEvent, eventBus],
  );

  const gridClass =
    columnMap[columns as keyof typeof columnMap] ?? `grid-cols-${columns}`;

  return (
    <Box
      className={cn('grid gap-2', gridClass, className)}
    >
      {items.map((item) => (
        <ItemSlot
          key={item.id}
          icon={item.icon}
          label={item.label}
          quantity={item.quantity}
          rarity={item.rarity}
          size={size}
          selected={selectedId === item.id}
          onClick={() => handleSelect(item.id)}
        />
      ))}
      {Array.from({ length: emptySlotCount }).map((_, index) => (
        <ItemSlot
          key={`empty-${index}`}
          empty
          size={size}
        />
      ))}
    </Box>
  );
}

InventoryGrid.displayName = 'InventoryGrid';
