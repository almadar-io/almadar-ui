import type { Meta, StoryObj } from '@storybook/react-vite';
import { StepFlowOrganism } from './StepFlowOrganism';
import type { StepEntity } from './marketing-types';

const MOCK_STEPS: StepEntity[] = [
  {
    id: '1',
    number: 1,
    title: 'Define Your Schema',
    description: 'Write your entities, traits, and pages in the .orb language.',
    icon: 'file-code',
  },
  {
    id: '2',
    number: 2,
    title: 'Compile',
    description: 'Run orbital compile to generate a full-stack TypeScript application.',
    icon: 'cog',
  },
  {
    id: '3',
    number: 3,
    title: 'Deploy',
    description: 'Ship to production with a single command. Firebase, Vercel, or any platform.',
    icon: 'rocket',
  },
];

const MOCK_STEPS_VERTICAL: StepEntity[] = [
  {
    id: '1',
    number: 1,
    title: 'Create an Account',
    description: 'Sign up with your email or GitHub account in under 30 seconds.',
  },
  {
    id: '2',
    number: 2,
    title: 'Describe Your App',
    description: 'Tell the AI what you want to build in plain language.',
  },
  {
    id: '3',
    number: 3,
    title: 'Review and Iterate',
    description: 'Preview the generated app and make adjustments with natural language.',
  },
  {
    id: '4',
    number: 4,
    title: 'Go Live',
    description: 'Deploy to your domain with built-in CI/CD and monitoring.',
  },
];

const meta: Meta<typeof StepFlowOrganism> = {
  title: 'Organisms/StepFlowOrganism',
  component: StepFlowOrganism,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    entity: MOCK_STEPS,
  },
};

export const WithHeading: Story = {
  args: {
    entity: MOCK_STEPS,
    heading: 'How It Works',
    subtitle: 'Three simple steps from idea to production.',
  },
};

export const Vertical: Story = {
  args: {
    entity: MOCK_STEPS_VERTICAL,
    orientation: 'vertical',
    heading: 'Getting Started',
  },
};

export const NoConnectors: Story = {
  args: {
    entity: MOCK_STEPS,
    showConnectors: false,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    error: new Error('Failed to load steps'),
  },
};
