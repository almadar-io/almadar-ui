import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlTransitionLane } from './AvlTransitionLane';

const svgDecorator = (Story: React.ComponentType) => (
  <svg viewBox="0 0 400 120" width={400} height={120} xmlns="http://www.w3.org/2000/svg">
    <Story />
  </svg>
);

const meta: Meta<typeof AvlTransitionLane> = {
  title: 'Avl/Molecules/AvlTransitionLane',
  component: AvlTransitionLane,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  decorators: [svgDecorator],
  argTypes: {
    color: { control: 'color' },
    isBackward: { control: 'boolean' },
    isSelfLoop: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    x: 10, y: 10, event: 'ADD_ITEM', width: 300,
    effects: [{ type: 'persist' }, { type: 'render-ui' }],
  },
};

export const WithGuard: Story = {
  args: {
    x: 10, y: 10, event: 'SAVE', guard: 'isValid?', width: 300,
    effects: [{ type: 'set' }, { type: 'render-ui' }],
  },
};

export const Backward: Story = {
  args: {
    x: 10, y: 10, event: 'RETRY', isBackward: true, width: 300,
    effects: [{ type: 'fetch' }],
  },
};

export const SelfLoop: Story = {
  args: {
    x: 10, y: 10, event: 'REFRESH', isSelfLoop: true, width: 300,
    effects: [{ type: 'fetch' }, { type: 'render-ui' }],
  },
};

export const ManyEffects: Story = {
  args: {
    x: 10, y: 10, event: 'SUBMIT', width: 380,
    effects: [
      { type: 'set' }, { type: 'persist' }, { type: 'emit' },
      { type: 'notify' }, { type: 'navigate' }, { type: 'render-ui' },
      { type: 'log' },
    ],
  },
};
