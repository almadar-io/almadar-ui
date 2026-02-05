/**
 * Trait Wars Atoms
 *
 * Atomic components for the Trait Wars game.
 */

// Game-specific atoms
export { HexCell, type HexCellProps, type TerrainType } from './HexCell';
export { TraitIcon, type TraitIconProps, type TraitState, type TraitName } from './TraitIcon';
export { CharacterSprite, type CharacterSpriteProps, type CharacterType } from './CharacterSprite';
export { TileSprite, type TileSpriteProps, type TileType, TILE_SPRITES } from './TileSprite';
export { StateIndicator, type StateIndicatorProps, type TraitState as IndicatorState } from './StateIndicator';
export { DamagePopup, type DamagePopupProps } from './DamagePopup';
export { GuardDisplay, type GuardDisplayProps } from './GuardDisplay';
export { HeroAvatar, type HeroAvatarProps } from './HeroAvatar';
export { MapNode, type MapNodeProps, type LocationType } from './MapNode';

// High-fidelity Pixel Platformer sprites
export { PixelCharacterSprite, type PixelCharacterSpriteProps, type PixelCharacterType, PIXEL_CHARACTER_SPRITES, CHARACTER_TYPE_MAP } from './PixelCharacterSprite';
export { PixelTileSprite, type PixelTileSpriteProps, PIXEL_TILE_SPRITES, TILE_TYPE_MAP } from './PixelTileSprite';

// High-fidelity Hexagon Pack tiles (now isometric)
export { HexTileSprite, type HexTileSpriteProps, type HexTileType } from './HexTileSprite';

// Re-export core game atoms for convenience
export { HealthBar, type HealthBarProps } from '@almadar/ui';
export { Sprite, type SpriteProps } from '@almadar/ui';

