'use client';
/**
 * FlowWire Component
 *
 * Provides style objects and an SVG `<path>` wrapper for flow-graph edges.
 * Wire colors come from the AVL CONNECTION_COLORS palette. The exported
 * `getFlowWireStyle` helper can be used independently of the component
 * (e.g. when integrating with React Flow edge renderers).
 */
import React from 'react';
import { cn } from '../../../lib/cn';
import { CONNECTION_COLORS } from '../avl/types';

export type FlowWireType = 'transition' | 'event' | 'data' | 'guard';
export type FlowWireStatus = 'valid' | 'invalid' | 'pending';

export interface FlowWireProps {
  /** Semantic wire category. Determines base color. */
  wireType?: FlowWireType;
  /** Validation or runtime status. 'invalid' overrides color to red. */
  status?: FlowWireStatus;
  /** Whether the wire shows a flowing dash animation. */
  animated?: boolean;
  /** SVG path data string (the "d" attribute). */
  d?: string;
  className?: string;
}

const wireTypeToColor: Record<FlowWireType, string> = {
  transition: CONNECTION_COLORS.forward.color,
  event: CONNECTION_COLORS.emitListen.color,
  data: '#3B82F6',
  guard: '#9B59B6',
};

const wireTypeToWidth: Record<FlowWireType, number> = {
  transition: CONNECTION_COLORS.forward.width,
  event: CONNECTION_COLORS.emitListen.width,
  data: 1.5,
  guard: 1.5,
};

const wireTypeToDash: Record<FlowWireType, string | undefined> = {
  transition: undefined,
  event: CONNECTION_COLORS.emitListen.dash,
  data: '5 3',
  guard: '3 3',
};

export interface FlowWireStyle {
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  animation?: string;
}

/**
 * Compute SVG path style props for a flow wire.
 *
 * @returns An object suitable for spreading onto an SVG `<path>` element's style.
 */
export function getFlowWireStyle(props: Pick<FlowWireProps, 'wireType' | 'status' | 'animated'>): FlowWireStyle {
  const { wireType = 'transition', status = 'valid', animated = false } = props;

  let stroke = wireTypeToColor[wireType];
  if (status === 'invalid') {
    stroke = 'var(--color-destructive, #EF4444)';
  }

  const strokeWidth = wireTypeToWidth[wireType];

  let strokeDasharray = wireTypeToDash[wireType];
  if (status === 'pending') {
    strokeDasharray = '6 4';
  }

  const animation = (animated || status === 'pending')
    ? 'flow-wire-dash 1s linear infinite'
    : undefined;

  return { stroke, strokeWidth, strokeDasharray, animation };
}

/**
 * SVG path element styled as a flow wire.
 * Pass the `d` prop with a path data string for rendering.
 */
export const FlowWire: React.FC<FlowWireProps> = ({
  wireType = 'transition',
  status = 'valid',
  animated = false,
  d,
  className,
}) => {
  const style = getFlowWireStyle({ wireType, status, animated });

  return (
    <path
      d={d}
      fill="none"
      stroke={style.stroke}
      strokeWidth={style.strokeWidth}
      strokeDasharray={style.strokeDasharray}
      className={cn(
        'transition-colors duration-150',
        (animated || status === 'pending') && 'animate-[flow-wire-dash_1s_linear_infinite]',
        className,
      )}
      style={style.animation ? { animation: style.animation } : undefined}
    />
  );
};

FlowWire.displayName = 'FlowWire';
