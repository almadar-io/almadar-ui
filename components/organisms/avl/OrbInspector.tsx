'use client';

/**
 * OrbInspector
 *
 * Universal contextual inspector for .orb programs. Built into FlowCanvas.
 * Two tabs: Inspector (contextual sections) and Code (.orb syntax view).
 *
 * Inspector shows different sections based on what was clicked:
 *   - Orbital header → entity fields, traits, pages
 *   - Pattern element → pattern props, entity (if entity-aware), transition (if fires event)
 *   - Transition node → state diagram, guard, effects, render-ui source
 *
 * Code tab shows the .orb representation of the selected context.
 *
 * When `editable` is true, inspector fields become inputs.
 */

import React, { useContext, useMemo, useCallback, useState } from 'react';
import type { OrbitalSchema, OrbitalDefinition, Expression, Trait, Transition, FieldType } from '@almadar/core';
import { FieldTypeSchema } from '@almadar/core';
import { Box } from '../../atoms/Box';
import { Button } from '../../atoms/Button';
import { Typography } from '../../atoms/Typography';
import { Input } from '../../atoms/Input';
import { Select } from '../../atoms/Select';
import { Icon } from '../../atoms/Icon';
import { HStack } from '../../atoms/Stack';
import { CodeBlock } from '../../molecules/markdown/CodeBlock';
import { AvlState } from '../../atoms/avl/AvlState';
import { AvlEvent } from '../../atoms/avl/AvlEvent';
import { AvlGuard } from '../../atoms/avl/AvlGuard';
import { AvlEffect } from '../../atoms/avl/AvlEffect';
import { AvlFieldType } from '../../atoms/avl/AvlFieldType';
import {
  getStateRole, type StateRole, type AvlEffectType, type AvlFieldTypeKind,
  EFFECT_TYPE_TO_CATEGORY, EFFECT_CATEGORY_COLORS,
} from '../../atoms/avl/types';
import type { PreviewNodeData } from '../../molecules/avl/avl-preview-types';
import { PatternSelectionContext } from '../../molecules/avl/OrbPreviewNode';
import { getPatternDefinition, isEntityAwarePattern } from '@almadar/patterns';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatExpression(expr: unknown): string {
  if (!expr) return '';
  if (typeof expr === 'string') return expr;
  if (Array.isArray(expr)) return `(${expr.map(formatExpression).join(' ')})`;
  return String(expr);
}

const KNOWN_EFFECTS = new Set([
  'render-ui', 'set', 'persist', 'fetch', 'emit', 'navigate',
  'notify', 'call-service', 'spawn', 'despawn', 'do', 'if', 'log',
]);

function effectSummary(type: string): string {
  return type;
}

const FIELD_TYPE_MAP: Record<string, AvlFieldTypeKind> = {
  string: 'string', number: 'number', boolean: 'boolean',
  date: 'date', enum: 'enum', object: 'object', array: 'array',
};

function findEntity(schema: OrbitalSchema, orbitalName: string): { name: string; persistence: string; fields: Array<{ name: string; type: string; required?: boolean }> } | null {
  const orbital = (schema.orbitals ?? []).find((o: OrbitalDefinition) => o.name === orbitalName);
  if (!orbital || typeof orbital.entity === 'string') return null;
  const e = orbital.entity as unknown as Record<string, unknown>;
  const fields = ((e.fields ?? []) as unknown as Array<Record<string, unknown>>).map(f => ({
    name: (f.name as string) ?? '',
    type: (f.type as string) ?? 'string',
    required: f.required as boolean,
  }));
  return { name: (e.name as string) ?? orbitalName, persistence: (e.persistence as string) ?? 'runtime', fields };
}

function findTransition(schema: OrbitalSchema, orbitalName: string, traitName: string, event: string): Transition | null {
  const orbital = (schema.orbitals ?? []).find((o: OrbitalDefinition) => o.name === orbitalName);
  if (!orbital) return null;
  const traits = (orbital.traits ?? []) as Trait[];
  const trait = traits.find(t => typeof t !== 'string' && t.name === traitName);
  if (!trait || typeof trait === 'string') return null;
  const sm = trait.stateMachine;
  if (!sm) return null;
  return (sm.transitions as Transition[])?.find(t => t.event === event) ?? null;
}

