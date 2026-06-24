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
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';
import { HeroSection } from '../molecules/HeroSection';
import { LoadingState } from '../../core/molecules/LoadingState';
import { ErrorState } from '../../core/molecules/ErrorState';
import type { EntityWith } from '@almadar/core';
import type { DisplayStateProps } from '../../core/organisms/types';

/** A hero CTA: a plain `{ label, href }` object (FieldValue-compatible — a `type`,
 *  not `interface`, so it's assignable to the entity-row `FieldValue` index sig). */
export type HeroAction = {
  label?: string;
  href?: string;
};

/** The hero entity fields this organism reads (FieldValue-compatible; `image` is a plain
 *  `{ src, alt }` object, the action fields plain `{ label, href }` objects). */
export interface HeroRow {
  title: string;
  tag?: string;
  titleAccent?: string;
  subtitle?: string;
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
  installCommand?: string;
  image?: { src?: string; alt?: string };
  imagePosition?: 'below' | 'right' | 'background';
  background?: 'dark' | 'gradient' | 'subtle';
}

export interface HeroOrganismProps extends DisplayStateProps {
  entity?: EntityWith<HeroRow>;
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
          ? entity
          : undefined,
    [entity],
  );

  const primaryAction = resolved?.primaryAction;
  const secondaryAction = resolved?.secondaryAction;

  const handlePrimaryClick = useCallback(() => {
    if (primaryAction) {
      eventBus.emit('UI:CTA_PRIMARY', {
        label: String(primaryAction.label ?? ''),
        href: String(primaryAction.href ?? ''),
      });
    }
  }, [eventBus, primaryAction]);

  const handleSecondaryClick = useCallback(() => {
    if (secondaryAction) {
      eventBus.emit('UI:CTA_SECONDARY', {
        label: String(secondaryAction.label ?? ''),
        href: String(secondaryAction.href ?? ''),
      });
    }
  }, [eventBus, secondaryAction]);

  if (isLoading) {
    return <LoadingState message={t('common.loading')} className={className} />;
  }

  if (error) {
    return <ErrorState message={error.message} className={className} />;
  }

  if (!resolved) {
    return null;
  }

  const imageRaw = resolved.image;
  const image = imageRaw
    ? { src: String(imageRaw.src ?? ''), alt: String(imageRaw.alt ?? '') }
    : undefined;

  return (
    <HeroSection
      tag={resolved.tag != null ? String(resolved.tag) : undefined}
      title={String(resolved.title ?? '')}
      titleAccent={resolved.titleAccent != null ? String(resolved.titleAccent) : undefined}
      subtitle={String(resolved.subtitle ?? '')}
      primaryAction={
        primaryAction
          ? { label: String(primaryAction.label ?? ''), href: String(primaryAction.href ?? '') }
          : undefined
      }
      secondaryAction={
        secondaryAction
          ? { label: String(secondaryAction.label ?? ''), href: String(secondaryAction.href ?? '') }
          : undefined
      }
      installCommand={resolved.installCommand != null ? String(resolved.installCommand) : undefined}
      image={image}
      imagePosition={resolved.imagePosition}
      background={resolved.background}
      className={cn(className)}
      // Wrap children to intercept button clicks
    >
      {children}
      {/* HeroSection doesn't expose onClick for its action buttons, so we
          intercept clicks via onClickCapture to dispatch CTA events. */}
      <_HeroClickInterceptor
        hasPrimary={!!primaryAction}
        hasSecondary={!!secondaryAction}
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
