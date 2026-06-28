import React from 'react';
import type { Asset, EntityRow } from '@almadar/core';
import type { TemplateProps } from '../../../core/templates/types';
import { cn } from '../../../../lib/cn';
import { Box } from '../../../core/atoms/Box';
import { VStack } from '../../../core/atoms/Stack';
import { PlatformerBoard } from '../organisms/PlatformerBoard';
import type { PlatformerBoardProps } from '../organisms/PlatformerBoard';
import { GameHud } from '../molecules/GameHud';
import { ScoreBoard } from '../molecules/ScoreBoard';
import { makeAsset, makeAssetMap } from '../../shared/makeAsset';

const CDN = 'https://almadar-kflow-assets.web.app/shared/platformer';

const DEFAULT_TILE_SPRITES: Record<string, Asset> = makeAssetMap({
    ground:   `${CDN}/tiles/platformPack_tile001.png`,
    platform: `${CDN}/tiles/platformPack_tile004.png`,
    hazard:   `${CDN}/tiles/platformPack_tile017.png`,
    goal:     `${CDN}/tiles/platformPack_tile007.png`,
}, 'tile');

const DEFAULT_PLATFORMS: PlatformerBoardProps['platforms'] = [
    { x: 0,   y: 368, width: 800, height: 32, type: 'ground' },
    { x: 150, y: 280, width: 160, height: 16, type: 'platform' },
    { x: 420, y: 220, width: 160, height: 16, type: 'platform' },
    { x: 580, y: 300, width: 80,  height: 16, type: 'hazard' },
    { x: 700, y: 340, width: 64,  height: 28, type: 'goal' },
];

// =============================================================================
// Template Props
// =============================================================================

export interface PlatformerTemplateProps extends TemplateProps {
    /** Level geometry forwarded to PlatformerBoard */
    platforms?: PlatformerBoardProps['platforms'];
    /** World dimensions */
    worldWidth?: number;
    worldHeight?: number;
    /** Canvas display size */
    canvasWidth?: number;
    canvasHeight?: number;
    /** Player sprite asset */
    playerSprite?: Asset;
    /** Map of platform type to tile sprite asset */
    tileSprites?: Record<string, Asset>;
    /** Canvas background color */
    bgColor?: string;
    /** Forwarded to PlatformerBoard to emit GAME_END into the FSM */
    gameEndEvent?: PlatformerBoardProps['gameEndEvent'];
}

// =============================================================================
// Template
// =============================================================================

export function PlatformerTemplate({
    entity,
    platforms = DEFAULT_PLATFORMS,
    worldWidth = 800,
    worldHeight = 400,
    canvasWidth = 800,
    canvasHeight = 400,
    playerSprite = makeAsset(`${CDN}/characters/platformChar_idle.png`, 'player'),
    tileSprites = DEFAULT_TILE_SPRITES,
    bgColor = '#5c94fc',
    gameEndEvent = 'GAME_END',
    className,
}: PlatformerTemplateProps): React.JSX.Element | null {
    const row = (entity && !Array.isArray(entity)) ? (entity as EntityRow) : undefined;

    // Read live game state from entity if present (set by the board organism)
    const lives = typeof row?.['lives'] === 'number' ? row['lives'] : 3;
    const score = typeof row?.['score'] === 'number' ? row['score'] : 0;
    const level = typeof row?.['level'] === 'number' ? row['level'] : 1;

    return (
        <VStack className={cn('platformer-template w-full', className)} gap="none">
            {/* Top HUD */}
            <Box className="relative">
                <GameHud
                    position="top"
                    stats={[
                        { label: 'Lives', value: lives, format: 'number', variant: 'danger' },
                        { label: 'Level', value: level, format: 'number', variant: 'default' },
                    ]}
                />
            </Box>

            {/* Board (canvas + overlays) */}
            <PlatformerBoard
                entity={entity}
                platforms={platforms}
                worldWidth={worldWidth}
                worldHeight={worldHeight}
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                playerSprite={playerSprite}
                tileSprites={tileSprites}
                bgColor={bgColor}
                keyEvent="KEY"
                playAgainEvent="PLAY_AGAIN"
                gameEndEvent={gameEndEvent}
            />

            {/* Score bar */}
            <Box className="px-4 py-2">
                <ScoreBoard score={score} level={level} />
            </Box>
        </VStack>
    );
}

PlatformerTemplate.displayName = 'PlatformerTemplate';

export default PlatformerTemplate;
