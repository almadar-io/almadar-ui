'use client';
/**
 * StepFlow Molecule Component
 *
 * A step-by-step progress indicator supporting horizontal and vertical orientations.
 * Composes Center, Typography, Icon, HStack, VStack, Box, and Divider atoms.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { Box } from '../atoms/Box';
import { HStack, VStack } from '../atoms/Stack';
import { Center } from '../atoms/Center';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { Divider } from '../atoms/Divider';

export interface StepItemProps {
  number?: number;
  title: string;
  description: string;
  icon?: string;
}

export interface StepFlowProps {
  steps: StepItemProps[];
  orientation?: 'horizontal' | 'vertical';
  showConnectors?: boolean;
  className?: string;
}

const StepCircle: React.FC<{ step: StepItemProps; index: number }> = ({ step, index }) => {
  if (step.icon) {
    return (
      <Center
        className={cn(
          'w-10 h-10 rounded-full flex-shrink-0',
          'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]',
        )}
      >
        <Icon name={step.icon} size="sm" className="text-[var(--color-primary-foreground)]" />
      </Center>
    );
  }

  return (
    <Center
      className={cn(
        'w-10 h-10 rounded-full flex-shrink-0',
        'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]',
      )}
    >
      <Typography variant="body2" className="font-semibold text-[var(--color-primary-foreground)]">
        {step.number ?? index + 1}
      </Typography>
    </Center>
  );
};

StepCircle.displayName = 'StepCircle';

export const StepFlow: React.FC<StepFlowProps> = ({
  steps,
  orientation = 'horizontal',
  showConnectors = true,
  className,
}) => {
  if (orientation === 'vertical') {
    return (
      <VStack gap="none" className={cn('w-full', className)}>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <HStack gap="md" align="start" className="w-full">
              <VStack gap="none" align="center">
                <StepCircle step={step} index={index} />
                {showConnectors && index < steps.length - 1 && (
                  <Box className="w-px h-8 bg-[var(--color-border)]" />
                )}
              </VStack>
              <VStack gap="xs" className="flex-1 pt-1">
                <Typography variant="h4">{step.title}</Typography>
                <Typography variant="body2" color="muted">
                  {step.description}
                </Typography>
              </VStack>
            </HStack>
          </React.Fragment>
        ))}
      </VStack>
    );
  }

  return (
    <HStack gap="none" align="start" className={cn('w-full', className)}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <VStack gap="sm" align="center" className="flex-1">
            <StepCircle step={step} index={index} />
            <Typography variant="h4" className="text-center">
              {step.title}
            </Typography>
            <Typography variant="body2" color="muted" className="text-center">
              {step.description}
            </Typography>
          </VStack>
          {showConnectors && index < steps.length - 1 && (
            <Box className="flex-shrink-0 pt-5 px-2">
              <Divider orientation="horizontal" className="w-12" />
            </Box>
          )}
        </React.Fragment>
      ))}
    </HStack>
  );
};

StepFlow.displayName = 'StepFlow';
