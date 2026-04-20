'use client';
/**
 * Timeline Organism Component
 *
 * A vertical timeline component for displaying chronological events.
 * Composes atoms and molecules for layout, uses CSS variables for theming.
 *
 * Orbital Component Interface Compliance:
 * - Entity binding with auto-fetch when entity is a string
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */

import React from "react";
import { cn } from "../../lib/cn";
import { Card, Typography, Badge, Icon, Box } from "../atoms";
import { VStack, HStack } from "../atoms/Stack";
import { LoadingState } from "../molecules/LoadingState";
import { ErrorState } from "../molecules/ErrorState";
import { EmptyState } from "../molecules/EmptyState";
import { useTranslate } from "../../hooks/useTranslate";
// Timeline carries `icon?: LucideIcon` on TimelineItem (a React component)
// which doesn't fit EntityRow's primitive-field constraint, so the organism
// doesn't inherit EntityDisplayProps directly. Schema entity data arrives
// via the `entity` prop typed against @almadar/core's EntityRow, and is
// normalised into TimelineItems (icon-less) at render time; UI-shaped
// TimelineItems come through the dedicated `items` prop.
import type { EntityRow } from "@almadar/core";
import type { LucideIcon } from "lucide-react";
import { Circle, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export type TimelineItemStatus = "complete" | "active" | "pending" | "error";

export interface TimelineItem {
    /** Unique identifier */
    id: string;
    /** Item title */
    title: string;
    /** Item description */
    description?: string;
    /** Timestamp string */
    date?: string;
    /** Status indicator */
    status?: TimelineItemStatus;
    /** Icon override */
    icon?: LucideIcon;
    /** Additional metadata tags */
    tags?: readonly string[];
}

export interface TimelineAction {
    label: string;
    event?: string;
    navigatesTo?: string;
    variant?: "primary" | "secondary" | "ghost";
}

export interface TimelineProps {
    /** Additional CSS classes */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /**
     * Schema entity data typed against @almadar/core's EntityRow. Items from
     * `entity` are normalised into `items` when `items` is omitted. UI-specific
     * TimelineItem fields (`icon`, callbacks) cannot round-trip through the
     * event bus, so decorative stories that need them pass `items` directly.
     */
    entity?: EntityRow | readonly EntityRow[];
    /** Timeline title */
    title?: string;
    /** Timeline items */
    items?: readonly TimelineItem[];
    /** Fields to display */
    fields: readonly string[];
    /** Actions per item */
    itemActions?: readonly TimelineAction[];
}

const STATUS_STYLES: Record<
    TimelineItemStatus,
    { dotColor: string; lineColor: string; icon: LucideIcon }
> = {
    complete: {
        dotColor: "text-success",
        lineColor: "bg-success",
        icon: CheckCircle2,
    },
    active: {
        dotColor: "text-primary",
        lineColor: "bg-primary",
        icon: Clock,
    },
    pending: {
        dotColor: "text-muted-foreground",
        lineColor: "bg-border",
        icon: Circle,
    },
    error: {
        dotColor: "text-error",
        lineColor: "bg-error",
        icon: AlertCircle,
    },
};

export const Timeline: React.FC<TimelineProps> = ({
    title,
    items: propItems,
    fields,
    itemActions,
    entity,
    isLoading = false,
    error,
    className,
}) => {
    const { t } = useTranslate();
    void t;

    // Normalize entity data to TimelineItem[] if schema data is provided
    const entityData = Array.isArray(entity) ? entity as readonly Record<string, unknown>[] : [];
    const items: readonly TimelineItem[] = React.useMemo(() => {
        if (propItems) return propItems;
        if (entityData.length === 0) return [];

        return entityData.map((record, idx) => {
            // Handle both string[] and {name: string}[] field formats from compiler
            const resolveField = (f: unknown): string => {
                if (typeof f === 'string') return f;
                if (f && typeof f === 'object' && 'name' in (f as Record<string, unknown>)) return String((f as Record<string, unknown>).name);
                return '';
            };
            const resolvedFields = fields?.map(resolveField) ?? [];
            const titleField = resolvedFields[0] || "title";
            const descField = resolvedFields[1] || "description";
            const dateField = resolvedFields.find((f) =>
                f.toLowerCase().includes("date"),
            ) || "date";
            const statusField = resolvedFields.find((f) =>
                f.toLowerCase().includes("status"),
            ) || "status";

            return {
                id: String(record.id ?? idx),
                title: String(record[titleField] ?? ""),
                description: record[descField] ? String(record[descField]) : undefined,
                date: record[dateField] ? String(record[dateField]) : undefined,
                status: (record[statusField] as TimelineItemStatus) || "pending",
            };
        });
    }, [propItems, entityData, fields]);

    if (isLoading) {
        return <LoadingState message="Loading timeline..." className={className} />;
    }

    if (error) {
        return (
            <ErrorState
                title="Timeline error"
                message={error.message}
                className={className}
            />
        );
    }

    if (items.length === 0) {
        return (
            <EmptyState
                title="No events"
                description="No timeline events to display."
                className={className}
            />
        );
    }

    return (
        <Card className={cn("p-6", className)}>
            <VStack gap="md">
                {title && (
                    <Typography variant="h5" weight="semibold">
                        {title}
                    </Typography>
                )}

                <VStack gap="none" className="relative">
                    {items.map((item, idx) => {
                        const status = (item.status as TimelineItemStatus) || "pending";
                        const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
                        const ItemIcon = item.icon || style.icon;
                        const isLast = idx === items.length - 1;

                        return (
                            <HStack key={item.id} gap="md" align="start" className="relative">
                                {/* Timeline track */}
                                <VStack align="center" className="flex-shrink-0 relative" style={{ width: "24px" }}>
                                    <Icon
                                        icon={ItemIcon}
                                        size="sm"
                                        className={cn(style.dotColor, "z-10 bg-card")}
                                    />
                                    {!isLast && (
                                        <Box
                                            className={cn(
                                                "w-0.5 flex-1 min-h-[24px]",
                                                style.lineColor,
                                                "opacity-40",
                                            )}
                                        />
                                    )}
                                </VStack>

                                {/* Content */}
                                <VStack gap="xs" className={cn("flex-1 min-w-0", !isLast && "pb-6")}>
                                    <HStack justify="between" align="start" wrap>
                                        <Typography variant="body" weight="semibold">
                                            {item.title}
                                        </Typography>
                                        {item.date && (
                                            <Typography variant="caption" color="secondary" className="flex-shrink-0">
                                                {item.date}
                                            </Typography>
                                        )}
                                    </HStack>

                                    {item.description && (
                                        <Typography variant="small" color="secondary">
                                            {item.description}
                                        </Typography>
                                    )}

                                    {item.tags && item.tags.length > 0 && (
                                        <HStack gap="xs" wrap>
                                            {item.tags.map((tag, tagIdx) => (
                                                <Badge key={tagIdx} variant="default">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </HStack>
                                    )}

                                    {itemActions && itemActions.length > 0 && (
                                        <HStack gap="xs" className="mt-1">
                                            {itemActions.map((action, actionIdx) => (
                                                <Box
                                                    key={actionIdx}
                                                    action={action.event}
                                                    actionPayload={{ row: item }}
                                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                                >
                                                    <Badge variant="default">
                                                        {action.label}
                                                    </Badge>
                                                </Box>
                                            ))}
                                        </HStack>
                                    )}
                                </VStack>
                            </HStack>
                        );
                    })}
                </VStack>
            </VStack>
        </Card>
    );
};

Timeline.displayName = "Timeline";
