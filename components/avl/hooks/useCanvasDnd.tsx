'use client';
/**
 * useCanvasDnd — drag/drop primitives for the AVL canvas surface.
 *
 * Shares the sensor stack + collision waterfall with `useDataDnd` (both
 * import from `hooks/useAlmadarDndCollision`); diverges on drop semantics
 * because palette → canvas is a cursor-resolved tree insert, not a
 * sortable-list reorder.
 *
 * Pointer-sensor based so it works inside React Flow nodes (the native
 * HTML5 DnD path was swallowed by React Flow's pan/zoom handlers).
 *
 * Event contract (defaults — overridable via `CanvasDndProvider.onDrop`):
 *   - On drag start: emits `UI:DRAG_START` { kind, data }
 *   - On drag end:   emits `UI:DRAG_END`   { kind, data }
 *   - On 'pattern' drop:   emits `UI:PATTERN_DROP`  { patternType, containerNode, parentPath?, index? }
 *   - On 'behavior' drop:  emits `UI:BEHAVIOR_DROP` { behaviorName, containerNode }
 *
 * The `onDrop` callback lets consumers route OTHER payload kinds (e.g.
 * `'pattern-instance'` for in-canvas reorder of an existing pattern) to
 * their own bus events or schema mutations. Reorder semantics belong in
 * the consumer because they touch the SExpr tree directly — this primitive
 * only resolves payload + target + cursor and hands them off.
 */

import React from 'react';
import {
  DndContext,
  DragOverlay,
  useDraggable as dndKitUseDraggable,
  useDroppable as dndKitUseDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { EventPayload } from '@almadar/core';
import { useEventBus } from '../../../hooks/useEventBus';
import {
  useAlmadarDndSensors,
  almadarDndCollisionDetection,
} from '../../../hooks/useAlmadarDndCollision';
import { createLogger } from '@almadar/logger';

const log = createLogger('almadar:ui:canvas-dnd');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Drag kinds the canvas understands. Open-ended `string` so consumers can
 * introduce new kinds (e.g. `'pattern-instance'` for in-canvas reorder of an
 * existing pattern) without touching this file — the provider's defaults
 * cover `'pattern'` and `'behavior'`; everything else routes through the
 * consumer's `onDrop`.
 */
export type CanvasDragKind = 'pattern' | 'behavior' | (string & {});

/**
 * Payload carried by a draggable. For `'pattern'` tiles `data` is
 * `{ type: string }`, for `'behavior'` tiles `{ name: string }`. For consumer
 * kinds (e.g. `'pattern-instance'`) the shape is whatever the consumer
 * agrees on with its own `onDrop`.
 */
export interface CanvasDragPayload {
  kind: CanvasDragKind;
  data: EventPayload;
}

/**
 * Orbital/trait/transition context a drop will mutate.
 *
 * Has an explicit `[key: string]: string | undefined` index signature so it
 * structurally matches `EventPayload` — required because we pass the whole
 * object as a field on the `UI:PATTERN_DROP` payload.
 */
export interface CanvasContainerNode {
  orbitalName?: string;
  traitName?: string;
  transitionEvent?: string;
  [key: string]: string | undefined;
}

/** Drop-target metadata stored on each droppable's `data` field. */
export interface CanvasDropTarget {
  /**
   * `l1` = outer orbital frame (overview level).
   * `l2` = render-ui slot inside an expanded orbital.
   * `wrapper` = page-level catch-all fired when nothing inner caught the drop.
   */
  level: 'l1' | 'l2' | 'wrapper' | (string & {});
  /** Full or partial container context this drop will mutate. */
  containerNode: CanvasContainerNode;
  /**
   * Optional resolver called at drop time to derive `parentPath` + `index`
   * from the pointer's final client position. L2 slots use this to walk the
   * DOM under their `contentRef` and find the nearest `data-accepts-children`
   * container plus the cursor-relative insertion index.
   */
  resolvePath?: (cursor: { x: number; y: number }) => { parentPath: string; index: number } | null;
}

export interface CanvasDropEvent {
  payload: CanvasDragPayload;
  target: CanvasDropTarget;
  /** Final pointer client position, when dnd-kit could compute it. */
  cursor: { x: number; y: number } | null;
  /**
   * Resolved insertion path/index from `target.resolvePath(cursor)`. Null
   * when the target has no resolver or the cursor was unavailable.
   */
  resolved: { parentPath: string; index: number } | null;
}

// ---------------------------------------------------------------------------
// Source hook (palette tiles, draggable pattern instances)
// ---------------------------------------------------------------------------

export interface UseCanvasDraggableArgs {
  /** Unique id (per-tile). dnd-kit uses this to track the active drag. */
  id: string;
  payload: CanvasDragPayload;
  disabled?: boolean;
}

export interface UseCanvasDraggableResult {
  setNodeRef: (node: HTMLElement | null) => void;
  attributes: ReturnType<typeof dndKitUseDraggable>['attributes'];
  listeners: ReturnType<typeof dndKitUseDraggable>['listeners'];
  isDragging: boolean;
  /** Spread on the tile — live transform + grab cursor + touch-action. */
  style: React.CSSProperties;
}

export function useCanvasDraggable({
  id,
  payload,
  disabled,
}: UseCanvasDraggableArgs): UseCanvasDraggableResult {
  const { setNodeRef, attributes, listeners, isDragging, transform } = dndKitUseDraggable({
    id,
    data: { payload },
    disabled,
  });
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    cursor: disabled ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none',
  };
  return { setNodeRef, attributes, listeners, isDragging, style };
}

