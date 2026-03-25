import React from "react";
import { cn } from "../../lib/cn";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> {
  /** Select options */
  options: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Current value */
  value?: string;
  /** Declarative event name for trait dispatch */
  action?: string;
  /** Error message */
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, error, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
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
          <ChevronDown className="h-4 w-4 text-foreground" />
        </div>
      </div>
    );
  },
);

Select.displayName = "Select";
