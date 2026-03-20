import type { Meta, StoryObj } from '@storybook/react-vite';
import { SectionHeader } from './SectionHeader';
import { HStack } from './Stack';

const meta: Meta<typeof SectionHeader> = {
  title: 'Atoms/SectionHeader',
  component: SectionHeader,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  argTypes: {
    align: {
      control: 'select',
      options: ['center', 'left', 'right'],
    },
    level: {
      control: 'select',
      options: [1, 2, 3],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Getting Started',
    subtitle: 'Everything you need to build your first application',
    align: 'center',
    level: 2,
  },
};

export const LeftAligned: Story = {
  args: {
    title: 'Features',
    subtitle: 'What makes this platform different',
    align: 'left',
  },
};

export const H1Level: Story = {
  args: {
    title: 'Welcome to Almadar',
    subtitle: 'Natural Language to Full-Stack Applications',
    level: 1,
  },
};

export const NoSubtitle: Story = {
  args: {
    title: 'Simple Section',
  },
};

export const AllAlignments: Story = {
  render: () => (
    <HStack gap="xl" align="start">
      <SectionHeader
        title="Left Aligned"
        subtitle="Content starts from the left"
        align="left"
      />
      <SectionHeader
        title="Center Aligned"
        subtitle="Content is centered"
        align="center"
      />
      <SectionHeader
        title="Right Aligned"
        subtitle="Content ends at the right"
        align="right"
      />
    </HStack>
  ),
};
