/**
 * BuilderBoard
 *
 * Component-snapping game board. The player places components
 * onto slots in a blueprint. Correct placement completes the build.
 *
 * Good for: architecture, circuits, molecules, system design stories.
 *
 * Events emitted via completeEvent (default UI:PUZZLE_COMPLETE).
 */

 

import React, { useState, useCallback } from 'react';
import type { EventEmit, EntityRow } from '@almadar/core';
import { Box, VStack, HStack, Card, Button, Typography, Badge, Icon } from '../../../../atoms';
import { useEventBus } from '../../../../../hooks/useEventBus';
import { useTranslate } from '../../../../../hooks/useTranslate';
import type { EntityDisplayProps } from '../../../types';
import { CheckCircle, XCircle, RotateCcw, Wrench } from 'lucide-react';

export interface BuilderComponent {
  id: string;
  label: string;
  description?: string;
  iconEmoji?: string;
  /** Image URL icon (takes precedence over iconEmoji) */
  iconUrl?: string;
  category?: string;
}

export interface BuilderSlot {
  id: string;
  label: string;
  description?: string;
  acceptsComponentId: string;
}

export interface BuilderPuzzleEntity {
  id: string;
  title: string;
  description: string;
  components: BuilderComponent[];
  slots: BuilderSlot[];
  successMessage?: string;
  failMessage?: string;
  hint?: string;
  /** Header image URL displayed above the title */
  headerImage?: string;
  /** Visual theme overrides */
  theme?: { background?: string; accentColor?: string };
}

export interface BuilderBoardProps extends Omit<EntityDisplayProps, 'entity'> {
  // The compiler binds the generic `EntityRow`, so the inlet accepts it (and
  // arrays) as union members; the component narrows to its curated
  // `BuilderPuzzleEntity` read-shape below (a valid union-narrow) and renders
  // nothing until a puzzle entity is present.
  entity?: BuilderPuzzleEntity | EntityRow | readonly (BuilderPuzzleEntity | EntityRow)[];
  completeEvent?: EventEmit<{ success: boolean; attempts: number }>;
}

