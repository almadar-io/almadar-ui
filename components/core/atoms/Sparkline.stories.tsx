import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sparkline } from './Sparkline';

const meta: Meta<typeof Sparkline> = {
    title: 'Core/Atoms/Sparkline',
    component: Sparkline,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
    argTypes: {
        color: {
            control: 'select',
            options: ['auto', 'primary', 'success', 'warning', 'error', 'info', 'muted'],
        },
        width: { control: { type: 'number', min: 40, max: 400 } },
        height: { control: { type: 'number', min: 16, max: 200 } },
        strokeWidth: { control: { type: 'number', min: 1, max: 8 } },
        fill: { control: 'boolean' },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

const trendingUp = [12, 14, 18, 17, 21, 24, 28];
const trendingDown = [42, 38, 35, 32, 28, 22, 19];
const volatile = [10, 25, 12, 30, 14, 28, 18];
const flat = [20, 21, 20, 22, 21, 20, 21];

export const Default: Story = {
    args: { data: trendingUp },
};

export const TrendingUp: Story = {
    args: { data: trendingUp, color: 'auto' },
};

export const TrendingDown: Story = {
    args: { data: trendingDown, color: 'auto' },
};

export const WithFill: Story = {
    args: { data: trendingUp, fill: true, color: 'success' },
};

export const Volatile: Story = {
    args: { data: volatile, color: 'warning' },
};

export const Flat: Story = {
    args: { data: flat, color: 'muted' },
};

export const Wide: Story = {
    args: { data: trendingUp, width: 240, height: 48, fill: true },
};

export const Primary: Story = {
    args: { data: trendingUp, color: 'primary', fill: true },
};
