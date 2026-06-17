'use client';
import React from 'react';
import type { TraitConfigValue, TraitConfigObject } from '@almadar/core';
import { VStack, HStack } from '../atoms/Stack';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Switch } from '../atoms/Switch';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { cn } from '../../../lib/cn';

type V = TraitConfigValue;
type Kind = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';

const isObj = (v: V): v is TraitConfigObject =>
  v !== null && typeof v === 'object' && !Array.isArray(v);
const isArr = (v: V): v is ReadonlyArray<V> => Array.isArray(v);

function kindOf(v: V): Kind {
  if (v === null) return 'null';
  if (isArr(v)) return 'array';
  if (isObj(v)) return 'object';
  if (typeof v === 'number') return 'number';
  if (typeof v === 'boolean') return 'boolean';
  return 'string';
}

const TYPE_LABEL: Record<Kind, string> = {
  object: '{}',
  array: '[]',
  string: 'txt',
  number: 'num',
  boolean: 'y/n',
  null: '—',
};

const KIND_OPTIONS: Kind[] = ['string', 'number', 'boolean', 'object', 'array'];

function emptyOf(kind: Kind): V {
  switch (kind) {
    case 'object': return {};
    case 'array': return [];
    case 'number': return 0;
    case 'boolean': return false;
    case 'null': return null;
    default: return '';
  }
}

/** A new array element, shaped like the existing first element (so demos stay representative). */
function templateFrom(arr: ReadonlyArray<V>): V {
  if (arr.length === 0) return '';
  const first = arr[0];
  if (isObj(first)) {
    const blank: Record<string, V> = {};
    for (const k of Object.keys(first)) blank[k] = isObj(first[k]) ? {} : isArr(first[k]) ? [] : first[k];
    return blank;
  }
  if (isArr(first)) return [];
  return emptyOf(kindOf(first));
}

/** Inline editor for a scalar leaf — typed by the value's runtime kind. Commits on blur/Enter. */
function ScalarControl({
  value,
  onChange,
}: {
  value: V;
  onChange: (next: V) => void;
}): React.ReactElement {
  if (typeof value === 'boolean') {
    return <Switch checked={value} onChange={(c) => onChange(c)} />;
  }
  const numeric = typeof value === 'number';
  const initial = value === null ? '' : String(value);
  const [draft, setDraft] = React.useState(initial);
  React.useEffect(() => setDraft(initial), [initial]);
  const commit = (): void => {
    if (numeric) {
      const n = draft.trim() === '' ? 0 : Number(draft);
      onChange(Number.isNaN(n) ? 0 : n);
    } else {
      onChange(draft);
    }
  };
  return (
    <Input
      inputType={numeric ? 'number' : 'text'}
      value={draft}
      placeholder={value === null ? 'null' : undefined}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
    />
  );
}

/** Small dropdown to change a value's type (string ↔ number ↔ boolean ↔ object ↔ array). */
function KindSelect({
  kind,
  onChange,
}: {
  kind: Kind;
  onChange: (k: Kind) => void;
}): React.ReactElement {
  return (
    <select
      value={kind === 'null' ? 'string' : kind}
      onChange={(e) => onChange(e.target.value as Kind)}
      aria-label="Value type"
      className={cn(
        'h-6 rounded-sm bg-muted text-muted-foreground text-[10px] font-mono px-1',
        'border-[length:var(--border-width-thin)] border-border',
        'hover:bg-card focus:outline-none focus:ring-1 focus:ring-ring',
      )}
    >
      {KIND_OPTIONS.map((k) => (
        <option key={k} value={k}>{TYPE_LABEL[k]}</option>
      ))}
    </select>
  );
}

/** Recursive node: a collapsible container ({}/[]) or an inline scalar control. */
function ValueNode({
  value,
  onChange,
  depth,
}: {
  value: V;
  onChange: (next: V) => void;
  depth: number;
}): React.ReactElement {
  const kind = kindOf(value);

  if (kind === 'object' || kind === 'array') {
    return <ContainerNode value={value} onChange={onChange} depth={depth} />;
  }
  return <ScalarControl value={value} onChange={onChange} />;
}

