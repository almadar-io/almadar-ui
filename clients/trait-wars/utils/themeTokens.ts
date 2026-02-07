/**
 * Trait Wars Theme Tokens (TypeScript)
 *
 * Programmatic access to theme values for canvas rendering, game logic,
 * and anywhere CSS custom properties aren't available.
 *
 * These MUST stay in sync with packages/almadar-ui/themes/trait-wars.css
 */

// ---------------------------------------------------------------------------
// Gold hierarchy (bright → dim)
// ---------------------------------------------------------------------------
export const gold = {
    bright: '#eab308',
    mid: '#c9a84c',
    dim: '#8a7340',
    dark: '#5a4a36',
} as const;

// ---------------------------------------------------------------------------
// Parchment text hierarchy (bright → dim)
// ---------------------------------------------------------------------------
export const text = {
    primary: '#e8dcc8',
    secondary: '#b8a88c',
    dim: '#7a6a50',
} as const;

// ---------------------------------------------------------------------------
// Surface hierarchy (light → dark)
// ---------------------------------------------------------------------------
export const surface = {
    background: '#1a1410',
    card: '#2a2118',
    elevated: '#3a2f22',
    hover: '#4a3d2e',
} as const;

// ---------------------------------------------------------------------------
// Faction colors
// ---------------------------------------------------------------------------
export const faction = {
    resonator: {
        color: '#7c3aed',
        glow: 'rgba(124, 58, 237, 0.3)',
    },
    dominion: {
        color: '#b91c1c',
        glow: 'rgba(185, 28, 28, 0.3)',
    },
    neutral: '#78716c',
} as const;

// ---------------------------------------------------------------------------
// Tier colors (bronze → illuminated)
// ---------------------------------------------------------------------------
export const tier = {
    1: '#8B7355',
    2: '#A8A8A8',
    3: '#c9a84c',
    4: '#eab308',
} as const;

// ---------------------------------------------------------------------------
// Combat colors
// ---------------------------------------------------------------------------
export const combat = {
    health: '#c04040',
    healthBg: 'rgba(192, 64, 64, 0.2)',
    heal: '#4a9e4a',
    healBg: 'rgba(74, 158, 74, 0.2)',
    mana: '#7c5cbf',
    manaBg: 'rgba(124, 92, 191, 0.2)',
} as const;

// ---------------------------------------------------------------------------
// Semantic / UI colors
// ---------------------------------------------------------------------------
export const semantic = {
    primary: '#c9a84c',
    primaryHover: '#eab308',
    accent: '#14b8a6',
    error: '#c04040',
    success: '#4a9e4a',
    warning: '#d97706',
    info: '#14b8a6',
    border: '#5a4a36',
} as const;

// ---------------------------------------------------------------------------
// Canvas overlay colors (highlight rings, move range, attack range)
// ---------------------------------------------------------------------------
export const canvas = {
    validMove: 'rgba(74, 158, 74, 0.3)',
    attackTarget: 'rgba(192, 64, 64, 0.3)',
    selection: 'rgba(201, 168, 76, 0.9)',
    selectionGlow: 'rgba(234, 179, 8, 0.4)',
} as const;

// ---------------------------------------------------------------------------
// Isometric tile dimensions
// ---------------------------------------------------------------------------
export const tiles = {
    width: 256,
    height: 512,
    floorHeight: 128,
} as const;

// ---------------------------------------------------------------------------
// Aggregate export
// ---------------------------------------------------------------------------
export const traitWarsTheme = {
    gold,
    text,
    surface,
    faction,
    tier,
    combat,
    semantic,
    canvas,
    tiles,
} as const;

export default traitWarsTheme;
