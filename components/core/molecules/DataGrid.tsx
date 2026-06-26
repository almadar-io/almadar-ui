'use client';
/**
 * DataGrid Molecule
 *
 * A simplified, schema-driven card grid for iterating over entity data.
 * Extracted from the CardGrid organism with all complexity removed:
 * no built-in search, sort, filter, pagination, selection, or bulk actions.
 *
 * Accepts `fields` config for per-field rendering control (icon, variant, format)
 * and `itemActions` for per-item event bus wiring.
 *
 * Uses atoms only internally: Box, VStack, HStack, Typography, Badge, Button, Icon.
 */
import React, { useCallback, useEffect, useState } from 'react';
import type { EntityRow, EventKey, FieldValue } from '@almadar/core';
import type { ItemActionPayload, SelectionChangePayload } from '@almadar/patterns';
import { cn } from '../../../lib/cn';
import { createLogger } from '@almadar/logger';

const dataGridLog = createLogger('almadar:ui:data-grid');
import { getNestedValue } from '../../../lib/getNestedValue';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';
import { Box } from '../atoms/Box';
import { VStack, HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Badge, type BadgeVariant } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import type { IconInput } from '../atoms';
import { InfiniteScrollSentinel } from '../atoms/InfiniteScrollSentinel';
import { Menu } from './Menu';
import { useDataDnd, type DataDndProps } from './useDataDnd';
import type { UiError } from '../atoms/types';

// ── Field Definition ─────────────────────────────────────────────────

export interface DataGridField {
  /** Entity field name (dot-notation supported) */
  name: string;
  /** Display label (auto-generated from name if omitted) */
  label?: string;
  /** Lucide icon name or component to show beside the field */
  icon?: IconInput;
  /** Rendering variant: 'h3' for title, 'body' for text, 'caption' for small,
   *  'badge' for status badge, 'progress' for progress display */
  variant?: 'h3' | 'h4' | 'body' | 'caption' | 'badge' | 'small' | 'progress';
  /** Optional format function name: 'date', 'currency', 'number', 'boolean' */
  format?: 'date' | 'currency' | 'number' | 'boolean' | 'percent';
  /**
   * Per-value color mapping for `variant: 'badge'`. Keys are exact field
   * values; values are Badge variant names. Accepts the shadcn-style
   * `destructive` alias and normalises it to `danger` at render time. When
   * present, takes precedence over the built-in `statusVariant` heuristic.
   *
   * Example:
   *   colorMap: { active: 'success', pending: 'warning', failed: 'destructive' }
   */
  colorMap?: Record<string, string>;
}

// ── Item Action Definition ───────────────────────────────────────────

