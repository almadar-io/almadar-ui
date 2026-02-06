/**
 * CanvasWorldMapTemplate Stories
 *
 * Canvas-based world map with isometric terrain, hero sprites, and features.
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CanvasWorldMapTemplate } from './CanvasWorldMapTemplate';
import { StrategicWorldMap, StrategicCastle, WorldMapHex, WorldMapHero, Resources } from '../types';
import { TraitWarsAssetProvider, DEFAULT_ASSET_MANIFEST } from '../assets';

const meta: Meta<typeof CanvasWorldMapTemplate> = {
    title: 'Trait Wars/Templates/CanvasWorldMapTemplate',
    component: CanvasWorldMapTemplate,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
        docs: {
            description: {
                component: 'Canvas-based isometric world map with asset-loaded sprites, hero movement, and strategic overlay panels.',
            },
        },
    },
    decorators: [
        (Story) => (
            <TraitWarsAssetProvider manifest={DEFAULT_ASSET_MANIFEST}>
                <Story />
            </TraitWarsAssetProvider>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof CanvasWorldMapTemplate>;

// ============================================================================
// SAMPLE DATA
// ============================================================================

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

    // Water tiles (impassable)
    const waterHex1 = hexes.find(h => h.x === 3 && h.y === 2);
    if (waterHex1) { waterHex1.terrain = 'water'; waterHex1.passable = false; }
    const waterHex2 = hexes.find(h => h.x === 3 && h.y === 3);
    if (waterHex2) { waterHex2.terrain = 'water'; waterHex2.passable = false; }

    // Features
    const goldMine = hexes.find(h => h.x === 1 && h.y === 1);
    if (goldMine) { goldMine.feature = 'goldMine'; goldMine.featureData = { resourceType: 'gold', resourceAmount: 500 }; }

    const crystal = hexes.find(h => h.x === 4 && h.y === 1);
    if (crystal) { crystal.feature = 'resonanceCrystal'; crystal.featureData = { resourceType: 'resonance', resourceAmount: 50 }; }

    const treasure = hexes.find(h => h.x === 2 && h.y === 4);
    if (treasure) { treasure.feature = 'treasure'; treasure.featureData = { resourceType: 'gold', resourceAmount: 1000 }; }

    const playerCastle = hexes.find(h => h.x === 0 && h.y === 2);
    if (playerCastle) { playerCastle.feature = 'castle'; playerCastle.featureData = { castleId: 'resonator-citadel', owner: 'player' }; }

    const enemyCastle = hexes.find(h => h.x === 5 && h.y === 3);
    if (enemyCastle) { enemyCastle.feature = 'castle'; enemyCastle.featureData = { castleId: 'dominion-fortress', owner: 'enemy' }; }

    const portal = hexes.find(h => h.x === 3 && h.y === 0);
    if (portal) { portal.feature = 'portal'; }

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

// ============================================================================
// STORIES
// ============================================================================

export const Default: Story = {
    args: {
        worldMap: sampleWorldMap,
        resources: sampleResources,
        selectedHeroId: 'valence',
        scale: 0.4,
    },
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
        setWorldMap((prev) => ({
            ...prev,
            hexes: prev.hexes.map((h) =>
                h.x === x && h.y === y ? { ...h, feature: undefined, featureData: undefined } : h
            ),
        }));
    };

    const handleEndTurn = () => {
        setWorldMap((prev) => ({
            ...prev,
            turnNumber: prev.turnNumber + 1,
            heroes: prev.heroes.map((h) => ({ ...h, movement: h.maxMovement })),
        }));
    };

    return (
        <CanvasWorldMapTemplate
            worldMap={worldMap}
            resources={resources}
            selectedHeroId={selectedHeroId}
            onHeroSelect={setSelectedHeroId}
            onHeroMove={handleHeroMove}
            onEnterCastle={(id) => console.log('Enter castle:', id)}
            onCollectResource={handleCollectResource}
            onBattleEncounter={(a, d) => console.log('Battle:', a, 'vs', d)}
            onEndTurn={handleEndTurn}
            scale={0.4}
        />
    );
}

export const Interactive: Story = {
    render: () => <InteractiveWorldMap />,
};

/**
 * Larger map with more features
 */
