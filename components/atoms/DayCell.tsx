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
  /** The date this cell represents */
  date: Date;
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
  const handleClick = useCallback(() => {
    onClick?.(date);
  }, [onClick, date]);

  const dayAbbr = DAY_ABBREVIATIONS[date.getDay()];

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
          {date.getDate()}
        </Typography>
      </Box>
    </Box>
  );
}

DayCell.displayName = "DayCell";