function findTraits(schema: OrbitalSchema, orbitalName: string): Array<{ name: string; stateCount: number }> {
  const orbital = (schema.orbitals ?? []).find((o: OrbitalDefinition) => o.name === orbitalName);
  if (!orbital) return [];
  return ((orbital.traits ?? []) as Trait[]).filter((t: Trait) => typeof t !== 'string').map((t: Trait) => ({
    name: t.name,
    stateCount: (t.stateMachine?.states as unknown[])?.length ?? 0,
  }));
}

/** Navigate a dot-separated path within a pattern config tree. */
function findPatternInTree(root: Record<string, unknown>, path: string): Record<string, unknown> | null {
  if (!path || path === 'root') return root;
  const parts = path.split('.');
  let current: unknown = root;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') return null;
    const record = current as Record<string, unknown>;
    if (part === 'children' && Array.isArray(record.children)) {
      current = record.children;
    } else if (Array.isArray(current)) {
      const idx = parseInt(part, 10);
      if (isNaN(idx) || idx < 0 || idx >= (current as unknown[]).length) return null;
      current = (current as unknown[])[idx];
    } else {
      current = record[part];
    }
  }
  return typeof current === 'object' && current !== null ? current as Record<string, unknown> : null;
}

// Derived from @almadar/core FieldTypeSchema (canonical source)
const FIELD_TYPE_OPTIONS: Array<{ value: string; label: string }> =
  FieldTypeSchema.options.map((v: FieldType) => ({ value: v, label: v }));

