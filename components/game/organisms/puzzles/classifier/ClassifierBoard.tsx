 
/**
 * ClassifierBoard
 *
 * Drag-and-drop classification game. The player sorts items
 * into the correct category buckets. All items must be correctly
 * classified to win.
 *
 * Good for: taxonomy, pattern recognition, sorting stories.
 *
 * Events emitted via completeEvent (default UI:PUZZLE_COMPLETE).
 */

import React, { useState, useCallback } from 'react';
import type { EventEmit, EntityRow } from '@almadar/core';
import { Box, VStack, HStack, Card, Button, Typography, Badge, Icon } from '../../../../core/atoms';
import { useEventBus } from '../../../../../hooks/useEventBus';
import { useTranslate } from '../../../../../hooks/useTranslate';
import type { DisplayStateProps } from '../../../../core/organisms/types';
import { boardEntity, str } from '../../boardEntity';
import { CheckCircle, XCircle, RotateCcw, Send } from 'lucide-react';

/** A sortable item (UI value DTO read off the entity). */
export interface ClassifierItem {
  id: string;
  label: string;
  description?: string;
  correctCategory: string;
  /** Image URL icon for story-specific visual skin */
  iconUrl?: string;
}

/** A category bucket (UI value DTO read off the entity). */
export interface ClassifierCategory {
  id: string;
  label: string;
  color?: string;
  /** Image URL for story-specific category header */
  imageUrl?: string;
}

export interface ClassifierBoardProps extends DisplayStateProps {
  /** Puzzle board-state entity (single row or array). The board reads
   *  `items` / `categories` arrays plus title/description/hint off the row. */
  entity?: EntityRow | readonly EntityRow[];
  completeEvent?: EventEmit<{ success: boolean; attempts: number }>;
}

