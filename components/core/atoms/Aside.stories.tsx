import type { Meta, StoryObj } from '@storybook/react-vite';
import { Aside } from './Aside';

const meta: Meta<typeof Aside> = {
    title: 'Core/Atoms/Aside',
    component: Aside,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: 'Aside content (sidebar / callout / nav rail)',
        style: { padding: 16, border: '1px solid #ddd', borderRadius: 8, width: 240 },
    },
};
