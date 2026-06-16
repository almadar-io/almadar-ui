'use client';
import React from 'react';
import type { TraitConfigValue, TraitConfigObject } from '@almadar/core';
import { VStack, HStack } from '../atoms/Stack';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Switch } from '../atoms/Switch';
import { cn } from '../../../lib/cn';

export interface MapEditorProps {
  /** Current map value (object used as string-keyed map). */
  value: TraitConfigObject;
  /** Fired when an entry is added, removed, or its key/value is changed. */
  onChange: (next: TraitConfigObject) => void;
  /** Additional CSS classes. */
  className?: string;
}

function isTraitConfigObject(v: TraitConfigValue): v is TraitConfigObject {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function ValueControl({
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
  if (isTraitConfigObject(value) || Array.isArray(value)) {
    const [draft, setDraft] = React.useState(JSON.stringify(value));
    React.useEffect(() => setDraft(JSON.stringify(value)), [value]);
    const commit = (): void => {
      try { onChange(JSON.parse(draft) as TraitConfigValue); } catch { /* keep draft */ }
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
  const [draft, setDraft] = React.useState(value === null ? '' : String(value));
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

/**
 * MapEditor — edits a `TraitConfigObject` as a dynamic key/value map.
 * Unlike ObjectEditor (fixed schema keys), MapEditor allows adding/removing entries
 * and renaming keys.
 */
export const MapEditor: React.FC<MapEditorProps> = ({ value, onChange, className }) => {
  const entries = Object.entries(value);

  const updateKey = (oldKey: string, newKey: string): void => {
    const next: Record<string, TraitConfigValue> = {};
    for (const [k, v] of Object.entries(value)) {
      next[k === oldKey ? newKey : k] = v;
    }
    onChange(next);
  };

  const updateValue = (k: string, next: TraitConfigValue): void => {
    onChange({ ...value, [k]: next });
  };

  const remove = (k: string): void => {
    const next = { ...value };
    delete next[k];
    onChange(next);
  };

  const add = (): void => {
    let key = 'key';
    let i = 1;
    while (key in value) { key = `key${i}`; i++; }
    onChange({ ...value, [key]: '' });
  };

  return (
    <VStack gap="xs" className={cn('w-full', className)}>
      {entries.map(([k, v]) => (
        <HStack key={k} gap="xs" align="center">
          <KeyInput currentKey={k} onRename={(newKey) => updateKey(k, newKey)} />
          <div className="flex-1">
            <ValueControl value={v} onChange={(next) => updateValue(k, next)} />
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon="trash-2"
            onClick={() => remove(k)}
            aria-label="Remove entry"
          />
        </HStack>
      ))}
      <Button variant="ghost" size="sm" icon="plus" label="Add entry" onClick={add} />
    </VStack>
  );
};

/** Editable key cell — commits rename on blur/Enter. */
function KeyInput({
  currentKey,
  onRename,
}: {
  currentKey: string;
  onRename: (next: string) => void;
}): React.ReactElement {
  const [draft, setDraft] = React.useState(currentKey);
  React.useEffect(() => setDraft(currentKey), [currentKey]);
  const commit = (): void => {
    const trimmed = draft.trim();
    if (trimmed !== '' && trimmed !== currentKey) onRename(trimmed);
    else setDraft(currentKey);
  };
  return (
    <Input
      inputType="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
      className="w-24 shrink-0 font-mono text-xs"
      placeholder="key"
    />
  );
}
