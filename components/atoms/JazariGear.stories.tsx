import type { Meta, StoryObj } from '@storybook/react';
import { JazariGear } from './JazariGear';

const meta: Meta<typeof JazariGear> = {
  title: 'Atoms/JazariGear',
  component: JazariGear,
  decorators: [
    (Story) => (
      <svg width={200} height={200} viewBox="0 0 200 200" style={{ background: '#1a1a2e' }}>
        <defs>
          <filter id="jazari-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <Story />
      </svg>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof JazariGear>;

export const Default: Story = {
  args: {
    cx: 100,
    cy: 100,
    radius: 35,
    label: 'idle',
    isInitial: false,
    isTerminal: false,
  },
};

export const Initial: Story = {
  args: {
    cx: 100,
    cy: 100,
    radius: 35,
    label: 'draft',
    isInitial: true,
    isTerminal: false,
  },
};

export const Terminal: Story = {
  args: {
    cx: 100,
    cy: 100,
    radius: 35,
    label: 'completed',
    isInitial: false,
    isTerminal: true,
  },
};

export const ArabicLabel: Story = {
  args: {
    cx: 100,
    cy: 100,
    radius: 35,
    label: 'خامل',
    isInitial: true,
    isTerminal: false,
  },
};

export const LongLabel: Story = {
  args: {
    cx: 100,
    cy: 100,
    radius: 35,
    label: 'awaiting_review',
    isInitial: false,
    isTerminal: false,
  },
};
