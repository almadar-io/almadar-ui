'use client';
/**
 * CalendarGrid
 *
 * Pure presentational weekly calendar grid molecule.
 * No entity binding, no event bus, no translations.
 * Composes DayCell and TimeSlotCell atoms into a 7-day grid.
 */
import React, { useMemo, useCallback, useEffect, useRef, useState } from "react";
import type { EventEmit, EventPayload, EntityCollection } from "@almadar/core";
import { cn } from "../../lib/cn";
import { Box } from "../atoms/Box";
import { Button } from "../atoms/Button";
import { HStack, VStack } from "../atoms/Stack";
import { Typography } from "../atoms/Typography";
import { Badge } from "../atoms/Badge";
import { DayCell } from "../atoms/DayCell";
import { TimeSlotCell } from "../atoms/TimeSlotCell";
import { useEventBus } from "../../hooks/useEventBus";
import { useSwipeGesture } from "../../hooks/useSwipeGesture";

// Data-transfer shape crossing the event bus — declared as a `type` alias (not
// `interface`) so it carries an implicit index signature and is assignable to
// the bus's `EventPayloadValue` payload (a named interface never is).
export type CalendarEvent = {
  id: string;
  title: string;
  startTime: string | Date;
  endTime?: string | Date;
  color?: string;
};

/**
 * Number of day columns rendered at once. Matches the responsiveness-
 * audit tiers exactly: 1 day on mobile (≤640), 3 on tablet (641–1024),
 * 7 on laptop+ (≥1025).
 */
export type CalendarDayWindow = 1 | 3 | 7;

export interface CalendarGridProps {
  /** Start of the week (defaults to current week's Monday) */
  weekStart?: Date;
  /** Time slot labels (defaults to 09:00-17:00) */
  timeSlots?: string[];
  /** Events to display on the grid */
  events?: EntityCollection<CalendarEvent>;
  /** Called when a time slot is clicked */
  onSlotClick?: (day: Date, time: string) => void;
  /** Called when a day header is clicked */
  onDayClick?: (day: Date) => void;
  /** Called when an event is clicked */
  onEventClick?: (event: CalendarEvent) => void;
  /** Additional CSS classes */
  className?: string;
  /** Event emitted on long-press of a time slot: UI:{longPressEvent} with { date, time, ...longPressPayload } */
  longPressEvent?: EventEmit<{ date: string; time?: string }>;
  /** Additional payload for long-press events */
  longPressPayload?: EventPayload;
  /** Event emitted on swipe left (next week): UI:{swipeLeftEvent} */
  swipeLeftEvent?: EventEmit<Record<string, never>>;
  /** Event emitted on swipe right (prev week): UI:{swipeRightEvent} */
  swipeRightEvent?: EventEmit<Record<string, never>>;
  /**
   * Override the viewport-driven day window. `'auto'` (default) tracks
   * `window.innerWidth` — 1 day on mobile, 3 on tablet, 7 on laptop+.
   * Pass an explicit number to force a fixed window (useful for print
   * layouts or screenshot tests).
   */
  dayWindow?: CalendarDayWindow | 'auto';
}

/**
 * Map a viewport width to a `CalendarDayWindow`. Edges match the
 * responsiveness-audit breakpoints (640 / 1024).
 */
function dayWindowForViewport(width: number): CalendarDayWindow {
  if (width <= 640) return 1;
  if (width <= 1024) return 3;
  return 7;
}

/**
 * React hook that returns the currently-applicable day window. Tracks
 * window resize until the consumer passes an explicit `dayWindow` prop
 * (in which case the hook is skipped and the prop value is used
 * verbatim).
 */
function useDayWindow(override: CalendarDayWindow | 'auto'): CalendarDayWindow {
  const [w, setW] = useState<CalendarDayWindow>(() => {
    if (override !== 'auto') return override;
    if (typeof window === 'undefined') return 7;
    return dayWindowForViewport(window.innerWidth);
  });
  useEffect(() => {
    if (override !== 'auto') {
      setW(override);
      return undefined;
    }
    if (typeof window === 'undefined') return undefined;
    const onResize = () => setW(dayWindowForViewport(window.innerWidth));
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [override]);
  return w;
}

const SHORT_DATE: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
function formatDateRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString(undefined, SHORT_DATE);
  const endStr = end.toLocaleDateString(undefined, SHORT_DATE);
  return start.toDateString() === end.toDateString() ? startStr : `${startStr} – ${endStr}`;
}

