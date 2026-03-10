'use client';

import React, { useCallback, useEffect, useRef } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "../../lib/cn";
import { useEventBus } from "../../hooks/useEventBus";

function useSafeEventBus() {
  try {
    return useEventBus();
  } catch {
    return { emit: () => {}, on: () => () => {}, once: () => {} };
  }
}

export type NumberStepperSize = "sm" | "md" | "lg";

export interface NumberStepperProps {
  /** Current value */
  value?: number;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Size variant */
  size?: NumberStepperSize;
  /** Disabled state */
  disabled?: boolean;
  /** Direct onChange callback */
  onChange?: (value: number) => void;
  /** Declarative event name for value changes */
  action?: string;
  /** Payload to include with the action event */
  actionPayload?: Record<string, unknown>;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label */
  label?: string;
}

const sizeStyles: Record<NumberStepperSize, { button: string; text: string; icon: string }> = {
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

const LONG_PRESS_DELAY = 400;
const LONG_PRESS_INTERVAL = 100;

export const NumberStepper: React.FC<NumberStepperProps> = ({
  value = 0,
  min,
  max,
  step = 1,
  size = "md",
  disabled = false,
  onChange,
  action,
  actionPayload,
  className,
  label,
}) => {
  const eventBus = useSafeEventBus();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAtMin = min !== undefined && value <= min;
  const isAtMax = max !== undefined && value >= max;

  const styles = sizeStyles[size];

  const emitChange = useCallback(
    (newValue: number) => {
      const clamped = Math.round(newValue / step) * step;
      const finalValue = Math.max(min ?? -Infinity, Math.min(max ?? Infinity, clamped));
      onChange?.(finalValue);
      if (action) {
        eventBus.emit(`UI:${action}`, { ...actionPayload, value: finalValue });
      }
    },
    [onChange, action, actionPayload, eventBus, min, max, step],
  );

  const startLongPress = useCallback(
    (delta: number) => {
      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          emitChange(value + delta);
        }, LONG_PRESS_INTERVAL);
      }, LONG_PRESS_DELAY);
    },
    [emitChange, value],
  );

  const stopLongPress = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLongPress();
    };
  }, [stopLongPress]);

  const handleDecrement = () => {
    if (!isAtMin) emitChange(value - step);
  };

  const handleIncrement = () => {
    if (!isAtMax) emitChange(value + step);
  };

  return (
    <div
      className={cn(
        "inline-flex items-center",
        "rounded-[var(--radius-sm)]",
        "border-[length:var(--border-width)] border-[var(--color-border)]",
        "bg-[var(--color-surface)]",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      role="group"
      aria-label={label ?? "Number stepper"}
    >
      {/* Decrement button */}
      <button
        type="button"
        onClick={handleDecrement}
        onMouseDown={() => !isAtMin && startLongPress(-step)}
        onMouseUp={stopLongPress}
        onMouseLeave={stopLongPress}
        onTouchStart={() => !isAtMin && startLongPress(-step)}
        onTouchEnd={stopLongPress}
        disabled={disabled || isAtMin}
        className={cn(
          "inline-flex items-center justify-center",
          "rounded-l-[var(--radius-sm)]",
          "text-[var(--color-foreground)]",
          "hover:bg-[var(--color-muted)]",
          "active:bg-[var(--color-muted)]",
          "transition-colors duration-100",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent",
          "focus:outline-none focus:ring-[length:var(--focus-ring-width)] focus:ring-[var(--color-ring)] focus:ring-inset",
          styles.button,
        )}
        aria-label="Decrease"
      >
        <Minus className={styles.icon} />
      </button>

      {/* Value display */}
      <span
        className={cn(
          "text-center font-medium tabular-nums",
          "text-[var(--color-foreground)]",
          "border-x-[length:var(--border-width)] border-[var(--color-border)]",
          "px-1 select-none",
          styles.text,
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        {value}
      </span>

      {/* Increment button */}
      <button
        type="button"
        onClick={handleIncrement}
        onMouseDown={() => !isAtMax && startLongPress(step)}
        onMouseUp={stopLongPress}
        onMouseLeave={stopLongPress}
        onTouchStart={() => !isAtMax && startLongPress(step)}
        onTouchEnd={stopLongPress}
        disabled={disabled || isAtMax}
        className={cn(
          "inline-flex items-center justify-center",
          "rounded-r-[var(--radius-sm)]",
          "text-[var(--color-foreground)]",
          "hover:bg-[var(--color-muted)]",
          "active:bg-[var(--color-muted)]",
          "transition-colors duration-100",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent",
          "focus:outline-none focus:ring-[length:var(--focus-ring-width)] focus:ring-[var(--color-ring)] focus:ring-inset",
          styles.button,
        )}
        aria-label="Increase"
      >
        <Plus className={styles.icon} />
      </button>
    </div>
  );
};

NumberStepper.displayName = "NumberStepper";
