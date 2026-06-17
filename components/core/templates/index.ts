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
} from '../../game/templates/GameTemplate';

export {
  GenericAppTemplate,
  type GenericAppTemplateProps
} from './GenericAppTemplate';

export {
  GameShell,
  type GameShellProps
} from '../../game/templates/GameShell';

// Game View Templates (thin wrappers — logic in Board organisms)
export {
  BattleTemplate,
  type BattleTemplateProps,
  type BattlePhase,
  type BattleSlotContext,
} from '../../game/templates/BattleTemplate';

export {
  CastleTemplate,
  type CastleTemplateProps,
  type CastleSlotContext,
} from '../../game/templates/CastleTemplate';

export {
  WorldMapTemplate,
  type WorldMapTemplateProps,
  type WorldMapSlotContext,
} from '../../game/templates/WorldMapTemplate';

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

// 3D Game Canvas Templates — runtime is lazy (three.js code-split). Type-only exports satisfy
// the G7 public-barrel gate so pattern-sync emits factories, without pulling three.js into main.
export type { GameCanvas3DBattleTemplate, GameCanvas3DBattleTemplateProps } from '../../game/templates/GameCanvas3DBattleTemplate';
export type { GameCanvas3DCastleTemplate, GameCanvas3DCastleTemplateProps } from '../../game/templates/GameCanvas3DCastleTemplate';
export type { GameCanvas3DWorldMapTemplate, GameCanvas3DWorldMapTemplateProps } from '../../game/templates/GameCanvas3DWorldMapTemplate';
