import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShowcaseOrganism } from './ShowcaseOrganism';
import type { ShowcaseEntity } from './marketing-types';

const MOCK_SHOWCASES: ShowcaseEntity[] = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    description: 'A full-featured online store with cart, checkout, and order management.',
    image: { src: 'https://placehold.co/600x400/2d2d44/e0e0e0?text=E-Commerce', alt: 'E-Commerce screenshot' },
    href: '/showcase/ecommerce',
    badge: 'Featured',
    accentColor: '#6366f1',
  },
  {
    id: '2',
    title: 'Project Tracker',
    description: 'Kanban boards, sprint planning, and team collaboration.',
    image: { src: 'https://placehold.co/600x400/1a3a2e/e0e0e0?text=Tracker', alt: 'Project tracker screenshot' },
    href: '/showcase/tracker',
    accentColor: '#10b981',
  },
  {
    id: '3',
    title: 'CRM Dashboard',
    description: 'Customer relationship management with analytics and pipeline views.',
    image: { src: 'https://placehold.co/600x400/3a1a2e/e0e0e0?text=CRM', alt: 'CRM screenshot' },
    href: '/showcase/crm',
    badge: 'New',
    accentColor: '#f43f5e',
  },
];

const meta: Meta<typeof ShowcaseOrganism> = {
  title: 'Organisms/ShowcaseOrganism',
  component: ShowcaseOrganism,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    entity: MOCK_SHOWCASES,
    columns: 3,
  },
};

export const WithHeading: Story = {
  args: {
    entity: MOCK_SHOWCASES,
    columns: 3,
    heading: 'Built with Almadar',
    subtitle: 'Real-world applications generated from .orb schemas.',
  },
};

export const TwoColumns: Story = {
  args: {
    entity: MOCK_SHOWCASES.slice(0, 2),
    columns: 2,
    heading: 'Featured Projects',
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    error: new Error('Failed to load showcase projects'),
  },
};

export const FourItems: Story = {
  args: {
    entity: [
      ...MOCK_SHOWCASES,
      {
        id: '4',
        title: 'HR Portal',
        description: 'Employee management, leave tracking, and performance reviews.',
        image: { src: 'https://placehold.co/600x400/2e2a1a/e0e0e0?text=HR+Portal', alt: 'HR Portal screenshot' },
        href: '/showcase/hr',
        accentColor: '#f59e0b',
      },
    ],
    columns: 4,
  },
};
