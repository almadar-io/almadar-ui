import type { Meta, StoryObj } from '@storybook/react-vite';
import { HeroOrganism } from './HeroOrganism';
import type { HeroEntity } from './marketing-types';

const MOCK_HERO: HeroEntity = {
  id: 'hero-1',
  tag: 'Open Source',
  title: 'Build Full-Stack Apps from',
  titleAccent: 'Natural Language',
  subtitle:
    'Define your entire application with a declarative .orb language. State machines, UI, and data all in one place.',
  primaryAction: { label: 'Get Started', href: '/docs' },
  secondaryAction: { label: 'View Demo', href: '/demo' },
  installCommand: 'npm install -g @almadar/cli',
  background: 'gradient',
};

const MOCK_HERO_WITH_IMAGE: HeroEntity = {
  ...MOCK_HERO,
  id: 'hero-2',
  image: {
    src: 'https://placehold.co/800x400/1a1a2e/e0e0e0?text=Dashboard+Preview',
    alt: 'Dashboard preview',
  },
  imagePosition: 'below',
};

const meta: Meta<typeof HeroOrganism> = {
  title: 'Organisms/HeroOrganism',
  component: HeroOrganism,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    entity: MOCK_HERO,
  },
};

export const WithImage: Story = {
  args: {
    entity: MOCK_HERO_WITH_IMAGE,
  },
};

export const DarkBackground: Story = {
  args: {
    entity: { ...MOCK_HERO, id: 'hero-dark', background: 'dark' },
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    error: new Error('Failed to load hero content'),
  },
};

export const Minimal: Story = {
  args: {
    entity: {
      id: 'hero-minimal',
      title: 'Welcome',
      subtitle: 'A simple hero without actions or extras.',
    },
  },
};
