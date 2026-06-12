 
/**
 * SimulatorBoard
 *
 * Parameter-slider game board. The player adjusts parameters
 * and observes real-time output. Correct parameter values
 * must bring the output within a target range to win.
 *
 * Good for: physics, economics, system design stories.
 *
 * Events emitted via completeEvent (default UI:PUZZLE_COMPLETE).
 */

import React, { useState, useCallback, useMemo } from 'react';
import type { EventEmit, EntityRow } from '@almadar/core';
import { Box, VStack, HStack, Card, Button, Typography, Badge, Icon } from '../../../../core/atoms';
import { useEventBus } from '../../../../../hooks/useEventBus';
import { useTranslate } from '../../../../../hooks/useTranslate';
import type { DisplayStateProps } from '../../../../core/organisms/types';
import { boardEntity, str, num } from '../../boardEntity';
import { Play, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

/** A tunable simulation parameter (UI value DTO read off the entity). */
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

export interface SimulatorBoardProps extends DisplayStateProps {
  /** Puzzle board-state entity (single row or array). The board reads the
   *  `parameters` array plus title/description/target/hint off the row. */
  entity?: EntityRow | readonly EntityRow[];
  completeEvent?: EventEmit<{ success: boolean; attempts: number }>;
}

export function SimulatorBoard({
  entity,
  completeEvent = 'PUZZLE_COMPLETE',
  className,
}: SimulatorBoardProps): React.JSX.Element | null {
  const { emit } = useEventBus();
  const { t } = useTranslate();
  const resolved = boardEntity(entity);

  const parameters = (Array.isArray(resolved?.parameters) ? resolved.parameters : []) as unknown as SimulatorParameter[];
  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const p of parameters) {
      init[p.id] = p.initial;
    }
    return init;
  });
  const [headerError, setHeaderError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const computeOutput = useCallback((params: Record<string, number>): number => {
    try {
      const fn = new Function('params', `return (${str(resolved?.computeExpression)})`);
      return fn(params) as number;
    } catch {
      return 0;
    }
  }, [resolved?.computeExpression]);

  const output = useMemo(() => computeOutput(values) ?? 0, [computeOutput, values]);
  const targetValue = num(resolved?.targetValue);
  const targetTolerance = num(resolved?.targetTolerance);
  const isCorrect = Math.abs(output - targetValue) <= targetTolerance;

  const handleParameterChange = (id: string, value: number) => {
    if (submitted) return;
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setAttempts((a) => a + 1);
    if (isCorrect) {
      emit(`UI:${completeEvent}`, { success: true, attempts: attempts + 1 });
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    if (attempts >= 2 && str(resolved?.hint)) {
      setShowHint(true);
    }
  };

  const handleFullReset = () => {
    const init: Record<string, number> = {};
    for (const p of parameters) {
      init[p.id] = p.initial;
    }
    setValues(init);
    setSubmitted(false);
    setAttempts(0);
    setShowHint(false);
  };

  if (!resolved) return null;

  const theme = (resolved.theme ?? undefined) as { background?: string; accentColor?: string } | undefined;
  const themeBackground = theme?.background;
  const headerImage = str(resolved.headerImage);
  const hint = str(resolved.hint);
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

        {/* Parameter sliders */}
        <Card className="p-4">
          <VStack gap="md">
            <Typography variant="small" weight="bold" className="uppercase tracking-wider text-muted-foreground">
              {t('simulator.parameters')}
            </Typography>
            {parameters.map((param) => (
              <VStack key={param.id} gap="xs">
                <HStack justify="between" align="center">
                  <Typography variant="body" weight="medium">{param.label}</Typography>
                  <Badge size="sm">{values[param.id]} {param.unit}</Badge>
                </HStack>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={values[param.id]}
                  onChange={(e) => handleParameterChange(param.id, Number(e.target.value))}
                  disabled={submitted}
                  className="w-full accent-foreground"
                />
                <HStack justify="between">
                  <Typography variant="caption" className="text-muted-foreground">{param.min} {param.unit}</Typography>
                  <Typography variant="caption" className="text-muted-foreground">{param.max} {param.unit}</Typography>
                </HStack>
              </VStack>
            ))}
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
            {submitted && (
              <HStack gap="xs" align="center">
                <Icon icon={isCorrect ? CheckCircle : XCircle} size="sm" className={isCorrect ? 'text-success' : 'text-error'} />
                <Typography variant="body" className={isCorrect ? 'text-success' : 'text-error'}>
                  {isCorrect
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
          {!submitted ? (
            <Button variant="primary" onClick={handleSubmit}>
              <Icon icon={Play} size="sm" />
              {t('simulator.simulate')}
            </Button>
          ) : !isCorrect ? (
            <Button variant="primary" onClick={handleReset}>
              {t('simulator.tryAgain')}
            </Button>
          ) : null}
          <Button variant="secondary" onClick={handleFullReset}>
            <Icon icon={RotateCcw} size="sm" />
            {t('simulator.reset')}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

SimulatorBoard.displayName = 'SimulatorBoard';
