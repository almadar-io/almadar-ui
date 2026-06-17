'use client';
import React from 'react';
import type { TraitConfigValue, TraitConfigObject } from '@almadar/core';
import { VStack } from '../atoms/Stack';
import { Select } from '../atoms/Select';
import { Typography } from '../atoms/Typography';
import { JsonTreeEditor } from './JsonTreeEditor';
import { getKnownPatterns } from '../../../renderer/pattern-resolver';
import { cn } from '../../../lib/cn';

const isObj = (v: TraitConfigValue | undefined): v is TraitConfigObject =>
  v !== null && v !== undefined && typeof v === 'object' && !Array.isArray(v);

/** A node slot holds a render-ui pattern config — `[{ type, …props }]`, a bare
 *  `{ type, …props }`, or nothing. Pull out the pattern type + the rest of its props. */
function normalize(value: TraitConfigValue | undefined): { type: string; props: TraitConfigObject; wasArray: boolean } {
  const wasArray = Array.isArray(value);
  const pattern = wasArray ? (value as ReadonlyArray<TraitConfigValue>)[0] : value;
  const type = isObj(pattern) && typeof pattern['type'] === 'string' ? (pattern['type'] as string) : '';
  const props: Record<string, TraitConfigValue> = {};
  if (isObj(pattern)) for (const [k, v] of Object.entries(pattern)) if (k !== 'type') props[k] = v;
  return { type, props, wasArray };
}

export interface NodeSlotEditorProps {
  /** Current node-slot value (a render-ui pattern config, or nothing). */
  value: TraitConfigValue | undefined;
  /** Fired with the next value. */
  onChange: (next: TraitConfigValue) => void;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * NodeSlotEditor — edits a `node` config slot (e.g. `children`/`hud`/`debugPanel`).
 * A node slot renders a nested render-ui pattern, so this picks the pattern TYPE
 * from the known-pattern registry and edits that pattern's props as a tree — instead
 * of the read-only "edit in source" fallback. Self-contained `@almadar/ui` atoms.
 */
export const NodeSlotEditor: React.FC<NodeSlotEditorProps> = ({ value, onChange, className }) => {
  const { type, props, wasArray } = normalize(value);
  const patterns = React.useMemo<string[]>(() => {
    try { return [...getKnownPatterns()].sort(); } catch { return []; }
  }, []);
  const options = React.useMemo(
    () => [{ value: '', label: '— none —' }, ...patterns.map((p) => ({ value: p, label: p }))],
    [patterns],
  );

  const emit = (nextType: string, nextProps: TraitConfigObject): void => {
    if (!nextType) { onChange(wasArray ? [] : {}); return; }
    const pattern: TraitConfigObject = { type: nextType, ...nextProps };
    // Match the slot's existing shape: node slots seed as a single-element array.
    onChange(wasArray || value === undefined ? [pattern] : pattern);
  };

  return (
    <VStack gap="xs" className={cn('w-full', className)}>
      <Select
        options={options}
        value={type}
        onChange={(e) => emit(e.target.value, props)}
      />
      {type !== '' && (
        <VStack gap="none" className="pl-1">
          <Typography variant="caption" color="muted">props</Typography>
          <JsonTreeEditor value={props} onChange={(next) => emit(type, isObj(next) ? next : {})} />
        </VStack>
      )}
    </VStack>
  );
};
