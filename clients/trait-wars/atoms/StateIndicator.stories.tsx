/**
 * StateIndicator Stories
 *
 * Storybook stories for the StateIndicator component.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { StateIndicator, TraitState } from './StateIndicator';
import { Box } from '@almadar/ui';

const meta: Meta<typeof StateIndicator> = {
    title: 'Trait Wars/Atoms/StateIndicator',
    component: StateIndicator,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        state: {
            control: 'select',
            options: ['idle', 'active', 'attacking', 'defending', 'casting', 'recovering', 'cooldown'],
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        state: 'active',
    },
};

export const AllStates: Story = {
    render: () => (
        <Box display="flex" className="flex-wrap gap-2">
            {(['idle', 'active', 'attacking', 'defending', 'casting', 'recovering', 'cooldown'] as TraitState[]).map((state) => (
                <StateIndicator key={state} state={state} />
            ))}
        </Box>
    ),
};

export const Sizes: Story = {
    render: () => (
        <Box display="flex" className="items-center gap-4">
            <StateIndicator state="attacking" size="sm" />
            <StateIndicator state="attacking" size="md" />
            <StateIndicator state="attacking" size="lg" />
        </Box>
    ),
};

export const CustomLabel: Story = {
    args: {
        state: 'casting',
        label: 'Preparing Spell',
    },
};

export const NoAnimation: Story = {
    args: {
        state: 'attacking',
        animated: false,
    },
};
