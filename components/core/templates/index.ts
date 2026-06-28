// Base Types
export type { TemplateProps } from './types';

// Layout Templates
export { DashboardLayout, type DashboardLayoutProps, type NavItem } from './DashboardLayout';
export { AuthLayout, type AuthLayoutProps } from '../../marketing/templates/AuthLayout';

// Feature Templates
export {
  CounterTemplate,
  type CounterTemplateProps,
  type CounterSize,
  type CounterVariant
} from './CounterTemplate';

// Wireframe Templates
export {
  GameTemplate,
  type GameTemplateProps
} from '../../game/2d/templates/GameTemplate';

export {
  GenericAppTemplate,
  type GenericAppTemplateProps
} from './GenericAppTemplate';

export {
  GameShell,
  type GameShellProps
} from '../../game/2d/templates/GameShell';

// Game View Templates (thin wrappers — logic in Board organisms)
export {
  BattleTemplate,
  type BattleTemplateProps,
  type BattlePhase,
  type BattleSlotContext,
} from '../../game/2d/templates/BattleTemplate';

export {
  CastleTemplate,
  type CastleTemplateProps,
  type CastleSlotContext,
} from '../../game/2d/templates/CastleTemplate';

export {
  WorldMapTemplate,
  type WorldMapTemplateProps,
  type WorldMapSlotContext,
} from '../../game/2d/templates/WorldMapTemplate';

export {
  PlatformerTemplate,
  type PlatformerTemplateProps,
} from '../../game/2d/templates/PlatformerTemplate';

export {
  TowerDefenseTemplate,
  type TowerDefenseTemplateProps,
} from '../../game/2d/templates/TowerDefenseTemplate';

export {
  RoguelikeTemplate,
  type RoguelikeTemplateProps,
} from '../../game/2d/templates/RoguelikeTemplate';

export {
  TopDownShooterTemplate,
  type TopDownShooterTemplateProps,
} from '../../game/2d/templates/TopDownShooterTemplate';

export {
  CityBuilderTemplate,
  type CityBuilderTemplateProps,
} from '../../game/2d/templates/CityBuilderTemplate';

export {
  VisualNovelTemplate,
  type VisualNovelTemplateProps,
} from '../../game/2d/templates/VisualNovelTemplate';

export {
  CardBattlerTemplate,
  type CardBattlerTemplateProps,
} from '../../game/2d/templates/CardBattlerTemplate';

// Marketing Page Templates
export {
  LandingPageTemplate,
  type LandingPageTemplateProps,
  type LandingPageEntity,
} from '../../marketing/templates/LandingPageTemplate';

export {
  PricingPageTemplate,
  type PricingPageTemplateProps,
  type PricingPageEntity,
} from '../../marketing/templates/PricingPageTemplate';

export {
  FeatureDetailPageTemplate,
  type FeatureDetailPageTemplateProps,
  type FeatureDetailPageEntity,
  type FeatureDetailSection,
} from '../../marketing/templates/FeatureDetailPageTemplate';

export {
  AboutPageTemplate,
  type AboutPageTemplateProps,
  type AboutPageEntity,
} from '../../marketing/templates/AboutPageTemplate';

// 3D Game Canvas Templates are three.js-backed and intentionally NOT exported
// here — they ship code-split behind the optional
// `@almadar/ui/components/molecules/game/three` subpath (see
// ../../game/3d/patterns.ts). The pattern scanner reads that
// subpath directly, so no shadow export is needed.
