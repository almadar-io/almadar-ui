import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlTrait } from './AvlTrait';

const svgDecorator = (Story: React.ComponentType) => (
  <svg viewBox="0 0 200 200" width={200} height={200} xmlns="http://www.w3.org/2000/svg">
    <Story />
  </svg>
);

const meta: Meta<typeof AvlTrait> = {
  title: 'Avl/Atoms/AvlTrait',
  component: AvlTrait,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  decorators: [svgDecorator],
  argTypes: {
    cx: { control: 'number' },
    cy: { control: 'number' },
    rx: { control: 'number' },
    ry: { control: 'number' },
    rotation: { control: { type: 'range', min: 0, max: 360, step: 5 } },
    label: { control: 'text' },
    color: { control: 'color' },
    opacity: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { cx: 100, cy: 100 },
};

export const Rotated: Story = {
  args: { cx: 100, cy: 100, rotation: 30 },
};

export const Labeled: Story = {
  args: { cx: 100, cy: 100, rx: 70, ry: 35, label: 'Lifecycle' },
};
