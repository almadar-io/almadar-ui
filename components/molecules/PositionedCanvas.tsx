'use client';

import React, { useCallback, useRef, useState } from "react";
import type { EventEmit, EventPayloadValue } from "@almadar/core";
import { cn } from "../../lib/cn";
import { useEventBus } from "../../hooks/useEventBus";
import { Typography, Badge, Box } from "../atoms";
import { Icon } from "../atoms/Icon";

export type CanvasItemStatus = 'empty' | 'seated' | 'ordered' | 'awaiting-bill' | 'cleaning';
export type CanvasItemShape = 'round' | 'rectangle' | 'square';

export interface CanvasItem {
    id: string;
    label: string;
    x: number;
    y: number;
    shape?: CanvasItemShape;
    capacity: number;
    status?: CanvasItemStatus;
    partySize?: number;
    serverName?: string;
}

export interface PositionedCanvasProps {
    /**
     * Items to render. Accepts either a typed array (direct consumers) or the
     * runtime payload shape from a render-ui binding (`@payload.data`). The
     * molecule narrows non-array values to `[]` and validates element shape at
     * render time via the `id` / `x` / `y` guards.
     */
    items: readonly CanvasItem[] | EventPayloadValue;
    width?: number;
    height?: number;
    selectedId?: string | null;
    editable?: boolean;
    onSelect?: (id: string | null) => void;
    onMove?: (id: string, x: number, y: number) => void;
    selectEvent?: EventEmit<{ id: string | null }>;
    moveEvent?: EventEmit<{ id: string; x: number; y: number }>;
    className?: string;
}

interface DragState {
    id: string;
    pointerId: number;
    offsetX: number;
    offsetY: number;
    moved: boolean;
}

const STATUS_CLASSES: Record<CanvasItemStatus, string> = {
    empty: "bg-surface border-border text-foreground",
    seated: "bg-surface border-success text-success",
    ordered: "bg-surface border-warning text-warning",
    'awaiting-bill': "bg-surface border-info text-info",
    cleaning: "bg-muted border-border text-muted-foreground",
};

const STATUS_BADGE: Record<CanvasItemStatus, { variant: "default" | "success" | "warning" | "info" | "neutral"; label: string }> = {
    empty: { variant: "default", label: "Empty" },
    seated: { variant: "success", label: "Seated" },
    ordered: { variant: "warning", label: "Ordered" },
    'awaiting-bill': { variant: "info", label: "Awaiting bill" },
    cleaning: { variant: "neutral", label: "Cleaning" },
};

function getShapeClasses(shape: CanvasItemShape): string {
    switch (shape) {
        case 'round':
            return "rounded-full w-24 h-24";
        case 'square':
            return "rounded-md w-24 h-24";
        case 'rectangle':
            return "rounded-md w-36 h-20";
    }
}

function getStatusIcon(status: CanvasItemStatus): React.ReactNode {
    switch (status) {
        case 'seated':
            return <Icon name="users" className="w-4 h-4" />;
        case 'ordered':
            return <Icon name="coffee" className="w-4 h-4" />;
        case 'awaiting-bill':
            return <Icon name="alert-circle" className="w-4 h-4" />;
        default:
            return null;
    }
}

