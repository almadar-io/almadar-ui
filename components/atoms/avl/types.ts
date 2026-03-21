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
