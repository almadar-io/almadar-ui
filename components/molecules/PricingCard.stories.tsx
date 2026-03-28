import type { Meta, StoryObj } from '@storybook/react-vite';
import { PricingCard } from './PricingCard';
import { HStack } from '../atoms/Stack';

const meta: Meta<typeof PricingCard> = {
  title: 'Marketing/Molecules/PricingCard',
  component: PricingCard,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'Pro',
    price: '$29/mo',
    description: 'For growing teams that need more power.',
    features: [
      'Unlimited projects',
      'Priority support',
      'Custom domains',
      'Team collaboration',
      'Advanced analytics',
    ],
    action: { label: 'Get Started', href: '/signup' },
  },
  decorators: [
    (Story) => (
      <HStack className="w-[360px]">
        <Story />
      </HStack>
    ),
  ],
};

export const Highlighted: Story = {
  args: {
    name: 'Pro',
    price: '$29/mo',
    description: 'Most popular plan for growing teams.',
    features: [
      'Unlimited projects',
      'Priority support',
      'Custom domains',
      'Team collaboration',
      'Advanced analytics',
    ],
    action: { label: 'Get Started', href: '/signup' },
    highlighted: true,
  },
  decorators: [
    (Story) => (
      <HStack className="w-[360px]">
        <Story />
      </HStack>
    ),
  ],
};

export const WithBadge: Story = {
  args: {
    name: 'Pro',
    price: '$29/mo',
    description: 'The best value for your team.',
    features: [
      'Unlimited projects',
      'Priority support',
      'Custom domains',
      'Team collaboration',
    ],
    action: { label: 'Start Free Trial', href: '/trial' },
    highlighted: true,
    badge: 'Most Popular',
  },
  decorators: [
    (Story) => (
      <HStack className="w-[360px]">
        <Story />
      </HStack>
    ),
  ],
};

export const ThreePlans: Story = {
  render: () => (
    <HStack gap="lg" align="stretch" className="max-w-4xl">
      <PricingCard
        name="Starter"
        price="Free"
        description="Perfect for side projects and experimentation."
        features={[
          '3 projects',
          'Community support',
          'Public repos only',
        ]}
        action={{ label: 'Start Free', href: '/signup' }}
      />
      <PricingCard
        name="Pro"
        price="$29/mo"
        description="For growing teams that need more power."
        features={[
          'Unlimited projects',
          'Priority support',
          'Custom domains',
          'Team collaboration',
          'Advanced analytics',
        ]}
        action={{ label: 'Get Started', href: '/signup' }}
        highlighted
        badge="Most Popular"
      />
      <PricingCard
        name="Enterprise"
        price="Custom"
        description="Dedicated infrastructure and SLA guarantees."
        features={[
          'Everything in Pro',
          'Dedicated support',
          'SSO / SAML',
          'Custom SLA',
          'On-premise option',
          'Audit logs',
        ]}
        action={{ label: 'Contact Sales', href: '/contact' }}
      />
    </HStack>
  ),
};
