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
import type { DisplayStateProps } from '../../../../core/organisms/types';
import { boardEntity, str, num } from '../../boardEntity';
import { CheckCircle, XCircle, RotateCcw, Bug, Send } from 'lucide-react';

/** A reviewable code line (UI value DTO read off the entity). */
export interface DebuggerLine {
  id: string;
  content: string;
  isBug: boolean;
  isFlagged?: boolean;
  explanation?: string;
}

export interface DebuggerBoardProps extends DisplayStateProps {
  /** Puzzle board-state entity (single row or array). The board reads
   *  `lines` array (each with `isFlagged`), `result`, `attempts`, plus
   *  title/description/bugCount/hint off the row. */
  entity?: EntityRow | readonly EntityRow[];
  completeEvent?: EventEmit<{ success: boolean; attempts: number }>;
  /** Emits UI:{toggleFlagEvent} with { lineId } when a line's bug-flag is toggled. */
  toggleFlagEvent?: EventEmit<{ lineId: string }>;
  /** Emits UI:{checkEvent} with {} when the player checks/submits. */
  checkEvent?: EventEmit<Record<string, never>>;
  /** Emits UI:{playAgainEvent} with {} on play again / reset. */
  playAgainEvent?: EventEmit<Record<string, never>>;
}

export function DebuggerBoard({
  entity,
  completeEvent = 'PUZZLE_COMPLETE',
  toggleFlagEvent,
  checkEvent,
  playAgainEvent,
  className,
}: DebuggerBoardProps): React.JSX.Element | null {
  const { emit } = useEventBus();
  const { t } = useTranslate();
  const resolved = boardEntity(entity);

  const [headerError, setHeaderError] = useState(false);

  const lines = (Array.isArray(resolved?.lines) ? resolved.lines : []) as unknown as DebuggerLine[];
  // Model sets result to "win" on correct check; "none" otherwise (never null after INIT)
  const result = str(resolved?.result) || 'none';
  const attempts = num(resolved?.attempts);
  const submitted = result === 'win';
  const showHint = !submitted && attempts >= 2 && Boolean(str(resolved?.hint));

  const bugLines = lines.filter((l) => l.isBug);
  const flaggedLines = lines.filter((l) => l.isFlagged);
  const correctFlags = lines.filter((l) => l.isBug && l.isFlagged);
  const falseFlags = lines.filter((l) => !l.isBug && l.isFlagged);
  const allCorrect = submitted;

  const toggleLine = (lineId: string) => {
    if (submitted) return;
    if (toggleFlagEvent) emit(`UI:${toggleFlagEvent}`, { lineId });
  };

  const handleSubmit = useCallback(() => {
    if (checkEvent) emit(`UI:${checkEvent}`, {});
    // Legacy completeEvent for when the model confirms a win
    const correct = correctFlags.length === bugLines.length && falseFlags.length === 0;
    if (correct) emit(`UI:${completeEvent}`, { success: true, attempts: attempts + 1 });
  }, [checkEvent, correctFlags.length, bugLines.length, falseFlags.length, attempts, completeEvent, emit]);

  const handleReset = () => {
    if (playAgainEvent) emit(`UI:${playAgainEvent}`, {});
  };

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
            <HStack gap="xs" align="center">
              <Icon icon={Bug} size="sm" />
              <Typography variant="h4" weight="bold">{str(resolved.title)}</Typography>
            </HStack>
            <Typography variant="body">{str(resolved.description)}</Typography>
            <Typography variant="caption" className="text-muted-foreground">
              {t('debugger.findBugs', { count: String(lines.filter(l => l.isBug).length) })}
            </Typography>
          </VStack>
        </Card>

        {/* Code listing */}
        <Card className="p-0 overflow-hidden">
          <VStack gap="none">
            {lines.map((line, i) => {
              const isFlagged = !!line.isFlagged;
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
                  ? (str(resolved.successMessage) || t('debugger.allFound'))
                  : `${correctFlags.length}/${bugLines.length} ${t('debugger.bugsFound')}`}
              </Typography>
              {bugLines.map((line) => (
                <HStack key={line.id} gap="xs" align="start">
                  <Icon
                    icon={line.isFlagged ? CheckCircle : XCircle}
                    size="xs"
                    className={line.isFlagged ? 'text-success mt-0.5' : 'text-warning mt-0.5'}
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

        {showHint && hint && (
          <Card className="p-4 border-l-4 border-l-warning">
            <Typography variant="body">{hint}</Typography>
          </Card>
        )}

        <HStack gap="sm" justify="center">
          {!submitted && (
            <Button variant="primary" onClick={handleSubmit} disabled={flaggedLines.length === 0}>
              <Icon icon={Send} size="sm" />
              {t('debugger.submit')}
            </Button>
          )}
          <Button variant="secondary" onClick={handleReset}>
            <Icon icon={RotateCcw} size="sm" />
            {t('debugger.reset')}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

DebuggerBoard.displayName = 'DebuggerBoard';
