import React from "react";
import type { EventKey } from "@almadar/core";
import { cn } from "../../../lib/cn";
import { useEventBus } from "../../../hooks/useEventBus";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange"
> {
  /** Additional CSS classes applied to the root element. */
  className?: string;
  /** Whether the checkbox is checked */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  label?: string;
  /** onChange handler or declarative event key for trait dispatch */
  onChange?: React.ChangeEventHandler<HTMLInputElement> | EventKey;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, onChange, ...props }, ref) => {
    const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    const eventBus = useEventBus();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (typeof onChange === 'string') {
        eventBus.emit(`UI:${onChange}`, { checked: e.target.checked });
      } else {
        onChange?.(e);
      }
    };

    return (
      <div className="flex items-center">
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            onChange={handleChange}
            className={cn(
              "peer h-4 w-4 border-[length:var(--border-width)] border-border",
              "accent-primary focus:ring-ring focus:ring-offset-0",
              "bg-card checked:bg-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              className,
            )}
            {...props}
          />
        </div>
        {label && (
          <label
            htmlFor={inputId}
            className="ml-2 text-sm text-foreground font-medium cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
