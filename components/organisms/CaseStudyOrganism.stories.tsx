import type { Meta, StoryObj } from '@storybook/react-vite';
import { CaseStudyOrganism } from './CaseStudyOrganism';
import type { CaseStudyEntity } from './marketing-types';

const MOCK_CASE_STUDIES: CaseStudyEntity[] = [
  {
    id: '1',
    title: 'Automating Order Fulfillment at Scale',
    description:
      'How a mid-size retailer replaced 3 custom systems with a single .orb schema, reducing development time by 80%.',
    category: 'E-Commerce',
    categoryColor: '#6366f1',
    href: '/case-studies/ecommerce',
    linkLabel: 'Read case study',
  },
  {
    id: '2',
    title: 'Real-Time Fleet Management',
    description:
      'A logistics company built a live fleet tracker with geofencing, driver assignment, and route optimization.',
    category: 'Logistics',
    categoryColor: '#10b981',
    href: '/case-studies/fleet',
  },
  {
    id: '3',
    title: 'Patient Portal for a Regional Hospital',
    description:
      'HIPAA-compliant patient management with appointment scheduling, lab results, and secure messaging.',
    category: 'Healthcare',
    categoryColor: '#f43f5e',
    href: '/case-studies/healthcare',
  },
];

const meta: Meta<typeof CaseStudyOrganism> = {
  title: 'Marketing/Organisms/CaseStudyOrganism',
  component: CaseStudyOrganism,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    entity: MOCK_CASE_STUDIES,
  },
};

export const WithHeading: Story = {
  args: {
    entity: MOCK_CASE_STUDIES,
    heading: 'Case Studies',
    subtitle: 'See how teams are using Almadar to solve real-world problems.',
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    error: new Error('Failed to load case studies'),
  },
};

export const SingleStudy: Story = {
  args: {
    entity: MOCK_CASE_STUDIES[0],
  },
};

export const TwoStudies: Story = {
  args: {
    entity: MOCK_CASE_STUDIES.slice(0, 2),
    heading: 'Featured Case Studies',
  },
};
