'use client';
/**
 * PricingCard Molecule Component
 *
 * A pricing tier card showing plan name, price, features, and CTA button.
 * Composes atoms: Card, VStack, HStack, Badge, Typography, Icon, Divider, Spacer, Button.
 */

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Card } from '../atoms/Card';
import { VStack, HStack } from '../atoms/Stack';
import { Badge } from '../atoms/Badge';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { Divider } from '../atoms/Divider';
import { Spacer } from '../atoms/Spacer';
import { Button } from '../atoms/Button';

export interface PricingCardProps {
  name: string;
  price: string;
  description?: string;
  features: string[];
  action: { label: string; href: string };
  highlighted?: boolean;
  badge?: string;
  className?: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  name,
  price,
  description,
  features,
  action,
  highlighted = false,
  badge,
  className,
}) => {
  return (
    <Card
      variant={highlighted ? 'elevated' : 'bordered'}
      padding="lg"
      className={cn(
        'flex flex-col h-full',
        'hover:-translate-y-1 transition-all',
        highlighted && [
          'border-[length:2px] border-primary',
          'shadow-lg',
          'scale-[1.05]',
          'ring-2 ring-primary',
        ],
        className,
      )}
    >
      <VStack gap="md" className="flex-1">
        {badge && (
          <Badge variant="primary" size="sm">
            {badge}
          </Badge>
        )}

        <Typography variant="h3">{name}</Typography>

        <Typography
          variant="h2"
          className="text-primary font-bold"
        >
          {price}
        </Typography>

        {description && (
          <Typography variant="body2" color="muted">
            {description}
          </Typography>
        )}

        <Divider />

        <VStack gap="sm">
          {features.map((feature) => (
            <HStack key={feature} gap="sm" align="center">
              <Icon
                icon={Check}
                size="sm"
                className="flex-shrink-0 text-success"
              />
              <Typography variant="body2">{feature}</Typography>
            </HStack>
          ))}
        </VStack>

        <Spacer />

        <Button
          variant={highlighted ? 'primary' : 'secondary'}
          size="lg"
          className="w-full"
        >
          {action.label}
        </Button>
      </VStack>
    </Card>
  );
};

PricingCard.displayName = 'PricingCard';
