/**
 * @almadar/ui/ssr
 *
 * SSR-safe subset of @almadar/ui for statically rendered sites (Docusaurus/webpack).
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
export { Avatar } from '../components/core/atoms/Avatar';
export { Image } from '../components/core/atoms/Image';
export type { ImageProps } from '../components/core/atoms/Image';
export { SectionHeader } from '../components/core/atoms/SectionHeader';

// Molecules
export { FeatureCard } from '../components/core/molecules/FeatureCard';
export type { FeatureCardProps } from '../components/core/molecules/FeatureCard';
export { FeatureGrid } from '../components/core/molecules/FeatureGrid';
export type { FeatureGridProps } from '../components/core/molecules/FeatureGrid';
export { SimpleGrid } from '../components/core/molecules/SimpleGrid';
export { Container } from '../components/core/molecules/Container';
export { StatDisplay } from '../components/core/molecules/StatDisplay';
export { GradientDivider } from '../components/core/molecules/GradientDivider';
export type { GradientDividerProps } from '../components/core/molecules/GradientDivider';
export { AnimatedCounter } from '../components/core/molecules/AnimatedCounter';
export type { AnimatedCounterProps } from '../components/core/molecules/AnimatedCounter';

// Scroll/trigger animation atoms (client-side, use inside BrowserOnly for SSR)
export { AnimatedReveal } from '../components/core/atoms/AnimatedReveal';
export type { AnimatedRevealProps, RevealTrigger, RevealAnimation } from '../components/core/atoms/AnimatedReveal';
export { AnimatedGraphic } from '../components/core/atoms/AnimatedGraphic';
export type { AnimatedGraphicProps, GraphicAnimation } from '../components/core/atoms/AnimatedGraphic';

// Decorative patterns (pure SVG, SSR-safe)
export { PatternTile, getTileDimensions } from '../components/core/atoms/PatternTile';
export type { PatternTileProps, PatternVariant } from '../components/core/atoms/PatternTile';
export { GeometricPattern } from '../components/core/molecules/GeometricPattern';
export type { GeometricPatternProps } from '../components/core/molecules/GeometricPattern';
export { EdgeDecoration } from '../components/core/molecules/EdgeDecoration';
export type { EdgeDecorationProps, EdgeVariant, EdgeSide } from '../components/core/molecules/EdgeDecoration';
