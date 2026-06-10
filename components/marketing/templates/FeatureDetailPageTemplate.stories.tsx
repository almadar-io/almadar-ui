import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeatureDetailPageTemplate, type FeatureDetailPageEntity } from './FeatureDetailPageTemplate';

const meta: Meta<typeof FeatureDetailPageTemplate> = {
  title: 'Marketing/Templates/FeatureDetailPageTemplate',
  component: FeatureDetailPageTemplate,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof FeatureDetailPageTemplate>;

const MOCK_FULL: FeatureDetailPageEntity = {
  id: 'feature-compiler',
  hero: {
    id: 'hero',
    tag: 'Core Feature',
    title: 'The Orb ',
    titleAccent: 'Compiler',
    subtitle: 'A Rust-based compiler that transforms .orb state machines into production-ready React + TypeScript applications.',
    primaryAction: { label: 'Read the Docs', href: '/docs/compiler' },
    secondaryAction: { label: 'Try It Online', href: '/playground' },
    background: 'dark',
  },
  sections: [
    {
      title: 'Zero-Config Code Generation',
      description: 'Point the compiler at an .orb file and get a complete application. No webpack config, no babel plugins, no boilerplate. The compiler handles routing, state management, API integration, and UI rendering.',
      bullets: [
        'TypeScript + React output with full type safety',
        'Automatic route generation from page definitions',
        'Built-in state management from trait state machines',
        'Server-side API stubs generated from entity schemas',
      ],
      image: { src: 'https://picsum.photos/seed/codegen/600/400', alt: 'Code generation diagram' },
    },
    {
      title: 'Compile-Time Validation',
      description: 'The compiler catches bugs before they reach production. Dead states, orphaned events, broken circuits, missing bindings, and type mismatches are all flagged during compilation.',
      bullets: [
        'State machine completeness checking',
        'Event emission and listener matching',
        'Binding root validation (@entity, @payload, @state)',
        'Pattern prop schema enforcement',
      ],
      image: { src: 'https://picsum.photos/seed/validate/600/400', alt: 'Validation output screenshot' },
    },
    {
      title: 'Pattern-Driven UI',
      description: 'Every render-ui effect maps to a registered pattern. The compiler resolves patterns to concrete components, validates props against the pattern schema, and generates JSX with correct bindings.',
      bullets: [
        '114 built-in patterns covering forms, tables, charts, and more',
        'Custom patterns via project design-system registration',
        'Automatic prop mapping from entity fields',
      ],
      image: { src: 'https://picsum.photos/seed/patterns/600/400', alt: 'Pattern registry visualization' },
    },
    {
      title: 'Performance by Default',
      description: 'The Rust compiler processes schemas in under 2 seconds. Generated applications use tree-shaking, code splitting, and optimized bundle sizes without any manual configuration.',
      bullets: [
        'Sub-2-second compilation for most schemas',
        'Parallel trait compilation for large applications',
        'Minimal runtime overhead in generated code',
      ],
      image: { src: 'https://picsum.photos/seed/perf/600/400', alt: 'Performance benchmarks chart' },
    },
  ],
  ctaTitle: 'Start compiling your first .orb app',
  ctaAction: { label: 'Get Started', href: '/docs/quickstart' },
};

export const Default: Story = {
  args: {
    entity: MOCK_FULL,
  },
};

const MOCK_TWO_SECTIONS: FeatureDetailPageEntity = {
  id: 'feature-ai',
  hero: {
    id: 'hero',
    title: 'AI-Native ',
    titleAccent: 'Development',
    subtitle: 'LLMs generate valid .orb programs because every program is JSON. No syntax hallucination, no invalid output.',
    background: 'gradient',
  },
  sections: [
    {
      title: 'JSON is the Universal Format',
      description: 'Every LLM can produce valid JSON. By making .orb a strict subset of JSON, we eliminated the biggest barrier to AI-generated code: syntax errors.',
      image: { src: 'https://picsum.photos/seed/json/600/400', alt: 'JSON structure diagram' },
    },
    {
      title: 'Trained on 93 Behaviors',
      description: 'Our AI agent has been trained on the full standard library of 93 behaviors across 18 domains, from authentication to e-commerce to scheduling.',
      image: { src: 'https://picsum.photos/seed/train/600/400', alt: 'Training pipeline diagram' },
    },
  ],
  ctaTitle: 'Try AI-powered .orb generation',
  ctaAction: { label: 'Open Playground', href: '/playground' },
};

export const TwoSections: Story = {
  args: {
    entity: MOCK_TWO_SECTIONS,
  },
};

const MOCK_NO_CTA: FeatureDetailPageEntity = {
  id: 'feature-runtime',
  hero: {
    id: 'hero',
    tag: 'Runtime',
    title: 'The Orbital Runtime',
    subtitle: 'A lightweight TypeScript runtime that executes .orb state machines directly, without compilation.',
    background: 'subtle',
  },
  sections: [
    {
      title: 'Interpreted Execution',
      description: 'Load an .orb file and run it immediately. The runtime evaluates guards, fires transitions, and executes effects in real time.',
      bullets: [
        'Hot-reload during development',
        'No compilation step required',
        'Full s-expression evaluator built in',
      ],
      image: { src: 'https://picsum.photos/seed/runtime/600/400', alt: 'Runtime execution flow' },
    },
    {
      title: 'Event Bus Architecture',
      description: 'All communication between traits flows through a centralized event bus. Emit an event from one trait and any listening trait picks it up instantly.',
      image: { src: 'https://picsum.photos/seed/events/600/400', alt: 'Event bus diagram' },
    },
    {
      title: 'Pluggable Services',
      description: 'The runtime supports service plugins for storage, authentication, and external APIs. Swap implementations without changing your .orb code.',
      bullets: [
        'Firebase, Supabase, and REST adapters',
        'Local storage adapter for offline-first apps',
        'Custom service registration API',
      ],
      image: { src: 'https://picsum.photos/seed/plugins/600/400', alt: 'Service plugin architecture' },
    },
  ],
};

export const NoCTA: Story = {
  args: {
    entity: MOCK_NO_CTA,
  },
};
