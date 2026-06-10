import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chart } from './Chart';

const meta: Meta<typeof Chart> = {
    title: 'Core/Molecules/Chart',
    component: Chart,
    parameters: {
        layout: 'centered',
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const BarChart: Story = {
    args: {
        title: 'Monthly Revenue',
        subtitle: 'Q4 2025',
        chartType: 'bar',
        series: [
            {
                name: 'Revenue',
                data: [
                    { label: 'Oct', value: 42000 },
                    { label: 'Nov', value: 51000 },
                    { label: 'Dec', value: 67000 },
                ],
                color: 'var(--color-primary)',
            },
        ],
        showValues: true,
        height: 300,
    },
};

export const LineChart: Story = {
    args: {
        title: 'User Growth',
        chartType: 'line',
        series: [
            {
                name: 'Users',
                data: [
                    { label: 'Jan', value: 100 },
                    { label: 'Feb', value: 250 },
                    { label: 'Mar', value: 400 },
                    { label: 'Apr', value: 520 },
                    { label: 'May', value: 700 },
                    { label: 'Jun', value: 950 },
                ],
                color: '#3b82f6',
            },
        ],
        height: 300,
    },
};

export const PieChart: Story = {
    args: {
        title: 'Traffic Sources',
        chartType: 'pie',
        series: [
            {
                name: 'Sources',
                data: [
                    { label: 'Organic', value: 45 },
                    { label: 'Direct', value: 25 },
                    { label: 'Social', value: 20 },
                    { label: 'Referral', value: 10 },
                ],
            },
        ],
        showLegend: true,
        height: 300,
    },
};

export const AreaChart: Story = {
    args: {
        title: 'CPU Usage',
        subtitle: 'Last 24 hours',
        chartType: 'area',
        series: [
            {
                name: 'CPU',
                data: [
                    { label: '00:00', value: 20 },
                    { label: '04:00', value: 15 },
                    { label: '08:00', value: 55 },
                    { label: '12:00', value: 72 },
                    { label: '16:00', value: 65 },
                    { label: '20:00', value: 30 },
                ],
                color: '#10b981',
            },
        ],
        height: 250,
    },
};

export const DonutChart: Story = {
    args: {
        title: 'Budget Allocation',
        chartType: 'donut',
        series: [
            {
                name: 'Budget',
                data: [
                    { label: 'Engineering', value: 40 },
                    { label: 'Marketing', value: 25 },
                    { label: 'Sales', value: 20 },
                    { label: 'Support', value: 15 },
                ],
            },
        ],
        showLegend: true,
        height: 300,
    },
};

export const MultiSeries: Story = {
    args: {
        title: 'Sales vs Expenses',
        chartType: 'bar',
        series: [
            {
                name: 'Sales',
                data: [
                    { label: 'Q1', value: 120 },
                    { label: 'Q2', value: 150 },
                    { label: 'Q3', value: 180 },
                    { label: 'Q4', value: 200 },
                ],
                color: '#3b82f6',
            },
            {
                name: 'Expenses',
                data: [
                    { label: 'Q1', value: 80 },
                    { label: 'Q2', value: 95 },
                    { label: 'Q3', value: 110 },
                    { label: 'Q4', value: 120 },
                ],
                color: '#ef4444',
            },
        ],
        showLegend: true,
        showValues: true,
        height: 300,
    },
};

export const Loading: Story = {
    args: {
        title: 'Loading Chart',
        chartType: 'bar',
        isLoading: true,
        height: 300,
    },
};

export const WithActions: Story = {
    args: {
        title: 'Monthly Performance',
        chartType: 'bar',
        series: [
            {
                name: 'Performance',
                data: [
                    { label: 'Jan', value: 85 },
                    { label: 'Feb', value: 92 },
                    { label: 'Mar', value: 78 },
                ],
            },
        ],
        actions: [
            { label: 'Export', event: 'EXPORT_CHART' },
            { label: 'Refresh', event: 'REFRESH_DATA' },
        ],
        height: 300,
    },
};

/** ── Layer 2 looks ── */

export const BarVertical: Story = {
    args: {
        title: 'Monthly Revenue',
        subtitle: 'Q4 2025',
        series: [
            {
                name: 'Revenue',
                data: [
                    { label: 'Oct', value: 42000 },
                    { label: 'Nov', value: 51000 },
                    { label: 'Dec', value: 67000 },
                ],
                color: 'var(--color-primary)',
            },
        ],
        showValues: true,
        height: 300,
        look: 'bar-vertical',
    },
    parameters: {
        docs: {
            description: {
                story: 'Vertical bar chart for categorical comparison.',
            },
        },
    },
};

export const BarHorizontal: Story = {
    args: {
        title: 'Monthly Revenue',
        subtitle: 'Q4 2025',
        series: [
            {
                name: 'Revenue',
                data: [
                    { label: 'Oct', value: 42000 },
                    { label: 'Nov', value: 51000 },
                    { label: 'Dec', value: 67000 },
                ],
                color: 'var(--color-primary)',
            },
        ],
        showValues: true,
        height: 300,
        look: 'bar-horizontal',
    },
    parameters: {
        docs: {
            description: {
                story: 'Horizontal bar chart for ranked categorical comparison with long labels.',
            },
        },
    },
};

export const Line: Story = {
    args: {
        title: 'User Growth',
        series: [
            {
                name: 'Users',
                data: [
                    { label: 'Jan', value: 100 },
                    { label: 'Feb', value: 250 },
                    { label: 'Mar', value: 400 },
                    { label: 'Apr', value: 520 },
                    { label: 'May', value: 700 },
                    { label: 'Jun', value: 950 },
                ],
                color: '#3b82f6',
            },
        ],
        height: 300,
        look: 'line',
    },
    parameters: {
        docs: {
            description: {
                story: 'Line chart for trends over time.',
            },
        },
    },
};

export const Area: Story = {
    args: {
        title: 'CPU Usage',
        subtitle: 'Last 24 hours',
        series: [
            {
                name: 'CPU',
                data: [
                    { label: '00:00', value: 20 },
                    { label: '04:00', value: 15 },
                    { label: '08:00', value: 55 },
                    { label: '12:00', value: 72 },
                    { label: '16:00', value: 65 },
                    { label: '20:00', value: 30 },
                ],
                color: '#10b981',
            },
        ],
        height: 250,
        look: 'area',
    },
    parameters: {
        docs: {
            description: {
                story: 'Area chart for cumulative trends over time.',
            },
        },
    },
};

export const Pie: Story = {
    args: {
        title: 'Traffic Sources',
        series: [
            {
                name: 'Sources',
                data: [
                    { label: 'Organic', value: 45 },
                    { label: 'Direct', value: 25 },
                    { label: 'Social', value: 20 },
                    { label: 'Referral', value: 10 },
                ],
            },
        ],
        showLegend: true,
        height: 300,
        look: 'pie',
    },
    parameters: {
        docs: {
            description: {
                story: 'Pie chart for part-to-whole proportions.',
            },
        },
    },
};

export const Donut: Story = {
    args: {
        title: 'Budget Allocation',
        series: [
            {
                name: 'Budget',
                data: [
                    { label: 'Engineering', value: 40 },
                    { label: 'Marketing', value: 25 },
                    { label: 'Sales', value: 20 },
                    { label: 'Support', value: 15 },
                ],
            },
        ],
        showLegend: true,
        height: 300,
        look: 'donut',
    },
    parameters: {
        docs: {
            description: {
                story: 'Donut chart for part-to-whole proportions with a center label slot.',
            },
        },
    },
};

export const Scatter: Story = {
    args: {
        title: 'Correlation',
        series: [
            {
                name: 'Points',
                data: [
                    { label: 'A', value: 12 },
                    { label: 'B', value: 28 },
                    { label: 'C', value: 45 },
                    { label: 'D', value: 33 },
                    { label: 'E', value: 60 },
                    { label: 'F', value: 18 },
                ],
                color: '#8b5cf6',
            },
        ],
        height: 300,
        look: 'scatter',
    },
    parameters: {
        docs: {
            description: {
                story: 'Scatter plot for correlation between two variables.',
            },
        },
    },
};

export const Histogram: Story = {
    args: {
        title: 'Distribution',
        series: [
            {
                name: 'Frequency',
                data: [
                    { label: '0-10', value: 5 },
                    { label: '10-20', value: 12 },
                    { label: '20-30', value: 24 },
                    { label: '30-40', value: 18 },
                    { label: '40-50', value: 9 },
                    { label: '50-60', value: 3 },
                ],
                color: '#f59e0b',
            },
        ],
        height: 300,
        look: 'histogram',
    },
    parameters: {
        docs: {
            description: {
                story: 'Histogram for frequency distribution across bins.',
            },
        },
    },
};
