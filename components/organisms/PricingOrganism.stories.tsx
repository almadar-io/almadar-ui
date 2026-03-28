import type { Meta, StoryObj } from '@storybook/react-vite';
import { PricingOrganism } from './PricingOrganism';
import type { PricingPlanEntity } from './marketing-types';

const MOCK_PLANS: PricingPlanEntity[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    description: 'Perfect for side projects and learning.',
    features: ['Up to 3 projects', 'Community support', 'Basic templates', 'Single developer'],
    actionLabel: 'Start Free',
    actionHref: '/signup',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29/mo',
    description: 'For professional developers and small teams.',
    features: [
      'Unlimited projects',
      'Priority support',
      'All templates',
      'Team collaboration',
      'Custom domains',
      'Analytics dashboard',
    ],
    actionLabel: 'Start Trial',
    actionHref: '/signup?plan=pro',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations with advanced needs.',
    features: [
      'Everything in Pro',
      'SSO & SAML',
      'Dedicated support',
      'SLA guarantee',
      'On-premise option',
      'Custom integrations',
    ],
    actionLabel: 'Contact Sales',
    actionHref: '/contact',
  },
];

const meta: Meta<typeof PricingOrganism> = {
  title: 'Marketing/Organisms/PricingOrganism',
  component: PricingOrganism,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    entity: MOCK_PLANS,
  },
};

export const WithHeading: Story = {
  args: {
    entity: MOCK_PLANS,
    heading: 'Simple, Transparent Pricing',
    subtitle: 'Choose the plan that fits your needs. Upgrade or downgrade anytime.',
  },
};

export const TwoPlans: Story = {
  args: {
    entity: MOCK_PLANS.slice(0, 2),
    heading: 'Choose Your Plan',
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    error: new Error('Failed to load pricing plans'),
  },
};
