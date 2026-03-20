import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarketingStatCard } from './StatCard';
import { HStack } from './Stack';

const meta: Meta<typeof MarketingStatCard> = {
  title: 'Atoms/MarketingStatCard',
  component: MarketingStatCard,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '42',
    label: 'Active Users',
  },
};

export const Small: Story = {
  args: {
    value: '128',
    label: 'Downloads',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    value: '99.9%',
    label: 'Uptime',
    size: 'lg',
  },
};

export const AllSizes: Story = {
  render: () => (
    <HStack gap="xl" align="end">
      <MarketingStatCard value="128" label="Small" size="sm" />
      <MarketingStatCard value="256" label="Medium" size="md" />
      <MarketingStatCard value="512" label="Large" size="lg" />
    </HStack>
  ),
};

export const InContext: Story = {
  render: () => (
    <HStack gap="xl" align="center">
      <MarketingStatCard value="93" label="Behaviors" />
      <MarketingStatCard value="18" label="Domains" />
      <MarketingStatCard value="7" label="Shells" />
    </HStack>
  ),
};
