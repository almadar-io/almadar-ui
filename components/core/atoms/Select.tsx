import React, { useState, useRef, useEffect } from "react";
import type { EventKey, EventEmit } from "@almadar/core";
import { cn } from "../../../lib/cn";
import { Icon } from "./Icon";
import { useEventBus } from "../../../hooks/useEventBus";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Leading content rendered in rich mode only (native mode ignores this). */
  icon?: React.ReactNode;
  /** Secondary line of text rendered below label in rich mode only. */
  secondaryLabel?: string;
  /** dir attribute applied to the option row in rich mode only. */
  dir?: string;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

export interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "children" | "onChange" | "multiple"
> {
  /** Additional CSS classes applied to the root element. */
  className?: string;
  /** Select options (flat list) */
  options?: SelectOption[];
  /** Grouped options — rendered as <optgroup> in native mode, sections in rich mode. */
  groups?: SelectOptionGroup[];
  /** Placeholder text */
  placeholder?: string;
  /** Current value (string for single, string[] for multiple) */
  value?: string | string[];
  /** Declarative event name for trait dispatch */
  action?: EventKey;
  /** Error message */
  error?: string;
  /** Allow selecting multiple values — activates the rich dropdown. */
  multiple?: boolean;
  /** Show a search input inside the dropdown — activates the rich dropdown. */
  searchable?: boolean;
  /** Show a clear button when a value is selected. */
  clearable?: boolean;
  /** onChange handler (native ChangeEvent) or declarative event key for trait dispatch */
  onChange?: React.ChangeEventHandler<HTMLSelectElement> | EventKey;
  /** Value-based change: a React callback (internal use) OR a declarative event
   *  key that emits `{ value }` on the bus (render-ui / lolo authoring). Mirrors
   *  the `onChange` handler|event convention so it's an event-emitting prop, not a
   *  bare callback. */
  onValueChange?: ((value: string | string[]) => void) | EventEmit<{ value: string | string[] }>;
}

/** Dispatch an `onValueChange` value: emit on the bus when it's a declarative
 *  event key (string), otherwise invoke the React callback. Mirrors the inline
 *  `onChange` handling so both prop forms work. */
function dispatchValueChange(
  onValueChange: SelectProps["onValueChange"],
  eventBus: ReturnType<typeof useEventBus>,
  value: string | string[],
): void {
  if (typeof onValueChange === "string") {
    eventBus.emit(`UI:${onValueChange}`, { value });
  } else {
    onValueChange?.(value);
  }
}

// Flat list of all options across flat + grouped sources
function flatOptions(opts?: SelectOption[], groups?: SelectOptionGroup[]): SelectOption[] {
  const flat = opts ?? [];
  const grp = (groups ?? []).flatMap((g) => g.options);
  return [...flat, ...grp];
}

