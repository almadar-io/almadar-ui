'use client';
/**
 * List Organism Component
 *
 * A beautifully designed, scannable list view.
 *
 * Design inspiration: Linear, Notion, Apple Reminders
 * - Soft, harmonious color palette
 * - Refined typography with proper hierarchy
 * - Subtle shadows and depth
 * - Delightful hover micro-interactions
 * - Elegant status indicators
 *
 * Closed Circuit Compliance (Dumb Organism):
 * - Receives ALL data via props (no internal fetch)
 * - Emits events via useEventBus (UI:SELECT, UI:DESELECT, UI:VIEW)
 * - Never listens to events — only emits
 * - No internal search/filter state — trait provides filtered data
 */

import React, { useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  MoreHorizontal,
  Package,
  ChevronRight,
  Pencil,
  Eye,
} from "lucide-react";
import { Typography, Checkbox, Divider, Box, Button } from "../atoms";
import { HStack, VStack } from "../atoms/Stack";
import { Menu, type MenuItem } from "../molecules/Menu";
import { EmptyState } from "../molecules/EmptyState";
import { LoadingState } from "../molecules/LoadingState";
import { ErrorState } from "../molecules/ErrorState";
import { cn } from "../../lib/cn";
import { getNestedValue } from "../../lib/getNestedValue";
import { useEventBus } from "../../hooks/useEventBus";
import { useTranslate } from "../../hooks/useTranslate";
import type { EntityDisplayProps } from "./types";
import { EntityDisplayEvents } from "./types";

export interface ListItem {
  id: string;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  avatar?: {
    src?: string;
    alt?: string;
    initials?: string;
  };
  badge?: string | number;
  metadata?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  completed?: boolean;
  [key: string]: unknown;
  _fields?: Record<string, unknown>;
}

export interface SchemaItemAction {
  label: string;
  /** Event to dispatch on click */
  event?: string;
  navigatesTo?: string;
  /** Action placement - accepts all common placement values */
  placement?: "row" | "bulk" | "card" | "footer" | string;
  action?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "default";
  /** Click handler from generated code */
  onClick?: (row: unknown) => void;
}

/**
 * Field definition - can be a simple string or object with key/header or name/label
 */
export type FieldDef = string | { key?: string; header?: string; name?: string; label?: string };

/**
 * Normalize fields to simple string array
 */
function normalizeFields(fields: readonly FieldDef[] | undefined): string[] {
  if (!fields) return [];
  return fields.map((f) => (typeof f === "string" ? f : f.key ?? f.name ?? ''));
}

export interface ListProps extends EntityDisplayProps {
  /** Entity type name for display */
  entityType?: string;
  selectable?: boolean;
  /** Item actions - schema-driven or function-based */
  itemActions?: ((item: ListItem) => MenuItem[]) | readonly SchemaItemAction[];
  showDividers?: boolean;
  variant?: "default" | "card";
  emptyMessage?: string;
  renderItem?: (item: ListItem, index: number) => React.ReactNode;
  children?: React.ReactNode;
  /** Fields to display - accepts string[] or {key, header}[] for unified interface */
  fields: readonly FieldDef[];
  /** Alias for fields - backwards compatibility */
  fieldNames?: readonly string[];
}

// Refined color palette for status indicators using CSS variables
const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; dot: string; border: string }
> = {
  complete: {
    bg: "bg-success/10",
    text: "text-success",
    dot: "bg-success ring-4 ring-success/20",
    border: "border-success/30",
  },
  active: {
    bg: "bg-info/10",
    text: "text-info",
    dot: "bg-info ring-4 ring-info/20",
    border: "border-info/30",
  },
  pending: {
    bg: "bg-warning/10",
    text: "text-warning",
    dot: "bg-warning ring-4 ring-warning/20",
    border: "border-warning/30",
  },
  blocked: {
    bg: "bg-error/10",
    text: "text-error",
    dot: "bg-error ring-4 ring-error/20",
    border: "border-error/30",
  },
  high: {
    bg: "bg-warning/10",
    text: "text-warning",
    dot: "bg-warning ring-4 ring-warning/20",
    border: "border-warning/30",
  },
  medium: {
    bg: "bg-accent/10",
    text: "text-accent",
    dot: "bg-accent ring-4 ring-accent/20",
    border: "border-accent/30",
  },
  low: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground ring-4 ring-muted-foreground/20",
    border: "border-border",
  },
  default: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground ring-4 ring-muted-foreground/20",
    border: "border-border",
  },
};

