import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlanVerifyRemember } from './PlanVerifyRemember';

const meta: Meta<typeof PlanVerifyRemember> = {
  title: 'Illustrations/PlanVerifyRemember',
  component: PlanVerifyRemember,
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
