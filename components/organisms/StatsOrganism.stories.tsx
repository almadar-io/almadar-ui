import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatsOrganism } from './StatsOrganism';
import type { StatEntity } from './marketing-types';

const MOCK_STATS: StatEntity[] = [
  { id: '1', value: '10,000+', label: 'Active Users' },
  { id: '2', value: '500+', label: 'Projects Built' },
  { id: '3', value: '99.9%', label: 'Uptime' },
  { id: '4', value: '< 50ms', label: 'Avg Response Time' },
];

const meta: Meta<typeof StatsOrganism> = {
  title: 'Marketing/Organisms/StatsOrganism',
  component: StatsOrganism,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    entity: MOCK_STATS,
    columns: 4,
  },
};

export const ThreeColumns: Story = {
  args: {
    entity: MOCK_STATS.slice(0, 3),
    columns: 3,
  },
};

export const TwoColumns: Story = {
  args: {
    entity: MOCK_STATS.slice(0, 2),
    columns: 2,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    error: new Error('Failed to load statistics'),
  },
};

export const SingleStat: Story = {
  args: {
    entity: MOCK_STATS[0],
  },
};
