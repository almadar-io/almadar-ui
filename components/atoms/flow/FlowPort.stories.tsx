import type { Meta, StoryObj } from '@storybook/react-vite';
import { FlowPort } from './FlowPort';

const meta: Meta<typeof FlowPort> = {
  title: 'Almadar UI/Atoms/Flow/FlowPort',
  component: FlowPort,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'radio', options: ['in', 'out'] },
    connected: { control: 'boolean' },
    compatible: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DisconnectedInput: Story = {
  args: {
    direction: 'in',
    portType: 'string',
    label: 'name',
    connected: false,
  },
};

export const ConnectedOutput: Story = {
  args: {
    direction: 'out',
    portType: 'event',
    label: 'onSubmit',
    connected: true,
  },
};

export const CompatibleDrop: Story = {
  args: {
    direction: 'in',
    portType: 'entity',
    label: 'data',
    connected: false,
    compatible: true,
  },
};

export const NoLabel: Story = {
  args: {
    direction: 'out',
    portType: 'any',
    connected: true,
  },
};
