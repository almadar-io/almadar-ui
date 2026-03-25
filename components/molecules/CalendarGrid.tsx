'use client';
/**
 * CalendarGrid
 *
 * Pure presentational weekly calendar grid molecule.
 * No entity binding, no event bus, no translations.
 * Composes DayCell and TimeSlotCell atoms into a 7-day grid.
 */
import React, { useMemo, useCallback, useRef } from "react";
import { cn } from "../../lib/cn";
import { Box } from "../atoms/Box";
import { VStack } from "../atoms/Stack";
import { Typography } from "../atoms/Typography";
import { Badge } from "../atoms/Badge";
import { DayCell } from "../atoms/DayCell";
import { TimeSlotCell } from "../atoms/TimeSlotCell";
import { useEventBus } from "../../hooks/useEventBus";
import { useSwipeGesture } from "../../hooks/useSwipeGesture";

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string | Date;
  endTime?: string | Date;
  color?: string;
}

export interface CalendarGridProps {
  /** Start of the week (defaults to current week's Monday) */
  weekStart?: Date;
  /** Time slot labels (defaults to 09:00-17:00) */
  timeSlots?: string[];
  /** Events to display on the grid */
  events?: CalendarEvent[];
  /** Called when a time slot is clicked */
  onSlotClick?: (day: Date, time: string) => void;
  /** Called when a day header is clicked */
  onDayClick?: (day: Date) => void;
  /** Called when an event is clicked */
  onEventClick?: (event: CalendarEvent) => void;
  /** Additional CSS classes */
  className?: string;
  /** Event emitted on long-press of a time slot: UI:{longPressEvent} with { date, time } */
  longPressEvent?: string;
  /** Additional payload for long-press events */
  longPressPayload?: Record<string, unknown>;
  /** Event emitted on swipe left (next week): UI:{swipeLeftEvent} */
  swipeLeftEvent?: string;
  /** Event emitted on swipe right (prev week): UI:{swipeRightEvent} */
  swipeRightEvent?: string;
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
}: CalendarGridProps): React.JSX.Element {
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
      events.filter(
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
      className={cn("overflow-x-auto", className)}
      {...(swipeLeftEvent || swipeRightEvent ? {
        onPointerDown: swipe.onPointerDown,
        onPointerMove: swipe.onPointerMove,
        onPointerUp: swipe.onPointerUp,
        onPointerCancel: swipe.onPointerCancel,
      } : {})}
    >
      <Box className="min-w-[800px]">
        {/* Day Headers */}
        <Box className="grid grid-cols-8 border-b border-border">
          {/* Empty top-left corner for time column */}
          <Box className="p-2" />
          {weekDays.map((day) => {
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
              className="grid grid-cols-8 border-b border-border"
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
              {weekDays.map((day) => {
                const slotEvents = events.filter((ev) =>
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
