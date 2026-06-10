'use client';
/**
 * DateRangePicker Molecule Component
 *
 * Two date inputs plus an optional preset row. Emits `{ from, to }` ISO
 * strings on the event bus whenever the range changes. Falls back to a
 * standard callback for direct consumers.
 *
 * Bus contract: caller passes `event` prop with a string key; the molecule
 * emits `UI:{event}` with `{ from, to }` as the payload — mirrors the
 * FilterGroup / MapView / DataGrid pattern.
 */

import React, { useCallback, useMemo, useState } from 'react';
import type { EventEmit } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { HStack, VStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { useEventBus } from '../../../hooks/useEventBus';

export interface DateRangePickerPreset {
  /** Display label (e.g. "Last 30 days"). */
  label: string;
  /** Stable key used for highlighting the active preset. */
  value: string;
  /** Returns `{ from, to }` as ISO date strings (YYYY-MM-DD). */
  range: () => { from: string; to: string };
}

export interface DateRangePickerProps {
  /** Controlled `from` (ISO date YYYY-MM-DD). */
  from?: string;
  /** Controlled `to` (ISO date YYYY-MM-DD). */
  to?: string;
  /**
   * Event name emitted as `UI:{event}` with payload `{ from, to }`.
   * Optional — when omitted, only the `onChange` callback fires.
   */
  event?: EventEmit<{ from: string; to: string }>;
  /** Callback fired alongside the bus emit. */
  onChange?: (range: { from: string; to: string }) => void;
  /**
   * Preset shortcuts. Defaults to the standard finance set
   * (Last 7d / Last 30d / This Month / This Quarter / YTD).
   * Pass an empty array to hide presets entirely.
   */
  presets?: DateRangePickerPreset[];
  /** From-input label. */
  fromLabel?: string;
  /** To-input label. */
  toLabel?: string;
  /** Additional CSS classes. */
  className?: string;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfQuarter(d: Date): Date {
  return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1);
}

function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const DEFAULT_PRESETS: DateRangePickerPreset[] = [
  {
    label: 'Last 7 days',
    value: '7d',
    range: () => ({ from: toISODate(daysAgo(7)), to: toISODate(new Date()) }),
  },
  {
    label: 'Last 30 days',
    value: '30d',
    range: () => ({ from: toISODate(daysAgo(30)), to: toISODate(new Date()) }),
  },
  {
    label: 'This Month',
    value: 'month',
    range: () => ({ from: toISODate(startOfMonth(new Date())), to: toISODate(new Date()) }),
  },
  {
    label: 'This Quarter',
    value: 'quarter',
    range: () => ({ from: toISODate(startOfQuarter(new Date())), to: toISODate(new Date()) }),
  },
  {
    label: 'YTD',
    value: 'ytd',
    range: () => ({ from: toISODate(startOfYear(new Date())), to: toISODate(new Date()) }),
  },
];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  from: fromProp,
  to: toProp,
  event,
  onChange,
  presets = DEFAULT_PRESETS,
  fromLabel = 'From',
  toLabel = 'To',
  className,
}) => {
  const eventBus = useEventBus();
  const [from, setFrom] = useState(fromProp ?? '');
  const [to, setTo] = useState(toProp ?? '');
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const emit = useCallback(
    (range: { from: string; to: string }) => {
      onChange?.(range);
      if (event) eventBus.emit(`UI:${event}`, range);
    },
    [onChange, event, eventBus],
  );

  const handleFromChange = useCallback(
    (next: string) => {
      setFrom(next);
      setActivePreset(null);
      emit({ from: next, to });
    },
    [to, emit],
  );

  const handleToChange = useCallback(
    (next: string) => {
      setTo(next);
      setActivePreset(null);
      emit({ from, to: next });
    },
    [from, emit],
  );

  const handlePreset = useCallback(
    (preset: DateRangePickerPreset) => {
      const range = preset.range();
      setFrom(range.from);
      setTo(range.to);
      setActivePreset(preset.value);
      emit(range);
    },
    [emit],
  );

  const presetButtons = useMemo(
    () =>
      presets.map((preset) => (
        <Button
          key={preset.value}
          variant={activePreset === preset.value ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => handlePreset(preset)}
        >
          {preset.label}
        </Button>
      )),
    [presets, activePreset, handlePreset],
  );

  return (
    <VStack gap="sm" className={cn(className)}>
      <HStack gap="md" align="end">
        <VStack gap="xs">
          <Typography variant="caption" color="secondary">
            {fromLabel}
          </Typography>
          <Input
            type="date"
            value={from}
            onChange={(e) => handleFromChange(e.target.value)}
          />
        </VStack>
        <VStack gap="xs">
          <Typography variant="caption" color="secondary">
            {toLabel}
          </Typography>
          <Input
            type="date"
            value={to}
            onChange={(e) => handleToChange(e.target.value)}
          />
        </VStack>
      </HStack>
      {presets.length > 0 && (
        <HStack gap="xs" wrap>
          {presetButtons}
        </HStack>
      )}
    </VStack>
  );
};

DateRangePicker.displayName = 'DateRangePicker';
