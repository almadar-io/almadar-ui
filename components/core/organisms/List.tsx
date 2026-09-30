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
import type { AssetUrl, EventKey, EventEmit, EventPayload, FieldValue, EntityRow } from "@almadar/core";
import type { ItemActionPayload } from "@almadar/core/patterns";
import { Icon, type IconInput } from "../atoms/Icon";
import { Badge } from "../atoms/Badge";
import type { DisplayField } from "../atoms/types";
import {
  Calendar,
  MoreHorizontal,
  Package,
  ChevronRight,
} from "lucide-react";
import { Typography, Checkbox, Divider, Box, Button } from "../atoms/index";
import { HStack, VStack } from "../atoms/Stack";
import { Menu, type MenuItem } from "../molecules/Menu";
import { EmptyState } from "../molecules/EmptyState";
import { LoadingState } from "../molecules/LoadingState";
import { ErrorState } from "../molecules/ErrorState";
import { cn } from "../../../lib/cn";
import { formatValue } from "../../../lib/format";
import { rowActivationProps } from "../../../lib/pressable";
import { normalizeDisplayFields, badgeVariantFor, titleFieldOf, valueLabelFor } from "../../../lib/displayField";
import { getNestedValue } from "../../../lib/getNestedValue";
import { useEventBus } from "../../../hooks/useEventBus";
import { useRowActions } from "../../../hooks/useRowActions";
import type { RowActionCondition } from "../../../lib/row-action-when";
import { useTranslate, useFormatContext } from "../../../hooks/useTranslate";
import type { DisplayStateProps } from "./types";
import { EntityDisplayEvents } from "./types";

export type ListItem = {
  id: string;
  title?: string;
  description?: string;
  icon?: IconInput;
  avatar?: {
    src?: AssetUrl;
    alt?: string;
    initials?: string;
  };
  badge?: string | number;
  metadata?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  completed?: boolean;
  _fields?: Record<string, FieldValue | undefined>;
};

export interface SchemaItemAction {
  label: string;
  /** Event to dispatch on click */
  event?: EventKey;
  navigatesTo?: string;
  /** Action placement - accepts all common placement values */
  placement?: "row" | "bulk" | "card" | "footer" | string;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "default";
  /** Declaring an icon draws the action as an inline icon button; actions without one go in the overflow menu. */
  icon?: IconInput;
  /** Click handler from generated code */
  onClick?: (row: EntityRow) => void;
  /** Per-row condition, authored as `(fn row <bool>)`: the row's action is drawn only when it returns true. Omit = always shown. */
  when?: RowActionCondition;
}

/** A field is a plain name or a declared {@link DisplayField}. */
export type FieldDef = string | DisplayField;

/**
 * Extract bus-safe entity fields from a ListItem.
 *
 * ListItem is a component prop shape: it carries UI decorators (LucideIcon
 * refs, ReactNode metadata, onClick handler) alongside the entity fields.
 * When we emit `{ row: item }` onto the bus, only the JSON-serializable
 * entity data should flow — trait reducers don't consume component refs.
 * This helper strips the UI-only keys and returns an EventPayload-safe row.
 */
function entityFieldsFromListItem(item: ListItem): EventPayload {
  const {
    icon: _icon,
    metadata: _metadata,
    onClick: _onClick,
    avatar: _avatar,
    _fields,
    ...rest
  } = item;
  const result: EventPayload = {};
  for (const [key, value] of Object.entries(rest)) {
    // Filter out any remaining non-EventPayloadValue shapes (functions, class
    // instances, React elements). The index signature on ListItem is `unknown`,
    // so TS can't narrow for us; runtime typeof check keeps the emit clean.
    if (
      typeof value === 'function' ||
      (value !== null && typeof value === 'object' && '$$typeof' in (value as object))
    ) {
      continue;
    }
    result[key] = value as EventPayload[string];
  }
  if (_fields && typeof _fields === 'object') {
    for (const [k, v] of Object.entries(_fields)) {
      if (typeof v !== 'function') {
        result[k] = v as EventPayload[string];
      }
    }
  }
  return result;
}

