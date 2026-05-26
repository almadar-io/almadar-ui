import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
    title: 'Core/Molecules/EmptyState',
    component: EmptyState,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'success', 'error', 'warning', 'info'],
        },
        look: {
            control: 'select',
            options: ['illustrated', 'icon-only', 'text-only', 'mascot'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        variant: 'default',
        icon: 'inbox',
        title: 'No items yet',
        description: 'Get started by creating your first item.',
        actionLabel: 'Create item',
        onAction: () => {},
    },
};

export const Success: Story = {
    args: {
        variant: 'success',
        icon: 'check-circle',
        title: 'All caught up!',
        description: 'You have no pending tasks.',
    },
};

export const Error: Story = {
    args: {
        variant: 'error',
        icon: 'x-circle',
        title: 'Failed to load',
        description: 'Something went wrong while fetching your data.',
        actionLabel: 'Retry',
        onAction: () => {},
    },
};

export const Warning: Story = {
    args: {
        variant: 'warning',
        icon: 'alert-circle',
        title: 'Approaching your limit',
        description: 'You are nearing the usage cap for this plan.',
    },
};

export const Info: Story = {
    args: {
        variant: 'info',
        icon: 'info',
        title: 'Nothing to show here',
        description: 'Results will appear once data becomes available.',
    },
};

/** ── Layer 2 looks ── */

export const Illustrated: Story = {
    args: {
        look: 'illustrated',
        icon: 'image',
        title: 'No items yet',
        description: 'Get started by creating your first item.',
        actionLabel: 'Create item',
        onAction: () => {},
    },
    parameters: {
        docs: { description: { story: 'SVG illustration above title — undraw-style imagery.' } },
    },
};

export const IconOnly: Story = {
    args: {
        look: 'icon-only',
        icon: 'inbox',
        title: 'No items yet',
        description: 'Get started by creating your first item.',
        actionLabel: 'Create item',
        onAction: () => {},
    },
    parameters: {
        docs: { description: { story: 'Icon + short text — the default product treatment.' } },
    },
};

export const TextOnly: Story = {
    args: {
        look: 'text-only',
        title: 'No items yet',
        description: 'Get started by creating your first item.',
        actionLabel: 'Create item',
        onAction: () => {},
    },
    parameters: {
        docs: { description: { story: 'Pure text, no imagery — minimal.' } },
    },
};

export const Mascot: Story = {
    args: {
        look: 'mascot',
        icon: 'smile',
        title: 'No items yet',
        description: 'Get started by creating your first item.',
        actionLabel: 'Create item',
        onAction: () => {},
    },
    parameters: {
        docs: { description: { story: 'Branded character — Mailchimp / Slack style.' } },
    },
};

export const WithActionEvent: Story = {
    args: {
        icon: 'inbox',
        title: 'No items yet',
        description: 'Clicking the action emits UI:EMPTY_STATE_CTA on the event bus.',
        actionLabel: 'Create item',
        actionEvent: 'EMPTY_STATE_CTA',
    },
};
