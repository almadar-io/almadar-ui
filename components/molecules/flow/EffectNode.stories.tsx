import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { EffectNode, type EffectNodeData } from './EffectNode';

const nodeTypes = { effectNode: EffectNode };

function Wrapper({ data }: { data: EffectNodeData }) {
  return (
    <ReactFlowProvider>
      <div style={{ width: 600, height: 300 }}>
        <ReactFlow
          nodes={[{ id: '1', type: 'effectNode', position: { x: 200, y: 80 }, data }]}
          edges={[]}
          nodeTypes={nodeTypes}
          fitView
        />
      </div>
    </ReactFlowProvider>
  );
}

const meta: Meta<typeof Wrapper> = {
  title: 'Almadar UI/Molecules/Flow/EffectNode',
  component: Wrapper,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const RenderUi: Story = {
  args: {
    data: { effectType: 'render-ui', args: 'pattern: card-list' },
  },
};

export const SetEffect: Story = {
  args: {
    data: { effectType: 'set', args: 'status = "active"' },
  },
};

export const EmitEffect: Story = {
  args: {
    data: { effectType: 'emit', args: 'ITEM_ADDED' },
  },
};

export const PersistEffect: Story = {
  args: {
    data: { effectType: 'persist' },
  },
};

export const FetchEffect: Story = {
  args: {
    data: { effectType: 'fetch', args: '/api/items' },
  },
};

export const AllCategories: Story = {
  render: () => (
    <ReactFlowProvider>
      <div style={{ width: 900, height: 500 }}>
        <ReactFlow
          nodes={[
            { id: '1', type: 'effectNode', position: { x: 20, y: 40 }, data: { effectType: 'render-ui', category: 'ui' } },
            { id: '2', type: 'effectNode', position: { x: 200, y: 40 }, data: { effectType: 'navigate', category: 'ui' } },
            { id: '3', type: 'effectNode', position: { x: 380, y: 40 }, data: { effectType: 'set', category: 'data' } },
            { id: '4', type: 'effectNode', position: { x: 560, y: 40 }, data: { effectType: 'persist', category: 'data' } },
            { id: '5', type: 'effectNode', position: { x: 20, y: 200 }, data: { effectType: 'emit', category: 'communication' } },
            { id: '6', type: 'effectNode', position: { x: 200, y: 200 }, data: { effectType: 'call-service', category: 'communication' } },
            { id: '7', type: 'effectNode', position: { x: 380, y: 200 }, data: { effectType: 'spawn', category: 'lifecycle' } },
            { id: '8', type: 'effectNode', position: { x: 560, y: 200 }, data: { effectType: 'if', category: 'control' } },
          ]}
          edges={[]}
          nodeTypes={nodeTypes}
          fitView
        />
      </div>
    </ReactFlowProvider>
  ),
};
