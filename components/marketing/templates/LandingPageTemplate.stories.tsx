import type { Meta, StoryObj } from '@storybook/react-vite';
import { LandingPageTemplate, type LandingPageEntity } from './LandingPageTemplate';

const meta: Meta<typeof LandingPageTemplate> = {
  title: 'Marketing/Templates/LandingPageTemplate',
  component: LandingPageTemplate,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof LandingPageTemplate>;

const MOCK_FULL: LandingPageEntity = {
  id: 'landing',
  hero: {
    id: 'hero',
    tag: 'Open Source',
    title: 'Build apps from ',
    titleAccent: 'Orb',
    subtitle: 'A programming language where every program is valid JSON. Write state machines, compile to full-stack apps.',
    primaryAction: { label: 'Get Started', href: '/docs' },
    secondaryAction: { label: 'Playground', href: '/playground' },
    installCommand: 'curl -fsSL https://orb.almadar.io/install.sh | sh',
    background: 'dark',
  },
  features: [
    { id: '1', icon: 'file-json', title: 'Valid JSON', description: 'Every .orb file is valid JSON. No custom syntax to learn.' },
    { id: '2', icon: 'shield-check', title: 'Compile-Time Validation', description: 'Dead states, orphaned events, broken circuits caught before runtime.' },
    { id: '3', icon: 'bot', title: 'AI-Native', description: 'LLMs generate valid JSON natively. No syntax hallucination.' },
    { id: '4', icon: 'zap', title: 'Fast Compilation', description: 'Rust compiler generates TypeScript + React in under 2 seconds.' },
    { id: '5', icon: 'layers', title: '93 Standard Behaviors', description: 'Auth, CRUD, payments, scheduling, and more out of the box.' },
    { id: '6', icon: 'palette', title: 'Design System Included', description: 'Production-ready components with theming and responsive layout.' },
  ],
  stats: [
    { id: '1', value: '93', label: 'Standard Behaviors' },
    { id: '2', value: '18', label: 'Domains' },
    { id: '3', value: '< 2s', label: 'Compile Time' },
    { id: '4', value: '114', label: 'UI Patterns' },
  ],
  steps: [
    { id: '1', title: 'Define Your Entities', description: 'Describe your data shapes with fields, types, and defaults.' },
    { id: '2', title: 'Add Traits', description: 'Attach state machines to entities. Each trait handles one concern.' },
    { id: '3', title: 'Compile', description: 'Run orbital compile to generate a full React + TypeScript app.' },
    { id: '4', title: 'Deploy', description: 'Push to Firebase, Vercel, or any static host. Done.' },
  ],
  showcase: [
    {
      id: '1',
      title: 'Trait Wars',
      description: 'A turn-based strategy game built entirely in .orb',
      image: { src: 'https://picsum.photos/seed/tw/600/400', alt: 'Trait Wars game screenshot' },
      badge: 'Game',
      href: 'https://trait-wars.almadar.io',
    },
    {
      id: '2',
      title: 'E-Commerce Store',
      description: 'Full cart, checkout, and order management in 400 lines of .orb',
      image: { src: 'https://picsum.photos/seed/ec/600/400', alt: 'E-commerce store screenshot' },
      badge: 'Commerce',
    },
    {
      id: '3',
      title: 'Project Tracker',
      description: 'Kanban boards, task assignment, and time tracking',
      image: { src: 'https://picsum.photos/seed/pt/600/400', alt: 'Project tracker screenshot' },
      badge: 'Productivity',
    },
  ],
  ctaTitle: 'Start Building with Orb',
  ctaSubtitle: 'Open source. Free forever.',
  ctaPrimaryAction: { label: 'Get Started', href: '/docs' },
  ctaSecondaryAction: { label: 'View on GitHub', href: 'https://github.com/almadar-io/orb' },
  communityGithub: 'https://github.com/almadar-io/orb',
  communityDiscord: 'https://discord.gg/q83VjPJx',
};

export const Default: Story = {
  args: {
    entity: MOCK_FULL,
  },
};

const MOCK_MINIMAL: LandingPageEntity = {
  id: 'landing-minimal',
  hero: {
    id: 'hero',
    title: 'Ship faster with ',
    titleAccent: 'Orb',
    subtitle: 'From state machine to production app in minutes.',
    primaryAction: { label: 'Try Now', href: '/try' },
    background: 'gradient',
  },
  features: [
    { id: '1', icon: 'zap', title: 'Fast', description: 'Compile in under 2 seconds.' },
    { id: '2', icon: 'shield-check', title: 'Safe', description: 'Catch errors at compile time.' },
    { id: '3', icon: 'bot', title: 'AI-Ready', description: 'LLMs write valid .orb natively.' },
  ],
  ctaTitle: 'Get Started Today',
  ctaPrimaryAction: { label: 'Read the Docs', href: '/docs' },
};

export const Minimal: Story = {
  args: {
    entity: MOCK_MINIMAL,
  },
};

const MOCK_SERVICE: LandingPageEntity = {
  id: 'landing-service',
  hero: {
    id: 'hero',
    tag: 'Enterprise',
    title: 'Custom Software, ',
    titleAccent: 'Delivered Fast',
    subtitle: 'We build production apps in weeks, not months. Powered by the Orb compiler.',
    primaryAction: { label: 'Book a Demo', href: '/demo' },
    secondaryAction: { label: 'See Case Studies', href: '/cases' },
    background: 'subtle',
  },
  features: [
    { id: '1', icon: 'clock', title: '10x Faster Delivery', description: 'State-machine driven development eliminates boilerplate.' },
    { id: '2', icon: 'shield', title: 'Enterprise Security', description: 'SOC2 compliant infrastructure with role-based access.' },
    { id: '3', icon: 'headphones', title: 'Dedicated Support', description: 'A dedicated engineer on your project from day one.' },
    { id: '4', icon: 'refresh-cw', title: 'Iterative Process', description: 'Weekly demos, continuous deployment, fast feedback loops.' },
  ],
  stats: [
    { id: '1', value: '47', label: 'Projects Delivered' },
    { id: '2', value: '99.9%', label: 'Uptime SLA' },
    { id: '3', value: '< 4 weeks', label: 'Average Delivery' },
  ],
  ctaTitle: 'Ready to Build?',
  ctaSubtitle: 'Talk to our team about your next project.',
  ctaPrimaryAction: { label: 'Book a Demo', href: '/demo' },
};

export const ServiceVariant: Story = {
  args: {
    entity: MOCK_SERVICE,
    variant: 'service',
    featureColumns: 2,
  },
};
