'use client';
/**
 * CodeExample Molecule Component
 *
 * Displays a block of code with an optional title bar, copy button,
 * and scrollable area. A standalone fallback for code display
 * without syntax highlighting.
 */

import React, { useState, useCallback } from 'react';
import { cn } from '../../lib/cn';
import { Box } from '../atoms/Box';
import { HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Spacer } from '../atoms/Spacer';

export interface CodeExampleProps {
  /** The code content to display */
  code: string;
  /** Programming language label */
  language: string;
  /** Optional title shown in the header bar */
  title?: string;
  /** Whether to show a copy button */
  copyable?: boolean;
  /** Maximum height of the code area (CSS value) */
  maxHeight?: string;
  /** Additional class names */
  className?: string;
}

export const CodeExample: React.FC<CodeExampleProps> = ({
  code,
  language,
  title,
  copyable = false,
  maxHeight,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [code]);

  const showHeader = title || copyable;

  return (
    <Box
      className={cn(
        'bg-[var(--color-foreground)]',
        'rounded-[var(--radius-md)]',
        'border-[length:var(--border-width)] border-[var(--color-border)]',
        'overflow-hidden',
        className,
      )}
    >
      {showHeader && (
        <Box
          className="bg-[var(--color-foreground)] border-b-[length:var(--border-width)] border-[var(--color-border)]"
          padding="sm"
        >
          <HStack gap="sm" align="center">
            {title ? (
              <Typography
                variant="caption"
                className="text-[var(--color-background)] opacity-70"
              >
                {title}
              </Typography>
            ) : (
              <Typography
                variant="caption"
                className="text-[var(--color-background)] opacity-50"
              >
                {language}
              </Typography>
            )}
            <Spacer />
            {copyable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="text-[var(--color-background)] hover:text-[var(--color-background)] opacity-70 hover:opacity-100"
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            )}
          </HStack>
        </Box>
      )}
      <Box
        className="overflow-auto"
        padding="md"
        style={maxHeight ? { maxHeight } : undefined}
      >
        <Typography
          variant="body2"
          className="font-mono text-sm whitespace-pre text-[var(--color-background)] select-all"
        >
          {code}
        </Typography>
      </Box>
    </Box>
  );
};

CodeExample.displayName = 'CodeExample';
