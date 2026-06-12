/**
 * PricingPageTemplate
 *
 * A pricing page template with hero, pricing grid, FAQ accordion, and CTA.
 * Pure function: no hooks, no callbacks, no local state.
 */

import React from 'react';
import { cn } from '../../../lib/cn';
import { useTranslate } from '../../../hooks/useTranslate';
import { VStack } from '../../core/atoms/Stack';
import { Box } from '../../core/atoms/Box';
import { Container } from '../../core/molecules/Container';
import { HeroSection } from '../molecules/HeroSection';
import { PricingGrid } from '../molecules/PricingGrid';
import { Accordion } from '../../core/molecules/Accordion';
import { CTABanner } from '../molecules/CTABanner';
import { SectionHeader } from '../../core/atoms/SectionHeader';
import type { TemplateProps } from '../../core/templates/types';
import type { LinkAction } from '../../core/atoms/types';

interface PricingHero {
  id?: string;
  tag?: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  background?: 'dark' | 'gradient' | 'subtle';
}

interface PricingPlanContent {
  id?: string;
  name: string;
  price: string;
  description?: string;
  features: string[];
  actionLabel: string;
  actionHref: string;
  highlighted?: boolean;
  badge?: string;
}

export interface PricingPageEntity {
  id: string;
  hero: PricingHero;
  plans: PricingPlanContent[];
  faq?: { question: string; answer: string }[];
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaAction?: LinkAction;
}

export interface PricingPageTemplateProps extends TemplateProps<PricingPageEntity> {}

export const PricingPageTemplate: React.FC<PricingPageTemplateProps> = ({
  entity,
  className,
}) => {
  const { t } = useTranslate();
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
            plans={(Array.isArray(resolved.plans) ? resolved.plans : []).map((plan) => ({
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
        <Box className="bg-muted/20 py-16">
          <Container size="lg" padding="lg">
            <VStack gap="lg">
              <SectionHeader title={t('template.faq')} />
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
