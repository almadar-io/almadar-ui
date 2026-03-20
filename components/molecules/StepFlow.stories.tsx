import type { Meta, StoryObj } from '@storybook/react-vite';
import { StepFlow } from './StepFlow';
import { Box } from '../atoms/Box';

const meta: Meta<typeof StepFlow> = {
  title: 'Molecules/StepFlow',
  component: StepFlow,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    showConnectors: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const threeSteps = [
  { title: 'Define Schema', description: 'Write your .orb file with entities and traits.' },
  { title: 'Compile', description: 'Run the Rust compiler to generate the full-stack app.' },
  { title: 'Deploy', description: 'Push to production with a single command.' },
];

export const Default: Story = {
  args: {
    steps: threeSteps,
    orientation: 'horizontal',
  },
  decorators: [
    (Story) => (
      <Box className="w-[640px]">
        <Story />
      </Box>
    ),
  ],
};

export const Vertical: Story = {
  args: {
    steps: threeSteps,
    orientation: 'vertical',
  },
  decorators: [
    (Story) => (
      <Box className="w-96">
        <Story />
      </Box>
    ),
  ],
};

export const WithIcons: Story = {
  args: {
    steps: [
      { title: 'Design', description: 'Create the data model.', icon: 'pencil' },
      { title: 'Build', description: 'Compile to production code.', icon: 'hammer' },
      { title: 'Ship', description: 'Deploy worldwide.', icon: 'rocket' },
    ],
    orientation: 'horizontal',
  },
  decorators: [
    (Story) => (
      <Box className="w-[640px]">
        <Story />
      </Box>
    ),
  ],
};

export const NoConnectors: Story = {
  args: {
    steps: threeSteps,
    orientation: 'horizontal',
    showConnectors: false,
  },
  decorators: [
    (Story) => (
      <Box className="w-[640px]">
        <Story />
      </Box>
    ),
  ],
};

export const FiveSteps: Story = {
  args: {
    steps: [
      { title: 'Plan', description: 'Define requirements.' },
      { title: 'Schema', description: 'Write the .orb file.' },
      { title: 'Validate', description: 'Run orbital validate.' },
      { title: 'Compile', description: 'Generate the app.' },
      { title: 'Deploy', description: 'Ship to production.' },
    ],
    orientation: 'horizontal',
  },
  decorators: [
    (Story) => (
      <Box className="w-[800px]">
        <Story />
      </Box>
    ),
  ],
};
