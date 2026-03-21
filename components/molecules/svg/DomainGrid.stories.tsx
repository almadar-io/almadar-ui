import type { Meta, StoryObj } from '@storybook/react-vite';
import { DomainGrid } from './DomainGrid';

const meta: Meta<typeof DomainGrid> = {
  title: 'Illustrations/DomainGrid',
  component: DomainGrid,
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
  decorators: [(Story) => <div style={{ width: 500 }}><Story /></div>],
};

export const Animated: Story = {
  args: { animated: true },
  decorators: [(Story) => <div style={{ width: 500 }}><Story /></div>],
};
