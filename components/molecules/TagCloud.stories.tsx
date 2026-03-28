import type { Meta, StoryObj } from '@storybook/react-vite';
import { TagCloud } from './TagCloud';
import { Box } from '../atoms/Box';

const meta: Meta<typeof TagCloud> = {
  title: 'Marketing/Molecules/TagCloud',
  component: TagCloud,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'accent'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const domainTags = [
  'E-Commerce', 'Healthcare', 'Finance', 'Education', 'Real Estate',
  'Logistics', 'HR', 'CRM', 'ERP', 'IoT',
  'Insurance', 'Legal', 'Manufacturing', 'Retail', 'Travel',
  'Energy', 'Agriculture', 'Telecom',
];

export const Default: Story = {
  args: {
    tags: domainTags,
  },
  decorators: [
    (Story) => (
      <Box className="w-[480px]">
        <Story />
      </Box>
    ),
  ],
};

export const PrimaryVariant: Story = {
  args: {
    tags: domainTags.slice(0, 10),
    variant: 'primary',
  },
  decorators: [
    (Story) => (
      <Box className="w-[480px]">
        <Story />
      </Box>
    ),
  ],
};

export const FewTags: Story = {
  args: {
    tags: ['TypeScript', 'Rust', 'React'],
    variant: 'default',
  },
};

export const WithMixedVariants: Story = {
  args: {
    tags: [
      { label: 'Stable', variant: 'default' },
      { label: 'New', variant: 'primary' },
      { label: 'Beta', variant: 'accent' },
      { label: 'Core', variant: 'default' },
      { label: 'Experimental', variant: 'accent' },
      { label: 'Production', variant: 'primary' },
    ],
  },
  decorators: [
    (Story) => (
      <Box className="w-[480px]">
        <Story />
      </Box>
    ),
  ],
};
