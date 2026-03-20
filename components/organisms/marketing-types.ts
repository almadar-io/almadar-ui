/**
 * Marketing Entity Types
 *
 * Shared entity interfaces for marketing/landing-page organisms.
 * These types define the data shapes consumed by HeroOrganism,
 * FeatureGridOrganism, PricingOrganism, StatsOrganism,
 * StepFlowOrganism, ShowcaseOrganism, TeamOrganism, and CaseStudyOrganism.
 */

export interface MarketingAction {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export interface MarketingImage {
  src: string;
  alt: string;
}

export interface HeroEntity {
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

export interface FeatureEntity {
  id: string;
  icon?: string;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
}

export interface PricingPlanEntity {
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

export interface StatEntity {
  id: string;
  value: string;
  label: string;
}

export interface StepEntity {
  id: string;
  number?: number;
  title: string;
  description: string;
  icon?: string;
}

export interface ShowcaseEntity {
  id: string;
  title: string;
  description?: string;
  image: MarketingImage;
  href?: string;
  badge?: string;
  accentColor?: string;
}

export interface TeamMemberEntity {
  id: string;
  name: string;
  nameAr?: string;
  role: string;
  bio: string;
  avatar?: string;
}

export interface CaseStudyEntity {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryColor?: string;
  href: string;
  linkLabel?: string;
}
