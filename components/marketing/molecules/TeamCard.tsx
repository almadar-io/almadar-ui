'use client';
/**
 * TeamCard Molecule Component
 *
 * A card displaying a team member with avatar, name, role, and bio.
 * Composes Card, VStack, Avatar, and Typography atoms.
 */

import React from 'react';
import type { AssetUrl } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { Box } from '../../core/atoms/Box';
import { Card } from '../../core/atoms/Card';
import { VStack } from '../../core/atoms/Stack';
import { Avatar } from '../../core/atoms/Avatar';
import { Typography } from '../../core/atoms/Typography';

export interface TeamCardProps {
  name: string;
  nameAr?: string;
  role: string;
  bio: string;
  avatar?: AssetUrl | { initials: string };
  className?: string;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  name,
  nameAr,
  role,
  bio,
  avatar,
  className,
}) => {
  const avatarSrc = typeof avatar === 'string' ? avatar : undefined;
  const avatarInitials = typeof avatar === 'object' && avatar !== null ? avatar.initials : undefined;

  return (
    <Card variant="bordered" padding="lg" className={cn('w-full', className)}>
      <VStack gap="md" align="center">
        <Avatar
          src={avatarSrc}
          initials={avatarInitials}
          name={!avatarSrc && !avatarInitials ? name : undefined}
          size="lg"
        />
        <Typography variant="h3" className="text-center">
          {name}
        </Typography>
        {nameAr && (
          <Box className="text-center" style={{ direction: 'rtl' }}>
            <Typography variant="caption">
              {nameAr}
            </Typography>
          </Box>
        )}
        <Typography variant="caption" color="muted" className="text-center">
          {role}
        </Typography>
        <Typography variant="body" className="text-center">
          {bio}
        </Typography>
      </VStack>
    </Card>
  );
};

TeamCard.displayName = 'TeamCard';
