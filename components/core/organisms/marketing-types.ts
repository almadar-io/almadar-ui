/**
 * Marketing Entity Types
 *
 * Shared entity interfaces for marketing/landing-page organisms (HeroOrganism,
 * FeatureGridOrganism, PricingOrganism, StatsOrganism, StepFlowOrganism,
 * ShowcaseOrganism, TeamOrganism, CaseStudyOrganism).
 *
 * Every marketing entity extends `@almadar/core`'s `EntityRow` so the
 * canonical runtime entity shape lives in core. Marketing data is pure
 * JSON-serialisable content (strings, numbers, nested records) with no
 * React nodes or callbacks, so the `EntityRow` index signature is satisfied
 * structurally. Nested `MarketingAction` / `MarketingImage` carry explicit
 * `[key: string]: FieldValue | undefined` signatures so they fit the
 * `{ [key: string]: FieldValue }` branch of `FieldValue`.
 */

import type { EntityRow, FieldValue } from '@almadar/core';

export interface MarketingAction {
  [key: string]: FieldValue | undefined;
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export interface MarketingImage {
  [key: string]: FieldValue | undefined;
  src: string;
  alt: string;
}

export interface HeroEntity extends EntityRow {
  id: string;
  tag?: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  primaryAction?: MarketingAction;
  secondaryAction?: MarketingAction;
  installCommand?: string;
  image?: MarketingImage;
  imagePosition?: 'below' | 'right' | 'background';
  background?: 'dark' | 'gradient' | 'subtle';
}

export interface FeatureEntity extends EntityRow {
  id: string;
  icon?: string;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
}

export interface PricingPlanEntity extends EntityRow {
  id: string;
  name: string;
  price: string;
  description?: string;
  features: string[];
  actionLabel: string;
  actionHref: string;
  highlighted?: boolean;
  badge?: string;
}

export interface StatEntity extends EntityRow {
  id: string;
  value: string;
  label: string;
}

export interface StepEntity extends EntityRow {
  id: string;
  number?: number;
  title: string;
  description: string;
  icon?: string;
}

export interface ShowcaseEntity extends EntityRow {
  id: string;
  title: string;
  description?: string;
  image: MarketingImage;
  href?: string;
  badge?: string;
  accentColor?: string;
}

export interface TeamMemberEntity extends EntityRow {
  id: string;
  name: string;
  nameAr?: string;
  role: string;
  bio: string;
  avatar?: string;
}

export interface CaseStudyEntity extends EntityRow {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryColor?: string;
  href: string;
  linkLabel?: string;
}