export const PositionedCanvas: React.FC<PositionedCanvasProps> = ({
    items: itemsProp,
    width = 800,
    height = 600,
    selectedId = null,
    editable = false,
    onSelect,
    onMove,
    selectEvent,
    moveEvent,
    className,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<DragState | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const eventBus = useEventBus();

    const items: readonly CanvasItem[] = Array.isArray(itemsProp)
        ? (itemsProp as readonly CanvasItem[])
        : [];

    const handlePointerDown = useCallback(
        (e: React.PointerEvent<HTMLDivElement>, item: CanvasItem) => {
            if (!editable) return;
            const target = e.currentTarget;
            const rect = target.getBoundingClientRect();
            dragRef.current = {
                id: item.id,
                pointerId: e.pointerId,
                offsetX: e.clientX - rect.left,
                offsetY: e.clientY - rect.top,
                moved: false,
            };
            target.setPointerCapture(e.pointerId);
            setDraggingId(item.id);
        },
        [editable],
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            const drag = dragRef.current;
            const container = containerRef.current;
            if (!drag || !container || drag.pointerId !== e.pointerId) return;

            const containerRect = container.getBoundingClientRect();
            const target = e.currentTarget;
            const itemWidth = target.offsetWidth;
            const itemHeight = target.offsetHeight;

            const newX = e.clientX - containerRect.left - drag.offsetX;
            const newY = e.clientY - containerRect.top - drag.offsetY;

            const clampedX = Math.max(0, Math.min(width - itemWidth, newX));
            const clampedY = Math.max(0, Math.min(height - itemHeight, newY));

            drag.moved = true;
            onMove?.(drag.id, clampedX, clampedY);
            if (moveEvent) {
                eventBus.emit(`UI:${moveEvent}`, { id: drag.id, x: clampedX, y: clampedY });
            }
        },
        [width, height, onMove, moveEvent, eventBus],
    );

    const handlePointerUp = useCallback(
        (e: React.PointerEvent<HTMLDivElement>, item: CanvasItem) => {
            const drag = dragRef.current;
            if (!drag || drag.pointerId !== e.pointerId) return;

            const target = e.currentTarget;
            if (target.hasPointerCapture(e.pointerId)) {
                target.releasePointerCapture(e.pointerId);
            }

            const wasDrag = drag.moved;
            dragRef.current = null;
            setDraggingId(null);

            if (!wasDrag) {
                const next = selectedId === item.id ? null : item.id;
                onSelect?.(next);
                if (selectEvent) {
                    eventBus.emit(`UI:${selectEvent}`, { id: next });
                }
            }
        },
        [selectedId, onSelect, selectEvent, eventBus],
    );

    const handleContainerClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) {
                onSelect?.(null);
                if (selectEvent) {
                    eventBus.emit(`UI:${selectEvent}`, { id: null });
                }
            }
        },
        [onSelect, selectEvent, eventBus],
    );

    return (
        // Outer scroll viewport: caps the visual footprint to the parent's
        // available width on small screens. The inner plane keeps its fixed
        // {width × height} coordinate system (items are positioned by
        // absolute item.x/item.y), so a phone-sized viewport pans inside
        // the larger logical canvas rather than busting the layout.
        <Box className={cn("max-w-full overflow-auto rounded-md", className)}>
        <Box
            ref={containerRef}
            data-testid="positioned-canvas"
            className="relative bg-background border border-border rounded-container overflow-hidden"
            style={{ width, height }}
            onClick={handleContainerClick}
        >
            {items.map((item) => {
                const status = item.status ?? 'empty';
                const shape = item.shape ?? 'round';
                const isSelected = selectedId === item.id;
                const isDragging = draggingId === item.id;
                const statusBadge = STATUS_BADGE[status];

                return (
                    <Box
                        key={item.id}
                        data-testid={`item-node-${item.id}`}
                        data-status={status}
                        className={cn(
                            "absolute flex flex-col items-center justify-center gap-1 border-2 select-none",
                            "transition-shadow",
                            STATUS_CLASSES[status],
                            getShapeClasses(shape),
                            editable ? "cursor-move" : "cursor-pointer",
                            isSelected && "outline outline-2 outline-offset-2 outline-primary shadow-md",
                            isDragging && "shadow-lg z-10",
                        )}
                        style={{ left: item.x, top: item.y, touchAction: 'none' }}
                        onPointerDown={(e) => handlePointerDown(e, item)}
                        onPointerMove={handlePointerMove}
                        onPointerUp={(e) => handlePointerUp(e, item)}
                        onPointerCancel={(e) => handlePointerUp(e, item)}
                    >
                        <Box className="flex items-center gap-1">
                            {getStatusIcon(status)}
                            <Typography variant="body2" weight="semibold">
                                {item.label}
                            </Typography>
                        </Box>
                        <Typography variant="caption" color="secondary">
                            {item.partySize !== undefined && status === 'seated'
                                ? `${item.partySize}/${item.capacity}`
                                : `Cap ${item.capacity}`}
                        </Typography>
                        {status === 'seated' && item.serverName && (
                            <Typography variant="caption" color="secondary" className="truncate max-w-[80%]">
                                {item.serverName}
                            </Typography>
                        )}
                        {isSelected && (
                            <Badge
                                variant={statusBadge.variant}
                                size="sm"
                                className="absolute -top-2 -right-2"
                            >
                                {statusBadge.label}
                            </Badge>
                        )}
                    </Box>
                );
            })}
        </Box>
        </Box>
    );
};

PositionedCanvas.displayName = "PositionedCanvas";
