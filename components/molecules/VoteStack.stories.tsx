import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { VoteStack } from './VoteStack';
import type { VoteValue } from './VoteStack';

const meta: Meta<typeof VoteStack> = {
    title: 'Core/Molecules/VoteStack',
    component: VoteStack,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['vertical', 'horizontal'],
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
        userVote: {
            control: 'select',
            options: [null, 'up', 'down'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        count: 42,
    },
};

export const Vertical: Story = {
    args: {
        count: 128,
        variant: 'vertical',
    },
};

export const Horizontal: Story = {
    args: {
        count: 17,
        variant: 'horizontal',
    },
};

export const Sizes: Story = {
    render: () => (
        <div className="flex items-center gap-4">
            <VoteStack count={3} size="sm" />
            <VoteStack count={42} size="md" />
            <VoteStack count={1024} size="lg" />
        </div>
    ),
};

export const ActiveUp: Story = {
    args: {
        count: 99,
        userVote: 'up',
    },
};

export const ActiveDown: Story = {
    args: {
        count: -4,
        userVote: 'down',
    },
};

export const Disabled: Story = {
    args: {
        count: 12,
        userVote: 'up',
        disabled: true,
    },
};

export const Interactive: Story = {
    render: () => {
        const InteractiveDemo = () => {
            const [vote, setVote] = useState<VoteValue>(null);
            const [count, setCount] = useState<number>(42);

            const handleVote = (next: VoteValue) => {
                const prev = vote;
                let delta = 0;
                if (prev === 'up') delta -= 1;
                if (prev === 'down') delta += 1;
                if (next === 'up') delta += 1;
                if (next === 'down') delta -= 1;
                setCount((c) => c + delta);
                setVote(next);
            };

            return (
                <div className="flex flex-col items-center gap-3">
                    <VoteStack count={count} userVote={vote} onVote={handleVote} />
                    <span className="text-sm text-muted-foreground">
                        userVote: {vote === null ? 'none' : vote}
                    </span>
                </div>
            );
        };
        return <InteractiveDemo />;
    },
};
