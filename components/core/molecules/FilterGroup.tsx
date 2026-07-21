'use client';
/**
 * FilterGroup Molecule Component
 *
 * A component for filtering entity data. Composes atoms (Button, Select, Badge, HStack)
 * and follows the design system using CSS variables.
 *
 * Implements the Closed Circuit principle:
 * - FilterGroup updates QuerySingleton filters via query prop
 * - FilterGroup emits UI:FILTER events for trait state machines
 * - entity-list/entity-cards read filtered data via query prop
 *
 * Supports Query Singleton pattern via `query` prop for std/Filter behavior.
 */

import React, { useState, useCallback, useEffect } from "react";
import { cn } from "../../../lib/cn";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { Select } from "../atoms/Select";
import { Badge } from "../atoms/Badge";
import { HStack } from "../atoms/Stack";
import { Icon } from "../atoms/Icon";
import { useEventBus } from "../../../hooks/useEventBus";
import { useQuerySingleton } from "../../../hooks/useQuerySingleton";
import { useTranslate } from "../../../hooks/useTranslate";

/**
 * Layer 2 visual treatment for the filter-group pattern — orthogonal to the
 * semantic `variant` (which conveys layout / role).
 */
export type FilterGroupLook =
  | "toolbar"
  | "chips"
  | "pills"
  | "popover-trigger"
  | "inline-column-header";

/** Filter definition from schema */
export interface FilterDefinition {
  field: string;
  label: string;
  /** Filter type - 'text' free-text input, 'date' renders a date picker, 'date-range'/'daterange' renders two date pickers */
  filterType?:
    | "text"
    | "select"
    | "toggle"
    | "checkbox"
    | "date"
    | "daterange"
    | "date-range";
  /** Alias for filterType (schema compatibility) */
  type?: "text" | "select" | "toggle" | "checkbox" | "date" | "daterange" | "date-range";
  /** Options for select/toggle filters */
  options?: readonly string[];
}

/** Resolve filter type, supporting both filterType and type aliases */
const resolveFilterType = (filter: FilterDefinition) =>
  filter.filterType ?? filter.type;

/**
 * FilterGroup — a panel of filter controls that narrows a collection by field
 * values.
 *
 * @capabilities search refinement panel, facet filters, admin list filters, records filter sidebar, filter chips panel
 */
export interface FilterGroupProps {
  /** Entity name to filter */
  entity: string;
  /** Filter definitions from schema */
  filters: readonly FilterDefinition[];
  /** Callback when a filter changes - for EntityStore integration */
  onFilterChange?: (field: string, value: string | null) => void;
  /** Callback to clear all filters */
  onClearAll?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Variant style */
  variant?: "default" | "compact" | "pills" | "vertical";
  /** Show filter icon */
  showIcon?: boolean;
  /**
   * Query singleton binding for state management.
   * When provided, syncs filter state with the query singleton.
   * Example: "@TaskQuery"
   */
  query?: string;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Layer 2 visual treatment — orthogonal to the semantic variant. */
  look?: FilterGroupLook;
}

// Layer 2 look styles target actual form controls (input / select / button)
// inside the per-filter wrappers — wrappers are layout-only with no visible
// chrome, so rounding them is invisible. These selectors descend to the
// controls and adjust shape / background / padding / labels.
const lookStyles: Record<FilterGroupLook, string> = {
  toolbar: "",
  chips:
    "gap-1 [&_input]:rounded-pill [&_select]:rounded-pill [&_button]:rounded-pill [&_input]:!px-3 [&_select]:!px-3 [&_input]:bg-muted [&_select]:bg-muted [&_label]:hidden",
  pills:
    "gap-2 [&_input]:rounded-pill [&_select]:rounded-pill [&_button]:rounded-pill",
  "popover-trigger": "[&>*:not(:first-child)]:hidden",
  "inline-column-header": "hidden",
};

/**
 * FilterGroup - Renders filter controls for entity data
 * Uses atoms: Button, Select, Badge, HStack
 */
