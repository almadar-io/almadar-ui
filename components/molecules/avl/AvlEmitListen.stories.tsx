import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlEmitListen } from './AvlEmitListen';

const meta: Meta<typeof AvlEmitListen> = {
  title: 'Avl/Molecules/AvlEmitListen',
  component: AvlEmitListen,
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
      <AvlEmitListen {...args} />
    </div>
  ),
  args: {
    emitter: { name: 'Cart', fields: 4 },
    listener: { name: 'Inventory', fields: 3 },
  },
};

export const WithEvent: Story = {
  render: (args) => (
    <div style={{ width: 500 }}>
      <AvlEmitListen {...args} />
    </div>
  ),
  args: {
    emitter: { name: 'Cart', fields: 4 },
    listener: { name: 'Inventory', fields: 3 },
    eventName: 'ITEM_ADDED',
  },
};

export const Animated: Story = {
  render: (args) => (
    <div style={{ width: 500 }}>
      <AvlEmitListen {...args} />
    </div>
  ),
  args: {
    emitter: { name: 'Cart', fields: 4 },
    listener: { name: 'Inventory', fields: 3 },
    eventName: 'ITEM_ADDED',
    animated: true,
  },
};
