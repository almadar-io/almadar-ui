'use client';

import React, { useCallback } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { EventEmit } from "@almadar/core";
import { cn } from "../../lib/cn";
import { useEventBus } from "../../hooks/useEventBus";

export type VoteStackSize = "sm" | "md" | "lg";
export type VoteStackVariant = "vertical" | "horizontal";
/**
 * Current vote state. Both `null` (typical "cleared" sentinel for direct
 * consumers) and the string `"none"` (the .lolo enum spelling — `direction:
 * "up" | "down" | "none"`) are accepted; the component treats them
 * identically. Keeping both accommodates render-ui bindings without forcing
 * std atoms to drop their string sentinel.
 */
export type VoteValue = "up" | "down" | "none" | null;

export interface VoteStackProps {
  /** Current tally */
  count: number;
  /** Current user's vote (null = no vote cast) */
  userVote?: VoteValue;
  /** Toggle handler. Clicking the same arrow clears (emits null). */
  onVote?: (next: VoteValue) => void;
  /** Event name dispatched on the bus when a vote is cast. Payload: { next: VoteValue }. */
  voteEvent?: EventEmit<{ next: VoteValue }>;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: VoteStackSize;
  /** Layout orientation. `vertical` = forum/Q&A column; `horizontal` = compact row. */
  variant?: VoteStackVariant;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label for the group */
  label?: string;
}

const sizeStyles: Record<VoteStackSize, { button: string; text: string; icon: string }> = {
  sm: {
    button: "w-7 h-7",
    text: "text-sm min-w-[2rem]",
    icon: "w-3 h-3",
  },
  md: {
    button: "w-9 h-9",
    text: "text-base min-w-[2.5rem]",
    icon: "w-4 h-4",
  },
  lg: {
    button: "w-11 h-11",
    text: "text-lg min-w-[3rem]",
    icon: "w-5 h-5",
  },
};

export const VoteStack: React.FC<VoteStackProps> = ({
  count,
  userVote = null,
  onVote,
  voteEvent,
  disabled = false,
  size = "md",
  variant = "vertical",
  className,
  label,
}) => {
  const styles = sizeStyles[size];
  const isUp = userVote === "up";
  const isDown = userVote === "down";
  const eventBus = useEventBus();

  const handleUp = useCallback(() => {
    const next: VoteValue = isUp ? null : "up";
    onVote?.(next);
    if (voteEvent) {
      eventBus.emit(`UI:${voteEvent}`, { next });
    }
  }, [isUp, onVote, voteEvent, eventBus]);

  const handleDown = useCallback(() => {
    const next: VoteValue = isDown ? null : "down";
    onVote?.(next);
    if (voteEvent) {
      eventBus.emit(`UI:${voteEvent}`, { next });
    }
  }, [isDown, onVote, voteEvent, eventBus]);

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center",
        variant === "vertical" ? "flex-col" : "flex-row",
        "rounded-sm",
        "border-[length:var(--border-width)] border-border",
        "bg-surface",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      role="group"
      aria-label={label ?? "Vote"}
    >
      <button
        type="button"
        onClick={handleUp}
        disabled={disabled}
        aria-label="Upvote"
        aria-pressed={isUp}
        className={cn(
          "inline-flex items-center justify-center",
          variant === "vertical" ? "rounded-t-sm" : "rounded-l-sm",
          isUp ? "text-primary" : "text-muted-foreground",
          "hover:bg-muted",
          "active:bg-muted",
          "transition-colors duration-100",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent",
          "focus:outline-none focus:ring-[length:var(--focus-ring-width)] focus:ring-ring focus:ring-inset",
          styles.button,
        )}
      >
        <ChevronUp className={styles.icon} />
      </button>

      <span
        className={cn(
          "text-center font-bold tabular-nums select-none",
          "text-foreground",
          variant === "vertical"
            ? "border-y-[length:var(--border-width)] border-border w-full"
            : "border-x-[length:var(--border-width)] border-border h-full",
          "px-1 py-0.5",
          styles.text,
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        {count}
      </span>

      <button
        type="button"
        onClick={handleDown}
        disabled={disabled}
        aria-label="Downvote"
        aria-pressed={isDown}
        className={cn(
          "inline-flex items-center justify-center",
          variant === "vertical" ? "rounded-b-sm" : "rounded-r-sm",
          isDown ? "text-primary" : "text-muted-foreground",
          "hover:bg-muted",
          "active:bg-muted",
          "transition-colors duration-100",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent",
          "focus:outline-none focus:ring-[length:var(--focus-ring-width)] focus:ring-ring focus:ring-inset",
          styles.button,
        )}
      >
        <ChevronDown className={styles.icon} />
      </button>
    </div>
  );
};

VoteStack.displayName = "VoteStack";
