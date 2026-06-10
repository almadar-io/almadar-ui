// Base Types
export type { TemplateProps } from './types';

// Layout Templates
export { DashboardLayout, type DashboardLayoutProps, type NavItem } from './DashboardLayout';
export { AuthLayout, type AuthLayoutProps } from './AuthLayout';

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
  type BattleEntity,
  type BattlePhase,
  type BattleUnit,
  type BattleTile,
  type BattleSlotContext,
} from '../../game/templates/BattleTemplate';

export {
  CastleTemplate,
  type CastleTemplateProps,
  type CastleEntity,
  type CastleSlotContext,
} from '../../game/templates/CastleTemplate';

export {
  WorldMapTemplate,
  type WorldMapTemplateProps,
  type WorldMapEntity,
  type MapHero,
  type MapHex,
  type WorldMapSlotContext,
} from '../../game/templates/WorldMapTemplate';

// Marketing Page Templates
export {
  LandingPageTemplate,
  type LandingPageTemplateProps,
  type LandingPageEntity,
  type HeroEntity,
  type FeatureEntity,
  type StatEntity,
  type StepEntity,
  type ShowcaseEntity,
} from '../../marketing/templates/LandingPageTemplate';

export {
  PricingPageTemplate,
  type PricingPageTemplateProps,
  type PricingPageEntity,
  type PricingPlanEntity,
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
  type TeamMemberEntity,
  type CaseStudyEntity,
} from '../../marketing/templates/AboutPageTemplate';

// 3D Game Canvas Templates are NOT barrel-exported because they depend on
// @react-three/fiber + three which are optional peer dependencies.
// Import directly if needed:
//   import { GameCanvas3DWorldMapTemplate } from '@almadar/ui/components/templates/GameCanvas3DWorldMapTemplate';
//   import { GameCanvas3DBattleTemplate } from '@almadar/ui/components/templates/GameCanvas3DBattleTemplate';
//   import { GameCanvas3DCastleTemplate } from '@almadar/ui/components/templates/GameCanvas3DCastleTemplate';
