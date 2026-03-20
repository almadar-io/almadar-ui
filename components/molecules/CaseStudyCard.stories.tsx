import type { Meta, StoryObj } from '@storybook/react-vite';
import { CaseStudyCard } from './CaseStudyCard';
import { HStack } from '../atoms/Stack';

const meta: Meta<typeof CaseStudyCard> = {
  title: 'Molecules/CaseStudyCard',
  component: CaseStudyCard,
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
    title: 'E-Commerce Platform Migration',
    description:
      'How a retail company migrated their legacy monolith to a schema-driven architecture, reducing development time by 60%.',
    category: 'Migration',
    href: 'https://almadar.io/case-studies/ecommerce',
  },
  decorators: [
    (Story) => (
      <HStack className="w-80">
        <Story />
      </HStack>
    ),
  ],
};

export const WithCustomColor: Story = {
  args: {
    title: 'Healthcare Compliance System',
    description:
      'Building a HIPAA-compliant patient management system with state machine workflows and automated audit trails.',
    category: 'Healthcare',
    categoryColor: '#0ea5e9',
    href: 'https://almadar.io/case-studies/healthcare',
    linkLabel: 'View case study',
  },
  decorators: [
    (Story) => (
      <HStack className="w-80">
        <Story />
      </HStack>
    ),
  ],
};

export const TwoCards: Story = {
  render: () => (
    <HStack gap="lg" align="start">
      <CaseStudyCard
        title="Fintech Dashboard"
        description="Real-time trading dashboard with WebSocket-driven state machines and zero-downtime deploys."
        category="Fintech"
        categoryColor="#8b5cf6"
        href="https://almadar.io/case-studies/fintech"
        className="w-72"
      />
      <CaseStudyCard
        title="Logistics Tracker"
        description="Fleet management platform tracking 10,000 vehicles with orbital-compiled event pipelines."
        category="Logistics"
        categoryColor="#f59e0b"
        href="https://almadar.io/case-studies/logistics"
        className="w-72"
      />
    </HStack>
  ),
};
