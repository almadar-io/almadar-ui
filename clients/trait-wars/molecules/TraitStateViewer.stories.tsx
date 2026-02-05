/**
 * TraitStateViewer Stories
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { TraitStateViewer, TraitDefinition } from './TraitStateViewer';
import { Box } from '@almadar/ui';

const meta: Meta<typeof TraitStateViewer> = {
    title: 'Trait Wars/Molecules/TraitStateViewer',
    component: TraitStateViewer,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const aggressiveCaster: TraitDefinition = {
    name: 'AggressiveCaster',
    description: 'Fire mage trait - casts powerful spells with mana cooldown',
    states: ['preparing', 'casting', 'recovering'],
    currentState: 'preparing',
    transitions: [
        { from: 'preparing', to: 'casting', event: 'CAST_SPELL', guardHint: 'Requires 20 mana' },
        { from: 'casting', to: 'recovering', event: 'SPELL_COMPLETE' },
        { from: 'recovering', to: 'preparing', event: 'TICK' },
    ],
};

const defenderTrait: TraitDefinition = {
    name: 'SteadfastDefender',
    description: 'Tanks damage and protects allies',
    states: ['idle', 'defending', 'stunned', 'rallying'],
    currentState: 'defending',
    transitions: [
        { from: 'idle', to: 'defending', event: 'DEFEND' },
        { from: 'defending', to: 'stunned', event: 'HEAVY_ATTACK' },
        { from: 'defending', to: 'idle', event: 'END_TURN' },
        { from: 'stunned', to: 'idle', event: 'RECOVER' },
        { from: 'idle', to: 'rallying', event: 'RALLY', guardHint: 'Allies nearby' },
    ],
};

const assassinTrait: TraitDefinition = {
    name: 'ShadowStriker',
    description: 'Stealth-based combo attacks',
    states: ['hidden', 'stalking', 'striking', 'exposed'],
    currentState: 'stalking',
    transitions: [
        { from: 'hidden', to: 'stalking', event: 'MOVE' },
        { from: 'stalking', to: 'striking', event: 'ATTACK', guardHint: 'Behind target' },
        { from: 'striking', to: 'exposed', event: 'HIT' },
        { from: 'exposed', to: 'hidden', event: 'VANISH', guardHint: '3 turn cooldown' },
    ],
};

export const Default: Story = {
    args: {
        trait: aggressiveCaster,
        size: 'md',
    },
};

export const DefenderInAction: Story = {
    args: {
        trait: defenderTrait,
        size: 'md',
    },
};

export const AssassinStalking: Story = {
    args: {
        trait: assassinTrait,
        size: 'md',
    },
};

export const AllSizes: Story = {
    render: () => (
        <Box display="flex" className="flex-col gap-4">
            <TraitStateViewer trait={aggressiveCaster} size="sm" />
            <TraitStateViewer trait={aggressiveCaster} size="md" />
            <TraitStateViewer trait={aggressiveCaster} size="lg" />
        </Box>
    ),
};

export const WithoutTransitions: Story = {
    args: {
        trait: defenderTrait,
        showTransitions: false,
    },
};

export const MultipleTraits: Story = {
    render: () => (
        <Box display="flex" className="gap-4">
            <TraitStateViewer trait={aggressiveCaster} size="sm" />
            <TraitStateViewer trait={defenderTrait} size="sm" />
            <TraitStateViewer trait={assassinTrait} size="sm" />
        </Box>
    ),
};
