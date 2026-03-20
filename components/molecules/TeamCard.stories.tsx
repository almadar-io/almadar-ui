import type { Meta, StoryObj } from '@storybook/react-vite';
import { TeamCard } from './TeamCard';
import { HStack } from '../atoms/Stack';

const meta: Meta<typeof TeamCard> = {
  title: 'Molecules/TeamCard',
  component: TeamCard,
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
    name: 'Sara Al-Rashid',
    role: 'Lead Engineer',
    bio: 'Building the compiler pipeline and pattern system. Passionate about type-safe code generation.',
    avatar: { initials: 'SR' },
  },
  decorators: [
    (Story) => (
      <HStack className="w-72">
        <Story />
      </HStack>
    ),
  ],
};

export const WithAvatar: Story = {
  args: {
    name: 'Omar Khalil',
    role: 'Design Systems',
    bio: 'Creating the visual language that powers 100+ UI patterns across all Almadar projects.',
    avatar: 'https://placehold.co/96x96/1a1a2e/e0e0e0?text=OK',
  },
  decorators: [
    (Story) => (
      <HStack className="w-72">
        <Story />
      </HStack>
    ),
  ],
};

export const WithArabicName: Story = {
  args: {
    name: 'Al-Madari',
    nameAr: '\u0627\u0644\u0645\u062F\u0627\u0631\u064A',
    role: 'Founder',
    bio: 'Architect of the Orbital language and the Almadar platform. Turning natural language into running applications.',
    avatar: { initials: 'AM' },
  },
  decorators: [
    (Story) => (
      <HStack className="w-72">
        <Story />
      </HStack>
    ),
  ],
};

export const MinimalBio: Story = {
  args: {
    name: 'Lina Farouk',
    role: 'QA Lead',
    bio: 'Verification and testing.',
  },
  decorators: [
    (Story) => (
      <HStack className="w-72">
        <Story />
      </HStack>
    ),
  ],
};
