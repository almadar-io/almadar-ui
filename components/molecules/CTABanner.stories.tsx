import type { Meta, StoryObj } from '@storybook/react-vite';
import { CTABanner } from './CTABanner';
import { VStack } from '../atoms/Stack';

const meta: Meta<typeof CTABanner> = {
  title: 'Molecules/CTABanner',
  component: CTABanner,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  argTypes: {
    background: {
      control: 'select',
      options: ['dark', 'gradient', 'primary'],
    },
    align: {
      control: 'select',
      options: ['center', 'left'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Start building with Almadar today',
    subtitle:
      'From natural language to production applications. No boilerplate, no busywork.',
    primaryAction: { label: 'Get Started', href: 'https://almadar.io/start' },
    secondaryAction: { label: 'View Docs', href: 'https://docs.almadar.io' },
    background: 'dark',
  },
};

export const Gradient: Story = {
  args: {
    title: 'Ship faster with Orbital',
    subtitle: 'The compiler that turns schemas into full-stack apps.',
    primaryAction: {
      label: 'Try it free',
      href: 'https://almadar.io/signup',
    },
    background: 'gradient',
  },
};

export const Primary: Story = {
  args: {
    title: 'Join the community',
    subtitle: 'Connect with developers building the next generation of apps.',
    primaryAction: {
      label: 'Join Discord',
      href: 'https://discord.gg/almadar',
    },
    secondaryAction: {
      label: 'Follow on GitHub',
      href: 'https://github.com/almadar-io',
    },
    background: 'primary',
  },
};

export const LeftAligned: Story = {
  args: {
    title: 'Ready to get started?',
    subtitle:
      'Install the CLI and create your first project in under 5 minutes.',
    primaryAction: {
      label: 'Install Now',
      href: 'https://almadar.io/install',
    },
    background: 'dark',
    align: 'left',
  },
};

export const WithSubtitle: Story = {
  args: {
    title: 'Enterprise-grade applications from a single source of truth',
    subtitle:
      'Define your entities, traits, and pages in .orb files. The compiler handles the rest: state machines, UI components, API routes, and database schemas.',
    primaryAction: {
      label: 'See a demo',
      href: 'https://almadar.io/demo',
    },
    background: 'gradient',
  },
};

export const SingleAction: Story = {
  args: {
    title: 'Subscribe to updates',
    subtitle: 'Get notified about new features and releases.',
    primaryAction: {
      label: 'Subscribe',
      href: 'https://almadar.io/subscribe',
    },
    background: 'primary',
  },
};

export const AllVariants: Story = {
  render: () => (
    <VStack gap="lg">
      <CTABanner
        title="Dark background"
        subtitle="With both action buttons."
        primaryAction={{ label: 'Primary', href: '#' }}
        secondaryAction={{ label: 'Secondary', href: '#' }}
        background="dark"
      />
      <CTABanner
        title="Gradient background"
        subtitle="A subtle gradient for visual interest."
        primaryAction={{ label: 'Get Started', href: '#' }}
        background="gradient"
      />
      <CTABanner
        title="Primary background"
        subtitle="Using the brand primary color."
        primaryAction={{ label: 'Try Now', href: '#' }}
        secondaryAction={{ label: 'Learn More', href: '#' }}
        background="primary"
      />
    </VStack>
  ),
};
