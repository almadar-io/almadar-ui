/**
 * HoMM3WorldMapTemplate Stories
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HoMM3WorldMapTemplate } from './HoMM3WorldMapTemplate';
import { StrategicWorldMap, StrategicCastle, WorldMapHex, WorldMapHero, Resources } from '../types';

const meta: Meta<typeof HoMM3WorldMapTemplate> = {
    title: 'Trait Wars/Templates/HoMM3WorldMapTemplate',
    component: HoMM3WorldMapTemplate,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
    },
};

export default meta;
type Story = StoryObj<typeof HoMM3WorldMapTemplate>;

// Generate a hex grid
function generateHexGrid(width: number, height: number): WorldMapHex[] {
    const hexes: WorldMapHex[] = [];
    const terrains = ['grass', 'grass', 'grass', 'dirt', 'stone', 'grass'];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            hexes.push({
                x,
                y,
                terrain: terrains[Math.floor(Math.random() * terrains.length)] as any,
                movementCost: 1,
                passable: true,
            });
        }
    }

    // Add water (impassable)
    hexes.find(h => h.x === 3 && h.y === 2)!.terrain = 'water';
    hexes.find(h => h.x === 3 && h.y === 2)!.passable = false;
    hexes.find(h => h.x === 3 && h.y === 3)!.terrain = 'water';
    hexes.find(h => h.x === 3 && h.y === 3)!.passable = false;

    // Add features
    hexes.find(h => h.x === 1 && h.y === 1)!.feature = 'goldMine';
    hexes.find(h => h.x === 1 && h.y === 1)!.featureData = { resourceType: 'gold', resourceAmount: 500 };

    hexes.find(h => h.x === 4 && h.y === 1)!.feature = 'resonanceCrystal';
    hexes.find(h => h.x === 4 && h.y === 1)!.featureData = { resourceType: 'resonance', resourceAmount: 50 };

    hexes.find(h => h.x === 2 && h.y === 4)!.feature = 'treasure';
    hexes.find(h => h.x === 2 && h.y === 4)!.featureData = { resourceType: 'gold', resourceAmount: 1000 };

    hexes.find(h => h.x === 0 && h.y === 2)!.feature = 'castle';
    hexes.find(h => h.x === 0 && h.y === 2)!.featureData = { castleId: 'resonator-citadel', owner: 'player' };

    hexes.find(h => h.x === 5 && h.y === 3)!.feature = 'castle';
    hexes.find(h => h.x === 5 && h.y === 3)!.featureData = { castleId: 'dominion-fortress', owner: 'enemy' };

    hexes.find(h => h.x === 3 && h.y === 0)!.feature = 'portal';

    return hexes;
}

const sampleHeroes: WorldMapHero[] = [
    {
        id: 'valence',
        name: 'Unit 734 (Valence)',
        archetype: 'Architect',
        owner: 'player',
        position: { x: 1, y: 2 },
        movement: 5,
        maxMovement: 5,
        army: [
            { id: 'unit-1', unitType: 'worker', name: 'Workers', tier: 1, count: 20, spriteId: 'worker' },
            { id: 'unit-2', unitType: 'guardian', name: 'Guardians', tier: 2, count: 5, spriteId: 'guardian' },
        ],
        level: 5,
        spriteId: 'valence',
    },
    {
        id: 'zahra',
        name: 'Zahra',
        archetype: 'Healer',
        owner: 'player',
        position: { x: 0, y: 3 },
        movement: 4,
        maxMovement: 4,
        army: [
            { id: 'unit-3', unitType: 'mender', name: 'Menders', tier: 1, count: 15, spriteId: 'mender' },
        ],
        level: 3,
        spriteId: 'zahra',
    },
    {
        id: 'tyrant',
        name: 'The Static General',
        archetype: 'Tyrant',
        owner: 'enemy',
        position: { x: 5, y: 2 },
        movement: 6,
        maxMovement: 6,
        army: [
            { id: 'unit-4', unitType: 'scrapper', name: 'Scrappers', tier: 1, count: 30, spriteId: 'scrapper' },
            { id: 'unit-5', unitType: 'breaker', name: 'Breakers', tier: 2, count: 10, spriteId: 'breaker' },
        ],
        level: 8,
        spriteId: 'tyrant',
    },
];

const sampleCastles: StrategicCastle[] = [
    {
        id: 'resonator-citadel',
        name: 'Crystal Nexus',
        faction: 'resonator',
        owner: 'player',
        buildings: [],
        garrison: [],
        defense: 100,
        income: { gold: 500, resonance: 50, traitShards: 5 },
        buildingSlots: [],
    },
    {
        id: 'dominion-fortress',
        name: 'Iron Bastion',
        faction: 'dominion',
        owner: 'enemy',
        buildings: [],
        garrison: [],
        defense: 150,
        income: { gold: 700, resonance: 20, traitShards: 2 },
        buildingSlots: [],
    },
];

const sampleResources: Resources = {
    gold: 5000,
    resonance: 150,
    traitShards: 25,
};

const sampleWorldMap: StrategicWorldMap = {
    id: 'liberation-campaign',
    name: 'The Liberation - Act 1',
    width: 6,
    height: 5,
    hexes: generateHexGrid(6, 5),
    heroes: sampleHeroes,
    castles: sampleCastles,
    playerFaction: 'resonator',
    enemyFaction: 'dominion',
    turnNumber: 1,
    currentPlayer: 'player',
};

function InteractiveWorldMap() {
    const [worldMap, setWorldMap] = useState(sampleWorldMap);
    const [selectedHeroId, setSelectedHeroId] = useState<string | null>('valence');
    const [resources, setResources] = useState(sampleResources);

    const handleHeroMove = (heroId: string, toX: number, toY: number) => {
        setWorldMap((prev) => ({
            ...prev,
            heroes: prev.heroes.map((h) => {
                if (h.id === heroId) {
                    const distance = Math.max(Math.abs(h.position.x - toX), Math.abs(h.position.y - toY));
                    return {
                        ...h,
                        position: { x: toX, y: toY },
                        movement: Math.max(0, h.movement - distance),
                    };
                }
                return h;
            }),
        }));
    };

    const handleCollectResource = (x: number, y: number, type: string, amount: number) => {
        setResources((prev) => ({
            ...prev,
            [type]: (prev as any)[type] + amount,
        }));
        // Remove feature from hex
        setWorldMap((prev) => ({
            ...prev,
            hexes: prev.hexes.map((h) =>
                h.x === x && h.y === y ? { ...h, feature: undefined, featureData: undefined } : h
            ),
        }));
        console.log(`Collected ${amount} ${type}!`);
    };

    const handleEndTurn = () => {
        setWorldMap((prev) => ({
            ...prev,
            turnNumber: prev.turnNumber + 1,
            heroes: prev.heroes.map((h) => ({ ...h, movement: h.maxMovement })),
        }));
        console.log('Turn ended!');
    };

    return (
        <HoMM3WorldMapTemplate
            worldMap={worldMap}
            resources={resources}
            selectedHeroId={selectedHeroId}
            onHeroSelect={setSelectedHeroId}
            onHeroMove={handleHeroMove}
            onEnterCastle={(id) => console.log('Enter castle:', id)}
            onCollectResource={handleCollectResource}
            onBattleEncounter={(a, d) => console.log('Battle:', a, 'vs', d)}
            onEndTurn={handleEndTurn}
        />
    );
}

export const Default: Story = {
    args: {
        worldMap: sampleWorldMap,
        resources: sampleResources,
        selectedHeroId: 'valence',
        onHeroSelect: (id) => console.log('Select hero:', id),
        onHeroMove: (id, x, y) => console.log('Move:', id, 'to', x, y),
        onEndTurn: () => console.log('End turn'),
    },
};

export const Interactive: Story = {
    render: () => <InteractiveWorldMap />,
};
