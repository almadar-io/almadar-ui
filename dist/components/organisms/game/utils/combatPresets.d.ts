/**
 * Combat Presets
 *
 * Maps combat actions to composed effect layers (particles + sequences + overlays).
 * Each preset factory takes a screen-space origin and returns a CombatPreset.
 *
 * Generalized from trait-wars: uses EffectAssetManifest instead of TraitWarsAssetManifest.
 */
import type { CombatActionType, CombatPreset, EffectAssetManifest } from '../types/effects';
type PresetFactory = (originX: number, originY: number) => CombatPreset;
/**
 * Create combat preset factories from an effect asset manifest.
 */
export declare function createCombatPresets(manifest: EffectAssetManifest): Record<CombatActionType, PresetFactory>;
export {};
