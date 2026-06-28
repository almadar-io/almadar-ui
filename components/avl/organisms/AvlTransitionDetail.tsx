'use client';

/**
 * AvlTransitionDetail — HTML transition detail view for cosmic L4.
 *
 * Renders the same `TransitionLevelData` that `AvlTransitionScene`
 * (the SVG variant used by the 3D viewer) renders, but in plain HTML
 * so long effect arguments — most commonly the JSON-stringified
 * `render-ui` pattern config — wrap properly and live inside a
 * collapsible accordion. Each effect becomes one accordion item with
 * a `CodeBlock` body so the operator's full JSON code is visible at
 * one click.
 *
 * Composition: Card / Box / Stack atoms + Typography + Badge +
 * Accordion (molecule) + CodeBlock (molecule). No raw HTML.
 */

import React, { useMemo } from 'react';
import { Card } from '../../core/atoms/Card';
import { Box } from '../../core/atoms/Box';
import { HStack, VStack } from '../../core/atoms/Stack';
import { Typography } from '../../core/atoms/Typography';
import { Badge } from '../../core/atoms/Badge';
import { Accordion, type AccordionItem } from '../../core/molecules/Accordion';
import { CodeBlock } from '../../core/molecules/markdown/CodeBlock';
import type { TransitionLevelData, ExprTreeNode } from '../lib/avl-schema-parser';
import type { JsonValue } from '@almadar/core';

export interface AvlTransitionDetailProps {
  data: TransitionLevelData;
}

// ---------------------------------------------------------------------------
// Effect flattening
// ---------------------------------------------------------------------------

interface FlatEffect {
  type: string;
  args: ExprTreeNode[];
  argSummary: string;
}

function summarizeArg(node: ExprTreeNode | { label: string }): string {
  // The label is either a primitive string ("CartItem", "main") or a
  // JSON-stringified pattern object for the render-ui slot config.
  // Strip leading `{` to detect inline JSON and shorten for the header.
  const label = node.label;
  if (label.length <= 32) return label;
  return `${label.slice(0, 30)}…`;
}

function flattenEffect(node: ExprTreeNode): FlatEffect {
  const args: ExprTreeNode[] = node.children ?? [];
  const argSummary = args
    .slice(0, 2)
    .map(summarizeArg)
    .join(' · ');
  return { type: node.label, args, argSummary };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AvlTransitionDetail: React.FC<AvlTransitionDetailProps> = ({ data }) => {
  const effects = useMemo(() => data.effects.map(flattenEffect), [data.effects]);

  const accordionItems = useMemo<AccordionItem[]>(() => {
    return effects.map((eff, i) => {
      // Build a single JSON block per effect: [operator, ...args]. This
      // matches the canonical .orb shape and round-trips cleanly through
      // JSON.parse for anyone copying out of the panel.
      const code = JSON.stringify(
        [eff.type, ...eff.args.map(a => safeParseLabel(a.label))],
        null,
        2,
      );
      return {
        id: `effect-${i}`,
        header: (
          <HStack gap="sm" align="center">
            <Badge variant="primary" size="sm">{eff.type}</Badge>
            {eff.argSummary ? (
              <Typography variant="small" color="muted">{eff.argSummary}</Typography>
            ) : null}
          </HStack>
        ),
        content: (
          <CodeBlock code={code} language="json" maxHeight="320px" />
        ),
      };
    });
  }, [effects]);

  const hasGuard = !!data.guard;
  const hasEffects = effects.length > 0;
  const hasSlots = data.slotTargets.length > 0;

  return (
    <Card className="w-full max-w-3xl mx-auto" shadow="md">
      <Box className="p-6">
        <VStack gap="lg">
          {/* Header: from → to pills */}
          <HStack gap="md" justify="center" align="center">
            <Badge variant="success" size="lg">{data.from}</Badge>
            <Typography variant="h5" color="muted">→</Typography>
            <Badge variant="neutral" size="lg">{data.to}</Badge>
          </HStack>

          {/* Trigger */}
          <VStack gap="xs">
            <Typography variant="overline" color="muted">TRIGGER</Typography>
            <HStack gap="xs" align="center">
              <Typography variant="body1" weight="semibold">⚡ {data.event}</Typography>
            </HStack>
          </VStack>

          {/* Guard */}
          {hasGuard && data.guard && (
            <VStack gap="xs">
              <Typography variant="overline" color="muted">GUARD</Typography>
              <Typography variant="body2" color="muted">{data.guard.label}</Typography>
            </VStack>
          )}

          {/* Effects — accordion */}
          {hasEffects && (
            <VStack gap="xs">
              <Typography variant="overline" color="muted">
                EFFECTS ({effects.length})
              </Typography>
              <Accordion items={accordionItems} multiple />
            </VStack>
          )}

          {/* Slots */}
          {hasSlots && (
            <VStack gap="xs">
              <Typography variant="overline" color="muted">SLOTS</Typography>
              <VStack gap="xs">
                {data.slotTargets.map((slot, i) => (
                  <HStack key={`slot-${i}`} gap="sm" align="center">
                    <Badge variant="info" size="sm">{slot.name}</Badge>
                    <Typography variant="small" color="muted">{slot.pattern}</Typography>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          )}
        </VStack>
      </Box>
    </Card>
  );
};

AvlTransitionDetail.displayName = 'AvlTransitionDetail';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// ExprTreeNode labels for render-ui slot configs come through as
// JSON-stringified objects. Parse them back to native values so the
// effect's outer `JSON.stringify(..., null, 2)` produces nested,
// readable JSON instead of a stringified-string with escaped quotes.
function safeParseLabel(label: string): JsonValue {
  if (typeof label !== 'string') return label;
  const trimmed = label.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return label;
  try {
    return JSON.parse(trimmed);
  } catch {
    return label;
  }
}
