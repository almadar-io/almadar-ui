import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ExprNode, type ExprNodeData } from './ExprNode';

const nodeTypes = { exprNode: ExprNode };

function Wrapper({ data }: { data: ExprNodeData }) {
  return (
    <ReactFlowProvider>
      <div style={{ width: 600, height: 300 }}>
        <ReactFlow
          nodes={[{ id: '1', type: 'exprNode', position: { x: 200, y: 60 }, data }]}
          edges={[]}
          nodeTypes={nodeTypes}
          fitView
        />
      </div>
    </ReactFlowProvider>
  );
}

const meta: Meta<typeof Wrapper> = {
  title: 'Almadar UI/Molecules/Flow/ExprNode',
  component: Wrapper,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Arithmetic: Story = {
  args: {
    data: { operator: '+', namespace: 'arithmetic', operandCount: 2 },
  },
};

export const Comparison: Story = {
  args: {
    data: { operator: '>', namespace: 'comparison', operandCount: 2 },
  },
};

export const Logic: Story = {
  args: {
    data: { operator: 'and', namespace: 'logic', operandCount: 2 },
  },
};

export const StringOp: Story = {
  args: {
    data: { operator: 'concat', namespace: 'string', operandCount: 3 },
  },
};

export const ControlIf: Story = {
  args: {
    data: { operator: 'if', namespace: 'control', operandCount: 3 },
  },
};

export const AllNamespaces: Story = {
  render: () => (
    <ReactFlowProvider>
      <div style={{ width: 900, height: 400 }}>
        <ReactFlow
          nodes={[
            { id: '1', type: 'exprNode', position: { x: 20, y: 80 }, data: { operator: '+', namespace: 'arithmetic', operandCount: 2 } },
            { id: '2', type: 'exprNode', position: { x: 160, y: 80 }, data: { operator: '>', namespace: 'comparison', operandCount: 2 } },
            { id: '3', type: 'exprNode', position: { x: 300, y: 80 }, data: { operator: 'and', namespace: 'logic', operandCount: 2 } },
            { id: '4', type: 'exprNode', position: { x: 440, y: 80 }, data: { operator: 'concat', namespace: 'string', operandCount: 3 } },
            { id: '5', type: 'exprNode', position: { x: 580, y: 80 }, data: { operator: 'map', namespace: 'collection', operandCount: 2 } },
            { id: '6', type: 'exprNode', position: { x: 720, y: 80 }, data: { operator: 'if', namespace: 'control', operandCount: 3 } },
          ]}
          edges={[]}
          nodeTypes={nodeTypes}
          fitView
        />
      </div>
    </ReactFlowProvider>
  ),
};
