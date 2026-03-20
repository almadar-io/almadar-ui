'use client';
/**
 * ServiceCatalog Molecule Component
 *
 * Displays a grid of services organized by layer, each shown as a card
 * with a layer badge and service name.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { Card } from '../atoms/Card';
import { VStack } from '../atoms/Stack';
import { Badge } from '../atoms/Badge';
import { Typography } from '../atoms/Typography';
import { SimpleGrid } from './SimpleGrid';

export interface ServiceCatalogItem {
  name: string;
  layer: string;
  layerColor?: string;
}

export interface ServiceCatalogProps {
  /** List of services to display */
  services: ServiceCatalogItem[];
  /** Additional class names */
  className?: string;
}

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({
  services,
  className,
}) => {
  return (
    <SimpleGrid cols={4} gap="sm" className={cn(className)}>
      {services.map((service) => (
        <Card key={service.name} variant="bordered" padding="sm">
          <VStack gap="xs" align="start">
            <Badge
              size="sm"
              className={service.layerColor}
            >
              {service.layer}
            </Badge>
            <Typography variant="body">
              {service.name}
            </Typography>
          </VStack>
        </Card>
      ))}
    </SimpleGrid>
  );
};

ServiceCatalog.displayName = 'ServiceCatalog';
