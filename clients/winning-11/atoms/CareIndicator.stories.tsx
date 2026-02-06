import type { Meta, StoryObj } from '@storybook/react-vite';
import { CareIndicator } from './CareIndicator';

const meta: Meta<typeof CareIndicator> = {
  title: 'Clients/Winning-11/Atoms/CareIndicator',
  component: CareIndicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    careType: {
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
    careType: 'communication',
    urgency: 'medium',
  },
};

export const Payment: Story = {
  args: {
    careType: 'payment',
    urgency: 'high',
  },
};

export const Delivery: Story = {
  args: {
    careType: 'delivery',
    urgency: 'low',
  },
};

export const Feedback: Story = {
  args: {
    careType: 'feedback',
    urgency: 'low',
  },
};

export const HighUrgency: Story = {
  args: {
    careType: 'payment',
    urgency: 'high',
  },
};

export const CustomTooltip: Story = {
  args: {
    careType: 'communication',
    urgency: 'medium',
    tooltip: 'Last contacted 2 weeks ago',
  },
};

export const Small: Story = {
  args: {
    careType: 'communication',
    urgency: 'medium',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    careType: 'payment',
    urgency: 'high',
    size: 'lg',
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="flex gap-4">
      <CareIndicator careType="communication" urgency="low" />
      <CareIndicator careType="payment" urgency="medium" />
      <CareIndicator careType="delivery" urgency="high" />
      <CareIndicator careType="feedback" urgency="low" />
    </div>
  ),
};

export const AllUrgencies: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Low:</span>
        <CareIndicator careType="communication" urgency="low" />
        <CareIndicator careType="payment" urgency="low" />
        <CareIndicator careType="delivery" urgency="low" />
        <CareIndicator careType="feedback" urgency="low" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">Medium:</span>
        <CareIndicator careType="communication" urgency="medium" />
        <CareIndicator careType="payment" urgency="medium" />
        <CareIndicator careType="delivery" urgency="medium" />
        <CareIndicator careType="feedback" urgency="medium" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm">High:</span>
        <CareIndicator careType="communication" urgency="high" />
        <CareIndicator careType="payment" urgency="high" />
        <CareIndicator careType="delivery" urgency="high" />
        <CareIndicator careType="feedback" urgency="high" />
      </div>
    </div>
  ),
};
