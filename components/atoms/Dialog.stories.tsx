import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dialog } from './Dialog';

const meta: Meta<typeof Dialog> = {
    title: 'Core/Atoms/Dialog',
    component: Dialog,
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
        open: true,
        children: 'Dialog content',
        style: { padding: 16, border: '1px solid #ddd', borderRadius: 8 },
    },
};
