import React from "react";
import type { EventKey } from "@almadar/core";
import { cn } from "../../../lib/cn";
import { Icon, resolveIcon, type IconInput } from "./Icon";
import { useTranslate } from "../../../hooks/useTranslate";
import { useEventBus } from "../../../hooks/useEventBus";

export interface SelectOption {
  value: string;
  label: string;
}

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  /** Additional CSS classes applied to the root element. */
  className?: string;
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
  leftIcon?: IconInput;
  rightIcon?: IconInput;
  /** Lucide icon component or canonical kebab-case icon name string for left side */
  icon?: IconInput;
  /** Show clear button when input has value */
  clearable?: boolean;
  /** Callback or declarative event key when clear button is clicked */
  onClear?: (() => void) | EventKey;
  /** Options for select type */
  options?: SelectOption[];
  /** Rows for textarea type */
  rows?: number;
  /** onChange handler or declarative event key for trait dispatch */
  onChange?: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  > | EventKey;
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
      icon: iconProp,
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
    const { t } = useTranslate();
    const eventBus = useEventBus();
    // inputType takes precedence over type, default to "text"
    const type = inputType || htmlType || "text";
    const resolveIconNode = (i: IconInput | undefined, cls: string) => {
      if (!i) return null;
      if (typeof i === "string") return <Icon name={i} className={cls} />;
      const C = i;
      return <C className={cls} />;
    };
    const iconCls = "h-icon-default w-icon-default";
    const IconComponent =
      typeof iconProp === "string" ? resolveIcon(iconProp) : iconProp;
    const resolvedLeftIcon =
      (leftIcon ? resolveIconNode(leftIcon, iconCls) : null) ||
      (IconComponent && <IconComponent className={iconCls} />);
    const showClearButton = clearable && value && String(value).length > 0;

    const isMultiline = type === "textarea";
    const baseClassName = cn(
      "block w-full rounded-sm transition-all duration-[var(--transition-fast)]",
      "border-[length:var(--border-width-thin)] border-border",
      isMultiline ? "px-3 py-2 text-sm" : "h-input-md px-3 text-sm",
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      if (typeof onChange === 'string') {
        const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        const payload = type === 'checkbox'
          ? { checked: (target as HTMLInputElement).checked }
          : { value: target.value };
        eventBus.emit(`UI:${onChange}`, payload);
      } else {
        onChange?.(e);
      }
    };

    const handleClear = () => {
      if (typeof onClear === 'string') {
        eventBus.emit(`UI:${onClear}`, {});
      } else {
        onClear?.();
      }
    };

    // Handle select type
    if (type === "select") {
      return (
        <div className="relative w-full">
          {resolvedLeftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              {resolvedLeftIcon}
            </div>
          )}
          <select
            ref={ref as React.Ref<HTMLSelectElement>}
            value={value as string}
            onChange={handleChange as React.ChangeEventHandler<HTMLSelectElement>}
            className={cn(baseClassName, "appearance-none pr-10", className)}
            {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            <option value="">{t('form.selectPlaceholder', { label: '' })}</option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground">
            <Icon name="chevron-down" className="h-icon-default w-icon-default" />
          </div>
        </div>
      );
    }

    // Handle textarea type
    if (type === "textarea") {
      return (
        <div className="relative w-full">
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            value={value as string}
            onChange={handleChange as React.ChangeEventHandler<HTMLTextAreaElement>}
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
          onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>}
          className={cn(
            "h-icon-default w-icon-default rounded-sm",
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
      <div className="relative w-full">
        {resolvedLeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            {resolvedLeftIcon}
          </div>
        )}
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          type={type}
          value={value}
          onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>}
          className={baseClassName}
          {...props}
        />
        {showClearButton && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
          >
            <Icon name="x" className="h-icon-default w-icon-default" />
          </button>
        )}
        {rightIcon && !showClearButton && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground">
            {resolveIconNode(rightIcon, iconCls)}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";