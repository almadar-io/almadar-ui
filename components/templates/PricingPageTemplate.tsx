/**
 * PricingPageTemplate
 *
 * A pricing page template with hero, pricing grid, FAQ accordion, and CTA.
 * Pure function: no hooks, no callbacks, no local state.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { VStack } from '../atoms/Stack';
import { Box } from '../atoms/Box';
import { Container } from '../molecules/Container';
import { HeroSection } from '../molecules/HeroSection';
import { PricingGrid } from '../molecules/PricingGrid';
import { Accordion } from '../molecules/Accordion';
import { CTABanner } from '../molecules/CTABanner';
import { SectionHeader } from '../atoms/SectionHeader';
import type { TemplateProps } from './types';
import type {
  MarketingAction,
  HeroEntity,
  PricingPlanEntity,
} from '../organisms/marketing-types';

export type { PricingPlanEntity };

export interface PricingPageEntity {
  id: string;
  hero: HeroEntity;
  plans: PricingPlanEntity[];
  faq?: { question: string; answer: string }[];
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaAction?: MarketingAction;
}

export interface PricingPageTemplateProps extends TemplateProps<PricingPageEntity> {}

export const PricingPageTemplate: React.FC<PricingPageTemplateProps> = ({
  entity,
  className,
}) => {
  const resolved = (entity && typeof entity === 'object' && !Array.isArray(entity))
    ? entity as PricingPageEntity
    : undefined;
  if (!resolved) return null;

  return (
    <VStack gap="none" className={cn('w-full', className)}>
      <HeroSection
        tag={resolved.hero.tag}
        title={resolved.hero.title}
        titleAccent={resolved.hero.titleAccent}
        subtitle={resolved.hero.subtitle}
        background={resolved.hero.background}
      />

      <Box className="py-16">
        <Container size="xl" padding="lg">
          <PricingGrid
            plans={resolved.plans.map((plan) => ({
              name: plan.name,
              price: plan.price,
              description: plan.description,
              features: plan.features,
              action: { label: plan.actionLabel, href: plan.actionHref },
              highlighted: plan.highlighted,
              badge: plan.badge,
            }))}
          />
        </Container>
      </Box>

      {resolved.faq && resolved.faq.length > 0 && (
        <Box className="bg-[var(--color-muted)]/20 py-16">
          <Container size="lg" padding="lg">
            <VStack gap="lg">
              <SectionHeader title="Frequently Asked Questions" />
              <Accordion
                items={resolved.faq.map((item, index) => ({
                  id: `faq-${index}`,
                  title: item.question,
                  content: item.answer,
                }))}
              />
            </VStack>
          </Container>
        </Box>
      )}

      {resolved.ctaTitle && (
        <CTABanner
          title={resolved.ctaTitle}
          subtitle={resolved.ctaSubtitle}
          primaryAction={resolved.ctaAction}
          background="dark"
        />
      )}
    </VStack>
  );
};

PricingPageTemplate.displayName = 'PricingPageTemplate';

export default PricingPageTemplate;
