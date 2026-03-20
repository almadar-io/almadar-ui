import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatCard } from './StatCard';
import { HStack } from './Stack';

const meta: Meta<typeof StatCard> = {
  title: 'Atoms/StatCard',
  component: StatCard,
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
      <StatCard value="128" label="Small" size="sm" />
      <StatCard value="256" label="Medium" size="md" />
      <StatCard value="512" label="Large" size="lg" />
    </HStack>
  ),
};

export const InContext: Story = {
  render: () => (
    <HStack gap="xl" align="center">
      <StatCard value="93" label="Behaviors" />
      <StatCard value="18" label="Domains" />
      <StatCard value="7" label="Shells" />
    </HStack>
  ),
};
