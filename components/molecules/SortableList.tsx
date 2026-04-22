'use client';

/**
 * SortableList Molecule
 *
 * A list where items can be dragged to reorder via drag handles.
 * Uses useDragReorder for drag state management and useEventBus for event emission.
 * Shows a drop indicator line at the target position during drag.
 */
import React, { useCallback } from 'react';
import type { EventKey, EventPayload, EventPayloadValue } from "@almadar/core";
import { cn } from '../../lib/cn';
import { useEventBus } from '../../hooks/useEventBus';
import { useDragReorder } from '../../hooks/useDragReorder';
import { Box } from '../atoms/Box';
import { HStack } from '../atoms/Stack';
import { VStack } from '../atoms/Stack';
import { Icon } from '../atoms/Icon';

const EMPTY_ITEMS: never[] = [];

export interface SortableListProps<T extends EventPayloadValue = EventPayload> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  reorderEvent: EventKey;
  reorderPayload?: EventPayload;
  dragHandlePosition?: 'left' | 'right';
  className?: string;
}

function useSafeEventBus() {
  try {
    return useEventBus();
  } catch {
    return { emit: () => {}, on: () => () => {}, once: () => {} };
  }
}

function SortableListInner<T extends EventPayloadValue = EventPayload>({
  items: initialItems = EMPTY_ITEMS as T[],
  renderItem,
  reorderEvent,
  reorderPayload,
  dragHandlePosition = 'left',
  className,
}: SortableListProps<T>) {
  const eventBus = useSafeEventBus();

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number, item: T) => {
      eventBus.emit(`UI:${reorderEvent}`, {
        fromIndex,
        toIndex,
        item,
        ...reorderPayload,
      });
    },
    [eventBus, reorderEvent, reorderPayload],
  );

  const {
    items,
    dragIndex,
    dragOverIndex,
    isDragging,
    getDragHandleProps,
    getItemProps,
  } = useDragReorder<T>(initialItems, handleReorder);

  return (
    <VStack gap="none" className={cn('w-full', className)}>
      {items.map((item, index) => {
        const { 'aria-dropeffect': ariaDropEffect, ...itemProps } = getItemProps(index);
        const { 'aria-grabbed': ariaGrabbed, ...handleRest } = getDragHandleProps(index);
        const isBeingDragged = dragIndex === index;
        const showDropIndicator =
          isDragging &&
          dragOverIndex === index &&
          dragOverIndex !== dragIndex;

        const dragHandle = (
          <Box
            className={cn(
              'flex items-center justify-center',
              'text-muted-foreground',
              'hover:text-foreground',
              'transition-colors duration-100',
              'px-1',
            )}
            aria-grabbed={ariaGrabbed}
            {...handleRest}
          >
            <Icon name="grip-vertical" size="sm" />
          </Box>
        );

        return (
          <Box
            key={index}
            aria-dropeffect={ariaDropEffect as React.AriaAttributes['aria-dropeffect']}
            {...itemProps}
          >
            {/* Drop indicator line above this item */}
            {showDropIndicator && (
              <Box
                className="h-0.5 bg-primary rounded-full"
                style={{ margin: '0 8px' }}
              />
            )}

            <HStack
              gap="sm"
              align="center"
              className={cn(
                'transition-opacity duration-150',
                isBeingDragged && 'opacity-50',
              )}
            >
              {dragHandlePosition === 'left' && dragHandle}

              <Box className="flex-1 min-w-0">
                {typeof renderItem === 'function' ? renderItem(item, index) : JSON.stringify(item)}
              </Box>

              {dragHandlePosition === 'right' && dragHandle}
            </HStack>
          </Box>
        );
      })}
    </VStack>
  );
}

export const SortableList = SortableListInner as <T extends EventPayloadValue = EventPayload>(
  props: SortableListProps<T>,
) => React.ReactElement;

(SortableList as React.FC).displayName = 'SortableList';
