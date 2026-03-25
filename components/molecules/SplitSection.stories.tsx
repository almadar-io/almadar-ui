import type { Meta, StoryObj } from '@storybook/react-vite';
import { SplitSection } from './SplitSection';
import { Box } from '../atoms/Box';
import { Typography } from '../atoms/Typography';

const meta: Meta<typeof SplitSection> = {
  title: 'Molecules/SplitSection',
  component: SplitSection,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  argTypes: {
    imagePosition: {
      control: 'select',
      options: ['left', 'right'],
    },
    background: {
      control: 'select',
      options: ['default', 'alt'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Build Full-Stack Apps from Schemas',
    description:
      'The Orbital compiler transforms .orb files into production-ready applications with type-safe state machines, generated UI, and integrated backend services.',
    image: { src: 'https://placehold.co/600x400/1a1a2e/e0e0e0?text=Compiler+Output', alt: 'Compiler output preview' },
    imagePosition: 'right',
  },
};

export const ImageLeft: Story = {
  args: {
    title: 'Visual Schema Editor',
    description:
      'Design your data model visually. Drag entities, connect traits, and see your application take shape in real time.',
    image: { src: 'https://placehold.co/600x400/1a1a2e/e0e0e0?text=Schema+Editor', alt: 'Schema editor preview' },
    imagePosition: 'left',
  },
};

export const WithBullets: Story = {
  args: {
    title: 'Why Almadar?',
    description: 'A complete platform for building enterprise applications without boilerplate.',
    bullets: [
      'Rust-based compiler for sub-second builds',
      'Over 100 composable UI patterns',
      'Built-in state machine validation',
      'Full type safety from schema to browser',
    ],
    image: { src: 'https://placehold.co/600x400/1a1a2e/e0e0e0?text=Platform', alt: 'Platform overview' },
  },
};

export const AltBackground: Story = {
  args: {
    title: 'Enterprise Ready',
    description: 'Deploy to any cloud with Firebase App Hosting, Cloud Run, or your own infrastructure.',
    background: 'alt',
    image: { src: 'https://placehold.co/600x400/1a1a2e/e0e0e0?text=Deploy', alt: 'Deployment options' },
  },
};

export const WithCustomContent: Story = {
  args: {
    title: 'Get Started in Minutes',
    description: 'Install the CLI, write your first .orb file, and compile.',
  },
  render: (args) => (
    <SplitSection {...args}>
      <Box
        className="flex-1 min-w-0 rounded-md bg-foreground p-6"
      >
        <Typography variant="body2" className="font-mono text-background">
          {'$ orbital compile app.orb --shell typescript'}
        </Typography>
      </Box>
    </SplitSection>
  ),
};