// ---------------------------------------------------------------------------
// Target hook (canvas slots)
// ---------------------------------------------------------------------------

export interface UseCanvasDroppableArgs {
  id: string;
  target: CanvasDropTarget;
  /** Which drag kinds this zone accepts. Defaults to ['pattern','behavior']. */
  accepts?: readonly CanvasDragKind[];
  disabled?: boolean;
}

export interface UseCanvasDroppableResult {
  setNodeRef: (node: HTMLElement | null) => void;
  isOver: boolean;
}

const DEFAULT_ACCEPTS: readonly CanvasDragKind[] = ['pattern', 'behavior'];

export function useCanvasDroppable({
  id,
  target,
  accepts,
  disabled,
}: UseCanvasDroppableArgs): UseCanvasDroppableResult {
  const acceptsList = accepts ?? DEFAULT_ACCEPTS;
  const { setNodeRef, isOver } = dndKitUseDroppable({
    id,
    data: { target, accepts: acceptsList },
    disabled,
  });
  return { setNodeRef, isOver };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface CanvasDndProviderProps {
  children: React.ReactNode;
  /**
   * Override the default drop behavior. The default emits `UI:PATTERN_DROP`
   * / `UI:BEHAVIOR_DROP` based on payload kind. Pass an `onDrop` to route
   * additional kinds (e.g. `'pattern-instance'` reorder) elsewhere, or to
   * mutate schema directly without going through the bus.
   *
   * Return `true` from `onDrop` to suppress the default emit; return
   * `false`/`undefined` to fall through to defaults after running your code.
   */
  onDrop?: (drop: CanvasDropEvent) => boolean | void;
  /**
   * Renders the floating preview that follows the cursor during a drag.
   * @dnd-kit moves the source DOM node via CSS transform, which gets clipped
   * by any ancestor with `overflow: hidden|auto|scroll` (e.g. a scrollable
   * palette column). Returning a node here mounts a portal-attached overlay
   * outside the clip so the user always sees what they're dragging.
   *
   * Receives the active payload (or null between drags) and returns the
   * preview element — typically the same JSX the tile renders inline.
   */
  renderOverlay?: (payload: CanvasDragPayload | null) => React.ReactNode;
}

function defaultEmit(eventBus: ReturnType<typeof useEventBus>, drop: CanvasDropEvent): void {
  const { payload, target, resolved } = drop;
  if (payload.kind === 'pattern') {
    const patternType = payload.data['type'];
    if (typeof patternType !== 'string') {
      log.warn('default-emit:pattern:missing-type');
      return;
    }
    const out: EventPayload = { patternType, containerNode: target.containerNode };
    if (resolved) {
      out.parentPath = resolved.parentPath;
      out.index = resolved.index;
    }
    eventBus.emit('UI:PATTERN_DROP', out);
    log.info('default-emit:pattern', { patternType, level: target.level });
    return;
  }
  if (payload.kind === 'behavior') {
    const behaviorName = payload.data['name'];
    if (typeof behaviorName !== 'string') {
      log.warn('default-emit:behavior:missing-name');
      return;
    }
    eventBus.emit('UI:BEHAVIOR_DROP', {
      behaviorName,
      containerNode: target.containerNode,
    });
    log.info('default-emit:behavior', { behaviorName, level: target.level });
    return;
  }
  log.debug('default-emit:unhandled-kind', { kind: payload.kind });
}

/**
 * Wraps a canvas subtree in one DndContext + sensors + collision waterfall.
 * Every `useCanvasDraggable` / `useCanvasDroppable` inside this provider
 * participates in the same drag session.
 */
export function CanvasDndProvider({
  children,
  onDrop,
  renderOverlay,
}: CanvasDndProviderProps): React.ReactElement {
  const eventBus = useEventBus();
  // Canvas DnD has no sortable rows — skip the sortable keyboard coordinate
  // getter so arrow-key nav doesn't try to compute neighbor cells.
  const sensors = useAlmadarDndSensors(false);

  // Active payload drives the DragOverlay so the floating preview can render
  // exactly what's being dragged. Cleared on drag end / cancel.
  const [activePayload, setActivePayload] = React.useState<CanvasDragPayload | null>(null);

  const handleDragStart = React.useCallback((e: DragStartEvent) => {
    const data = e.active.data.current as { payload?: CanvasDragPayload } | undefined;
    const payload = data?.payload;
    if (payload) {
      setActivePayload(payload);
      eventBus.emit('UI:DRAG_START', { kind: payload.kind, data: payload.data });
      log.info('dragStart', { id: e.active.id, kind: payload.kind });
    } else {
      log.warn('dragStart:missing-payload', { id: e.active.id });
    }
  }, [eventBus]);

  const handleDragEnd = React.useCallback((e: DragEndEvent) => {
    setActivePayload(null);
    const activeData = e.active.data.current as { payload?: CanvasDragPayload } | undefined;
    const payload = activeData?.payload;
    const overData = e.over?.data.current as
      | { target?: CanvasDropTarget; accepts?: readonly CanvasDragKind[] }
      | undefined;
    const target = overData?.target;
    const accepts = overData?.accepts;

    log.info('dragEnd', {
      activeId: e.active.id,
      overId: e.over?.id,
      hasPayload: !!payload,
      hasTarget: !!target,
      targetLevel: target?.level,
    });

    if (payload) {
      eventBus.emit('UI:DRAG_END', { kind: payload.kind, data: payload.data });
    }
    if (!payload || !target) return;
    if (accepts && !accepts.includes(payload.kind)) {
      log.debug('dragEnd:rejected:kind', { kind: payload.kind, accepts: [...accepts] });
      return;
    }

    // Final pointer position = activator.client + delta.
    const activator = e.activatorEvent as { clientX?: number; clientY?: number } | undefined;
    const cursor =
      activator && typeof activator.clientX === 'number' && typeof activator.clientY === 'number'
        ? { x: activator.clientX + e.delta.x, y: activator.clientY + e.delta.y }
        : null;

    const resolved = target.resolvePath && cursor ? target.resolvePath(cursor) : null;

    const drop: CanvasDropEvent = { payload, target, cursor, resolved };

    const suppressed = onDrop ? onDrop(drop) === true : false;
    if (!suppressed) defaultEmit(eventBus, drop);
  }, [eventBus, onDrop]);

  const handleDragCancel = React.useCallback(() => {
    setActivePayload(null);
    log.info('dragCancel');
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={almadarDndCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      {/* Floating preview portal — renders outside any overflow:hidden|auto
          ancestor so the dragged tile stays visible as the cursor leaves the
          palette column. Only mounts when the consumer provided a renderer. */}
      {renderOverlay ? (
        <DragOverlay dropAnimation={null}>
          {activePayload ? renderOverlay(activePayload) : null}
        </DragOverlay>
      ) : null}
    </DndContext>
  );
}
