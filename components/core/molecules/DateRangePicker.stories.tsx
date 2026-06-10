import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateRangePicker } from './DateRangePicker';

const meta: Meta<typeof DateRangePicker> = {
    title: 'Core/Molecules/DateRangePicker',
    component: DateRangePicker,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {},
};

export const Controlled: Story = {
    args: {
        from: '2026-04-01',
        to: '2026-04-30',
    },
};

export const WithBusEvent: Story = {
    args: {
        event: 'DATE_RANGE_CHANGED',
        onChange: (range) => console.log('range changed:', range),
    },
};

export const FinancePresetsOnly: Story = {
    args: {
        event: 'DATE_RANGE_CHANGED',
        presets: [
            { label: 'Q1', value: 'q1', range: () => ({ from: '2026-01-01', to: '2026-03-31' }) },
            { label: 'Q2', value: 'q2', range: () => ({ from: '2026-04-01', to: '2026-06-30' }) },
            { label: 'Q3', value: 'q3', range: () => ({ from: '2026-07-01', to: '2026-09-30' }) },
            { label: 'Q4', value: 'q4', range: () => ({ from: '2026-10-01', to: '2026-12-31' }) },
        ],
    },
};

export const NoPresets: Story = {
    args: {
        presets: [],
    },
};