// Native <select> path: used when multiple/searchable/clearable are all false
function NativeSelect({
  className,
  options,
  groups,
  placeholder,
  error,
  onChange,
  onValueChange,
  value,
  ...props
}: Omit<SelectProps, "multiple" | "searchable" | "clearable">) {
  const eventBus = useEventBus();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (typeof onChange === "string") {
      eventBus.emit(`UI:${onChange}`, { value: e.target.value });
    } else {
      onChange?.(e);
    }
    dispatchValueChange(onValueChange, eventBus, e.target.value);
  };

  return (
    <div className="relative">
      <select
        onChange={handleChange}
        value={value as string | undefined}
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
        {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options?.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
        {groups?.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <Icon name="chevron-down" className="h-icon-default w-icon-default text-foreground" />
      </div>
    </div>
  );
}

// Rich dropdown path: used when multiple/searchable/clearable is set
function RichSelect({
  className,
  options,
  groups,
  placeholder,
  error,
  onChange,
  onValueChange,
  value,
  multiple,
  searchable,
  clearable,
  disabled,
}: SelectProps) {
  const eventBus = useEventBus();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selected: string[] = multiple
    ? Array.isArray(value) ? value : value ? [value] : []
    : value ? [value as string] : [];

  const all = flatOptions(options, groups);

  const filtered = searchable && search
    ? all.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : all;

  const toggle = (optValue: string) => {
    let next: string | string[];
    if (multiple) {
      next = selected.includes(optValue)
        ? selected.filter((v) => v !== optValue)
        : [...selected, optValue];
    } else {
      next = optValue;
      setOpen(false);
    }
    if (typeof onChange === "string") {
      eventBus.emit(`UI:${onChange}`, { value: next });
    }
    dispatchValueChange(onValueChange, eventBus, next);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = multiple ? [] : "";
    if (typeof onChange === "string") {
      eventBus.emit(`UI:${onChange}`, { value: next });
    }
    dispatchValueChange(onValueChange, eventBus, next);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayLabel = selected.length === 0
    ? (placeholder ?? "")
    : multiple
      ? `${selected.length} selected`
      : (all.find((o) => o.value === selected[0])?.label ?? selected[0]);

  const hasValue = selected.length > 0;

  const renderOptions = (opts: SelectOption[]) =>
    opts.map((opt) => (
      <button
        key={opt.value}
        type="button"
        dir={opt.dir}
        disabled={opt.disabled}
        onClick={() => !opt.disabled && toggle(opt.value)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-1.5 text-sm text-start",
          "hover:bg-muted transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          selected.includes(opt.value) && "text-primary font-medium",
        )}
      >
        <span className="flex items-center gap-2 min-w-0">
          {opt.icon != null && (
            <span className="shrink-0 flex items-center">{opt.icon}</span>
          )}
          <span className="flex flex-col min-w-0">
            <span>{opt.label}</span>
            {opt.secondaryLabel != null && (
              <span className="text-xs text-muted-foreground font-normal">{opt.secondaryLabel}</span>
            )}
          </span>
        </span>
        {selected.includes(opt.value) && (
          <Icon name="check" className="h-icon-default w-icon-default shrink-0" />
        )}
      </button>
    ));

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "block w-full border-[length:var(--border-width)] shadow-sm",
          "px-3 py-2 pr-10 text-sm text-start font-medium",
          "bg-card rounded-sm",
          "focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-ring",
          "disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed",
          error ? "border-error focus:border-error" : "border-border focus:border-primary",
          !hasValue && "text-muted-foreground",
        )}
      >
        {displayLabel}
      </button>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1 pointer-events-none">
        {clearable && hasValue && (
          <button
            type="button"
            onClick={clear}
            className="pointer-events-auto text-muted-foreground hover:text-foreground"
          >
            <Icon name="x" className="h-icon-default w-icon-default" />
          </button>
        )}
        <Icon name="chevron-down" className="h-icon-default w-icon-default text-foreground" />
      </div>
      {open && (
        <div className={cn(
          "absolute z-50 mt-1 w-full",
          "bg-card border-[length:var(--border-width)] border-border",
          "rounded-sm shadow-elevation-popover py-1 max-h-60 overflow-y-auto",
        )}>
          {searchable && (
            <div className="px-2 pb-1 border-b border-border">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className={cn(
                  "w-full px-2 py-1 text-sm bg-transparent",
                  "focus:outline-none text-foreground placeholder:text-muted-foreground",
                )}
              />
            </div>
          )}
          {groups && groups.length > 0
            ? groups.map((g) => {
                const groupFiltered = searchable && search
                  ? g.options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
                  : g.options;
                if (groupFiltered.length === 0) return null;
                return (
                  <div key={g.label}>
                    <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {g.label}
                    </div>
                    {renderOptions(groupFiltered)}
                  </div>
                );
              })
            : renderOptions(filtered)}
        </div>
      )}
    </div>
  );
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (props, _ref) => {
    const { multiple, searchable, clearable } = props;
    if (multiple || searchable || clearable) {
      return <RichSelect {...props} />;
    }
    return <NativeSelect {...props} />;
  },
);

Select.displayName = "Select";
