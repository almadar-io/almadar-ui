import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatsGrid } from './StatsGrid';
import { Box } from '../atoms/Box';

const meta: Meta<typeof StatsGrid> = {
  title: 'Marketing/Molecules/StatsGrid',
  component: StatsGrid,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: 'select',
      options: [2, 3, 4, 6],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    stats: [
      { value: '93', label: 'Behaviors' },
      { value: '18', label: 'Domains' },
      { value: '7', label: 'Shells' },
    ],
    columns: 3,
  },
  decorators: [
    (Story) => (
      <Box className="w-[600px]">
        <Story />
      </Box>
    ),
  ],
};

export const SixStats: Story = {
  args: {
    stats: [
      { value: '93', label: 'Behaviors' },
      { value: '18', label: 'Domains' },
      { value: '7', label: 'Shells' },
      { value: '114', label: 'Patterns' },
      { value: '2.4k', label: 'Downloads' },
      { value: '99.9%', label: 'Uptime' },
    ],
    columns: 3,
  },
  decorators: [
    (Story) => (
      <Box className="w-[700px]">
        <Story />
      </Box>
    ),
  ],
};

export const TwoColumns: Story = {
  args: {
    stats: [
      { value: '50+', label: 'Components' },
      { value: '12', label: 'Templates' },
      { value: '4', label: 'Themes' },
      { value: '100%', label: 'TypeScript' },
    ],
    columns: 2,
  },
  decorators: [
    (Story) => (
      <Box className="w-[500px]">
        <Story />
      </Box>
    ),
  ],
};
