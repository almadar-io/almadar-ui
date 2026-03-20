import type { Meta, StoryObj } from '@storybook/react-vite';
import { PricingPageTemplate, type PricingPageEntity } from './PricingPageTemplate';

const meta: Meta<typeof PricingPageTemplate> = {
  title: 'Templates/PricingPageTemplate',
  component: PricingPageTemplate,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PricingPageTemplate>;

const MOCK_FULL: PricingPageEntity = {
  id: 'pricing',
  hero: {
    id: 'pricing-hero',
    tag: 'Pricing',
    title: 'Simple, transparent ',
    titleAccent: 'pricing',
    subtitle: 'No hidden fees. No per-seat charges. Pick a plan and start building.',
    background: 'gradient',
  },
  plans: [
    {
      id: 'free',
      name: 'Starter',
      price: '$0',
      description: 'For side projects and experiments',
      features: [
        'Unlimited .orb files',
        'Community support',
        '5 standard behaviors',
        'Single project',
      ],
      actionLabel: 'Start Free', actionHref: '/signup',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$29/mo',
      description: 'For teams shipping production apps',
      features: [
        'Everything in Starter',
        '93 standard behaviors',
        'Unlimited projects',
        'Priority support',
        'Custom domains',
        'Team collaboration',
      ],
      actionLabel: 'Start Trial', actionHref: '/signup?plan=pro',
      highlighted: true,
      badge: 'Most Popular',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      description: 'For organizations with advanced needs',
      features: [
        'Everything in Pro',
        'Dedicated engineer',
        'SLA guarantee',
        'Custom behaviors',
        'On-premise deployment',
        'SOC2 compliance',
      ],
      actionLabel: 'Contact Sales', actionHref: '/contact',
    },
  ],
  faq: [
    {
      question: 'Can I switch plans later?',
      answer: 'Yes. You can upgrade or downgrade at any time. Changes take effect on your next billing cycle.',
    },
    {
      question: 'What counts as a project?',
      answer: 'A project is a single .orb schema compiled to a standalone app. Each project gets its own domain and deployment.',
    },
    {
      question: 'Do you offer discounts for startups?',
      answer: 'Yes. We offer 50% off Pro for startups under 2 years old with less than $1M in funding. Contact us for details.',
    },
    {
      question: 'What happens if I exceed my plan limits?',
      answer: 'We will notify you before any changes. You can upgrade your plan or we will work with you to find a solution.',
    },
  ],
  ctaTitle: 'Not sure which plan is right?',
  ctaSubtitle: 'Talk to our team for a personalized recommendation.',
  ctaAction: { label: 'Contact Us', href: '/contact' },
};

export const Default: Story = {
  args: {
    entity: MOCK_FULL,
  },
};

const MOCK_NO_FAQ: PricingPageEntity = {
  id: 'pricing-no-faq',
  hero: {
    id: 'hero',
    title: 'Choose your plan',
    subtitle: 'Start free, scale when you need to.',
    background: 'subtle',
  },
  plans: [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      features: ['3 projects', 'Community support'],
      actionLabel: 'Get Started', actionHref: '/signup',
    },
    {
      id: 'team',
      name: 'Team',
      price: '$49/mo',
      features: ['Unlimited projects', 'Priority support', 'Custom domains'],
      actionLabel: 'Start Trial', actionHref: '/signup?plan=team',
      highlighted: true,
      badge: 'Best Value',
    },
  ],
};

export const NoPlansFAQ: Story = {
  args: {
    entity: MOCK_NO_FAQ,
  },
};

const MOCK_WITH_CTA: PricingPageEntity = {
  id: 'pricing-cta',
  hero: {
    id: 'hero',
    title: 'Pricing',
    subtitle: 'Flexible plans for every team size.',
    background: 'dark',
  },
  plans: [
    {
      id: 'starter',
      name: 'Starter',
      price: '$0',
      features: ['Core features', 'Community forums'],
      actionLabel: 'Start Free', actionHref: '/signup',
    },
    {
      id: 'growth',
      name: 'Growth',
      price: '$19/mo',
      features: ['All features', 'Email support', '10 projects'],
      actionLabel: 'Subscribe', actionHref: '/signup?plan=growth',
      highlighted: true,
    },
    {
      id: 'scale',
      name: 'Scale',
      price: '$79/mo',
      features: ['All features', 'Priority support', 'Unlimited projects', 'SSO'],
      actionLabel: 'Subscribe', actionHref: '/signup?plan=scale',
    },
  ],
  ctaTitle: 'Need a custom plan?',
  ctaSubtitle: 'We build tailored solutions for enterprise teams.',
  ctaAction: { label: 'Talk to Sales', href: '/sales' },
};

export const WithCTA: Story = {
  args: {
    entity: MOCK_WITH_CTA,
  },
};
