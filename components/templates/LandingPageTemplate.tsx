/**
 * LandingPageTemplate
 *
 * A full marketing landing page template composing hero, features, stats,
 * steps, showcase, CTA, and community sections from molecule components.
 * Pure function: no hooks, no callbacks, no local state.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { VStack } from '../atoms/Stack';
import { Box } from '../atoms/Box';
import { Container } from '../molecules/Container';
import { HeroSection } from '../molecules/HeroSection';
import { FeatureGrid } from '../molecules/FeatureGrid';
import { StatsGrid } from '../molecules/StatsGrid';
import { StepFlow } from '../molecules/StepFlow';
import { ShowcaseCard } from '../molecules/ShowcaseCard';
import { SimpleGrid } from '../molecules/SimpleGrid';
import { CTABanner } from '../molecules/CTABanner';
import { CommunityLinks } from '../molecules/CommunityLinks';
import { SectionHeader } from '../atoms/SectionHeader';
import type { TemplateProps } from './types';
import type {
  MarketingAction,
  HeroEntity,
  FeatureEntity,
  StatEntity,
  StepEntity,
  ShowcaseEntity,
} from '../organisms/marketing-types';

export type { HeroEntity, FeatureEntity, StatEntity, StepEntity, ShowcaseEntity };

export interface LandingPageEntity {
  id: string;
  hero: HeroEntity;
  features: FeatureEntity[];
  stats?: StatEntity[];
  steps?: StepEntity[];
  showcase?: ShowcaseEntity[];
  ctaTitle: string;
  ctaSubtitle?: string;
  ctaPrimaryAction?: MarketingAction;
  ctaSecondaryAction?: MarketingAction;
  communityGithub?: string;
  communityDiscord?: string;
}

export interface LandingPageTemplateProps extends TemplateProps<LandingPageEntity> {
  variant?: 'product' | 'service' | 'platform';
  featureColumns?: 2 | 3 | 4 | 6;
}

export const LandingPageTemplate: React.FC<LandingPageTemplateProps> = ({
  entity,
  featureColumns = 3,
  className,
}) => {
  const resolved = (entity && typeof entity === 'object' && !Array.isArray(entity))
    ? entity as LandingPageEntity
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
        installCommand={resolved.hero.installCommand}
        image={resolved.hero.image}
        imagePosition={resolved.hero.imagePosition}
        background={resolved.hero.background}
      />

      {resolved.features.length > 0 && (
        <Box className="bg-[var(--color-muted)]/20 py-16">
          <Container size="xl" padding="lg">
            <VStack gap="lg">
              <SectionHeader title="Features" />
              <FeatureGrid
                items={resolved.features.map((f) => ({
                  icon: f.icon,
                  title: f.title,
                  description: f.description,
                  href: f.href,
                }))}
                columns={featureColumns}
              />
            </VStack>
          </Container>
        </Box>
      )}

      {resolved.stats && resolved.stats.length > 0 && (
        <Box className="py-16">
          <Container size="xl" padding="lg">
            <StatsGrid
              stats={resolved.stats.map((s) => ({
                value: s.value,
                label: s.label,
              }))}
            />
          </Container>
        </Box>
      )}

      {resolved.steps && resolved.steps.length > 0 && (
        <Box className="bg-[var(--color-muted)]/20 py-16">
          <Container size="xl" padding="lg">
            <VStack gap="lg">
              <SectionHeader title="How It Works" />
              <StepFlow
                steps={resolved.steps.map((s, i) => ({
                  number: i + 1,
                  title: s.title,
                  description: s.description,
                  icon: s.icon,
                }))}
              />
            </VStack>
          </Container>
        </Box>
      )}

      {resolved.showcase && resolved.showcase.length > 0 && (
        <Box className="py-16">
          <Container size="xl" padding="lg">
            <VStack gap="lg">
              <SectionHeader title="Showcase" />
              <SimpleGrid cols={Math.min(resolved.showcase.length, 3) as 1 | 2 | 3} gap="lg">
                {resolved.showcase.map((item) => (
                  <ShowcaseCard
                    key={item.id}
                    title={item.title}
                    description={item.description}
                    image={item.image}
                    href={item.href}
                    badge={item.badge}
                  />
                ))}
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>
      )}

      <CTABanner
        title={resolved.ctaTitle}
        subtitle={resolved.ctaSubtitle}
        primaryAction={resolved.ctaPrimaryAction}
        secondaryAction={resolved.ctaSecondaryAction}
        background="dark"
      />

      {(resolved.communityGithub ?? resolved.communityDiscord) && (
        <Box className="bg-[var(--color-foreground)] text-[var(--color-background)] py-12">
          <Container size="xl" padding="lg">
            <CommunityLinks
              github={resolved.communityGithub ? { url: resolved.communityGithub } : undefined}
              discord={resolved.communityDiscord ? { url: resolved.communityDiscord } : undefined}
              heading="Join the Community"
            />
          </Container>
        </Box>
      )}
    </VStack>
  );
};

LandingPageTemplate.displayName = 'LandingPageTemplate';

export default LandingPageTemplate;
