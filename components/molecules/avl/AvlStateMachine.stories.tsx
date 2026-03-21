import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlStateMachine } from './AvlStateMachine';

const meta: Meta<typeof AvlStateMachine> = {
  title: 'Avl/Molecules/AvlStateMachine',
  component: AvlStateMachine,
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
  name: 'Default (TodoManager)',
  render: (args) => (
    <div style={{ width: 500 }}>
      <AvlStateMachine {...args} />
    </div>
  ),
  args: {
    states: [
      { name: 'Idle', isInitial: true },
      { name: 'Creating' },
      { name: 'Editing' },
      { name: 'Deleting' },
    ],
    transitions: [
      { from: 'Idle', to: 'Creating', event: 'ADD', effects: ['render-ui'] },
      { from: 'Creating', to: 'Idle', event: 'SAVE', effects: ['persist', 'render-ui'] },
      { from: 'Idle', to: 'Editing', event: 'EDIT', effects: ['render-ui'] },
      { from: 'Editing', to: 'Idle', event: 'SAVE', guard: 'isValid?', effects: ['set', 'render-ui'] },
      { from: 'Idle', to: 'Deleting', event: 'DELETE' },
      { from: 'Deleting', to: 'Idle', event: 'CONFIRM', effects: ['persist'] },
    ],
  },
};

export const Simple: Story = {
  name: 'Simple (Two States)',
  render: (args) => (
    <div style={{ width: 500 }}>
      <AvlStateMachine {...args} />
    </div>
  ),
  args: {
    states: [
      { name: 'Off', isInitial: true },
      { name: 'On', isTerminal: true },
    ],
    transitions: [
      { from: 'Off', to: 'On', event: 'TOGGLE' },
      { from: 'On', to: 'Off', event: 'TOGGLE' },
    ],
  },
};

export const Animated: Story = {
  render: (args) => (
    <div style={{ width: 500 }}>
      <AvlStateMachine {...args} />
    </div>
  ),
  args: {
    ...Default.args,
    animated: true,
  },
};
