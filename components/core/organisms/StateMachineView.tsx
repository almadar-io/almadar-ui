'use client';

/**
 * StateMachineView — the AVL state machine with loading / error / empty states.
 */

import React from 'react';
import { Box } from '../atoms/Box';
import { Typography } from '../atoms/Typography';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import { AvlStateMachine, type AvlStateMachineProps } from '../../avl/molecules/AvlStateMachine';
import type { TraitLevelData } from '../../../lib/avl-schema-parser';
import { useTranslate } from '../../../hooks/useTranslate';
import type { UiError } from '../atoms/types';

export interface StateMachineViewProps extends Omit<AvlStateMachineProps, 'trait'> {
  /** The trait to draw (see `parseTraitLevel` / `traitLevelFromTrait`). */
  trait?: TraitLevelData;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error state */
  error?: UiError | null;
}

export const StateMachineView: React.FC<StateMachineViewProps> = ({ trait, isLoading = false, error = null, className, ...rest }) => {
  const { t } = useTranslate();

  if (isLoading) return <LoadingState message={t('stateMachine.loading')} />;
  if (error) return <ErrorState message={error instanceof Error ? error.message : String(error)} />;
  if (!trait) {
    return (
      <Box data-testid="state-machine-view-empty" padding="lg" className="text-center">
        <Typography variant="body" color="muted">{t('stateMachine.noStateMachine')}</Typography>
      </Box>
    );
  }
  return <AvlStateMachine trait={trait} className={className} {...rest} />;
};

// Compat aliases
export { StateMachineView as DomStateMachineVisualizer };
export { StateMachineView as OrbitalStateMachineView };

StateMachineView.displayName = 'StateMachineView';
