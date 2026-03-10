'use client';
/**
 * DataList Molecule
 *
 * A simplified, schema-driven list for iterating over entity data.
 * Extracted from the List organism with all complexity removed:
 * no built-in search, sort, filter, selection, bulk actions, or custom renderers.
 *
 * Accepts `fields` config for per-field rendering control (icon, variant, format)
 * and `itemActions` for per-item event bus wiring.
 *
 * Uses atoms only internally: Box, VStack, HStack, Typography, Badge, Button, Icon.
 */
import React from 'react';
import { cn } from '../../lib/cn';
import { getNestedValue } from '../../lib/getNestedValue';
import { useEventBus } from '../../hooks/useEventBus';
import { useTranslate } from '../../hooks/useTranslate';
import { Box } from '../atoms/Box';
import { VStack, HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { ProgressBar } from '../atoms/ProgressBar';
import { Divider } from '../atoms/Divider';
import { InfiniteScrollSentinel } from '../atoms/InfiniteScrollSentinel';

// ── Field Definition ─────────────────────────────────────────────────

export interface DataListField {
  /** Entity field name (dot-notation supported) */
  name: string;
  /** Display label (auto-generated from name if omitted) */
  label?: string;
  /** Lucide icon name to show beside the field */
  icon?: string;
  /** Rendering variant: 'h3'/'h4' for title, 'body' for text, 'caption' for small,
   *  'badge' for status badge, 'progress' for progress bar */
  variant?: 'h3' | 'h4' | 'body' | 'caption' | 'badge' | 'small' | 'progress';
  /** Optional format: 'date', 'currency', 'number', 'boolean', 'percent' */
  format?: 'date' | 'currency' | 'number' | 'boolean' | 'percent';
}

// ── Item Action Definition ───────────────────────────────────────────

export interface DataListItemAction {
  /** Button label */
  label: string;
  /** Event name to emit (dispatched as UI:{event} with { row: itemData }) */
  event: string;
  /** Lucide icon name */
  icon?: string;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

// ── Props ────────────────────────────────────────────────────────────

export interface DataListProps {
  /** Entity data array */
  entity?: unknown | readonly unknown[];
  /** Field definitions for rendering each row */
  fields?: readonly DataListField[];
  /** Alias for fields (compiler may generate `columns` for field definitions) */
  columns?: readonly DataListField[];
  /** Per-item action buttons */
  itemActions?: readonly DataListItemAction[];
  /** Gap between rows */
  gap?: 'none' | 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'default' | 'card' | 'compact' | 'message';
  /** Group items by a field value (renders section headers between groups) */
  groupBy?: string;
  /** Field name identifying the sender (used with variant: "message") */
  senderField?: string;
  /** Current user identifier; messages matching this value align right (used with variant: "message") */
  currentUser?: string;
  /** Additional CSS classes */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Enable drag-to-reorder with grip handles */
  reorderable?: boolean;
  /** Event emitted on reorder: UI:{reorderEvent} with { fromIndex, toIndex } */
  reorderEvent?: string;
  /** Event emitted on left swipe: UI:{swipeLeftEvent} with { row } */
  swipeLeftEvent?: string;
  /** Actions revealed on left swipe */
  swipeLeftActions?: readonly { label: string; icon?: string; variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }[];
  /** Event emitted on right swipe: UI:{swipeRightEvent} with { row } */
  swipeRightEvent?: string;
  /** Actions revealed on right swipe */
  swipeRightActions?: readonly { label: string; icon?: string; variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }[];
  /** Event emitted on long press: UI:{longPressEvent} with { row } */
  longPressEvent?: string;
  /** Enable infinite scroll loading */
  infiniteScroll?: boolean;
  /** Event emitted when more items needed: UI:{loadMoreEvent} */
  loadMoreEvent?: string;
  /** Whether more items are available for infinite scroll */
  hasMore?: boolean;
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

function formatDate(value: unknown): string {
  if (!value) return '';
  const d = new Date(String(value));
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatValue(value: unknown, format?: DataListField['format']): string {
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

function groupData(
  items: Record<string, unknown>[],
  field: string,
): { label: string; items: Record<string, unknown>[] }[] {
  const groups = new Map<string, Record<string, unknown>[]>();
  for (const item of items) {
    const key = String(getNestedValue(item, field) ?? '');
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return Array.from(groups.entries()).map(([label, groupItems]) => ({ label, items: groupItems }));
}

// ── Component ────────────────────────────────────────────────────────

export const DataList: React.FC<DataListProps> = ({
  entity,
  fields: fieldsProp,
  columns: columnsProp,
  itemActions,
  gap = 'none',
  variant = 'default',
  groupBy,
  senderField,
  currentUser,
  className,
  isLoading = false,
  error = null,
  // Gesture props: reorderable, swipeLeftEvent, swipeRightEvent, longPressEvent
  // are consumed by the compiler to wrap items in SwipeableRow/SortableList.
  // DataList destructures them here to prevent DOM passthrough.
  reorderable: _reorderable,
  reorderEvent: _reorderEvent,
  swipeLeftEvent: _swipeLeftEvent,
  swipeLeftActions: _swipeLeftActions,
  swipeRightEvent: _swipeRightEvent,
  swipeRightActions: _swipeRightActions,
  longPressEvent: _longPressEvent,
  infiniteScroll,
  loadMoreEvent,
  hasMore,
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();

  const fields = fieldsProp ?? columnsProp ?? [];
  const data = Array.isArray(entity) ? entity : entity ? [entity] : [];

  // Separate fields by role
  const titleField = fields.find((f) => f.variant === 'h3' || f.variant === 'h4') ?? fields[0];
  const badgeFields = fields.filter((f) => f.variant === 'badge' && f !== titleField);
  const progressFields = fields.filter((f) => f.variant === 'progress');
  const bodyFields = fields.filter(
    (f) => f !== titleField && !badgeFields.includes(f) && !progressFields.includes(f)
  );

  const handleActionClick = (action: DataListItemAction, itemData: Record<string, unknown>) => (e: React.MouseEvent) => {
    e.stopPropagation();
    eventBus.emit(`UI:${action.event}`, { row: itemData });
  };

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

  const gapClass = {
    none: '',
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-4',
  }[gap];

  const isCard = variant === 'card';
  const isCompact = variant === 'compact';
  const isMessage = variant === 'message';

  // ── Message variant ──────────────────────────────────────────────
  if (isMessage) {
    const items = data.map((item) => item as Record<string, unknown>);
    const groups = groupBy ? groupData(items, groupBy) : [{ label: '', items }];
    const contentField = titleField?.name ?? fields[0]?.name ?? '';

    return (
      <VStack gap="sm" className={cn('py-2', className)}>
        {groups.map((group, gi) => (
          <React.Fragment key={gi}>
            {group.label && (
              <Divider label={group.label} className="my-2" />
            )}
            {group.items.map((itemData, index) => {
              const id = (itemData.id as string) || `${gi}-${index}`;
              const sender = senderField ? String(getNestedValue(itemData, senderField) ?? '') : '';
              const isSent = Boolean(currentUser && sender === currentUser);
              const content = getNestedValue(itemData, contentField);
              const timestampField = fields.find((f) => f.format === 'date');
              const timestamp = timestampField ? getNestedValue(itemData, timestampField.name) : null;

              return (
                <Box
                  key={id}
                  className={cn(
                    'flex px-4',
                    isSent ? 'justify-end' : 'justify-start',
                  )}
                >
                  <Box
                    className={cn(
                      'max-w-[75%] px-4 py-2',
                      isSent
                        ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-2xl rounded-br-sm'
                        : 'bg-[var(--color-muted)] text-[var(--color-foreground)] rounded-2xl rounded-bl-sm',
                    )}
                  >
                    {!isSent && senderField && (
                      <Typography variant="caption" className="font-semibold mb-0.5">
                        {sender}
                      </Typography>
                    )}
                    <Typography variant="body">
                      {content !== undefined && content !== null ? String(content) : ''}
                    </Typography>
                    {timestamp != null ? (
                      <Typography
                        variant="caption"
                        className={cn(
                          'mt-1 text-[0.65rem]',
                          isSent ? 'opacity-70' : 'text-[var(--color-muted-foreground)]',
                        )}
                      >
                        {formatDate(timestamp)}
                      </Typography>
                    ) : null}
                  </Box>
                </Box>
              );
            })}
          </React.Fragment>
        ))}
      </VStack>
    );
  }

  // ── Grouped rendering (non-message variants) ─────────────────────
  const items = data.map((item) => item as Record<string, unknown>);
  const groups = groupBy ? groupData(items, groupBy) : [{ label: '', items }];

  const renderItem = (itemData: Record<string, unknown>, index: number, isLast: boolean) => {
    const id = (itemData.id as string) || String(index);
    const titleValue = getNestedValue(itemData, titleField?.name ?? '');

    return (
      <Box key={id} data-entity-row>
        <Box
          className={cn(
            'group flex items-center gap-4 transition-all duration-200',
            isCompact ? 'px-4 py-2' : 'px-6 py-4',
            'hover:bg-[var(--color-muted)]/80',
            !isCard && !isCompact && 'rounded-[var(--radius-lg)] border border-transparent hover:border-[var(--color-border)]',
          )}
        >
          {/* Main content area */}
          <Box className="flex-1 min-w-0">
            {/* Primary row: icon + title + badges */}
            <HStack gap="sm" className="items-center">
              {titleField?.icon && (
                <Icon
                  name={titleField.icon}
                  size={isCompact ? 'xs' : 'sm'}
                  className="text-[var(--color-primary)] flex-shrink-0"
                />
              )}
              {titleValue !== undefined && titleValue !== null && (
                <Typography
                  variant={titleField?.variant === 'h3' ? 'h3' : 'h4'}
                  className={cn('font-semibold truncate flex-1', isCompact && 'text-sm')}
                >
                  {String(titleValue)}
                </Typography>
              )}
              {/* Inline badges */}
              {badgeFields.map((field) => {
                const val = getNestedValue(itemData, field.name);
                if (val === undefined || val === null) return null;
                return (
                  <HStack key={field.name} gap="xs" className="items-center flex-shrink-0">
                    {field.icon && <Icon name={field.icon} size="xs" />}
                    <Badge variant={statusVariant(String(val))}>
                      {String(val)}
                    </Badge>
                  </HStack>
                );
              })}
            </HStack>

            {/* Secondary row: metadata fields */}
            {bodyFields.length > 0 && !isCompact && (
              <HStack gap="md" className="mt-1.5 flex-wrap">
                {bodyFields.map((field) => {
                  const value = getNestedValue(itemData, field.name);
                  if (value === undefined || value === null || value === '') return null;

                  return (
                    <HStack key={field.name} gap="xs" className="items-center">
                      {field.icon && (
                        <Icon name={field.icon} size="xs" className="text-[var(--color-muted-foreground)]" />
                      )}
                      <Typography variant="caption" color="secondary">
                        {field.label ?? fieldLabel(field.name)}:
                      </Typography>
                      <Typography variant="small">
                        {formatValue(value, field.format)}
                      </Typography>
                    </HStack>
                  );
                })}
              </HStack>
            )}

            {/* Progress fields */}
            {progressFields.map((field) => {
              const value = getNestedValue(itemData, field.name);
              if (typeof value !== 'number') return null;
              return (
                <Box key={field.name} className="mt-2 max-w-xs">
                  <HStack gap="xs" className="items-center mb-1">
                    {field.icon && <Icon name={field.icon} size="xs" className="text-[var(--color-muted-foreground)]" />}
                    <Typography variant="caption" color="secondary">
                      {field.label ?? fieldLabel(field.name)}
                    </Typography>
                  </HStack>
                  <ProgressBar value={value} max={100} />
                </Box>
              );
            })}
          </Box>

          {/* Actions (visible on hover) */}
          {itemActions && itemActions.length > 0 && (
            <HStack
              gap="xs"
              className={cn(
                'flex-shrink-0 transition-opacity duration-200',
                'opacity-0 group-hover:opacity-100',
              )}
            >
              {itemActions.map((action, idx) => (
                <Button
                  key={idx}
                  variant={action.variant ?? 'ghost'}
                  size="sm"
                  onClick={handleActionClick(action, itemData)}
                  data-testid={`action-${action.event}`}
                  className={cn(
                    action.variant === 'danger' && 'text-[var(--color-error)] hover:bg-[var(--color-error)]/10',
                  )}
                >
                  {action.icon && <Icon name={action.icon} size="xs" className="mr-1" />}
                  {action.label}
                </Button>
              ))}
            </HStack>
          )}
        </Box>

        {/* Divider between items (card variant) */}
        {isCard && !isLast && (
          <Box className="mx-6 border-b border-[var(--color-border)]/40" />
        )}
      </Box>
    );
  };

  return (
    <Box
      className={cn(
        isCard && 'bg-[var(--color-card)] rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-lg)] overflow-hidden',
        !isCard && gapClass,
        className,
      )}
    >
      {groups.map((group, gi) => (
        <React.Fragment key={gi}>
          {group.label && (
            <Divider label={group.label} className={gi > 0 ? 'mt-4' : 'mt-0'} />
          )}
          {group.items.map((itemData, index) =>
            renderItem(itemData, index, gi === groups.length - 1 && index === group.items.length - 1)
          )}
        </React.Fragment>
      ))}
      {infiniteScroll && loadMoreEvent && (
        <InfiniteScrollSentinel
          loadMoreEvent={loadMoreEvent}
          isLoading={isLoading}
          hasMore={hasMore}
        />
      )}
    </Box>
  );
};

DataList.displayName = 'DataList';
