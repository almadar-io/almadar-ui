/**
 * HoMM3CastleTemplate Stories
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HoMM3CastleTemplate } from './HoMM3CastleTemplate';
import { StrategicCastle, CastleBuilding, RecruitableUnit, Resources } from '../types';

const meta: Meta<typeof HoMM3CastleTemplate> = {
    title: 'Trait Wars/Templates/HoMM3CastleTemplate',
    component: HoMM3CastleTemplate,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
    },
};

export default meta;
type Story = StoryObj<typeof HoMM3CastleTemplate>;

const resonatorBuildings: CastleBuilding[] = [
    {
        id: 'nexus',
        type: 'townHall',
        name: 'Crystal Nexus',
        level: 2,
        maxLevel: 5,
        description: 'The heart of the citadel. Amplifies resonance energy.',
        cost: { gold: 1000, resonance: 100 },
    },
    {
        id: 'well',
        type: 'resonanceWell',
        name: 'Harmonic Well',
        level: 1,
        maxLevel: 3,
        description: 'Generates resonance energy each turn.',
        cost: { gold: 500, crystal: 30 },
    },
    {
        id: 'forge',
        type: 'traitForge',
        name: 'Trait Synthesizer',
        level: 0,
        maxLevel: 5,
        description: 'Create and upgrade traits for your units.',
        cost: { gold: 800, traitShards: 10 },
    },
    {
        id: 'tower',
        type: 'arcaneTower',
        name: 'Prismatic Spire',
        level: 1,
        maxLevel: 3,
        description: 'Trains arcane units and provides magical defense.',
        cost: { gold: 600, crystal: 50 },
    },
    {
        id: 'archive',
        type: 'library',
        name: 'Memory Archive',
        level: 0,
        maxLevel: 3,
        description: 'Research upgrades and unlock new abilities.',
        cost: { gold: 400, crystal: 20 },
    },
    {
        id: 'rift',
        type: 'portal',
        name: 'Dimensional Rift',
        level: 0,
        maxLevel: 1,
        description: 'Enables teleportation to allied castles.',
        cost: { gold: 1500, crystal: 100, resonance: 50 },
    },
];

const resonatorCastle: StrategicCastle = {
    id: 'crystal-nexus',
    name: 'Crystal Nexus',
    faction: 'resonator',
    owner: 'player',
    buildings: resonatorBuildings,
    garrison: [
        { id: 'g1', unitType: 'worker', name: 'Workers', tier: 1, count: 20, spriteId: 'worker' },
        { id: 'g2', unitType: 'mender', name: 'Menders', tier: 1, count: 10, spriteId: 'mender' },
        { id: 'g3', unitType: 'resonator', name: 'Resonators', tier: 3, count: 5, spriteId: 'resonator' },
    ],
    defense: 200,
    income: { gold: 500, resonance: 50, traitShards: 5 },
    buildingSlots: [],
};

const dominionBuildings: CastleBuilding[] = [
    {
        id: 'command',
        type: 'townHall',
        name: 'Command Center',
        level: 3,
        maxLevel: 5,
        description: 'Military headquarters coordinating all operations.',
        cost: { gold: 1000 },
    },
    {
        id: 'barracks',
        type: 'barracks',
        name: 'Military Complex',
        level: 2,
        maxLevel: 3,
        description: 'Trains infantry and ground forces.',
        cost: { gold: 200 },
    },
    {
        id: 'bay',
        type: 'stables',
        name: 'Mech Bay',
        level: 1,
        maxLevel: 3,
        description: 'Produces assault mechs and vehicles.',
        cost: { gold: 400 },
    },
    {
        id: 'bastion',
        type: 'fortress',
        name: 'Siege Bastion',
        level: 2,
        maxLevel: 3,
        description: 'Heavy fortifications providing maximum defense.',
        cost: { gold: 1000, stone: 200 },
    },
    {
        id: 'depot',
        type: 'marketplace',
        name: 'Supply Depot',
        level: 1,
        maxLevel: 3,
        description: 'Manages logistics and resource distribution.',
        cost: { gold: 250 },
    },
    {
        id: 'vault',
        type: 'treasury',
        name: 'Resource Vault',
        level: 1,
        maxLevel: 3,
        description: 'Secure storage increasing gold capacity.',
        cost: { gold: 300 },
    },
];

const dominionCastle: StrategicCastle = {
    id: 'iron-bastion',
    name: 'Iron Bastion',
    faction: 'dominion',
    owner: 'player',
    buildings: dominionBuildings,
    garrison: [
        { id: 'g1', unitType: 'scrapper', name: 'Scrappers', tier: 1, count: 30, spriteId: 'scrapper' },
        { id: 'g2', unitType: 'guardian', name: 'Guardians', tier: 2, count: 15, spriteId: 'guardian' },
        { id: 'g3', unitType: 'breaker', name: 'Breakers', tier: 2, count: 8, spriteId: 'breaker' },
    ],
    defense: 350,
    income: { gold: 700, resonance: 20, traitShards: 2 },
    buildingSlots: [],
};

const availableUnits: RecruitableUnit[] = [
    {
        id: 'worker',
        name: 'Worker',
        tier: 1,
        cost: { gold: 50 },
        available: 20,
        maxPerTurn: 10,
        spriteId: 'worker',
        stats: { health: 20, attack: 5, defense: 2, speed: 4 },
        trait: 'Trust',
        description: 'Basic utility unit. Low combat, high utility.',
    },
    {
        id: 'mender',
        name: 'Mender',
        tier: 1,
        cost: { gold: 80, resonance: 10 },
        available: 10,
        maxPerTurn: 5,
        spriteId: 'mender',
        stats: { health: 25, attack: 3, defense: 3, speed: 3 },
        trait: 'Mend',
        description: 'Healer unit. Can restore health to allies.',
    },
    {
        id: 'resonator',
        name: 'Resonator',
        tier: 3,
        cost: { gold: 200, resonance: 50 },
        available: 5,
        maxPerTurn: 2,
        spriteId: 'resonator',
        stats: { health: 60, attack: 25, defense: 15, speed: 5 },
        trait: 'Connect',
        description: 'Synergy specialist. Boosts adjacent allies.',
    },
    {
        id: 'archivist',
        name: 'Archivist',
        tier: 4,
        cost: { gold: 500, resonance: 100, traitShards: 5 },
        available: 2,
        maxPerTurn: 1,
        spriteId: 'archivist',
        stats: { health: 100, attack: 40, defense: 30, speed: 4 },
        trait: 'Archive',
        description: 'Elite sage unit. Powerful abilities and high stats.',
    },
];

const sampleResources: Resources = {
    gold: 5000,
    resonance: 200,
    traitShards: 30,
    crystal: 50,
    stone: 100,
};

export const ResonatorCitadel: Story = {
    args: {
        castle: resonatorCastle,
        resources: sampleResources,
        availableUnits,
        onBuild: (id) => console.log('Build:', id),
        onRecruit: (id, count) => console.log('Recruit:', id, 'x', count),
        onExit: () => console.log('Exit castle'),
    },
};

export const DominionFortress: Story = {
    args: {
        castle: dominionCastle,
        resources: sampleResources,
        availableUnits: [
            { ...availableUnits[0], id: 'scrapper', name: 'Scrapper', trait: 'Endure' },
            { ...availableUnits[1], id: 'guardian', name: 'Guardian', tier: 2, trait: 'Defend' },
            { ...availableUnits[2], id: 'breaker', name: 'Breaker', tier: 2, trait: 'Disrupt' },
        ],
        onBuild: (id) => console.log('Build:', id),
        onRecruit: (id, count) => console.log('Recruit:', id, 'x', count),
        onExit: () => console.log('Exit castle'),
    },
};

export const EmptyCastle: Story = {
    args: {
        castle: {
            ...resonatorCastle,
            buildings: resonatorBuildings.map((b) => ({ ...b, level: 0 })),
            garrison: [],
        },
        resources: { gold: 2000, resonance: 50, traitShards: 5 },
        availableUnits: [],
        onBuild: (id) => console.log('Build:', id),
        onExit: () => console.log('Exit castle'),
    },
};
