import type { Meta, StoryObj } from '@storybook/react-vite';
import { FlowLabel } from './FlowLabel';

const meta: Meta<typeof FlowLabel> = {
  title: 'Almadar UI/Atoms/Flow/FlowLabel',
  component: FlowLabel,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'primary', 'warning', 'error'] },
    truncate: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'SUBMIT',
  },
};

export const PrimaryVariant: Story = {
  args: {
    text: 'NAVIGATE',
    variant: 'primary',
  },
};

export const WarningVariant: Story = {
  args: {
    text: 'GUARD_FAILED',
    variant: 'warning',
  },
};

export const Truncated: Story = {
  args: {
    text: 'ON_FORM_VALIDATION_COMPLETE',
    truncate: 16,
    variant: 'default',
  },
};

export const ErrorVariant: Story = {
  args: {
    text: 'ERROR',
    variant: 'error',
  },
};
