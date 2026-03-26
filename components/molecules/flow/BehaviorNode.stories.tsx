import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BehaviorNode, type BehaviorNodeData } from './BehaviorNode';

const nodeTypes = { behaviorNode: BehaviorNode };

function Wrapper({ data }: { data: BehaviorNodeData }) {
  return (
    <ReactFlowProvider>
      <div style={{ width: 700, height: 400 }}>
        <ReactFlow
          nodes={[{ id: '1', type: 'behaviorNode', position: { x: 200, y: 50 }, data }]}
          edges={[]}
          nodeTypes={nodeTypes}
          fitView
        />
      </div>
    </ReactFlowProvider>
  );
}

const meta: Meta<typeof Wrapper> = {
  title: 'Almadar UI/Molecules/Flow/BehaviorNode',
  component: Wrapper,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: {
      name: 'std-cart',
      description: 'Shopping cart behavior with add, remove, and quantity management.',
      stateCount: 4,
      emits: ['CART_UPDATED'],
      listens: ['PRODUCT_ADDED'],
    },
  },
};

export const NoDescription: Story = {
  args: {
    data: {
      name: 'std-auth',
      stateCount: 3,
      emits: ['AUTH_SUCCESS', 'AUTH_FAILURE'],
      listens: [],
    },
  },
};

export const LongDescription: Story = {
  args: {
    data: {
      name: 'std-location-picker',
      description: 'Full interactive map-based location picker with geocoding, reverse geocoding, search, and address validation workflow.',
      stateCount: 6,
      emits: ['LOCATION_SELECTED'],
      listens: ['MAP_READY'],
    },
  },
};
