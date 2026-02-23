/**
 * IsometricCanvas
 *
 * Core isometric game renderer. Maps to the `game-canvas` pattern.
 * Adapted from projects/trait-wars/design-system/organisms/IsometricGameCanvas.tsx
 * with full closed-circuit pattern compliance (className, isLoading, error, entity).
 *
 * Architecture:
 * - 2:1 diamond isometric projection
 * - Painter's algorithm (tile → feature → unit depth sort)
 * - Camera pan/zoom with lerp
 * - Off-screen culling
 * - Minimap on separate canvas
 * - Sprite sheet animation via resolveUnitFrame
 * - Event bus–friendly handlers (onTileClick, onUnitClick, etc.)
 *
 * **State categories (closed-circuit compliant):**
 * - All game data (tiles, units, features, selection, validMoves) → received via props
 * - Rendering state (viewportSize, RAF, camera lerp, sprite cache) → local only
 * - Events → emitted via `useEventBus()` for trait integration
 *
 * This component is a **pure renderer** — it holds no game logic state.
 *
 * @packageDocumentation
 */
import * as React from 'react';
import type { IsometricTile, IsometricUnit, IsometricFeature } from './types/isometric';
import type { ResolvedFrame } from './types/spriteAnimation';
export interface IsometricCanvasProps {
    /** Additional CSS classes */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Array of tiles to render */
    tiles?: IsometricTile[];
    /** Array of units on the board */
    units?: IsometricUnit[];
    /** Array of features (resources, portals, buildings, etc.) */
    features?: IsometricFeature[];
    /** Currently selected unit ID */
    selectedUnitId?: string | null;
    /** Valid move positions (shown as pulsing green highlights) */
    validMoves?: Array<{
        x: number;
        y: number;
    }>;
    /** Attack target positions (shown as pulsing red highlights) */
    attackTargets?: Array<{
        x: number;
        y: number;
    }>;
    /** Hovered tile position */
    hoveredTile?: {
        x: number;
        y: number;
    } | null;
    /** Tile click handler */
    onTileClick?: (x: number, y: number) => void;
    /** Unit click handler */
    onUnitClick?: (unitId: string) => void;
    /** Tile hover handler */
    onTileHover?: (x: number, y: number) => void;
    /** Tile leave handler */
    onTileLeave?: () => void;
    /** Declarative event: emits UI:{tileClickEvent} with { x, y } on tile click */
    tileClickEvent?: string;
    /** Declarative event: emits UI:{unitClickEvent} with { unitId } on unit click */
    unitClickEvent?: string;
    /** Declarative event: emits UI:{tileHoverEvent} with { x, y } on tile hover */
    tileHoverEvent?: string;
    /** Declarative event: emits UI:{tileLeaveEvent} with {} on tile leave */
    tileLeaveEvent?: string;
    /** Render scale (0.4 = 40% zoom) */
    scale?: number;
    /** Show debug grid lines and coordinates */
    debug?: boolean;
    /** Background image URL tiled behind the isometric grid */
    backgroundImage?: string;
    /** Toggle minimap overlay */
    showMinimap?: boolean;
    /** Enable camera pan/zoom controls */
    enableCamera?: boolean;
    /** Extra scale multiplier for unit draw size. 1 = default. */
    unitScale?: number;
    /** Override for the diamond-top Y offset within the tile sprite (default: 374).
     *  This controls where the flat diamond face sits vertically inside the tile image. */
    diamondTopY?: number;
    /** Resolve terrain sprite URL from terrain key */
    getTerrainSprite?: (terrain: string) => string | undefined;
    /** Resolve feature sprite URL from feature type key */
    getFeatureSprite?: (featureType: string) => string | undefined;
    /** Resolve unit static sprite URL */
    getUnitSprite?: (unit: IsometricUnit) => string | undefined;
    /** Resolve animated sprite sheet frame for a unit */
    resolveUnitFrame?: (unitId: string) => ResolvedFrame | null;
    /** Additional sprite URLs to preload (e.g., effect sprites) */
    effectSpriteUrls?: string[];
    /** Callback to draw canvas effects after units */
    onDrawEffects?: (ctx: CanvasRenderingContext2D, animTime: number, getImage: (url: string) => HTMLImageElement | undefined) => void;
    /** Whether there are active effects — keeps RAF loop alive */
    hasActiveEffects?: boolean;
    /** Base URL for remote asset resolution. When set, manifest paths
     *  are prefixed with this URL. Example: "https://trait-wars-assets.web.app" */
    assetBaseUrl?: string;
    /** Manifest mapping entity keys to relative sprite paths.
     *  Combined with assetBaseUrl to produce full URLs.
     *  Used as a fallback when inline URLs and callbacks don't resolve. */
    assetManifest?: {
        terrains?: Record<string, string>;
        units?: Record<string, string>;
        features?: Record<string, string>;
        effects?: Record<string, string>;
    };
}
export declare function IsometricCanvas({ className, isLoading, error, entity, tiles: tilesProp, units, features, selectedUnitId, validMoves, attackTargets, hoveredTile, onTileClick, onUnitClick, onTileHover, onTileLeave, tileClickEvent, unitClickEvent, tileHoverEvent, tileLeaveEvent, scale, debug, backgroundImage, showMinimap, enableCamera, unitScale, getTerrainSprite, getFeatureSprite, getUnitSprite, resolveUnitFrame, effectSpriteUrls, onDrawEffects, hasActiveEffects, diamondTopY: diamondTopYProp, assetBaseUrl, assetManifest, }: IsometricCanvasProps): React.JSX.Element;
export declare namespace IsometricCanvas {
    var displayName: string;
}
export default IsometricCanvas;
