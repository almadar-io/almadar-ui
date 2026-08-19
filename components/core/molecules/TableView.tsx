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
import type { EntityRow, EntityWith, FieldValue, EventKey } from '@almadar/core';
import type { ItemActionPayload, SelectionChangePayload } from '@almadar/core/patterns';
import { cn } from '../../../lib/cn';
import { formatValue, humanizeEnumValue, humanizeFieldName } from '../../../lib/format';
import { createLogger } from '@almadar/logger';

const tableViewLog = createLogger('almadar:ui:table-view');
import { getNestedValue } from '../../../lib/getNestedValue';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';
import { Box } from '../atoms/Box';
import { VStack, HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import type { IconInput } from '../atoms/index';
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
  /** Lucide icon name or component shown before the header label. */
  icon?: IconInput;
  /** Allow click-to-sort on this column's header (emits `sortEvent`). */
  sortable?: boolean;
}

// ── Item Action Definition ───────────────────────────────────────────

export interface TableViewItemAction {
  /** Button label. */
  label: string;
  /** Event name to emit (dispatched as UI:{event} with { id, row }). */
  event: EventKey;
  /** Lucide icon name or component. */
  icon?: IconInput;
  /** Button variant. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

// ── Props ────────────────────────────────────────────────────────────

/**
 * TableView — sortable, selectable data table rendering rows over configurable
 * columns, with inline row actions and grouping.
 *
 * @capabilities admin console table, records list, CRUD data table, user list, manage-users grid, sortable columns, row selection with bulk actions, grouped list view
 */
export interface TableViewProps extends DataDndProps {
  /** Schema entity data — the collection of rows to render. */
  entity: readonly EntityRow[];
  /** Column definitions. The compiler emits `columns`; `fields` is the alias. */
  columns?: readonly TableViewColumn[];
  /** Alias for `columns`. */
  fields?: readonly TableViewColumn[];
  /** Per-row actions, collected under a trailing kebab overflow menu. */
  itemActions?: readonly TableViewItemAction[];
  /** @deprecated Row actions always render as a kebab menu now (UX doctrine: row actions behind an overflow menu; a pinned inline button strip paints over cells during horizontal scroll). Accepted and ignored. */
  maxInlineActions?: number;
  /** When set, the whole row is clickable and emits UI:{itemClickEvent} with
   *  { id, row } (action-button clicks stopPropagation so they still win).
   *  Mirrors DataList's contract. When OMITTED and `itemActions` exist, the
   *  row click defaults to the first non-danger item action (the view/open
   *  action by authoring convention) — a danger action never becomes the row
   *  default (destructive actions require intentional reach). */
  itemClickEvent?: EventKey;
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
  children?: (item: EntityRow, index: number) => React.ReactNode;
  /**
   * Per-row render function (schema alias). In .orb: ["fn","item",{...}].
   * The compiler converts this to the children render prop.
   * In .lolo, author the per-row renderer as renderItem: (fn item <Component …={@item.field}/>), binding per-item fields via @item.field.
   * @deprecated Use children in React code; exists for pattern registry sync.
   */
  renderItem?: (item: EntityRow, index: number) => React.ReactNode;
  /**
   * Layer 2 visual treatment — mirrors the data-list / entity-table look enum
   * so authors share one knob name across row renderers.
   */
  look?: 'dense' | 'spacious' | 'striped' | 'borderless' | 'bordered';
}

// ── Helpers ──────────────────────────────────────────────────────────

function renderIconInput(icon: IconInput, props: React.ComponentProps<typeof Icon>): React.ReactElement {
  return typeof icon === 'string'
    ? <Icon name={icon} {...props} />
    : <Icon icon={icon} {...props} />;
}

function columnLabel(col: TableViewColumn): string {
  return col.header ?? col.label ?? humanizeFieldName(col.key);
}

function asFieldValue(v: ReturnType<typeof getNestedValue>): FieldValue | undefined {
  if (v === undefined || v === null) return v as null | undefined;
  const t = typeof v;
  if (t === 'string' || t === 'number' || t === 'boolean') return v as FieldValue;
  if (v instanceof Date) return v;
  if (Array.isArray(v)) return v as FieldValue;
  if (t === 'object') return v as FieldValue;
  return undefined;
}

function statusVariant(value: string): 'success' | 'warning' | 'error' | 'info' | 'default' {
  const v = value.toLowerCase();
  if (['active', 'completed', 'done', 'approved', 'published', 'resolved', 'open', 'online', 'ok'].includes(v)) return 'success';
  if (['pending', 'in_progress', 'in-progress', 'review', 'draft', 'processing', 'warn', 'warning'].includes(v)) return 'warning';
  if (['inactive', 'deleted', 'rejected', 'failed', 'error', 'blocked', 'closed', 'offline'].includes(v)) return 'error';
  if (['new', 'created', 'scheduled', 'queued', 'info'].includes(v)) return 'info';
  return 'default';
}

const formatCell = (value: FieldValue | undefined, format?: TableViewColumn['format']): string =>
  formatValue(value, format);

function groupData(
  items: EntityRow[],
  field: string,
): { label: string; items: EntityRow[] }[] {
  const groups = new Map<string, EntityRow[]>();
  for (const item of items) {
    const key = String(getNestedValue(item, field) ?? '');
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return Array.from(groups.entries()).map(([label, groupItems]) => ({ label, items: groupItems }));
}

/** Ceiling on a measured column floor, so one prose column can't starve the rest. */
const MAX_MEASURED_COL_CH = 32;

/** Horizontal padding a Badge adds around its label, in approximate `ch`. */
const BADGE_CHROME_CH = 4;

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
  dense: { rowPad: 'px-card-md py-2', headPad: 'px-card-md py-2', striped: false, divider: true },
  spacious: { rowPad: 'px-card-lg py-card-md', headPad: 'px-card-lg py-card-sm', striped: false, divider: true },
  striped: { rowPad: 'px-card-md py-card-sm', headPad: 'px-card-md py-card-sm', striped: true, divider: false },
  borderless: { rowPad: 'px-card-md py-card-sm', headPad: 'px-card-md py-card-sm', striped: false, divider: false },
  bordered: { rowPad: 'px-card-md py-card-sm', headPad: 'px-card-md py-card-sm', striped: false, divider: true },
};

// ── Component ────────────────────────────────────────────────────────

export function TableView({
  entity,
  columns,
  fields,
  itemActions,
  maxInlineActions: _maxInlineActions,
  itemClickEvent = '',
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
}: TableViewProps) {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const [visibleCount, setVisibleCount] = React.useState(pageSize > 0 ? pageSize : Infinity);
  const [localSelected, setLocalSelected] = React.useState<ReadonlySet<string>>(new Set());

  // Both `columns`/`fields` and `itemActions` coerce to an array first: a
  // transient render can hand this pure component an unresolved `@config.X`
  // forward STRING, and `"@config.itemActions".length > 0` is true — so a bare
  // truthiness check then throws on `.map`. Mirrors DataGrid.tsx, but keeps
  // TableView's `columns`-first precedence (DataGrid is `fields`-first);
  // do not "harmonize" the two.
  const colDefs: readonly TableViewColumn[] =
    (Array.isArray(columns) ? columns : undefined) ?? (Array.isArray(fields) ? fields : undefined) ?? [];
  const actionDefs: readonly TableViewItemAction[] = Array.isArray(itemActions) ? itemActions : [];
  const allDataRaw = Array.isArray(entity) ? entity : entity ? [entity] : [];

  const dnd = useDataDnd({
    items: allDataRaw as readonly EntityRow[],
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
  const ordered = dnd.orderedItems;
  const data = pageSize > 0 ? ordered.slice(0, visibleCount) : ordered;
  const hasMore = pageSize > 0 && visibleCount < ordered.length;
  const hasRenderProp = typeof children === 'function';
  const idField = dndItemIdField ?? 'id';

  // `tableViewLog` was declared and never called, so every diagnosis of this
  // component started blind. Hook order is safe: there are no early returns.
  React.useEffect(() => {
    tableViewLog.debug('render', {
      rowCount: data.length,
      colCount: colDefs.length,
      look,
      isLoading: Boolean(isLoading),
      hasError: Boolean(error),
      dnd: dnd.enabled,
    });
    if (data.length > 0 && !hasRenderProp && colDefs.length === 0) {
      tableViewLog.warn('columns-unresolved', {
        rowCount: data.length,
        columnsIsArray: Array.isArray(columns),
        fieldsIsArray: Array.isArray(fields),
      });
    }
  }, [data, colDefs, look, isLoading, error, dnd.enabled, hasRenderProp, columns, fields]);

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

  // Explicit itemClickEvent wins; otherwise the first non-danger item action
  // is the row's default click (declared `variant` is the semantic marker —
  // no label/name matching — and a destructive action never becomes the
  // default). Danger-only tables get no row click. The '' default is a
  // declared contract the lolo-ui generator honors (default-off outlet).
  const rowClickEvent: EventKey | undefined =
    itemClickEvent || actionDefs.find((a) => a.variant !== 'danger')?.event;

  const handleRowClick = (row: EntityRow) => () => {
    if (!rowClickEvent) return;
    const payload: ItemActionPayload = {
      id: row.id as string | number,
      row: row as ItemActionPayload['row'],
    };
    eventBus.emit(`UI:${rowClickEvent}`, payload);
  };

  // A bare `minmax(0, 1fr)` splits width evenly, so a long value (an email) is
  // truncated while a short one (a badge) wastes its share. The floor can't be
  // `min-content`/`auto` — each row is its own grid, so a content-measured track
  // differs per row and the columns drift. Measuring the whole visible page
  // instead yields one floor that is identical for the header and every row, so
  // alignment holds. Must run BEFORE the loading/error/empty early returns:
  // a hook below them changes the hook count when data arrives (React #300).
  const colFloors = React.useMemo(
    () => colDefs.map((col) => {
      const longest = data.reduce((widest, row) => {
        const cell = formatCell(asFieldValue(getNestedValue(row, col.field ?? col.key)), col.format);
        return Math.max(widest, cell.length);
      }, columnLabel(col).length);
      // A badge wraps its text in padding, so the raw character count
      // under-measures the track it actually needs.
      const chrome = col.format === 'badge' ? BADGE_CHROME_CH : 0;
      return Math.min(longest + chrome, MAX_MEASURED_COL_CH);
    }),
    [colDefs, data],
  );

  // The header is CHROME, not data. Loading / error / empty each used to return
  // a header-less node, so any render where `entity` resolved to `[]` dropped
  // the column headers and a populated render put them back — which is the
  // "columns appear momentarily then disappear" flicker. DataTable.tsx already
  // avoids this by keeping <thead> and putting the empty check inside the table;
  // the three states now collapse to one status row rendered UNDER the header.
  const statusNode = isLoading ? (
    <Box className="text-center py-8">
      <Typography variant="body" color="secondary">{t('loading.items')}</Typography>
    </Box>
  ) : error ? (
    <Box className="text-center py-8">
      <Typography variant="body" color="error">{error.message}</Typography>
    </Box>
  ) : data.length === 0 ? (
    <Box className="text-center py-12">
      <Typography variant="body" color="secondary">{emptyMessage || t('empty.noItems')}</Typography>
    </Box>
  ) : null;

  const lk = LOOKS[look];

  // Shared CSS-grid track template so columns line up across every row
  // (flex-per-row sizes each row independently → misaligned columns). The
  // actions track must be a FIXED size, not `auto`: each row is its own grid,
  // so an `auto` track measures that row's own content — empty (0) in the
  // header, wide in the body — and the `fr` data columns then split different
  // leftover space per row, drifting the header labels off their columns. A
  // fixed width is identical in header and body, so columns stay aligned.
  const hasActions = actionDefs.length > 0;
  // All row actions live under one kebab menu: an inline button strip needs a
  // wide fixed track that, pinned, paints over data cells during horizontal
  // scroll (looked broken); a single 3rem icon cell with a hairline edge is
  // the standard overflow affordance and covers nothing meaningful.
  const actionsTrack = hasActions ? '3rem' : null;
  const gridTemplateColumns = [
    selectable ? 'auto' : null,
    ...colDefs.map((c, i) => c.width ?? `minmax(${colFloors[i]}ch, 1fr)`),
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
        'text-muted-foreground uppercase text-xs font-semibold tracking-wide',
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
            {col.icon && renderIconInput(col.icon, { size: 'xs' })}
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
      {hasActions && (
        <Box aria-hidden className="sticky right-0 bg-[var(--color-surface-subtle)] border-l border-[var(--color-border)] h-full" />
      )}
    </Box>
  );

  // ── A single body row ───────────────────────────────────────────
  const renderRow = (row: EntityRow, index: number) => {
    const id = String(row[idField] ?? index);
    const rowInner = (
      <Box
        role="row"
        data-entity-row
        data-entity-id={id}
        onClick={rowClickEvent ? handleRowClick(row) : undefined}
        style={!hasRenderProp ? { gridTemplateColumns } : undefined}
        className={cn(
          'group items-center gap-3 transition-colors duration-fast',
          hasRenderProp ? 'flex' : 'grid',
          rowClickEvent && 'cursor-pointer',
          lk.rowPad,
          lk.divider && 'border-b border-[var(--color-border)]',
          lk.striped && index % 2 === 1 && 'bg-[var(--color-surface-subtle)]',
          'hover:bg-[var(--color-surface-subtle)]',
          look === 'bordered' && '[&>*]:border-r [&>*]:border-[var(--color-border)] [&>*:last-child]:border-r-0',
        )}
      >
        {selectable && (
          <Box className="flex items-center" onClick={rowClickEvent ? (e) => e.stopPropagation() : undefined}>
            <Checkbox
              checked={selected.has(id)}
              onChange={() => toggleRow(id)}
              aria-label={t('table.selectRow', { id })}
            />
          </Box>
        )}
        {hasRenderProp ? (
          <Box className="flex-1 min-w-0">{children(row, index)}</Box>
        ) : (
          colDefs.map((col) => {
            const raw = asFieldValue(getNestedValue(row, col.field ?? col.key));
            const cellBase = cn(
              'flex items-center min-w-0',
              alignClass[col.align ?? 'left'],
              weightClass[col.weight ?? 'normal'],
              col.className,
            );
            if (col.format === 'badge' && raw != null && raw !== '') {
              return (
                <Box key={col.key} role="cell" className={cellBase}>
                  <Badge variant={statusVariant(String(raw))} size="sm" className="whitespace-nowrap">{humanizeEnumValue(String(raw))}</Badge>
                </Box>
              );
            }
            return (
              <Box key={col.key} role="cell" className={cellBase}>
                <span className="truncate text-foreground">{formatCell(raw, col.format)}</span>
              </Box>
            );
          })
        )}
        {hasActions && (
          <HStack
            gap="xs"
            // The Menu's item onClick has no stopPropagation of its own, so
            // the whole actions cell shields the row click instead.
            onClick={rowClickEvent ? (e) => e.stopPropagation() : undefined}
            className={cn(
              // Pinned: the fixed column tracks routinely overflow the caller's
              // scroll container, which would leave the kebab off-screen.
              // Opaque + hairline edge so it reads as a pinned column, not a
              // floating control, while scrolled cells pass underneath.
              'justify-end flex-shrink-0 sticky right-0 z-[1] transition-colors',
              'border-l border-[var(--color-border)]',
              lk.striped && index % 2 === 1
                ? 'bg-[var(--color-surface-subtle)]'
                : 'bg-[var(--color-card)] group-hover:bg-[var(--color-surface-subtle)]',
            )}
          >
            <Menu
              position="bottom-end"
              trigger={
                <Button variant="ghost" size="sm" aria-label={t('common.actions')} data-testid="action-overflow" data-row-id={String(row.id)}>
                  <Icon name="more-horizontal" size="xs" />
                </Button>
              }
              items={actionDefs.map((action) => ({
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

  const items = Array.from(data);
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

  // A header with no columns and no render prop is an empty bar — noise, not
  // chrome. Every other case keeps it mounted so the status row replaces the
  // BODY only, and one `wrapContainer` keeps an empty list a valid drop target.
  const showHeader = colDefs.length > 0 || hasRenderProp;

  return (
    <Box
      role="table"
      className={cn('w-full text-sm', className)}
    >
      {showHeader && header}
      {dnd.wrapContainer(statusNode ? <Box role="rowgroup">{statusNode}</Box> : body)}
      {!statusNode && hasMore && (
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
