import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TraitSlot, TraitData } from './TraitSlot';
import { Box, HStack, VStack, Typography } from '@almadar/ui';

const meta: Meta<typeof TraitSlot> = {
    title: 'Trait Wars/Molecules/TraitSlot',
    component: TraitSlot,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
};

export default meta;
type Story = StoryObj<typeof TraitSlot>;

const combatTrait: TraitData = {
    id: 'berserker-rage',
    name: 'Berserker Rage',
    category: 'combat',
    description: 'Increases damage when health is low',
    stateMachine: {
        name: 'Berserker Rage',
        states: ['idle', 'attacking', 'enraged', 'exhausted'],
        currentState: 'idle',
        transitions: [
            { from: 'idle', to: 'attacking', event: 'ATTACK' },
            { from: 'attacking', to: 'enraged', event: 'KILL' },
            { from: 'enraged', to: 'exhausted', event: 'END_TURN' },
            { from: 'exhausted', to: 'idle', event: 'RECOVER' },
        ],
        description: '+50% damage when enraged',
    },
};

const supportTrait: TraitData = {
    id: 'healing-aura',
    name: 'Healing Aura',
    category: 'support',
    description: 'Heals nearby allies each turn',
    stateMachine: {
        name: 'Healing Aura',
        states: ['idle', 'charging', 'healing'],
        currentState: 'idle',
        transitions: [
            { from: 'idle', to: 'charging', event: 'START_TURN' },
            { from: 'charging', to: 'healing', event: 'HEAL' },
            { from: 'healing', to: 'idle', event: 'END_TURN' },
        ],
        description: 'Heals 10 HP to adjacent allies',
    },
};

const utilityTrait: TraitData = {
    id: 'swift-movement',
    name: 'Swift Movement',
    category: 'utility',
    description: 'Increases movement range by 2',
    stateMachine: {
        name: 'Swift Movement',
        states: ['ready', 'sprinting', 'recovering'],
        currentState: 'ready',
        transitions: [
            { from: 'ready', to: 'sprinting', event: 'MOVE' },
            { from: 'sprinting', to: 'recovering', event: 'END_MOVE' },
            { from: 'recovering', to: 'ready', event: 'START_TURN' },
        ],
        description: '+2 movement range when sprinting',
    },
};

export const EmptySlot: Story = {
    args: {
        slotNumber: 1,
        size: 'lg',
    },
};

export const EquippedSlot: Story = {
    args: {
        slotNumber: 1,
        equippedTrait: combatTrait,
        size: 'lg',
        onRemove: () => console.log('Remove trait'),
    },
};

export const LockedSlot: Story = {
    args: {
        slotNumber: 3,
        locked: true,
        unlockLevel: 10,
        size: 'lg',
    },
};

export const AllCategories: Story = {
    render: () => (
        <HStack gap={4}>
            <VStack align="center" gap={2}>
                <TraitSlot slotNumber={1} equippedTrait={combatTrait} size="lg" />
                <Typography variant="caption" className="text-gray-400">Combat</Typography>
            </VStack>
            <VStack align="center" gap={2}>
                <TraitSlot slotNumber={2} equippedTrait={supportTrait} size="lg" />
                <Typography variant="caption" className="text-gray-400">Support</Typography>
            </VStack>
            <VStack align="center" gap={2}>
                <TraitSlot slotNumber={3} equippedTrait={utilityTrait} size="lg" />
                <Typography variant="caption" className="text-gray-400">Utility</Typography>
            </VStack>
            <VStack align="center" gap={2}>
                <TraitSlot slotNumber={4} equippedTrait={{ id: 'passive', name: 'Passive', category: 'passive' }} size="lg" />
                <Typography variant="caption" className="text-gray-400">Passive</Typography>
            </VStack>
        </HStack>
    ),
};

export const HeroTraitSlots: Story = {
    render: () => (
        <VStack gap={4} align="center">
            <Typography variant="h4" className="text-white">Hero Trait Slots</Typography>
            <HStack gap={3}>
                <TraitSlot slotNumber={1} equippedTrait={combatTrait} size="lg" onRemove={() => { }} />
                <TraitSlot slotNumber={2} equippedTrait={supportTrait} size="lg" onRemove={() => { }} />
                <TraitSlot slotNumber={3} size="lg" />
                <TraitSlot slotNumber={4} locked unlockLevel={5} size="lg" />
                <TraitSlot slotNumber={5} locked unlockLevel={10} size="lg" />
            </HStack>
            <Typography variant="caption" className="text-gray-500">
                Equip traits to enhance your hero's abilities
            </Typography>
        </VStack>
    ),
};

export const AllSizes: Story = {
    render: () => (
        <HStack gap={4} align="end">
            <VStack align="center">
                <TraitSlot slotNumber={1} equippedTrait={combatTrait} size="sm" />
                <Typography variant="caption" className="text-gray-400">Small</Typography>
            </VStack>
            <VStack align="center">
                <TraitSlot slotNumber={1} equippedTrait={combatTrait} size="md" />
                <Typography variant="caption" className="text-gray-400">Medium</Typography>
            </VStack>
            <VStack align="center">
                <TraitSlot slotNumber={1} equippedTrait={combatTrait} size="lg" />
                <Typography variant="caption" className="text-gray-400">Large</Typography>
            </VStack>
        </HStack>
    ),
};
