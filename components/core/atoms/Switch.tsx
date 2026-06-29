'use client';
import * as React from "react";
import { cn } from "../../../lib/cn";

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
  name?: string;
  className?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      defaultChecked = false,
      onChange,
      disabled = false,
      label,
      id,
      name,
      className,
    },
    ref,
  ) => {
    const [isChecked, setIsChecked] = React.useState(
      checked !== undefined ? checked : defaultChecked,
    );

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked);
      }
    }, [checked]);

    const handleClick = () => {
      if (disabled) return;
      const newValue = !isChecked;
      if (checked === undefined) {
        setIsChecked(newValue);
      }
      onChange?.(newValue);
    };

    return (
      <div className={cn("inline-flex items-center gap-2", className)}>
        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={isChecked}
          aria-label={label}
          id={id}
          name={name}
          disabled={disabled}
          onClick={handleClick}
          className={cn(
            // Fixed rem sizes instead of spacing tokens: themes like atelier
            // redefine --space-11 to 68px, which makes w-11 enormous and leaves
            // the thumb stuck near the left edge. The switch geometry must stay
            // proportional regardless of a theme's density scale.
            "relative inline-flex h-[1.5rem] w-[2.75rem] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            isChecked ? "bg-primary" : "bg-muted",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <span
            className={cn(
              "pointer-events-none block h-[1.25rem] w-[1.25rem] rounded-full bg-background shadow-lg ring-0 transition-transform",
              isChecked ? "translate-x-[1.25rem]" : "translate-x-0",
            )}
          />
        </button>
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "text-sm font-medium leading-none cursor-pointer",
              disabled && "cursor-not-allowed opacity-70",
            )}
            onClick={handleClick}
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);

Switch.displayName = "Switch";
