import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlSExpr } from './AvlSExpr';

const svgDecorator = (Story: React.ComponentType) => (
  <svg viewBox="0 0 200 200" width={200} height={200} xmlns="http://www.w3.org/2000/svg">
    <Story />
  </svg>
);

const meta: Meta<typeof AvlSExpr> = {
  title: 'Avl/Atoms/AvlSExpr',
  component: AvlSExpr,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  decorators: [svgDecorator],
  argTypes: {
    x: { control: 'number' },
    y: { control: 'number' },
    width: { control: { type: 'range', min: 60, max: 200 } },
    height: { control: { type: 'range', min: 40, max: 160 } },
    label: { control: 'text' },
    color: { control: 'color' },
    opacity: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { x: 30, y: 60, width: 140, height: 80 },
};

export const Labeled: Story = {
  args: { x: 30, y: 60, width: 140, height: 80, label: '(+ 1 @entity.count)' },
};
