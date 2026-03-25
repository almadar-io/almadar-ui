'use client';
/**
 * MarketingFooter Molecule Component
 *
 * A themed footer for marketing/documentation sites.
 * Displays link columns, optional logo, and copyright text.
 * Uses @almadar/ui theme CSS variables for consistent branding.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { Box } from '../atoms/Box';
import { VStack, HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
// Divider removed - using border-top on copyright instead

export interface FooterLinkItem {
  label: string;
  href: string;
}

export interface FooterLinkColumn {
  title: string;
  items: FooterLinkItem[];
}

export interface MarketingFooterProps {
  columns: FooterLinkColumn[];
  copyright?: string;
  logo?: { src: string; alt: string; href?: string };
  className?: string;
}

export const MarketingFooter: React.FC<MarketingFooterProps> = ({
  columns,
  copyright,
  logo,
  className,
}) => {
  return (
    <Box
      as="footer"
      className={cn(
        'bg-[var(--color-foreground)] text-[var(--color-background)]',
        'border-t border-[var(--color-border)]',
        'pt-12 pb-8 px-4',
        className,
      )}
    >
      <VStack gap="lg" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Link columns */}
        <HStack gap="lg" align="start" className="flex-wrap w-full justify-between">
          {logo && (
            <VStack gap="sm" className="min-w-[140px] mb-4">
              {logo.href ? (
                <a href={logo.href}>
                  <img src={logo.src} alt={logo.alt} className="h-8 w-auto" />
                </a>
              ) : (
                <img src={logo.src} alt={logo.alt} className="h-8 w-auto" />
              )}
            </VStack>
          )}
          {columns.map((col) => (
            <VStack key={col.title} gap="sm" className="min-w-[140px] mb-4">
              <Typography
                variant="body2"
                className="font-semibold text-[var(--color-background)] mb-1"
              >
                {col.title}
              </Typography>
              {col.items.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'text-sm no-underline',
                    'text-[var(--color-background)]/60',
                    'hover:text-[var(--color-accent)]',
                    'transition-colors duration-150',
                  )}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {item.label}
                </a>
              ))}
            </VStack>
          ))}
        </HStack>

        {/* Copyright */}
        {copyright && (
          <Typography
            variant="caption"
            className="text-[var(--color-background)]/30 text-center w-full pt-6"
          >
            {copyright}
          </Typography>
        )}
      </VStack>
    </Box>
  );
};

MarketingFooter.displayName = 'MarketingFooter';