// Derived from EFFECT_TYPE_TO_CATEGORY keys (canonical source in avl/types.ts)
const EFFECT_TYPE_OPTIONS: Array<{ value: string; label: string }> =
  (Object.keys(EFFECT_TYPE_TO_CATEGORY) as AvlEffectType[]).map(v => ({ value: v, label: v }));

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface OrbInspectorProps {
  node: PreviewNodeData;
  schema: OrbitalSchema;
  editable?: boolean;
  onSchemaChange?: (schema: OrbitalSchema) => void;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type InspectorTab = 'inspector' | 'code';

export function OrbInspector({ node, schema, editable = false, onSchemaChange, onClose }: OrbInspectorProps): React.ReactElement {
  const { selected: selectedPattern } = useContext(PatternSelectionContext);
  const [activeTab, setActiveTab] = useState<InspectorTab>('inspector');
  const eventBus = useEventBus();
  const { t } = useTranslate();

  const orbitalName = (node.orbitalName as string) ?? '';
  const traitName = (node.traitName as string) ?? '';
  const transitionEvent = (node.transitionEvent as string) ?? '';
  const fromState = (node.fromState as string) ?? '';
  const toState = (node.toState as string) ?? '';
  const entityName = (node.entityName as string) ?? '';
  const patterns = node.patterns ?? [];
  const effectTypes = (node.effectTypes ?? []) as string[];
  const guard = node.guard as Expression | null | undefined;
  const isExpanded = Boolean(traitName);

  const hasRenderUi = effectTypes.includes('render-ui');

  const patternType = selectedPattern?.patternType;
  const patternDef = useMemo(() => patternType ? getPatternDefinition(patternType) : null, [patternType]);
  const isEntityPattern = patternType ? isEntityAwarePattern(patternType) : false;
  const entity = useMemo(() => findEntity(schema, orbitalName), [schema, orbitalName]);
  const transition = useMemo(() => {
    if (!traitName || !transitionEvent) return null;
    return findTransition(schema, orbitalName, traitName, transitionEvent);
  }, [schema, orbitalName, traitName, transitionEvent]);
  const traits = useMemo(() => findTraits(schema, orbitalName), [schema, orbitalName]);

  // Resolve current pattern config values from the schema
  const patternConfig = useMemo(() => {
    if (!selectedPattern || !transition) return null;
    const patternId = selectedPattern.patternId ?? 'root';
    for (const eff of (transition.effects ?? []) as unknown[][]) {
      if (Array.isArray(eff) && eff[0] === 'render-ui' && eff[2]) {
        const found = findPatternInTree(eff[2] as Record<string, unknown>, patternId);
        if (found) return found;
      }
    }
    return null;
  }, [selectedPattern, transition]);

  // Generate the relevant JSON slice for the code tab
  const orbCode = useMemo(() => {
    const orbital = (schema.orbitals ?? []).find((o: OrbitalDefinition) => o.name === orbitalName);
    if (!orbital) return '{}';

    if (isExpanded && traitName) {
      const traitList = (orbital.traits ?? []) as Trait[];
      const trait = traitList.find(tr => typeof tr !== 'string' && tr.name === traitName);
      if (trait && typeof trait !== 'string' && trait.stateMachine) {
        if (transitionEvent) {
          const tx = (trait.stateMachine.transitions as Transition[])?.find(txn => txn.event === transitionEvent);
          if (tx) return JSON.stringify(tx, null, 2);
        }
        return JSON.stringify({ name: trait.name, stateMachine: trait.stateMachine }, null, 2);
      }
    }

    return JSON.stringify(orbital, null, 2);
  }, [schema, orbitalName, traitName, transitionEvent, isExpanded]);

  // W1: Pattern prop editing via EventBus
  const handlePropChange = useCallback((propName: string, value: unknown) => {
    if (!editable) return;
    eventBus.emit('UI:PROP_CHANGE', { propName, value });
  }, [editable, eventBus]);

  // W2: Entity field mutations via EventBus
  const handleAddField = useCallback(() => {
    eventBus.emit('UI:ADD_FIELD', {});
  }, [eventBus]);

  const handleUpdateField = useCallback((fieldName: string, updates: Record<string, unknown>) => {
    eventBus.emit('UI:UPDATE_FIELD', { fieldName, updates });
  }, [eventBus]);

  const handleRemoveField = useCallback((fieldName: string) => {
    eventBus.emit('UI:REMOVE_FIELD', { fieldName });
  }, [eventBus]);

  // W3: Guard editing via EventBus
  const handleGuardChange = useCallback((guardExpr: string) => {
    if (!editable) return;
    // Pass the raw string; BuilderPage can parse if needed
    eventBus.emit('UI:GUARD_CHANGE', { guard: guardExpr || null });
  }, [editable, eventBus]);

  // W3: Effect mutations via EventBus
  const handleAddEffect = useCallback((effectType: string) => {
    eventBus.emit('UI:ADD_EFFECT', { effectType });
  }, [eventBus]);

  const handleRemoveEffect = useCallback((effectIndex: number) => {
    eventBus.emit('UI:REMOVE_EFFECT', { effectIndex });
  }, [eventBus]);

  void onSchemaChange; // Editing goes through EventBus, not direct callback

  const headerTitle = selectedPattern
    ? selectedPattern.patternType
    : isExpanded ? transitionEvent || 'Transition' : orbitalName;

  return (
    <Box className="flex flex-col bg-card border-l border-border h-full" style={{ width: 340 }}>
      {/* Header + Tabs */}
      <Box className="shrink-0 border-b border-border">
        <Box className="flex items-center justify-between px-4 py-2">
          <Box className="flex items-center gap-2">
            {selectedPattern ? (
              <Box
                className="rounded px-2 py-0.5 text-[11px] font-mono font-semibold"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
              >
                {headerTitle}
              </Box>
            ) : (
              <Typography variant="small" className="font-semibold">{headerTitle}</Typography>
            )}
          </Box>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm cursor-pointer bg-transparent border-none p-1"
            aria-label="Close"
          >
            &times;
          </button>
        </Box>

        {/* Tab bar */}
        <Box className="flex px-4 gap-4">
          <button
            onClick={() => setActiveTab('inspector')}
            className={`pb-2 text-[12px] font-medium border-b-2 cursor-pointer bg-transparent border-x-0 border-t-0 px-0 ${
              activeTab === 'inspector'
                ? 'border-[var(--color-primary)] text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Inspector
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`pb-2 text-[12px] font-medium border-b-2 cursor-pointer bg-transparent border-x-0 border-t-0 px-0 ${
              activeTab === 'code'
                ? 'border-[var(--color-primary)] text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Code
          </button>
        </Box>
      </Box>

      {/* Scrollable content */}
      <Box className="flex-1 overflow-y-auto">
        {activeTab === 'code' ? (
          /* ── Code Tab ── */
          /* GAP-51: when editable, the CodeBlock molecule renders the existing
             Textarea atom internally and forwards keystrokes via UI:CODE_CHANGE
             on the EventBus. The consumer (builder workspace) listens, debounces,
             parses via safeParseOrbitalSchema, and calls setSchema. Read-only
             consumers (editable=false) see the existing syntax-highlighted view. */
          <Box className="p-2">
            <CodeBlock
              code={orbCode}
              language="orb"
              showCopyButton
              showLanguageBadge
              maxHeight="100%"
              editable={editable}
              onChange={editable ? (code) => eventBus.emit('UI:CODE_CHANGE', { code }) : undefined}
            />
          </Box>
        ) : (
          /* ── Inspector Tab ── */
          <>
            {/* Pattern Props */}
            {selectedPattern && patternDef?.propsSchema && (
              <Box className="px-4 py-3 border-b border-border/40">
                <Typography variant="small" className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">{t('Props')}</Typography>
                <Box className="flex flex-col gap-1.5">
                  {Object.entries(patternDef.propsSchema).slice(0, 12).map(([propName, propSchema]) => {
                    const ps = propSchema as Record<string, unknown>;
                    const currentValue = patternConfig ? patternConfig[propName] : undefined;
                    const displayValue = currentValue !== undefined
                      ? (typeof currentValue === 'object' ? JSON.stringify(currentValue) : String(currentValue))
                      : '';
                    return (
                      <Box key={propName} className="flex items-center gap-2">
                        <Typography variant="small" className="text-muted-foreground text-[11px] w-20 shrink-0 font-mono">{propName}</Typography>
                        {editable ? (
                          <Input
                            defaultValue={displayValue}
                            placeholder={(ps.types as string[])?.join(' | ') ?? 'string'}
                            className="flex-1 text-[11px] h-6"
                            onBlur={(e: React.FocusEvent<HTMLInputElement>) => handlePropChange(propName, e.target.value)}
                          />
                        ) : (
                          <Typography variant="small" className="text-[11px] text-muted-foreground">
                            {displayValue || '—'}{ps.required ? ' *' : ''}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Entity Fields */}
            {((selectedPattern && isEntityPattern) || (!selectedPattern && !isExpanded)) && entity && (
              <Box className="px-4 py-3 border-b border-border/40">
                <Typography variant="small" className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">{t('Entity')}</Typography>
                <Box className="flex items-center gap-2 mb-2">
                  <svg width={14} height={14}><circle cx={7} cy={7} r={5} fill="var(--color-primary)" /></svg>
                  <Typography variant="small" className="font-semibold text-[12px]">{entity.name}</Typography>
                  <Typography variant="small" className="text-muted-foreground text-[10px]">{entity.persistence}</Typography>
                </Box>
                <Box className="flex flex-col gap-1">
                  {entity.fields.map(f => (
                    <HStack key={f.name} gap="xs" className="items-center">
                      <svg width={12} height={12}><AvlFieldType x={6} y={6} kind={FIELD_TYPE_MAP[f.type] ?? 'string'} size={4} /></svg>
                      {editable ? (
                        <>
                          <Input
                            defaultValue={f.name}
                            className="flex-1 text-[11px] font-mono h-6"
                            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                              if (e.target.value !== f.name) {
                                handleUpdateField(f.name, { name: e.target.value });
                              }
                            }}
                          />
                          <Select
                            value={f.type}
                            options={FIELD_TYPE_OPTIONS}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdateField(f.name, { type: e.target.value })}
                            className="w-20 text-[10px] h-6"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveField(f.name)}
                            className="shrink-0 p-0.5 h-6 w-6"
                          >
                            <Icon name="x" size="xs" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Typography variant="small" className="text-[11px] font-mono flex-1">{f.name}</Typography>
                          <Typography variant="small" className="text-muted-foreground text-[10px]">{f.type}</Typography>
                          {f.required && <Typography variant="small" className="text-primary text-[9px]">{t('req')}</Typography>}
                        </>
                      )}
                    </HStack>
                  ))}
                </Box>
                {editable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddField}
                    className="mt-2 text-[11px] w-full"
                  >
                    <Icon name="plus" size="xs" className="mr-1" />
                    {t('Add Field')}
                  </Button>
                )}
              </Box>
            )}

            {/* Service Mode Toggle (service behaviors only) */}
            {editable && !selectedPattern && !isExpanded && node.layer === 'Services' && (
              <Box className="px-4 py-3 border-b border-border/40">
                <Typography variant="small" className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">{t('Service Mode')}</Typography>
                <HStack gap="sm" className="items-center">
                  <Button
                    variant={hasRenderUi ? 'primary' : 'ghost'}
                    size="sm"
                    className="flex-1 text-[11px]"
                    onClick={() => {
                      if (!hasRenderUi) eventBus.emit('UI:SERVICE_MODE_TOGGLE', { orbitalName: node.orbitalName, standalone: true });
                    }}
                  >
                    <Icon name="monitor" size="xs" className="mr-1" />
                    {t('Standalone')}
                  </Button>
                  <Button
                    variant={hasRenderUi ? 'ghost' : 'primary'}
                    size="sm"
                    className="flex-1 text-[11px]"
                    onClick={() => {
                      if (hasRenderUi) eventBus.emit('UI:SERVICE_MODE_TOGGLE', { orbitalName: node.orbitalName, standalone: false });
                    }}
                  >
                    <Icon name="cpu" size="xs" className="mr-1" />
                    {t('Embedded')}
                  </Button>
                </HStack>
                <Typography variant="small" className="text-muted-foreground text-[10px] mt-1">
                  {hasRenderUi ? t('Renders its own UI') : t('Headless, wired to other behaviors')}
                </Typography>
              </Box>
            )}

            {/* Traits (orbital overview) */}
            {!selectedPattern && !isExpanded && traits.length > 0 && (
              <Box className="px-4 py-3 border-b border-border/40">
                <Typography variant="small" className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">Traits</Typography>
                <Box className="flex flex-col gap-1">
                  {traits.map(t => (
                    <Box key={t.name} className="flex items-center gap-2">
                      <Typography variant="small" className="text-[11px] font-semibold">{t.name}</Typography>
                      <Typography variant="small" className="text-muted-foreground text-[10px]">{t.stateCount} states</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* State Transition */}
            {isExpanded && fromState && toState && (
              <Box className="px-4 py-3 border-b border-border/40">
                <Typography variant="small" className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">Transition</Typography>
                <svg width="100%" height={44} viewBox="0 0 280 44">
                  <AvlState x={8} y={8} name={fromState} role={getStateRole(fromState) as StateRole} width={90} height={26} />
                  <line x1={104} y1={21} x2={158} y2={21} stroke="#1E293B" strokeWidth={2} markerEnd="url(#orb-arrow)" />
                  <AvlState x={164} y={8} name={toState} role={getStateRole(toState) as StateRole} width={90} height={26} />
                  <defs>
                    <marker id="orb-arrow" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto">
                      <path d="M0,0 L8,3 L0,6 Z" fill="#1E293B" />
                    </marker>
                  </defs>
                </svg>
                {traitName && (
                  <Typography variant="small" className="text-muted-foreground text-[11px]">
                    {traitName}{entityName ? ` on ${entityName}` : ''}
                  </Typography>
                )}
              </Box>
            )}

            {/* Trigger */}
            {isExpanded && transitionEvent && (
              <Box className="px-4 py-2 border-b border-border/40">
                <Box className="flex items-center gap-2">
                  <svg width={16} height={16}><AvlEvent x={8} y={8} size={12} /></svg>
                  <Typography variant="small" className="font-semibold text-[12px]">{transitionEvent}</Typography>
                </Box>
              </Box>
            )}

            {/* Guard */}
            {(transition?.guard ?? guard ?? editable) && isExpanded && (
              <Box className="px-4 py-2 border-b border-border/40">
                <HStack gap="xs" className="items-center">
                  <svg width={16} height={16}><AvlGuard x={8} y={8} size={12} /></svg>
                  {editable ? (
                    <Input
                      defaultValue={formatExpression(transition?.guard ?? guard)}
                      placeholder={t('Guard expression')}
                      className="flex-1 text-[11px] font-mono h-6"
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) => handleGuardChange(e.target.value)}
                    />
                  ) : (
                    <Typography variant="small" className="font-mono text-[11px] text-muted-foreground">
                      {formatExpression(transition?.guard ?? guard)}
                    </Typography>
                  )}
                </HStack>
              </Box>
            )}

            {/* Effects */}
            {(effectTypes.length > 0 || editable) && isExpanded && (
              <Box className="px-4 py-3 border-b border-border/40">
                <Typography variant="small" className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">
                  {t('Effects')} ({effectTypes.length})
                </Typography>
                <Box className="flex flex-col gap-1.5">
                  {effectTypes.map((type, i) => {
                    const isKnown = KNOWN_EFFECTS.has(type);
                    const category = EFFECT_TYPE_TO_CATEGORY[type as AvlEffectType];
                    const catColor = category ? EFFECT_CATEGORY_COLORS[category] : undefined;
                    return (
                      <HStack key={i} gap="xs" className="items-center">
                        <Typography variant="small" className="text-muted-foreground text-[11px] w-4 text-right shrink-0">{i + 1}.</Typography>
                        {isKnown && (
                          <svg width={16} height={16}><AvlEffect x={8} y={8} effectType={type as AvlEffectType} size={6} showBackground /></svg>
                        )}
                        <Typography variant="small" className="text-[11px] flex-1" style={{ color: catColor?.color }}>
                          {effectSummary(type)}
                        </Typography>
                        {editable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveEffect(i)}
                            className="shrink-0 p-0.5 h-6 w-6"
                          >
                            <Icon name="x" size="xs" />
                          </Button>
                        )}
                      </HStack>
                    );
                  })}
                </Box>
                {editable && (
                  <AddEffectButton onAdd={handleAddEffect} />
                )}
              </Box>
            )}

            {/* Render-UI Source */}
            {patterns.length > 0 && !selectedPattern && (
              <Box className="px-4 py-3">
                <Typography variant="small" className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">render-ui</Typography>
                <Box className="bg-muted/20 rounded-md p-3 font-mono text-[11px] leading-relaxed overflow-x-auto">
                  {patterns.map((entry, i) => (
                    <Box key={i}>
                      <Typography variant="small" className="text-muted-foreground text-[10px]">slot: {entry.slot}</Typography>
                      <OrbPatternTree config={entry.pattern as Record<string, unknown>} depth={0} />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Add Effect dropdown button
// ---------------------------------------------------------------------------

function AddEffectButton({ onAdd }: { onAdd: (type: string) => void }): React.ReactElement {
  const [open, setOpen] = useState(false);
  const { t } = useTranslate();

  return (
    <Box className="relative mt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(prev => !prev)}
        className="text-[11px] w-full"
      >
        <Icon name="plus" size="xs" className="mr-1" />
        {t('Add Effect')}
      </Button>
      {open && (
        <Box className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg overflow-hidden">
          {EFFECT_TYPE_OPTIONS.map(opt => (
            <Box
              key={opt.value}
              className="px-3 py-1.5 text-[11px] cursor-pointer hover:bg-muted/50 flex items-center gap-2"
              onClick={() => { onAdd(opt.value); setOpen(false); }}
            >
              {KNOWN_EFFECTS.has(opt.value) && (
                <svg width={14} height={14}><AvlEffect x={7} y={7} effectType={opt.value as AvlEffectType} size={5} showBackground /></svg>
              )}
              <Typography variant="small" className="text-[11px]">{opt.label}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Pattern tree renderer
// ---------------------------------------------------------------------------

function OrbPatternTree({ config, depth }: { config: Record<string, unknown>; depth: number }): React.ReactElement | null {
  if (!config || typeof config !== 'object') return null;
  const { type, children, ...props } = config;
  if (typeof type !== 'string') return null;

  const propEntries = Object.entries(props).filter(([k]) => k !== 'type');

  return (
    <Box style={{ paddingLeft: depth * 12 }}>
      <Typography variant="small" className="text-primary font-semibold text-[11px]">{type}</Typography>
      {propEntries.slice(0, 5).map(([key, val]) => {
        const display = typeof val === 'string'
          ? val.startsWith('@') ? <span className="text-purple-500">{val}</span> : `"${val}"`
          : Array.isArray(val) && typeof val[0] === 'string' && val[0].includes('/')
            ? <span className="text-amber-600">({val.join(' ')})</span>
            : String(val);
        return (
          <Box key={key} className="flex gap-1 text-[10px]">
            <span className="text-muted-foreground">{key}:</span>
            <span>{display}</span>
          </Box>
        );
      })}
      {Array.isArray(children) && children.map((child, i) => (
        <OrbPatternTree key={i} config={child as Record<string, unknown>} depth={depth + 1} />
      ))}
    </Box>
  );
}

OrbInspector.displayName = 'OrbInspector';
