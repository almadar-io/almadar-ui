 
/**
 * ClassifierBoard
 *
 * Drag-and-drop classification game. The player sorts items
 * into the correct category buckets. All items must be correctly
 * classified to win.
 *
 * Good for: taxonomy, pattern recognition, sorting stories.
 *
 * Gameplay events are emitted onto the bus so the bound Orbital trait
 * (ui-classifier-board.lolo: menu -> playing -> complete) owns the state:
 * assignEvent (ASSIGN), checkEvent (CHECK), playAgainEvent (PLAY_AGAIN),
 * plus completeEvent (default UI:PUZZLE_COMPLETE). When the entity carries
 * per-item `assignedCategory` / `result` / `attempts`, the board renders
 * from those; otherwise it self-manages with local state.
 */

import React, { useState } from 'react';
import type { AssetUrl, EventEmit, EntityRow } from '@almadar/core';
import { Box, VStack, HStack, Card, Button, Typography, Badge, Icon } from '../../../../core/atoms';
import { useEventBus } from '../../../../../hooks/useEventBus';
import { useTranslate } from '../../../../../hooks/useTranslate';
import type { DisplayStateProps } from '../../../../core/organisms/types';
import { boardEntity, str, num } from '../../boardEntity';
import { CheckCircle, XCircle, RotateCcw, Send } from 'lucide-react';

/** A sortable item (UI value DTO read off the entity). */
export interface ClassifierItem {
  id: string;
  label: string;
  description?: string;
  correctCategory: string;
  /** Category the player has assigned (entity-provided; machine-owned). */
  assignedCategory?: string;
  /** Image URL icon for story-specific visual skin */
  iconUrl?: AssetUrl;
}

/** A category bucket (UI value DTO read off the entity). */
export interface ClassifierCategory {
  id: string;
  label: string;
  color?: string;
  /** Image URL for story-specific category header */
  imageUrl?: AssetUrl;
}

export interface ClassifierBoardProps extends DisplayStateProps {
  /** Puzzle board-state entity (single row or array). The board reads
   *  `items` / `categories` arrays plus title/description/hint off the row.
   *  Items may carry `assignedCategory`; the row may carry `result` and
   *  `attempts` — all machine-owned. */
  entity?: EntityRow | readonly EntityRow[];
  completeEvent?: EventEmit<{ success: boolean; attempts: number }>;
  /** Emits UI:{assignEvent} with { itemId, categoryId } when an item is sorted. */
  assignEvent?: EventEmit<{ itemId: string; categoryId: string }>;
  /** Emits UI:{checkEvent} with {} when the player submits/checks. */
  checkEvent?: EventEmit<Record<string, never>>;
  /** Emits UI:{playAgainEvent} with {} on reset / play again. */
  playAgainEvent?: EventEmit<Record<string, never>>;
}

export function ClassifierBoard({
  entity,
  completeEvent = 'PUZZLE_COMPLETE',
  assignEvent,
  checkEvent,
  playAgainEvent,
  className,
}: ClassifierBoardProps): React.JSX.Element | null {
  const { emit } = useEventBus();
  const { t } = useTranslate();
  const resolved = boardEntity(entity);

  const [headerError, setHeaderError] = useState(false);

  const items = (Array.isArray(resolved?.items) ? resolved.items : []) as unknown as ClassifierItem[];
  const categories = (Array.isArray(resolved?.categories) ? resolved.categories : []) as unknown as ClassifierCategory[];

  // All state is model-owned; read directly from the entity.
  const result = str(resolved?.result);
  const submitted = result === 'win';
  const attempts = num(resolved?.attempts);

  const assignments: Record<string, string> = items.reduce<Record<string, string>>((acc, item) => {
    if (item.assignedCategory != null && item.assignedCategory !== '') acc[item.id] = item.assignedCategory;
    return acc;
  }, {});

  const unassignedItems = items.filter((item) => !assignments[item.id]);
  const allAssigned = items.length > 0 && Object.keys(assignments).length === items.length;

  const results = submitted
    ? items.map((item) => ({
      item,
      assigned: assignments[item.id],
      correct: assignments[item.id] === item.correctCategory,
    }))
    : [];

  // result === 'win' means all correct (the lolo guard ensures that)
  const allCorrect = result === 'win';
  const correctCount = results.filter((r) => r.correct).length;
  const showHint = attempts >= 2 && Boolean(str(resolved?.hint));

  const handleAssign = (itemId: string, categoryId: string) => {
    if (submitted) return;
    if (assignEvent) emit(`UI:${assignEvent}`, { itemId, categoryId });
  };

  const handleUnassign = (itemId: string) => {
    if (submitted) return;
    // Clear assignment by assigning empty string
    if (assignEvent) emit(`UI:${assignEvent}`, { itemId, categoryId: '' });
  };

  const handleSubmit = () => {
    if (checkEvent) emit(`UI:${checkEvent}`, {});
    // Legacy completeEvent emitted when the model has declared a win
    if (allAssigned && items.every((item) => assignments[item.id] === item.correctCategory)) {
      emit(`UI:${completeEvent}`, { success: true, attempts: attempts + 1 });
    }
  };

  const handleFullReset = () => {
    if (playAgainEvent) emit(`UI:${playAgainEvent}`, {});
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
          {!submitted && (
            <Button variant="primary" onClick={handleSubmit} disabled={!allAssigned}>
              <Icon icon={Send} size="sm" />
              {t('classifier.check')}
            </Button>
          )}
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
