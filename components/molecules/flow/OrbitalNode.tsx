'use client';
/**
 * OrbitalNode Component
 *
 * Custom React Flow node for an orbital unit. Displays entity name,
 * trait/page counts, and per-event Handles for emit (source, right)
 * and listen (target, left) wiring.
 */
import React from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { cn } from '../../../lib/cn';
import { FlowNodeShell } from '../../atoms/flow/FlowNodeShell';
import { Typography } from '../../atoms/Typography';
import { VStack } from '../../atoms/Stack';

/** Data shape for orbital flow nodes, extending Record<string, unknown> for React Flow v12. */
export interface OrbitalNodeData extends Record<string, unknown> {
  /** Orbital unit name. */
  name: string;
  /** Primary entity name. */
  entityName: string;
  /** Number of traits attached. */
  traitCount: number;
  /** Number of pages attached. */
  pageCount: number;
  /** Events this orbital emits. */
  emits: string[];
  /** Events this orbital listens for. */
  listens: string[];
}

/** React Flow node type for orbital units. */
export type OrbitalFlowNode = Node<OrbitalNodeData, 'orbital'>;

/**
 * React Flow custom node for an orbital unit showing entity info,
 * trait/page stats, and per-event connection handles.
 */
export const OrbitalNode: React.FC<NodeProps<OrbitalFlowNode>> = ({
  data,
  selected = false,
}) => {
  const handleSpacing = 24;
  const maxPorts = Math.max(data.emits.length, data.listens.length, 1);
  const bodyHeight = maxPorts * handleSpacing + 24;

  return (
    <FlowNodeShell
      selected={selected}
      nodeType="Orbital"
      headerColor="var(--color-primary)"
      className={cn('min-w-[180px]')}
    >
      {/* Listen handles (target, left side) */}
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
        <Typography variant="caption" className="text-muted-foreground select-none">
          {data.entityName}
        </Typography>
        <Typography variant="caption" className="text-muted-foreground select-none">
          {data.traitCount} traits, {data.pageCount} pages
        </Typography>

        {/* Port labels */}
        {data.listens.length > 0 && (
          <VStack gap="none" className="mt-1">
            {data.listens.map((event: string) => (
              <Typography
                key={event}
                variant="caption"
                className="text-orange-500 select-none text-left"
              >
                {event}
              </Typography>
            ))}
          </VStack>
        )}
        {data.emits.length > 0 && (
          <VStack gap="none" className="mt-1">
            {data.emits.map((event: string) => (
              <Typography
                key={event}
                variant="caption"
                className="text-orange-500 select-none text-right"
              >
                {event}
              </Typography>
            ))}
          </VStack>
        )}
      </VStack>

      {/* Emit handles (source, right side) */}
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

OrbitalNode.displayName = 'OrbitalNode';
