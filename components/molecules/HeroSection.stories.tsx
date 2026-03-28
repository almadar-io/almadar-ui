import type { Meta, StoryObj } from '@storybook/react-vite';
import { HeroSection } from './HeroSection';
import { Box } from '../atoms/Box';
import { Typography } from '../atoms/Typography';

const meta: Meta<typeof HeroSection> = {
  title: 'Marketing/Molecules/HeroSection',
  component: HeroSection,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  argTypes: {
    background: {
      control: 'select',
      options: ['dark', 'gradient', 'subtle'],
    },
    align: {
      control: 'select',
      options: ['center', 'left'],
    },
    imagePosition: {
      control: 'select',
      options: ['below', 'right', 'background'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tag: 'Open Source',
    tagVariant: 'primary',
    title: 'Build full-stack apps from',
    titleAccent: 'natural language',
    subtitle:
      'Define entities, state machines, and pages in .orb files. The compiler generates a complete, production-ready application.',
    primaryAction: { label: 'Get Started', href: '/docs' },
    secondaryAction: { label: 'View on GitHub', href: '/github' },
    installCommand: 'curl -fsSL https://almadar.io/install | sh',
    background: 'dark',
    align: 'center',
  },
};

export const LeftAligned: Story = {
  args: {
    title: 'Ship faster with',
    titleAccent: 'Orbital schemas',
    subtitle:
      'Write once, compile everywhere. TypeScript, Python, and Rust shells from a single source of truth.',
    primaryAction: { label: 'Start Building', href: '/start' },
    background: 'subtle',
    align: 'left',
  },
};

export const WithImage: Story = {
  args: {
    tag: 'New Release',
    title: 'Visual schema editor',
    titleAccent: 'for everyone',
    subtitle:
      'Drag-and-drop entities, connect traits, and preview your app in real time.',
    primaryAction: { label: 'Try Studio', href: '/studio' },
    image: {
      src: 'https://placehold.co/600x400/1a1a2e/e0e0e0?text=Studio+Preview',
      alt: 'Studio IDE preview',
    },
    imagePosition: 'right',
    background: 'gradient',
    align: 'left',
  },
};

export const GradientBackground: Story = {
  args: {
    title: 'The future of',
    titleAccent: 'app development',
    subtitle:
      'From natural language to running code in seconds. No boilerplate, no configuration.',
    primaryAction: { label: 'Learn More', href: '/learn' },
    secondaryAction: { label: 'Watch Demo', href: '/demo' },
    background: 'gradient',
    align: 'center',
  },
};

export const Minimal: Story = {
  args: {
    title: 'Simple, powerful, open',
    subtitle:
      'The .orb language lets you describe what your app does, not how to build it.',
    primaryAction: { label: 'Read the Docs', href: '/docs' },
    background: 'subtle',
    align: 'center',
  },
};

export const WithChildren: Story = {
  args: {
    tag: 'Beta',
    tagVariant: 'accent',
    title: 'Extensible by design',
    subtitle:
      'Plug in your own patterns, shells, and integrations with the Almadar extension system.',
    background: 'dark',
    align: 'center',
  },
  render: (args) => (
    <HeroSection {...args}>
      <Box
        padding="md"
        className="rounded-md border border-border bg-background/10"
      >
        <Typography variant="body2" align="center" className="text-background">
          Custom content slot: embed demos, videos, or interactive previews here.
        </Typography>
      </Box>
    </HeroSection>
  ),
};
