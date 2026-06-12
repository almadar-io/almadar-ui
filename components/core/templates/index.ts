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

// 3D Game Canvas Templates are NOT barrel-exported because they depend on
// @react-three/fiber + three which are optional peer dependencies.
// Import directly if needed:
//   import { GameCanvas3DWorldMapTemplate } from '@almadar/ui/components/templates/GameCanvas3DWorldMapTemplate';
//   import { GameCanvas3DBattleTemplate } from '@almadar/ui/components/templates/GameCanvas3DBattleTemplate';
//   import { GameCanvas3DCastleTemplate } from '@almadar/ui/components/templates/GameCanvas3DCastleTemplate';
