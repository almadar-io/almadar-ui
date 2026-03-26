'use client';
/**
 * FlowStateNode Component
 *
 * Custom React Flow node for a state machine state.
 * Renders a FlowNodeShell with role-based header color, state name,
 * and initial/terminal badges. Handles are placed at top (target)
 * and bottom (source) for vertical transition wiring.
 */
import React from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import type { State } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { FlowNodeShell } from '../../atoms/flow/FlowNodeShell';
import { Typography } from '../../atoms/Typography';
import { Badge } from '../../atoms/Badge';
import { HStack } from '../../atoms/Stack';
import { STATE_COLORS, type StateRole } from '../../atoms/avl/types';

/** React Flow node type for state machine states, backed by @almadar/core State. */
export type StateFlowNode = Node<State & Record<string, unknown>, 'state'>;

function resolveRole(data: State): StateRole {
  if (data.isInitial) return 'initial';
  if (data.isTerminal) return 'terminal';
  return 'default';
}

/**
 * React Flow custom node that visualises a single state machine state.
 * Uses STATE_COLORS for the header bar and shows role badges.
 */
export const FlowStateNode: React.FC<NodeProps<StateFlowNode>> = ({
  data,
  selected = false,
}) => {
  const role = resolveRole(data);
  const colors = STATE_COLORS[role];

  return (
    <FlowNodeShell
      selected={selected}
      nodeType="State"
      headerColor={colors.border}
      className={cn('min-w-[120px]')}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-muted-foreground !w-2 !h-2"
      />

      <Typography variant="body" className="font-semibold text-center select-none">
        {data.name}
      </Typography>

      {(data.isInitial || data.isTerminal) && (
        <HStack gap="xs" justify="center" className="mt-1">
          {data.isInitial && (
            <Badge variant="success" size="sm">initial</Badge>
          )}
          {data.isTerminal && (
            <Badge variant="danger" size="sm">terminal</Badge>
          )}
        </HStack>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-muted-foreground !w-2 !h-2"
      />
    </FlowNodeShell>
  );
};

FlowStateNode.displayName = 'FlowStateNode';
