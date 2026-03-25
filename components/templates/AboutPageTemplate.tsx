/**
 * AboutPageTemplate
 *
 * An about/company page template with hero, articles, team grid, case studies, and CTA.
 * Pure function: no hooks, no callbacks, no local state.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { VStack } from '../atoms/Stack';
import { Box } from '../atoms/Box';
import { Typography } from '../atoms/Typography';
import { Container } from '../molecules/Container';
import { HeroSection } from '../molecules/HeroSection';
import { ArticleSection } from '../molecules/ArticleSection';
import { TeamCard } from '../molecules/TeamCard';
import { SimpleGrid } from '../molecules/SimpleGrid';
import { CaseStudyCard } from '../molecules/CaseStudyCard';
import { CTABanner } from '../molecules/CTABanner';
import { SectionHeader } from '../atoms/SectionHeader';
import type { TemplateProps } from './types';
import type {
  MarketingAction,
  HeroEntity,
  TeamMemberEntity,
  CaseStudyEntity,
} from '../organisms/marketing-types';

export type { TeamMemberEntity, CaseStudyEntity };

export interface AboutPageEntity {
  id: string;
  hero: HeroEntity;
  articles: { title: string; content: string }[];
  team?: TeamMemberEntity[];
  caseStudies?: CaseStudyEntity[];
  ctaTitle?: string;
  ctaAction?: MarketingAction;
}

export interface AboutPageTemplateProps extends TemplateProps<AboutPageEntity> {}

export const AboutPageTemplate: React.FC<AboutPageTemplateProps> = ({
  entity,
  className,
}) => {
  const resolved = (entity && typeof entity === 'object' && !Array.isArray(entity))
    ? entity as AboutPageEntity
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

      {resolved.articles.map((article, index) => (
        <Box
          key={`article-${index}`}
          className={cn('py-12', index % 2 !== 0 && 'bg-muted/20')}
        >
          <Container size="lg" padding="lg">
            <ArticleSection title={article.title}>
              <Typography variant="body" color="muted">
                {article.content}
              </Typography>
            </ArticleSection>
          </Container>
        </Box>
      ))}

      {resolved.team && resolved.team.length > 0 && (
        <Box className="bg-muted/20 py-16">
          <Container size="xl" padding="lg">
            <VStack gap="lg">
              <SectionHeader title="Our Team" />
              <SimpleGrid
                cols={Math.min(resolved.team.length, 4) as 1 | 2 | 3 | 4}
                gap="lg"
              >
                {resolved.team.map((member) => (
                  <TeamCard
                    key={member.id}
                    name={member.name}
                    nameAr={member.nameAr}
                    role={member.role}
                    bio={member.bio}
                    avatar={member.avatar}
                  />
                ))}
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>
      )}

      {resolved.caseStudies && resolved.caseStudies.length > 0 && (
        <Box className="py-16">
          <Container size="xl" padding="lg">
            <VStack gap="lg">
              <SectionHeader title="Case Studies" />
              <SimpleGrid
                cols={Math.min(resolved.caseStudies.length, 3) as 1 | 2 | 3}
                gap="lg"
              >
                {resolved.caseStudies.map((study) => (
                  <CaseStudyCard
                    key={study.id}
                    title={study.title}
                    description={study.description}
                    category={study.category}
                    categoryColor={study.categoryColor}
                    href={study.href}
                    linkLabel={study.linkLabel}
                  />
                ))}
              </SimpleGrid>
            </VStack>
          </Container>
        </Box>
      )}

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

AboutPageTemplate.displayName = 'AboutPageTemplate';

export default AboutPageTemplate;
