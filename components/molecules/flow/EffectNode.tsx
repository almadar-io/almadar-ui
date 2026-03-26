'use client';
/**
 * EffectNode Component
 *
 * Custom React Flow node for an effect in a transition.
 * Shows the effect type with a category-colored header and
 * optional args caption. One target Handle (left) for input,
 * one source Handle (right) for chain output.
 */
import React from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { cn } from '../../../lib/cn';
import { FlowNodeShell } from '../../atoms/flow/FlowNodeShell';
import { Typography } from '../../atoms/Typography';
import { HStack } from '../../atoms/Stack';
import {
  EFFECT_CATEGORY_COLORS,
  EFFECT_TYPE_TO_CATEGORY,
  type EffectCategory,
  type AvlEffectType,
} from '../../atoms/avl/types';

/** Data shape for effect flow nodes, extending Record<string, unknown> for React Flow v12. */
export interface EffectNodeData extends Record<string, unknown> {
  /** Effect type identifier (e.g. "render-ui", "set", "emit"). */
  effectType: string;
  /** Optional stringified args summary. */
  args?: string;
  /** Category override. Derived from effectType when omitted. */
  category?: EffectCategory;
}

/** React Flow node type for effect nodes in transition chains. */
export type EffectFlowNode = Node<EffectNodeData, 'effect'>;

/** Effect type icon glyphs mapped to Unicode characters. */
const EFFECT_ICONS: Record<string, string> = {
  'render-ui': '\u229E',  // grid
  'set': '\u270E',        // pencil
  'persist': '\u26C1',    // cylinder
  'fetch': '\u21E3',      // down arrow
  'emit': '\uD83D\uDCE1', // antenna
  'navigate': '\u21E2',   // right arrow
  'notify': '\uD83D\uDD14', // bell
  'call-service': '\u21C4', // bidirectional
  'spawn': '\u2295',      // plus circle
  'despawn': '\u2296',    // minus circle
  'do': '\u25B6',         // play
  'if': '\u25C7',         // diamond
  'log': '\u00B6',        // pilcrow
};

function resolveCategory(data: EffectNodeData): EffectCategory {
  if (data.category) return data.category;
  const mapped = EFFECT_TYPE_TO_CATEGORY[data.effectType as AvlEffectType];
  return mapped ?? 'control';
}

/**
 * React Flow custom node for an effect in a transition chain.
 */
export const EffectNode: React.FC<NodeProps<EffectFlowNode>> = ({
  data,
  selected = false,
}) => {
  const category = resolveCategory(data);
  const colors = EFFECT_CATEGORY_COLORS[category];
  const icon = EFFECT_ICONS[data.effectType] ?? '\u2022';

  return (
    <FlowNodeShell
      selected={selected}
      nodeType="Effect"
      headerColor={colors.color}
      className={cn('min-w-[120px]')}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2"
        style={{ backgroundColor: colors.color }}
      />

      <HStack gap="xs" align="center">
        <Typography
          variant="body"
          className="select-none"
          style={{ color: colors.color }}
        >
          {icon}
        </Typography>
        <Typography variant="body" className="font-semibold select-none">
          {data.effectType}
        </Typography>
      </HStack>

      {data.args && (
        <Typography variant="caption" className="text-muted-foreground select-none mt-0.5 truncate max-w-[160px]">
          {data.args}
        </Typography>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2"
        style={{ backgroundColor: colors.color }}
      />
    </FlowNodeShell>
  );
};

EffectNode.displayName = 'EffectNode';
