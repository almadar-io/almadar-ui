import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { OrbitalNode, type OrbitalNodeData } from './OrbitalNode';

const nodeTypes = { orbitalNode: OrbitalNode };

function Wrapper({ data }: { data: OrbitalNodeData }) {
  return (
    <ReactFlowProvider>
      <div style={{ width: 700, height: 400 }}>
        <ReactFlow
          nodes={[{ id: '1', type: 'orbitalNode', position: { x: 200, y: 50 }, data }]}
          edges={[]}
          nodeTypes={nodeTypes}
          fitView
        />
      </div>
    </ReactFlowProvider>
  );
}

const meta: Meta<typeof Wrapper> = {
  title: 'Almadar UI/Molecules/Flow/OrbitalNode',
  component: Wrapper,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: {
      name: 'TodoManager',
      entityName: 'Todo',
      traitCount: 2,
      pageCount: 1,
      emits: ['TODO_CREATED', 'TODO_DELETED'],
      listens: ['FILTER_CHANGED'],
    },
  },
};

export const Minimal: Story = {
  args: {
    data: {
      name: 'UserProfile',
      entityName: 'User',
      traitCount: 1,
      pageCount: 1,
      emits: [],
      listens: [],
    },
  },
};

export const ManyEvents: Story = {
  args: {
    data: {
      name: 'CartManager',
      entityName: 'CartItem',
      traitCount: 3,
      pageCount: 2,
      emits: ['ITEM_ADDED', 'ITEM_REMOVED', 'CART_CLEARED', 'CHECKOUT_STARTED'],
      listens: ['PRODUCT_SELECTED', 'QUANTITY_CHANGED'],
    },
  },
};