/** Get the Monday of the week containing the given date */
function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Get an array of 7 consecutive days starting from the given date */
function getWeekDays(start: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  return days;
}

/** Generate hourly time slot labels from 09:00 to 17:00 */
function generateDefaultTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 9; hour <= 17; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return slots;
}

/** Check whether an event falls within a specific day and time slot */
function eventInSlot(
  event: CalendarEvent,
  day: Date,
  slotTime: string,
): boolean {
  const eventStart = new Date(event.startTime);
  const [slotHour, slotMinute] = slotTime.split(":").map(Number);

  return (
    eventStart.toDateString() === day.toDateString() &&
    eventStart.getHours() === slotHour &&
    eventStart.getMinutes() === slotMinute
  );
}

export function CalendarGrid({
  weekStart,
  timeSlots,
  events = [],
  onSlotClick,
  onDayClick,
  onEventClick,
  className,
  longPressEvent,
  longPressPayload,
  swipeLeftEvent,
  swipeRightEvent,
  dayWindow = 'auto',
}: CalendarGridProps): React.JSX.Element {
  const evs = Array.isArray(events) ? events : events ? [events] : [];
  const eventBus = useEventBus();
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolvedWeekStart = useMemo(
    () => (weekStart ? getStartOfWeek(weekStart) : getStartOfWeek(new Date())),
    [weekStart],
  );

  const weekDays = useMemo(
    () => getWeekDays(resolvedWeekStart),
    [resolvedWeekStart],
  );

  const resolvedTimeSlots = useMemo(
    () => timeSlots ?? generateDefaultTimeSlots(),
    [timeSlots],
  );

  // Viewport-driven number of day columns shown at once. Mobile shows 1
  // day with a pager, tablet 3, laptop+ the full 7-day week.
  const visibleCount = useDayWindow(dayWindow);
  const [dayOffset, setDayOffset] = useState(0);

  // Clamp `dayOffset` when the visibleCount grows past the available
  // remaining days (e.g. user resized from mobile @offset=5 → laptop;
  // offset=5 + 7 = 12 > 7 so snap back to 0 so the whole week fits).
  useEffect(() => {
    if (dayOffset + visibleCount > 7) {
      setDayOffset(Math.max(0, 7 - visibleCount));
    }
  }, [visibleCount, dayOffset]);

  const visibleDays = useMemo(
    () => weekDays.slice(dayOffset, dayOffset + visibleCount),
    [weekDays, dayOffset, visibleCount],
  );

  const canPrev = dayOffset > 0;
  const canNext = dayOffset + visibleCount < 7;
  const stepPrev = useCallback(() => {
    setDayOffset((d) => Math.max(0, d - visibleCount));
  }, [visibleCount]);
  const stepNext = useCallback(() => {
    setDayOffset((d) => Math.min(7 - visibleCount, d + visibleCount));
  }, [visibleCount]);

  // The grid has `visibleCount + 1` columns (one time-label column +
  // one column per visible day). Tailwind needs the class as a literal
  // string so its JIT can see it.
  const gridColsClass =
    visibleCount === 1 ? 'grid-cols-2'
    : visibleCount === 3 ? 'grid-cols-4'
    : 'grid-cols-8';

  const handleSlotClick = useCallback(
    (day: Date, time: string) => {
      onSlotClick?.(day, time);
    },
    [onSlotClick],
  );

  const handleEventClick = useCallback(
    (event: CalendarEvent, e: React.MouseEvent) => {
      e.stopPropagation();
      onEventClick?.(event);
    },
    [onEventClick],
  );

  const eventsForDayCount = useCallback(
    (day: Date): number =>
      evs.filter(
        (ev) => new Date(ev.startTime).toDateString() === day.toDateString(),
      ).length,
    [events],
  );

  const swipeCallbacks = useMemo(() => ({
    onSwipeLeft: swipeLeftEvent ? () => eventBus.emit(`UI:${swipeLeftEvent}`, {}) : undefined,
    onSwipeRight: swipeRightEvent ? () => eventBus.emit(`UI:${swipeRightEvent}`, {}) : undefined,
  }), [swipeLeftEvent, swipeRightEvent, eventBus]);

  const swipe = useSwipeGesture(swipeCallbacks);

  const clearLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const startLongPress = useCallback((day: Date, time: string) => {
    if (!longPressEvent) return;
    longPressTimer.current = setTimeout(() => {
      eventBus.emit(`UI:${longPressEvent}`, { date: day.toISOString(), time, ...longPressPayload });
    }, 500);
  }, [longPressEvent, longPressPayload, eventBus]);

  const renderEvent = (event: CalendarEvent) => (
    <Box
      key={event.id}
      rounded="md"
      padding="xs"
      border
      className={cn(
        "cursor-pointer hover:shadow-sm transition-shadow text-xs truncate",
        event.color
          ? event.color
          : "bg-blue-500/15 border-blue-500/30 text-blue-600",
      )}
      onClick={(e: React.MouseEvent) => handleEventClick(event, e)}
    >
      <Typography variant="small" className="truncate font-medium">
        {event.title}
      </Typography>
    </Box>
  );

  return (
    <Box
      className={className}
      {...(swipeLeftEvent || swipeRightEvent ? {
        onPointerDown: swipe.onPointerDown,
        onPointerMove: swipe.onPointerMove,
        onPointerUp: swipe.onPointerUp,
        onPointerCancel: swipe.onPointerCancel,
      } : {})}
    >
      {/* Day-pager nav. Hidden when the full week fits (laptop+), shown
          on mobile + tablet so users can scan all 7 days without the
          grid ever needing a horizontal scrollbar. */}
      {visibleCount < 7 && (
        <HStack align="center" justify="between" className="mb-2 px-2">
          <Button
            variant="ghost"
            size="sm"
            icon="chevron-left"
            onClick={stepPrev}
            aria-disabled={!canPrev || undefined}
            aria-label="Previous days"
          >
            Prev
          </Button>
          <Typography variant="small" className="text-muted-foreground">
            {formatDateRange(visibleDays[0], visibleDays[visibleDays.length - 1])}
          </Typography>
          <Button
            variant="ghost"
            size="sm"
            iconRight="chevron-right"
            onClick={stepNext}
            aria-disabled={!canNext || undefined}
            aria-label="Next days"
          >
            Next
          </Button>
        </HStack>
      )}

      <Box>
        {/* Day Headers */}
        <Box className={cn('grid border-b border-border', gridColsClass)}>
          {/* Empty top-left corner for time column */}
          <Box className="p-2" />
          {visibleDays.map((day) => {
            const isToday = day.toDateString() === new Date().toDateString();
            const count = eventsForDayCount(day);

            return (
              <Box
                key={day.toISOString()}
                className="border-l border-border"
              >
                <DayCell
                  date={day}
                  isToday={isToday}
                  onClick={onDayClick}
                />
                {count > 0 && (
                  <Box className="text-center pb-1">
                    <Badge variant="default" size="sm">
                      {count}
                    </Badge>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Time Slots */}
        <Box className="max-h-[500px] overflow-y-auto">
          {resolvedTimeSlots.map((time) => (
            <Box
              key={time}
              className={cn('grid border-b border-border', gridColsClass)}
            >
              {/* Time label */}
              <Box className="p-2 text-right pr-3">
                <Typography
                  variant="small"
                  className="text-muted-foreground"
                >
                  {time}
                </Typography>
              </Box>

              {/* Day cells */}
              {visibleDays.map((day) => {
                const slotEvents = evs.filter((ev) =>
                  eventInSlot(ev, day, time),
                );
                const isToday =
                  day.toDateString() === new Date().toDateString();

                return (
                  <TimeSlotCell
                    key={`${day.toISOString()}-${time}`}
                    time={time}
                    isOccupied={slotEvents.length > 0}
                    onClick={() => handleSlotClick(day, time)}
                    className={cn(
                      "border-l border-border",
                      isToday && "bg-blue-50/30",
                    )}
                    {...(longPressEvent ? {
                      onPointerDown: () => startLongPress(day, time),
                      onPointerUp: clearLongPress,
                      onPointerCancel: clearLongPress,
                    } : {})}
                  >
                    <VStack gap="xs">
                      {slotEvents.map(renderEvent)}
                    </VStack>
                  </TimeSlotCell>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

CalendarGrid.displayName = "CalendarGrid";
