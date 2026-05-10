'use client';

import React, { useCallback } from "react";
import type { EventEmit } from "@almadar/core";
import { cn } from "../../lib/cn";
import { useEventBus } from "../../hooks/useEventBus";
import { Box } from "../atoms/Box";
import { Button } from "../atoms/Button";
import { Label } from "../atoms/Label";
import { Radio } from "../atoms/Radio";

export type LikertScaleSize = "sm" | "md" | "lg";
export type LikertScaleVariant = "radios" | "buttons";

export interface LikertOption {
  /** Underlying value bound to the option */
  value: number | string;
  /** Visible label below (radios) or inside (buttons) the control */
  label: string;
}

export interface LikertScaleProps {
  /** Optional row prompt above the scale */
  question?: string;
  /** Scale points (defaults to a 5-point agree/disagree set) */
  options?: LikertOption[];
  /** Selected value (controlled) */
  value?: number | string | null;
  /** Change callback */
  onChange?: (value: number | string) => void;
  /** Event name dispatched via event bus on change. Payload: { value: number | string } */
  changeEvent?: EventEmit<{ value: number | string }>;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: LikertScaleSize;
  /** Visual variant: classic radios or pill segmented buttons */
  variant?: LikertScaleVariant;
  /** Additional CSS classes */
  className?: string;
}

export const DEFAULT_LIKERT_OPTIONS: LikertOption[] = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

const radioSizes: Record<LikertScaleSize, { label: string; gap: string }> = {
  sm: { label: "text-xs", gap: "gap-1.5" },
  md: { label: "text-sm", gap: "gap-2" },
  lg: { label: "text-base", gap: "gap-2.5" },
};

const buttonSizes: Record<LikertScaleSize, string> = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
  lg: "px-4 py-2 text-base",
};

const questionSizes: Record<LikertScaleSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export const LikertScale = React.forwardRef<HTMLDivElement, LikertScaleProps>(
  (
    {
      question,
      options = DEFAULT_LIKERT_OPTIONS,
      value = null,
      onChange,
      changeEvent,
      disabled = false,
      size = "md",
      variant = "radios",
      className,
    },
    ref,
  ) => {
    const groupId = React.useId();
    const eventBus = useEventBus();

    const handleSelect = useCallback(
      (next: number | string) => {
        if (disabled) return;
        onChange?.(next);
        if (changeEvent) {
          eventBus.emit(`UI:${changeEvent}`, { value: next });
        }
      },
      [disabled, onChange, changeEvent, eventBus],
    );

    return (
      <Box
        ref={ref}
        className={cn(
          "w-full",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
        role="radiogroup"
        aria-label={question ?? "Likert scale"}
      >
        {question && (
          <Box
            className={cn(
              "mb-3 font-medium text-foreground",
              questionSizes[size],
            )}
          >
            {question}
          </Box>
        )}

        {variant === "buttons" ? (
          <Box
            className={cn(
              "inline-flex w-full items-stretch rounded-sm overflow-hidden",
              "border-[length:var(--border-width)] border-border",
              "bg-surface",
            )}
          >
            {options.map((opt, idx) => {
              const selected = value !== null && value !== undefined && value === opt.value;
              return (
                <Button
                  key={String(opt.value)}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={disabled}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    "flex-1 text-center font-medium transition-colors duration-100",
                    "focus:outline-none focus:ring-[length:var(--focus-ring-width)] focus:ring-ring focus:ring-inset",
                    "disabled:cursor-not-allowed",
                    "rounded-none gap-0 shadow-none border-none",
                    idx > 0 && "border-l-[length:var(--border-width)] border-border",
                    buttonSizes[size],
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-foreground hover:bg-muted",
                  )}
                >
                  {opt.label}
                </Button>
              );
            })}
          </Box>
        ) : (
          <Box
            className={cn(
              "flex w-full items-start justify-between",
              radioSizes[size].gap,
            )}
          >
            {options.map((opt) => {
              const selected = value !== null && value !== undefined && value === opt.value;
              const inputId = `${groupId}-${String(opt.value)}`;
              return (
                <Box
                  key={String(opt.value)}
                  className={cn(
                    "flex flex-1 flex-col items-center",
                    radioSizes[size].gap,
                  )}
                >
                  <Radio
                    id={inputId}
                    name={groupId}
                    size={size}
                    checked={selected}
                    disabled={disabled}
                    onChange={() => handleSelect(opt.value)}
                  />
                  <Label
                    htmlFor={inputId}
                    className={cn(
                      "text-center select-none",
                      radioSizes[size].label,
                      selected
                        ? "text-foreground font-medium"
                        : "text-muted-foreground",
                      disabled ? "cursor-not-allowed" : "cursor-pointer",
                    )}
                  >
                    {opt.label}
                  </Label>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
);

LikertScale.displayName = "LikertScale";
