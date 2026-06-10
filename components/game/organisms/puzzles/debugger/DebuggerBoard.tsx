/**
 * DebuggerBoard
 *
 * Error-finding game board. The player reviews a code/system
 * listing and identifies lines or elements that contain bugs.
 *
 * Good for: programming, logic, troubleshooting stories.
 *
 * Events emitted via completeEvent (default UI:PUZZLE_COMPLETE).
 */

 

import React, { useState, useCallback } from 'react';
import type { EventEmit, EntityRow } from '@almadar/core';
import { Box, VStack, HStack, Card, Button, Typography, Badge, Icon } from '../../../../core/atoms';
import { useEventBus } from '../../../../../hooks/useEventBus';
import { useTranslate } from '../../../../../hooks/useTranslate';
import type { EntityDisplayProps } from '../../../../core/organisms/types';
import { CheckCircle, XCircle, RotateCcw, Bug, Send } from 'lucide-react';

export interface DebuggerLine {
  id: string;
  content: string;
  isBug: boolean;
  explanation?: string;
}

export interface DebuggerPuzzleEntity {
  id: string;
  title: string;
  description: string;
  language?: string;
  lines: DebuggerLine[];
  /** How many bugs the player should find */
  bugCount: number;
  successMessage?: string;
  failMessage?: string;
  hint?: string;
  /** Header image URL displayed above the title */
  headerImage?: string;
  /** Visual theme overrides */
  theme?: { background?: string; accentColor?: string };
}

export interface DebuggerBoardProps extends Omit<EntityDisplayProps, 'entity'> {
  // The compiler binds the generic `EntityRow`, so the inlet accepts it (and
  // arrays) as union members; the component narrows to its curated
  // `DebuggerPuzzleEntity` read-shape below (a valid union-narrow) and renders
  // nothing until a puzzle entity is present.
  entity?: DebuggerPuzzleEntity | EntityRow | readonly (DebuggerPuzzleEntity | EntityRow)[];
  completeEvent?: EventEmit<{ success: boolean; attempts: number }>;
}

export function DebuggerBoard({
  entity,
  completeEvent = 'PUZZLE_COMPLETE',
  className,
}: DebuggerBoardProps): React.JSX.Element | null {
  const { emit } = useEventBus();
  const { t } = useTranslate();
  const resolved = (Array.isArray(entity) ? entity[0] : entity) as DebuggerPuzzleEntity | undefined;

  const [flaggedLines, setFlaggedLines] = useState<Set<string>>(new Set());
  const [headerError, setHeaderError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const toggleLine = (lineId: string) => {
    if (submitted) return;
    setFlaggedLines((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) {
        next.delete(lineId);
      } else {
        next.add(lineId);
      }
      return next;
    });
  };

  const lines = resolved?.lines ?? [];
  const bugLines = lines.filter((l) => l.isBug);
  const correctFlags = lines.filter((l) => l.isBug && flaggedLines.has(l.id));
  const falseFlags = lines.filter((l) => !l.isBug && flaggedLines.has(l.id));
  const allCorrect = submitted && correctFlags.length === bugLines.length && falseFlags.length === 0;

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    setAttempts((a) => a + 1);
    const correct = correctFlags.length === bugLines.length && falseFlags.length === 0;
    if (correct) {
      emit(`UI:${completeEvent}`, { success: true, attempts: attempts + 1 });
    }
  }, [correctFlags.length, bugLines.length, falseFlags.length, attempts, completeEvent, emit]);

  const handleReset = () => {
    setSubmitted(false);
    if (attempts >= 2 && resolved?.hint) {
      setShowHint(true);
    }
  };

  const handleFullReset = () => {
    setFlaggedLines(new Set());
    setSubmitted(false);
    setAttempts(0);
    setShowHint(false);
  };

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
            <HStack gap="xs" align="center">
              <Icon icon={Bug} size="sm" />
              <Typography variant="h4" weight="bold">{resolved.title}</Typography>
            </HStack>
            <Typography variant="body">{resolved.description}</Typography>
            <Typography variant="caption" className="text-muted-foreground">
              {t('debugger.findBugs', { count: String(resolved.bugCount) })}
            </Typography>
          </VStack>
        </Card>

        {/* Code listing */}
        <Card className="p-0 overflow-hidden">
          <VStack gap="none">
            {lines.map((line, i) => {
              const isFlagged = flaggedLines.has(line.id);
              let lineStyle = '';
              if (submitted) {
                if (line.isBug && isFlagged) lineStyle = 'bg-success/10';
                else if (line.isBug && !isFlagged) lineStyle = 'bg-warning/10';
                else if (!line.isBug && isFlagged) lineStyle = 'bg-error/10';
              } else if (isFlagged) {
                lineStyle = 'bg-error/10';
              }

              return (
                <HStack
                  key={line.id}
                  gap="none"
                  align="stretch"
                  className={`border-b border-border cursor-pointer hover:bg-muted ${lineStyle}`}
                  onClick={() => toggleLine(line.id)}
                >
                  <Box className="w-10 flex-shrink-0 flex items-center justify-center border-r border-border text-muted-foreground">
                    <Typography variant="caption">{i + 1}</Typography>
                  </Box>
                  <Box className="flex-1 px-3 py-1.5 font-mono text-sm whitespace-pre">
                    <Typography variant="body" className="font-mono text-sm">{line.content}</Typography>
                  </Box>
                  <Box className="w-8 flex-shrink-0 flex items-center justify-center">
                    {isFlagged && <Icon icon={Bug} size="xs" className="text-error" />}
                    {submitted && line.isBug && !isFlagged && <Icon icon={Bug} size="xs" className="text-warning" />}
                  </Box>
                </HStack>
              );
            })}
          </VStack>
        </Card>

        {/* Explanations after submit */}
        {submitted && (
          <Card className="p-4">
            <VStack gap="sm">
              <Typography variant="body" weight="bold">
                {allCorrect
                  ? (resolved.successMessage ?? t('debugger.allFound'))
                  : `${correctFlags.length}/${bugLines.length} ${t('debugger.bugsFound')}`}
              </Typography>
              {bugLines.map((line) => (
                <HStack key={line.id} gap="xs" align="start">
                  <Icon
                    icon={flaggedLines.has(line.id) ? CheckCircle : XCircle}
                    size="xs"
                    className={flaggedLines.has(line.id) ? 'text-success mt-0.5' : 'text-warning mt-0.5'}
                  />
                  <VStack gap="none">
                    <Typography variant="caption" weight="bold" className="font-mono">{line.content.trim()}</Typography>
                    {line.explanation && (
                      <Typography variant="caption" className="text-muted-foreground">{line.explanation}</Typography>
                    )}
                  </VStack>
                </HStack>
              ))}
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
            <Button variant="primary" onClick={handleSubmit} disabled={flaggedLines.size === 0}>
              <Icon icon={Send} size="sm" />
              {t('debugger.submit')}
            </Button>
          ) : !allCorrect ? (
            <Button variant="primary" onClick={handleReset}>
              {t('debugger.tryAgain')}
            </Button>
          ) : null}
          <Button variant="secondary" onClick={handleFullReset}>
            <Icon icon={RotateCcw} size="sm" />
            {t('debugger.reset')}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

DebuggerBoard.displayName = 'DebuggerBoard';
