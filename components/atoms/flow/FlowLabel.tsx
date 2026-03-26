'use client';
/**
 * FlowLabel Component
 *
 * A pill-shaped label used on flow wires (edges) to annotate transitions,
 * events, or guards. Supports truncation with a native title tooltip and
 * semantic color variants.
 */
import React from 'react';
import { cn } from '../../../lib/cn';
import { Badge } from '../Badge';

export type FlowLabelVariant = 'default' | 'primary' | 'warning' | 'error';

export interface FlowLabelProps {
  /** Text content of the label. */
  text: string;
  /** Max visible character count before truncation. Omit to show full text. */
  truncate?: number;
  /** Color variant mapping to Badge semantics. */
  variant?: FlowLabelVariant;
  className?: string;
}

const variantToBadge: Record<FlowLabelVariant, 'neutral' | 'primary' | 'warning' | 'danger'> = {
  default: 'neutral',
  primary: 'primary',
  warning: 'warning',
  error: 'danger',
};

/**
 * Badge-based pill label for annotating wires in a flow graph.
 * Long text is truncated with an ellipsis and full text appears on hover via title.
 */
export const FlowLabel: React.FC<FlowLabelProps> = ({
  text,
  truncate,
  variant = 'default',
  className,
}) => {
  const isTruncated = truncate != null && text.length > truncate;
  const display = isTruncated ? `${text.slice(0, truncate)}...` : text;

  return (
    <Badge
      variant={variantToBadge[variant]}
      size="sm"
      className={cn('max-w-[180px] cursor-default', className)}
      title={isTruncated ? text : undefined}
    >
      {display}
    </Badge>
  );
};

FlowLabel.displayName = 'FlowLabel';
