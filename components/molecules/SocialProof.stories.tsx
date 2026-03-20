import type { Meta, StoryObj } from '@storybook/react-vite';
import { SocialProof } from './SocialProof';

const meta: Meta<typeof SocialProof> = {
  title: 'Molecules/SocialProof',
  component: SocialProof,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['logos', 'quotes', 'badges'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'logos',
    items: [
      { name: 'Acme Corp' },
      { name: 'Globex Inc' },
      { name: 'Initech' },
      { name: 'Umbrella Co' },
    ],
  },
};

export const Quotes: Story = {
  args: {
    variant: 'quotes',
    items: [
      {
        name: 'Sarah Chen, CTO at Meridian',
        quote: 'Orbital cut our feature delivery time from weeks to days. The state machine model eliminated an entire class of UI bugs.',
      },
      {
        name: 'Marcus Rivera, Lead Engineer at Flux',
        quote: 'We migrated 40 microservices to orbital units. The compiler catches issues that used to surface in production.',
      },
      {
        name: 'Amina Okafor, VP Engineering at Prism',
        quote: 'The pattern registry alone saved us from rebuilding the same components across six product lines.',
      },
    ],
  },
};

export const Badges: Story = {
  args: {
    variant: 'badges',
    items: [
      { name: 'TypeScript' },
      { name: 'Rust' },
      { name: 'React' },
      { name: 'Tailwind CSS' },
      { name: 'Firebase' },
      { name: 'Vite' },
      { name: 'Playwright' },
      { name: 'S-Expressions' },
    ],
  },
};

export const LogosWithImages: Story = {
  args: {
    variant: 'logos',
    items: [
      { name: 'React', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg' },
      { name: 'TypeScript', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg' },
      { name: 'Rust', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Rust_programming_language_black_logo.svg' },
      { name: 'Vite', logo: 'https://vitejs.dev/logo.svg' },
    ],
  },
};
