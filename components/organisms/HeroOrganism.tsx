'use client';
/**
 * HeroOrganism
 *
 * Resolves a single HeroEntity and maps it to the HeroSection molecule.
 * Emits UI:CTA_PRIMARY and UI:CTA_SECONDARY when action buttons are clicked.
 *
 * Closed Circuit Compliance:
 * - Receives ALL data via entity prop
 * - Emits events via useEventBus
 * - Never listens to events
 */

import React, { useMemo, useCallback } from 'react';
import { cn } from '../../lib/cn';
import { useEventBus } from '../../hooks/useEventBus';
import { useTranslate } from '../../hooks/useTranslate';
import { HeroSection } from '../molecules/HeroSection';
import { LoadingState } from '../molecules/LoadingState';
import { ErrorState } from '../molecules/ErrorState';
import type { EntityDisplayProps } from './types';
import type { HeroEntity } from './marketing-types';

export interface HeroOrganismProps extends EntityDisplayProps<HeroEntity> {
  children?: React.ReactNode;
}

export const HeroOrganism: React.FC<HeroOrganismProps> = ({
  entity,
  isLoading = false,
  error,
  className,
  children,
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();

  const resolved = useMemo(
    () =>
      Array.isArray(entity)
        ? entity[0]
        : entity && typeof entity === 'object'
          ? (entity as HeroEntity)
          : undefined,
    [entity],
  );

  const handlePrimaryClick = useCallback(() => {
    if (resolved?.primaryAction) {
      eventBus.emit('UI:CTA_PRIMARY', {
        label: resolved.primaryAction.label,
        href: resolved.primaryAction.href,
      });
    }
  }, [eventBus, resolved]);

  const handleSecondaryClick = useCallback(() => {
    if (resolved?.secondaryAction) {
      eventBus.emit('UI:CTA_SECONDARY', {
        label: resolved.secondaryAction.label,
        href: resolved.secondaryAction.href,
      });
    }
  }, [eventBus, resolved]);

  if (isLoading) {
    return <LoadingState message={t('common.loading')} className={className} />;
  }

  if (error) {
    return <ErrorState message={error.message} className={className} />;
  }

  if (!resolved) {
    return null;
  }

  return (
    <HeroSection
      tag={resolved.tag}
      title={resolved.title}
      titleAccent={resolved.titleAccent}
      subtitle={resolved.subtitle}
      primaryAction={
        resolved.primaryAction
          ? { label: resolved.primaryAction.label, href: resolved.primaryAction.href }
          : undefined
      }
      secondaryAction={
        resolved.secondaryAction
          ? { label: resolved.secondaryAction.label, href: resolved.secondaryAction.href }
          : undefined
      }
      installCommand={resolved.installCommand}
      image={resolved.image}
      imagePosition={resolved.imagePosition}
      background={resolved.background}
      className={cn(className)}
      // Wrap children to intercept button clicks
    >
      {children}
      {/* Event bus emissions are triggered via onClick interception at organism level.
          We attach hidden handlers to the component tree. The HeroSection molecule
          renders buttons that we intercept. Since HeroSection doesn't expose onClick
          for its action buttons, we use a wrapper approach with onClickCapture. */}
      <_HeroClickInterceptor
        hasPrimary={!!resolved.primaryAction}
        hasSecondary={!!resolved.secondaryAction}
        onPrimaryClick={handlePrimaryClick}
        onSecondaryClick={handleSecondaryClick}
      />
    </HeroSection>
  );
};

HeroOrganism.displayName = 'HeroOrganism';

/**
 * Internal click interceptor that captures button clicks within the hero section
 * and dispatches the corresponding events via the event bus.
 */
const _HeroClickInterceptor: React.FC<{
  hasPrimary: boolean;
  hasSecondary: boolean;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
}> = ({ hasPrimary, hasSecondary, onPrimaryClick, onSecondaryClick }) => {
  const handleCapture = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button');
      if (!button) return;

      // Determine which button was clicked based on variant class
      const isPrimary = button.classList.contains('bg-primary') ||
        button.getAttribute('data-variant') === 'primary';
      const isSecondary = button.classList.contains('bg-secondary') ||
        button.getAttribute('data-variant') === 'secondary';

      if (isPrimary && hasPrimary) {
        onPrimaryClick();
      } else if (isSecondary && hasSecondary) {
        onSecondaryClick();
      } else if (hasPrimary && !isSecondary) {
        // First button defaults to primary
        onPrimaryClick();
      }
    },
    [hasPrimary, hasSecondary, onPrimaryClick, onSecondaryClick],
  );

  return (
    <span
      onClickCapture={handleCapture}
      style={{ display: 'contents' }}
      aria-hidden="true"
    />
  );
};

_HeroClickInterceptor.displayName = '_HeroClickInterceptor';
