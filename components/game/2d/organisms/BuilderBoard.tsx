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

 

import React, { useState } from 'react';
import type { AssetUrl, EventEmit, EntityRow } from '@almadar/core';
import { Box, VStack, HStack, Card, Button, Typography, Badge, Icon } from '../../../core/atoms/index';
import { useEventBus } from '../../../../hooks/useEventBus';
import { useTranslate } from '../../../../hooks/useTranslate';
import type { DisplayStateProps } from '../../../core/organisms/types';
import { boardEntity, str, num, rows } from '../../shared/boardEntity';
import { CheckCircle, XCircle, RotateCcw, Wrench } from 'lucide-react';

/** A draggable build component (UI value DTO read off the entity). */
export interface BuilderComponent {
  id: string;
  label: string;
  description?: string;
  iconEmoji?: string;
  /** Image URL icon (takes precedence over iconEmoji) */
  iconUrl?: AssetUrl;
  category?: string;
}

/** A blueprint slot accepting a component (UI value DTO read off the entity).
 *  Mirrors the state machine's `BuilderBoardSlotsItem`: the required component
 *  and the currently placed component both live on the entity. */
export interface BuilderSlot {
  id: string;
  label?: string;
  description?: string;
  requiredComponentId: string;
  placedComponentId?: string;
}

export interface BuilderBoardProps extends DisplayStateProps {
  /** Puzzle board-state entity (single row or array). The board reads
   *  `components` / `slots` arrays plus `attempts` / `result` off the row —
   *  the state machine is the single source of truth for placements. */
  entity?: EntityRow | readonly EntityRow[];
  completeEvent?: EventEmit<{ success: boolean; attempts: number }>;
  /** Emits UI:{placeEvent} with { slotId, componentId } on component placement. */
  placeEvent?: EventEmit<{ slotId: string; componentId: string }>;
  /** Emits UI:{checkEvent} with {} when the player checks the build. */
  checkEvent?: EventEmit<Record<string, never>>;
  /** Emits UI:{playAgainEvent} with {} on play again / reset. */
  playAgainEvent?: EventEmit<Record<string, never>>;
}

export function BuilderBoard({
  entity,
  completeEvent = 'PUZZLE_COMPLETE',
  placeEvent,
  checkEvent,
  playAgainEvent,
  className,
}: BuilderBoardProps): React.JSX.Element | null {
  const { emit } = useEventBus();
  const { t } = useTranslate();
  const resolved = boardEntity(entity);

  const [headerError, setHeaderError] = useState(false);
  // UI-only: which available component is currently picked up for placement.
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const components: readonly BuilderComponent[] = rows(resolved?.components).map((r) => ({
    id: str(r.id),
    label: str(r.label),
    description: str(r.description) || undefined,
    iconEmoji: str(r.iconEmoji) || undefined,
    iconUrl: str(r.iconUrl) || undefined,
    category: str(r.category) || undefined,
  }));
  const slots: readonly BuilderSlot[] = rows(resolved?.slots).map((r) => ({
    id: str(r.id),
    label: str(r.label) || undefined,
    description: str(r.description) || undefined,
    requiredComponentId: str(r.requiredComponentId),
    placedComponentId: str(r.placedComponentId) || undefined,
  }));

  // ── Board state read off the entity (machine-owned source of truth) ──────
  const placements: Record<string, string> = {};
  for (const slot of slots) {
    if (slot.placedComponentId) placements[slot.id] = slot.placedComponentId;
  }
  const attempts = num(resolved?.attempts);
  const result = str(resolved?.result) || 'none';
  const submitted = result === 'win';

  const usedComponentIds = new Set(Object.values(placements));
  const availableComponents = components.filter((c) => !usedComponentIds.has(c.id));
  const allPlaced = slots.length > 0 && slots.every((s) => Boolean(placements[s.id]));

  const results = submitted
    ? slots.map((slot) => ({
      slot,
      placed: placements[slot.id],
      correct: placements[slot.id] === slot.requiredComponentId,
    }))
    : [];

  const showHint = attempts >= 2 && Boolean(str(resolved?.hint));

  const handlePlaceComponent = (slotId: string) => {
    if (submitted || !selectedComponent) return;
    if (placeEvent) emit(`UI:${placeEvent}`, { slotId, componentId: selectedComponent });
    setSelectedComponent(null);
  };

  const handleRemoveFromSlot = (slotId: string) => {
    if (submitted) return;
    // Clearing a slot is a placement of the empty component on the machine.
    if (placeEvent) emit(`UI:${placeEvent}`, { slotId, componentId: '' });
  };

  const handleSubmit = () => {
    if (checkEvent) emit(`UI:${checkEvent}`, {});
    // Forward the legacy completion signal when this check solves the build.
    const solved = slots.length > 0 && slots.every((s) => placements[s.id] === s.requiredComponentId);
    if (solved && completeEvent) {
      emit(`UI:${completeEvent}`, { success: true, attempts: attempts + 1 });
    }
  };

  const handlePlayAgain = () => {
    setSelectedComponent(null);
    if (playAgainEvent) emit(`UI:${playAgainEvent}`, {});
  };

  const getComponentById = (id: string) => components.find((c) => c.id === id);

  if (!resolved) return null;

  const theme = (resolved.theme ?? undefined) as { background?: string; accentColor?: string } | undefined;
  const themeBackground = theme?.background;
  const headerImage = str(resolved.headerImage);
  const hint = str(resolved.hint);

  return (
    <Box
      className={className}
      style={{
        backgroundImage: themeBackground ? `url(${themeBackground})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <VStack gap="lg" className="p-4">
        {/* Header image */}
        {headerImage && !headerError ? (
          <Box className="w-full h-32 overflow-hidden rounded-container">
            <img src={headerImage} alt="" onError={() => setHeaderError(true)} className="w-full h-full object-cover" />
          </Box>
        ) : headerImage && headerError ? (
          <Box className="w-full h-32 rounded-container bg-gradient-to-br from-muted to-accent opacity-60" />
        ) : null}

        <Card className="p-4">
          <VStack gap="sm">
            <Typography variant="h4" weight="bold">{str(resolved.title)}</Typography>
            <Typography variant="body">{str(resolved.description)}</Typography>
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

        {/* Result — the machine only reaches `complete` (result === 'win'). */}
        {submitted && (
          <Card className="p-4">
            <VStack gap="sm" align="center">
              <Icon icon={CheckCircle} size="lg" className="text-success" />
              <Typography variant="body" weight="bold">
                {str(resolved.successMessage) || t('builder.success')}
              </Typography>
            </VStack>
          </Card>
        )}

        {showHint && hint && (
          <Card className="p-4 border-l-4 border-l-warning">
            <Typography variant="body">{hint}</Typography>
          </Card>
        )}

        <HStack gap="sm" justify="center">
          {!submitted && (
            <Button variant="primary" onClick={handleSubmit} disabled={!allPlaced}>
              <Icon icon={Wrench} size="sm" />
              {t('builder.build')}
            </Button>
          )}
          <Button variant="secondary" onClick={handlePlayAgain}>
            <Icon icon={RotateCcw} size="sm" />
            {t('builder.reset')}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

BuilderBoard.displayName = 'BuilderBoard';
