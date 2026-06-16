import React from "react";
import type { EventKey } from "@almadar/core";
import { cn } from "../../../lib/cn";
import { Icon } from "./Icon";
import { useEventBus } from "../../../hooks/useEventBus";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "children" | "onChange"
> {
  /** Additional CSS classes applied to the root element. */
  className?: string;
  /** Select options */
  options: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Current value */
  value?: string;
  /** Declarative event name for trait dispatch */
  action?: EventKey;
  /** Error message */
  error?: string;
  /** onChange handler or declarative event key for trait dispatch */
  onChange?: React.ChangeEventHandler<HTMLSelectElement> | EventKey;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, error, onChange, ...props }, ref) => {
    const eventBus = useEventBus();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (typeof onChange === 'string') {
        eventBus.emit(`UI:${onChange}`, { value: e.target.value });
      } else {
        onChange?.(e);
      }
    };

    return (
      <div className="relative">
        <select
          ref={ref}
          onChange={handleChange}
          className={cn(
            "block w-full border-[length:var(--border-width)] shadow-sm appearance-none",
            "px-3 py-2 pr-10 text-sm text-foreground font-medium",
            "bg-card",
            "focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-ring",
            "disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed",
            error
              ? "border-error focus:border-error"
              : "border-border focus:border-primary",
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Icon name="chevron-down" className="h-icon-default w-icon-default text-foreground" />
        </div>
      </div>
    );
  },
);

Select.displayName = "Select";
