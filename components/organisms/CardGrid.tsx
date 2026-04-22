'use client';
/**
 * CardGrid Component
 *
 * A dumb, responsive grid specifically designed for card layouts.
 * Uses CSS Grid auto-fit for automatic responsive columns.
 *
 * Data comes exclusively from the `entity` prop (injected by the runtime).
 * All user interactions emit events via useEventBus. Never manages internal state
 * for pagination, filtering, or search. All state is owned by the trait state machine.
 */
import React from 'react';
import type { EventKey } from "@almadar/core";
import { cn } from '../../lib/cn';
import { getNestedValue } from '../../lib/getNestedValue';
import { useEventBus } from '../../hooks/useEventBus';
import { useTranslate } from '../../hooks/useTranslate';
import { Button } from '../atoms';
import { Badge } from '../atoms/Badge';
import { Box } from '../atoms/Box';
import { Typography } from '../atoms/Typography';
import { VStack, HStack } from '../atoms/Stack';
import { Pagination } from '../molecules/Pagination';
import type { EntityDisplayProps } from './types';

export type CardGridGap = 'none' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Action configuration for card items (schema-driven)
 */
export interface CardItemAction {
  /** Action button label */
  label: string;
  /** Event to dispatch on click (schema metadata) */
  event?: EventKey;
  /** Navigation URL - supports template interpolation like "/products/{{row.id}}" */
  navigatesTo?: string;
  /** Callback on click */
  onClick?: (item: unknown) => void;
  /** Action used by generated code - alternative to event */
  action?: EventKey;
  /** Action placement - accepts string for compatibility with generated code */
  placement?: 'card' | 'footer' | 'row' | string;
  /** Button variant - accepts string for compatibility with generated code */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | string;
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
  return fields.map((f) => (typeof f === 'string' ? f : f.key ?? f.name ?? ''));
}

/**
 * Get a human-readable label from a field key.
 * "firstName" -> "First Name", "created_at" -> "Created At"
 */
function fieldLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Detect boolean values (actual booleans or "true"/"false" strings)
 * and return the boolean, or null if the value is not boolean-like.
 */
