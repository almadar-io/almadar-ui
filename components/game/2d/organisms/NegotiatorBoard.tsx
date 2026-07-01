// ⛔ SLATED-FOR-DELETION-67 — orphaned by the .lolo board decomposition. Delete after runtime-verify confirms the ui-*-board.lolo compositions render. See docs/Almadar_Std_Game_Board_Deletion_Manifest.md
 
/**
 * NegotiatorBoard
 *
 * Turn-based decision matrix game. The player makes choices
 * over multiple rounds against an AI opponent. Each round
 * both sides pick an action, and payoffs are determined by
 * the combination.
 *
 * Good for: ethics, business, game theory, economics stories.
 *
 * Events emitted via completeEvent (default UI:PUZZLE_COMPLETE).
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { EventEmit, EntityRow, FieldValue, Asset } from '@almadar/core';
import { Box, VStack, HStack, Card, Button, Typography, Badge } from '../../../core/atoms/index';
import { useEventBus } from '../../../../hooks/useEventBus';
import { useTranslate } from '../../../../hooks/useTranslate';
import type { DisplayStateProps } from '../../../core/organisms/types';
import { boardEntity, str, num } from '../../shared/boardEntity';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { GameIcon } from '../atoms/GameIcon';

/** A selectable round action (UI value DTO read off the entity). */
export interface NegotiatorAction {
  id: string;
  label: string;
  description?: string;
}

/** A payoff-matrix cell (UI value DTO read off the entity). */
export interface PayoffEntry {
  playerAction: string;
  opponentAction: string;
  playerPayoff: number;
  opponentPayoff: number;
}

export interface NegotiatorBoardProps extends DisplayStateProps {
  /** Puzzle board-state entity (single row or array). The board reads
   *  `score` / `round` / `result` / `targetScore` / `maxRounds` plus the
   *  `actions` / `payoffMatrix` arrays and title/description/hint off the row.
   *  Score accumulation + win/lose are owned by the gameplay machine. */
  entity?: EntityRow | readonly EntityRow[];
  completeEvent?: EventEmit<{ success: boolean; score: number }>;
  /** Emits UI:{playRoundEvent} with the picked action + the UI-resolved payoff. */
  playRoundEvent?: EventEmit<{ playerAction: string; payoff: number }>;
  /** Emits UI:{finishEvent} with {} when all rounds are spent. */
  finishEvent?: EventEmit<Record<string, never>>;
  /** Emits UI:{playAgainEvent} with {} on play again / reset. */
  playAgainEvent?: EventEmit<Record<string, never>>;
  /** Optional per-semantic-key asset overrides for icons (correct/arrow). */
  assetManifest?: { ui?: Record<string, Asset> };
}

interface RoundResult {
  round: number;
  playerAction: string;
  opponentAction: string;
  playerPayoff: number;
  opponentPayoff: number;
}

