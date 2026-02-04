import type { Meta, StoryObj } from '@storybook/react';
import { SeasonIndicator } from './SeasonIndicator';

const meta: Meta<typeof SeasonIndicator> = {
  title: 'Clients/Winning-11/Atoms/SeasonIndicator',
  component: SeasonIndicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    season: {
      control: 'select',
      options: ['planting', 'growing', 'harvest', 'rest'],
    },
    progress: {
      control: { type: 'range', min: 0, max: 100 },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Planting: Story = {
  args: {
    season: 'planting',
    showLabel: true,
  },
};

export const Growing: Story = {
  args: {
    season: 'growing',
    showLabel: true,
  },
};

export const Harvest: Story = {
  args: {
    season: 'harvest',
    showLabel: true,
  },
};

export const Rest: Story = {
  args: {
    season: 'rest',
    showLabel: true,
  },
};

export const WithProgress: Story = {
  args: {
    season: 'growing',
    progress: 65,
    showLabel: true,
  },
};

export const Small: Story = {
  args: {
    season: 'harvest',
    size: 'sm',
    showLabel: true,
  },
};

export const Large: Story = {
  args: {
    season: 'planting',
    size: 'lg',
    progress: 30,
    showLabel: true,
  },
};

export const IconOnly: Story = {
  args: {
    season: 'growing',
    showLabel: false,
  },
};

export const AllSeasons: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <SeasonIndicator season="planting" progress={75} />
      <SeasonIndicator season="growing" progress={50} />
      <SeasonIndicator season="harvest" progress={25} />
      <SeasonIndicator season="rest" progress={90} />
    </div>
  ),
};
