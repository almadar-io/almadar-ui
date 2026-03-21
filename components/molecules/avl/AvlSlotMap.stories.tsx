import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlSlotMap } from './AvlSlotMap';

const meta: Meta<typeof AvlSlotMap> = {
  title: 'Avl/Molecules/AvlSlotMap',
  component: AvlSlotMap,
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
      <AvlSlotMap {...args} />
    </div>
  ),
  args: {
    slots: [
      { name: 'header', x: 10, y: 10, width: 340, height: 40 },
      { name: 'sidebar', x: 10, y: 60, width: 100, height: 180 },
      { name: 'main', x: 120, y: 60, width: 230, height: 180 },
    ],
  },
};

export const Complex: Story = {
  render: (args) => (
    <div style={{ width: 500 }}>
      <AvlSlotMap {...args} />
    </div>
  ),
  args: {
    slots: [
      { name: 'nav', x: 10, y: 10, width: 340, height: 30 },
      { name: 'hero', x: 10, y: 50, width: 340, height: 60 },
      { name: 'filters', x: 10, y: 120, width: 80, height: 120 },
      { name: 'content', x: 100, y: 120, width: 160, height: 120 },
      { name: 'aside', x: 270, y: 120, width: 80, height: 120 },
    ],
  },
};
