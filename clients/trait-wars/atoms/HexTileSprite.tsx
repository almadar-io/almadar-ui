/**
 * HexTileSprite Component
 *
 * High-fidelity hexagonal terrain tiles from the Hexagon Pack.
 * Uses individual PNG files for crisp, detailed isometric hexes.
 */

import React from 'react';
import { Box } from '../../../components/atoms/Box';
import { cn } from '../../../lib/cn';

// Import hex terrain tiles
// Grass tiles
import grass01 from '../assets/hex-tiles/Grass/grass_01.png';
import grass02 from '../assets/hex-tiles/Grass/grass_02.png';
import grass03 from '../assets/hex-tiles/Grass/grass_03.png';
import grass04 from '../assets/hex-tiles/Grass/grass_04.png';
import grass05 from '../assets/hex-tiles/Grass/grass_05.png';
import grass06 from '../assets/hex-tiles/Grass/grass_06.png';
import grass07 from '../assets/hex-tiles/Grass/grass_07.png';
import grass08 from '../assets/hex-tiles/Grass/grass_08.png';
import grass09 from '../assets/hex-tiles/Grass/grass_09.png';
import grass10 from '../assets/hex-tiles/Grass/grass_10.png';

// Dirt tiles
import dirt01 from '../assets/hex-tiles/Dirt/dirt_01.png';
import dirt02 from '../assets/hex-tiles/Dirt/dirt_02.png';
import dirt03 from '../assets/hex-tiles/Dirt/dirt_03.png';
import dirt04 from '../assets/hex-tiles/Dirt/dirt_04.png';
import dirt05 from '../assets/hex-tiles/Dirt/dirt_05.png';

// Stone tiles
import stone01 from '../assets/hex-tiles/Stone/stone_01.png';
import stone02 from '../assets/hex-tiles/Stone/stone_02.png';
import stone03 from '../assets/hex-tiles/Stone/stone_03.png';
import stone04 from '../assets/hex-tiles/Stone/stone_04.png';
import stone05 from '../assets/hex-tiles/Stone/stone_05.png';

// Sand tiles
import sand01 from '../assets/hex-tiles/Sand/sand_01.png';
import sand02 from '../assets/hex-tiles/Sand/sand_02.png';
import sand03 from '../assets/hex-tiles/Sand/sand_03.png';
import sand04 from '../assets/hex-tiles/Sand/sand_04.png';
import sand05 from '../assets/hex-tiles/Sand/sand_05.png';

// Mars tiles (good for lava/special terrain)
import mars01 from '../assets/hex-tiles/Mars/mars_01.png';
import mars02 from '../assets/hex-tiles/Mars/mars_02.png';
import mars03 from '../assets/hex-tiles/Mars/mars_03.png';

// Tile size - hex tiles are approximately 120x140 pixels
const HEX_WIDTH = 120;
const HEX_HEIGHT = 140;

// Map of tile types to their images
export const HEX_TILE_IMAGES = {
    // Grass variants (green terrain)
    grassPlain: grass05,           // Plain grass
    grassRocks: grass01,           // Grass with rocks
    grassBush: grass02,            // Grass with bush
    grassFlowers: grass03,         // Grass with flowers
    grassMushrooms: grass04,       // Grass with mushrooms
    grassTrees: grass10,           // Grass with trees
    grassTreeSingle: grass06,      // Single tree
    grassStones: grass07,          // Grass with stones
    grassPath: grass08,            // Grass with path
    grassWater: grass09,           // Grass with water edge

    // Dirt variants (brown terrain)
    dirtPlain: dirt05,             // Plain dirt
    dirtRocks: dirt01,             // Dirt with rocks
    dirtBoulders: dirt02,          // Dirt with boulders
    dirtCracked: dirt03,           // Cracked dirt
    dirtPath: dirt04,              // Dirt with path

    // Stone variants (gray terrain)
    stonePlain: stone05,           // Plain stone
    stoneRocks: stone01,           // Stone with rocks
    stoneBoulders: stone02,        // Stone with boulders
    stoneMountain: stone03,        // Stone mountain
    stoneCrystal: stone04,         // Stone with crystals

    // Sand variants (beach/desert)
    sandPlain: sand05,             // Plain sand
    sandRocks: sand01,             // Sand with rocks
    sandDunes: sand02,             // Sand dunes
    sandOasis: sand03,             // Sand with oasis
    sandCactus: sand04,            // Sand with cactus

    // Mars/special terrain (red/lava)
    lavaPlain: mars01,             // Plain lava
    lavaRocks: mars02,             // Lava with rocks
    lavaCraters: mars03,           // Lava with craters
} as const;

