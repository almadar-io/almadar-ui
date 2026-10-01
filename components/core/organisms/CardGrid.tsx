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
import type { A11yProps, EventKey, EventPayload, EventEmit, FieldValue } from "@almadar/core";
import { domPassthrough } from "../../../lib/domPassthrough";
import type { ItemActionPayload } from '@almadar/core/patterns';
import { cn } from '../../../lib/cn';
import { formatValue } from '../../../lib/format';
import { normalizeDisplayFields, badgeVariantFor, titleFieldOf } from '../../../lib/displayField';
import { getNestedValue, resolveImageUrl } from '../../../lib/getNestedValue';
import { useEventBus } from '../../../hooks/useEventBus';
import { useRowActions, useRowActionPayload, useRowActionFire } from '../../../hooks/useRowActions';
import type { RowActionCondition, RowActionPayload } from '../../../lib/row-action-when';
import { useTranslate, useFormatContext } from '../../../hooks/useTranslate';
import { Button } from '../atoms/index';
import { Badge } from '../atoms/Badge';
import { Box } from '../atoms/Box';
import { Typography } from '../atoms/Typography';
import { VStack, HStack } from '../atoms/Stack';
import { Pagination } from '../molecules/Pagination';
import type { DisplayStateProps } from './types';
import type { DisplayField } from '../atoms/types';
import type { EntityRow } from '@almadar/core';

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
  onClick?: (item: EventPayload) => void;
  /** Action placement - accepts string for compatibility with generated code */
  placement?: 'card' | 'footer' | 'row' | string;
  /** Button variant - accepts string for compatibility with generated code */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | string;
  /** Per-row condition, authored as `(fn row <bool>)`: the card's button is drawn only when it returns true. Omit = always shown. */
  when?: RowActionCondition;
  /** Extra data the action sends, authored as `(fn row { key: <expr> })`; it emits `{ id, row }` plus these keys. */
  payload?: RowActionPayload;
}

/** A field is a plain name or a declared {@link DisplayField}. */
export type FieldDef = string | DisplayField;

