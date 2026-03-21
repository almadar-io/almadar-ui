import type { Meta, StoryObj } from '@storybook/react-vite';
import { CommunityOwnership } from './CommunityOwnership';

const meta: Meta<typeof CommunityOwnership> = {
  title: 'Illustrations/CommunityOwnership',
  component: CommunityOwnership,
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
