'use client';
/**
 * DayCell
 *
 * Calendar day header atom. Renders day abbreviation and date number
 * with optional today highlight.
 */
import React, { useCallback } from "react";
import { cn } from "../../lib/cn";
import { Box } from "./Box";
import { Typography } from "./Typography";

export interface DayCellProps {
  /** The date this cell represents. Optional at the dynamic render edge: an
   *  unbound `@config.date` arrives as `undefined`, so the cell falls back to today. */
  date?: Date;
  /** Whether this date is today */
  isToday?: boolean;
  /** Called when the day is clicked */
  onClick?: (date: Date) => void;
  /** Additional CSS classes */
  className?: string;
}

const DAY_ABBREVIATIONS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function DayCell({
  date,
  isToday = false,
  onClick,
  className,
}: DayCellProps): React.JSX.Element {
  const safeDate =
    date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  const handleClick = useCallback(() => {
    onClick?.(safeDate);
  }, [onClick, safeDate]);

  const dayAbbr = DAY_ABBREVIATIONS[safeDate.getDay()];

  return (
    <Box
      className={cn(
        "p-2 text-center cursor-pointer hover:bg-muted transition-colors",
        isToday && "bg-blue-500/10",
        className,
      )}
      onClick={handleClick}
    >
      <Typography
        variant="small"
        className={cn(
          "font-medium",
          isToday
            ? "text-blue-600"
            : "text-muted-foreground",
        )}
      >
        {dayAbbr}
      </Typography>
      <Box
        display="flex"
        rounded="full"
        className={cn(
          "h-8 w-8 mx-auto items-center justify-center",
          isToday && "bg-blue-600 text-white",
        )}
      >
        <Typography variant="body" className="font-semibold">
          {safeDate.getDate()}
        </Typography>
      </Box>
    </Box>
  );
}

DayCell.displayName = "DayCell";
