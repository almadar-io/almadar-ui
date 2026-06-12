 
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

import React, { useState, useCallback } from 'react';
import type { EventEmit, EntityRow } from '@almadar/core';
import { Box, VStack, HStack, Card, Button, Typography, Badge, Icon } from '../../../../core/atoms';
import { useEventBus } from '../../../../../hooks/useEventBus';
import { useTranslate } from '../../../../../hooks/useTranslate';
import type { DisplayStateProps } from '../../../../core/organisms/types';
import { boardEntity, str, num } from '../../boardEntity';
import { CheckCircle, ArrowRight } from 'lucide-react';

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
   *  `actions` / `payoffMatrix` arrays plus title/description/rounds/hint off
   *  the row. */
  entity?: EntityRow | readonly EntityRow[];
  completeEvent?: EventEmit<{ success: boolean; score: number }>;
}

interface RoundResult {
  round: number;
  playerAction: string;
  opponentAction: string;
  playerPayoff: number;
  opponentPayoff: number;
}

function getOpponentAction(
  strategy: string,
  actions: NegotiatorAction[],
  history: RoundResult[],
): string {
  const actionIds = actions.map((a) => a.id);
  switch (strategy) {
    case 'always-cooperate':
      return actionIds[0];
    case 'always-defect':
      return actionIds[actionIds.length - 1];
    case 'tit-for-tat':
      if (history.length === 0) return actionIds[0];
      return history[history.length - 1].playerAction;
    case 'random':
    default:
      return actionIds[Math.floor(Math.random() * actionIds.length)];
  }
}

export function NegotiatorBoard({
  entity,
  completeEvent = 'PUZZLE_COMPLETE',
  className,
}: NegotiatorBoardProps): React.JSX.Element | null {
  const { emit } = useEventBus();
  const { t } = useTranslate();
  const resolved = boardEntity(entity);

  const [history, setHistory] = useState<RoundResult[]>([]);
  const [headerError, setHeaderError] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const totalRounds = num(resolved?.totalRounds);
  const targetScore = num(resolved?.targetScore);
  const currentRound = history.length;
  const isComplete = currentRound >= totalRounds;
  const playerTotal = history.reduce((s, r) => s + r.playerPayoff, 0);
  const opponentTotal = history.reduce((s, r) => s + r.opponentPayoff, 0);
  const won = isComplete && playerTotal >= targetScore;

  const actions = (Array.isArray(resolved?.actions) ? resolved.actions : []) as unknown as NegotiatorAction[];
  const payoffMatrix = (Array.isArray(resolved?.payoffMatrix) ? resolved.payoffMatrix : []) as unknown as PayoffEntry[];

  const handleAction = useCallback((actionId: string) => {
    if (isComplete) return;
    const opponentAction = getOpponentAction(str(resolved?.opponentStrategy) || 'random', actions, history);
    const payoff = payoffMatrix.find(
      (p) => p.playerAction === actionId && p.opponentAction === opponentAction,
    );
    const result: RoundResult = {
      round: currentRound + 1,
      playerAction: actionId,
      opponentAction,
      playerPayoff: payoff?.playerPayoff ?? 0,
      opponentPayoff: payoff?.opponentPayoff ?? 0,
    };
    const newHistory = [...history, result];
    setHistory(newHistory);

    if (newHistory.length >= totalRounds) {
      const total = newHistory.reduce((s, r) => s + r.playerPayoff, 0);
      if (total >= targetScore) {
        emit(`UI:${completeEvent}`, { success: true, score: total });
      }
      if (newHistory.length >= 3 && str(resolved?.hint)) {
        setShowHint(true);
      }
    }
  }, [isComplete, resolved, totalRounds, targetScore, actions, payoffMatrix, history, currentRound, completeEvent, emit]);

  const handleReset = () => {
    setHistory([]);
    setShowHint(false);
  };

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
                  <Icon icon={ArrowRight} size="xs" />
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
              <Icon icon={CheckCircle} size="lg" className={won ? 'text-success' : 'text-error'} />
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
