'use client';
/**
 * Gantt Molecule
 *
 * View-only Gantt/timeline: task bars on a day-scale axis with group headers,
 * SVG dependency arrows, a today marker, and horizontal scroll. No drag-edit,
 * no zoom — placement comes entirely from the row fields.
 *
 * Field-mapping idiom matches CalendarGrid (`titleField`/`startField`/…): a
 * bound host names its own columns instead of renaming entity fields.
 * Uses atoms only internally: Box, VStack, HStack, Typography.
 */
import React, { useMemo } from 'react';
import type { EntityRow, EventEmit, FieldValue } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { getNestedValue } from '../../../lib/getNestedValue';
import { useTranslate } from '../../../hooks/useTranslate';
import { Box } from '../atoms/Box';
import { VStack, HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import type { UiError } from '../atoms/types';

/** A dependency between two task ids: `to` cannot start before `from` ends. */
export interface GanttLink {
  /** Id of the predecessor task row */
  from: string;
  /** Id of the dependent task row */
  to: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const ROW_HEIGHT = 36;
const HEADER_HEIGHT = 44;
const LABEL_WIDTH = 192;

/** Bar treatment per status value; unknown statuses fall back to primary. */
const STATUS_BAR: Record<string, string> = {
  complete: 'bg-success/80 hover:bg-success',
  done: 'bg-success/80 hover:bg-success',
  active: 'bg-primary/80 hover:bg-primary',
  'in-progress': 'bg-primary/80 hover:bg-primary',
  blocked: 'bg-error/80 hover:bg-error',
  error: 'bg-error/80 hover:bg-error',
  'at-risk': 'bg-warning/80 hover:bg-warning',
  pending: 'bg-muted-foreground/50 hover:bg-muted-foreground/70',
};

/**
 * Gantt — view-only task schedule rendering rows as bars on a day axis.
 *
 * @capabilities gantt chart, project timeline, schedule view, task bars, dependency arrows, roadmap, milestone plan
 * @fieldsContract display
 */
export interface GanttProps {
  /**
   * Schema entity data — the task rows to place on the axis. pattern-sync tags
   * it `kind:"entity", cardinality:"collection"` so consumers bind the domain
   * entity without name-matching the prop.
   */
  tasks?: readonly EntityRow[];
  /** Dependency arrows between task ids */
  links?: readonly GanttLink[];
  /** Row field holding the bar label. Defaults to `title`. */
  titleField?: string;
  /** Row field holding the start timestamp (ISO or epoch). Defaults to `start`. */
  startField?: string;
  /** Row field holding the end timestamp (ISO or epoch). Defaults to `end`.
   *  When absent, `durationField` (days) is used instead. */
  endField?: string;
  /** Row field holding the task length in days, used when the row has no end. */
  durationField?: string;
  /** Row field holding the bar status (drives bar colour). Defaults to `status`. */
  statusField?: string;
  /** Row field rows are grouped under header rows by. Empty (default) = flat list. */
  groupField?: string;
  /** First visible day (ISO or Date). Defaults to 2 days before the earliest task. */
  rangeStart?: string | Date;
  /** Last visible day (ISO or Date). Defaults to 2 days after the latest task end. */
  rangeEnd?: string | Date;
  /** Paint the today marker line when today falls inside the range (default true). */
  showToday?: boolean;
  /** Pixels per day on the axis (default 28) */
  dayWidth?: number;
  /** Event emitted when a bar is clicked: UI:{barClickEvent} with { id } */
  barClickEvent?: EventEmit<{ id: string }>;
  /** Additional CSS classes */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: UiError | null;
}

interface PlacedTask {
  row: EntityRow;
  id: string;
  label: string;
  status: string;
  group: string;
  start: Date;
  end: Date;
}

function parseDay(value: FieldValue | Date | undefined): Date | null {
  if (value === undefined || value === null || value === '') return null;
  const d = value instanceof Date ? new Date(value.getTime()) : new Date(value as string | number);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

type DisplayItem =
  | { kind: 'group'; label: string }
  | { kind: 'task'; task: PlacedTask };

export function Gantt({
  tasks = [],
  links = [],
  titleField = 'title',
  startField = 'start',
  endField = 'end',
  durationField,
  statusField = 'status',
  groupField = '',
  rangeStart,
  rangeEnd,
  showToday = true,
  dayWidth = 28,
  barClickEvent,
  className,
  isLoading = false,
  error = null,
}: GanttProps): React.JSX.Element {
  const { t } = useTranslate();

  const placed = useMemo<PlacedTask[]>(() => {
    const rows = Array.isArray(tasks) ? tasks : tasks ? [tasks] : [];
    const out: PlacedTask[] = [];
    rows.forEach((row, idx) => {
      const start = parseDay(getNestedValue(row, startField));
      if (!start) return;
      let end = parseDay(getNestedValue(row, endField));
      if (!end && durationField) {
        const days = Number(getNestedValue(row, durationField));
        if (Number.isFinite(days) && days > 0) {
          end = new Date(start.getTime() + days * DAY_MS);
        }
      }
      if (!end || end.getTime() < start.getTime()) end = new Date(start.getTime() + DAY_MS);
      out.push({
        row,
        id: String(row.id ?? idx),
        label: String(getNestedValue(row, titleField) ?? ''),
        status: String(getNestedValue(row, statusField) ?? '').toLowerCase(),
        group: groupField ? String(getNestedValue(row, groupField) ?? '') : '',
        start,
        end,
      });
    });
    return out;
  }, [tasks, titleField, startField, endField, durationField, statusField, groupField]);

  const [axisStart, axisEnd] = useMemo<[Date, Date]>(() => {
    const lo = parseDay(rangeStart) ?? (placed.length
      ? new Date(Math.min(...placed.map((p) => p.start.getTime())) - 2 * DAY_MS)
      : new Date(new Date().setHours(0, 0, 0, 0)));
    const hi = parseDay(rangeEnd) ?? (placed.length
      ? new Date(Math.max(...placed.map((p) => p.end.getTime())) + 2 * DAY_MS)
      : new Date(lo.getTime() + 30 * DAY_MS));
    return hi.getTime() > lo.getTime() ? [lo, hi] : [lo, new Date(lo.getTime() + DAY_MS)];
  }, [rangeStart, rangeEnd, placed]);

  const totalDays = Math.round((axisEnd.getTime() - axisStart.getTime()) / DAY_MS);
  const chartWidth = totalDays * dayWidth;

  const dayOffset = (d: Date): number =>
    ((d.getTime() - axisStart.getTime()) / DAY_MS) * dayWidth;

  const displayItems = useMemo<DisplayItem[]>(() => {
    if (!groupField) return placed.map((task) => ({ kind: 'task' as const, task }));
    const items: DisplayItem[] = [];
    const seen = new Set<string>();
    for (const task of placed) {
      if (!seen.has(task.group)) {
        seen.add(task.group);
        items.push({ kind: 'group', label: task.group || '—' });
      }
      items.push({ kind: 'task', task });
    }
    return items;
  }, [placed, groupField]);

  // Bar geometry per task id, for the dependency-arrow overlay.
  const barGeometry = useMemo(() => {
    const offset = (d: Date): number => ((d.getTime() - axisStart.getTime()) / DAY_MS) * dayWidth;
    const map = new Map<string, { x0: number; x1: number; y: number }>();
    displayItems.forEach((item, idx) => {
      if (item.kind !== 'task') return;
      const x0 = offset(item.task.start);
      const x1 = Math.max(offset(item.task.end), x0 + dayWidth / 2);
      map.set(item.task.id, { x0, x1, y: HEADER_HEIGHT + idx * ROW_HEIGHT + ROW_HEIGHT / 2 });
    });
    return map;
  }, [displayItems, axisStart, dayWidth]);

  const days = useMemo<Date[]>(() => {
    const out: Date[] = [];
    for (let i = 0; i < totalDays; i++) out.push(new Date(axisStart.getTime() + i * DAY_MS));
    return out;
  }, [axisStart, totalDays]);

  const todayOffset = useMemo(() => {
    const today = parseDay(new Date());
    if (!today || today < axisStart || today > axisEnd) return null;
    return ((today.getTime() - axisStart.getTime()) / DAY_MS) * dayWidth;
  }, [axisStart, axisEnd, dayWidth]);

  if (isLoading) {
    return <LoadingState message={t('common.loading')} className={className} />;
  }

  if (error) {
    return (
      <Box className={cn('p-4', className)}>
        <Typography variant="body" color="error">
          {error.message}
        </Typography>
      </Box>
    );
  }

  if (placed.length === 0) {
    return (
      <EmptyState
        title={t('empty.noData')}
        className={className}
      />
    );
  }

  return (
    <Box
      className={cn('w-full overflow-auto rounded-md border border-border bg-card', className)}
    >
      <Box className="relative" style={{ width: LABEL_WIDTH + chartWidth, minWidth: '100%' }}>
        {/* Day header */}
        <HStack gap="none" className="sticky top-0 z-20 bg-card border-b border-border" style={{ height: HEADER_HEIGHT }}>
          <Box className="sticky left-0 z-10 shrink-0 bg-card border-r border-border" style={{ width: LABEL_WIDTH, height: HEADER_HEIGHT }} />
          <Box className="relative" style={{ width: chartWidth, height: HEADER_HEIGHT }}>
            {days.map((day, i) => (
              <Box
                key={i}
                className={cn(
                  'absolute top-0 bottom-0 border-l border-border/50 flex items-end justify-center pb-1',
                  day.getDay() === 0 || day.getDay() === 6 ? 'bg-muted/40' : undefined,
                )}
                style={{ left: i * dayWidth, width: dayWidth }}
              >
                {dayWidth >= 20 && (
                  <Typography variant="caption" color="secondary">
                    {day.getDate()}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </HStack>

        {/* Rows */}
        <VStack gap="none" className="relative">
          {displayItems.map((item, idx) =>
            item.kind === 'group' ? (
              <HStack
                key={`g-${idx}`}
                gap="none"
                className="border-b border-border bg-muted/30"
                style={{ height: ROW_HEIGHT }}
              >
                <Box className="sticky left-0 z-10 shrink-0 bg-muted/30 px-3 flex items-center border-r border-border" style={{ width: LABEL_WIDTH, height: ROW_HEIGHT }}>
                  <Typography variant="caption" weight="semibold">
                    {item.label}
                  </Typography>
                </Box>
                <Box style={{ width: chartWidth, height: ROW_HEIGHT }} />
              </HStack>
            ) : (
              <HStack
                key={item.task.id}
                gap="none"
                className="border-b border-border/50"
                style={{ height: ROW_HEIGHT }}
              >
                <Box className="sticky left-0 z-10 shrink-0 bg-card px-3 flex items-center border-r border-border" style={{ width: LABEL_WIDTH, height: ROW_HEIGHT }}>
                  <Typography variant="small" className="truncate">
                    {item.task.label}
                  </Typography>
                </Box>
                <Box className="relative" style={{ width: chartWidth, height: ROW_HEIGHT }}>
                  <Box
                    className={cn(
                      'absolute top-1/2 -translate-y-1/2 h-4 rounded-sm transition-colors',
                      STATUS_BAR[item.task.status] ?? 'bg-primary/80 hover:bg-primary',
                      barClickEvent ? 'cursor-pointer' : undefined,
                    )}
                    style={{
                      left: dayOffset(item.task.start),
                      width: Math.max(dayOffset(item.task.end) - dayOffset(item.task.start), dayWidth / 2),
                    }}
                    action={barClickEvent}
                    actionPayload={{ id: item.task.id }}
                  />
                </Box>
              </HStack>
            ),
          )}

          {/* Dependency arrows */}
          {links.length > 0 && (
            <svg
              className="absolute pointer-events-none"
              style={{ left: LABEL_WIDTH, top: 0 }}
              width={chartWidth}
              height={HEADER_HEIGHT + displayItems.length * ROW_HEIGHT}
            >
              <defs>
                <marker id="gantt-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 z" fill="var(--muted-foreground, currentColor)" />
                </marker>
              </defs>
              {links.map((link, i) => {
                const from = barGeometry.get(link.from);
                const to = barGeometry.get(link.to);
                if (!from || !to) return null;
                const midX = from.x1 + Math.max(8, (to.x0 - from.x1) / 2);
                return (
                  <path
                    key={i}
                    d={`M ${from.x1} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x0} ${to.y}`}
                    fill="none"
                    stroke="var(--muted-foreground, currentColor)"
                    strokeWidth={1.5}
                    markerEnd="url(#gantt-arrow)"
                  />
                );
              })}
            </svg>
          )}

          {/* Today marker */}
          {showToday && todayOffset !== null && (
            <Box
              className="absolute top-0 bottom-0 w-0.5 bg-error/70 pointer-events-none"
              style={{ left: LABEL_WIDTH + todayOffset }}
            />
          )}
        </VStack>
      </Box>
    </Box>
  );
}

Gantt.displayName = 'Gantt';
