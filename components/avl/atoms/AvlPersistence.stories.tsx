import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlPersistence } from './AvlPersistence';

const svgDecorator = (Story: React.ComponentType) => (
  <svg viewBox="0 0 200 200" width={200} height={200} xmlns="http://www.w3.org/2000/svg">
    <Story />
  </svg>
);

const meta: Meta<typeof AvlPersistence> = {
  title: 'Avl/Atoms/AvlPersistence',
  component: AvlPersistence,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  decorators: [svgDecorator],
  argTypes: {
    x: { control: 'number' },
    y: { control: 'number' },
    kind: {
      control: 'select',
      options: ['persistent', 'runtime', 'singleton', 'instance'],
    },
    size: { control: { type: 'range', min: 10, max: 60 } },
    label: { control: 'text' },
    color: { control: 'color' },
    opacity: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Persistent: Story = {
  args: { x: 100, y: 100, kind: 'persistent', label: 'persistent' },
};

export const Runtime: Story = {
  args: { x: 100, y: 100, kind: 'runtime', label: 'runtime' },
};

export const Singleton: Story = {
  args: { x: 100, y: 100, kind: 'singleton', label: 'singleton' },
};

export const Instance: Story = {
  args: { x: 100, y: 100, kind: 'instance', label: 'instance' },
};
