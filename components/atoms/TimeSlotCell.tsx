'use client';
/**
 * TimeSlotCell
 *
 * Calendar time slot atom. Renders a clickable container for a single
 * time slot that can hold event content via children.
 */
import React, { useCallback } from "react";
import { cn } from "../../lib/cn";
import { Box } from "./Box";

export interface TimeSlotCellProps {
  /** Time label for this slot (e.g. "09:00") */
  time: string;
  /** Called when the slot is clicked */
  onClick?: (time: string) => void;
  /** Additional CSS classes */
  className?: string;
  /** Event content placed inside the slot */
  children?: React.ReactNode;
  /** Whether this slot contains an event */
  isOccupied?: boolean;
}

export function TimeSlotCell({
  time,
  onClick,
  className,
  children,
  isOccupied = false,
}: TimeSlotCellProps): React.JSX.Element {
  const handleClick = useCallback(() => {
    onClick?.(time);
  }, [onClick, time]);

  return (
    <Box
      className={cn(
        "p-1 min-h-[60px] cursor-pointer hover:bg-[var(--color-muted)] transition-colors",
        isOccupied && "bg-[var(--color-muted)]/30",
        className,
      )}
      onClick={handleClick}
    >
      {children}
    </Box>
  );
}

TimeSlotCell.displayName = "TimeSlotCell";