function getStatusStyle(fieldName: string, value: string) {
  const val = String(value).toLowerCase();

  if (val.includes("complete") || val.includes("done"))
    return STATUS_STYLES.complete;
  if (val.includes("active") || val.includes("progress"))
    return STATUS_STYLES.active;
  if (val.includes("pending") || val.includes("waiting"))
    return STATUS_STYLES.pending;
  if (val.includes("block") || val.includes("cancel"))
    return STATUS_STYLES.blocked;
  if (val.includes("high") || val.includes("urgent")) return STATUS_STYLES.high;
  if (val.includes("medium") || val.includes("normal"))
    return STATUS_STYLES.medium;
  if (val.includes("low")) return STATUS_STYLES.low;

  return STATUS_STYLES.default;
}

function formatValue(value: unknown, fieldName: string): string {
  if (typeof value === "number") {
    if (
      fieldName.toLowerCase().includes("progress") ||
      fieldName.toLowerCase().includes("percent")
    ) {
      return `${value}%`;
    }
    if (
      fieldName.toLowerCase().includes("budget") ||
      fieldName.toLowerCase().includes("cost")
    ) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value);
    }
    return value.toLocaleString();
  }
  if (value instanceof Date) {
    return value.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
  return String(value);
}

function formatFieldLabel(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/Id$/, "")
    .trim();
}

// Custom Badge component with refined styling
const StatusBadge: React.FC<{ value: string; fieldName: string }> = ({
  value,
  fieldName,
}) => {
  const style = getStatusStyle(fieldName, value);
  return (
    <Typography
      as="span"
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide",
        "border shadow-sm backdrop-blur-sm transition-colors",
        style.bg,
        style.text,
        style.border,
      )}
    >
      <Typography
        as="span"
        className={cn(
          "w-1.5 h-1.5 rounded-full shadow-sm",
          style.dot,
        )}
      />
      {value}
    </Typography>
  );
};

