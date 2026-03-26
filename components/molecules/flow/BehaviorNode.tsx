'use client';
/**
 * BehaviorNode Component
 *
 * Custom React Flow node for a standard behavior. Shows name,
 * truncated description, state count, and per-event Handles for
 * emit (source, right) and listen (target, left) wiring.
 */
import React from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { cn } from '../../../lib/cn';
import { FlowNodeShell } from '../../atoms/flow/FlowNodeShell';
import { Typography } from '../../atoms/Typography';
import { Box } from '../../atoms/Box';
import { VStack } from '../../atoms/Stack';

/** Data shape for behavior flow nodes, extending Record<string, unknown> for React Flow v12. */
export interface BehaviorNodeData extends Record<string, unknown> {
  /** Behavior name (e.g. "std-cart"). */
  name: string;
  /** Optional description, truncated after 60 chars. */
  description?: string;
  /** Number of states in this behavior. */
  stateCount: number;
  /** Events this behavior emits. */
  emits: string[];
  /** Events this behavior listens for. */
  listens: string[];
}

/** React Flow node type for behavior nodes. */
export type BehaviorFlowNode = Node<BehaviorNodeData, 'behavior'>;

const MAX_DESC = 60;

function truncate(text: string | undefined, max: number): string {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

/**
 * React Flow custom node for a standard behavior with event port handles.
 */
export const BehaviorNode: React.FC<NodeProps<BehaviorFlowNode>> = ({
  data,
  selected = false,
}) => {
  const handleSpacing = 24;
  const maxPorts = Math.max(data.emits.length, data.listens.length, 1);
  const bodyHeight = maxPorts * handleSpacing + 24;

  return (
    <FlowNodeShell
      selected={selected}
      nodeType="Behavior"
      headerColor="#10B981"
      className={cn('min-w-[170px]')}
    >
      {/* Listen handles (target, left) */}
      {data.listens.map((event: string, i: number) => (
        <Handle
          key={`listen-${event}`}
          type="target"
          position={Position.Left}
          id={`listen-${event}`}
          className="!bg-orange-500 !w-2 !h-2"
          style={{ top: 48 + i * handleSpacing }}
        />
      ))}

      <VStack gap="xs" style={{ minHeight: bodyHeight }}>
        <Typography variant="body" className="font-semibold select-none">
          {data.name}
        </Typography>

        {data.description && (
          <Box title={data.description.length > MAX_DESC ? data.description : undefined}>
            <Typography
              variant="caption"
              className="text-muted-foreground select-none"
            >
              {truncate(data.description, MAX_DESC)}
            </Typography>
          </Box>
        )}

        <Typography variant="caption" className="text-muted-foreground select-none">
          {data.stateCount} states
        </Typography>
      </VStack>

      {/* Emit handles (source, right) */}
      {data.emits.map((event: string, i: number) => (
        <Handle
          key={`emit-${event}`}
          type="source"
          position={Position.Right}
          id={`emit-${event}`}
          className="!bg-orange-500 !w-2 !h-2"
          style={{ top: 48 + i * handleSpacing }}
        />
      ))}
    </FlowNodeShell>
  );
};

BehaviorNode.displayName = 'BehaviorNode';