export function BuilderBoard({
  entity,
  completeEvent = 'PUZZLE_COMPLETE',
  className,
}: BuilderBoardProps): React.JSX.Element | null {
  const { emit } = useEventBus();
  const { t } = useTranslate();
  const resolved = (Array.isArray(entity) ? entity[0] : entity) as BuilderPuzzleEntity | undefined;

  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [headerError, setHeaderError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const components = resolved?.components ?? [];
  const slots = resolved?.slots ?? [];
  const usedComponentIds = new Set(Object.values(placements));
  const availableComponents = components.filter((c) => !usedComponentIds.has(c.id));
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const allPlaced = Object.keys(placements).length === slots.length;

  const results = submitted
    ? slots.map((slot) => ({
      slot,
      placed: placements[slot.id],
      correct: placements[slot.id] === slot.acceptsComponentId,
    }))
    : [];

  const allCorrect = results.length > 0 && results.every((r) => r.correct);

  const handlePlaceComponent = (slotId: string) => {
    if (submitted || !selectedComponent) return;
    setPlacements((prev) => ({ ...prev, [slotId]: selectedComponent }));
    setSelectedComponent(null);
  };

  const handleRemoveFromSlot = (slotId: string) => {
    if (submitted) return;
    setPlacements((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  };

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    setAttempts((a) => a + 1);
    const correct = slots.every((slot) => placements[slot.id] === slot.acceptsComponentId);
    if (correct) {
      emit(`UI:${completeEvent}`, { success: true, attempts: attempts + 1 });
    }
  }, [slots, placements, attempts, completeEvent, emit]);

  const handleReset = () => {
    setSubmitted(false);
    if (attempts >= 2 && resolved?.hint) {
      setShowHint(true);
    }
  };

  const handleFullReset = () => {
    setPlacements({});
    setSubmitted(false);
    setSelectedComponent(null);
    setAttempts(0);
    setShowHint(false);
  };

  const getComponentById = (id: string) => components.find((c) => c.id === id);

  if (!resolved) return null;

  return (
    <Box
      className={className}
      style={{
        backgroundImage: resolved.theme?.background ? `url(${resolved.theme.background})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <VStack gap="lg" className="p-4">
        {/* Header image */}
        {resolved.headerImage && !headerError ? (
          <Box className="w-full h-32 overflow-hidden rounded-container">
            <img src={resolved.headerImage} alt="" onError={() => setHeaderError(true)} className="w-full h-full object-cover" />
          </Box>
        ) : resolved.headerImage && headerError ? (
          <Box className="w-full h-32 rounded-container bg-gradient-to-br from-muted to-accent opacity-60" />
        ) : null}

        <Card className="p-4">
          <VStack gap="sm">
            <Typography variant="h4" weight="bold">{resolved.title}</Typography>
            <Typography variant="body">{resolved.description}</Typography>
          </VStack>
        </Card>

        {/* Available components */}
        <Card className="p-4">
          <VStack gap="sm">
            <Typography variant="small" weight="bold" className="uppercase tracking-wider text-muted-foreground">
              {t('builder.components')}
            </Typography>
            <HStack gap="sm" className="flex-wrap">
              {availableComponents.map((comp) => (
                <Button
                  key={comp.id}
                  size="sm"
                  variant={selectedComponent === comp.id ? 'primary' : 'secondary'}
                  onClick={() => setSelectedComponent(selectedComponent === comp.id ? null : comp.id)}
                  disabled={submitted}
                >
                  {comp.iconUrl ? (
                    <img src={comp.iconUrl} alt="" className="w-5 h-5 object-contain inline-block mr-1" />
                  ) : comp.iconEmoji ? (
                    <>{comp.iconEmoji}{' '}</>
                  ) : null}{comp.label}
                </Button>
              ))}
              {availableComponents.length === 0 && !submitted && (
                <Typography variant="caption" className="text-muted-foreground">
                  {t('builder.allPlaced')}
                </Typography>
              )}
            </HStack>
          </VStack>
        </Card>

        {/* Blueprint slots */}
        <Card className="p-4">
          <VStack gap="sm">
            <Typography variant="small" weight="bold" className="uppercase tracking-wider text-muted-foreground">
              {t('builder.blueprint')}
            </Typography>
            <VStack gap="sm">
              {slots.map((slot) => {
                const placedComp = placements[slot.id] ? getComponentById(placements[slot.id]) : null;
                const result = results.find((r) => r.slot.id === slot.id);
                return (
                  <HStack
                    key={slot.id}
                    gap="sm"
                    align="center"
                    className={`p-3 border-2 rounded ${
                      result
                        ? result.correct
                          ? 'border-success'
                          : 'border-error'
                        : selectedComponent
                          ? 'border-dashed border-foreground cursor-pointer'
                          : 'border-border'
                    }`}
                    onClick={() => handlePlaceComponent(slot.id)}
                  >
                    <VStack gap="none" className="flex-1">
                      <Typography variant="body" weight="medium">{slot.label}</Typography>
                      {slot.description && (
                        <Typography variant="caption" className="text-muted-foreground">{slot.description}</Typography>
                      )}
                    </VStack>
                    {placedComp ? (
                      <HStack gap="xs" align="center">
                        <Badge size="sm" onClick={() => handleRemoveFromSlot(slot.id)}>
                          {placedComp.iconUrl ? (
                            <img src={placedComp.iconUrl} alt="" className="w-4 h-4 object-contain inline-block mr-1" />
                          ) : placedComp.iconEmoji ? (
                            <>{placedComp.iconEmoji}{' '}</>
                          ) : null}{placedComp.label}
                        </Badge>
                        {result && (
                          <Icon icon={result.correct ? CheckCircle : XCircle} size="sm" className={result.correct ? 'text-success' : 'text-error'} />
                        )}
                      </HStack>
                    ) : (
                      <Typography variant="caption" className="text-muted-foreground">
                        {t('builder.empty')}
                      </Typography>
                    )}
                  </HStack>
                );
              })}
            </VStack>
          </VStack>
        </Card>

        {/* Result */}
        {submitted && (
          <Card className="p-4">
            <VStack gap="sm" align="center">
              <Icon icon={allCorrect ? CheckCircle : XCircle} size="lg" className={allCorrect ? 'text-success' : 'text-error'} />
              <Typography variant="body" weight="bold">
                {allCorrect
                  ? (resolved.successMessage ?? t('builder.success'))
                  : (resolved.failMessage ?? t('builder.incorrect'))}
              </Typography>
            </VStack>
          </Card>
        )}

        {showHint && resolved.hint && (
          <Card className="p-4 border-l-4 border-l-warning">
            <Typography variant="body">{resolved.hint}</Typography>
          </Card>
        )}

        <HStack gap="sm" justify="center">
          {!submitted ? (
            <Button variant="primary" onClick={handleSubmit} disabled={!allPlaced}>
              <Icon icon={Wrench} size="sm" />
              {t('builder.build')}
            </Button>
          ) : !allCorrect ? (
            <Button variant="primary" onClick={handleReset}>
              {t('builder.tryAgain')}
            </Button>
          ) : null}
          <Button variant="secondary" onClick={handleFullReset}>
            <Icon icon={RotateCcw} size="sm" />
            {t('builder.reset')}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

BuilderBoard.displayName = 'BuilderBoard';
