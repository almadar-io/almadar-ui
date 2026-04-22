import React from "react";
import type { EventKey } from "@almadar/core";
import { cn } from "../../lib/cn";
import { X, ChevronDown, type LucideIcon } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  /** Placeholder text */
  placeholder?: string;
  /** Current value */
  value?: string | number;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Declarative event name for trait dispatch */
  action?: EventKey;
  /** Input type - supports 'select' and 'textarea' in addition to standard types */
  inputType?:
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "search"
  | "date"
  | "datetime-local"
  | "time"
  | "checkbox"
  | "select"
  | "textarea";
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Lucide icon component for left side (convenience prop) */
  icon?: LucideIcon;
  /** Show clear button when input has value */
  clearable?: boolean;
  /** Callback when clear button is clicked */
  onClear?: () => void;
  /** Options for select type */
  options?: SelectOption[];
  /** Rows for textarea type */
  rows?: number;
  /** onChange handler - accepts events from input, select, or textarea */
  onChange?: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >;
}

export const Input = React.forwardRef<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  InputProps
>(
  (
    {
      className,
      inputType,
      type: htmlType,
      error,
      leftIcon,
      rightIcon,
      icon: IconComponent,
      clearable,
      onClear,
      value,
      options,
      rows = 3,
      onChange,
      ...props
    },
    ref,
  ) => {
    // inputType takes precedence over type, default to "text"
    const type = inputType || htmlType || "text";
    // Resolve left icon: prefer leftIcon ReactNode, fallback to icon Lucide component
    const resolvedLeftIcon =
      leftIcon || (IconComponent && <IconComponent className="h-4 w-4" />);
    const showClearButton = clearable && value && String(value).length > 0;

    const baseClassName = cn(
      "block w-full rounded-sm transition-all duration-[var(--transition-fast)]",
      "border-[length:var(--border-width-thin)] border-border",
      "px-3 py-2 text-sm",
      "bg-card hover:bg-muted focus:bg-card",
      "text-foreground placeholder:text-muted-foreground",
      "focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted",
      error
        ? "border-error focus:border-error focus:ring-error"
        : "",
      resolvedLeftIcon && "pl-10",
      (rightIcon || showClearButton) && "pr-10",
      className,
    );

    // Handle select type
    if (type === "select") {
      return (
        <div className="relative">
          {resolvedLeftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              {resolvedLeftIcon}
            </div>
          )}
          <select
            ref={ref as React.Ref<HTMLSelectElement>}
            value={value as string}
            onChange={onChange as React.ChangeEventHandler<HTMLSelectElement>}
            className={cn(baseClassName, "appearance-none pr-10", className)}
            {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            <option value="">Select...</option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      );
    }

    // Handle textarea type
    if (type === "textarea") {
      return (
        <div className="relative">
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            value={value as string}
            onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
            rows={rows}
            className={baseClassName}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        </div>
      );
    }

    // Handle checkbox type
    if (type === "checkbox") {
      return (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          type="checkbox"
          checked={props.checked}
          onChange={onChange}
          className={cn(
            "h-4 w-4 rounded-sm",
            "border-border",
            "text-primary focus:ring-ring",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className,
          )}
          {...props}
        />
      );
    }

    // Standard input types
    return (
      <div className="relative">
        {resolvedLeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            {resolvedLeftIcon}
          </div>
        )}
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          type={type}
          value={value}
          onChange={onChange}
          className={baseClassName}
          {...props}
        />
        {showClearButton && (
          <button
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {rightIcon && !showClearButton && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
