import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeatureCard } from './FeatureCard';
import { HStack } from '../atoms/Stack';

const meta: Meta<typeof FeatureCard> = {
  title: 'Marketing/Molecules/FeatureCard',
  component: FeatureCard,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'bordered', 'elevated', 'interactive'],
    },
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
    title: 'Fast Compilation',
    description:
      'Compile your schemas to full-stack applications in seconds with the Rust-based compiler.',
  },
  decorators: [
    (Story) => (
      <HStack className="w-80">
        <Story />
      </HStack>
    ),
  ],
};

export const WithIcon: Story = {
  args: {
    icon: 'shield-check',
    title: 'Type Safe',
    description:
      'End-to-end type safety from schema definition to generated application code.',
  },
  decorators: [
    (Story) => (
      <HStack className="w-80">
        <Story />
      </HStack>
    ),
  ],
};

export const WithLink: Story = {
  args: {
    icon: 'book-open',
    title: 'Documentation',
    description: 'Comprehensive docs covering every aspect of the Orbital language.',
    href: 'https://docs.almadar.io',
    linkLabel: 'Read the docs',
  },
  decorators: [
    (Story) => (
      <HStack className="w-80">
        <Story />
      </HStack>
    ),
  ],
};

export const Interactive: Story = {
  args: {
    icon: 'zap',
    title: 'Quick Start',
    description: 'Get up and running with Almadar in under 5 minutes.',
    variant: 'interactive',
    href: 'https://almadar.io/quickstart',
  },
  decorators: [
    (Story) => (
      <HStack className="w-80">
        <Story />
      </HStack>
    ),
  ],
};

export const Elevated: Story = {
  args: {
    icon: 'layers',
    title: 'Pattern System',
    description:
      'Over 100 composable UI patterns that compile into production-quality interfaces.',
    variant: 'elevated',
  },
  decorators: [
    (Story) => (
      <HStack className="w-80">
        <Story />
      </HStack>
    ),
  ],
};

export const SmallSize: Story = {
  args: {
    icon: 'settings',
    title: 'Config',
    description: 'Minimal configuration required.',
    size: 'sm',
    variant: 'bordered',
  },
  decorators: [
    (Story) => (
      <HStack className="w-64">
        <Story />
      </HStack>
    ),
  ],
};

export const AllVariants: Story = {
  render: () => (
    <HStack gap="lg" align="start" className="flex-wrap">
      <FeatureCard
        icon="shield-check"
        title="Type Safe"
        description="Full type safety from schema to app."
        variant="bordered"
        className="w-64"
      />
      <FeatureCard
        icon="zap"
        title="Fast"
        description="Compiles in milliseconds."
        variant="elevated"
        className="w-64"
      />
      <FeatureCard
        icon="rocket"
        title="Deploy"
        description="One command to production."
        variant="interactive"
        href="https://almadar.io"
        className="w-64"
      />
    </HStack>
  ),
};
