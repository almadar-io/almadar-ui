/**
 * HexGameTile Organism
 *
 * A complete hex tile for the game board combining:
 * - HexTileSprite for high-fidelity terrain
 * - PixelCharacterSprite for units
 * - Health bars and state indicators
 */

import React from 'react';
import { Box } from '@almadar/ui';
import { Typography } from '@almadar/ui';
import { HealthBar } from '@almadar/ui';
import { HexTileSprite, HexTileType } from '../atoms/HexTileSprite';
import { PixelCharacterSprite, PixelCharacterType, CHARACTER_TYPE_MAP } from '../atoms/PixelCharacterSprite';
import { StateIndicator, TraitState } from '../atoms/StateIndicator';
import { cn } from '@almadar/ui';

export interface HexUnit {
    id: string;
    name: string;
    characterType: PixelCharacterType | keyof typeof CHARACTER_TYPE_MAP;
    team: 'player' | 'enemy' | 'neutral';
    state: 'idle' | 'attacking' | 'defending' | 'casting' | 'wounded';
    traitState?: TraitState;
    health: number;
    maxHealth: number;
}

export interface HexGameTileProps {
    /** Grid position */
    x: number;
    y: number;
    /** Terrain type */
    terrain: HexTileType;
    /** Unit on this tile */
    unit?: HexUnit;
    /** Selection state */
    isSelected?: boolean;
    /** Valid move target */
    isValidMove?: boolean;
    /** Valid attack target */
    isAttackTarget?: boolean;
    /** Hover state */
    isHovered?: boolean;
    /** Click handler */
    onClick?: () => void;
    /** Mouse enter handler */
    onMouseEnter?: () => void;
    /** Mouse leave handler */
    onMouseLeave?: () => void;
    /** Tile scale (default 0.5 = 60x70) */
    scale?: number;
    /** Show health bar */
    showHealthBar?: boolean;
    /** Show state indicator */
    showStateIndicator?: boolean;
    /** Show coordinate label */
    showCoordinates?: boolean;
    /** Additional CSS classes */
    className?: string;
}

