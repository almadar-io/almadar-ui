import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeatureGrid } from './FeatureGrid';
import type { FeatureCardProps } from './FeatureCard';

const sampleItems: FeatureCardProps[] = [
  {
    icon: 'shield-check',
    title: 'Type Safe',
    description: 'End-to-end type safety from schema to generated code.',
  },
  {
    icon: 'zap',
    title: 'Fast Compilation',
    description: 'Rust-based compiler processes schemas in milliseconds.',
  },
  {
    icon: 'layers',
    title: '100+ Patterns',
    description: 'Composable UI patterns that compile to production quality.',
  },
  {
    icon: 'rocket',
    title: 'One-Click Deploy',
    description: 'Deploy to Firebase, Vercel, or any cloud provider instantly.',
  },
  {
    icon: 'cpu',
    title: 'AI Native',
    description: 'Built-in AI agent can generate and modify applications.',
  },
  {
    icon: 'globe',
    title: 'i18n Ready',
    description: 'Full internationalization support with RTL and LTR layouts.',
  },
];

const meta: Meta<typeof FeatureGrid> = {
  title: 'Molecules/FeatureGrid',
  component: FeatureGrid,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: 'select',
      options: [2, 3, 4, 6],
    },
    gap: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: sampleItems,
    columns: 3,
  },
};

export const TwoColumns: Story = {
  args: {
    items: sampleItems.slice(0, 4),
    columns: 2,
    gap: 'lg',
  },
};

export const FourColumns: Story = {
  args: {
    items: sampleItems.slice(0, 4),
    columns: 4,
    gap: 'sm',
  },
};

export const WithLinks: Story = {
  args: {
    items: sampleItems.map((item) => ({
      ...item,
      href: 'https://almadar.io',
      linkLabel: 'Learn more',
    })),
    columns: 3,
  },
};