function LargeMapDemo() {
    const largeHexes = (() => {
        const hexes: WorldMapHex[] = [];
        const terrains = ['grass', 'grass', 'dirt', 'stone', 'grass', 'grass', 'dirt'];

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 10; x++) {
                hexes.push({
                    x, y,
                    terrain: terrains[Math.floor(Math.random() * terrains.length)] as any,
                    movementCost: 1,
                    passable: true,
                });
            }
        }

        // Water river
        for (let y = 2; y < 6; y++) {
            const hex = hexes.find(h => h.x === 5 && h.y === y);
            if (hex) { hex.terrain = 'water'; hex.passable = false; }
        }

        // Features
        hexes.find(h => h.x === 2 && h.y === 1)!.feature = 'goldMine';
        hexes.find(h => h.x === 2 && h.y === 1)!.featureData = { resourceType: 'gold', resourceAmount: 500 };
        hexes.find(h => h.x === 7 && h.y === 2)!.feature = 'resonanceCrystal';
        hexes.find(h => h.x === 7 && h.y === 2)!.featureData = { resourceType: 'resonance', resourceAmount: 100 };
        hexes.find(h => h.x === 4 && h.y === 6)!.feature = 'treasure';
        hexes.find(h => h.x === 4 && h.y === 6)!.featureData = { resourceType: 'gold', resourceAmount: 2000 };
        hexes.find(h => h.x === 1 && h.y === 4)!.feature = 'portal';
        hexes.find(h => h.x === 8 && h.y === 5)!.feature = 'salvageYard';
        hexes.find(h => h.x === 8 && h.y === 5)!.featureData = { resourceType: 'traitShards', resourceAmount: 10 };
        hexes.find(h => h.x === 0 && h.y === 0)!.feature = 'castle';
        hexes.find(h => h.x === 0 && h.y === 0)!.featureData = { castleId: 'player-base', owner: 'player' };
        hexes.find(h => h.x === 9 && h.y === 7)!.feature = 'castle';
        hexes.find(h => h.x === 9 && h.y === 7)!.featureData = { castleId: 'enemy-base', owner: 'enemy' };
        // Additional feature types
        hexes.find(h => h.x === 6 && h.y === 1)!.feature = 'powerNode';
        hexes.find(h => h.x === 3 && h.y === 6)!.feature = 'dataVault';
        hexes.find(h => h.x === 8 && h.y === 0)!.feature = 'portalClosed';
        hexes.find(h => h.x === 6 && h.y === 6)!.feature = 'battleMarker';
        hexes.find(h => h.x === 1 && h.y === 7)!.feature = 'traitCache';
        hexes.find(h => h.x === 1 && h.y === 7)!.featureData = { resourceType: 'traitShards', resourceAmount: 15 };

        return hexes;
    })();

    const largeMap: StrategicWorldMap = {
        id: 'large-campaign',
        name: 'The Great Expanse',
        width: 10,
        height: 8,
        hexes: largeHexes,
        heroes: [
            ...sampleHeroes,
            {
                id: 'hareth',
                name: 'Captain Hareth',
                archetype: 'Hero',
                owner: 'player',
                position: { x: 2, y: 5 },
                movement: 6,
                maxMovement: 6,
                army: [
                    { id: 'unit-6', unitType: 'guardian', name: 'Guardians', tier: 2, count: 12, spriteId: 'guardian' },
                    { id: 'unit-7', unitType: 'strider', name: 'Striders', tier: 2, count: 8, spriteId: 'strider' },
                ],
                level: 7,
                spriteId: 'hareth',
            },
        ],
        castles: sampleCastles,
        playerFaction: 'resonator',
        enemyFaction: 'dominion',
        turnNumber: 5,
        currentPlayer: 'player',
    };

    const [worldMap, setWorldMap] = useState(largeMap);
    const [selectedHeroId, setSelectedHeroId] = useState<string | null>('valence');
    const [resources, setResources] = useState({ gold: 8000, resonance: 300, traitShards: 40 });

    const handleHeroMove = (heroId: string, toX: number, toY: number) => {
        setWorldMap((prev) => ({
            ...prev,
            heroes: prev.heroes.map((h) => {
                if (h.id === heroId) {
                    const distance = Math.max(Math.abs(h.position.x - toX), Math.abs(h.position.y - toY));
                    return { ...h, position: { x: toX, y: toY }, movement: Math.max(0, h.movement - distance) };
                }
                return h;
            }),
        }));
    };

    const handleEndTurn = () => {
        setWorldMap((prev) => ({
            ...prev,
            turnNumber: prev.turnNumber + 1,
            heroes: prev.heroes.map((h) => ({ ...h, movement: h.maxMovement })),
        }));
    };

    return (
        <CanvasWorldMapTemplate
            worldMap={worldMap}
            resources={resources}
            selectedHeroId={selectedHeroId}
            onHeroSelect={setSelectedHeroId}
            onHeroMove={handleHeroMove}
            onEndTurn={handleEndTurn}
            scale={0.35}
        />
    );
}

export const LargeMap: Story = {
    render: () => <LargeMapDemo />,
};
