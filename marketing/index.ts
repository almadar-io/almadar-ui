/**
 * @almadar/ui/marketing
 *
 * SSR-safe subset of @almadar/ui for marketing/documentation sites.
 * Contains only the atoms and molecules used in Docusaurus pages.
 * No game engines, no Three.js, no browser-only APIs at module scope.
 */

// Atoms
export { Box } from '../components/core/atoms/Box';
export { VStack, HStack } from '../components/core/atoms/Stack';
export { Typography } from '../components/core/atoms/Typography';
export { Button } from '../components/core/atoms/Button';
export { Badge } from '../components/core/atoms/Badge';
export { Icon } from '../components/core/atoms/Icon';
export { Card } from '../components/core/atoms/Card';
export { Divider } from '../components/core/atoms/Divider';
export { Center } from '../components/core/atoms/Center';
export { Spacer } from '../components/core/atoms/Spacer';
export { ContentSection } from '../components/marketing/atoms/ContentSection';
export type { ContentSectionProps } from '../components/marketing/atoms/ContentSection';

// Marketing Molecules
export { HeroSection } from '../components/marketing/molecules/HeroSection';
export type { HeroSectionProps } from '../components/marketing/molecules/HeroSection';
export { CTABanner } from '../components/marketing/molecules/CTABanner';
export type { CTABannerProps } from '../components/marketing/molecules/CTABanner';
export { FeatureCard } from '../components/marketing/molecules/FeatureCard';
export type { FeatureCardProps } from '../components/marketing/molecules/FeatureCard';
export { FeatureGrid } from '../components/core/molecules/FeatureGrid';
export type { FeatureGridProps } from '../components/core/molecules/FeatureGrid';
export { PricingCard } from '../components/marketing/molecules/PricingCard';
export type { PricingCardProps } from '../components/marketing/molecules/PricingCard';
export { PricingGrid } from '../components/marketing/molecules/PricingGrid';
export type { PricingGridProps } from '../components/marketing/molecules/PricingGrid';
export { SplitSection } from '../components/marketing/molecules/SplitSection';
export type { SplitSectionProps } from '../components/marketing/molecules/SplitSection';
export { InstallBox } from '../components/marketing/molecules/InstallBox';
export type { InstallBoxProps } from '../components/marketing/molecules/InstallBox';
export { StepFlow } from '../components/marketing/molecules/StepFlow';
export type { StepFlowProps, StepItemProps } from '../components/marketing/molecules/StepFlow';
export { StatsGrid } from '../components/marketing/molecules/StatsGrid';
export type { StatsGridProps } from '../components/marketing/molecules/StatsGrid';
export { TagCloud } from '../components/marketing/molecules/TagCloud';
export type { TagCloudProps } from '../components/marketing/molecules/TagCloud';
export { CommunityLinks } from '../components/marketing/molecules/CommunityLinks';
export type { CommunityLinksProps } from '../components/marketing/molecules/CommunityLinks';
export { ServiceCatalog } from '../components/marketing/molecules/ServiceCatalog';
export type { ServiceCatalogProps } from '../components/marketing/molecules/ServiceCatalog';
export { ShowcaseCard } from '../components/marketing/molecules/ShowcaseCard';
export type { ShowcaseCardProps } from '../components/marketing/molecules/ShowcaseCard';
export { TeamCard } from '../components/marketing/molecules/TeamCard';
export type { TeamCardProps } from '../components/marketing/molecules/TeamCard';
export { CaseStudyCard } from '../components/marketing/molecules/CaseStudyCard';
export type { CaseStudyCardProps } from '../components/marketing/molecules/CaseStudyCard';
export { ArticleSection } from '../components/marketing/molecules/ArticleSection';
export type { ArticleSectionProps } from '../components/marketing/molecules/ArticleSection';
export { SimpleGrid } from '../components/core/molecules/SimpleGrid';
export { MarketingFooter } from '../components/marketing/molecules/MarketingFooter';
export type { MarketingFooterProps, FooterLinkColumn, FooterLinkItem } from '../components/marketing/molecules/MarketingFooter';
export { GradientDivider } from '../components/core/molecules/GradientDivider';
export type { GradientDividerProps } from '../components/core/molecules/GradientDivider';
export { PullQuote } from '../components/marketing/molecules/PullQuote';
export type { PullQuoteProps } from '../components/marketing/molecules/PullQuote';
export { AnimatedCounter } from '../components/core/molecules/AnimatedCounter';
export type { AnimatedCounterProps } from '../components/core/molecules/AnimatedCounter';

// Scroll/trigger animation atoms (client-side, use inside BrowserOnly for SSR)
export { AnimatedReveal } from '../components/marketing/atoms/AnimatedReveal';
export type { AnimatedRevealProps, RevealTrigger, RevealAnimation } from '../components/marketing/atoms/AnimatedReveal';
export { AnimatedGraphic } from '../components/marketing/atoms/AnimatedGraphic';
export type { AnimatedGraphicProps, GraphicAnimation } from '../components/marketing/atoms/AnimatedGraphic';

// Decorative patterns (pure SVG, SSR-safe)
export { PatternTile, getTileDimensions } from '../components/marketing/atoms/PatternTile';
export type { PatternTileProps, PatternVariant } from '../components/marketing/atoms/PatternTile';
export { GeometricPattern } from '../components/marketing/molecules/GeometricPattern';
export type { GeometricPatternProps } from '../components/marketing/molecules/GeometricPattern';
export { EdgeDecoration } from '../components/core/molecules/EdgeDecoration';
export type { EdgeDecorationProps, EdgeVariant, EdgeSide } from '../components/core/molecules/EdgeDecoration';