// Elegant progress bar
const ProgressIndicator: React.FC<{ value: number }> = ({ value }) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  return (
    <Box className="flex items-center gap-2 min-w-[100px]">
      <Box className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <Box
          className={cn(
            "h-full rounded-full transition-all duration-500",
            clampedValue >= 100
              ? "bg-success"
              : clampedValue >= 70
                ? "bg-info"
                : clampedValue >= 40
                  ? "bg-warning"
                  : "bg-muted-foreground",
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </Box>
      <Typography
        as="span"
        className="text-xs font-medium text-muted-foreground tabular-nums w-8 text-right"
      >
        {clampedValue}%
      </Typography>
    </Box>
  );
};

export const List: React.FC<ListProps> = ({
  entity,
  isLoading = false,
  error,
  selectable = false,
  selectedIds = [],
  itemActions,
  emptyMessage,
  className,
  renderItem: customRenderItem,
  fields,
  fieldNames,
  entityType,
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const resolvedEmptyMessage = emptyMessage ?? t('empty.noData');

  // Support fields and fieldNames (alias) - normalize to string[]
  const effectiveFieldNames =
    normalizeFields(fields).length > 0 ? normalizeFields(fields) : fieldNames;

  // Normalize entity data: handle arrays, single objects
  const rawItems = useMemo(() => {
    if (Array.isArray(entity)) return entity;
    if (entity && typeof entity === "object" && "id" in entity) return [entity];
    return [];
  }, [entity]);

  const getItemActions = React.useCallback(
    (item: ListItem): MenuItem[] => {
      if (!itemActions) return [];

      if (typeof itemActions === "function") {
        return itemActions(item);
      }

      return (itemActions as SchemaItemAction[]).map((action, idx) => ({
        id: `${item.id}-action-${idx}`,
        label: action.label,
        event: action.event,
        onClick: () => {
          // Handle navigation if navigatesTo is defined
          if (action.navigatesTo) {
            const url = action.navigatesTo.replace(/\{\{(\w+)\}\}/g, (_, key) =>
              String(item[key] || item.id || ""),
            );
            eventBus.emit('UI:NAVIGATE', { url, row: item });
            return;
          }
          // Dispatch event via event bus if defined (for trait state machine integration)
          if (action.event) {
            eventBus.emit(`UI:${action.event}`, {
              row: item,
            });
          }
        },
      }));
    },
    [itemActions, eventBus],
  );

  const normalizedItemActions = itemActions ? getItemActions : undefined;

  if (isLoading) {
    return (
      <LoadingState
        message="Loading items..."
        className={className}
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <EmptyState
        icon={Package}
        title="Error loading items"
        description={error.message}
        className={className}
      />
    );
  }

  const safeItems: ListItem[] = Array.isArray(rawItems)
    ? rawItems.map((item, index) => {
      if (typeof item === "object" && item !== null) {
        const normalizedItem = {
          ...item,
          id: (item as ListItem).id || `item-${index}`,
        } as ListItem;

        if (effectiveFieldNames && effectiveFieldNames.length > 0) {
          const firstField = effectiveFieldNames[0];
          const itemRecord = item as Record<string, unknown>;

          if (
            !normalizedItem.title &&
            getNestedValue(itemRecord, firstField)
          ) {
            normalizedItem.title = String(
              getNestedValue(itemRecord, firstField),
            );
          }

          normalizedItem._fields = effectiveFieldNames.reduce(
            (acc, field) => {
              const value = getNestedValue(itemRecord, field);
              if (value !== undefined && value !== null) {
                acc[field] = value;
              }
              return acc;
            },
            {} as Record<string, unknown>,
          );
        }

        return normalizedItem;
      }
      return { id: `item-${index}`, title: String(item) } as ListItem;
    })
    : [];

  const handleSelect = (itemId: string, checked: boolean) => {
    if (!selectable) return;
    const currentIds = [...selectedIds].map(String);
    if (checked) {
      const newIds = [...currentIds, itemId];
      eventBus.emit(`UI:${EntityDisplayEvents.SELECT}`, { ids: newIds });
    } else {
      const newIds = currentIds.filter((id) => id !== itemId);
      eventBus.emit(`UI:${EntityDisplayEvents.DESELECT}`, { ids: newIds });
    }
  };



  const defaultRenderItem = (
    item: ListItem,
    index: number,
    isLast: boolean,
  ) => {
    const isSelected = selectedIds.map(String).includes(item.id);

    // Get all actions once
    const actions = normalizedItemActions ? normalizedItemActions(item) : [];
    const hasActions = actions.length > 0;

    // Find specific actions for UI promotion
    const viewAction = actions.find(
      (a) =>
        a.label.toLowerCase().includes("view") ||
        a.label.toLowerCase() === "open",
    );
    const editAction = actions.find((a) =>
      a.label.toLowerCase().includes("edit"),
    );

    // Row click dispatches VIEW via event bus action prop
    const hasExplicitClick = !!(viewAction?.event || item.onClick);
    const rowAction = viewAction?.event ?? "VIEW";
    const rowActionPayload = { row: item };

    // Categorize fields
    const primaryField = effectiveFieldNames?.[0];
    const statusField = effectiveFieldNames?.find((f) =>
      f.toLowerCase().includes("status"),
    );
    const priorityField = effectiveFieldNames?.find((f) =>
      f.toLowerCase().includes("priority"),
    );
    const progressField = effectiveFieldNames?.find(
      (f) =>
        f.toLowerCase().includes("progress") ||
        f.toLowerCase().includes("percent"),
    );
    const dateFields =
      effectiveFieldNames?.filter(
        (f) =>
          f.toLowerCase().includes("date") || f.toLowerCase().includes("due"),
      ) || [];
    const metadataFields =
      effectiveFieldNames
        ?.filter(
          (f) =>
            f !== primaryField &&
            f !== statusField &&
            f !== priorityField &&
            f !== progressField &&
            !dateFields.includes(f),
        )
        .slice(0, 2) || [];

    // Get status for left indicator
    const statusValue = statusField ? item._fields?.[statusField] : null;
    const statusStyle = statusValue
      ? getStatusStyle(statusField!, String(statusValue))
      : null;

    // Get progress value
    const progressValue = progressField ? item._fields?.[progressField] : null;
    const hasProgress = typeof progressValue === "number";

    return (
      <Box key={item.id}>
        <Box
          className={cn(
            "group flex items-center gap-5 px-6 py-5",
            "transition-all duration-300 ease-out",
            hasExplicitClick && "cursor-pointer",
            // Hover state
            "hover:bg-muted/80",
            // Selected state
            isSelected && "bg-primary/10 shadow-inner",
            item.disabled && "opacity-50 cursor-not-allowed grayscale",
          )}
          action={rowAction}
          actionPayload={rowActionPayload}
        >
          {/* Checkbox if selectable */}
          {selectable && (
            <Box
              className="flex-shrink-0 pt-0.5"
              action={isSelected ? EntityDisplayEvents.DESELECT : EntityDisplayEvents.SELECT}
              actionPayload={{ ids: isSelected ? selectedIds.filter((sid) => String(sid) !== item.id) : [...selectedIds.map(String), item.id] }}
            >
              <Checkbox
                checked={isSelected}
                onChange={(e) => handleSelect(item.id, e.target.checked)}
                className={cn(
                  "transition-transform active:scale-95",
                  isSelected
                    ? "border-primary bg-primary"
                    : "border-border",
                )}
              />
            </Box>
          )}

          {/* Main content */}
          <Box className="flex-1 min-w-0 space-y-2.5">
            {/* Primary row: Title + Badges */}
            <HStack className="flex items-center gap-4">
              <Typography
                as="h3"
                className={cn(
                  "text-[15px] font-semibold text-foreground truncate flex-1",
                  "tracking-tight leading-snug",
                  item.completed &&
                  "line-through text-muted-foreground",
                )}
              >
                {item.title || "Untitled"}
              </Typography>

              {/* Status & Priority badges */}
              <HStack className="flex items-center gap-2 flex-shrink-0">
                {!!statusValue && (
                  <StatusBadge
                    value={String(statusValue)}
                    fieldName={statusField!}
                  />
                )}
                {!!(priorityField && item._fields?.[priorityField]) && (
                  <StatusBadge
                    value={String(item._fields![priorityField])}
                    fieldName={priorityField}
                  />
                )}
              </HStack>
            </HStack>

            {/* Secondary row: Metadata */}
            <HStack className="flex items-center gap-6 text-[13px] font-medium text-muted-foreground">
              {/* Date fields with icon */}
              {dateFields.slice(0, 1).map((field) => {
                const value = item._fields?.[field];
                if (!value) return null;
                return (
                  <Typography
                    as="span"
                    key={field}
                    className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <Typography as="span">{formatValue(value, field)}</Typography>
                  </Typography>
                );
              })}

              {/* Other metadata fields */}
              {metadataFields.map((field, i) => {
                const value = item._fields?.[field];
                if (value === undefined || value === null) return null;
                return (
                  <Typography
                    as="span"
                    key={field}
                    className="truncate flex items-center gap-1.5 text-muted-foreground"
                  >
                    <Typography as="span" className="opacity-75">
                      {formatFieldLabel(field)}:
                    </Typography>
                    <Typography as="span" className="text-foreground">
                      {formatValue(value, field)}
                    </Typography>
                  </Typography>
                );
              })}

              {/* Progress indicator */}
              {hasProgress && (
                <Box className="ml-auto">
                  <ProgressIndicator value={progressValue as number} />
                </Box>
              )}
            </HStack>
          </Box>

          {/* Actions - visible on hover */}
          {/* Actions - visible on hover */}
          <HStack
            className={cn(
              "flex items-center gap-1 flex-shrink-0 transition-opacity duration-200",
              "opacity-0 group-hover:opacity-100",
            )}
          >
            {/* Direct Edit Action */}
            {editAction && (
              <Button
                variant="ghost"
                action={editAction.event}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  "hover:bg-primary/10 hover:text-primary",
                  "text-muted-foreground",
                  "active:scale-95",
                )}
                title={editAction.label}
                data-testid={editAction.event ? `action-${editAction.event}` : undefined}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}

            {/* Direct View Action */}
            {viewAction && (
              <Button
                variant="ghost"
                action={viewAction.event}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  "hover:bg-muted hover:text-foreground",
                  "text-muted-foreground",
                  "active:scale-95",
                )}
                title={viewAction.label}
                data-testid={viewAction.event ? `action-${viewAction.event}` : undefined}
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}

            {/* Overflow Menu for filtered actions */}
            {(() => {
              const filteredActions = actions.filter(
                (a) =>
                  !a.label.toLowerCase().includes("edit") &&
                  !a.label.toLowerCase().includes("view") &&
                  !a.label.toLowerCase().includes("open"),
              );

              return filteredActions.length > 0 ? (
                <Menu
                  trigger={
                    <Button
                      variant="ghost"
                      className={cn(
                        "p-2 rounded-lg transition-all duration-200",
                        "hover:bg-muted hover:shadow-sm",
                        "text-muted-foreground hover:text-foreground",
                        "active:scale-95",
                      )}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  }
                  items={filteredActions}
                  position="bottom-right"
                />
              ) : null;
            })()}

            {hasExplicitClick && (
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
            )}
          </HStack>
        </Box>

        {/* Subtle divider - inset */}
        {!isLast && (
          <Box className="ml-[calc(1.5rem)] mr-6 border-b border-border/40" />
        )}
      </Box>
    );
  };

  if (safeItems.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No items found"
        description={resolvedEmptyMessage}
        className={className}
      />
    );
  }

  return (
    <Box
      className={cn(
        // Container with refined styling
        "bg-card backdrop-blur-sm",
        "rounded-xl", // Increased rounding
        "border border-border",
        "shadow-lg", // Softer, improved shadow
        "overflow-hidden",
        className,
      )}
    >
      {safeItems.map((item, index) =>
        customRenderItem
          ? customRenderItem(item, index)
          : defaultRenderItem(item, index, index === safeItems.length - 1),
      )}
    </Box>
  );
};

List.displayName = "List";
