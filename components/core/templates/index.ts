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

// Game-genre view templates removed — boards are now .lolo game-shell compositions, not React components.

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

// The 3D draw-host is three.js-backed and intentionally NOT exported here — it
// ships code-split behind the optional `@almadar/ui/components/molecules/game/three`
// subpath, whose source now lives in `lib/drawable/three/` (the 3D painter backend
// of the drawable substrate). No shadow export is needed.
