/**
 * @almadar/ui/marketing
 *
 * SSR-safe subset of @almadar/ui for marketing/documentation sites.
 * Contains only the atoms and molecules used in Docusaurus pages.
 * No game engines, no Three.js, no browser-only APIs at module scope.
 */

// Atoms
export { Box } from '../components/atoms/Box';
export { VStack, HStack } from '../components/atoms/Stack';
export { Typography } from '../components/atoms/Typography';
export { Button } from '../components/atoms/Button';
export { Badge } from '../components/atoms/Badge';
export { Icon } from '../components/atoms/Icon';
export { Card } from '../components/atoms/Card';
export { Divider } from '../components/atoms/Divider';
export { Center } from '../components/atoms/Center';
export { Spacer } from '../components/atoms/Spacer';
export { ContentSection } from '../components/atoms/ContentSection';
export type { ContentSectionProps } from '../components/atoms/ContentSection';

// Marketing Molecules
export { HeroSection } from '../components/molecules/HeroSection';
export type { HeroSectionProps } from '../components/molecules/HeroSection';
export { CTABanner } from '../components/molecules/CTABanner';
export type { CTABannerProps } from '../components/molecules/CTABanner';
export { FeatureCard } from '../components/molecules/FeatureCard';
export type { FeatureCardProps } from '../components/molecules/FeatureCard';
export { FeatureGrid } from '../components/molecules/FeatureGrid';
export type { FeatureGridProps } from '../components/molecules/FeatureGrid';
export { PricingCard } from '../components/molecules/PricingCard';
export type { PricingCardProps } from '../components/molecules/PricingCard';
export { PricingGrid } from '../components/molecules/PricingGrid';
export type { PricingGridProps } from '../components/molecules/PricingGrid';
export { SplitSection } from '../components/molecules/SplitSection';
export type { SplitSectionProps } from '../components/molecules/SplitSection';
export { InstallBox } from '../components/molecules/InstallBox';
export type { InstallBoxProps } from '../components/molecules/InstallBox';
export { StepFlow } from '../components/molecules/StepFlow';
export type { StepFlowProps, StepItemProps } from '../components/molecules/StepFlow';
export { StatsGrid } from '../components/molecules/StatsGrid';
export type { StatsGridProps } from '../components/molecules/StatsGrid';
export { TagCloud } from '../components/molecules/TagCloud';
export type { TagCloudProps } from '../components/molecules/TagCloud';
export { CommunityLinks } from '../components/molecules/CommunityLinks';
export type { CommunityLinksProps } from '../components/molecules/CommunityLinks';
export { ServiceCatalog } from '../components/molecules/ServiceCatalog';
export type { ServiceCatalogProps } from '../components/molecules/ServiceCatalog';
export { ShowcaseCard } from '../components/molecules/ShowcaseCard';
export type { ShowcaseCardProps } from '../components/molecules/ShowcaseCard';
export { TeamCard } from '../components/molecules/TeamCard';
export type { TeamCardProps } from '../components/molecules/TeamCard';
export { CaseStudyCard } from '../components/molecules/CaseStudyCard';
export type { CaseStudyCardProps } from '../components/molecules/CaseStudyCard';
export { ArticleSection } from '../components/molecules/ArticleSection';
export type { ArticleSectionProps } from '../components/molecules/ArticleSection';
export { SimpleGrid } from '../components/molecules/SimpleGrid';
export { MarketingFooter } from '../components/molecules/MarketingFooter';
export type { MarketingFooterProps, FooterLinkColumn, FooterLinkItem } from '../components/molecules/MarketingFooter';
export { GradientDivider } from '../components/molecules/GradientDivider';
export type { GradientDividerProps } from '../components/molecules/GradientDivider';
export { PullQuote } from '../components/molecules/PullQuote';
export type { PullQuoteProps } from '../components/molecules/PullQuote';
export { AnimatedCounter } from '../components/molecules/AnimatedCounter';
export type { AnimatedCounterProps } from '../components/molecules/AnimatedCounter';

// Decorative patterns (pure SVG, SSR-safe)
export { PatternTile, getTileDimensions } from '../components/atoms/PatternTile';
export type { PatternTileProps, PatternVariant } from '../components/atoms/PatternTile';
export { GeometricPattern } from '../components/molecules/GeometricPattern';
export type { GeometricPatternProps } from '../components/molecules/GeometricPattern';
export { EdgeDecoration } from '../components/molecules/EdgeDecoration';
export type { EdgeDecorationProps, EdgeVariant, EdgeSide } from '../components/molecules/EdgeDecoration';
