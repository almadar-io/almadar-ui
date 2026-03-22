'use client';
/**
 * HeroSection Molecule Component
 *
 * A full-width hero section for landing pages and marketing content.
 * Composes atoms: Box, VStack, HStack, Badge, Typography, Button.
 * Optionally includes an InstallBox molecule for CLI commands.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { Box } from '../atoms/Box';
import { VStack, HStack } from '../atoms/Stack';
import { Badge } from '../atoms/Badge';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { InstallBox } from './InstallBox';

export interface HeroSectionProps {
  tag?: string;
  tagVariant?: 'primary' | 'secondary' | 'accent';
  title: string;
  titleAccent?: string;
  subtitle: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  installCommand?: string;
  image?: { src: string; alt: string };
  imagePosition?: 'below' | 'right' | 'background';
  background?: 'dark' | 'gradient' | 'subtle';
  align?: 'center' | 'left';
  /** Background element (SVG animation, etc.) rendered behind hero content */
  backgroundElement?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const tagVariantMap: Record<string, 'primary' | 'secondary' | 'info'> = {
  primary: 'primary',
  secondary: 'secondary',
  accent: 'info',
};

const backgroundStyles: Record<string, string> = {
  dark: 'bg-[var(--color-foreground)] text-[var(--color-background)]',
  gradient: [
    'bg-[radial-gradient(ellipse_at_top,var(--color-primary)/0.08,transparent_60%),',
    'radial-gradient(ellipse_at_bottom_right,var(--color-accent)/0.06,transparent_50%)]',
    'bg-[var(--color-background)]',
  ].join(' '),
  subtle: 'bg-[var(--color-muted)]/30',
};

/**
 * Internal image wrapper using Box with background-image.
 * Avoids raw HTML img elements.
 */
const MarketingImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className }) => (
  <Box
    className={cn(
      'overflow-hidden rounded-[var(--radius-lg)] bg-cover bg-center bg-no-repeat',
      className,
    )}
    style={{ backgroundImage: `url(${src})` }}
    role="img"
    aria-label={alt}
  />
);

MarketingImage.displayName = 'MarketingImage';

export const HeroSection: React.FC<HeroSectionProps> = ({
  tag,
  tagVariant = 'primary',
  title,
  titleAccent,
  subtitle,
  primaryAction,
  secondaryAction,
  installCommand,
  image,
  imagePosition = 'below',
  background = 'subtle',
  align = 'center',
  backgroundElement,
  children,
  className,
}) => {
  const isCenter = align === 'center';
  const isDark = background === 'dark';

  const titleNode = titleAccent ? (
    <Typography
      variant="h1"
      align={isCenter ? 'center' : 'left'}
      className={cn(
        'max-w-3xl leading-tight',
        isDark && 'text-[var(--color-background)]',
      )}
    >
      {title}{' '}
      <Typography
        as="span"
        variant="h1"
        className="text-[var(--color-primary)]"
      >
        {titleAccent}
      </Typography>
    </Typography>
  ) : (
    <Typography
      variant="h1"
      align={isCenter ? 'center' : 'left'}
      className={cn(
        'max-w-3xl leading-tight',
        isDark && 'text-[var(--color-background)]',
      )}
    >
      {title}
    </Typography>
  );

  const textContent = (
    <VStack
      gap="lg"
      align={isCenter ? 'center' : 'start'}
      className={cn(
        isCenter && 'items-center',
        imagePosition === 'right' ? 'flex-1' : 'w-full',
      )}
    >
      {tag && (
        <Badge variant={tagVariantMap[tagVariant] ?? 'primary'} size="md">
          {tag}
        </Badge>
      )}

      {titleNode}

      <Typography
        variant="body1"
        color="muted"
        align={isCenter ? 'center' : 'left'}
        className="max-w-xl"
      >
        {subtitle}
      </Typography>

      {installCommand && <InstallBox command={installCommand} />}

      {(primaryAction || secondaryAction) && (
        <HStack gap="md" align="center">
          {primaryAction && (
            <Button variant="primary" size="lg" onClick={() => {
              const external = primaryAction.href.startsWith('http');
              window.open(primaryAction.href, external ? '_blank' : '_self');
            }}>
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="secondary" size="lg" onClick={() => {
              const external = secondaryAction.href.startsWith('http');
              window.open(secondaryAction.href, external ? '_blank' : '_self');
            }}>
              {secondaryAction.label}
            </Button>
          )}
        </HStack>
      )}

      {children}
    </VStack>
  );

  const imageNode = image && (
    <MarketingImage
      src={image.src}
      alt={image.alt}
      className={cn(
        imagePosition === 'right'
          ? 'flex-1 min-h-[300px]'
          : 'w-full max-w-3xl min-h-[400px]',
      )}
    />
  );

  const innerContent =
    image && imagePosition === 'right' ? (
      <HStack gap="xl" align="center" className="w-full max-w-6xl" responsive>
        {textContent}
        {imageNode}
      </HStack>
    ) : (
      <VStack gap="xl" align={isCenter ? 'center' : 'start'} className="w-full max-w-6xl">
        {textContent}
        {image && imagePosition === 'below' && imageNode}
      </VStack>
    );

  return (
    <Box
      as="header"
      className={cn(
        'w-full min-h-[60vh] flex items-center justify-center',
        'px-6 py-20',
        'relative overflow-hidden',
        className,
      )}
    >
      {backgroundElement}
      {image && imagePosition === 'background' && (
        <MarketingImage
          src={image.src}
          alt={image.alt}
          className="absolute inset-0 w-full h-full opacity-20"
        />
      )}
      <Box className="relative z-10 w-full flex justify-center">
        {innerContent}
      </Box>
    </Box>
  );
};

HeroSection.displayName = 'HeroSection';