/** A single keyed/indexed row inside a container: [type] [key|index] [value] [remove]. */
function Row({
  rowKey,
  isArrayItem,
  value,
  depth,
  onValue,
  onRenameKey,
  onChangeKind,
  onRemove,
}: {
  rowKey: string;
  isArrayItem: boolean;
  value: V;
  depth: number;
  onValue: (next: V) => void;
  onRenameKey: (next: string) => void;
  onChangeKind: (k: Kind) => void;
  onRemove: () => void;
}): React.ReactElement {
  const [keyDraft, setKeyDraft] = React.useState(rowKey);
  React.useEffect(() => setKeyDraft(rowKey), [rowKey]);
  const container = isObj(value) || isArr(value);

  return (
    <VStack gap="none" className="group w-max min-w-full">
      <HStack gap="xs" align="center" className="py-0.5 w-max">
        <KindSelect kind={kindOf(value)} onChange={onChangeKind} />
        {isArrayItem ? (
          <Typography variant="caption" color="muted" className="w-6 shrink-0 font-mono">
            {rowKey}
          </Typography>
        ) : (
          <div className="w-20 shrink-0">
            <Input
              inputType="text"
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              onBlur={() => keyDraft !== rowKey && onRenameKey(keyDraft)}
              onKeyDown={(e) => { if (e.key === 'Enter' && keyDraft !== rowKey) onRenameKey(keyDraft); }}
              className="font-mono"
            />
          </div>
        )}
        {!container && (
          <div className="w-48 shrink-0">
            <ValueNode value={value} onChange={onValue} depth={depth + 1} />
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          icon="x"
          onClick={onRemove}
          aria-label="Remove"
          className="shrink-0 text-muted-foreground hover:text-error"
        />
      </HStack>
      {container && (
        <div className="pl-2">
          <ValueNode value={value} onChange={onValue} depth={depth + 1} />
        </div>
      )}
    </VStack>
  );
}

/** Collapsible object / array node with add + per-row remove + type switching. */
function ContainerNode({
  value,
  onChange,
  depth,
}: {
  value: V;
  onChange: (next: V) => void;
  depth: number;
}): React.ReactElement {
  const [open, setOpen] = React.useState(depth < 2);
  const array = isArr(value);
  const entries: Array<[string, V]> = array
    ? value.map((v, i) => [String(i), v] as [string, V])
    : Object.entries(value as TraitConfigObject);

  const setObjValue = (key: string, next: V): void => {
    onChange({ ...(value as TraitConfigObject), [key]: next });
  };
  const renameKey = (oldKey: string, newKey: string): void => {
    if (!newKey || newKey === oldKey) return;
    const out: Record<string, V> = {};
    for (const [k, v] of Object.entries(value as TraitConfigObject)) out[k === oldKey ? newKey : k] = v;
    onChange(out);
  };
  const removeObjKey = (key: string): void => {
    const out: Record<string, V> = {};
    for (const [k, v] of Object.entries(value as TraitConfigObject)) if (k !== key) out[k] = v;
    onChange(out);
  };
  const changeObjKind = (key: string, k: Kind): void => setObjValue(key, emptyOf(k));

  const setArrValue = (idx: number, next: V): void => {
    const copy = [...(value as ReadonlyArray<V>)];
    copy[idx] = next;
    onChange(copy);
  };
  const removeArrIdx = (idx: number): void => onChange((value as ReadonlyArray<V>).filter((_, i) => i !== idx));
  const changeArrKind = (idx: number, k: Kind): void => setArrValue(idx, emptyOf(k));

  const add = (): void => {
    if (array) {
      onChange([...(value as ReadonlyArray<V>), templateFrom(value as ReadonlyArray<V>)]);
    } else {
      const obj = value as TraitConfigObject;
      let key = 'key';
      let n = 1;
      while (key in obj) { key = `key${n}`; n += 1; }
      onChange({ ...obj, [key]: '' });
    }
  };

  const summary = array ? `${entries.length} item${entries.length === 1 ? '' : 's'}` : `${entries.length} field${entries.length === 1 ? '' : 's'}`;

  return (
    <VStack gap="none" className="w-full">
      <HStack gap="xs" align="center">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          aria-label={open ? 'Collapse' : 'Expand'}
        >
          <Icon name={open ? 'chevron-down' : 'chevron-right'} size="sm" />
          <span className="font-mono text-xs">{array ? '[ ]' : '{ }'}</span>
          <Typography variant="caption" color="muted">{summary}</Typography>
        </button>
      </HStack>
      {open && (
        <VStack
          gap="none"
          className={cn('ml-1.5 pl-1.5 w-max min-w-full border-l-[length:var(--border-width-thin)] border-border')}
        >
          {entries.map(([k, v], idx) => (
            <Row
              key={array ? idx : k}
              rowKey={k}
              isArrayItem={array}
              value={v}
              depth={depth}
              onValue={(next) => (array ? setArrValue(idx, next) : setObjValue(k, next))}
              onRenameKey={(nk) => renameKey(k, nk)}
              onChangeKind={(kind) => (array ? changeArrKind(idx, kind) : changeObjKind(k, kind))}
              onRemove={() => (array ? removeArrIdx(idx) : removeObjKey(k))}
            />
          ))}
          <Button
            variant="ghost"
            size="sm"
            icon="plus"
            label={array ? 'Add item' : 'Add field'}
            onClick={add}
            className="self-start text-muted-foreground"
          />
        </VStack>
      )}
    </VStack>
  );
}

export interface JsonTreeEditorProps {
  /** Current value (object / array / scalar). */
  value: TraitConfigValue;
  /** Fired with the next value on any edit. */
  onChange: (next: TraitConfigValue) => void;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * JsonTreeEditor — a visual, collapsible tree editor for any `TraitConfigValue`
 * (object / array / nested / scalar). Replaces raw `JSON.stringify` text editing:
 * each node renders a typed inline control, containers collapse, and rows can be
 * added, removed, retyped, and (for objects) re-keyed. Self-contained — styled
 * purely with `@almadar/ui` atoms + design tokens.
 */
export const JsonTreeEditor: React.FC<JsonTreeEditorProps> = ({ value, onChange, className }) => {
  const root = value ?? '';
  return (
    <div className={cn('w-full overflow-x-auto rounded-sm bg-card/40 p-2 border-[length:var(--border-width-thin)] border-border', className)}>
      <ValueNode value={root} onChange={onChange} depth={0} />
    </div>
  );
};
