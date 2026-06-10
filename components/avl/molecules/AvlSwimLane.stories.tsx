import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlSwimLane } from './AvlSwimLane';

const meta: Meta<typeof AvlSwimLane> = {
  title: 'Avl/Molecules/AvlSwimLane',
  component: AvlSwimLane,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 600 }}>
      <svg viewBox="0 0 600 200" width={600} height={200}>
        <AvlSwimLane {...args}>
          <rect x={20} y={40} width={320} height={120} rx={8} fill="#3B82F6" fillOpacity={0.05} stroke="#3B82F6" strokeWidth={0.5} strokeOpacity={0.2} />
          <text x={180} y={105} textAnchor="middle" fontSize={12} fill="#666">State Machine Area</text>
        </AvlSwimLane>
      </svg>
    </div>
  ),
  args: {
    listenedEvents: ['ADD_TO_CART'],
    emittedEvents: ['CHECKOUT_COMPLETE'],
    centerWidth: 360,
    height: 200,
  },
};

export const MultipleEvents: Story = {
  render: (args) => (
    <div style={{ width: 600 }}>
      <svg viewBox="0 0 600 240" width={600} height={240}>
        <AvlSwimLane {...args}>
          <rect x={20} y={40} width={320} height={160} rx={8} fill="#3B82F6" fillOpacity={0.05} stroke="#3B82F6" strokeWidth={0.5} strokeOpacity={0.2} />
          <text x={180} y={125} textAnchor="middle" fontSize={12} fill="#666">State Machine Area</text>
        </AvlSwimLane>
      </svg>
    </div>
  ),
  args: {
    listenedEvents: ['ADD_TO_CART', 'PRICE_UPDATED', 'STOCK_CHANGED'],
    emittedEvents: ['CHECKOUT_COMPLETE', 'CART_CLEARED'],
    centerWidth: 360,
    height: 240,
  },
};

export const NoExternalEvents: Story = {
  render: (args) => (
    <div style={{ width: 600 }}>
      <svg viewBox="0 0 600 200" width={600} height={200}>
        <AvlSwimLane {...args}>
          <rect x={20} y={40} width={320} height={120} rx={8} fill="#6B7280" fillOpacity={0.05} stroke="#6B7280" strokeWidth={0.5} strokeOpacity={0.2} />
          <text x={180} y={105} textAnchor="middle" fontSize={12} fill="#666">Self-Contained Trait</text>
        </AvlSwimLane>
      </svg>
    </div>
  ),
  args: {
    listenedEvents: [],
    emittedEvents: [],
    centerWidth: 360,
    height: 200,
  },
};
