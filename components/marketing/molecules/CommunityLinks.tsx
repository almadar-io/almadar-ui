'use client';
/**
 * CommunityLinks Molecule Component
 *
 * Displays community platform links (GitHub, Discord, Twitter) as styled buttons.
 * Composes VStack, HStack, Typography, Button, and Icon atoms.
 */

import React from 'react';
import { cn } from '../../../lib/cn';
import { VStack, HStack } from '../../core/atoms/Stack';
import { Typography } from '../../core/atoms/Typography';
import { Button } from '../../core/atoms/Button';
import { Icon } from '../../core/atoms/Icon';

export interface GithubLink {
  url: string;
  stars?: number;
}

export interface DiscordLink {
  url: string;
  members?: number;
}

export interface TwitterLink {
  url: string;
  followers?: number;
}

export interface CommunityLinksProps {
  github?: GithubLink;
  discord?: DiscordLink;
  twitter?: TwitterLink;
  heading?: string;
  subtitle?: string;
  className?: string;
}

function formatCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return String(count);
}

export const CommunityLinks: React.FC<CommunityLinksProps> = ({
  github,
  discord,
  twitter,
  heading,
  subtitle,
  className,
}) => {
  const openLink = (url: string) => () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <VStack gap="lg" align="center" className={className}>
      {heading && (
        <Typography variant="h2" className="text-center">
          {heading}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="body" color="muted" className="text-center">
          {subtitle}
        </Typography>
      )}
      <HStack gap="md" className="flex-wrap justify-center">
        {github && (
          <Button variant="primary" onClick={openLink(github.url)}>
            <HStack gap="sm" align="center">
              <Icon name="github" size="sm" />
              <Typography variant="body2" className="text-inherit">
                {github.stars != null
                  ? `GitHub (${formatCount(github.stars)} stars)`
                  : 'GitHub'}
              </Typography>
            </HStack>
          </Button>
        )}
        {discord && (
          <Button variant="secondary" onClick={openLink(discord.url)}>
            <HStack gap="sm" align="center">
              <Icon name="message-circle" size="sm" />
              <Typography variant="body2" className="text-inherit">
                {discord.members != null
                  ? `Discord (${formatCount(discord.members)} members)`
                  : 'Discord'}
              </Typography>
            </HStack>
          </Button>
        )}
        {twitter && (
          <Button variant="secondary" onClick={openLink(twitter.url)}>
            <HStack gap="sm" align="center">
              <Icon name="twitter" size="sm" />
              <Typography variant="body2" className="text-inherit">
                {twitter.followers != null
                  ? `Twitter (${formatCount(twitter.followers)} followers)`
                  : 'Twitter'}
              </Typography>
            </HStack>
          </Button>
        )}
      </HStack>
    </VStack>
  );
};

CommunityLinks.displayName = 'CommunityLinks';
