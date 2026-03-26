'use client';
/**
 * EventWireEdge Component
 *
 * Custom React Flow edge for event wiring between orbitals/behaviors.
 * Renders a dashed orange Bezier path (from CONNECTION_COLORS.emitListen)
 * with a FlowLabel pill at the midpoint. Incompatible wires turn red.
 */
import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type Edge, type EdgeProps } from '@xyflow/react';
import { cn } from '../../../lib/cn';
import { FlowLabel } from '../../atoms/flow/FlowLabel';
import { Box } from '../../atoms/Box';
import { CONNECTION_COLORS } from '../../atoms/avl/types';

/** Data shape for event wire flow edges, extending Record<string, unknown> for React Flow v12. */
export interface EventWireEdgeData extends Record<string, unknown> {
  /** Event name being wired. */
  event: string;
  /** Whether emitter and listener schemas are compatible. */
  compatible?: boolean;
}

/** React Flow edge type for emit/listen event wiring. */
export type EventWireFlowEdge = Edge<EventWireEdgeData, 'eventWire'>;

/**
 * React Flow custom edge for emit/listen event wiring.
 * Dashed orange when compatible, dashed red when incompatible.
 */
export const EventWireEdge: React.FC<EdgeProps<EventWireFlowEdge>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const isCompatible = data?.compatible !== false;
  const wireColor = isCompatible
    ? CONNECTION_COLORS.emitListen.color
    : '#EF4444';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: wireColor,
          strokeWidth: CONNECTION_COLORS.emitListen.width,
          strokeDasharray: CONNECTION_COLORS.emitListen.dash,
          ...style,
        }}
      />
      <EdgeLabelRenderer>
        <Box
          className={cn(
            'absolute pointer-events-all nodrag nopan',
            'flex items-center',
          )}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          <FlowLabel
            text={data?.event ?? ''}
            truncate={24}
            variant={isCompatible ? 'primary' : 'error'}
          />
        </Box>
      </EdgeLabelRenderer>
    </>
  );
};

EventWireEdge.displayName = 'EventWireEdge';
