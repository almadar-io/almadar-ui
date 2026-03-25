'use client';
/**
 * CaseStudyCard Molecule Component
 *
 * A card for displaying case studies with category badge, title,
 * description, and a call-to-action link button.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { Card } from '../atoms/Card';
import { VStack } from '../atoms/Stack';
import { Badge } from '../atoms/Badge';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';

export interface CaseStudyCardProps {
  /** Case study title */
  title: string;
  /** Short description of the case study */
  description: string;
  /** Category label shown as a badge */
  category: string;
  /** Custom background color for the category badge (CSS value) */
  categoryColor?: string;
  /** URL the card links to */
  href: string;
  /** Label for the link button */
  linkLabel?: string;
  /** Additional class names */
  className?: string;
}

export const CaseStudyCard: React.FC<CaseStudyCardProps> = ({
  title,
  description,
  category,
  categoryColor,
  href,
  linkLabel = 'Read more',
  className,
}) => {
  const handleClick = () => {
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card variant="interactive" className={cn(className)}>
      <VStack gap="md" align="start">
        <Badge
          size="sm"
          style={categoryColor ? { backgroundColor: categoryColor, color: 'white' } : undefined}
        >
          {category}
        </Badge>
        <Typography variant="h3">
          {title}
        </Typography>
        <Typography variant="body" color="muted">
          {description}
        </Typography>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClick}
          className="text-primary -ml-2"
        >
          {linkLabel} →
        </Button>
      </VStack>
    </Card>
  );
};

CaseStudyCard.displayName = 'CaseStudyCard';
