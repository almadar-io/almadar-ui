'use client';

import React, { useCallback, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { Typography, Badge } from "../atoms";
import { Users, Coffee, AlertCircle } from "lucide-react";

export type TableStatus = 'empty' | 'seated' | 'ordered' | 'awaiting-bill' | 'cleaning';
export type TableShape = 'round' | 'rectangle' | 'square';

export interface TableNode {
    id: string;
    label: string;
    x: number;
    y: number;
    shape?: TableShape;
    capacity: number;
    status?: TableStatus;
    partySize?: number;
    serverName?: string;
}

export interface TableFloorPlanProps {
    tables: TableNode[];
    width?: number;
    height?: number;
    selectedId?: string | null;
    editable?: boolean;
    onSelect?: (id: string | null) => void;
    onMove?: (id: string, x: number, y: number) => void;
    className?: string;
}

interface DragState {
    id: string;
    pointerId: number;
    offsetX: number;
    offsetY: number;
    moved: boolean;
}

const STATUS_CLASSES: Record<TableStatus, string> = {
    empty: "bg-surface border-border text-foreground",
    seated: "bg-surface border-success text-success",
    ordered: "bg-surface border-warning text-warning",
    'awaiting-bill': "bg-surface border-info text-info",
    cleaning: "bg-muted border-border text-muted-foreground",
};

const STATUS_BADGE: Record<TableStatus, { variant: "default" | "success" | "warning" | "info" | "neutral"; label: string }> = {
    empty: { variant: "default", label: "Empty" },
    seated: { variant: "success", label: "Seated" },
    ordered: { variant: "warning", label: "Ordered" },
    'awaiting-bill': { variant: "info", label: "Awaiting bill" },
    cleaning: { variant: "neutral", label: "Cleaning" },
};

function getShapeClasses(shape: TableShape): string {
    switch (shape) {
        case 'round':
            return "rounded-full w-24 h-24";
        case 'square':
            return "rounded-md w-24 h-24";
        case 'rectangle':
            return "rounded-md w-36 h-20";
    }
}

function getStatusIcon(status: TableStatus): React.ReactNode {
    switch (status) {
        case 'seated':
            return <Users className="w-4 h-4" />;
        case 'ordered':
            return <Coffee className="w-4 h-4" />;
        case 'awaiting-bill':
            return <AlertCircle className="w-4 h-4" />;
        default:
            return null;
    }
}

export const TableFloorPlan: React.FC<TableFloorPlanProps> = ({
    tables,
    width = 800,
    height = 600,
    selectedId = null,
    editable = false,
    onSelect,
    onMove,
    className,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<DragState | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);

    const handlePointerDown = useCallback(
        (e: React.PointerEvent<HTMLDivElement>, table: TableNode) => {
            if (!editable) return;
            const target = e.currentTarget;
            const rect = target.getBoundingClientRect();
            dragRef.current = {
                id: table.id,
                pointerId: e.pointerId,
                offsetX: e.clientX - rect.left,
                offsetY: e.clientY - rect.top,
                moved: false,
            };
            target.setPointerCapture(e.pointerId);
            setDraggingId(table.id);
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
            const tableWidth = target.offsetWidth;
            const tableHeight = target.offsetHeight;

            const newX = e.clientX - containerRect.left - drag.offsetX;
            const newY = e.clientY - containerRect.top - drag.offsetY;

            const clampedX = Math.max(0, Math.min(width - tableWidth, newX));
            const clampedY = Math.max(0, Math.min(height - tableHeight, newY));

            drag.moved = true;
            onMove?.(drag.id, clampedX, clampedY);
        },
        [width, height, onMove],
    );

    const handlePointerUp = useCallback(
        (e: React.PointerEvent<HTMLDivElement>, table: TableNode) => {
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
                const next = selectedId === table.id ? null : table.id;
                onSelect?.(next);
            }
        },
        [selectedId, onSelect],
    );

    const handleContainerClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) {
                onSelect?.(null);
            }
        },
        [onSelect],
    );

    return (
        <div
            ref={containerRef}
            data-testid="table-floor-plan"
            className={cn(
                "relative bg-background border border-border rounded-md overflow-hidden",
                className,
            )}
            style={{ width, height }}
            onClick={handleContainerClick}
        >
            {tables.map((table) => {
                const status = table.status ?? 'empty';
                const shape = table.shape ?? 'round';
                const isSelected = selectedId === table.id;
                const isDragging = draggingId === table.id;
                const statusBadge = STATUS_BADGE[status];

                return (
                    <div
                        key={table.id}
                        data-testid={`table-node-${table.id}`}
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
                        style={{ left: table.x, top: table.y, touchAction: 'none' }}
                        onPointerDown={(e) => handlePointerDown(e, table)}
                        onPointerMove={handlePointerMove}
                        onPointerUp={(e) => handlePointerUp(e, table)}
                        onPointerCancel={(e) => handlePointerUp(e, table)}
                    >
                        <div className="flex items-center gap-1">
                            {getStatusIcon(status)}
                            <Typography variant="body2" weight="semibold">
                                {table.label}
                            </Typography>
                        </div>
                        <Typography variant="caption" color="secondary">
                            {table.partySize !== undefined && status === 'seated'
                                ? `${table.partySize}/${table.capacity}`
                                : `Cap ${table.capacity}`}
                        </Typography>
                        {status === 'seated' && table.serverName && (
                            <Typography variant="caption" color="secondary" className="truncate max-w-[80%]">
                                {table.serverName}
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
                    </div>
                );
            })}
        </div>
    );
};

TableFloorPlan.displayName = "TableFloorPlan";