export interface DataGridItemAction {
  /** Button label */
  label: string;
  /** Event name to emit (dispatched as UI:{event} with { row: itemData }) */
  event: EventKey;
  /** Lucide icon name or component */
  icon?: IconInput;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

// ── Props ────────────────────────────────────────────────────────────

export interface DataGridProps extends DataDndProps {
  /**
   * Schema entity data — the collection of rows to render. pattern-sync tags
   * it `kind:"entity", cardinality:"collection"` so consumers bind the domain
   * entity without name-matching the prop.
   */
  entity: readonly EntityRow[];
  /**
   * Field definitions for rendering each card. The pattern contract in
   * `@almadar/patterns` documents `columns` as the wire-format alias the
   * compiler emits — both names resolve to the same shape here. Pass either.
   */
  fields?: readonly DataGridField[];
  /** Alias for `fields` — the compiler emits `columns` for field defs. */
  columns?: readonly DataGridField[];
  /** Per-item action buttons */
  itemActions?: readonly DataGridItemAction[];
  /** Max inline primary action buttons before the rest collapse into a "⋯" overflow menu. Omit = all inline. */
  maxInlineActions?: number;
  /** Lay items in a single horizontally-scrolling row (kanban columns) sized to `minCardWidth` instead of a wrapping grid. */
  scrollX?: boolean;
  /** Number of columns (uses auto-fit if omitted) */
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Gap between cards */
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Minimum card width in pixels (used when cols is not set, default 280) */
  minCardWidth?: number;
  /** Additional CSS classes */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: UiError | null;
  /** Entity field name containing an image URL for card thumbnails */
  imageField?: string;
  /** Enable multi-select with checkboxes */
  selectable?: boolean;
  /** Selection change event name (emits UI:{selectionEvent} with { selectedIds: string[] }) */
  selectionEvent?: EventKey;
  /** Enable infinite scroll loading */
  infiniteScroll?: boolean;
  /** Event emitted when more items needed: UI:{loadMoreEvent} */
  loadMoreEvent?: EventKey;
  /** Whether more items are available for infinite scroll */
  hasMore?: boolean;
  /** Render prop for custom per-card content. When provided, `fields` and
   *  `itemActions` are ignored. */
  children?: (item: EntityRow, index: number) => React.ReactNode;
  /**
   * Per-item render function (schema-level alias for children render prop).
   * In .orb schemas: ["fn", "item", { pattern tree with @item.field bindings }]
   * The compiler converts this to the children render prop.
   * @deprecated Use children render prop in React code. This prop exists for pattern registry sync.
   */
  renderItem?: (item: EntityRow, index: number) => React.ReactNode;
  /** Max items to show before "Show More" button. Defaults to 0 (disabled). */
  pageSize?: number;
  /**
   * Layer 2 visual treatment — mirrors the `entity-table` look enum so
   * data-grid / data-list / entity-table share one knob name from authors.
   */
  look?: "dense" | "spacious" | "striped" | "borderless" | "card-rows";
}

// ── Helpers ──────────────────────────────────────────────────────────

function renderIconInput(icon: IconInput, props: React.ComponentProps<typeof Icon>): React.ReactElement {
  return typeof icon === 'string'
    ? <Icon name={icon} {...props} />
    : <Icon icon={icon} {...props} />;
}

function fieldLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusVariant(value: string): 'success' | 'warning' | 'error' | 'info' | 'default' {
  const v = value.toLowerCase();
  if (['active', 'completed', 'done', 'approved', 'published', 'resolved', 'open', 'online'].includes(v)) return 'success';
  if (['pending', 'in_progress', 'in-progress', 'review', 'draft', 'processing', 'warning'].includes(v)) return 'warning';
  if (['inactive', 'deleted', 'rejected', 'failed', 'error', 'blocked', 'closed', 'offline'].includes(v)) return 'error';
  if (['new', 'created', 'scheduled', 'queued', 'info'].includes(v)) return 'info';
  return 'default';
}

const BADGE_VARIANTS = new Set<BadgeVariant>([
  'default', 'primary', 'secondary', 'success', 'warning', 'danger', 'error', 'info', 'neutral',
]);

/**
 * Resolve the badge variant for a given field value. Prefers the field's
 * explicit `colorMap` when present; falls back to the legacy `statusVariant`
 * heuristic. Normalises shadcn-style `destructive` to the `danger` variant.
 */
function resolveBadgeVariant(field: DataGridField, value: string): BadgeVariant {
  const fromMap = field.colorMap?.[value];
  if (fromMap) {
    const normalised: string = fromMap === 'destructive' ? 'danger' : fromMap;
    if (BADGE_VARIANTS.has(normalised as BadgeVariant)) {
      return normalised as BadgeVariant;
    }
  }
  return statusVariant(value);
}

function formatDate(value: FieldValue | undefined): string {
  if (!value) return '';
  const d = new Date(String(value));
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatValue(value: FieldValue | undefined, format?: DataGridField['format']): string {
  if (value === undefined || value === null) return '';
  switch (format) {
    case 'date': return formatDate(value);
    case 'currency': return typeof value === 'number' ? `$${value.toFixed(2)}` : String(value);
    case 'number': return typeof value === 'number' ? value.toLocaleString() : String(value);
    case 'percent': return typeof value === 'number' ? `${Math.round(value)}%` : String(value);
    case 'boolean': return value ? 'Yes' : 'No';
    default: return String(value);
  }
}

const gapStyles: Record<string, string> = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

// ── Component ────────────────────────────────────────────────────────

// Layer 2 look styles for DataGrid — applied to the grid's child item
// containers via `[&>*]:` selectors. Tuned to be visibly distinct in
// Storybook: gap and per-item padding/radius/border do the work since
// the grid itself is just a flex/grid layout container.
const lookStyles: Record<NonNullable<DataGridProps['look']>, string> = {
  dense: 'gap-2 [&>*]:p-card-sm',
  spacious: 'gap-8 [&>*]:p-card-lg',
  striped: '[&>*:nth-child(even)]:bg-muted/30',
  borderless: '[&>*]:border-0 [&>*]:shadow-none',
  'card-rows': '[&>*]:shadow-elevation-card [&>*]:rounded-container [&>*]:border [&>*]:border-border [&>*]:p-card-md',
};

export function DataGrid({
  entity,
  fields,
  columns,
  itemActions,
  maxInlineActions,
  scrollX = false,
  cols,
  gap = 'md',
  minCardWidth = 280,
  className,
  isLoading = false,
  error = null,
  imageField,
  selectable = false,
  selectionEvent,
  infiniteScroll,
  loadMoreEvent,
  hasMore,
  children,
  pageSize = 0,
  renderItem: schemaRenderItem,
  dragGroup,
  accepts,
  sortable,
  dropEvent,
  reorderEvent,
  positionEvent,
  dndItemIdField,
  dndRoot,
  look = 'dense',
}: DataGridProps) {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(pageSize || Infinity);

  // Honor the pattern-types alias: compiler emits `columns`, the React API
  // accepts `fields`. Either resolves to the same shape; missing both yields
  // an empty list rather than a TypeError on `.find`.
  const fieldDefs: readonly DataGridField[] = fields ?? columns ?? [];

  const allDataRaw = Array.isArray(entity) ? entity : entity ? [entity] : [];
  const dnd = useDataDnd({
    items: allDataRaw as readonly EntityRow[],
    layout: 'grid',
    dragGroup,
    accepts,
    sortable,
    dropEvent,
    reorderEvent,
    positionEvent,
    dndItemIdField,
    dndRoot,
  });
  const allData = dnd.orderedItems;
  const data = pageSize > 0 ? allData.slice(0, visibleCount) : allData;
  const hasMoreLocal = pageSize > 0 && visibleCount < allData.length;

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (selectionEvent) {
        const payload: SelectionChangePayload = { selectedIds: Array.from(next) };
        eventBus.emit(`UI:${selectionEvent}`, payload);
      }
      return next;
    });
  }, [selectionEvent, eventBus]);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allIds = data.map((item, i) => (item.id as string) || String(i));
      const allSelected = allIds.length > 0 && allIds.every((id) => prev.has(id));
      const next = allSelected ? new Set<string>() : new Set(allIds);
      if (selectionEvent) {
        const payload: SelectionChangePayload = { selectedIds: Array.from(next) };
        eventBus.emit(`UI:${selectionEvent}`, payload);
      }
      return next;
    });
  }, [data, selectionEvent, eventBus]);

  // Separate fields by variant for smart card layout
  const titleField = fieldDefs.find((f) => f.variant === 'h3' || f.variant === 'h4') ?? fieldDefs[0];
  const badgeFields = fieldDefs.filter((f) => f.variant === 'badge' && f !== titleField);
  const bodyFields = fieldDefs.filter((f) => f !== titleField && !badgeFields.includes(f));

  // Separate actions by variant
  const primaryActions = itemActions?.filter((a) => a.variant !== 'danger') ?? [];
  const dangerActions = itemActions?.filter((a) => a.variant === 'danger') ?? [];

  const handleActionClick = (action: DataGridItemAction, itemData: EntityRow) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const payload: ItemActionPayload = {
      id: itemData.id as string | number,
      row: itemData,
    };
    eventBus.emit(`UI:${action.event}`, payload);
  };

  const hasRenderProp = typeof children === 'function';

  // Hook order rule: all hooks must run on every render. Keeping this
  // useEffect above the early returns below prevents the "rendered fewer
  // hooks than expected" crash when `data` flips between empty and
  // populated across renders (e.g. search-as-you-type refetches).
  useEffect(() => {
    if (data.length > 0 && !hasRenderProp && fieldDefs.length === 0) {
      const schemaArr = Array.isArray(schemaRenderItem) ? (schemaRenderItem as readonly string[]) : null;
      const isFnLambda =
        schemaArr !== null &&
        schemaArr.length >= 3 &&
        (schemaArr[0] === 'fn' || schemaArr[0] === 'lambda');
      dataGridLog.warn('renderItem-unresolved', {
        rowCount: data.length,
        renderItemIsFnLambda: isFnLambda,
      });
    }
  }, [data, hasRenderProp, schemaRenderItem, fieldDefs]);

  // Grid template
  const gridTemplateColumns = cols
    ? undefined
    : `repeat(auto-fit, minmax(min(${minCardWidth}px, 100%), 1fr))`;

  // Viewport queries (`sm:` / `lg:` / `xl:`) drive the grid in real-world
  // app usage where the host viewport equals the rendered viewport. The
  // `@max-*` container-query overrides only fire when DataGrid renders
  // inside an `@container` ancestor (e.g. OrbPreviewNode's `@container/preview`)
  // whose own width is narrower than the host viewport — that's the
  // OrbPreview "Mobile/Tablet/Laptop/Wide" simulation case where the host
  // viewport stays wide but the simulated card is mobile-sized. The `!`
  // keeps them winning over the matching viewport rule when both fire.
  // Ordered largest-to-smallest so the smallest matching tier wins.
  const colsClass = cols
    ? {
        1: 'grid-cols-1',
        2: 'sm:grid-cols-2 @max-sm:!grid-cols-1',
        3: 'sm:grid-cols-2 lg:grid-cols-3 @max-lg:!grid-cols-2 @max-sm:!grid-cols-1',
        4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 @max-xl:!grid-cols-3 @max-lg:!grid-cols-2 @max-sm:!grid-cols-1',
        5: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 @max-xl:!grid-cols-3 @max-lg:!grid-cols-2 @max-sm:!grid-cols-1',
        6: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 @max-xl:!grid-cols-3 @max-lg:!grid-cols-2 @max-sm:!grid-cols-1',
      }[cols]
    : undefined;

  // Loading state
  if (isLoading) {
    return (
      <Box className="text-center py-8">
        <Typography variant="body" color="secondary">
          {t('loading.items')}
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box className="text-center py-8">
        <Typography variant="body" color="error">
          {error.message}
        </Typography>
      </Box>
    );
  }

  // Empty state — when DnD is enabled, keep the DropZoneShell mounted so
  // a kanban column with zero cards still accepts drops.
  if (data.length === 0) {
    const emptyNode = (
      <Box className="text-center py-12">
        <Typography variant="body" color="secondary">
          {t('empty.noItems')}
        </Typography>
      </Box>
    );
    return dnd.enabled ? <>{dnd.wrapContainer(emptyNode)}</> : emptyNode;
  }

  const allIds = data.map((item, i) => (item.id as string) || String(i));
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0;

  const idFieldName = dndItemIdField ?? 'id';
  return dnd.wrapContainer(
    <VStack gap="sm">
      {/* Selection toolbar */}
      {selectable && someSelected && (
        <HStack gap="sm" className="items-center px-2 py-2 bg-muted rounded-sm">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="w-4 h-4 accent-primary"
            aria-label={t('aria.selectAll')}
          />
          <Typography variant="caption" className="font-semibold">
            {selectedIds.size} {t('common.selected') || 'selected'}
          </Typography>
        </HStack>
      )}

      <Box
        className={cn('grid', gapStyles[gap], scrollX ? 'grid-flow-col overflow-x-auto' : colsClass, lookStyles[look], className)}
        style={
          scrollX
            ? { gridAutoFlow: 'column', gridAutoColumns: `minmax(${minCardWidth}px, 1fr)` }
            : gridTemplateColumns
              ? { gridTemplateColumns }
              : undefined
        }
      >
        {data.map((item, index) => {
          const itemData: EntityRow = item;
          const id = itemData.id || String(index);
          const isSelected = selectedIds.has(id);
          const dndId = (itemData[idFieldName] as string | number | undefined) ?? `__idx_${index}`;
          const wrapDnd = (node: React.ReactNode): React.ReactNode =>
            dnd.isZone ? <dnd.SortableItem key={dndId} id={dndId}>{node}</dnd.SortableItem> : node;

          // Custom render-prop path: delegate card content to children
          if (hasRenderProp) {
            return wrapDnd(
              <Box
                key={id}
                data-entity-row
                data-entity-id={id}
                className={cn(isSelected && 'ring-2 ring-primary rounded-lg')}
              >
                {children(itemData, index)}
              </Box>
            );
          }

          // Default fields-based path
          const titleValue = getNestedValue(itemData, titleField?.name ?? '');

          return wrapDnd(
            <Box
              key={id}
              data-entity-row
              data-entity-id={id}
              className={cn(
                'bg-card rounded-lg',
                'border border-border',
                'shadow-elevation-card hover:shadow-elevation-dialog',
                'hover:border-primary transition-all',
                'flex flex-col',
                isSelected && 'ring-2 ring-primary border-primary',
              )}
            >
            {/* Card Image */}
            {imageField && (() => {
              const imgUrl = getNestedValue(itemData, imageField);
              if (!imgUrl || typeof imgUrl !== 'string') return null;
              return (
                <Box className="w-full aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={imgUrl}
                    alt={titleValue !== undefined ? String(titleValue) : ''}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </Box>
              );
            })()}

            {/* Card Header: title + badges + danger actions */}
            <Box className="p-4 pb-0">
              <HStack gap="sm" className="justify-between items-start">
                {selectable && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelection(id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 mt-1 flex-shrink-0 accent-primary"
                    aria-label={t('card.selectItem', { item: titleValue !== undefined ? String(titleValue) : t('card.itemFallback') })}
                  />
                )}
                <VStack gap="xs" className="flex-1 min-w-0">
                  {titleValue !== undefined && titleValue !== null && (
                    <HStack gap="xs" className="items-center">
                      {titleField?.icon && renderIconInput(titleField.icon, { size: 'sm', className: 'text-primary flex-shrink-0' })}
                      <Typography
                        variant={titleField?.variant === 'h3' ? 'h3' : 'h4'}
                        className="font-semibold truncate"
                      >
                        {String(titleValue)}
                      </Typography>
                    </HStack>
                  )}
                  {badgeFields.length > 0 && (
                    <HStack gap="xs" className="flex-wrap">
                      {badgeFields.map((field) => {
                        const val = getNestedValue(itemData, field.name);
                        if (val === undefined || val === null) return null;
                        return (
                          <HStack key={field.name} gap="xs" className="items-center">
                            {field.icon && renderIconInput(field.icon, { size: 'xs' })}
                            <Badge variant={resolveBadgeVariant(field, String(val))}>
                              {String(val)}
                            </Badge>
                          </HStack>
                        );
                      })}
                    </HStack>
                  )}
                </VStack>
                {dangerActions.length > 0 && (
                  <HStack gap="xs" className="flex-shrink-0">
                    {dangerActions.map((action, idx) => (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        onClick={handleActionClick(action, itemData)}
                        data-testid={`action-${action.event}`}
                        data-row-id={String(itemData.id)}
                        className="text-error hover:text-error hover:bg-error/10 px-2"
                      >
                        {action.icon && renderIconInput(action.icon, { size: 'xs' })}
                        {action.label}
                      </Button>
                    ))}
                  </HStack>
                )}
              </HStack>
            </Box>

            {/* Card Body: remaining fields */}
            {bodyFields.length > 0 && (
              <Box className="px-4 py-3 flex-1">
                <VStack gap="xs">
                  {bodyFields.map((field) => {
                    const value = getNestedValue(itemData, field.name);
                    if (value === undefined || value === null || value === '') return null;

                    // Boolean format renders as badge
                    if (field.format === 'boolean') {
                      return (
                        <HStack key={field.name} gap="sm" className="justify-between items-center">
                          <HStack gap="xs" className="items-center">
                            {field.icon && renderIconInput(field.icon, { size: 'xs', className: 'text-muted-foreground' })}
                            <Typography variant="caption" color="secondary">
                              {field.label ?? fieldLabel(field.name)}
                            </Typography>
                          </HStack>
                          <Badge variant={value ? 'success' : 'neutral'}>
                            {value ? (t('common.yes') || 'Yes') : (t('common.no') || 'No')}
                          </Badge>
                        </HStack>
                      );
                    }

                    return (
                      <HStack key={field.name} gap="sm" className="justify-between items-center">
                        <HStack gap="xs" className="items-center">
                          {field.icon && renderIconInput(field.icon, { size: 'xs', className: 'text-muted-foreground' })}
                          <Typography variant="caption" color="secondary">
                            {field.label ?? fieldLabel(field.name)}
                          </Typography>
                        </HStack>
                        <Typography
                          variant={field.variant === 'caption' ? 'caption' : 'small'}
                          className="text-right truncate max-w-[60%]"
                        >
                          {formatValue(value, field.format)}
                        </Typography>
                      </HStack>
                    );
                  })}
                </VStack>
              </Box>
            )}

            {/* Card Footer: primary actions */}
            {primaryActions.length > 0 && (
              <Box className="px-4 py-3 mt-auto border-t border-border">
                <HStack gap="sm" className="justify-end">
                  {(maxInlineActions != null ? primaryActions.slice(0, maxInlineActions) : primaryActions).map((action, idx) => (
                    <Button
                      key={idx}
                      variant={action.variant === 'primary' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={handleActionClick(action, itemData)}
                      data-testid={`action-${action.event}`}
                      data-row-id={String(itemData.id)}
                    >
                      {action.icon && renderIconInput(action.icon, { size: 'xs', className: 'mr-1' })}
                      {action.label}
                    </Button>
                  ))}
                  {maxInlineActions != null && primaryActions.length > maxInlineActions && (
                    <Menu
                      position="bottom-end"
                      trigger={
                        <Button variant="ghost" size="sm" aria-label={t('common.actions')} data-testid="action-overflow">
                          <Icon name="more-horizontal" size="xs" />
                        </Button>
                      }
                      items={primaryActions.slice(maxInlineActions).map((action) => ({
                        label: action.label,
                        icon: action.icon,
                        event: action.event,
                        onClick: () =>
                          eventBus.emit(`UI:${action.event}`, {
                            id: itemData.id as string | number,
                            row: itemData as ItemActionPayload['row'],
                          }),
                      }))}
                    />
                  )}
                </HStack>
              </Box>
            )}
          </Box>
        );
        })}
      </Box>
      {hasMoreLocal && (
        <Box className="flex justify-center py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVisibleCount((prev) => prev + (pageSize || 5))}
          >
            <Icon name="chevron-down" size="xs" className="mr-1" />
            {t('common.showMore')} ({t('common.remaining', { count: allData.length - visibleCount })})
          </Button>
        </Box>
      )}
      {infiniteScroll && loadMoreEvent && (
        <InfiniteScrollSentinel
          loadMoreEvent={loadMoreEvent}
          isLoading={isLoading}
          hasMore={hasMore}
        />
      )}
    </VStack>
  );
};

DataGrid.displayName = 'DataGrid';
