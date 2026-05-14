'use client';
/**
 * useDataDnd — shared drag-drop machinery for DataList + DataGrid.
 *
 * Both primitives expose six identical drag-drop props:
 *   - dragGroup?:      string   items in this container announce this group when picked up
 *   - accepts?:        string   this container accepts drops whose dragGroup matches (or "*" for any)
 *   - sortable?:       boolean  enable in-container reorder
 *   - dropEvent?:      EventKey bus event on cross-container drop: { id, sourceGroup, targetGroup, newIndex }
 *   - reorderEvent?:   EventKey bus event on in-container reorder: { id, oldIndex, newIndex }
 *   - dndItemIdField?: string   row field used as the @dnd-kit draggable id (default "id")
 *
 * Architecture
 *   - A container that opts in via any dnd prop becomes a "zone".
 *   - The first ancestor zone in the tree creates the DndContext (the "root").
 *   - Inner zones detect the root via React context and skip creating their own.
 *   - The root's onDragEnd reads source + target zone metadata off the dragged
 *     item and the drop target, dispatches to the bus accordingly.
 */
import React from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { EntityRow, EventKey } from '@almadar/core';
import { useEventBus } from '../../hooks/useEventBus';
import { Box } from '../atoms/Box';

export interface DataDndProps {
  dragGroup?: string;
  accepts?: string;
  sortable?: boolean;
  dropEvent?: EventKey;
  reorderEvent?: EventKey;
  dndItemIdField?: string;
}

interface ZoneMeta {
  group: string;
  dropEvent?: EventKey;
  reorderEvent?: EventKey;
  itemIds: UniqueIdentifier[];
}

interface RootContext {
  registerZone: (zoneId: string, meta: ZoneMeta) => void;
  unregisterZone: (zoneId: string) => void;
}

const RootCtx = React.createContext<RootContext | null>(null);

interface UseDataDndArgs<T extends EntityRow> extends DataDndProps {
  items: readonly T[];
  layout: 'list' | 'grid';
}

interface UseDataDndResult<T extends EntityRow> {
  enabled: boolean;
  wrapContainer: (children: React.ReactNode) => React.ReactNode;
  SortableItem: React.FC<{ id: UniqueIdentifier; children: React.ReactNode }>;
  orderedItems: readonly T[];
}

