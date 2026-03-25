'use client';
/**
 * DocCodeBlock Molecule
 *
 * A themed code block with optional title bar and copy-to-clipboard button.
 * Composed from Box, HStack, Typography, and Button atoms.
 */
import React, { useState, useCallback } from 'react';
import { cn } from '../../lib/cn';
import { Box } from '../atoms/Box';
import { HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';

export interface DocCodeBlockProps {
  /** Code content to display */
  code: string;
  /** Programming language label */
  language?: string;
  /** Optional title/filename shown in the header bar */
  title?: string;
  /** Show line numbers in the gutter */
  showLineNumbers?: boolean;
  /** Additional class names */
  className?: string;
}

export function DocCodeBlock({
  code,
  language,
  title,
  showLineNumbers = false,
  className,
}: DocCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  const lines = code.split('\n');

  return (
    <Box
      className={cn(
        'rounded-md border border-border overflow-hidden',
        className,
      )}
      position="relative"
    >
      {/* Title bar */}
      {title ? (
        <HStack
          align="center"
          justify="between"
          className="bg-muted px-4 py-2 border-b border-border"
        >
          <HStack align="center" gap="sm">
            <Typography variant="caption" color="muted">
              {title}
            </Typography>
            {language ? (
              <Typography variant="caption" color="muted">
                {language}
              </Typography>
            ) : null}
          </HStack>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            leftIcon={copied ? 'check' : 'copy'}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </HStack>
      ) : null}

      {/* Copy button when no title bar */}
      {!title ? (
        <Box position="absolute" className="top-2 right-2 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            leftIcon={copied ? 'check' : 'copy'}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </Box>
      ) : null}

      {/* Code area */}
      <HStack gap="none" className="bg-foreground overflow-x-auto">
        {/* Line numbers gutter */}
        {showLineNumbers ? (
          <Box
            className="py-4 pl-4 pr-3 select-none border-r border-border flex-shrink-0"
          >
            {lines.map((_, i) => (
              <Typography
                key={i}
                variant="caption"
                color="muted"
                className="block font-mono text-right leading-6"
                as="span"
              >
                {i + 1}
              </Typography>
            ))}
          </Box>
        ) : null}

        {/* Code content */}
        <Box
          as="pre"
          className={cn(
            'p-4 font-mono text-sm text-background leading-6 flex-1 min-w-0',
            !title && 'pr-24',
          )}
        >
          <Box as="code" className="whitespace-pre">
            {code}
          </Box>
        </Box>
      </HStack>
    </Box>
  );
}
