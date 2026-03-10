import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatCard } from './StatCard';
import { Users, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';

const meta: Meta<typeof StatCard> = {
    title: 'Organisms/StatCard',
    component: StatCard,
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
        label: 'Total Users',
        value: '2,543',
        icon: Users,
    },
};

export const WithTrend: Story = {
    args: {
        label: 'Revenue',
        value: '$45,231',
        icon: DollarSign,
        previousValue: 38000,
        currentValue: 45231,
    },
};

export const NegativeTrend: Story = {
    args: {
        label: 'Bounce Rate',
        value: '32.5%',
        previousValue: 28,
        currentValue: 32.5,
        invertTrend: true, // Higher is worse
    },
};

export const WithSubtitle: Story = {
    args: {
        label: 'Active Sessions',
        value: '1,234',
        subtitle: 'Real-time active users',
    },
};

export const WithAction: Story = {
    args: {
        label: 'New Orders',
        value: '156',
        icon: ShoppingCart,
        action: {
            label: 'View all orders',
            onClick: () => console.log('View orders clicked'),
        },
    },
};

export const Loading: Story = {
    args: {
        label: 'Loading...',
        isLoading: true,
    },
};

export const DashboardGrid: Story = {
    render: () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-[900px]">
            <StatCard
                label="Total Users"
                value="2,543"
                icon={Users}
                previousValue={2100}
                currentValue={2543}
            />
            <StatCard
                label="Revenue"
                value="$45,231"
                icon={DollarSign}
                previousValue={38000}
                currentValue={45231}
            />
            <StatCard
                label="Orders"
                value="156"
                icon={ShoppingCart}
                previousValue={142}
                currentValue={156}
            />
            <StatCard
                label="Growth"
                value="12.5%"
                icon={TrendingUp}
                previousValue={8.2}
                currentValue={12.5}
            />
        </div>
    ),
};

export const CompactRow: Story = {
    render: () => (
        <div className="flex gap-4">
            <StatCard label="Views" value="15.2K" />
            <StatCard label="Clicks" value="2.4K" />
            <StatCard label="CTR" value="15.8%" />
            <StatCard label="Conversions" value="342" />
        </div>
    ),
};

export const WithSparkline: Story = {
    args: {
        label: 'Daily Active Users',
        value: '2,543',
        icon: Users,
        previousValue: 2100,
        currentValue: 2543,
        sparklineData: [1800, 1920, 2050, 1980, 2200, 2350, 2100, 2400, 2543],
    },
};

export const SparklineDowntrend: Story = {
    args: {
        label: 'Error Rate',
        value: '2.3%',
        previousValue: 1.8,
        currentValue: 2.3,
        invertTrend: true,
        sparklineData: [1.2, 1.5, 1.3, 1.8, 2.1, 1.9, 2.0, 2.3],
    },
};

export const DashboardWithSparklines: Story = {
    render: () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-[900px]">
            <StatCard
                label="Users"
                value="2,543"
                icon={Users}
                previousValue={2100}
                currentValue={2543}
                sparklineData={[1800, 1920, 2050, 1980, 2200, 2543]}
            />
            <StatCard
                label="Revenue"
                value="$45,231"
                icon={DollarSign}
                previousValue={38000}
                currentValue={45231}
                sparklineData={[32000, 35000, 38000, 41000, 43500, 45231]}
            />
            <StatCard
                label="Orders"
                value="156"
                icon={ShoppingCart}
                previousValue={142}
                currentValue={156}
                sparklineData={[120, 135, 142, 138, 150, 156]}
            />
            <StatCard
                label="Growth"
                value="12.5%"
                icon={TrendingUp}
                previousValue={8.2}
                currentValue={12.5}
                sparklineData={[5.1, 6.3, 7.8, 8.2, 10.1, 12.5]}
            />
        </div>
    ),
};
