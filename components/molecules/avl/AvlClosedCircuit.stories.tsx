import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlClosedCircuit } from './AvlClosedCircuit';

const meta: Meta<typeof AvlClosedCircuit> = {
  title: 'Avl/Molecules/AvlClosedCircuit',
  component: AvlClosedCircuit,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  argTypes: {
    animated: { control: 'boolean' },
    color: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 500 }}>
      <AvlClosedCircuit {...args} />
    </div>
  ),
  args: {
    states: [
      { name: 'Event' },
      { name: 'Guard' },
      { name: 'Transition' },
      { name: 'Effects' },
      { name: 'UI' },
    ],
    transitions: [
      { from: 'Event', to: 'Guard', event: 'trigger' },
      { from: 'Guard', to: 'Transition', guard: 'check' },
      { from: 'Transition', to: 'Effects' },
      { from: 'Effects', to: 'UI', effects: ['render-ui'] },
      { from: 'UI', to: 'Event', event: 'user-action' },
    ],
  },
};

export const FiveNodes: Story = {
  render: (args) => (
    <div style={{ width: 500 }}>
      <AvlClosedCircuit {...args} />
    </div>
  ),
  args: {
    ...Default.args,
  },
};

export const Animated: Story = {
  render: (args) => (
    <div style={{ width: 500 }}>
      <AvlClosedCircuit {...args} />
    </div>
  ),
  args: {
    ...Default.args,
    animated: true,
  },
};