export interface ListProps extends DisplayStateProps {
  /** Entity data (single record or collection). */
  entity?: EntityRow | readonly EntityRow[];
  /** Entity type name for display */
  entityType?: string;
  selectable?: boolean;
  /** Item actions - schema-driven or function-based */
  itemActions?: ((item: ListItem) => MenuItem[]) | readonly SchemaItemAction[];
  showDividers?: boolean;
  variant?: "default" | "card";
  emptyMessage?: string;
  /** Render function for each item. In .lolo: renderItem: (fn item <Component …={@item.field}/>), binding per-item fields via @item.field. */
  renderItem?: (item: ListItem, index: number) => React.ReactNode;
  children?: React.ReactNode;
  /** Fields to display: field names, or declared fields ({ name, label, variant, format, colorMap, labels }) */
  fields: readonly FieldDef[];
  /** Alias for fields - backwards compatibility */
  fieldNames?: readonly string[];
  /** When set, clicking a row emits UI:{itemClickEvent} with { id, row }. Omit = rows are not clickable. */
  /** @entityRow row */
  itemClickEvent?: EventEmit<ItemActionPayload>;
  /** Row field that marks an item completed (`true` strikes its title through) */
  completedField?: string;
  /** Row field that marks an item disabled (`true` dims the row and disables its click) */
  disabledField?: string;
}

