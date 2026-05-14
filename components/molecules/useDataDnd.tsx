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
  closestCorners,
  pointerWithin,
  rectIntersection,
  useDroppable,
  type CollisionDetection,
  type DragCancelEvent,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { createLogger } from '@almadar/logger';

const dndLog = createLogger('almadar:ui:dnd');
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
  /**
   * Mark this container as the DnD root for its subtree. Use on an outer
   * container (e.g. a data-grid hosting inner data-lists) when the container
   * itself is NOT a drop target or sortable, but descendant zones need to
   * share one DndContext so items can be dragged between them. Inner zones
   * with `accepts` / `dragGroup` / `sortable` detect this root and skip
   * creating their own DndContext.
   */
  dndRoot?: boolean;
}

interface ZoneMeta {
  group: string;
  dropEvent?: EventKey;
  reorderEvent?: EventKey;
  itemIds: UniqueIdentifier[];
}

interface ActiveDrag {
  /** Source zone's group key — used by other zones to decide whether to show a Trello-style placeholder slot when hovering. */
  sourceGroup: string;
  /** Measured pixel height of the source item — placeholder slot uses this to reserve the right visual space. */
  height: number;
}

interface RootContext {
  registerZone: (zoneId: string, meta: ZoneMeta) => void;
  unregisterZone: (zoneId: string) => void;
  /** Currently-active drag info; null when nothing is being dragged. Exposed so DropZoneShell can show a placeholder slot for cross-zone drops. */
  activeDrag: ActiveDrag | null;
  /** Group of the zone currently being hovered, derived from over.data.dndGroup in onDragOver. Used by DropZoneShell because @dnd-kit's `isOver` returns false on the zone shell when the pointer is over an inner SortableItem (the item is its own droppable). */
  overZoneGroup: string | null;
}

const RootCtx = React.createContext<RootContext | null>(null);

interface UseDataDndArgs<T extends EntityRow> extends DataDndProps {
  items: readonly T[];
  layout: 'list' | 'grid';
}

