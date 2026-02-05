/**
 * Trait Wars Templates
 *
 * Page-level layouts for the Trait Wars game.
 */

export {
    BattlefieldTemplate,
    type BattlefieldTemplateProps,
    type MatchEntity,
} from './BattlefieldTemplate';

export * from './scenarios';
export { ScenarioSelector, type ScenarioSelectorProps } from './ScenarioSelector';
export { TraitWarsGame, type TraitWarsGameProps, type CombatLogEntry as GameCombatLogEntry, type GamePhase } from './TraitWarsGame';

// High-fidelity hex grid template
export { HexTraitWarsGame, type HexTraitWarsGameProps, type HexGameUnit, type GamePhase as HexGamePhase, type LogEntry } from './HexTraitWarsGame';

// Hero and Strategic templates
export { HeroProfileTemplate, type HeroProfileTemplateProps, type HeroData } from './HeroProfileTemplate';
export { WorldMapTemplate, type WorldMapTemplateProps } from './WorldMapTemplate';
export { CastleTemplate, type CastleTemplateProps } from './CastleTemplate';

