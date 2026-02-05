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
    const HEX_WIDTH = 256 * scale;
    const HEX_HEIGHT = 512 * scale;

    // Determine highlight state
    const highlight = isSelected ? 'selected' :
        isAttackTarget ? 'attack' :
            isValidMove ? 'valid' :
                isHovered ? 'hover' : 'none';

    // Calculate character sprite scale based on hex size
    const characterScale = scale * 3.5;

    return (
        <Box
            display="flex"
            className={cn(
                'relative items-center justify-center cursor-pointer',
                isSelected && 'z-20',
                isAttackTarget && 'z-10',
                className
            )}
            style={{ width: HEX_WIDTH, height: HEX_HEIGHT }}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* Hex terrain tile */}
            <HexTileSprite
                type={terrain}
                scale={scale}
                highlight={highlight}
            />

            {/* Unit on tile */}
            {unit && (
                <>
                    {/* Character sprite - always on top */}
                    <Box
                        className="absolute flex items-center justify-center pointer-events-none z-50"
                        style={{
                            top: '35%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        <PixelCharacterSprite
                            type={unit.characterType}
                            team={unit.team}
                            state={unit.state}
                            scale={characterScale}
                        />
                    </Box>

                    {/* Health bar */}
                    {showHealthBar && (
                        <Box
                            className="absolute pointer-events-none"
                            style={{
                                bottom: '15%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: HEX_WIDTH * 0.7,
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

                    {/* State indicator */}
                    {showStateIndicator && unit.traitState && (
                        <Box
                            className="absolute pointer-events-none"
                            style={{
                                top: '5%',
                                right: '10%',
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
                            top: '5%',
                            left: '10%',
                        }}
                    />
                </>
            )}

            {/* Valid move indicator (when no unit) */}
            {isValidMove && !unit && (
                <Box className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Box className="w-4 h-4 rounded-full bg-green-400 opacity-70 animate-pulse shadow-lg shadow-green-400/50" />
                </Box>
            )}

            {/* Attack target indicator - prominent sword crosshair */}
            {isAttackTarget && (
                <Box className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {/* Red crosshair */}
                    <Box className="absolute" style={{ top: '50%', left: '5%', right: '5%', height: 3, backgroundColor: 'rgba(239, 68, 68, 0.8)', transform: 'translateY(-50%)' }} />
                    <Box className="absolute" style={{ left: '50%', top: '10%', bottom: '10%', width: 3, backgroundColor: 'rgba(239, 68, 68, 0.8)', transform: 'translateX(-50%)' }} />
                    {/* Sword icon in center */}
                    <Box
                        className="bg-red-600/90 rounded-full animate-pulse flex items-center justify-center shadow-lg shadow-red-500/50"
                        style={{ width: 28, height: 28 }}
                    >
                        <span className="text-white text-sm">⚔️</span>
                    </Box>
                    {/* Outer ring */}
                    <Box
                        className="absolute border-2 border-red-500 animate-pulse"
                        style={{
                            width: HEX_WIDTH * 0.75,
                            height: HEX_HEIGHT * 0.75,
                            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                        }}
                    />
                </Box>
            )}

            {/* Coordinate label */}
            {showCoordinates && (
                <Box
                    className="absolute bg-black/60 px-1 rounded pointer-events-none"
                    style={{ bottom: '2%', left: '50%', transform: 'translateX(-50%)' }}
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