export function NegotiatorBoard({
  entity,
  completeEvent = 'PUZZLE_COMPLETE',
  playRoundEvent,
  finishEvent,
  playAgainEvent,
  assetManifest,
  className,
}: NegotiatorBoardProps): React.JSX.Element | null {
  const ui = assetManifest?.ui;
  const { emit } = useEventBus();
  const { t } = useTranslate();
  const resolved = boardEntity(entity);

  // Per-round history for the display list only — the machine owns score/round/result.
  const [history, setHistory] = useState<RoundResult[]>([]);
  const [headerError, setHeaderError] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // ── Machine-owned state (read from the bound entity) ──
  const totalRounds = num(resolved?.maxRounds);
  const targetScore = num(resolved?.targetScore);
  const currentRound = num(resolved?.round);
  const result = str(resolved?.result) || 'none';
  const playerTotal = num(resolved?.score);
  const isComplete = result !== 'none' || (totalRounds > 0 && currentRound >= totalRounds);
  const won = result === 'win';
  const lastPlayerAction = str(resolved?.lastPlayerAction);
  const lastOpponentAction = str(resolved?.lastOpponentAction);
  const lastPayoff = num(resolved?.lastPayoff);

  const actions: NegotiatorAction[] = Array.isArray(resolved?.actions)
    ? (resolved.actions as FieldValue[]).flatMap((item) => {
        if (item !== null && typeof item === 'object' && !Array.isArray(item) && !(item instanceof Date) && typeof item.id === 'string' && typeof item.label === 'string')
          return [{ id: item.id, label: item.label, description: typeof item.description === 'string' ? item.description : undefined }];
        return [];
      })
    : [];
  const payoffMatrix: PayoffEntry[] = Array.isArray(resolved?.payoffMatrix)
    ? (resolved.payoffMatrix as FieldValue[]).flatMap((item) => {
        if (item !== null && typeof item === 'object' && !Array.isArray(item) && !(item instanceof Date) && typeof item.playerAction === 'string' && typeof item.opponentAction === 'string')
          return [{ playerAction: item.playerAction, opponentAction: item.opponentAction, playerPayoff: typeof item.playerPayoff === 'number' ? item.playerPayoff : 0, opponentPayoff: typeof item.opponentPayoff === 'number' ? item.opponentPayoff : 0 }];
        return [];
      })
    : [];

  // Append a display-history entry each time the model advances a round.
  // The model is the single source for opponent action + payoff; we read them back.
  const prevRoundRef = useRef(currentRound);
  useEffect(() => {
    if (currentRound > prevRoundRef.current && lastPlayerAction) {
      const opponentPayoffEntry = payoffMatrix.find(
        (p) => p.playerAction === lastPlayerAction && p.opponentAction === lastOpponentAction,
      );
      setHistory(prev => [
        ...prev,
        {
          round: currentRound,
          playerAction: lastPlayerAction,
          opponentAction: lastOpponentAction,
          playerPayoff: lastPayoff,
          opponentPayoff: opponentPayoffEntry?.opponentPayoff ?? 0,
        },
      ]);
    }
    prevRoundRef.current = currentRound;
  }, [currentRound, lastPlayerAction, lastOpponentAction, lastPayoff, payoffMatrix]);

  const opponentTotal = useMemo(() => history.reduce((s, r) => s + r.opponentPayoff, 0), [history]);

  const handleAction = useCallback((actionId: string) => {
    if (isComplete) return;
    // Emit the player's action to the model; the model computes the opponent move
    // and accumulates score+round. Display history is updated via useEffect above.
    if (playRoundEvent) {
      emit(`UI:${playRoundEvent}`, { playerAction: actionId, payoff: 0 });
    }
    // When this is the last round, tell the model to evaluate the result.
    if (totalRounds > 0 && currentRound + 1 >= totalRounds) {
      if (finishEvent) {
        emit(`UI:${finishEvent}`, {});
      }
      if (str(resolved?.hint)) {
        setShowHint(true);
      }
    }
  }, [isComplete, resolved, totalRounds, currentRound, playRoundEvent, finishEvent, emit]);

  const handleReset = useCallback(() => {
    setHistory([]);
    setShowHint(false);
    prevRoundRef.current = 0;
    if (playAgainEvent) {
      emit(`UI:${playAgainEvent}`, {});
    }
  }, [playAgainEvent, emit]);

  // Emit completeEvent once when the machine reaches a win result.
  const completedRef = useRef(false);
  useEffect(() => {
    if (result === 'win' && !completedRef.current) {
      completedRef.current = true;
      emit(`UI:${completeEvent}`, { success: true, score: playerTotal });
    } else if (result === 'none') {
      completedRef.current = false;
    }
  }, [result, playerTotal, completeEvent, emit]);

  const getActionLabel = (id: string) => actions.find((a) => a.id === id)?.label ?? id;

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
            <HStack gap="md">
              <Badge size="sm">{t('negotiator.round', { current: String(currentRound), total: String(totalRounds) })}</Badge>
              <Badge size="sm">{t('negotiator.target')}: {targetScore}</Badge>
            </HStack>
          </VStack>
        </Card>

        {/* Score */}
        <HStack gap="md" justify="center">
          <Card className="p-4 flex-1 text-center">
            <VStack gap="xs" align="center">
              <Typography variant="caption" className="text-muted-foreground">{t('negotiator.you')}</Typography>
              <Typography variant="h3" weight="bold">{playerTotal}</Typography>
            </VStack>
          </Card>
          <Card className="p-4 flex-1 text-center">
            <VStack gap="xs" align="center">
              <Typography variant="caption" className="text-muted-foreground">{t('negotiator.opponent')}</Typography>
              <Typography variant="h3" weight="bold">{opponentTotal}</Typography>
            </VStack>
          </Card>
        </HStack>

        {/* Action buttons */}
        {!isComplete && (
          <Card className="p-4">
            <VStack gap="sm">
              <Typography variant="small" weight="bold" className="uppercase tracking-wider text-muted-foreground">
                {t('negotiator.chooseAction')}
              </Typography>
              <HStack gap="sm" justify="center" className="flex-wrap">
                {actions.map((action) => (
                  <Button
                    key={action.id}
                    variant="primary"
                    onClick={() => handleAction(action.id)}
                  >
                    {action.label}
                  </Button>
                ))}
              </HStack>
            </VStack>
          </Card>
        )}

        {/* History */}
        {history.length > 0 && (
          <Card className="p-4">
            <VStack gap="sm">
              <Typography variant="small" weight="bold" className="uppercase tracking-wider text-muted-foreground">
                {t('negotiator.history')}
              </Typography>
              {history.map((round) => (
                <HStack key={round.round} gap="sm" align="center" className="text-sm">
                  <Badge size="sm">R{round.round}</Badge>
                  <Typography variant="caption">{getActionLabel(round.playerAction)}</Typography>
                  <Typography variant="caption" className="text-muted-foreground">vs</Typography>
                  <Typography variant="caption">{getActionLabel(round.opponentAction)}</Typography>
                  <GameIcon icon={ArrowRight} assetUrl={ui?.['arrow']} size="sm" />
                  <Typography variant="caption" weight="bold" className="text-success">+{round.playerPayoff}</Typography>
                  <Typography variant="caption" className="text-muted-foreground">/ +{round.opponentPayoff}</Typography>
                </HStack>
              ))}
            </VStack>
          </Card>
        )}

        {/* Result */}
        {isComplete && (
          <Card className="p-4">
            <VStack gap="sm" align="center">
              <GameIcon icon={CheckCircle} assetUrl={ui?.['correct']} size="lg" className={won ? 'text-success' : 'text-error'} />
              <Typography variant="body" weight="bold">
                {won
                  ? (str(resolved.successMessage) || t('negotiator.success'))
                  : (str(resolved.failMessage) || t('negotiator.failed'))}
              </Typography>
              <Typography variant="caption" className="text-muted-foreground">
                {t('negotiator.finalScore')}: {playerTotal}/{targetScore}
              </Typography>
            </VStack>
          </Card>
        )}

        {showHint && hint && !won && (
          <Card className="p-4 border-l-4 border-l-warning">
            <Typography variant="body">{hint}</Typography>
          </Card>
        )}

        {isComplete && !won && (
          <HStack justify="center">
            <Button variant="primary" onClick={handleReset}>
              {t('negotiator.playAgain')}
            </Button>
          </HStack>
        )}
      </VStack>
    </Box>
  );
}

NegotiatorBoard.displayName = 'NegotiatorBoard';
