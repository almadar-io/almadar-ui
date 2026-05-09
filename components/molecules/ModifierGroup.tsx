/**
 * ModifierGroup Molecule Component
 *
 * Restaurant POS item-customization selector with required/optional/multi
 * constraints. Renders radio inputs for `single` constraint and checkboxes for
 * `multi`. Reports validation errors inline when the current selection
 * violates the constraint.
 *
 * **Atomic Design**: Composed using Typography atom and native form controls.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { Typography } from '../atoms/Typography';

export interface ModifierOption {
  id: string;
  label: string;
  priceDelta?: number;
  disabled?: boolean;
  outOfStock?: boolean;
}

export type ModifierConstraint =
  | { type: 'single'; required?: boolean }
  | { type: 'multi'; min?: number; max?: number };

export interface ModifierGroupProps {
  groupId: string;
  title: string;
  description?: string;
  options: ModifierOption[];
  constraint: ModifierConstraint;
  selected?: string[];
  onChange?: (selected: string[]) => void;
  size?: 'sm' | 'md';
  className?: string;
}

const formatPriceDelta = (delta: number): string => {
  const sign = delta >= 0 ? '+' : '-';
  return `${sign}$${Math.abs(delta).toFixed(2)}`;
};

const constraintHint = (constraint: ModifierConstraint): string => {
  if (constraint.type === 'single') {
    return constraint.required ? 'Required, pick 1' : 'Optional, pick up to 1';
  }
  const { min, max } = constraint;
  if (min && max) {
    return min === max ? `Pick exactly ${min}` : `Pick ${min}-${max}`;
  }
  if (min) return `Pick at least ${min}`;
  if (max) return `Pick up to ${max}`;
  return 'Optional';
};

const validateSelection = (
  selected: string[],
  constraint: ModifierConstraint,
): string | undefined => {
  if (constraint.type === 'single') {
    if (constraint.required && selected.length === 0) {
      return 'Pick 1 option';
    }
    if (selected.length > 1) {
      return 'Pick only 1 option';
    }
    return undefined;
  }
  const { min, max } = constraint;
  if (min !== undefined && selected.length < min) {
    const remaining = min - selected.length;
    return `Pick at least ${remaining} more`;
  }
  if (max !== undefined && selected.length > max) {
    const excess = selected.length - max;
    return `Remove ${excess} option${excess === 1 ? '' : 's'}`;
  }
  return undefined;
};

export const ModifierGroup: React.FC<ModifierGroupProps> = ({
  groupId,
  title,
  description,
  options,
  constraint,
  selected = [],
  onChange,
  size = 'md',
  className,
}) => {
  const hint = constraintHint(constraint);
  const error = validateSelection(selected, constraint);
  const inputName = `modifier-${groupId}`;
  const labelTextSize = size === 'sm' ? 'text-sm' : 'text-base';
  const optionGap = size === 'sm' ? 'gap-2' : 'gap-2.5';

  const toggle = (optionId: string, checked: boolean): void => {
    if (!onChange) return;
    if (constraint.type === 'single') {
      onChange(checked ? [optionId] : []);
      return;
    }
    if (checked) {
      if (selected.includes(optionId)) return;
      onChange([...selected, optionId]);
    } else {
      onChange(selected.filter((id) => id !== optionId));
    }
  };

  return (
    <fieldset
      className={cn('space-y-2', className)}
      aria-describedby={`${groupId}-hint`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <Typography as="legend" variant="label" weight="semibold">
          {title}
        </Typography>
        <Typography
          id={`${groupId}-hint`}
          variant="caption"
          color={constraint.type === 'single' && constraint.required ? 'error' : 'muted'}
        >
          {hint}
        </Typography>
      </div>

      {description && (
        <Typography variant="caption" color="muted">
          {description}
        </Typography>
      )}

      <div className={cn('flex flex-col', optionGap)}>
        {options.map((option) => {
          const isChecked = selected.includes(option.id);
          const isDisabled = option.disabled || option.outOfStock;
          const optionId = `${inputName}-${option.id}`;
          return (
            <label
              key={option.id}
              htmlFor={optionId}
              className={cn(
                'flex items-center gap-2.5 cursor-pointer select-none',
                isDisabled && 'cursor-not-allowed opacity-60',
              )}
            >
              <input
                id={optionId}
                type={constraint.type === 'single' ? 'radio' : 'checkbox'}
                name={inputName}
                value={option.id}
                checked={isChecked}
                disabled={isDisabled}
                onChange={(e) => toggle(option.id, e.target.checked)}
                className="h-4 w-4 accent-primary"
                aria-invalid={!!error}
              />
              <span
                className={cn(
                  'flex-1',
                  labelTextSize,
                  'text-foreground',
                  option.outOfStock && 'line-through',
                )}
              >
                {option.label}
              </span>
              {option.priceDelta !== undefined && option.priceDelta !== 0 && (
                <Typography variant="caption" color="muted">
                  {formatPriceDelta(option.priceDelta)}
                </Typography>
              )}
              {option.outOfStock && (
                <Typography
                  variant="caption"
                  color="warning"
                  className="rounded border border-warning/40 px-1.5 py-0.5"
                >
                  Out of stock
                </Typography>
              )}
            </label>
          );
        })}
      </div>

      {error && (
        <Typography variant="caption" color="error" role="alert">
          {error}
        </Typography>
      )}
    </fieldset>
  );
};

ModifierGroup.displayName = 'ModifierGroup';
