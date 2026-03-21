import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlOrbital } from './AvlOrbital';

const svgDecorator = (Story: React.ComponentType) => (
  <svg viewBox="0 0 300 300" width={300} height={300} xmlns="http://www.w3.org/2000/svg">
    <Story />
  </svg>
);

const meta: Meta<typeof AvlOrbital> = {
  title: 'Avl/Atoms/AvlOrbital',
  component: AvlOrbital,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  decorators: [svgDecorator],
  argTypes: {
    cx: { control: 'number' },
    cy: { control: 'number' },
    r: { control: 'number' },
    label: { control: 'text' },
    color: { control: 'color' },
    opacity: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { cx: 150, cy: 150, r: 80 },
};

export const Large: Story = {
  args: { cx: 150, cy: 150, r: 120 },
};

export const Labeled: Story = {
  args: { cx: 150, cy: 150, r: 80, label: 'TodoManager' },
};
