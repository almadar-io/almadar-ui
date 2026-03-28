import type { Meta, StoryObj } from '@storybook/react-vite';
import { CommunityLinks } from './CommunityLinks';
import { Box } from '../atoms/Box';

const meta: Meta<typeof CommunityLinks> = {
  title: 'Marketing/Molecules/CommunityLinks',
  component: CommunityLinks,
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
    github: { url: 'https://github.com/almadar-io', stars: 1200 },
    discord: { url: 'https://discord.gg/almadar', members: 450 },
    twitter: { url: 'https://twitter.com/almadar_io', followers: 3200 },
  },
  decorators: [
    (Story) => (
      <Box className="w-[480px]">
        <Story />
      </Box>
    ),
  ],
};

export const GitHubOnly: Story = {
  args: {
    github: { url: 'https://github.com/almadar-io' },
  },
};

export const WithCounts: Story = {
  args: {
    github: { url: 'https://github.com/almadar-io', stars: 2400 },
    discord: { url: 'https://discord.gg/almadar', members: 890 },
    twitter: { url: 'https://twitter.com/almadar_io', followers: 5100 },
  },
  decorators: [
    (Story) => (
      <Box className="w-[480px]">
        <Story />
      </Box>
    ),
  ],
};

export const WithHeading: Story = {
  args: {
    heading: 'Join the Community',
    subtitle: 'Connect with developers building the next generation of applications.',
    github: { url: 'https://github.com/almadar-io', stars: 1200 },
    discord: { url: 'https://discord.gg/almadar', members: 450 },
    twitter: { url: 'https://twitter.com/almadar_io', followers: 3200 },
  },
  decorators: [
    (Story) => (
      <Box className="w-[540px]">
        <Story />
      </Box>
    ),
  ],
};
