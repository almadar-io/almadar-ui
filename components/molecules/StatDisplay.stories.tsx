import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatDisplay } from './StatDisplay';

const meta: Meta<typeof StatDisplay> = {
    title: 'Core/Molecules/StatDisplay',
    component: StatDisplay,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
    argTypes: {
        look: {
            control: 'select',
            options: ['elevated', 'flat', 'progress-backed', 'gauge', 'sparkline'],
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
        variant: {
            control: 'select',
            options: ['default', 'primary', 'success', 'warning', 'error', 'info'],
        },
        compact: { control: 'boolean' },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** ── Section 1 — Sizes/modes ── */

export const Default: Story = {
    args: {
        label: 'Total Revenue',
        value: '$48,210',
        trend: 12.4,
        trendFormat: 'percent',
    },
};

export const WithSparkline: Story = {
    args: {
        label: 'Total Revenue',
        value: '$48,210',
        trend: 12.4,
        trendFormat: 'percent',
        sparklineData: [12, 18, 16, 22, 25, 28],
    },
};

export const Compact: Story = {
    args: {
        label: 'Total Revenue',
        value: '$48,210',
        trend: 12.4,
        trendFormat: 'percent',
        compact: true,
    },
    parameters: {
        docs: { description: { story: 'Inline badge-style stat with no card wrapper.' } },
    },
};

/** ── Section 2 — Layer 2 looks ── */

export const Elevated: Story = {
    args: {
        look: 'elevated',
        label: 'Total Revenue',
        value: '$48,210',
        trend: 12.4,
        trendFormat: 'percent',
    },
    parameters: {
        docs: { description: { story: 'Soft shadow + rounded card — default stat treatment.' } },
    },
};

export const Flat: Story = {
    args: {
        look: 'flat',
        label: 'Total Revenue',
        value: '$48,210',
        trend: 12.4,
        trendFormat: 'percent',
    },
    parameters: {
        docs: { description: { story: 'Hairline border, no shadow.' } },
    },
};

export const ProgressBacked: Story = {
    args: {
        look: 'progress-backed',
        label: 'Total Revenue',
        value: '$48,210',
        trend: 12.4,
        trendFormat: 'percent',
    },
    parameters: {
        docs: { description: { story: '(v1 placeholder — DOM follow-up needed for the positioned bar layer behind the value.)' } },
    },
};

export const Gauge: Story = {
    args: {
        look: 'gauge',
        label: 'Total Revenue',
        value: '$48,210',
        trend: 12.4,
        trendFormat: 'percent',
    },
    parameters: {
        docs: { description: { story: '(v1 placeholder — needs radial/arc SVG layout.)' } },
    },
};

export const SparklineLook: Story = {
    args: {
        look: 'sparkline',
        label: 'Total Revenue',
        value: '$48,210',
        trend: 12.4,
        trendFormat: 'percent',
        sparklineData: [12, 18, 16, 22, 25, 28],
    },
    parameters: {
        docs: { description: { story: 'Inline mini-chart inside the stat card (v1 visual delta is partial — full-width chart below the value is a Phase-2 DOM follow-up).' } },
    },
};

/** ── Section 3 — Trend indicators ── */

export const PositiveDelta: Story = {
    args: {
        label: 'Active Users',
        value: '12,480',
        trend: 8.2,
        trendFormat: 'percent',
    },
};

export const NegativeDelta: Story = {
    args: {
        label: 'Churn Rate',
        value: '3.1%',
        trend: -2.4,
        trendFormat: 'percent',
    },
};