export type HexTileType = keyof typeof HEX_TILE_IMAGES;

// Legacy terrain type mapping
export const TERRAIN_TYPE_MAP: Record<string, HexTileType> = {
    grass: 'grassPlain',
    forest: 'grassTrees',
    water: 'grassWater',
    mountain: 'stoneMountain',
    desert: 'sandPlain',
    road: 'dirtPath',
    lava: 'lavaPlain',
    stone: 'stonePlain',
    dirt: 'dirtPlain',
    sand: 'sandPlain',
};

export interface HexTileSpriteProps {
    /** Type of hex tile to display */
    type: HexTileType | keyof typeof TERRAIN_TYPE_MAP;
    /** Scale multiplier (default 0.5 for 60x70) */
    scale?: number;
    /** Additional CSS classes */
    className?: string;
    /** Highlight state */
    highlight?: 'none' | 'valid' | 'attack' | 'selected' | 'hover';
    /** Click handler */
    onClick?: () => void;
    /** Mouse enter handler */
    onMouseEnter?: () => void;
    /** Mouse leave handler */
    onMouseLeave?: () => void;
}

export function HexTileSprite({
    type,
    scale = 0.5,
    className,
    highlight = 'none',
    onClick,
    onMouseEnter,
    onMouseLeave,
}: HexTileSpriteProps): JSX.Element {
    // Map legacy tile types to hex tiles
    const mappedType = (type in HEX_TILE_IMAGES
        ? type
        : TERRAIN_TYPE_MAP[type] || 'grassPlain') as HexTileType;

    const tileImage = HEX_TILE_IMAGES[mappedType];
    const width = HEX_WIDTH * scale;
    const height = HEX_HEIGHT * scale;

    // Highlight overlay colors
    const highlightStyles: Record<string, React.CSSProperties> = {
        none: {},
        valid: {
            filter: 'brightness(1.1)',
            boxShadow: 'inset 0 0 20px rgba(34, 197, 94, 0.6)',
        },
        attack: {
            filter: 'brightness(1.05) hue-rotate(-10deg)',
            boxShadow: 'inset 0 0 20px rgba(239, 68, 68, 0.6)',
        },
        selected: {
            filter: 'brightness(1.2)',
            boxShadow: 'inset 0 0 25px rgba(234, 179, 8, 0.7)',
        },
        hover: {
            filter: 'brightness(1.1)',
        },
    };

    return (
        <Box
            display="inline-block"
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={cn(
                'relative transition-all duration-150 cursor-pointer',
                className
            )}
            style={{
                width,
                height,
                ...highlightStyles[highlight],
            }}
        >
            <img
                src={tileImage}
                alt={mappedType}
                style={{
                    width: '100%',
                    height: '100%',
                    imageRendering: 'auto', // Smooth scaling for detailed tiles
                }}
                draggable={false}
            />
            {/* Highlight overlay */}
            {highlight !== 'none' && (
                <Box
                    className={cn(
                        'absolute inset-0 pointer-events-none rounded-sm',
                        highlight === 'valid' && 'bg-green-500/20 border-2 border-green-400',
                        highlight === 'attack' && 'bg-red-500/20 border-2 border-red-400',
                        highlight === 'selected' && 'bg-yellow-500/20 border-2 border-yellow-400',
                        highlight === 'hover' && 'bg-white/10 border border-white/30'
                    )}
                    style={{
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    }}
                />
            )}
        </Box>
    );
}

export default HexTileSprite;
