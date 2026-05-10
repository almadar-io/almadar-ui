import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DunningBanner } from './DunningBanner';

const meta: Meta<typeof DunningBanner> = {
    title: 'Core/Molecules/DunningBanner',
    component: DunningBanner,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
    argTypes: {
        severity: {
            control: 'select',
            options: ['soft', 'urgent', 'final'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

const wide = (Story: () => ReactElement) => (
    <div className="w-[520px]">
        <Story />
    </div>
);

export const Soft: Story = {
    args: {
        severity: 'soft',
        amountDue: 29.99,
        currency: 'USD',
        failedAt: 'May 7, 2026',
        attemptNumber: 1,
        attemptsTotal: 4,
        onUpdatePayment: () => {},
        onContactSupport: () => {},
    },
    decorators: [wide],
};

export const Urgent: Story = {
    args: {
        severity: 'urgent',
        amountDue: 29.99,
        currency: 'USD',
        failedAt: 'May 7, 2026',
        nextRetryAt: 'May 10, 2026',
        attemptNumber: 2,
        attemptsTotal: 4,
        onUpdatePayment: () => {},
        onContactSupport: () => {},
    },
    decorators: [wide],
};

export const Final: Story = {
    args: {
        severity: 'final',
        amountDue: 29.99,
        currency: 'USD',
        failedAt: 'May 7, 2026',
        attemptNumber: 4,
        attemptsTotal: 4,
        onUpdatePayment: () => {},
        onContactSupport: () => {},
    },
    decorators: [wide],
};

export const WithRetrySchedule: Story = {
    args: {
        severity: 'urgent',
        amountDue: 49.0,
        currency: 'USD',
        failedAt: '2026-05-07T14:23:00Z',
        nextRetryAt: '2026-05-10T14:23:00Z',
        attemptNumber: 2,
        attemptsTotal: 4,
        onUpdatePayment: () => {},
        onContactSupport: () => {},
    },
    decorators: [wide],
};

export const Dismissible: Story = {
    args: {
        severity: 'soft',
        amountDue: 19.99,
        currency: 'USD',
        failedAt: 'May 7, 2026',
        dismissible: true,
        onUpdatePayment: () => {},
        onDismiss: () => {},
    },
    decorators: [wide],
};

export const WithoutDismiss: Story = {
    args: {
        severity: 'final',
        amountDue: 99.0,
        currency: 'USD',
        failedAt: 'May 7, 2026',
        attemptNumber: 4,
        attemptsTotal: 4,
        dismissible: false,
        onUpdatePayment: () => {},
        onContactSupport: () => {},
        onDismiss: () => {},
    },
    decorators: [wide],
};

export const AmountFormatted: Story = {
    args: {
        severity: 'urgent',
        amountDue: 1499.5,
        currency: 'EUR',
        failedAt: '7 May 2026',
        nextRetryAt: '10 May 2026',
        attemptNumber: 3,
        attemptsTotal: 4,
        onUpdatePayment: () => {},
        onContactSupport: () => {},
    },
    decorators: [wide],
};
