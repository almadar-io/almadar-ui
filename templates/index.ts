/**
 * Almadar UI - 3D Game Templates
 *
 * Declarative template components for 3D game interfaces.
 * These templates wrap GameCanvas3D with pre-configured settings
 * for common game views (world map, battle, castle).
 *
 * @packageDocumentation
 */

// ---------------------------------------------------------------------------
// 3D Game Templates
// ---------------------------------------------------------------------------
export {
    GameCanvas3DWorldMapTemplate,
    type GameCanvas3DWorldMapTemplateProps,
    type WorldMap3DEntity,
} from './GameCanvas3DWorldMapTemplate';

export {
    GameCanvas3DBattleTemplate,
    type GameCanvas3DBattleTemplateProps,
    type Battle3DEntity,
} from './GameCanvas3DBattleTemplate';

export {
    GameCanvas3DCastleTemplate,
    type GameCanvas3DCastleTemplateProps,
    type Castle3DEntity,
} from './GameCanvas3DCastleTemplate';