// Elegant progress bar
const ProgressIndicator: React.FC<{ value: number }> = ({ value }) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  return (
    <Box className="flex items-center gap-2 min-w-[100px]">
      <Box className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <Box
          className={cn(
            "h-full rounded-full transition-all duration-slow",
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
  itemClickEvent,
  completedField,
  disabledField,
  entityType,
}) => {
  const eventBus = useEventBus();
  const rowActions = useRowActions();
  const { t } = useTranslate();
  const fmt = useFormatContext();
  const resolvedEmptyMessage = emptyMessage ?? t('empty.noData');

  const declaredFields = normalizeDisplayFields(fields);
  const effectiveFields = declaredFields.length > 0 ? declaredFields : normalizeDisplayFields(fieldNames);
  const titleField = titleFieldOf(effectiveFields);

  // Normalize entity data: handle arrays, single objects
  const rawItems = useMemo(() => {
    if (Array.isArray(entity)) return entity;
    if (entity && typeof entity === "object" && "id" in entity) return [entity];
    return [];
  }, [entity]);

  const getItemActions = React.useCallback(
    (item: ListItem, row: EntityRow): MenuItem[] => {
      if (!itemActions) return [];

      if (typeof itemActions === "function") {
        return itemActions(item);
      }

      return rowActions(itemActions as readonly SchemaItemAction[], row).map((action, idx) => ({
        id: `${item.id}-action-${idx}`,
        label: action.label,
        icon: action.icon,
        event: action.event,
        onClick: () => {
          // ListItem carries UI-level decorators (LucideIcon, ReactNode metadata,
          // onClick handler, ...) alongside the entity fields. The bus payload
          // only forwards the JSON-safe entity data; we pick off the wire-safe
          // fields and drop the UI-only ones at the boundary.
          const row = entityFieldsFromListItem(item);
          // Handle navigation if navigatesTo is defined
          if (action.navigatesTo) {
            const url = action.navigatesTo.replace(/\{\{(\w+)\}\}/g, (_, key) =>
              String(row[key] ?? item.id ?? ""),
            );
            eventBus.emit('UI:NAVIGATE', { url, row });
            return;
          }
          // Dispatch event via event bus if defined (for trait state machine integration)
          if (action.event) {
            eventBus.emit(`UI:${action.event}`, { row });
          }
        },
      }));
    },
    [itemActions, eventBus, rowActions],
  );

  const normalizedItemActions = itemActions ? getItemActions : undefined;

  if (isLoading) {
    return (
      <LoadingState
        message={t('error.loadingItems')}
        className={className}
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <EmptyState
        icon={Package}
        title={t('error.somethingWentWrong')}
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

        if (effectiveFields.length > 0) {
          if (titleField) {
            const titleValue = getNestedValue(item, titleField.name);
            if (titleValue !== undefined && titleValue !== null) normalizedItem.title = String(titleValue);
          }

          normalizedItem._fields = effectiveFields.reduce(
            (acc, field) => {
              const value = getNestedValue(item, field.name);
              if (value !== undefined && value !== null) {
                acc[field.name] = value as FieldValue;
              }
              return acc;
            },
            {} as Record<string, FieldValue | undefined>,
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
    const actions = normalizedItemActions ? normalizedItemActions(item, rawItems[index] ?? {}) : [];
    const hasActions = actions.length > 0;

    const inlineActions = actions.filter((a) => a.icon !== undefined);
    const overflowActions = actions.filter((a) => a.icon === undefined);

    const rawRow = rawItems[index] ?? {};
    const isCompleted = completedField !== undefined && rawRow[completedField] === true;
    const isDisabled = disabledField !== undefined && rawRow[disabledField] === true;
    const hasExplicitClick = !!itemClickEvent && !isDisabled;
    const rowActionPayload: EventPayload = { id: item.id, row: entityFieldsFromListItem(item) };

    const badgeFields = effectiveFields.filter((f) => f.variant === 'badge' && f !== titleField);
    const progressFields = effectiveFields.filter((f) => f.variant === 'progress' && f !== titleField);
    const metadataFields = effectiveFields.filter(
      (f) => f !== titleField && f.variant !== 'badge' && f.variant !== 'progress',
    );
    const fieldLabel = (f: DisplayField) => f.label ?? f.name;

    return (
      <Box key={item.id}>
        <Box
          className={cn(
            "group flex items-center gap-5 px-6 py-5",
            "transition-all duration-normal ease-standard",
            hasExplicitClick && "cursor-pointer",
            // Hover state
            "hover:bg-muted/80",
            // Selected state
            isSelected && "bg-primary/10 shadow-elevation-pressed",
            isDisabled && "opacity-50",
          )}
          aria-disabled={isDisabled || undefined}
          {...rowActivationProps(hasExplicitClick ? () => eventBus.emit(`UI:${itemClickEvent}`, rowActionPayload) : undefined)}
        >
          {/* Checkbox if selectable */}
          {selectable && (
            <Box
              className="flex-shrink-0 pt-0.5"
              role="none"
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
            {(titleField || badgeFields.length > 0) && (
              <HStack className="flex items-center gap-4">
                {titleField && item.title && (
                  <Typography
                    as="h3"
                    className={cn("heading-voice text-base text-foreground truncate flex-1 leading-snug", isCompleted && "line-through text-muted-foreground")}
                  >
                    {item.title}
                  </Typography>
                )}

                <HStack className="flex items-center gap-2 flex-shrink-0">
                  {badgeFields.map((field) => {
                    const badgeValue = item._fields?.[field.name];
                    if (badgeValue === undefined || badgeValue === null || badgeValue === "") return null;
                    return (
                      <Badge key={field.name} variant={badgeVariantFor(String(badgeValue), field.colorMap)}>
                        {valueLabelFor(String(badgeValue), field.labels)}
                      </Badge>
                    );
                  })}
                </HStack>
              </HStack>
            )}

            {/* Secondary row: Metadata */}
            <HStack className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
              {metadataFields.map((field) => {
                const value = item._fields?.[field.name];
                if (value === undefined || value === null || value === "") return null;
                const text = formatValue(value, field.format, fmt);
                if (field.variant === "body") {
                  return (
                    <Typography as="span" key={field.name} className="text-foreground">
                      {text}
                    </Typography>
                  );
                }
                const lead = field.icon ? (
                  <Icon {...(typeof field.icon === "string" ? { name: field.icon } : { icon: field.icon })} size="xs" />
                ) : field.format === "date" ? (
                  <Calendar className="w-3.5 h-3.5" />
                ) : null;
                return (
                  <Typography
                    as="span"
                    key={field.name}
                    className="truncate flex items-center gap-1.5 text-muted-foreground"
                  >
                    {lead ?? (
                      <Typography as="span" className="opacity-75">
                        {fieldLabel(field)}:
                      </Typography>
                    )}
                    <Typography as="span" className="text-foreground">
                      {text}
                    </Typography>
                  </Typography>
                );
              })}

              {progressFields.map((field) => {
                const value = item._fields?.[field.name];
                if (typeof value !== "number") return null;
                return (
                  <Box key={field.name} className="ml-auto">
                    <ProgressIndicator value={value} />
                  </Box>
                );
              })}
            </HStack>
          </Box>

          {/* Actions */}
          <HStack className="flex items-center gap-1 flex-shrink-0">
            {inlineActions.map((action, idx) => (
              <Button
                key={action.id ?? idx}
                variant="ghost"
                action={action.event}
                onClick={action.event ? undefined : action.onClick}
                className={cn(
                  "p-2 rounded-container transition-all duration-fast",
                  "hover:bg-muted hover:text-foreground",
                  "text-muted-foreground",
                  "active:scale-95",
                )}
                title={action.label}
                data-testid={action.event ? `action-${action.event}` : undefined}
              >
                {typeof action.icon === "string" ? (
                  <Icon name={action.icon} size="sm" />
                ) : (
                  <Icon icon={action.icon} size="sm" />
                )}
              </Button>
            ))}

            {overflowActions.length > 0 && (
              <Menu
                trigger={
                  <Button
                    variant="ghost"
                    className={cn(
                      "p-2 rounded-container transition-all duration-fast",
                      "hover:bg-muted hover:shadow-elevation-card",
                      "text-muted-foreground hover:text-foreground",
                      "active:scale-95",
                    )}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                }
                items={overflowActions}
                position="bottom-right"
              />
            )}

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
        title={t('error.noItemsFound')}
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
        "rounded-container",
        "border border-border",
        "shadow-elevation-card",
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
