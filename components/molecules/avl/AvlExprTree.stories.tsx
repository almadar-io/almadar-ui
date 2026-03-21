import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlExprTree } from './AvlExprTree';

const meta: Meta<typeof AvlExprTree> = {
  title: 'Avl/Molecules/AvlExprTree',
  component: AvlExprTree,
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
  name: 'Default (Simple Add)',
  render: (args) => (
    <div style={{ width: 500 }}>
      <AvlExprTree {...args} />
    </div>
  ),
  args: {
    expression: {
      label: '+',
      type: 'operator',
      children: [
        { label: '1', type: 'literal' },
        { label: '2', type: 'literal' },
      ],
    },
  },
};

export const Complex: Story = {
  name: 'Complex (Nested)',
  render: (args) => (
    <div style={{ width: 500 }}>
      <AvlExprTree {...args} />
    </div>
  ),
  args: {
    expression: {
      label: 'if',
      type: 'operator',
      children: [
        {
          label: '>',
          type: 'operator',
          children: [
            { label: 'count', type: 'binding' },
            { label: '0', type: 'literal' },
          ],
        },
        {
          label: 'concat',
          type: 'operator',
          children: [
            { label: 'name', type: 'binding' },
            { label: '" items"', type: 'literal' },
          ],
        },
        { label: '"empty"', type: 'literal' },
      ],
    },
  },
};

export const Bindings: Story = {
  render: (args) => (
    <div style={{ width: 500 }}>
      <AvlExprTree {...args} />
    </div>
  ),
  args: {
    expression: {
      label: 'concat',
      type: 'operator',
      children: [
        { label: 'firstName', type: 'binding' },
        { label: '" "', type: 'literal' },
        { label: 'lastName', type: 'binding' },
      ],
    },
  },
};
