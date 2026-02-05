import type { Meta, StoryObj } from '@storybook/react';
import { ArmyBuilderTemplate, SquadData } from './ArmyBuilderTemplate';
import type { UnitData } from '../organisms/UnitRoster';

const meta: Meta<typeof ArmyBuilderTemplate> = {
    title: 'Trait Wars/Templates/ArmyBuilderTemplate',
    component: ArmyBuilderTemplate,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
    },
};

export default meta;
type Story = StoryObj<typeof ArmyBuilderTemplate>;

const availableUnits: UnitData[] = [
    { id: '1', name: 'Knight', characterType: 'knight', team: 'player', health: 100, maxHealth: 100, attack: 15, defense: 12, movement: 3, cost: 100, available: 5 },
    { id: '2', name: 'Mage', characterType: 'mage', team: 'player', health: 60, maxHealth: 60, attack: 20, defense: 5, movement: 4, cost: 150, available: 3 },
    { id: '3', name: 'Healer', characterType: 'healer', team: 'player', health: 50, maxHealth: 50, attack: 5, defense: 8, movement: 4, cost: 120, available: 4 },
    { id: '4', name: 'Archer', characterType: 'archer', team: 'player', health: 70, maxHealth: 70, attack: 18, defense: 6, movement: 5, cost: 130, available: 4 },
    { id: '5', name: 'Warrior', characterType: 'warrior', team: 'player', health: 120, maxHealth: 120, attack: 18, defense: 15, movement: 2, cost: 180, available: 2 },
    { id: '6', name: 'Rogue', characterType: 'rogue', team: 'player', health: 65, maxHealth: 65, attack: 22, defense: 4, movement: 6, cost: 140, available: 3 },
];

const sampleSquads: SquadData[] = [
    {
        id: 'squad-1',
        name: 'Alpha Strike',
        heroId: 'emperor',
        heroName: 'The Emperor',
        heroLevel: 7,
        heroArchetype: 'ruler',
        units: [
            { id: 'u1', name: 'Knight', characterType: 'knight', team: 'player', health: 100, maxHealth: 100, attack: 15, defense: 12, movement: 3 },
            { id: 'u2', name: 'Knight', characterType: 'knight', team: 'player', health: 100, maxHealth: 100, attack: 15, defense: 12, movement: 3 },
        ],
        maxUnits: 6,
    },
    {
        id: 'squad-2',
        name: 'Support Wing',
        heroId: 'zahra',
        heroName: 'Zahra',
        heroLevel: 5,
        heroArchetype: 'sage',
        units: [
            { id: 'u3', name: 'Healer', characterType: 'healer', team: 'player', health: 50, maxHealth: 50, attack: 5, defense: 8, movement: 4 },
        ],
        maxUnits: 4,
    },
];

export const Default: Story = {
    args: {
        availableUnits,
        squads: sampleSquads,
        gold: 1250,
        onAddUnit: (unit, squadId) => console.log('Add:', unit.name, 'to', squadId),
        onRemoveUnit: (unitId, squadId) => console.log('Remove:', unitId, 'from', squadId),
        onCreateSquad: () => console.log('Create squad'),
        onDeploy: () => console.log('Deploy army'),
    },
};

export const EmptyArmy: Story = {
    args: {
        availableUnits,
        squads: [],
        gold: 2000,
        onCreateSquad: () => console.log('Create squad'),
    },
};

export const FullSquads: Story = {
    args: {
        availableUnits,
        squads: [
            {
                ...sampleSquads[0],
                units: availableUnits.slice(0, 6).map((u, i) => ({ ...u, id: `full-${i}` })),
            },
        ],
        gold: 500,
    },
};
