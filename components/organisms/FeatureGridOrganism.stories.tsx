import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeatureGridOrganism } from './FeatureGridOrganism';
import type { FeatureEntity } from './marketing-types';

const MOCK_FEATURES: FeatureEntity[] = [
  {
    id: '1',
    icon: 'shield-check',
    title: 'Secure by Default',
    description: 'Built with security at every layer. Role-based access, encrypted data, and audit logging.',
  },
  {
    id: '2',
    icon: 'zap',
    title: 'Blazing Fast',
    description: 'Optimized for speed with compiled output, lazy loading, and edge-ready deployment.',
  },
  {
    id: '3',
    icon: 'bot',
    title: 'AI-Native',
    description: 'Designed for AI agents from the ground up. Natural language to full-stack app in minutes.',
  },
  {
    id: '4',
    icon: 'layers',
    title: 'Composable',
    description: 'Mix and match behaviors, entities, and traits to build complex applications.',
  },
  {
    id: '5',
    icon: 'globe',
    title: 'Multi-Language',
    description: 'First-class i18n with RTL support. Build once, deploy in any language.',
  },
  {
    id: '6',
    icon: 'palette',
    title: 'Themeable',
    description: 'CSS variable-based theming system. Dark mode, brand colors, and custom themes.',
    href: '/docs/theming',
    linkLabel: 'Learn more',
  },
];

const meta: Meta<typeof FeatureGridOrganism> = {
  title: 'Organisms/FeatureGridOrganism',
  component: FeatureGridOrganism,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    entity: MOCK_FEATURES,
    columns: 3,
  },
};

export const WithHeading: Story = {
  args: {
    entity: MOCK_FEATURES,
    columns: 3,
    heading: 'Why Almadar?',
    subtitle: 'Everything you need to build production-ready applications.',
  },
};

export const TwoColumns: Story = {
  args: {
    entity: MOCK_FEATURES.slice(0, 4),
    columns: 2,
    heading: 'Core Features',
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    error: new Error('Failed to load features'),
  },
};

export const SingleFeature: Story = {
  args: {
    entity: MOCK_FEATURES[0],
  },
};
