import React, { useState, useCallback, useRef } from 'react';
import { Box, Typography, Button, HStack, VStack } from '@almadar/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { IsometricGameCanvas, type IsometricTile, type IsometricUnit } from './IsometricGameCanvas';
import { useCanvasEffects } from './useCanvasEffects';
import { DEFAULT_ASSET_MANIFEST, TraitWarsAssetProvider } from '../assets';
import type { CombatActionType } from '../types/effects';
import { TILE_WIDTH } from './IsometricGameCanvas';

const meta: Meta = {
    title: 'Trait Wars/Organisms/IsometricGameCanvas Effects',
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
    tags: ['autodocs'],
};

export default meta;

// =============================================================================
// Helpers
// =============================================================================

function generateGridTiles(width: number, height: number): IsometricTile[] {
    const tiles: IsometricTile[] = [];
    const terrains = ['grass', 'dirt', 'stone', 'forest', 'stone'];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            tiles.push({ x, y, terrain: terrains[(x + y) % terrains.length] });
        }
    }
    return tiles;
}

const EFFECT_TYPES: CombatActionType[] = ['melee', 'ranged', 'magic', 'heal', 'defend', 'hit', 'death', 'buff'];

const EFFECT_COLORS: Record<CombatActionType, string> = {
    melee: 'bg-red-600',
    ranged: 'bg-yellow-600',
    magic: 'bg-purple-600',
    heal: 'bg-green-600',
    defend: 'bg-blue-600',
    hit: 'bg-orange-600',
    death: 'bg-gray-600',
    buff: 'bg-amber-500',
};

// =============================================================================
// Effect Showcase Story
// =============================================================================

function EffectShowcase() {
    const manifest = DEFAULT_ASSET_MANIFEST;
    const scale = 0.4;
    const tiles = generateGridTiles(5, 5);
    const maxY = 4;
    const baseOffsetX = (maxY + 1) * (TILE_WIDTH * scale / 2);

    const units: IsometricUnit[] = [
        { id: 'u1', position: { x: 2, y: 2 }, name: 'Target', team: 'enemy', health: 100, maxHealth: 100 },
    ];

    const {
        effectSpriteUrls,
        spawnCombatEffect,
        drawEffects,
        hasActiveEffects: effectsActive,
        screenShake,
        screenFlash,
    } = useCanvasEffects({ manifest, scale, baseOffsetX });

    const [lastEffect, setLastEffect] = useState<string>('none');

    const handleSpawn = useCallback((type: CombatActionType) => {
        spawnCombatEffect(type, 2, 2);
        setLastEffect(type);
    }, [spawnCombatEffect]);

    const shakeStyle: React.CSSProperties = (screenShake.x !== 0 || screenShake.y !== 0)
        ? { transform: `translate(${screenShake.x}px, ${screenShake.y}px)` }
        : {};

    return (
        <TraitWarsAssetProvider manifest={manifest}>
            <VStack gap="md" className="p-4 bg-gray-900 rounded-xl max-w-[700px]">
                <Typography variant="h6" className="text-white">
                    Canvas Effect Showcase
                </Typography>
                <Typography variant="body2" className="text-gray-400">
                    Click buttons to spawn effects at the center tile. Last: {lastEffect}
                </Typography>

                <HStack gap="xs" className="flex-wrap">
                    {EFFECT_TYPES.map(type => (
                        <Button
                            key={type}
                            variant="secondary"
                            size="sm"
                            onClick={() => handleSpawn(type)}
                            className={`${EFFECT_COLORS[type]} text-white hover:opacity-80 capitalize`}
                        >
                            {type}
                        </Button>
                    ))}
                </HStack>

                <Box className="relative" style={shakeStyle}>
                    {screenFlash && (
                        <Box
                            className="absolute inset-0 z-20 pointer-events-none rounded-lg"
                            style={{ backgroundColor: screenFlash.color, opacity: screenFlash.alpha }}
                        />
                    )}
                    <IsometricGameCanvas
                        tiles={tiles}
                        units={units}
                        scale={scale}
                        assetManifest={manifest}
                        onDrawEffects={drawEffects}
                        hasActiveEffects={effectsActive}
                        effectSpriteUrls={effectSpriteUrls}
                    />
                </Box>
            </VStack>
        </TraitWarsAssetProvider>
    );
}

