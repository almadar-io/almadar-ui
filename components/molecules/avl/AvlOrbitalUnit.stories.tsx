import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlOrbitalUnit } from './AvlOrbitalUnit';

const meta: Meta<typeof AvlOrbitalUnit> = {
  title: 'Avl/Molecules/AvlOrbitalUnit',
  component: AvlOrbitalUnit,
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
      <AvlOrbitalUnit {...args} />
    </div>
  ),
  args: {
    entityName: 'TodoManager',
    fields: 4,
    traits: [
      { name: 'Lifecycle' },
      { name: 'Validation' },
    ],
    pages: [
      { name: '/list' },
      { name: '/detail' },
    ],
  },
};

export const Complex: Story = {
  render: (args) => (
    <div style={{ width: 500 }}>
      <AvlOrbitalUnit {...args} />
    </div>
  ),
  args: {
    entityName: 'CartItem',
    fields: 6,
    traits: [
      { name: 'Lifecycle' },
      { name: 'Pricing' },
      { name: 'Quantity' },
    ],
    pages: [
      { name: '/cart' },
      { name: '/checkout' },
      { name: '/receipt' },
    ],
  },
};

export const Animated: Story = {
  render: (args) => (
    <div style={{ width: 500 }}>
      <AvlOrbitalUnit {...args} />
    </div>
  ),
  args: {
    ...Default.args,
    animated: true,
  },
};
