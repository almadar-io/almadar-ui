import type { Meta, StoryObj } from '@storybook/react';
import { CareIndicator } from './CareIndicator';

const meta: Meta<typeof CareIndicator> = {
  title: 'Clients/Winning-11/Atoms/CareIndicator',
  component: CareIndicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['communication', 'payment', 'delivery', 'feedback'],
    },
    urgency: {
      control: 'select',
      options: ['low', 'medium', 'high'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Communication: Story = {
  args: {
    type: 'communication',
    urgency: 'medium',
  },
};

export const Payment: Story = {
  args: {
    type: 'payment',
    urgency: 'high',
  },
};

export const Delivery: Story = {
  args: {
    type: 'delivery',
    urgency: 'low',
  },
};

export const Feedback: Story = {
  args: {
    type: 'feedback',
    urgency: 'low',
  },
};

export const HighUrgency: Story = {
  args: {
    type: 'payment',
    urgency: 'high',
  },
};

export const CustomTooltip: Story = {
  args: {
    type: 'communication',
    urgency: 'medium',
    tooltip: 'Last contacted 2 weeks ago',
  },
};

export const Small: Story = {
  args: {
    type: 'communication',
    urgency: 'medium',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    type: 'payment',
    urgency: 'high',
    size: 'lg',
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="flex gap-4">
      <CareIndicator type="communication" urgency="low" />
      <CareIndicator type="payment" urgency="medium" />
      <CareIndicator type="delivery" urgency="high" />
      <CareIndicator type="feedback" urgency="low" />
    </div>
  ),
};

export const AllUrgencies: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Low:</span>
        <CareIndicator type="communication" urgency="low" />
        <CareIndicator type="payment" urgency="low" />
        <CareIndicator type="delivery" urgency="low" />
        <CareIndicator type="feedback" urgency="low" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Medium:</span>
        <CareIndicator type="communication" urgency="medium" />
        <CareIndicator type="payment" urgency="medium" />
        <CareIndicator type="delivery" urgency="medium" />
        <CareIndicator type="feedback" urgency="medium" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">High:</span>
        <CareIndicator type="communication" urgency="high" />
        <CareIndicator type="payment" urgency="high" />
        <CareIndicator type="delivery" urgency="high" />
        <CareIndicator type="feedback" urgency="high" />
      </div>
    </div>
  ),
};
