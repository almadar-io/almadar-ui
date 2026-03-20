import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShowcaseCard } from './ShowcaseCard';
import { HStack } from '../atoms/Stack';

const meta: Meta<typeof ShowcaseCard> = {
  title: 'Molecules/ShowcaseCard',
  component: ShowcaseCard,
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
    title: 'E-Commerce Platform',
    description: 'Full-featured online store built with 12 Orbital units and 34 traits.',
    image: { src: 'https://placehold.co/600x400/1a1a2e/e0e0e0?text=E-Commerce', alt: 'E-Commerce platform screenshot' },
  },
  decorators: [
    (Story) => (
      <HStack className="w-80">
        <Story />
      </HStack>
    ),
  ],
};

export const WithBadge: Story = {
  args: {
    title: 'Healthcare Dashboard',
    description: 'Patient management, scheduling, and analytics in a single application.',
    image: { src: 'https://placehold.co/600x400/1a1a2e/e0e0e0?text=Healthcare', alt: 'Healthcare dashboard' },
    badge: 'Featured',
  },
  decorators: [
    (Story) => (
      <HStack className="w-80">
        <Story />
      </HStack>
    ),
  ],
};

export const WithAccentColor: Story = {
  args: {
    title: 'Finance App',
    description: 'Budget tracking and investment portfolio management.',
    image: { src: 'https://placehold.co/600x400/1a1a2e/e0e0e0?text=Finance', alt: 'Finance app' },
    accentColor: '#10b981',
    badge: 'New',
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
    title: 'Live Demo',
    description: 'Click to explore the running application.',
    image: { src: 'https://placehold.co/600x400/1a1a2e/e0e0e0?text=Demo', alt: 'Live demo preview' },
    href: 'https://demo.almadar.io',
    badge: 'Live',
  },
  decorators: [
    (Story) => (
      <HStack className="w-80">
        <Story />
      </HStack>
    ),
  ],
};

export const ThreeCards: Story = {
  render: () => (
    <HStack gap="lg" align="start" className="flex-wrap">
      <ShowcaseCard
        title="E-Commerce"
        description="Online store with cart and checkout."
        image={{ src: 'https://placehold.co/600x400/1a1a2e/e0e0e0?text=Store', alt: 'Store' }}
        badge="Popular"
        className="w-64"
      />
      <ShowcaseCard
        title="CRM"
        description="Customer relationship management."
        image={{ src: 'https://placehold.co/600x400/1a1a2e/e0e0e0?text=CRM', alt: 'CRM' }}
        accentColor="#6366f1"
        className="w-64"
      />
      <ShowcaseCard
        title="LMS"
        description="Learning management system."
        image={{ src: 'https://placehold.co/600x400/1a1a2e/e0e0e0?text=LMS', alt: 'LMS' }}
        href="https://demo.almadar.io/lms"
        className="w-64"
      />
    </HStack>
  ),
};
