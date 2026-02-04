/**
 * GameTile Component
 * 
 * A game board tile that can contain a unit and display various states.
 */

import React from 'react';
import { Box } from '../../../components/atoms/Box';
import { TileSprite, TileType } from '../atoms/TileSprite';
import { CharacterSprite, CharacterType } from '../atoms/CharacterSprite';
import { cn } from '../../../lib/cn';

export interface TileUnit {
    id: string;
    characterType: CharacterType;
    team: 'player' | 'enemy';
    state: 'idle' | 'attacking' | 'defending' | 'casting' | 'wounded';
}

export interface GameTileProps {
    /** Grid position */
    x: number;
    y: number;
    /** Tile terrain type */
    terrain: TileType;
    /** Unit on this tile */
    unit?: TileUnit;
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
    /** Tile size in pixels */
    size?: number;
    /** Additional CSS classes */
    className?: string;
}

export function GameTile({
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
    size = 48,
    className,
}: GameTileProps): JSX.Element {
    const highlight = isSelected ? 'selected' :
        isAttackTarget ? 'attack' :
            isValidMove ? 'valid' : 'none';

    return (
        <Box
            display="flex"
            className={cn(
                'relative items-center justify-center cursor-pointer transition-all duration-150',
                isHovered && 'brightness-110 z-10',
                className
            )}
            style={{ width: size, height: size }}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* Terrain background */}
            <TileSprite
                type={terrain}
                scale={size / 16}
                highlight={highlight}
            />

            {/* Unit on tile */}
            {unit && (
                <Box
                    display="flex"
                    className="absolute inset-0 items-center justify-center"
                >
                    <CharacterSprite
                        type={unit.characterType}
                        team={unit.team}
                        state={unit.state}
                        scale={Math.floor(size / 16) - 0.5}
                    />
                </Box>
            )}

            {/* Valid move indicator */}
            {isValidMove && !unit && (
                <Box className="absolute inset-0 flex items-center justify-center">
                    <Box className="w-3 h-3 rounded-full bg-green-400 opacity-60 animate-pulse" />
                </Box>
            )}

            {/* Attack target indicator */}
            {isAttackTarget && (
                <Box className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Box className="w-full h-full border-2 border-red-500 opacity-70 animate-pulse" />
                </Box>
            )}
        </Box>
    );
}

export default GameTile;
