import type { Meta, StoryObj } from '@storybook/react-vite';
import { AboutPageTemplate, type AboutPageEntity } from './AboutPageTemplate';

const meta: Meta<typeof AboutPageTemplate> = {
  title: 'Templates/AboutPageTemplate',
  component: AboutPageTemplate,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AboutPageTemplate>;

const MOCK_FULL: AboutPageEntity = {
  id: 'about',
  hero: {
    id: 'hero',
    tag: 'About Us',
    title: 'We build tools for ',
    titleAccent: 'builders',
    subtitle: 'Almadar is a small team with a big belief: software development should be accessible to everyone, not just those who memorized framework APIs.',
    background: 'gradient',
  },
  articles: [
    {
      title: 'Our Mission',
      content: 'We started Almadar because we saw the same problem everywhere: talented people with clear ideas, blocked by the complexity of modern software stacks. React, TypeScript, state management, build tools, deployment pipelines. The gap between "I know what I want to build" and "I can actually build it" keeps growing. Orb closes that gap. You describe your application as a state machine in JSON. The compiler generates the rest. No framework knowledge required. No boilerplate. No configuration.',
    },
    {
      title: 'Why State Machines?',
      content: 'Every application is a state machine, whether developers acknowledge it or not. A login form has states: idle, submitting, error, success. A shopping cart has states: empty, has-items, checking-out, complete. By making this structure explicit in .orb, we gain compile-time validation, automatic UI generation, and AI compatibility. State machines are also the natural output format for LLMs, since they can be represented as JSON without ambiguity.',
    },
  ],
  team: [
    {
      id: '1',
      name: 'Osamah Al-Madari',
      nameAr: 'المداري',
      role: 'Founder & Lead Engineer',
      bio: 'Built the Orb compiler, runtime, and standard library. Previously worked on distributed systems and developer tooling.',
      avatar: 'OA',
    },
    {
      id: '2',
      name: 'Noor Khalil',
      role: 'Design Systems Lead',
      bio: 'Designed and built the 114-pattern Almadar design system. Focused on accessible, theme-aware components.',
      avatar: 'NK',
    },
    {
      id: '3',
      name: 'Tariq Hassan',
      role: 'AI Research',
      bio: 'Leads the Masar neural pipeline for .orb generation. Specializes in graph neural networks and code synthesis.',
      avatar: 'TH',
    },
    {
      id: '4',
      name: 'Layla Mansour',
      role: 'Developer Experience',
      bio: 'Builds the CLI, VS Code extension, and documentation. Makes sure every developer touchpoint feels polished.',
      avatar: 'LM',
    },
  ],
  caseStudies: [
    {
      id: '1',
      title: 'E-Commerce Platform for Souq Al-Medina',
      description: 'Built a full e-commerce platform with cart, checkout, and order management in 3 weeks using 12 standard behaviors.',
      category: 'E-Commerce',
      href: '/cases/souq-al-medina',
    },
    {
      id: '2',
      title: 'Fleet Inspection System',
      description: 'A mobile-first vehicle inspection app with photo capture, GPS tracking, and offline support for 200+ field inspectors.',
      category: 'Enterprise',
      categoryColor: '#4a90d9',
      href: '/cases/fleet-inspection',
    },
    {
      id: '3',
      title: 'Online Learning Platform',
      description: 'Course management, quizzes, progress tracking, and certificates for a university with 5,000 students.',
      category: 'Education',
      categoryColor: '#2ecc71',
      href: '/cases/learning-platform',
    },
  ],
  ctaTitle: 'Want to work with us?',
  ctaAction: { label: 'Get in Touch', href: '/contact' },
};

export const Default: Story = {
  args: {
    entity: MOCK_FULL,
  },
};

const MOCK_ARTICLES_ONLY: AboutPageEntity = {
  id: 'about-simple',
  hero: {
    id: 'hero',
    title: 'Our Story',
    subtitle: 'How a frustrated developer built a compiler and accidentally started a company.',
    background: 'dark',
  },
  articles: [
    {
      title: 'The Problem',
      content: 'In 2024, building a simple CRUD app still required hundreds of files, dozens of configuration decisions, and deep knowledge of at least 5 different tools. We thought that was absurd.',
    },
    {
      title: 'The Solution',
      content: 'We built a compiler that reads a single JSON file describing your application as state machines, and generates a complete, production-ready React + TypeScript app. No decisions to make. No boilerplate to write.',
    },
  ],
};

export const ArticlesOnly: Story = {
  args: {
    entity: MOCK_ARTICLES_ONLY,
  },
};

const MOCK_WITH_TEAM: AboutPageEntity = {
  id: 'about-team',
  hero: {
    id: 'hero',
    tag: 'Team',
    title: 'Meet the team behind ',
    titleAccent: 'Almadar',
    subtitle: 'A distributed team of engineers, designers, and researchers.',
    background: 'subtle',
  },
  articles: [
    {
      title: 'How We Work',
      content: 'We are fully remote and async-first. Each team member owns their domain end-to-end. We ship every week, demo every Friday, and write design docs before writing code.',
    },
  ],
  team: [
    {
      id: '1',
      name: 'Osamah Al-Madari',
      nameAr: 'المداري',
      role: 'Founder',
      bio: 'Compiler, runtime, and standard library.',
      avatar: 'OA',
    },
    {
      id: '2',
      name: 'Noor Khalil',
      role: 'Design',
      bio: 'Design system and component library.',
      avatar: 'NK',
    },
  ],
};

export const WithTeam: Story = {
  args: {
    entity: MOCK_WITH_TEAM,
  },
};
