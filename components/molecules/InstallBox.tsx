'use client';
/**
 * InstallBox Molecule Component
 *
 * A copyable command display box for install/CLI commands.
 * Shows a monospace command with a copy-to-clipboard button.
 */

import React, { useState, useCallback } from 'react';
import { cn } from '../../lib/cn';
import { Box } from '../atoms/Box';
import { HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';

export interface InstallBoxProps {
  /** The command to display and copy */
  command: string;
  /** Optional label above the command */
  label?: string;
  /** Additional class names */
  className?: string;
}

export const InstallBox: React.FC<InstallBoxProps> = ({
  command,
  label,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(command);
    setCopied(true);
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [command]);

  return (
    <Box className={cn('inline-block', className)}>
      {label && (
        <Typography variant="caption" className="mb-1">
          {label}
        </Typography>
      )}
      <Box
        className={cn(
          'bg-foreground',
          'rounded-md',
          'border-[length:var(--border-width)] border-border',
        )}
        padding="md"
      >
        <HStack gap="md" align="center">
          <Typography
            variant="body2"
            className="font-mono flex-1 min-w-0 text-background select-all"
            truncate
          >
            {command}
          </Typography>
          <Button
            variant="ghost"
            size="md"
            onClick={handleCopy}
            className="flex-shrink-0 text-background hover:text-background"
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </HStack>
      </Box>
    </Box>
  );
};

InstallBox.displayName = 'InstallBox';
