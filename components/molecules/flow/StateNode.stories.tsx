import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { State } from '@almadar/core';
import { StateNode } from './StateNode';

const nodeTypes = { stateNode: StateNode };

function Wrapper({ data }: { data: State & Record<string, unknown> }) {
  return (
    <ReactFlowProvider>
      <div style={{ width: 600, height: 300 }}>
        <ReactFlow
          nodes={[{ id: '1', type: 'stateNode', position: { x: 200, y: 80 }, data }]}
          edges={[]}
          nodeTypes={nodeTypes}
          fitView
        />
      </div>
    </ReactFlowProvider>
  );
}

const meta: Meta<typeof Wrapper> = {
  title: 'Almadar UI/Molecules/Flow/StateNode',
  component: Wrapper,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { data: { name: 'Idle' } },
};

export const Initial: Story = {
  args: { data: { name: 'Idle', isInitial: true } },
};

export const Terminal: Story = {
  args: { data: { name: 'Done', isTerminal: true } },
};

export const Selected: Story = {
  render: () => (
    <ReactFlowProvider>
      <div style={{ width: 600, height: 300 }}>
        <ReactFlow
          nodes={[
            { id: '1', type: 'stateNode', position: { x: 200, y: 80 }, data: { name: 'Active' }, selected: true },
          ]}
          edges={[]}
          nodeTypes={nodeTypes}
          fitView
        />
      </div>
    </ReactFlowProvider>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <ReactFlowProvider>
      <div style={{ width: 800, height: 400 }}>
        <ReactFlow
          nodes={[
            { id: '1', type: 'stateNode', position: { x: 50, y: 120 }, data: { name: 'Idle', isInitial: true } },
            { id: '2', type: 'stateNode', position: { x: 250, y: 120 }, data: { name: 'Loading' } },
            { id: '3', type: 'stateNode', position: { x: 450, y: 120 }, data: { name: 'Done', isTerminal: true } },
          ]}
          edges={[]}
          nodeTypes={nodeTypes}
          fitView
        />
      </div>
    </ReactFlowProvider>
  ),
};
