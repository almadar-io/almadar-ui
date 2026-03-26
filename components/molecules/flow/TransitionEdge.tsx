'use client';
/**
 * TransitionEdge Component
 *
 * Custom React Flow edge for state machine transitions.
 * Uses a Bezier path with a FlowLabel pill at the midpoint showing
 * the event name. Guard (diamond) and effect indicators are shown
 * as small inline icons beside the label.
 */
import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type Edge, type EdgeProps } from '@xyflow/react';
import { cn } from '../../../lib/cn';
import { FlowLabel } from '../../atoms/flow/FlowLabel';
import { Box } from '../../atoms/Box';
import { CONNECTION_COLORS } from '../../atoms/avl/types';

/** Data shape for transition flow edges, extending Record<string, unknown> for React Flow v12. */
export interface TransitionEdgeData extends Record<string, unknown> {
  /** Triggering event name. */
  event: string;
  /** Whether this transition has a guard condition. */
  hasGuard?: boolean;
  /** Whether this transition has effects attached. */
  hasEffects?: boolean;
}

/** React Flow edge type for state machine transitions. */
export type TransitionFlowEdge = Edge<TransitionEdgeData, 'transition'>;

/**
 * React Flow custom edge that renders a Bezier curve with an event label pill.
 * Guard and effect presence are shown as small indicator icons.
 */
export const TransitionEdge: React.FC<EdgeProps<TransitionFlowEdge>> = ({
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

  const isBackward = targetX < sourceX;
  const connStyle = isBackward ? CONNECTION_COLORS.backward : CONNECTION_COLORS.forward;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: connStyle.color,
          strokeWidth: connStyle.width,
          strokeDasharray: connStyle.dash,
          ...style,
        }}
      />
      <EdgeLabelRenderer>
        <Box
          className={cn(
            'absolute pointer-events-all nodrag nopan',
            'flex items-center gap-1',
          )}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          {data?.hasGuard && (
            <Box
              className="w-3 h-3 rotate-45 border border-amber-500 bg-amber-500/10 shrink-0"
              title="Has guard"
            />
          )}

          <FlowLabel
            text={data?.event ?? ''}
            truncate={20}
            variant="default"
          />

          {data?.hasEffects && (
            <Box
              className="w-2.5 h-2.5 rounded-full bg-violet-500/80 shrink-0"
              title="Has effects"
            />
          )}
        </Box>
      </EdgeLabelRenderer>
    </>
  );
};

TransitionEdge.displayName = 'TransitionEdge';