function asBooleanValue(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

/**
 * Fields that look like status/category values (render as Badge)
 */
const STATUS_FIELDS = new Set(['status', 'state', 'priority', 'type', 'category', 'role', 'level', 'tier']);

/**
 * Fields that look like dates
 */
function isDateField(key: string): boolean {
  const lower = key.toLowerCase();
  return lower.includes('date') || lower.includes('time') || lower.endsWith('at') || lower.endsWith('_at');
}

/**
 * Format a date value for display
 */
function formatDate(value: unknown): string {
  if (!value) return '';
  const d = new Date(String(value));
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Pick badge variant based on status-like values
 */
function statusVariant(value: string): 'success' | 'warning' | 'error' | 'info' | 'default' {
  const v = value.toLowerCase();
  if (['active', 'completed', 'done', 'approved', 'published', 'resolved', 'open'].includes(v)) return 'success';
  if (['pending', 'in_progress', 'in-progress', 'review', 'draft', 'processing'].includes(v)) return 'warning';
  if (['inactive', 'deleted', 'rejected', 'failed', 'error', 'blocked', 'closed'].includes(v)) return 'error';
  if (['new', 'created', 'scheduled', 'queued'].includes(v)) return 'info';
  return 'default';
}

export interface CardGridProps extends EntityDisplayProps {
  /** Minimum width of each card (default: 280px) */
  minCardWidth?: number;
  /** Maximum number of columns */
  maxCols?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Gap between cards */
  gap?: CardGridGap;
  /** Align cards vertically in their cells */
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  /** Children elements (cards) - optional when using entity prop */
  children?: React.ReactNode;
  /** Fields to display - required for schema-driven rendering */
  fields: readonly FieldDef[];
  /** Alias for fields - backwards compatibility */
  fieldNames?: readonly string[];
  /** Alias for fields - backwards compatibility */
  columns?: readonly FieldDef[];
  /** Actions for each card item (schema-driven) */
  itemActions?: readonly CardItemAction[];
  /** Show total count in pagination */
  showTotal?: boolean;
  /** Show avatar/image field on cards */
  showAvatar?: boolean;
  /** Visual variant for the card grid */
  variant?: string;
  /** Entity field name containing an image URL to display as card thumbnail */
  imageField?: string;
}

const gapStyles: Record<CardGridGap, string> = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const alignStyles = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

/**
 * CardGrid - Responsive card collection layout
 *
 * Can be used in two ways:
 * 1. With children: <CardGrid><Card>...</Card></CardGrid>
 * 2. With entity data: <CardGrid entity={tasks} fields={['title', 'status']} />
 *
 * All data comes from the `entity` prop. Pagination display hints come from
 * `page`, `pageSize`, and `totalCount` props (set by the trait via render-ui).
 */
export const CardGrid: React.FC<CardGridProps> = ({
  minCardWidth = 280,
  maxCols,
  gap = 'md',
  alignItems = 'stretch',
  className,
  children,
  // EntityDisplayProps
  entity,
  isLoading = false,
  error = null,
  page,
  pageSize,
  totalCount,
  // CardGrid-specific
  fields,
  fieldNames,
  columns,
  itemActions,
  showTotal = true,
  imageField,
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();

  // Support fields, fieldNames, and columns (aliases) - normalize to string[]
  const effectiveFieldNames =
    normalizeFields(fields).length > 0
      ? normalizeFields(fields)
      : (fieldNames ?? normalizeFields(columns));

  // Build the grid-template-columns value
  const gridTemplateColumns = `repeat(auto-fit, minmax(min(${minCardWidth}px, 100%), 1fr))`;

  // Normalize entity data to array
  const normalizedData = Array.isArray(entity) ? entity : entity ? [entity] : [];

  // Compute pagination display hints from EntityDisplayProps
  const resolvedPage = page ?? 1;
  const resolvedTotalPages = totalCount && pageSize ? Math.ceil(totalCount / pageSize) : 1;

  // Handle page change — emit event, trait owns the state
  const handlePageChange = (newPage: number) => {
    eventBus.emit('UI:PAGINATE', { page: newPage, pageSize });
  };

  // Classify fields for smart layout
  const titleField = effectiveFieldNames?.[0];
  const statusField = effectiveFieldNames?.find((f) => STATUS_FIELDS.has(f.toLowerCase()));
  const bodyFields = effectiveFieldNames?.filter((f) => f !== titleField && f !== statusField) ?? [];

  // Separate actions by type for layout
  const primaryActions = itemActions?.filter((a) => a.variant !== 'danger') ?? [];
  const dangerActions = itemActions?.filter((a) => a.variant === 'danger') ?? [];

  // Handle action click - navigate, dispatch event, or call callback
  const handleActionClick = (action: CardItemAction, itemData: Record<string, unknown>) => (e: React.MouseEvent) => {
    e.stopPropagation();

    if (action.navigatesTo) {
      const url = action.navigatesTo.replace(/\{\{row\.(\w+(?:\.\w+)*)\}\}/g, (_, field) => {
        const value = getNestedValue(itemData, field);
        return value !== undefined && value !== null ? String(value) : '';
      });
      eventBus.emit('UI:NAVIGATE', { url, row: itemData });
      return;
    }

    if (action.event) {
      eventBus.emit(`UI:${action.event}`, { id: itemData.id, row: itemData });
    }
    if (action.onClick) {
      action.onClick(itemData);
    }
  };

  // Render data-bound cards if data is provided
  const renderContent = () => {
    if (children) {
      return children;
    }

    // Show loading state
    if (isLoading) {
      return (
        <Box className="col-span-full text-center py-8 text-muted-foreground">
          <Typography variant="body" color="secondary">Loading items...</Typography>
        </Box>
      );
    }

    // Show error state
    if (error) {
      return (
        <Box className="col-span-full text-center py-8 text-error">
          <Typography variant="body" color="error">Error loading items: {error.message}</Typography>
        </Box>
      );
    }

    if (normalizedData.length === 0) {
      return (
        <Box className="col-span-full text-center py-12 text-muted-foreground">
          <Typography variant="body" color="secondary">{t('empty.noItems') || 'No items found'}</Typography>
        </Box>
      );
    }

    return normalizedData.map((item, index) => {
      const itemData = item as Record<string, unknown>;
      const id = (itemData.id as string) || String(index);

      const titleValue = titleField ? getNestedValue(itemData, titleField) : undefined;
      const statusValue = statusField ? getNestedValue(itemData, statusField) : undefined;

      return (
        <Box
          key={id}
          data-entity-row
          className={cn(
            'bg-card rounded-lg border border-border',
            'shadow-sm hover:shadow-lg',
            'cursor-pointer hover:border-primary transition-all',
            'flex flex-col'
          )}
          action="VIEW"
          actionPayload={{ row: itemData }}
        >
          {/* Card Image: thumbnail from imageField */}
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

          {/* Card Header: title + status badge + danger actions */}
          <Box className="p-4 pb-0">
            <HStack gap="sm" className="justify-between items-start">
              <VStack gap="xs" className="flex-1 min-w-0">
                {titleValue !== undefined && titleValue !== null && (
                  <Typography variant="h4" className="font-semibold truncate">
                    {String(titleValue)}
                  </Typography>
                )}
                {statusValue !== undefined && statusValue !== null && (
                  <Box>
                    <Badge variant={statusVariant(String(statusValue))}>
                      {String(statusValue)}
                    </Badge>
                  </Box>
                )}
              </VStack>
              {/* Danger actions (Delete) as icon-style buttons in top-right */}
              {dangerActions.length > 0 && (
                <HStack gap="xs" className="flex-shrink-0">
                  {dangerActions.map((action, actionIdx) => (
                    <Button
                      key={actionIdx}
                      variant="ghost"
                      size="sm"
                      onClick={handleActionClick(action, itemData)}
                      data-testid={action.event ? `action-${action.event}` : undefined}
                      className="text-error hover:bg-error/10 px-2"
                    >
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
                  const value = getNestedValue(itemData, field);
                  if (value === undefined || value === null || value === '') return null;

                  // Boolean fields render as badges
                  const boolVal = asBooleanValue(value);
                  if (boolVal !== null) {
                    return (
                      <HStack key={field} gap="sm" className="justify-between">
                        <Typography variant="caption" color="secondary">
                          {fieldLabel(field)}
                        </Typography>
                        {boolVal ? (
                          <Badge variant="success">{t('common.yes') || 'Yes'}</Badge>
                        ) : (
                          <Badge variant="neutral">{t('common.no') || 'No'}</Badge>
                        )}
                      </HStack>
                    );
                  }

                  const displayValue = isDateField(field)
                    ? formatDate(value)
                    : STATUS_FIELDS.has(field.toLowerCase())
                      ? undefined
                      : String(value);

                  if (!displayValue) return null;

                  return (
                    <HStack key={field} gap="sm" className="justify-between">
                      <Typography variant="caption" color="secondary">
                        {fieldLabel(field)}
                      </Typography>
                      <Typography variant="small" className="text-right truncate max-w-[60%]">
                        {displayValue}
                      </Typography>
                    </HStack>
                  );
                })}
              </VStack>
            </Box>
          )}

          {/* Card Footer: primary actions (Edit, View, etc.) */}
          {primaryActions.length > 0 && (
            <Box className="px-4 py-3 mt-auto border-t border-border">
              <HStack gap="sm" className="justify-end">
                {primaryActions.map((action, actionIdx) => (
                  <Button
                    key={actionIdx}
                    variant={action.variant === 'primary' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={handleActionClick(action, itemData)}
                    data-testid={action.event ? `action-${action.event}` : undefined}
                  >
                    {action.label}
                  </Button>
                ))}
              </HStack>
            </Box>
          )}
        </Box>
      );
    });
  };

  return (
    <VStack gap="md">
      <Box
        className={cn(
          'grid',
          gapStyles[gap],
          alignStyles[alignItems],
          maxCols === 1 && 'grid-cols-1',
          maxCols === 2 && 'sm:grid-cols-2',
          maxCols === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
          maxCols === 4 && 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
          maxCols === 5 && 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
          maxCols === 6 && 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
          className
        )}
        style={!maxCols ? { gridTemplateColumns } : undefined}
      >
        {renderContent()}
      </Box>

      {/* Pagination controls — displayed when trait provides pagination hints */}
      {totalCount !== undefined && pageSize !== undefined && resolvedTotalPages > 1 && (
        <Pagination
          currentPage={resolvedPage}
          totalPages={resolvedTotalPages}
          onPageChange={handlePageChange}
          showTotal={showTotal}
          totalItems={totalCount}
        />
      )}
    </VStack>
  );
};

CardGrid.displayName = 'CardGrid';
