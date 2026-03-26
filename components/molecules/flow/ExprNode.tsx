'use client';
/**
 * ExprNode Component
 *
 * Custom React Flow node for an S-expression operator.
 * Shows the operator name in namespace-colored FlowNodeShell,
 * with one target Handle per operand (left, staggered) and
 * one source Handle for the result (right).
 */
import React from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { cn } from '../../../lib/cn';
import { FlowNodeShell } from '../../atoms/flow/FlowNodeShell';
import { Typography } from '../../atoms/Typography';
import { AVL_OPERATOR_COLORS, type AvlOperatorNamespace } from '../../atoms/avl/types';

/** Data shape for expression flow nodes, extending Record<string, unknown> for React Flow v12. */
export interface ExprNodeData extends Record<string, unknown> {
  /** Operator name (e.g. "+", "concat", "if"). */
  operator: string;
  /** Operator namespace for color coding. */
  namespace?: AvlOperatorNamespace;
  /** Number of operand inputs. */
  operandCount: number;
}

/** React Flow node type for S-expression operator nodes. */
export type ExprFlowNode = Node<ExprNodeData, 'expr'>;

/**
 * React Flow custom node visualising an S-expression operator.
 * Operand handles fan out vertically on the left; result exits right.
 */
export const ExprNode: React.FC<NodeProps<ExprFlowNode>> = ({
  data,
  selected = false,
}) => {
  const ns = data.namespace ?? 'arithmetic';
  const headerColor = AVL_OPERATOR_COLORS[ns];
  const handleSpacing = 22;
  const bodyHeight = Math.max(data.operandCount, 1) * handleSpacing + 12;

  return (
    <FlowNodeShell
      selected={selected}
      nodeType="Expr"
      headerColor={headerColor}
      className={cn('min-w-[100px]')}
    >
      {/* Operand handles (target, left, staggered) */}
      {Array.from({ length: data.operandCount }, (_: unknown, i: number) => (
        <Handle
          key={`op-${i}`}
          type="target"
          position={Position.Left}
          id={`operand-${i}`}
          className="!w-2 !h-2"
          style={{
            top: 40 + i * handleSpacing,
            backgroundColor: headerColor,
          }}
        />
      ))}

      <Typography
        variant="body"
        className="font-mono font-bold text-center select-none"
        style={{ color: headerColor, minHeight: bodyHeight }}
      >
        {data.operator}
      </Typography>

      {/* Result handle (source, right) */}
      <Handle
        type="source"
        position={Position.Right}
        id="result"
        className="!w-2 !h-2"
        style={{ backgroundColor: headerColor }}
      />
    </FlowNodeShell>
  );
};

ExprNode.displayName = 'ExprNode';
