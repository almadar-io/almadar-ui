/**
 * FeatureDetailPageTemplate
 *
 * A feature detail page with hero, alternating split sections, and CTA.
 * Pure function: no hooks, no callbacks, no local state.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { VStack } from '../atoms/Stack';
import { HeroSection } from '../molecules/HeroSection';
import { SplitSection } from '../molecules/SplitSection';
import { CTABanner } from '../molecules/CTABanner';
import type { TemplateProps } from './types';
import type {
  MarketingAction,
  MarketingImage,
  HeroEntity,
} from '../organisms/marketing-types';

export interface FeatureDetailSection {
  title: string;
  description: string;
  bullets?: string[];
  image?: MarketingImage;
  imagePosition?: 'left' | 'right';
}

export interface FeatureDetailPageEntity {
  id: string;
  hero: HeroEntity;
  sections: FeatureDetailSection[];
  ctaTitle?: string;
  ctaAction?: MarketingAction;
}

export interface FeatureDetailPageTemplateProps extends TemplateProps<FeatureDetailPageEntity> {}

export const FeatureDetailPageTemplate: React.FC<FeatureDetailPageTemplateProps> = ({
  entity,
  className,
}) => {
  const resolved = (entity && typeof entity === 'object' && !Array.isArray(entity))
    ? entity as FeatureDetailPageEntity
    : undefined;
  if (!resolved) return null;

  return (
    <VStack gap="none" className={cn('w-full', className)}>
      <HeroSection
        tag={resolved.hero.tag}
        title={resolved.hero.title}
        titleAccent={resolved.hero.titleAccent}
        subtitle={resolved.hero.subtitle}
        primaryAction={resolved.hero.primaryAction}
        secondaryAction={resolved.hero.secondaryAction}
        background={resolved.hero.background}
      />

      {resolved.sections.map((section, index) => (
        <SplitSection
          key={`section-${index}`}
          title={section.title}
          description={section.description}
          bullets={section.bullets}
          image={section.image}
          imagePosition={section.imagePosition ?? (index % 2 === 0 ? 'right' : 'left')}
          background={index % 2 === 0 ? 'default' : 'alt'}
        />
      ))}

      {resolved.ctaTitle && (
        <CTABanner
          title={resolved.ctaTitle}
          primaryAction={resolved.ctaAction}
          background="dark"
        />
      )}
    </VStack>
  );
};

FeatureDetailPageTemplate.displayName = 'FeatureDetailPageTemplate';

export default FeatureDetailPageTemplate;
