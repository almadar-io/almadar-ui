
/**
 * SimulatorBoard
 *
 * Parameter-slider game board. The player adjusts two parameters (A and B)
 * and observes the machine-derived output. Correct parameter values must
 * bring the output within tolerance of the target to win.
 *
 * Good for: physics, economics, system design stories.
 *
 * Controlled-only: params, output, attempts, and result are owned by the
 * gameplay machine and read off the bound entity. Slider/check/play-again
 * interactions are emitted as events; the machine recomputes and re-renders.
 */

import React, { useState } from 'react';
import type { EventEmit, EntityRow, FieldValue } from '@almadar/core';
import { Box, VStack, HStack, Card, Button, Typography, Badge, Icon } from '../../../core/atoms/index';
import { useEventBus } from '../../../../hooks/useEventBus';
import { useTranslate } from '../../../../hooks/useTranslate';
import type { DisplayStateProps } from '../../../core/organisms/types';
import { boardEntity, str, num, vec2 } from '../../shared/boardEntity';
import { Play, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

/** A tunable simulation parameter slider descriptor (UI value DTO read off the entity). */
export interface SimulatorParameter {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  correct: number;
  tolerance: number;
}

/** Read a parameters array from an entity field and narrow to SimulatorParameter[]. */
function readSimulatorParameters(v: FieldValue | undefined): SimulatorParameter[] {
  if (!Array.isArray(v)) return [];
  const result: SimulatorParameter[] = [];
  for (const item of v) {
    if (typeof item === 'object' && item !== null && !Array.isArray(item) && !(item instanceof Date)) {
      const param = item as { id?: FieldValue; label?: FieldValue; unit?: FieldValue; min?: FieldValue; max?: FieldValue; step?: FieldValue; initial?: FieldValue; correct?: FieldValue; tolerance?: FieldValue };
      if ('id' in item && 'label' in item && 'unit' in item && 'min' in item && 'max' in item && 'step' in item) {
        result.push({
          id: str(param.id),
          label: str(param.label),
          unit: str(param.unit),
          min: num(param.min),
          max: num(param.max),
          step: num(param.step),
          initial: num(param.initial),
          correct: num(param.correct),
          tolerance: num(param.tolerance),
        });
      }
    }
  }
  return result;
}

export interface SimulatorBoardProps extends DisplayStateProps {
  /** Puzzle board-state entity (single row or array). The board reads the
   *  `parameters` slider descriptors plus the machine-owned `paramA`/`paramB`/
   *  `output`/`target`/`tolerance`/`attempts`/`result` fields off the row. */
  entity?: EntityRow | readonly EntityRow[];
  completeEvent?: EventEmit<{ success: boolean; attempts: number }>;
  /** Emits UI:{setAEvent} with { value } when parameter A's slider changes. */
  setAEvent?: EventEmit<{ value: number }>;
  /** Emits UI:{setBEvent} with { value } when parameter B's slider changes. */
  setBEvent?: EventEmit<{ value: number }>;
  /** Emits UI:{checkEvent} with {} on simulate / check. */
  checkEvent?: EventEmit<Record<string, never>>;
  /** Emits UI:{playAgainEvent} with {} on reset / play again. */
  playAgainEvent?: EventEmit<Record<string, never>>;
}

export function SimulatorBoard({
  entity,
  completeEvent = 'PUZZLE_COMPLETE',
  setAEvent,
  setBEvent,
  checkEvent,
  playAgainEvent,
  className,
}: SimulatorBoardProps): React.JSX.Element | null {
  const { emit } = useEventBus();
  const { t } = useTranslate();
  const resolved = boardEntity(entity);

  const parameters = readSimulatorParameters(resolved?.parameters);
  const [headerError, setHeaderError] = useState(false);

  if (!resolved) return null;

  // ── Machine-owned state (read off the entity, never recomputed locally) ──
  const paramA = num(resolved.paramA);
  const paramB = num(resolved.paramB);
  const output = num(resolved.output);
  const targetValue = num(resolved.target);
  const targetTolerance = num(resolved.tolerance);
  const attempts = num(resolved.attempts);
  const result = str(resolved.result);
  const isWin = result === 'win';
  const isComplete = result !== 'none' && result !== '';

  // Map the first two slider descriptors to parameter A and B respectively.
  const paramAValue = parameters[0];
  const paramBValue = parameters[1];
  const sliderValues = [paramA, paramB];
  const sliderEvents = [setAEvent, setBEvent];

  const handleParameterChange = (index: number, value: number) => {
    if (isComplete) return;
    const ev = sliderEvents[index];
    if (ev) emit(`UI:${ev}`, { value });
  };

  const handleCheck = () => {
    if (checkEvent) emit(`UI:${checkEvent}`, {});
  };

  const handlePlayAgain = () => {
    if (playAgainEvent) emit(`UI:${playAgainEvent}`, {});
  };

  // Read theme object from entity (it's a FieldValue, which can be an object).
  const themeBackground = (() => {
    const t = resolved.theme;
    if (typeof t === 'object' && t !== null && !Array.isArray(t) && !(t instanceof Date)) {
      const bg = (t as { background?: FieldValue; accentColor?: FieldValue }).background;
      return str(bg);
    }
    return '';
  })();
  const headerImage = str(resolved.headerImage);
  const hint = str(resolved.hint);
  const showHint = isComplete && !isWin && attempts >= 2 && Boolean(hint);
  const outputLabel = str(resolved.outputLabel);
  const outputUnit = str(resolved.outputUnit);

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

        {/* Parameter sliders (A and B) */}
        <Card className="p-4">
          <VStack gap="md">
            <Typography variant="small" weight="bold" className="uppercase tracking-wider text-muted-foreground">
              {t('simulator.parameters')}
            </Typography>
            {[paramAValue, paramBValue].map((param, index) =>
              param ? (
                <VStack key={param.id ?? index} gap="xs">
                  <HStack justify="between" align="center">
                    <Typography variant="body" weight="medium">{param.label}</Typography>
                    <Badge size="sm">{sliderValues[index]} {param.unit}</Badge>
                  </HStack>
                  <input
                    type="range"
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    value={sliderValues[index]}
                    onChange={(e) => handleParameterChange(index, Number(e.target.value))}
                    disabled={isComplete}
                    className="w-full accent-foreground"
                  />
                  <HStack justify="between">
                    <Typography variant="caption" className="text-muted-foreground">{param.min} {param.unit}</Typography>
                    <Typography variant="caption" className="text-muted-foreground">{param.max} {param.unit}</Typography>
                  </HStack>
                </VStack>
              ) : null,
            )}
          </VStack>
        </Card>

        {/* Output display */}
        <Card className="p-4">
          <VStack gap="sm" align="center">
            <Typography variant="small" weight="bold" className="uppercase tracking-wider text-muted-foreground">
              {outputLabel}
            </Typography>
            <Typography variant="h3" weight="bold">
              {output.toFixed(2)} {outputUnit}
            </Typography>
            {isComplete && (
              <HStack gap="xs" align="center">
                <Icon icon={isWin ? CheckCircle : XCircle} size="sm" className={isWin ? 'text-success' : 'text-error'} />
                <Typography variant="body" className={isWin ? 'text-success' : 'text-error'}>
                  {isWin
                    ? (str(resolved.successMessage) || t('simulator.correct'))
                    : (str(resolved.failMessage) || t('simulator.incorrect'))}
                </Typography>
              </HStack>
            )}
            <Typography variant="caption" className="text-muted-foreground">
              {t('simulator.target')}: {targetValue} {outputUnit} (±{targetTolerance})
            </Typography>
          </VStack>
        </Card>

        {/* Hint */}
        {showHint && hint && (
          <Card className="p-4 border-l-4 border-l-warning">
            <Typography variant="body">{hint}</Typography>
          </Card>
        )}

        {/* Actions */}
        <HStack gap="sm" justify="center">
          {!isComplete ? (
            <Button variant="primary" onClick={handleCheck}>
              <Icon icon={Play} size="sm" />
              {t('simulator.simulate')}
            </Button>
          ) : null}
          <Button variant="secondary" onClick={handlePlayAgain}>
            <Icon icon={RotateCcw} size="sm" />
            {t('simulator.reset')}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

SimulatorBoard.displayName = 'SimulatorBoard';