export function HexGameTile({
    x,
    y,
    terrain,
    unit,
    isSelected = false,
    isValidMove = false,
    isAttackTarget = false,
    isHovered = false,
    onClick,
    onMouseEnter,
    onMouseLeave,
    scale = 0.5,
    showHealthBar = true,
    showStateIndicator = true,
    showCoordinates = false,
    className,
}: HexGameTileProps): JSX.Element {
    // Isometric tile dimensions (256x512 base size from Kenney Isometric Miniature Dungeon)
    // The floor diamond is at the bottom: 256 wide x 128 tall (standard 2:1 isometric ratio)
    const TILE_WIDTH = 256 * scale;
    const TILE_HEIGHT = 512 * scale;
    const FLOOR_HEIGHT = 128 * scale; // The isometric floor diamond height
    const FLOOR_TOP = TILE_HEIGHT - FLOOR_HEIGHT; // Where the floor starts (top of floor diamond)

    // Determine highlight state
    const highlight = isSelected ? 'selected' :
        isAttackTarget ? 'attack' :
            isValidMove ? 'valid' :
                isHovered ? 'hover' : 'none';

    // Calculate character sprite scale based on tile size
    const characterScale = scale * 2;

    return (
        <Box
            display="flex"
            className={cn(
                'relative items-end justify-center pointer-events-none',
                isSelected && 'z-20',
                isAttackTarget && 'z-10',
                className
            )}
            style={{ width: TILE_WIDTH, height: TILE_HEIGHT }}
        >
            {/* Isometric terrain tile - no pointer events */}
            <Box className="pointer-events-none">
                <HexTileSprite
                    type={terrain}
                    scale={scale}
                    highlight={highlight}
                />
            </Box>

            {/* Hit area - isometric diamond shape for precise mouse interaction */}
            <Box
                className="absolute cursor-pointer pointer-events-auto"
                style={{
                    bottom: 0,
                    left: 0,
                    width: TILE_WIDTH,
                    height: FLOOR_HEIGHT,
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                }}
                onClick={onClick}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            />

            {/* Unit on tile */}
            {unit && (
                <>
                    {/* Character sprite - positioned above the floor diamond */}
                    <Box
                        className="absolute flex items-center justify-center pointer-events-none z-50"
                        style={{
                            bottom: FLOOR_HEIGHT * 0.6,
                            left: '50%',
                            transform: 'translateX(-50%)',
                        }}
                    >
                        <PixelCharacterSprite
                            type={unit.characterType}
                            team={unit.team}
                            state={unit.state}
                            scale={characterScale}
                        />
                    </Box>

                    {/* Health bar - at the bottom of floor diamond */}
                    {showHealthBar && (
                        <Box
                            className="absolute pointer-events-none"
                            style={{
                                bottom: FLOOR_HEIGHT * 0.1,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: TILE_WIDTH * 0.5,
                            }}
                        >
                            <HealthBar
                                current={unit.health}
                                max={unit.maxHealth}
                                size="sm"
                                format="bar"
                            />
                        </Box>
                    )}

                    {/* State indicator - above the unit */}
                    {showStateIndicator && unit.traitState && (
                        <Box
                            className="absolute pointer-events-none"
                            style={{
                                bottom: FLOOR_HEIGHT + characterScale * 20,
                                right: TILE_WIDTH * 0.2,
                            }}
                        >
                            <StateIndicator state={unit.traitState} size="sm" />
                        </Box>
                    )}

                    {/* Team indicator */}
                    <Box
                        className={cn(
                            'absolute w-3 h-3 rounded-full border border-gray-800 pointer-events-none',
                            unit.team === 'player' && 'bg-blue-500',
                            unit.team === 'enemy' && 'bg-red-500',
                            unit.team === 'neutral' && 'bg-gray-500'
                        )}
                        style={{
                            bottom: FLOOR_HEIGHT + characterScale * 20,
                            left: TILE_WIDTH * 0.2,
                        }}
                    />
                </>
            )}

            {/* Valid move indicator (when no unit) - isometric diamond on floor */}
            {isValidMove && !unit && (
                <Box
                    className="absolute flex items-center justify-center pointer-events-none"
                    style={{
                        bottom: 0,
                        left: 0,
                        width: TILE_WIDTH,
                        height: FLOOR_HEIGHT,
                    }}
                >
                    {/* Pulsing dot in center */}
                    <Box className="w-3 h-3 rounded-full bg-green-400 opacity-80 animate-pulse shadow-lg shadow-green-400/50 z-10" />
                    {/* Isometric diamond outline */}
                    <Box
                        className="absolute border-2 border-green-400 bg-green-500/20 animate-pulse"
                        style={{
                            width: TILE_WIDTH * 0.7,
                            height: FLOOR_HEIGHT * 0.7,
                            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                        }}
                    />
                </Box>
            )}

            {/* Attack target indicator - isometric diamond on floor */}
            {isAttackTarget && (
                <Box
                    className="absolute flex items-center justify-center pointer-events-none"
                    style={{
                        bottom: 0,
                        left: 0,
                        width: TILE_WIDTH,
                        height: FLOOR_HEIGHT,
                    }}
                >
                    {/* Sword icon in center */}
                    <Box
                        className="bg-red-600/90 rounded-full animate-pulse flex items-center justify-center shadow-lg shadow-red-500/50 z-10"
                        style={{ width: 24, height: 24 }}
                    >
                        <span className="text-white text-xs">⚔️</span>
                    </Box>
                    {/* Isometric diamond outline */}
                    <Box
                        className="absolute border-2 border-red-500 animate-pulse"
                        style={{
                            width: TILE_WIDTH * 0.8,
                            height: FLOOR_HEIGHT * 0.8,
                            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                        }}
                    />
                </Box>
            )}

            {/* Coordinate label - at bottom center of floor diamond */}
            {showCoordinates && (
                <Box
                    className="absolute bg-black/60 px-1 rounded pointer-events-none"
                    style={{
                        bottom: FLOOR_HEIGHT * 0.3,
                        left: '50%',
                        transform: 'translateX(-50%)',
                    }}
                >
                    <Typography variant="caption" className="text-[8px] text-white">
                        {x},{y}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

export default HexGameTile;