export function ClassifierBoard({
  entity,
  completeEvent = 'PUZZLE_COMPLETE',
  className,
}: ClassifierBoardProps): React.JSX.Element | null {
  const { emit } = useEventBus();
  const { t } = useTranslate();
  const resolved = boardEntity(entity);

  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [headerError, setHeaderError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const items = (Array.isArray(resolved?.items) ? resolved.items : []) as unknown as ClassifierItem[];
  const categories = (Array.isArray(resolved?.categories) ? resolved.categories : []) as unknown as ClassifierCategory[];
  const unassignedItems = items.filter((item) => !assignments[item.id]);
  const allAssigned = Object.keys(assignments).length === items.length;

  const results = submitted
    ? items.map((item) => ({
      item,
      assigned: assignments[item.id],
      correct: assignments[item.id] === item.correctCategory,
    }))
    : [];

  const allCorrect = results.length > 0 && results.every((r) => r.correct);
  const correctCount = results.filter((r) => r.correct).length;

  const handleAssign = (itemId: string, categoryId: string) => {
    if (submitted) return;
    setAssignments((prev) => ({ ...prev, [itemId]: categoryId }));
  };

  const handleUnassign = (itemId: string) => {
    if (submitted) return;
    setAssignments((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    setAttempts((a) => a + 1);
    const correct = items.every((item) => assignments[item.id] === item.correctCategory);
    if (correct) {
      emit(`UI:${completeEvent}`, { success: true, attempts: attempts + 1 });
    }
  }, [items, assignments, attempts, completeEvent, emit]);

  const handleReset = () => {
    setSubmitted(false);
    if (attempts >= 2 && str(resolved?.hint)) {
      setShowHint(true);
    }
  };

  const handleFullReset = () => {
    setAssignments({});
    setSubmitted(false);
    setAttempts(0);
    setShowHint(false);
  };

  if (!resolved) return null;

  const theme = (resolved.theme ?? undefined) as { background?: string; accentColor?: string } | undefined;
  const themeBackground = theme?.background;
  const headerImage = str(resolved.headerImage);
  const hint = str(resolved.hint);
  const failMessage = str(resolved.failMessage);

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

        {/* Unassigned items */}
        {unassignedItems.length > 0 && (
          <Card className="p-4">
            <VStack gap="sm">
              <Typography variant="small" weight="bold" className="uppercase tracking-wider text-muted-foreground">
                {t('classifier.itemsToSort')}
              </Typography>
              <HStack gap="sm" className="flex-wrap">
                {unassignedItems.map((item) => (
                  <Badge key={item.id} size="md" className="cursor-pointer">
                    {item.iconUrl && (
                      <img src={item.iconUrl} alt="" className="w-4 h-4 object-contain inline-block" />
                    )}
                    {item.label}
                  </Badge>
                ))}
              </HStack>
            </VStack>
          </Card>
        )}

        {/* Category buckets */}
        <VStack gap="md">
          {categories.map((cat) => {
            const catItems = items.filter((item) => assignments[item.id] === cat.id);
            return (
              <Card key={cat.id} className="p-4">
                <VStack gap="sm">
                  {cat.imageUrl && (
                    <Box className="w-full h-16 overflow-hidden rounded-container">
                      <img src={cat.imageUrl} alt="" className="w-full h-full object-cover" />
                    </Box>
                  )}
                  <HStack justify="between" align="center">
                    <Typography variant="body" weight="bold">{cat.label}</Typography>
                    <Badge size="sm">{catItems.length}</Badge>
                  </HStack>
                  <HStack gap="xs" className="flex-wrap min-h-[2rem]">
                    {catItems.map((item) => {
                      const result = results.find((r) => r.item.id === item.id);
                      return (
                        <Badge
                          key={item.id}
                          size="sm"
                          className={`cursor-pointer ${
                            result
                              ? result.correct
                                ? 'border-success bg-success/10'
                                : 'border-error bg-error/10'
                              : ''
                          }`}
                          onClick={() => handleUnassign(item.id)}
                        >
                          {item.iconUrl && (
                            <img src={item.iconUrl} alt="" className="w-3 h-3 object-contain inline-block" />
                          )}
                          {item.label}
                          {result && (
                            <Icon icon={result.correct ? CheckCircle : XCircle} size="xs" className={result.correct ? 'text-success' : 'text-error'} />
                          )}
                        </Badge>
                      );
                    })}
                  </HStack>
                  {/* Drop targets for unassigned items */}
                  {!submitted && unassignedItems.length > 0 && (
                    <HStack gap="xs" className="flex-wrap">
                      {unassignedItems.map((item) => (
                        <Button
                          key={item.id}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAssign(item.id, cat.id)}
                          className="text-xs opacity-50 hover:opacity-100"
                        >
                          + {item.label}
                        </Button>
                      ))}
                    </HStack>
                  )}
                </VStack>
              </Card>
            );
          })}
        </VStack>

        {/* Result */}
        {submitted && (
          <Card className="p-4">
            <VStack gap="sm" align="center">
              <Icon icon={allCorrect ? CheckCircle : XCircle} size="lg" className={allCorrect ? 'text-success' : 'text-error'} />
              <Typography variant="body" weight="bold">
                {allCorrect
                  ? (str(resolved.successMessage) || t('classifier.allCorrect'))
                  : `${correctCount}/${items.length} ${t('classifier.correct')}`}
              </Typography>
              {!allCorrect && failMessage && (
                <Typography variant="body" className="text-muted-foreground">{failMessage}</Typography>
              )}
            </VStack>
          </Card>
        )}

        {/* Hint */}
        {showHint && hint && (
          <Card className="p-4 border-l-4 border-l-warning">
            <Typography variant="body">{hint}</Typography>
          </Card>
        )}

        {/* Actions */}
        <HStack gap="sm" justify="center">
          {!submitted ? (
            <Button variant="primary" onClick={handleSubmit} disabled={!allAssigned}>
              <Icon icon={Send} size="sm" />
              {t('classifier.check')}
            </Button>
          ) : !allCorrect ? (
            <Button variant="primary" onClick={handleReset}>
              {t('classifier.tryAgain')}
            </Button>
          ) : null}
          <Button variant="secondary" onClick={handleFullReset}>
            <Icon icon={RotateCcw} size="sm" />
            {t('classifier.reset')}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

ClassifierBoard.displayName = 'ClassifierBoard';
