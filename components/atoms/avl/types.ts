/**
 * Almadar Visual Language (AVL) shared types.
 *
 * Every AVL atom renders a `<g>` element (not `<svg>`) and accepts
 * AvlBaseProps for positioning and styling within a parent SVG.
 */

export interface AvlBaseProps {
  x?: number;
  y?: number;
  color?: string;
  opacity?: number;
  className?: string;
}

export type AvlEffectType =
  | 'render-ui'
  | 'set'
  | 'persist'
  | 'fetch'
  | 'emit'
  | 'navigate'
  | 'notify'
  | 'call-service'
  | 'spawn'
  | 'despawn'
  | 'do'
  | 'if'
  | 'log';

export type AvlFieldTypeKind =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'enum'
  | 'object'
  | 'array';

export type AvlPersistenceKind =
  | 'persistent'
  | 'runtime'
  | 'singleton'
  | 'instance';

export type AvlOperatorNamespace =
  | 'arithmetic'
  | 'comparison'
  | 'logic'
  | 'string'
  | 'collection'
  | 'time'
  | 'control'
  | 'async';

export const AVL_OPERATOR_COLORS: Record<AvlOperatorNamespace, string> = {
  arithmetic: '#4A90D9',
  comparison: '#E8913A',
  logic: '#9B59B6',
  string: '#27AE60',
  collection: '#1ABC9C',
  time: '#F39C12',
  control: '#E74C3C',
  async: '#E91E8F',
};

export const AVL_FIELD_TYPE_SHAPES: Record<AvlFieldTypeKind, string> = {
  string: 'circle',
  number: 'triangle',
  boolean: 'square',
  date: 'diamond',
  enum: 'ring',
  object: 'hexagon',
  array: 'bars',
};

// ─── AVL V2: Visual Hierarchy Colors ─────────────────────────

export type StateRole = 'initial' | 'terminal' | 'hub' | 'error' | 'default';

export const STATE_COLORS: Record<StateRole, { fill: string; border: string }> = {
  initial:  { fill: '#22C55E1F', border: '#16A34A' },
  terminal: { fill: '#EF44441F', border: '#DC2626' },
  hub:      { fill: '#3B82F61F', border: '#2563EB' },
  error:    { fill: '#F59E0B1F', border: '#D97706' },
  default:  { fill: '#6B72801F', border: '#4B5563' },
};

export type EffectCategory = 'ui' | 'data' | 'communication' | 'lifecycle' | 'control';

export const EFFECT_CATEGORY_COLORS: Record<EffectCategory, { color: string; bg: string }> = {
  ui:            { color: '#8B5CF6', bg: '#8B5CF614' },
  data:          { color: '#3B82F6', bg: '#3B82F614' },
  communication: { color: '#F97316', bg: '#F9731614' },
  lifecycle:     { color: '#10B981', bg: '#10B98114' },
  control:       { color: '#6B7280', bg: '#6B728014' },
};

export const EFFECT_TYPE_TO_CATEGORY: Record<AvlEffectType, EffectCategory> = {
  'render-ui':    'ui',
  'navigate':     'ui',
  'set':          'data',
  'persist':      'data',
  'fetch':        'data',
  'emit':         'communication',
  'notify':       'communication',
  'call-service': 'communication',
  'spawn':        'lifecycle',
  'despawn':      'lifecycle',
  'do':           'control',
  'if':           'control',
  'log':          'control',
};

export const CONNECTION_COLORS = {
  forward:  { color: '#1E293B', width: 2,   dash: 'none' },
  backward: { color: '#94A3B8', width: 1.5, dash: '6 3' },
  selfLoop: { color: '#CBD5E1', width: 1,   dash: '3 2' },
  emitListen: { color: '#F97316', width: 1.5, dash: '4 3' },
} as const;

export function getStateRole(
  name: string,
  isInitial?: boolean,
  isTerminal?: boolean,
  transitionCount?: number,
  maxTransitionCount?: number,
): StateRole {
  if (isInitial) return 'initial';
  if (isTerminal) return 'terminal';
  if (/error|fail|invalid/i.test(name)) return 'error';
  if (transitionCount != null && maxTransitionCount != null
      && transitionCount === maxTransitionCount && transitionCount >= 3) return 'hub';
  return 'default';
}