export function useDataDnd<T extends EntityRow>(
  args: UseDataDndArgs<T>,
): UseDataDndResult<T> {
  const {
    dragGroup,
    accepts,
    sortable,
    dropEvent,
    reorderEvent,
    dndItemIdField = 'id',
    items,
    layout,
  } = args;

  const enabled = Boolean(dragGroup || accepts || sortable);
  const eventBus = useEventBus();
  const parentRoot = React.useContext(RootCtx);
  const isRoot = enabled && parentRoot === null;

  // Visual reorder state — applied immediately so the user sees the drop land,
  // cleared when fresh items arrive from the trait's persist round-trip.
  const [localOrder, setLocalOrder] = React.useState<readonly T[] | null>(null);
  const orderedItems = localOrder ?? items;

  React.useEffect(() => {
    setLocalOrder(null);
  }, [items]);

  const itemIds = React.useMemo<UniqueIdentifier[]>(
    () =>
      orderedItems.map((it, idx) => {
        const raw = (it as Record<string, unknown>)[dndItemIdField];
        return (raw as string | number | undefined) ?? `__idx_${idx}`;
      }),
    [orderedItems, dndItemIdField],
  );

  // Root maintains a registry of zones so onDragEnd can resolve source/target
  // groups + event names. Inner zones populate it via the registerZone callback.
  const zonesRef = React.useRef<Map<string, ZoneMeta>>(new Map());
  const registerZone = React.useCallback((zoneId: string, meta: ZoneMeta) => {
    zonesRef.current.set(zoneId, meta);
  }, []);
  const unregisterZone = React.useCallback((zoneId: string) => {
    zonesRef.current.delete(zoneId);
  }, []);

  const zoneId = React.useId();
  const ownGroup = dragGroup ?? accepts ?? zoneId;
  const meta: ZoneMeta = React.useMemo(
    () => ({ group: ownGroup, dropEvent, reorderEvent, itemIds }),
    [ownGroup, dropEvent, reorderEvent, itemIds],
  );

  React.useEffect(() => {
    const target = isRoot ? null : parentRoot;
    if (!target) {
      // Self-register so the root's onDragEnd can find this zone by group.
      // (Only meaningful when this zone IS the root and has its own items.)
      zonesRef.current.set(zoneId, meta);
      return () => zonesRef.current.delete(zoneId);
    }
    target.registerZone(zoneId, meta);
    return () => target.unregisterZone(zoneId);
  }, [parentRoot, isRoot, zoneId, meta]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const findZoneByItem = React.useCallback(
    (id: UniqueIdentifier): ZoneMeta | undefined => {
      for (const z of zonesRef.current.values()) {
        if (z.itemIds.includes(id)) return z;
      }
      return undefined;
    },
    [],
  );

  const findZoneByGroup = React.useCallback(
    (group: string): ZoneMeta | undefined => {
      for (const z of zonesRef.current.values()) {
        if (z.group === group) return z;
      }
      return undefined;
    },
    [],
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const sourceZone = findZoneByItem(active.id);
      // The drop target's group is announced by the SortableItem / DropZone wrappers
      const overData = over.data?.current as { dndGroup?: string } | undefined;
      const targetGroup = overData?.dndGroup;
      if (!sourceZone || !targetGroup) return;
      const targetZone = findZoneByGroup(targetGroup);
      if (!targetZone) return;

      if (sourceZone.group !== targetZone.group) {
        // Cross-container drop — fire dropEvent on the TARGET zone
        if (targetZone.dropEvent) {
          const newIndex = targetZone.itemIds.indexOf(over.id);
          eventBus.emit(targetZone.dropEvent, {
            id: String(active.id),
            sourceGroup: sourceZone.group,
            targetGroup: targetZone.group,
            newIndex: newIndex === -1 ? targetZone.itemIds.length : newIndex,
          });
        }
        return;
      }

      // In-container reorder
      const oldIndex = sourceZone.itemIds.indexOf(active.id);
      const newIndex = sourceZone.itemIds.indexOf(over.id);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      // Apply visual reorder if this is the same zone we own
      if (sourceZone.group === ownGroup) {
        const reordered = arrayMove(orderedItems as T[], oldIndex, newIndex);
        setLocalOrder(reordered);
      }
      if (sourceZone.reorderEvent) {
        eventBus.emit(sourceZone.reorderEvent, {
          id: String(active.id),
          oldIndex,
          newIndex,
        });
      }
    },
    [orderedItems, ownGroup, findZoneByItem, findZoneByGroup, eventBus],
  );

  const SortableItem: React.FC<{ id: UniqueIdentifier; children: React.ReactNode }> = React.useCallback(
    ({ id, children }) => {
      const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
      } = useSortable({ id, data: { dndGroup: ownGroup } });
      const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        cursor: enabled ? 'grab' : undefined,
      };
      return (
        <Box
          className="touch-none"
          ref={setNodeRef as React.Ref<HTMLDivElement>}
          style={style}
          {...attributes}
          {...listeners}
        >
          {children}
        </Box>
      );
    },
    [ownGroup, enabled],
  );

  const DropZoneShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: `dnd-zone-${zoneId}`,
      data: { dndGroup: ownGroup },
    });
    return (
      <Box
        ref={setNodeRef as React.Ref<HTMLDivElement>}
        className={isOver ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : undefined}
      >
        {children}
      </Box>
    );
  };

  const rootContextValue: RootContext = React.useMemo(
    () => ({ registerZone, unregisterZone }),
    [registerZone, unregisterZone],
  );

  const wrapContainer = React.useCallback(
    (children: React.ReactNode): React.ReactNode => {
      if (!enabled) return children;
      const strategy = layout === 'grid' ? rectSortingStrategy : verticalListSortingStrategy;
      const inner = (
        <DropZoneShell>
          <SortableContext items={itemIds} strategy={strategy}>
            {children}
          </SortableContext>
        </DropZoneShell>
      );
      if (isRoot) {
        return (
          <RootCtx.Provider value={rootContextValue}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              {inner}
            </DndContext>
          </RootCtx.Provider>
        );
      }
      return inner;
    },
    [enabled, layout, sensors, handleDragEnd, itemIds, isRoot, rootContextValue],
  );

  return {
    enabled,
    wrapContainer,
    SortableItem,
    orderedItems,
  };
}
