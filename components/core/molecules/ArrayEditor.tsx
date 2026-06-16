'use client';
import React from 'react';
import type { TraitConfigValue, TraitConfigObject } from '@almadar/core';
import { VStack, HStack } from '../atoms/Stack';
import { Button } from '../atoms/Button';
import { Switch } from '../atoms/Switch';
import { Input } from '../atoms/Input';
import { cn } from '../../../lib/cn';

export interface ArrayEditorProps {
  /** Current array value. */
  value: ReadonlyArray<TraitConfigValue>;
  /** Fired when the array changes. */
  onChange: (next: ReadonlyArray<TraitConfigValue>) => void;
  /** Additional CSS classes. */
  className?: string;
}

function isTraitConfigObject(v: TraitConfigValue): v is TraitConfigObject {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/** Render a single scalar/leaf element inline (no recursion for objects/arrays — those are handled by their own editors). */
function LeafControl({
  value,
  onChange,
}: {
  value: TraitConfigValue;
  onChange: (next: TraitConfigValue) => void;
}): React.ReactElement {
  if (typeof value === 'boolean') {
    return <Switch checked={value} onChange={(c) => onChange(c)} />;
  }
  if (typeof value === 'number') {
    const [draft, setDraft] = React.useState(String(value));
    React.useEffect(() => setDraft(String(value)), [value]);
    const commit = (): void => {
      const n = draft.trim() === '' ? 0 : Number(draft);
      onChange(Number.isNaN(n) ? 0 : n);
    };
    return (
      <Input
        inputType="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
      />
    );
  }
  if (isTraitConfigObject(value)) {
    // Inline nested object: render key=value text pairs compactly
    const [draft, setDraft] = React.useState(JSON.stringify(value));
    React.useEffect(() => setDraft(JSON.stringify(value)), [value]);
    const commit = (): void => {
      try {
        const parsed = JSON.parse(draft) as TraitConfigObject;
        onChange(parsed);
      } catch {
        // keep invalid draft visible until user fixes it
      }
    };
    return (
      <Input
        inputType="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
      />
    );
  }
  if (Array.isArray(value)) {
    const [draft, setDraft] = React.useState(JSON.stringify(value));
    React.useEffect(() => setDraft(JSON.stringify(value)), [value]);
    const commit = (): void => {
      try {
        const parsed = JSON.parse(draft) as ReadonlyArray<TraitConfigValue>;
        onChange(parsed);
      } catch {
        // keep invalid draft visible
      }
    };
    return (
      <Input
        inputType="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
      />
    );
  }
  // string | null
  const strVal = value === null ? '' : String(value);
  const [draft, setDraft] = React.useState(strVal);
  React.useEffect(() => setDraft(value === null ? '' : String(value)), [value]);
  const commit = (): void => { onChange(draft); };
  return (
    <Input
      inputType="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
    />
  );
}

function cloneElement(template: TraitConfigValue): TraitConfigValue {
  if (isTraitConfigObject(template)) {
    const blank: Record<string, TraitConfigValue> = {};
    for (const k of Object.keys(template)) blank[k] = null;
    return blank;
  }
  if (Array.isArray(template)) return [];
  if (typeof template === 'boolean') return false;
  if (typeof template === 'number') return 0;
  return '';
}

/**
 * ArrayEditor — edits a `ReadonlyArray<TraitConfigValue>` with add / remove per row.
 * Each row infers its editor from the element's runtime type.
 */
export const ArrayEditor: React.FC<ArrayEditorProps> = ({ value, onChange, className }) => {
  const arr = value;

  const update = (idx: number, next: TraitConfigValue): void => {
    const copy = [...arr];
    copy[idx] = next;
    onChange(copy);
  };

  const remove = (idx: number): void => {
    onChange(arr.filter((_, i) => i !== idx));
  };

  const add = (): void => {
    const template = arr.length > 0 ? arr[0] : '';
    onChange([...arr, cloneElement(template)]);
  };

  return (
    <VStack gap="xs" className={cn('w-full', className)}>
      {arr.map((elem, idx) => (
        <HStack key={idx} gap="xs" align="center">
          <div className="flex-1">
            <LeafControl value={elem} onChange={(next) => update(idx, next)} />
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon="trash-2"
            onClick={() => remove(idx)}
            aria-label="Remove item"
          />
        </HStack>
      ))}
      <Button variant="ghost" size="sm" icon="plus" label="Add item" onClick={add} />
    </VStack>
  );
};
