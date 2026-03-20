import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArticleSection } from './ArticleSection';
import { VStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';

const meta: Meta<typeof ArticleSection> = {
  title: 'Molecules/ArticleSection',
  component: ArticleSection,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  argTypes: {
    maxWidth: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Getting Started with Orbital',
    children: (
      <VStack gap="md" align="start">
        <Typography variant="body">
          Orbital is a declarative language for defining full-stack applications.
          You describe your entities, traits, and pages, and the compiler generates
          a complete, type-safe application.
        </Typography>
        <Typography variant="body">
          Each orbital unit consists of an entity (data shape), one or more traits
          (state machines with embedded UI), and pages (routes that bind traits to URLs).
          This composition model lets you build complex applications from simple,
          reusable building blocks.
        </Typography>
      </VStack>
    ),
  },
};

export const SmallWidth: Story = {
  args: {
    title: 'Focused Content',
    maxWidth: 'sm',
    children: (
      <Typography variant="body">
        A narrower container works well for text-heavy content where you want
        to keep line lengths comfortable for reading. The sm variant constrains
        width to max-w-2xl.
      </Typography>
    ),
  },
};

export const LargeWidth: Story = {
  args: {
    title: 'Architecture Overview',
    maxWidth: 'lg',
    children: (
      <VStack gap="md" align="start">
        <Typography variant="body">
          The large width variant (max-w-4xl) gives more horizontal room for content
          that includes code samples, diagrams, or wide tables alongside prose.
        </Typography>
        <Typography variant="body">
          Use this when your section contains mixed content types that benefit
          from the extra breathing room.
        </Typography>
      </VStack>
    ),
  },
};

export const LongContent: Story = {
  args: {
    title: 'Deep Dive: State Machines',
    children: (
      <VStack gap="md" align="start">
        <Typography variant="body">
          State machines are the core abstraction in Orbital. Every user interaction
          triggers a closed circuit: Event, Guard, Transition, Effects, UI Response,
          and back to Event. This guarantees that every possible state is accounted for.
        </Typography>
        <Typography variant="body">
          Guards act as preconditions. Before a transition fires, all guards must pass.
          Guards can check entity fields, compare values, or evaluate complex s-expressions.
          If a guard fails, the transition is blocked and the UI can display validation errors.
        </Typography>
        <Typography variant="body">
          Effects run after a successful transition. They can update entity fields, call
          external services, emit events to other traits, or trigger UI changes like
          opening a modal or showing a toast notification.
        </Typography>
        <Typography variant="body">
          The render-ui effect is particularly powerful. It binds UI patterns to state
          machine states, so the interface automatically reflects the current state.
          When a transition moves from "editing" to "saved", the UI updates without
          any manual DOM manipulation or state management code.
        </Typography>
      </VStack>
    ),
  },
};
