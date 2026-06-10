import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlBinding } from './AvlBinding';

const svgDecorator = (Story: React.ComponentType) => (
  <svg viewBox="0 0 200 200" width={200} height={200} xmlns="http://www.w3.org/2000/svg">
    <Story />
  </svg>
);

const meta: Meta<typeof AvlBinding> = {
  title: 'Avl/Atoms/AvlBinding',
  component: AvlBinding,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  decorators: [svgDecorator],
  argTypes: {
    x1: { control: 'number' },
    y1: { control: 'number' },
    x2: { control: 'number' },
    y2: { control: 'number' },
    label: { control: 'text' },
    color: { control: 'color' },
    opacity: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { x1: 40, y1: 40, x2: 160, y2: 160 },
};

export const Labeled: Story = {
  args: { x1: 40, y1: 80, x2: 160, y2: 120, label: 'entity.name' },
};
