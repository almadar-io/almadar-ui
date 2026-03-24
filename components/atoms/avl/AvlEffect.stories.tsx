import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlEffect } from './AvlEffect';
import type { AvlEffectType } from './types';

const svgDecorator = (Story: React.ComponentType) => (
  <svg viewBox="0 0 200 200" width={200} height={200} xmlns="http://www.w3.org/2000/svg">
    <Story />
  </svg>
);

const ALL_EFFECT_TYPES: AvlEffectType[] = [
  'render-ui', 'set', 'persist',
  'fetch', 'emit', 'navigate',
  'notify', 'call-service', 'spawn',
  'despawn', 'do', 'if',
  'log',
];

const meta: Meta<typeof AvlEffect> = {
  title: 'Avl/Atoms/AvlEffect',
  component: AvlEffect,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  decorators: [svgDecorator],
  argTypes: {
    x: { control: 'number' },
    y: { control: 'number' },
    effectType: {
      control: 'select',
      options: ALL_EFFECT_TYPES,
    },
    size: { control: 'number' },
    label: { control: 'text' },
    color: { control: 'color' },
    showBackground: { control: 'boolean' },
    opacity: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const RenderUI: Story = {
  args: { x: 100, y: 100, effectType: 'render-ui', size: 12 },
};

export const Set: Story = {
  args: { x: 100, y: 100, effectType: 'set', size: 12 },
};

export const Persist: Story = {
  args: { x: 100, y: 100, effectType: 'persist', size: 12 },
};

export const Emit: Story = {
  args: { x: 100, y: 100, effectType: 'emit', size: 12 },
};

export const Navigate: Story = {
  args: { x: 100, y: 100, effectType: 'navigate', size: 12 },
};

export const WithBackground: Story = {
  args: { x: 100, y: 100, effectType: 'render-ui', size: 16, showBackground: true, label: 'render-ui' },
};

export const LargeSize: Story = {
  args: { x: 100, y: 100, effectType: 'persist', size: 20, label: 'persist' },
};

export const AllEffects: Story = {
  decorators: [
    (Story: React.ComponentType) => (
      <svg viewBox="0 0 200 280" width={200} height={280} xmlns="http://www.w3.org/2000/svg">
        <Story />
      </svg>
    ),
  ],
  render: () => (
    <g>
      {ALL_EFFECT_TYPES.map((type, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const cx = 35 + col * 60;
        const cy = 30 + row * 50;
        return (
          <AvlEffect
            key={type}
            x={cx}
            y={cy}
            effectType={type}
            size={10}
            label={type}
          />
        );
      })}
    </g>
  ),
};

export const AllEffectsWithBackground: Story = {
  decorators: [
    (Story: React.ComponentType) => (
      <svg viewBox="0 0 280 320" width={280} height={320} xmlns="http://www.w3.org/2000/svg">
        <Story />
      </svg>
    ),
  ],
  render: () => (
    <g>
      {ALL_EFFECT_TYPES.map((type, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const cx = 50 + col * 80;
        const cy = 40 + row * 60;
        return (
          <AvlEffect
            key={type}
            x={cx}
            y={cy}
            effectType={type}
            size={16}
            label={type}
            showBackground
          />
        );
      })}
    </g>
  ),
};
