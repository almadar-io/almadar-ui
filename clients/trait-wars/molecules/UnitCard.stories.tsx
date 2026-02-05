/**
 * UnitCard Stories
 *
 * Storybook stories for the UnitCard molecule.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { UnitCard, UnitEntity } from './UnitCard';
import { Box } from '@almadar/ui';
import { action } from 'storybook/actions';

const meta: Meta<typeof UnitCard> = {
    title: 'Trait Wars/Molecules/UnitCard',
    component: UnitCard,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleUnit: UnitEntity = {
    id: 'unit-1',
    name: 'Knight Captain',
    health: 8,
    maxHealth: 10,
    attack: 5,
    defense: 3,
    movement: 2,
    owner: 'player',
    level: 5,
    equippedTraits: [
        { name: 'attacker', state: 'ready' },
        { name: 'defender', state: 'cooldown', cooldownTurns: 1 },
    ],
};

const enemyUnit: UnitEntity = {
    id: 'unit-2',
    name: 'Dark Mage',
    health: 4,
    maxHealth: 6,
    attack: 7,
    defense: 1,
    movement: 3,
    owner: 'enemy',
    level: 4,
    equippedTraits: [
        { name: 'summoner', state: 'ready' },
        { name: 'healer', state: 'active' },
    ],
};

export const Default: Story = {
    args: {
        unit: sampleUnit,
        onTraitClick: action('onTraitClick'),
        onClick: action('onClick'),
    },
};

export const Selected: Story = {
    args: {
        unit: sampleUnit,
        isSelected: true,
        onTraitClick: action('onTraitClick'),
    },
};

export const Compact: Story = {
    args: {
        unit: sampleUnit,
        compact: true,
    },
};

export const EnemyUnit: Story = {
    args: {
        unit: enemyUnit,
        onTraitClick: action('onTraitClick'),
    },
};

export const LowHealth: Story = {
    args: {
        unit: {
            ...sampleUnit,
            health: 2,
        },
    },
};

export const NoTraits: Story = {
    args: {
        unit: {
            ...sampleUnit,
            equippedTraits: [],
        },
    },
};

export const MultipleCards: Story = {
    render: () => (
        <Box display="flex" className="gap-4">
            <UnitCard unit={sampleUnit} />
            <UnitCard unit={enemyUnit} />
        </Box>
    ),
};