export const EffectShowcaseStory: StoryObj = {
    name: 'Effect Showcase',
    render: () => <EffectShowcase />,
};

// =============================================================================
// Rapid Fire Story — multiple effects in quick succession
// =============================================================================

function RapidFireDemo() {
    const manifest = DEFAULT_ASSET_MANIFEST;
    const scale = 0.4;
    const tiles = generateGridTiles(7, 5);
    const maxY = 4;
    const baseOffsetX = (maxY + 1) * (TILE_WIDTH * scale / 2);

    const units: IsometricUnit[] = [
        { id: 'p1', position: { x: 1, y: 2 }, name: 'Knight', team: 'player', health: 100, maxHealth: 100 },
        { id: 'p2', position: { x: 2, y: 1 }, name: 'Mage', team: 'player', health: 60, maxHealth: 60 },
        { id: 'e1', position: { x: 5, y: 2 }, name: 'Orc', team: 'enemy', health: 120, maxHealth: 120 },
        { id: 'e2', position: { x: 4, y: 3 }, name: 'Goblin', team: 'enemy', health: 40, maxHealth: 40 },
    ];

    const {
        effectSpriteUrls,
        spawnCombatEffect,
        drawEffects,
        hasActiveEffects: effectsActive,
        screenShake,
        screenFlash,
    } = useCanvasEffects({ manifest, scale, baseOffsetX });

    const handleBattle = useCallback(() => {
        // Simulate a battle sequence
        spawnCombatEffect('melee', 5, 2);
        setTimeout(() => spawnCombatEffect('hit', 5, 2), 200);
        setTimeout(() => spawnCombatEffect('magic', 4, 3), 400);
        setTimeout(() => spawnCombatEffect('hit', 4, 3), 600);
        setTimeout(() => spawnCombatEffect('death', 4, 3), 800);
        setTimeout(() => spawnCombatEffect('heal', 1, 2), 1000);
        setTimeout(() => spawnCombatEffect('buff', 2, 1), 1200);
    }, [spawnCombatEffect]);

    const shakeStyle: React.CSSProperties = (screenShake.x !== 0 || screenShake.y !== 0)
        ? { transform: `translate(${screenShake.x}px, ${screenShake.y}px)` }
        : {};

    return (
        <TraitWarsAssetProvider manifest={manifest}>
            <VStack gap="md" className="p-4 bg-gray-900 rounded-xl max-w-[700px]">
                <Typography variant="h6" className="text-white">
                    Rapid Fire Battle Sequence
                </Typography>
                <Typography variant="body2" className="text-gray-400">
                    Click to trigger a full battle sequence: melee, hit, magic, death, heal, buff
                </Typography>

                <Button variant="primary" onClick={handleBattle} className="text-white">
                    Trigger Battle Sequence
                </Button>

                <Box className="relative" style={shakeStyle}>
                    {screenFlash && (
                        <Box
                            className="absolute inset-0 z-20 pointer-events-none rounded-lg"
                            style={{ backgroundColor: screenFlash.color, opacity: screenFlash.alpha }}
                        />
                    )}
                    <IsometricGameCanvas
                        tiles={tiles}
                        units={units}
                        scale={scale}
                        assetManifest={manifest}
                        onDrawEffects={drawEffects}
                        hasActiveEffects={effectsActive}
                        effectSpriteUrls={effectSpriteUrls}
                    />
                </Box>
            </VStack>
        </TraitWarsAssetProvider>
    );
}

export const RapidFire: StoryObj = {
    name: 'Rapid Fire Battle',
    render: () => <RapidFireDemo />,
};
