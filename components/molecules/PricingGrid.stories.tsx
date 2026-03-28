import type { Meta, StoryObj } from '@storybook/react-vite';
import { PricingGrid } from './PricingGrid';
import type { PricingCardProps } from './PricingCard';
import { Box } from '../atoms/Box';

const meta: Meta<typeof PricingGrid> = {
  title: 'Marketing/Molecules/PricingGrid',
  component: PricingGrid,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const starterPlan: PricingCardProps = {
  name: 'Starter',
  price: 'Free',
  description: 'Perfect for side projects.',
  features: ['3 projects', 'Community support', 'Public repos'],
  action: { label: 'Start Free', href: '/signup' },
};

const proPlan: PricingCardProps = {
  name: 'Pro',
  price: '$29/mo',
  description: 'For growing teams.',
  features: [
    'Unlimited projects',
    'Priority support',
    'Custom domains',
    'Team collaboration',
    'Advanced analytics',
  ],
  action: { label: 'Get Started', href: '/signup' },
  highlighted: true,
  badge: 'Most Popular',
};

const enterprisePlan: PricingCardProps = {
  name: 'Enterprise',
  price: 'Custom',
  description: 'Dedicated infrastructure and SLA.',
  features: [
    'Everything in Pro',
    'Dedicated support',
    'SSO / SAML',
    'Custom SLA',
    'On-premise option',
  ],
  action: { label: 'Contact Sales', href: '/contact' },
};

const teamPlan: PricingCardProps = {
  name: 'Team',
  price: '$49/mo',
  description: 'For mid-size organizations.',
  features: [
    'Everything in Pro',
    '10 team members',
    'Shared dashboards',
    'Role-based access',
  ],
  action: { label: 'Try Team', href: '/signup' },
};

export const Default: Story = {
  args: {
    plans: [starterPlan, proPlan, enterprisePlan],
  },
  decorators: [
    (Story) => (
      <Box className="max-w-5xl mx-auto">
        <Story />
      </Box>
    ),
  ],
};

export const TwoPlans: Story = {
  args: {
    plans: [starterPlan, proPlan],
  },
  decorators: [
    (Story) => (
      <Box className="max-w-3xl mx-auto">
        <Story />
      </Box>
    ),
  ],
};

export const FourPlans: Story = {
  args: {
    plans: [starterPlan, proPlan, teamPlan, enterprisePlan],
  },
  decorators: [
    (Story) => (
      <Box className="max-w-6xl mx-auto">
        <Story />
      </Box>
    ),
  ],
};
