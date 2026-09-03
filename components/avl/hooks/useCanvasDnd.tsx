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
 *   - On 'pattern' drop:          emits `UI:PATTERN_DROP` { patternType, containerNode, parentPath?, index? }
 *   - On 'behavior' drop:         emits `UI:BEHAVIOR_DROP` { behaviorName, containerNode }
 *   - On 'pattern-instance' drop: emits `UI:PATTERN_MOVE` { fromPath, loc, toParentPath?, toIndex? } —
 *     reorder of an already-placed pattern; `loc` is the source's own
 *     containerNode (orbitalName/traitName/transitionEvent), `toParentPath`/
 *     `toIndex` come from `target.resolvePath` same as an insert drop.
 *
 * The `onDrop` callback lets consumers route ANY payload kind (including
 * the defaults above) to their own bus events or schema mutations instead —
 * e.g. the builder app bypasses ALL default emits (see UIEditor.tsx) because
 * `useEventBus()` resolves to a different chunk's context inside this
 * provider. Return `true` from `onDrop` to suppress the default emit.
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
 * introduce further kinds without touching this file — the provider's
 * defaults cover `'pattern'`, `'behavior'` and `'pattern-instance'`
 * (in-canvas reorder of an existing pattern, source: `OrbPreviewNode`'s L2
 * content); anything else routes through the consumer's `onDrop`.
 */
export type CanvasDragKind = 'pattern' | 'behavior' | 'pattern-instance' | (string & {});

/**
 * Payload carried by a draggable. For `'pattern'` tiles `data` is
 * `{ type: string }`, for `'behavior'` tiles `{ name: string }`, for
 * `'pattern-instance'` (reorder) `{ fromPath: string, loc: CanvasContainerNode }`.
 * For any other consumer-defined kind, the shape is whatever the consumer
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
  // No transform on the SOURCE: the DragOverlay is the cursor-following
  // preview. Translating the source too puts a second element under the
  // pointer, and `resolvePath`'s drop-time elementFromPoint hits it instead
  // of the drop target (and a reorder drag would drag the whole screen).
  const style: React.CSSProperties = {
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
  if (payload.kind === 'pattern-instance') {
    const fromPath = payload.data['fromPath'];
    if (typeof fromPath !== 'string') {
      log.warn('default-emit:pattern-instance:missing-fromPath');
      return;
    }
    // Move, not insert — `loc` is the drag SOURCE's own containerNode
    // (carried in the payload from drag start), `toParentPath`/`toIndex`
    // are the drop TARGET's resolved position, same resolver as an insert.
    const out: EventPayload = { fromPath, loc: payload.data['loc'] };
    if (resolved) {
      out.toParentPath = resolved.parentPath;
      out.toIndex = resolved.index;
    }
    eventBus.emit('UI:PATTERN_MOVE', out);
    log.info('default-emit:pattern-instance', { fromPath, level: target.level });
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

  // Live pointer position during a drag, from a native listener. dnd-kit's
  // `activatorEvent + delta` reconstruction is NOT viewport coordinates —
  // `delta` folds in scroll-container compensation (autoscroll over the tall
  // palette skews y by thousands of px), so `resolvePath`'s elementFromPoint
  // needs the real pointer, tracked here.
  const lastPointerRef = React.useRef<{ x: number; y: number } | null>(null);
  const trackPointer = React.useCallback((ev: PointerEvent) => {
    lastPointerRef.current = { x: ev.clientX, y: ev.clientY };
  }, []);

  const handleDragStart = React.useCallback((e: DragStartEvent) => {
    const data = e.active.data.current as { payload?: CanvasDragPayload } | undefined;
    const payload = data?.payload;
    // PointerEvent extends MouseEvent, so one instanceof covers both (and
    // environments without a PointerEvent global — jsdom — stay safe).
    const activator = e.activatorEvent;
    lastPointerRef.current =
      activator instanceof MouseEvent
        ? { x: activator.clientX, y: activator.clientY }
        : null;
    document.addEventListener('pointermove', trackPointer);
    if (payload) {
      setActivePayload(payload);
      eventBus.emit('UI:DRAG_START', { kind: payload.kind, data: payload.data });
      log.info('dragStart', { id: e.active.id, kind: payload.kind });
    } else {
      log.warn('dragStart:missing-payload', { id: e.active.id });
    }
  }, [eventBus, trackPointer]);

  const handleDragEnd = React.useCallback((e: DragEndEvent) => {
    setActivePayload(null);
    document.removeEventListener('pointermove', trackPointer);
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

    // Final pointer position from the native tracker (see lastPointerRef).
    const cursor = lastPointerRef.current;

    const resolved = target.resolvePath && cursor ? target.resolvePath(cursor) : null;
    log.debug('dragEnd:resolve', {
      hasResolver: !!target.resolvePath,
      cursorX: cursor?.x,
      cursorY: cursor?.y,
      resolvedParent: resolved?.parentPath ?? null,
      resolvedIndex: resolved?.index ?? null,
    });

    const drop: CanvasDropEvent = { payload, target, cursor, resolved };

    const suppressed = onDrop ? onDrop(drop) === true : false;
    if (!suppressed) defaultEmit(eventBus, drop);
  }, [eventBus, onDrop, trackPointer]);

  const handleDragCancel = React.useCallback(() => {
    setActivePayload(null);
    document.removeEventListener('pointermove', trackPointer);
    log.info('dragCancel');
  }, [trackPointer]);

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
        /* pointer-events none on the WRAPPER, not just the rendered content:
           dnd-kit doesn't default it, and the overlay rides exactly under the
           cursor — with hit-testing on, `resolvePath`'s elementFromPoint sees
           the overlay instead of the drop target and every drop degrades to
           the caller's fallback position. */
        <DragOverlay dropAnimation={null} style={{ pointerEvents: 'none' }}>
          {activePayload ? renderOverlay(activePayload) : null}
        </DragOverlay>
      ) : null}
    </DndContext>
  );
}
