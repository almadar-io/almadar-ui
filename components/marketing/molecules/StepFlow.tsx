'use client';
/**
 * StepFlow Molecule Component
 *
 * A step-by-step progress indicator supporting horizontal and vertical orientations.
 * Composes Center, Typography, Icon, HStack, VStack, Box, and Divider atoms.
 */

import React from 'react';
import { cn } from '../../../lib/cn';
import { Box } from '../../core/atoms/Box';
import { HStack, VStack } from '../../core/atoms/Stack';
import { Center } from '../../core/atoms/Center';
import { Typography } from '../../core/atoms/Typography';
import { Icon, type IconInput } from '../../core/atoms/Icon';
import { Divider } from '../../core/atoms/Divider';

export interface StepItemProps {
  number?: number;
  title: string;
  description: string;
  icon?: IconInput;
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
          'flex items-center justify-center',
          'bg-primary text-primary-foreground',
        )}
      >
        <Icon
          icon={typeof step.icon === 'string' ? undefined : step.icon}
          name={typeof step.icon === 'string' ? step.icon : undefined}
          size="sm"
          className="text-primary-foreground"
        />
      </Center>
    );
  }

  return (
    <Center
      className={cn(
        'w-10 h-10 rounded-full flex-shrink-0',
        'flex items-center justify-center',
        'bg-primary text-primary-foreground',
      )}
    >
      <Typography
        as="span"
        variant="small"
        weight="semibold"
        className="text-primary-foreground leading-none"
      >
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
                  <Box className="w-px h-8 bg-border" />
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
    <Box className={cn('w-full flex flex-col md:flex-row items-start gap-0', className)}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <VStack gap="sm" align="center" className="flex-1 w-full md:w-auto">
            <StepCircle step={step} index={index} />
            <Typography variant="h4" className="text-center">
              {step.title}
            </Typography>
            <Typography variant="body2" color="muted" className="text-center">
              {step.description}
            </Typography>
          </VStack>
          {showConnectors && index < steps.length - 1 && (
            <Box className="flex-shrink-0 self-center py-2 md:pt-5 md:py-0 md:px-2">
              <Divider orientation="horizontal" className="w-12 md:w-12" />
            </Box>
          )}
        </React.Fragment>
      ))}
    </Box>
  );
};

StepFlow.displayName = 'StepFlow';
