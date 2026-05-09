'use client';

import React, { useCallback } from "react";
import { cn } from "../../lib/cn";

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

const radioSizes: Record<LikertScaleSize, { control: string; dot: string; label: string; gap: string }> = {
  sm: { control: "w-4 h-4", dot: "w-2 h-2", label: "text-xs", gap: "gap-1.5" },
  md: { control: "w-5 h-5", dot: "w-2.5 h-2.5", label: "text-sm", gap: "gap-2" },
  lg: { control: "w-6 h-6", dot: "w-3 h-3", label: "text-base", gap: "gap-2.5" },
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
      disabled = false,
      size = "md",
      variant = "radios",
      className,
    },
    ref,
  ) => {
    const groupId = React.useId();

    const handleSelect = useCallback(
      (next: number | string) => {
        if (disabled) return;
        onChange?.(next);
      },
      [disabled, onChange],
    );

    return (
      <div
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
          <div
            className={cn(
              "mb-3 font-medium text-foreground",
              questionSizes[size],
            )}
          >
            {question}
          </div>
        )}

        {variant === "buttons" ? (
          <div
            className={cn(
              "inline-flex w-full items-stretch rounded-sm overflow-hidden",
              "border-[length:var(--border-width)] border-border",
              "bg-surface",
            )}
          >
            {options.map((opt, idx) => {
              const selected = value !== null && value !== undefined && value === opt.value;
              return (
                <button
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
                    idx > 0 && "border-l-[length:var(--border-width)] border-border",
                    buttonSizes[size],
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-foreground hover:bg-muted",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div
            className={cn(
              "flex w-full items-start justify-between",
              radioSizes[size].gap,
            )}
          >
            {options.map((opt) => {
              const selected = value !== null && value !== undefined && value === opt.value;
              const inputId = `${groupId}-${String(opt.value)}`;
              return (
                <div
                  key={String(opt.value)}
                  className={cn(
                    "flex flex-1 flex-col items-center",
                    radioSizes[size].gap,
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <input
                      type="radio"
                      id={inputId}
                      name={groupId}
                      checked={selected}
                      disabled={disabled}
                      onChange={() => handleSelect(opt.value)}
                      className="sr-only peer"
                    />
                    <label
                      htmlFor={inputId}
                      className={cn(
                        "flex items-center justify-center rounded-full",
                        "border-[length:var(--border-width)] transition-colors duration-100",
                        "peer-focus:outline-none peer-focus:ring-[length:var(--focus-ring-width)] peer-focus:ring-ring peer-focus:ring-offset-2",
                        radioSizes[size].control,
                        selected
                          ? "border-primary bg-primary"
                          : "border-border bg-surface",
                        disabled
                          ? "cursor-not-allowed"
                          : "cursor-pointer hover:border-[var(--color-border-hover)]",
                      )}
                    >
                      {selected && (
                        <div
                          className={cn(
                            "rounded-full bg-primary-foreground",
                            radioSizes[size].dot,
                          )}
                        />
                      )}
                    </label>
                  </div>
                  <label
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
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

LikertScale.displayName = "LikertScale";