interface UseDataDndResult<T extends EntityRow> {
  enabled: boolean;
  /** True when this container is a sortable zone (own items are draggable). False in dndRoot-only mode. */
  isZone: boolean;
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
    dndRoot,
    items,
    layout,
  } = args;

  const isZone = Boolean(dragGroup || accepts || sortable);
  const enabled = isZone || Boolean(dndRoot);
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

  // Memoize itemIds by content signature so the array reference is stable
  // across renders when IDs don't change. dnd-kit's SortableContext keeps
  // measuring the rect of each item on every items-prop change — a fresh
  // array each render means infinite measure loops on multi-list pages.
  const itemIdsSignature = orderedItems
    .map((it, idx) => {
      const raw = (it as Record<string, unknown>)[dndItemIdField];
      return String((raw as string | number | undefined) ?? `__idx_${idx}`);
    })
    .join('|');
  const itemIds = React.useMemo<UniqueIdentifier[]>(
    () =>
      orderedItems.map((it, idx) => {
        const raw = (it as Record<string, unknown>)[dndItemIdField];
        return (raw as string | number | undefined) ?? `__idx_${idx}`;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itemIdsSignature],
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

  // Root tracks the currently-dragging item's source group + measured height
  // so foreign zones can render a Trello-style placeholder slot of the right
  // size while the user hovers over them.
  const [activeDrag, setActiveDrag] = React.useState<ActiveDrag | null>(null);
  const [overZoneGroup, setOverZoneGroup] = React.useState<string | null>(null);

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
      dndLog.debug('zone:register:self', { zoneId, group: meta.group, itemCount: meta.itemIds.length, isRoot });
      return () => {
        zonesRef.current.delete(zoneId);
        dndLog.debug('zone:unregister:self', { zoneId, group: meta.group });
      };
    }
    target.registerZone(zoneId, meta);
    dndLog.debug('zone:register', { zoneId, group: meta.group, itemCount: meta.itemIds.length, dropEvent: meta.dropEvent, reorderEvent: meta.reorderEvent });
    return () => {
      target.unregisterZone(zoneId);
      dndLog.debug('zone:unregister', { zoneId, group: meta.group });
    };
  }, [parentRoot, isRoot, zoneId, meta]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Multi-container collision: prefer pointer-within (catches empty zones and
  // zone hovering), fall back to rect-intersection, then closest-corners over
  // the items in whichever zone the pointer found.
  const collisionDetection: CollisionDetection = React.useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      dndLog.debug('collision:pointerWithin', { count: pointerCollisions.length, ids: pointerCollisions.map((c) => c.id) });
      return pointerCollisions;
    }
    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) {
      dndLog.debug('collision:rectIntersection', { count: rectCollisions.length, ids: rectCollisions.map((c) => c.id) });
      return rectCollisions;
    }
    const cornerCollisions = closestCorners(args);
    dndLog.debug('collision:closestCorners', { count: cornerCollisions.length, ids: cornerCollisions.map((c) => c.id) });
    return cornerCollisions;
  }, []);

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
      const allZones = Array.from(zonesRef.current.entries()).map(([id, m]) => ({ id, group: m.group, items: m.itemIds.length }));
      dndLog.debug('dragEnd:received', {
        activeId: active.id,
        overId: over?.id,
        overData: over?.data?.current,
        zones: allZones,
      });
      if (!over) {
        dndLog.warn('dragEnd:abort:no-over', { activeId: active.id, reason: 'no droppable under pointer at drop time → item snaps back' });
        return;
      }

      const sourceZone = findZoneByItem(active.id);
      // The drop target's group is announced by the SortableItem / DropZone wrappers
      const overData = over.data?.current as { dndGroup?: string } | undefined;
      const targetGroup = overData?.dndGroup;
      dndLog.debug('dragEnd:resolved', { sourceGroup: sourceZone?.group, targetGroup, overDataKeys: overData ? Object.keys(overData) : null });
      if (!sourceZone) {
        dndLog.warn('dragEnd:abort:no-source-zone', { activeId: active.id });
        return;
      }
      if (!targetGroup) {
        dndLog.warn('dragEnd:abort:no-target-group', { overId: over.id, overData });
        return;
      }
      const targetZone = findZoneByGroup(targetGroup);
      if (!targetZone) {
        dndLog.warn('dragEnd:abort:target-zone-not-registered', { targetGroup });
        return;
      }

      if (sourceZone.group !== targetZone.group) {
        // Cross-container drop — fire dropEvent on the TARGET zone.
        // Use the UI: prefix so the bus auto-qualifies to UI:<Orbital>.<Trait>.<X>,
        // matching the contract that action buttons (UI:${action.event}) use and
        // that the trait's useUIEvents subscriber listens for.
        if (targetZone.dropEvent) {
          const newIndex = targetZone.itemIds.indexOf(over.id);
          const evt = `UI:${targetZone.dropEvent}`;
          dndLog.info('dragEnd:cross-container:emit', {
            event: evt,
            id: String(active.id),
            sourceGroup: sourceZone.group,
            targetGroup: targetZone.group,
            newIndex: newIndex === -1 ? targetZone.itemIds.length : newIndex,
          });
          eventBus.emit(evt, {
            id: String(active.id),
            sourceGroup: sourceZone.group,
            targetGroup: targetZone.group,
            newIndex: newIndex === -1 ? targetZone.itemIds.length : newIndex,
          });
        } else {
          dndLog.warn('dragEnd:cross-container:no-dropEvent-on-target', { targetGroup: targetZone.group });
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
        // See cross-container branch: emit through `UI:` so the bus auto-
        // qualifies and the trait's useUIEvents subscriber receives it.
        const evt = `UI:${sourceZone.reorderEvent}`;
        dndLog.info('dragEnd:reorder:emit', {
          event: evt,
          id: String(active.id),
          oldIndex,
          newIndex,
        });
        eventBus.emit(evt, {
          id: String(active.id),
          oldIndex,
          newIndex,
        });
      } else {
        dndLog.debug('dragEnd:reorder:no-reorderEvent', { sourceGroup: sourceZone.group });
      }
    },
    [orderedItems, ownGroup, findZoneByItem, findZoneByGroup, eventBus],
  );

  const sortableData = React.useMemo(() => ({ dndGroup: ownGroup }), [ownGroup]);
  const SortableItem: React.FC<{ id: UniqueIdentifier; children: React.ReactNode }> = React.useCallback(
    ({ id, children }) => {
      const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
      } = useSortable({ id, data: sortableData });
      const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        cursor: enabled ? 'grab' : undefined,
        // Lift the dragged element above siblings so its visual movement
        // isn't hidden behind other cards / column boundaries.
        zIndex: isDragging ? 50 : undefined,
        position: isDragging ? 'relative' : undefined,
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
    [sortableData, enabled],
  );

  const DropZoneShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const droppableId = `dnd-zone-${zoneId}`;
    const { setNodeRef, isOver } = useDroppable({
      id: droppableId,
      data: sortableData,
    });
    // Read the root's activeDrag so we know when to show a Trello-style
    // placeholder slot. The slot only appears when a card from a DIFFERENT
    // zone is hovering over this zone — in-zone reorder already gets the
    // SortableContext's built-in shift animation.
    const ctx = React.useContext(RootCtx);
    const activeDrag = ctx?.activeDrag ?? null;
    const overZoneGroup = ctx?.overZoneGroup ?? null;
    // Use the root-tracked overZoneGroup instead of the local useDroppable
    // `isOver` — when the pointer is over an inner SortableItem, dnd-kit
    // resolves `over` to that item (not the wrapper droppable), so the
    // shell's local isOver stays false. The root's onDragOver sees
    // over.data.dndGroup directly, which works in either case.
    const isThisZoneOver = overZoneGroup === ownGroup;
    const showForeignPlaceholder =
      isThisZoneOver && activeDrag != null && activeDrag.sourceGroup !== ownGroup;
    dndLog.debug('dropzone:render', {
      group: ownGroup,
      isOver,
      isThisZoneOver,
      overZoneGroup,
      activeDragSourceGroup: activeDrag?.sourceGroup ?? null,
      activeDragHeight: activeDrag?.height ?? null,
      showForeignPlaceholder,
      ctxAvailable: ctx != null,
    });
    React.useEffect(() => {
      dndLog.info('dropzone:isOver:change', { droppableId, group: ownGroup, isOver, isThisZoneOver, showForeignPlaceholder, activeDragSourceGroup: activeDrag?.sourceGroup ?? null });
    }, [droppableId, isOver, isThisZoneOver, showForeignPlaceholder]);
    return (
      <Box
        ref={setNodeRef as React.Ref<HTMLDivElement>}
        data-dnd-zone={ownGroup}
        data-dnd-is-over={isThisZoneOver ? 'true' : 'false'}
        className={
          isThisZoneOver
            ? 'ring-2 ring-primary ring-offset-2 rounded-lg transition-all min-h-[3rem]'
            : 'min-h-[3rem] rounded-lg transition-all'
        }
      >
        {children}
        {showForeignPlaceholder ? (
          <Box
            data-dnd-placeholder
            style={{ height: activeDrag.height }}
            className="border-2 border-dashed border-primary/60 bg-primary/5 rounded-md my-1 transition-all"
          />
        ) : null}
      </Box>
    );
  };

  const rootContextValue: RootContext = React.useMemo(
    () => ({ registerZone, unregisterZone, activeDrag, overZoneGroup }),
    [registerZone, unregisterZone, activeDrag, overZoneGroup],
  );

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    const sourceZone = findZoneByItem(event.active.id);
    // Measure the actual source DOM height so the placeholder slot matches
    // visually. activatorNode is the [data-dnd-item] wrapper; fall back to
    // a sensible default if dnd-kit hasn't measured it yet.
    const rect = event.active.rect.current.initial;
    const height = rect?.height && rect.height > 0 ? rect.height : 64;
    if (sourceZone) {
      setActiveDrag({ sourceGroup: sourceZone.group, height });
      dndLog.info('dragStart:activeDrag:set', { sourceGroup: sourceZone.group, height, isRoot, hookZoneId: zoneId });
    } else {
      dndLog.warn('dragStart:no-source-zone', { activeId: event.active.id, zoneCount: zonesRef.current.size, isRoot });
    }
    dndLog.info('dragStart', {
      activeId: event.active.id,
      activeData: event.active.data?.current,
      sourceGroup: sourceZone?.group,
      height,
      zoneCount: zonesRef.current.size,
      isRoot,
    });
  }, [findZoneByItem, isRoot, zoneId]);

  const handleDragOver = React.useCallback((event: DragOverEvent) => {
    const overData = event.over?.data?.current as { dndGroup?: string } | undefined;
    const group = overData?.dndGroup ?? null;
    setOverZoneGroup(group);
    dndLog.debug('dragOver', {
      activeId: event.active.id,
      overId: event.over?.id,
      overGroup: group,
    });
  }, []);

  const handleDragCancel = React.useCallback((event: DragCancelEvent) => {
    setActiveDrag(null);
    setOverZoneGroup(null);
    dndLog.warn('dragCancel', {
      activeId: event.active.id,
      reason: 'dnd-kit cancelled the drag (escape key, pointer interrupted, or external)',
    });
  }, []);

  // Wrap handleDragEnd to also clear placeholder state so the slot disappears.
  const handleDragEndWithCleanup = React.useCallback((event: DragEndEvent) => {
    handleDragEnd(event);
    setActiveDrag(null);
    setOverZoneGroup(null);
  }, [handleDragEnd]);

  const wrapContainer = React.useCallback(
    (children: React.ReactNode): React.ReactNode => {
      if (!enabled) return children;
      const strategy = layout === 'grid' ? rectSortingStrategy : verticalListSortingStrategy;
      // Root-only mode: container hosts DndContext for descendant zones but is
      // not itself a sortable or drop target.
      if (!isZone) {
        if (!isRoot) return children;
        return (
          <RootCtx.Provider value={rootContextValue}>
            <DndContext
              sensors={sensors}
              collisionDetection={collisionDetection}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEndWithCleanup}
              onDragCancel={handleDragCancel}
            >
              {children}
            </DndContext>
          </RootCtx.Provider>
        );
      }
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
            <DndContext
              sensors={sensors}
              collisionDetection={collisionDetection}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEndWithCleanup}
              onDragCancel={handleDragCancel}
            >
              {inner}
            </DndContext>
          </RootCtx.Provider>
        );
      }
      return inner;
    },
    [enabled, isZone, layout, sensors, collisionDetection, handleDragStart, handleDragOver, handleDragEndWithCleanup, handleDragCancel, itemIds, isRoot, rootContextValue],
  );

  return {
    enabled,
    isZone,
    wrapContainer,
    SortableItem,
    orderedItems,
  };
}