export const FilterGroup: React.FC<FilterGroupProps> = ({
  entity,
  filters,
  onFilterChange,
  onClearAll,
  className,
  variant = "default",
  showIcon = true,
  query,
  isLoading,
  look = "toolbar",
}) => {
  const { t } = useTranslate();
  const eventBus = useEventBus();
  const queryState = useQuerySingleton(query);

  // Track selected values for each filter (local state for UI)
  // Initialize from query singleton if available
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>(
    () => {
      if (queryState?.filters) {
        // Convert query filters to string values for display
        return Object.fromEntries(
          Object.entries(queryState.filters)
            .filter(([_, v]) => v !== null && v !== undefined)
            .map(([k, v]) => [k, String(v)]),
        );
      }
      return {};
    },
  );

  // Sync with query singleton changes
  useEffect(() => {
    if (queryState?.filters) {
      const newValues = Object.fromEntries(
        Object.entries(queryState.filters)
          .filter(([_, v]) => v !== null && v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      );
      setSelectedValues(newValues);
    }
  }, [queryState?.filters]);

  const handleFilterSelect = useCallback(
    (field: string, value: string | null) => {
      setSelectedValues((prev) => {
        if (value === null || value === "" || value === "all") {
          const next = { ...prev };
          delete next[field];
          return next;
        }
        return { ...prev, [field]: value };
      });

      // Update query singleton if connected
      if (queryState) {
        queryState.setFilter(field, value === "all" ? null : value);
      }

      // Call callback if provided (for backward compat)
      onFilterChange?.(field, value === "all" ? null : value);

      // Emit UI:FILTER event for closed circuit. 'all' is encoded as empty
      // string so the bus payload matches std-filter's `value : string!`
      // contract; std-browse REFETCH_FILTER short-circuits on '' to mean
      // 'no filter applied'.
      eventBus.emit("UI:FILTER", {
        entity,
        field,
        value: value === "all" || value === null ? "" : value,
        query,
      });
    },
    [onFilterChange, queryState, eventBus, entity, query],
  );

  const handleClearAll = useCallback(() => {
    setSelectedValues({});

    // Update query singleton if connected
    if (queryState) {
      queryState.clearFilters();
    }

    // Call callback if provided (for backward compat)
    onClearAll?.();

    // Emit UI:CLEAR_FILTERS event for closed circuit
    eventBus.emit("UI:CLEAR_FILTERS", { entity, query });
  }, [onClearAll, queryState, eventBus, entity, query]);

  const activeFilterCount = Object.keys(selectedValues).length;

  // Pills variant - horizontal toggle buttons
  if (variant === "pills") {
    return (
      <HStack
        gap="md"
        align="center"
        className={cn("flex-wrap", lookStyles[look], className)}
      >
        {showIcon && (
          <Icon name="filter" className="h-4 w-4 text-muted-foreground" />
        )}
        {filters.map((filter) => (
          <HStack key={filter.field} gap="xs" align="center">
            <span className="text-sm font-medium text-muted-foreground">
              {filter.label}:
            </span>
            <HStack
              gap="none"
              className="rounded-sm overflow-hidden border-[length:var(--border-width)] border-border"
            >
              <button
                type="button"
                onClick={() => handleFilterSelect(filter.field, null)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-all duration-fast",
                  !selectedValues[filter.field]
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                {t('filterGroup.all')}
              </button>
              {filter.options?.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleFilterSelect(filter.field, option)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium transition-all duration-fast",
                    "border-l-[length:var(--border-width)] border-border",
                    selectedValues[filter.field] === option
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-muted",
                  )}
                >
                  {option}
                </button>
              ))}
            </HStack>
          </HStack>
        ))}

        {/* Clear all button */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            leftIcon="x"
          >
            {t('filterGroup.clear')}
          </Button>
        )}
      </HStack>
    );
  }

  // Vertical variant - stacked filters for sidebars
  if (variant === "vertical") {
    return (
      <div className={cn("flex flex-col gap-4", lookStyles[look], className)}>
        {showIcon && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon name="filter" className="h-4 w-4" />
            <span className="text-sm font-bold uppercase tracking-wide">
              {t('filterGroup.filters')}
            </span>
          </div>
        )}
        {filters.map((filter) => (
          <div key={filter.field} className="flex flex-col gap-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              {filter.label}
            </label>
            {resolveFilterType(filter) === "date" ? (
              <Input
                type="date"
                value={selectedValues[filter.field] || ""}
                onChange={(e) =>
                  handleFilterSelect(filter.field, e.target.value || null)
                }
                clearable
                onClear={() => handleFilterSelect(filter.field, null)}
              />
            ) : resolveFilterType(filter) === "daterange" ||
              resolveFilterType(filter) === "date-range" ? (
              <div className="flex flex-col gap-2">
                <Input
                  type="date"
                  value={selectedValues[`${filter.field}_from`] || ""}
                  onChange={(e) =>
                    handleFilterSelect(
                      `${filter.field}_from`,
                      e.target.value || null,
                    )
                  }
                  placeholder={t('filterGroup.from')}
                  clearable
                  onClear={() =>
                    handleFilterSelect(`${filter.field}_from`, null)
                  }
                />
                <Input
                  type="date"
                  value={selectedValues[`${filter.field}_to`] || ""}
                  onChange={(e) =>
                    handleFilterSelect(
                      `${filter.field}_to`,
                      e.target.value || null,
                    )
                  }
                  placeholder={t('filterGroup.to')}
                  clearable
                  onClear={() => handleFilterSelect(`${filter.field}_to`, null)}
                />
              </div>
            ) : resolveFilterType(filter) === "text" ? (
              <Input
                value={selectedValues[filter.field] || ""}
                onChange={(e) =>
                  handleFilterSelect(filter.field, e.target.value || null)
                }
                placeholder={filter.label}
                clearable
                onClear={() => handleFilterSelect(filter.field, null)}
              />
            ) : (
              <Select
                value={selectedValues[filter.field] || "all"}
                onValueChange={(v) =>
                  handleFilterSelect(filter.field, v as string)
                }
                options={[
                  { value: "all", label: t('filterGroup.all') },
                  ...(filter.options?.map((opt) => ({
                    value: opt,
                    label: opt,
                  })) || []),
                ]}
              />
            )}
          </div>
        ))}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            leftIcon="x"
            className="self-start"
          >
            {t('filterGroup.clearAll')}
          </Button>
        )}
      </div>
    );
  }

  // Compact variant - smaller selects inline
  if (variant === "compact") {
    return (
      <HStack
        gap="sm"
        align="center"
        className={cn("flex-wrap", lookStyles[look], className)}
      >
        {showIcon && (
          <Icon name="filter" className="h-4 w-4 text-muted-foreground" />
        )}
        {filters.map((filter) => (
          <div key={filter.field} className="min-w-[120px]">
            {resolveFilterType(filter) === "date" ? (
              <Input
                type="date"
                value={selectedValues[filter.field] || ""}
                onChange={(e) =>
                  handleFilterSelect(filter.field, e.target.value || null)
                }
                clearable
                onClear={() => handleFilterSelect(filter.field, null)}
                className="text-sm"
              />
            ) : resolveFilterType(filter) === "daterange" ||
              resolveFilterType(filter) === "date-range" ? (
              <HStack gap="xs" align="center">
                <Input
                  type="date"
                  value={selectedValues[`${filter.field}_from`] || ""}
                  onChange={(e) =>
                    handleFilterSelect(
                      `${filter.field}_from`,
                      e.target.value || null,
                    )
                  }
                  className="text-sm min-w-[100px]"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={selectedValues[`${filter.field}_to`] || ""}
                  onChange={(e) =>
                    handleFilterSelect(
                      `${filter.field}_to`,
                      e.target.value || null,
                    )
                  }
                  className="text-sm min-w-[100px]"
                />
              </HStack>
            ) : resolveFilterType(filter) === "text" ? (
              <Input
                value={selectedValues[filter.field] || ""}
                onChange={(e) =>
                  handleFilterSelect(filter.field, e.target.value || null)
                }
                placeholder={filter.label}
                clearable
                onClear={() => handleFilterSelect(filter.field, null)}
                className="text-sm"
              />
            ) : (
              <Select
                value={selectedValues[filter.field] || "all"}
                onValueChange={(v) =>
                  handleFilterSelect(filter.field, v as string)
                }
                options={[
                  { value: "all", label: t('filterGroup.allOf', { label: filter.label }) },
                  ...(filter.options?.map((opt) => ({
                    value: opt,
                    label: opt,
                  })) || []),
                ]}
                className="text-sm"
              />
            )}
          </div>
        ))}

        {/* Active filter badges */}
        {activeFilterCount > 0 && (
          <>
            {Object.entries(selectedValues).map(([field, value]) => {
              const filterDef = filters.find((f) => f.field === field);
              return (
                <Badge
                  key={field}
                  variant="primary"
                  size="md"
                  className="cursor-pointer"
                  onClick={() => handleFilterSelect(field, null)}
                >
                  {filterDef?.label}: {value}
                  <Icon name="x" className="ml-1 h-3 w-3" />
                </Badge>
              );
            })}
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              {t('filterGroup.clearAll')}
            </Button>
          </>
        )}
      </HStack>
    );
  }

  // Default variant - labeled selects with clear visual hierarchy
  return (
    <div
      className={cn(
        "p-4 rounded-container",
        "bg-card",
        "border-[length:var(--border-width)] border-border",
        lookStyles[look],
        className,
      )}
    >
      <HStack gap="md" align="center" className="flex-wrap">
        {showIcon && (
          <HStack
            gap="xs"
            align="center"
            className="text-muted-foreground"
          >
            <Icon name="filter" className="h-4 w-4" />
            <span className="text-sm font-bold uppercase tracking-wide">
              {t('filterGroup.filters')}
            </span>
          </HStack>
        )}

        {/* Filter selects and date inputs */}
        {filters.map((filter) => (
          <div key={filter.field} className="flex flex-col gap-1">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              {filter.label}
            </label>
            {resolveFilterType(filter) === "date" ? (
              <Input
                type="date"
                value={selectedValues[filter.field] || ""}
                onChange={(e) =>
                  handleFilterSelect(filter.field, e.target.value || null)
                }
                clearable
                onClear={() => handleFilterSelect(filter.field, null)}
                className="min-w-[160px]"
              />
            ) : resolveFilterType(filter) === "daterange" ||
              resolveFilterType(filter) === "date-range" ? (
              <HStack gap="xs" align="center">
                <Input
                  type="date"
                  value={selectedValues[`${filter.field}_from`] || ""}
                  onChange={(e) =>
                    handleFilterSelect(
                      `${filter.field}_from`,
                      e.target.value || null,
                    )
                  }
                  placeholder={t('filterGroup.from')}
                  clearable
                  onClear={() =>
                    handleFilterSelect(`${filter.field}_from`, null)
                  }
                  className="min-w-[130px]"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={selectedValues[`${filter.field}_to`] || ""}
                  onChange={(e) =>
                    handleFilterSelect(
                      `${filter.field}_to`,
                      e.target.value || null,
                    )
                  }
                  placeholder={t('filterGroup.to')}
                  clearable
                  onClear={() => handleFilterSelect(`${filter.field}_to`, null)}
                  className="min-w-[130px]"
                />
              </HStack>
            ) : resolveFilterType(filter) === "text" ? (
              <Input
                value={selectedValues[filter.field] || ""}
                onChange={(e) =>
                  handleFilterSelect(filter.field, e.target.value || null)
                }
                placeholder={filter.label}
                clearable
                onClear={() => handleFilterSelect(filter.field, null)}
                className="min-w-[160px]"
              />
            ) : (
              <Select
                value={selectedValues[filter.field] || "all"}
                onValueChange={(v) =>
                  handleFilterSelect(filter.field, v as string)
                }
                options={[
                  { value: "all", label: t('filterGroup.all') },
                  ...(filter.options?.map((opt) => ({
                    value: opt,
                    label: opt,
                  })) || []),
                ]}
                className="min-w-[140px]"
              />
            )}
          </div>
        ))}

        {/* Active filter count and clear */}
        {activeFilterCount > 0 && (
          <HStack gap="sm" align="center" className="ml-auto">
            <Badge variant="primary" size="md">
              {t('filterGroup.activeCount', { count: activeFilterCount })}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              leftIcon="x"
            >
              {t('filterGroup.clearAll')}
            </Button>
          </HStack>
        )}
      </HStack>
    </div>
  );
};

FilterGroup.displayName = "FilterGroup";