export interface CardGridProps extends DisplayStateProps, Omit<React.AriaAttributes, keyof A11yProps>, A11yProps {
  /** Entity data (single record or collection). */
  entity?: EntityRow | readonly EntityRow[];
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
  /** When set, clicking a card emits UI:{itemClickEvent} with { id, row }. Omit = cards are not clickable. */
  /** @entityRow row */
  itemClickEvent?: EventEmit<ItemActionPayload>;
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
  itemClickEvent,
  showTotal = true,
  imageField,
  ...rest
}) => {
  const eventBus = useEventBus();
  const rowActions = useRowActions();
  const actionPayload = useRowActionPayload();
  const { fire: fireRowAction, isRowPending } = useRowActionFire<CardItemAction>();
  const { t } = useTranslate();
  const fmt = useFormatContext();

  const declaredFields = normalizeDisplayFields(fields);
  const effectiveFields = declaredFields.length > 0 ? declaredFields : normalizeDisplayFields(fieldNames ?? columns);

  // Build the grid-template-columns value
  const gridTemplateColumns = `repeat(auto-fit, minmax(min(${minCardWidth}px, 100%), 1fr))`;

  // Normalize entity data to array
  const normalizedData = Array.isArray(entity) ? entity : entity ? [entity] : [];

  // Compute pagination display hints from the display-state props
  const resolvedPage = page ?? 1;
  const resolvedTotalPages = totalCount && pageSize ? Math.ceil(totalCount / pageSize) : 1;

  // Handle page change — emit event, trait owns the state
  const handlePageChange = (newPage: number) => {
    eventBus.emit('UI:PAGINATE', { page: newPage, pageSize });
  };

  const titleField = titleFieldOf(effectiveFields);
  const badgeFields = effectiveFields.filter((f) => f.variant === 'badge' && f !== titleField);
  const bodyFields = effectiveFields.filter((f) => f !== titleField && f.variant !== 'badge');

  // Handle action click - navigate, dispatch event, or call callback
  const handleActionClick = (action: CardItemAction, itemData: EntityRow) => (e: React.MouseEvent) => {
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
      fireRowAction(action, itemData, String(itemData.id ?? ""));
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
          <Typography variant="body" color="secondary">{t('loading.items')}</Typography>
        </Box>
      );
    }

    // Show error state
    if (error) {
      return (
        <Box className="col-span-full text-center py-8 text-error">
          <Typography variant="body" color="error">{t('error.loadFailed', { message: error.message })}</Typography>
        </Box>
      );
    }

    if (normalizedData.length === 0) {
      return (
        <Box className="col-span-full text-center py-12 text-muted-foreground">
          <Typography variant="body" color="secondary">{t('empty.noItems')}</Typography>
        </Box>
      );
    }

    return normalizedData.map((item, index) => {
      const itemData = item as EventPayload;
      const id = (itemData.id as string) || String(index);

      // Separate the actions THIS card shows by type for layout
      const shownActions = rowActions(itemActions ?? [], item);
      const primaryActions = shownActions.filter((a) => a.variant !== 'danger');
      const dangerActions = shownActions.filter((a) => a.variant === 'danger');

      const titleValue = titleField ? getNestedValue(itemData, titleField.name) : undefined;

      return (
        <Box
          key={id}
          data-entity-row

 data-row-pending={isRowPending(String(itemData.id ?? "")) || undefined}
 aria-busy={isRowPending(String(itemData.id ?? "")) || undefined}          className={cn(
            'bg-card rounded-container border border-border',
            'shadow-elevation-card hover:shadow-elevation-popover',
            itemClickEvent && 'cursor-pointer hover:border-primary',
            'transition-all',
            'flex flex-col'
          )}
          action={itemClickEvent}
          actionPayload={itemClickEvent ? { id: itemData.id as string | number, row: itemData } : undefined}
        >
          {/* Card Image: thumbnail from imageField */}
          {imageField && (() => {
            const imgUrl = resolveImageUrl(getNestedValue(itemData, imageField));
            if (!imgUrl) return null;
            return (
              <Box className="w-full aspect-video overflow-hidden rounded-t-container">
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
                  <Typography variant="h4" className="truncate">
                    {String(titleValue)}
                  </Typography>
                )}
                {badgeFields.map((field) => {
                  const badgeValue = getNestedValue(itemData, field.name);
                  if (badgeValue === undefined || badgeValue === null || badgeValue === '') return null;
                  return (
                    <Box key={field.name}>
                      <Badge variant={badgeVariantFor(String(badgeValue), field.colorMap)}>
                        {String(badgeValue)}
                      </Badge>
                    </Box>
                  );
                })}
              </VStack>
              {/* Danger actions (Delete) as icon-style buttons in top-right */}
              {dangerActions.length > 0 && (
                <HStack gap="xs" className="flex-shrink-0">
                  {dangerActions.map((action, actionIdx) => (
                    <Button
                      key={actionIdx}
                      variant="ghost"
                      size="sm"
                      onClick={handleActionClick(action, item)}
                      data-testid={action.event ? `action-${action.event}` : undefined}
                      data-row-id={String(itemData.id)}
                      className="text-foreground hover:bg-error/10 px-2"
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
                  const value = getNestedValue(itemData, field.name);
                  if (value === undefined || value === null || value === '') return null;

                  const fieldValue = value as FieldValue;
                  const label = field.label ?? field.name;

                  if (typeof fieldValue === 'boolean') {
                    return (
                      <HStack key={field.name} gap="sm" className="justify-between">
                        <Typography variant="caption" color="secondary">
                          {label}
                        </Typography>
                        {fieldValue ? (
                          <Badge variant="success">{t('common.yes')}</Badge>
                        ) : (
                          <Badge variant="neutral">{t('common.no')}</Badge>
                        )}
                      </HStack>
                    );
                  }

                  return (
                    <HStack key={field.name} gap="sm" className="justify-between">
                      <Typography variant="caption" color="secondary">
                        {label}
                      </Typography>
                      <Typography variant="small" className="text-right truncate max-w-[60%]">
                        {formatValue(fieldValue, field.format, fmt)}
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
                    onClick={handleActionClick(action, item)}
                    data-testid={action.event ? `action-${action.event}` : undefined}
                    data-row-id={String(itemData.id)}
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
    <VStack gap="md" {...domPassthrough(rest)}>
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
