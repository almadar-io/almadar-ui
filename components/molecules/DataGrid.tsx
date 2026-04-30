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
import React, { useCallback, useState } from 'react';
import type { EntityRow, EventKey } from '@almadar/core';
import type { ItemActionPayload, SelectionChangePayload } from '@almadar/patterns';
import { cn } from '../../lib/cn';
import { getNestedValue } from '../../lib/getNestedValue';
import { useEventBus } from '../../hooks/useEventBus';
import { useTranslate } from '../../hooks/useTranslate';
import { Box } from '../atoms/Box';
import { VStack, HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Badge, type BadgeVariant } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { InfiniteScrollSentinel } from '../atoms/InfiniteScrollSentinel';

// ── Field Definition ─────────────────────────────────────────────────

export interface DataGridField {
  /** Entity field name (dot-notation supported) */
  name: string;
  /** Display label (auto-generated from name if omitted) */
  label?: string;
  /** Lucide icon name to show beside the field */
  icon?: string;
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
  /** Lucide icon name */
  icon?: string;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

// ── Props ────────────────────────────────────────────────────────────

export interface DataGridProps<T extends EntityRow = EntityRow> {
  /**
   * Schema entity data — single record or collection, typed against
   * `@almadar/core`'s `EntityRow` so the narrow type declared on the
   * emitting trait's `Event { data : [X] }` flows through to the prop
   * without widening. The generic `T` lets consumers pass a narrower
   * entity (e.g. `CartItem`) and have the `children` render function
   * receive cards typed to that exact shape.
   */
  entity: T | readonly T[];
  /** Field definitions for rendering each card */
  fields: readonly DataGridField[];
  /** Per-item action buttons */
  itemActions?: readonly DataGridItemAction[];
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
  error?: Error | null;
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
  /** Render prop for custom per-card content, typed to the grid's entity
   *  shape `T`. When provided, `fields` and `itemActions` are ignored. */
  children?: (item: T, index: number) => React.ReactNode;
  /**
   * Per-item render function (schema-level alias for children render prop).
   * In .orb schemas: ["fn", "item", { pattern tree with @item.field bindings }]
   * The compiler converts this to the children render prop.
   * @deprecated Use children render prop in React code. This prop exists for pattern registry sync.
   */
  renderItem?: (item: T, index: number) => React.ReactNode;
  /** Max items to show before "Show More" button. Defaults to 0 (disabled). */
  pageSize?: number;
}

// ── Helpers ──────────────────────────────────────────────────────────

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

function formatDate(value: unknown): string {
  if (!value) return '';
  const d = new Date(String(value));
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatValue(value: unknown, format?: DataGridField['format']): string {
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

export function DataGrid<T extends EntityRow = EntityRow>({
  entity,
  fields,
  itemActions,
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
}: DataGridProps<T>) {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(pageSize || Infinity);

  const allData = Array.isArray(entity) ? entity : entity ? [entity] : [];
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
      const allIds = data.map((item, i) => ((item as Record<string, unknown>).id as string) || String(i));
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
  const titleField = fields.find((f) => f.variant === 'h3' || f.variant === 'h4') ?? fields[0];
  const badgeFields = fields.filter((f) => f.variant === 'badge' && f !== titleField);
  const bodyFields = fields.filter((f) => f !== titleField && !badgeFields.includes(f));

  // Separate actions by variant
  const primaryActions = itemActions?.filter((a) => a.variant !== 'danger') ?? [];
  const dangerActions = itemActions?.filter((a) => a.variant === 'danger') ?? [];

  const handleActionClick = (action: DataGridItemAction, itemData: Record<string, unknown>) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const payload: ItemActionPayload = {
      id: itemData.id as string | number,
      row: itemData as ItemActionPayload['row'],
    };
    eventBus.emit(`UI:${action.event}`, payload);
  };

  // Grid template
  const gridTemplateColumns = cols
    ? undefined
    : `repeat(auto-fit, minmax(min(${minCardWidth}px, 100%), 1fr))`;

  const colsClass = cols
    ? {
        1: 'grid-cols-1',
        2: 'sm:grid-cols-2',
        3: 'sm:grid-cols-2 lg:grid-cols-3',
        4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        5: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
        6: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
      }[cols]
    : undefined;

  // Loading state
  if (isLoading) {
    return (
      <Box className="text-center py-8">
        <Typography variant="body" color="secondary">
          {t('loading.items') || 'Loading...'}
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

  // Empty state
  if (data.length === 0) {
    return (
      <Box className="text-center py-12">
        <Typography variant="body" color="secondary">
          {t('empty.noItems') || 'No items found'}
        </Typography>
      </Box>
    );
  }

  const hasRenderProp = typeof children === 'function';
  const allIds = data.map((item, i) => ((item as Record<string, unknown>).id as string) || String(i));
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0;

  return (
    <VStack gap="sm">
      {/* Selection toolbar */}
      {selectable && someSelected && (
        <HStack gap="sm" className="items-center px-2 py-2 bg-muted rounded-sm">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="w-4 h-4 accent-primary"
            aria-label="Select all"
          />
          <Typography variant="caption" className="font-semibold">
            {selectedIds.size} {t('common.selected') || 'selected'}
          </Typography>
        </HStack>
      )}

      <Box
        className={cn('grid', gapStyles[gap], colsClass, className)}
        style={gridTemplateColumns ? { gridTemplateColumns } : undefined}
      >
        {data.map((item, index) => {
          const itemData = item as Record<string, unknown>;
          const id = (itemData.id as string) || String(index);
          const isSelected = selectedIds.has(id);

          // Custom render-prop path: delegate card content to children
          if (hasRenderProp) {
            return (
              <Box
                key={id}
                data-entity-row
                data-entity-id={id}
                className={cn(
                  'bg-card rounded-lg',
                  'border border-border',
                  'shadow-sm hover:shadow-lg',
                  'hover:border-primary transition-all',
                  'p-4',
                  isSelected && 'ring-2 ring-primary border-primary',
                )}
              >
                {children(itemData as T, index)}
              </Box>
            );
          }

          // Default fields-based path
          const titleValue = getNestedValue(itemData, titleField?.name ?? '');

          return (
            <Box
              key={id}
              data-entity-row
              data-entity-id={id}
              className={cn(
                'bg-card rounded-lg',
                'border border-border',
                'shadow-sm hover:shadow-lg',
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
                    aria-label={`Select ${titleValue !== undefined ? String(titleValue) : 'item'}`}
                  />
                )}
                <VStack gap="xs" className="flex-1 min-w-0">
                  {titleValue !== undefined && titleValue !== null && (
                    <HStack gap="xs" className="items-center">
                      {titleField?.icon && (
                        <Icon name={titleField.icon} size="sm" className="text-primary flex-shrink-0" />
                      )}
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
                            {field.icon && <Icon name={field.icon} size="xs" />}
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
                        className="text-error hover:bg-error/10 px-2"
                      >
                        {action.icon && <Icon name={action.icon} size="xs" />}
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
                            {field.icon && <Icon name={field.icon} size="xs" className="text-muted-foreground" />}
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
                          {field.icon && <Icon name={field.icon} size="xs" className="text-muted-foreground" />}
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
                  {primaryActions.map((action, idx) => (
                    <Button
                      key={idx}
                      variant={action.variant === 'primary' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={handleActionClick(action, itemData)}
                      data-testid={`action-${action.event}`}
                      data-row-id={String(itemData.id)}
                    >
                      {action.icon && <Icon name={action.icon} size="xs" className="mr-1" />}
                      {action.label}
                    </Button>
                  ))}
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
            {t('common.showMore')} ({allData.length - visibleCount} remaining)
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
