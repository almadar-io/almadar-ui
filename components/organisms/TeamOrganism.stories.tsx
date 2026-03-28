import type { Meta, StoryObj } from '@storybook/react-vite';
import { TeamOrganism } from './TeamOrganism';
import type { TeamMemberEntity } from './marketing-types';

const MOCK_TEAM: TeamMemberEntity[] = [
  {
    id: '1',
    name: 'Al-Madari',
    nameAr: 'المداري',
    role: 'Founder & Lead Architect',
    bio: 'Building the bridge between natural language and full-stack applications.',
    avatar: 'https://placehold.co/128x128/6366f1/ffffff?text=AM',
  },
  {
    id: '2',
    name: 'Sara Chen',
    role: 'AI Research Lead',
    bio: 'Pushing the boundaries of neural schema generation and GFlowNet optimization.',
    avatar: 'https://placehold.co/128x128/10b981/ffffff?text=SC',
  },
  {
    id: '3',
    name: 'Marcus Reeves',
    role: 'Runtime Engineer',
    bio: 'Making state machines fast, reliable, and developer-friendly.',
    avatar: 'https://placehold.co/128x128/f59e0b/ffffff?text=MR',
  },
];

const meta: Meta<typeof TeamOrganism> = {
  title: 'Marketing/Organisms/TeamOrganism',
  component: TeamOrganism,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    entity: MOCK_TEAM,
  },
};

export const WithHeading: Story = {
  args: {
    entity: MOCK_TEAM,
    heading: 'Meet the Team',
    subtitle: 'The people behind the platform.',
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    error: new Error('Failed to load team members'),
  },
};

export const SingleMember: Story = {
  args: {
    entity: MOCK_TEAM[0],
  },
};

export const LargeTeam: Story = {
  args: {
    entity: [
      ...MOCK_TEAM,
      {
        id: '4',
        name: 'Lina Petrov',
        role: 'Design Systems Lead',
        bio: 'Crafting the visual language and component architecture for Almadar UI.',
        avatar: 'https://placehold.co/128x128/f43f5e/ffffff?text=LP',
      },
    ],
    heading: 'Our Team',
  },
};
