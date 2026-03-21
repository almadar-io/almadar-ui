import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlTransition } from './AvlTransition';

const svgDecorator = (Story: React.ComponentType) => (
  <svg viewBox="0 0 200 200" width={200} height={200} xmlns="http://www.w3.org/2000/svg">
    <Story />
  </svg>
);

const meta: Meta<typeof AvlTransition> = {
  title: 'Avl/Atoms/AvlTransition',
  component: AvlTransition,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  decorators: [svgDecorator],
  argTypes: {
    x1: { control: 'number' },
    y1: { control: 'number' },
    x2: { control: 'number' },
    y2: { control: 'number' },
    curved: { control: 'boolean' },
    label: { control: 'text' },
    color: { control: 'color' },
    opacity: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { x1: 20, y1: 100, x2: 180, y2: 100 },
};

export const Curved: Story = {
  args: { x1: 20, y1: 100, x2: 180, y2: 100, curved: true },
};

export const Labeled: Story = {
  args: { x1: 20, y1: 100, x2: 180, y2: 100, curved: true, label: 'SUBMIT' },
};
