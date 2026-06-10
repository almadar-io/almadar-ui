'use client';
/**
 * TableView Molecule
 *
 * A simplified, schema-driven column table for iterating over entity data.
 * The table-shaped sibling of DataList (rows) and DataGrid (cards): same
 * `entity` + `columns`/`fields` + `itemActions` contract and the same
 * `useDataDnd` drag-to-reorder machinery, rendered as aligned columns with a
 * header. All complexity is opt-in: selection, drag-reorder, and per-column
 * sorting are each enabled by their own props and emit via the event bus.
 *
 * Uses atoms only internally: Box, VStack, HStack, Typography, Badge, Button,
 * Icon, Checkbox, Divider.
 */
import React from 'react';
import type { EntityRow, EventKey, EntityCollection } from '@almadar/core';
import type { ItemActionPayload, SelectionChangePayload } from '@almadar/patterns';
import { cn } from '../../lib/cn';
import { createLogger } from '@almadar/logger';

const tableViewLog = createLogger('almadar:ui:table-view');
import { getNestedValue } from '../../lib/getNestedValue';
import { useEventBus } from '../../hooks/useEventBus';
import { useTranslate } from '../../hooks/useTranslate';
import { Box } from '../atoms/Box';
import { VStack, HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { Checkbox } from '../atoms/Checkbox';
import { Divider } from '../atoms/Divider';
import { Menu } from './Menu';
import { useDataDnd, type DataDndProps } from './useDataDnd';
import type { UiError } from '../atoms/types';

// ── Column Definition ────────────────────────────────────────────────

export interface TableViewColumn {
  /** Stable column key (React key + default value lookup). */
  key: string;
  /** Entity field to read (dot-notation ok). Defaults to `key`. */
  field?: string;
  /** Header cell text. Falls back to `label`, then a humanized `key`. */
  header?: string;
  /** Accessibility / fallback label. */
  label?: string;
  /** CSS grid track size for this column (e.g. "7rem", "minmax(10rem, 1.5fr)",
   *  "1fr"). Shared across header + body so columns align. Defaults to
   *  "minmax(0, 1fr)" (equal flexible share). */
  width?: string;
  /** Horizontal alignment of the column's cells. */
  align?: 'left' | 'center' | 'right';
  /** Extra cell classes (e.g. "font-mono tabular-nums truncate"). */
  className?: string;
  /** Render the cell value with the given font weight. */
  weight?: 'normal' | 'medium' | 'semibold';
  /** Value formatting hint. `badge` renders a status Badge. */
  format?: 'badge' | 'date' | 'currency' | 'number' | 'percent' | 'boolean';
  /** Lucide icon shown before the header label. */
  icon?: string;
  /** Allow click-to-sort on this column's header (emits `sortEvent`). */
  sortable?: boolean;
}

// ── Item Action Definition ───────────────────────────────────────────

export interface TableViewItemAction {
  /** Button label. */
  label: string;
  /** Event name to emit (dispatched as UI:{event} with { id, row }). */
  event: EventKey;
  /** Lucide icon name. */
  icon?: string;
  /** Button variant. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

// ── Props ────────────────────────────────────────────────────────────

export interface TableViewProps<T extends EntityRow = EntityRow> extends DataDndProps {
  /** Schema entity data — single record or collection. */
  entity: EntityCollection<T>;
  /** Column definitions. The compiler emits `columns`; `fields` is the alias. */
  columns?: readonly TableViewColumn[];
  /** Alias for `columns`. */
  fields?: readonly TableViewColumn[];
  /** Per-row action buttons (trailing column). */
  itemActions?: readonly TableViewItemAction[];
  /** Max inline action buttons before the rest collapse into a "⋯" overflow menu. Omit = all inline. */
  maxInlineActions?: number;
  /** Render a leading checkbox column. Selection changes emit `selectEvent`. */
  selectable?: boolean;
  /** Event emitted on selection change: UI:{selectEvent} with { ids, rows }. */
  selectEvent?: EventKey;
  /** Currently-selected ids (controlled). Falls back to local state when omitted. */
  selectedIds?: readonly string[];
  /** Event emitted on sortable-header click: UI:{sortEvent} with { column, direction }. */
  sortEvent?: EventKey;
  /** Current sort column (display hint for the active header arrow). */
  sortColumn?: string;
  /** Current sort direction (display hint). */
  sortDirection?: 'asc' | 'desc';
  /** Additional CSS classes applied to the table root. */
  className?: string;
  /** Message shown when there are no rows. */
  emptyMessage?: string;
  /** Loading state. */
  isLoading?: boolean;
  /** Error state. */
  error?: UiError | null;
  /** Group rows under section headers by a field value. */
  groupBy?: string;
  /** Max rows before a "Show More" button. Defaults to 0 (show all). */
  pageSize?: number;
  /**
   * Custom per-row render. When provided, the whole row content is delegated
   * to this function (columns are ignored for the body; the header still
   * renders). Mirrors DataList's children render prop.
   */
  children?: (item: T, index: number) => React.ReactNode;
  /**
   * Per-row render function (schema alias). In .orb: ["fn","item",{...}].
   * The compiler converts this to the children render prop.
   * @deprecated Use children in React code; exists for pattern registry sync.
   */
  renderItem?: (item: T, index: number) => React.ReactNode;
  /**
   * Layer 2 visual treatment — mirrors the data-list / entity-table look enum
   * so authors share one knob name across row renderers.
   */
  look?: 'dense' | 'spacious' | 'striped' | 'borderless' | 'bordered';
}

// ── Helpers ──────────────────────────────────────────────────────────

function columnLabel(col: TableViewColumn): string {
  return (
    col.header ??
    col.label ??
    col.key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function statusVariant(value: string): 'success' | 'warning' | 'error' | 'info' | 'default' {
  const v = value.toLowerCase();
  if (['active', 'completed', 'done', 'approved', 'published', 'resolved', 'open', 'online', 'ok'].includes(v)) return 'success';
  if (['pending', 'in_progress', 'in-progress', 'review', 'draft', 'processing', 'warn', 'warning'].includes(v)) return 'warning';
  if (['inactive', 'deleted', 'rejected', 'failed', 'error', 'blocked', 'closed', 'offline'].includes(v)) return 'error';
  if (['new', 'created', 'scheduled', 'queued', 'info'].includes(v)) return 'info';
  return 'default';
}

function formatCell(value: unknown, format?: TableViewColumn['format']): string {
  if (value === undefined || value === null) return '';
  switch (format) {
    case 'date': {
      const d = new Date(String(value));
      return isNaN(d.getTime())
        ? String(value)
        : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
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

const alignClass: Record<NonNullable<TableViewColumn['align']>, string> = {
  left: 'justify-start text-left',
  center: 'justify-center text-center',
  right: 'justify-end text-right',
};

const weightClass: Record<NonNullable<TableViewColumn['weight']>, string> = {
  normal: '',
  medium: 'font-medium',
  semibold: 'font-semibold',
};

interface LookConfig {
  /** Cell padding for body rows. */
  rowPad: string;
  /** Cell padding for the header row. */
  headPad: string;
  /** Stripe even rows. */
  striped: boolean;
  /** Hairline between rows. */
  divider: boolean;
}

const LOOKS: Record<NonNullable<TableViewProps['look']>, LookConfig> = {
  dense: { rowPad: 'px-card-md py-card-sm', headPad: 'px-card-md py-card-sm', striped: false, divider: true },
  spacious: { rowPad: 'px-card-lg py-card-md', headPad: 'px-card-lg py-card-sm', striped: false, divider: true },
  striped: { rowPad: 'px-card-md py-card-sm', headPad: 'px-card-md py-card-sm', striped: true, divider: false },
  borderless: { rowPad: 'px-card-md py-card-sm', headPad: 'px-card-md py-card-sm', striped: false, divider: false },
  bordered: { rowPad: 'px-card-md py-card-sm', headPad: 'px-card-md py-card-sm', striped: false, divider: true },
};

// ── Component ────────────────────────────────────────────────────────

export function TableView<T extends EntityRow = EntityRow>({
  entity,
  columns,
  fields,
  itemActions,
  maxInlineActions,
  selectable = false,
  selectEvent,
  selectedIds,
  sortEvent,
  sortColumn,
  sortDirection,
  className,
  emptyMessage,
  isLoading = false,
  error = null,
  groupBy,
  pageSize = 0,
  children,
  renderItem: _schemaRenderItem,
  look = 'dense',
  // DnD props consumed by useDataDnd.
  dragGroup,
  accepts,
  sortable,
  dropEvent,
  reorderEvent,
  positionEvent,
  dndItemIdField,
  dndRoot,
}: TableViewProps<T>) {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const [visibleCount, setVisibleCount] = React.useState(pageSize > 0 ? pageSize : Infinity);
  const [localSelected, setLocalSelected] = React.useState<ReadonlySet<string>>(new Set());

  const colDefs: readonly TableViewColumn[] = columns ?? fields ?? [];
  const allDataRaw = Array.isArray(entity) ? entity : entity ? [entity] : [];

  const dnd = useDataDnd({
    items: allDataRaw as readonly T[],
    layout: 'list',
    dragGroup,
    accepts,
    sortable,
    dropEvent,
    reorderEvent,
    positionEvent,
    dndItemIdField,
    dndRoot,
  });
  const ordered = dnd.orderedItems as readonly Record<string, unknown>[];
  const data = pageSize > 0 ? ordered.slice(0, visibleCount) : ordered;
  const hasMore = pageSize > 0 && visibleCount < ordered.length;
  const hasRenderProp = typeof children === 'function';
  const idField = dndItemIdField ?? 'id';

  const selected = selectedIds ? new Set(selectedIds) : localSelected;

  const emitSelection = (next: ReadonlySet<string>) => {
    if (!selectedIds) setLocalSelected(next);
    if (selectEvent) {
      const payload: SelectionChangePayload = { selectedIds: Array.from(next) };
      eventBus.emit(`UI:${selectEvent}`, payload);
    }
  };
  const allSelected = selectable && data.length > 0 && data.every((r, i) => selected.has(String(r[idField] ?? i)));
  const toggleAll = () => {
    if (allSelected) emitSelection(new Set());
    else emitSelection(new Set(data.map((r, i) => String(r[idField] ?? i))));
  };
  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    emitSelection(next);
  };

  const handleSort = (col: TableViewColumn) => {
    if (!col.sortable || !sortEvent) return;
    const dir = sortColumn === (col.field ?? col.key) && sortDirection === 'asc' ? 'desc' : 'asc';
    eventBus.emit(`UI:${sortEvent}`, { column: col.field ?? col.key, direction: dir });
  };

  const handleActionClick =
    (action: TableViewItemAction, row: Record<string, unknown>) => (e: React.MouseEvent) => {
      e.stopPropagation();
      const payload: ItemActionPayload = {
        id: row.id as string | number,
        row: row as ItemActionPayload['row'],
      };
      eventBus.emit(`UI:${action.event}`, payload);
    };

  if (isLoading) {
    return (
      <Box className="text-center py-8">
        <Typography variant="body" color="secondary">{t('loading.items')}</Typography>
      </Box>
    );
  }
  if (error) {
    return (
      <Box className="text-center py-8">
        <Typography variant="body" color="error">{error.message}</Typography>
      </Box>
    );
  }
  if (data.length === 0) {
    const emptyNode = (
      <Box className="text-center py-12">
        <Typography variant="body" color="secondary">{emptyMessage || t('empty.noItems')}</Typography>
      </Box>
    );
    return dnd.enabled ? <>{dnd.wrapContainer(emptyNode)}</> : emptyNode;
  }

  const lk = LOOKS[look];

  // Shared CSS-grid track template so columns line up across every row
  // (flex-per-row sizes each row independently → misaligned columns). The
  // actions track must be a FIXED size, not `auto`: each row is its own grid,
  // so an `auto` track measures that row's own content — empty (0) in the
  // header, wide in the body — and the `fr` data columns then split different
  // leftover space per row, drifting the header labels off their columns. A
  // fixed width is identical in header and body, so columns stay aligned.
  const hasActions = Boolean(itemActions && itemActions.length > 0);
  const inlineActionCount = hasActions
    ? (maxInlineActions != null ? Math.min(itemActions!.length, maxInlineActions) : itemActions!.length)
    : 0;
  const hasOverflowActions = hasActions && maxInlineActions != null && itemActions!.length > maxInlineActions;
  const actionsTrack = hasActions
    ? `${inlineActionCount * 6 + (hasOverflowActions ? 3 : 0)}rem`
    : null;
  const gridTemplateColumns = [
    selectable ? 'auto' : null,
    ...colDefs.map((c) => c.width ?? 'minmax(0, 1fr)'),
    actionsTrack,
  ].filter(Boolean).join(' ');

  // ── Header row ──────────────────────────────────────────────────
  const header = (
    <Box
      role="row"
      style={{ gridTemplateColumns }}
      className={cn(
        'grid items-center gap-3 sticky top-0 z-10',
        'bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)]',
        'text-[var(--color-text-muted)] uppercase text-xs font-semibold tracking-wide',
        lk.headPad,
      )}
    >
      {selectable && (
        <Box className="flex items-center">
          <Checkbox checked={allSelected} onChange={toggleAll} aria-label={t('aria.selectAllRows')} />
        </Box>
      )}
      {colDefs.map((col) => {
        const active = sortColumn === (col.field ?? col.key);
        return (
          <Box
            key={col.key}
            role="columnheader"
            onClick={() => handleSort(col)}
            className={cn(
              'flex items-center gap-1 min-w-0',
              alignClass[col.align ?? 'left'],
              col.sortable && sortEvent && 'cursor-pointer select-none hover:text-foreground',
            )}
          >
            {col.icon && <Icon name={col.icon} size="xs" />}
            <span className="truncate">{columnLabel(col)}</span>
            {col.sortable && sortEvent && (
              <Icon
                name={active ? (sortDirection === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevrons-up-down'}
                size="xs"
                className={cn('flex-shrink-0', active ? 'text-foreground' : 'opacity-40')}
              />
            )}
          </Box>
        );
      })}
      {hasActions && <Box aria-hidden />}
    </Box>
  );

  // ── A single body row ───────────────────────────────────────────
  const renderRow = (row: Record<string, unknown>, index: number) => {
    const id = String(row[idField] ?? index);
    const rowInner = (
      <Box
        role="row"
        data-entity-row
        data-entity-id={id}
        style={!hasRenderProp ? { gridTemplateColumns } : undefined}
        className={cn(
          'group items-center gap-3 transition-colors duration-fast',
          hasRenderProp ? 'flex' : 'grid',
          lk.rowPad,
          lk.divider && 'border-b border-[var(--color-border)]',
          lk.striped && index % 2 === 1 && 'bg-[var(--color-surface-subtle)]',
          'hover:bg-[var(--color-surface-subtle)]',
          look === 'bordered' && '[&>*]:border-r [&>*]:border-[var(--color-border)] [&>*:last-child]:border-r-0',
        )}
      >
        {selectable && (
          <Box className="flex items-center">
            <Checkbox
              checked={selected.has(id)}
              onChange={() => toggleRow(id)}
              aria-label={`Select row ${id}`}
            />
          </Box>
        )}
        {hasRenderProp ? (
          <Box className="flex-1 min-w-0">{children(row as T, index)}</Box>
        ) : (
          colDefs.map((col) => {
            const raw = getNestedValue(row, col.field ?? col.key);
            const cellBase = cn(
              'flex items-center min-w-0',
              alignClass[col.align ?? 'left'],
              weightClass[col.weight ?? 'normal'],
              col.className,
            );
            if (col.format === 'badge' && raw != null && raw !== '') {
              return (
                <Box key={col.key} role="cell" className={cellBase}>
                  <Badge variant={statusVariant(String(raw))} size="sm">{String(raw)}</Badge>
                </Box>
              );
            }
            return (
              <Box key={col.key} role="cell" className={cellBase}>
                <span className="truncate">{formatCell(raw, col.format)}</span>
              </Box>
            );
          })
        )}
        {itemActions && itemActions.length > 0 && (
          <HStack gap="xs" className="justify-end flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
            {(maxInlineActions != null ? itemActions.slice(0, maxInlineActions) : itemActions).map((action, i) => (
              <Button
                key={i}
                variant={action.variant ?? 'ghost'}
                size="sm"
                onClick={handleActionClick(action, row)}
                data-testid={`action-${action.event}`}
                data-row-id={String(row.id)}
                className={cn(action.variant === 'danger' && 'text-error hover:bg-error/10')}
              >
                {action.icon && <Icon name={action.icon} size="xs" className="mr-1" />}
                {action.label}
              </Button>
            ))}
            {maxInlineActions != null && itemActions.length > maxInlineActions && (
              <Menu
                position="bottom-end"
                trigger={
                  <Button variant="ghost" size="sm" aria-label={t('common.actions')} data-testid="action-overflow">
                    <Icon name="more-horizontal" size="xs" />
                  </Button>
                }
                items={itemActions.slice(maxInlineActions).map((action) => ({
                  label: action.label,
                  icon: action.icon,
                  event: action.event,
                  variant: action.variant === 'danger' ? 'danger' : 'default',
                  onClick: () =>
                    eventBus.emit(`UI:${action.event}`, {
                      id: row.id as string | number,
                      row: row as ItemActionPayload['row'],
                    }),
                }))}
              />
            )}
          </HStack>
        )}
      </Box>
    );
    return dnd.isZone ? (
      <dnd.SortableItem key={id} id={row[idField] as string | number ?? id}>{rowInner}</dnd.SortableItem>
    ) : (
      <React.Fragment key={id}>{rowInner}</React.Fragment>
    );
  };

  const items = data.map((row) => row as Record<string, unknown>);
  const groups = groupBy ? groupData(items, groupBy) : [{ label: '', items }];

  let runningIndex = 0;
  const body = (
    <Box role="rowgroup">
      {groups.map((group, gi) => (
        <React.Fragment key={gi}>
          {group.label && <Divider label={group.label} className={gi > 0 ? 'mt-3' : 'mt-0'} />}
          {group.items.map((row) => renderRow(row, runningIndex++))}
        </React.Fragment>
      ))}
    </Box>
  );

  return (
    <Box
      role="table"
      className={cn('w-full text-sm', className)}
    >
      {header}
      {dnd.wrapContainer(body)}
      {hasMore && (
        <Box className="flex justify-center py-3">
          <Button variant="ghost" size="sm" onClick={() => setVisibleCount((p) => p + (pageSize || 5))}>
            <Icon name="chevron-down" size="xs" className="mr-1" />
            {t('common.showMore')} ({t('common.remaining', { count: ordered.length - visibleCount })})
          </Button>
        </Box>
      )}
    </Box>
  );
}

TableView.displayName = 'TableView';
