'use client';
/**
 * ChatBar Organism
 *
 * The always-visible bottom chat bar. A single-row input surface for talking
 * to the agent: status icon, optional context badge, text input, and a
 * status-driven action button (Send / Pause+Stop / Resume / Retry).
 *
 * The agent's activity stream lives in the dedicated Trace tab (see
 * SubagentTracePanel). ChatBar emits generic EventBus events
 * (`UI:CHAT_SEND`, `UI:ELEMENT_SELECTED`, plus the declarative `UI:*` actions
 * the Button atom raises) — it owns no app-specific state.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Box } from '../atoms/Box';
import { HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Icon } from '../atoms/Icon';
import { Textarea } from '../atoms/Textarea';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';
import type { DisplayStateProps } from './types';
import type { EditFocus } from '@almadar/core';
import { ELEMENT_SELECTED_EVENT, parseEditFocus } from './trace-edit-focus';

// ─── Types ─────────────────────────────────────────────────

export type ChatBarStatus = 'idle' | 'running' | 'paused' | 'complete' | 'error';

export interface ChatBarProps extends DisplayStateProps {
  /** Pipeline status */
  status?: ChatBarStatus;
  /** Currently active gate label, e.g. "Gate 2: State machines" */
  activeGate?: string;
  /** JEPA validity probability 0-1 */
  jepaValidity?: number;
  /** Input placeholder text */
  placeholder?: string;
  /** Agent context description */
  context?: string;
}

// ─── Helpers ───────────────────────────────────────────────

function getJepaBadgeVariant(probability: number): 'success' | 'warning' | 'danger' {
  if (probability >= 0.9) return 'success';
  if (probability >= 0.5) return 'warning';
  return 'danger';
}

// ─── Component ─────────────────────────────────────────────

export function ChatBar({
  status = 'idle',
  activeGate,
  jepaValidity,
  placeholder,
  context,
  className,
}: ChatBarProps): React.ReactElement {
  const { t } = useTranslate();
  const eventBus = useEventBus();
  const [inputValue, setInputValue] = useState('');
  // Contextual-edit focus chip: shows the canvas element the user picked.
  const [focus, setFocus] = useState<EditFocus | null>(null);

  const clearFocus = useCallback(() => {
    setFocus(null);
    eventBus.emit(ELEMENT_SELECTED_EVENT, { focus: null });
  }, [eventBus]);

  // Enter key — emits the same UI:CHAT_SEND event the send button does. The
  // input clearing is handled by the listener below so both entry points share
  // one closed-circuit path.
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    e.preventDefault();
    eventBus.emit('UI:CHAT_SEND', { message: trimmed });
  }, [inputValue, eventBus]);

  // Closed-circuit listener: any UI:CHAT_SEND emission clears our local input
  // and consumes the focus chip. Covers both the Enter key handler above and
  // the declarative <Button action="CHAT_SEND" />.
  useEffect(() => {
    const unsubSend = eventBus.on('UI:CHAT_SEND', () => {
      setInputValue('');
      setFocus(null);
    });
    const unsubSelect = eventBus.on(ELEMENT_SELECTED_EVENT, (e) => {
      setFocus(parseEditFocus(e.payload?.focus));
    });
    return () => {
      unsubSend();
      unsubSelect();
    };
  }, [eventBus]);

  // Fused trailing action(s) — Send by default; status-specific replacements
  // for error / running / paused. All variants share `rounded-none` so they
  // sit flush against the right edge of the bordered input container, and
  // a shared `px-3` keeps the button width visually consistent across
  // states. Action names are bare — the Button atom prepends `UI:`.
  const trailingAction =
    status === 'error' ? (
      <Button variant="secondary" size="sm" action="RETRY_GENERATION" className="rounded-none flex-shrink-0 h-auto">
        <Icon name="refresh-cw" size="xs" />
        <Typography variant="caption">{t('openFile.retry')}</Typography>
      </Button>
    ) : status === 'running' ? (
      <>
        <Button
          variant="ghost"
          size="sm"
          action="PAUSE"
          title={t('chatBar.pauseTheAgentYouCanEdit')}
          className="rounded-none flex-shrink-0 h-auto"
        >
          <Icon name="pause" size="xs" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          action="STOP"
          title={t('chatBar.cancelGeneration')}
          className="rounded-none flex-shrink-0 h-auto border-l border-[var(--color-border)]"
        >
          <Icon name="square" size="xs" />
        </Button>
      </>
    ) : status === 'paused' ? (
      <Button
        variant="primary"
        size="sm"
        action="RESUME"
        title={t('chatBar.resumeTheAgentYourCanvasEdits')}
        className="rounded-none flex-shrink-0 h-auto"
      >
        <Icon name="play" size="xs" />
        <Typography variant="caption">{t('chatBar.resume')}</Typography>
      </Button>
    ) : (
      <Button
        variant="primary"
        size="sm"
        action="CHAT_SEND"
        actionPayload={{ message: inputValue.trim() }}
        disabled={!inputValue.trim()}
        aria-label={t('chatBar.sendMessage')}
        className="rounded-none flex-shrink-0 h-auto"
      >
        <Icon name="send" size="xs" />
      </Button>
    );

  return (
    <Box className={`border-t border-[var(--color-border)] bg-[var(--color-card)] ${className ?? ''}`}>
      {/* Contextual-edit focus chip — the picked canvas element. Sending a
          message applies the edit to it; the ✕ clears the selection. */}
      {focus && (
        <HStack gap="xs" className="items-center px-4 pt-2">
          <Badge variant="secondary" size="sm" className="flex items-center gap-1 max-w-full">
            <Icon name="mouse-pointer-2" size="xs" />
            <Typography variant="caption" className="text-inherit truncate">
              {t('chatBar.editing')}: {focus.label}
            </Typography>
            <Box
              onClick={clearFocus}
              title={t('chatBar.clearSelection')}
              className="cursor-pointer flex items-center ml-1 hover:opacity-70"
            >
              <Icon name="x" size="xs" />
            </Box>
          </Badge>
        </HStack>
      )}

      <HStack gap="sm" className="items-center px-4 py-2">
        {/* Agent context label */}
        {context && (
          <Badge variant="primary" size="sm" className="whitespace-nowrap flex-shrink-0">
            <Typography variant="caption" className="text-inherit">{context}</Typography>
          </Badge>
        )}

        {/* Fused input + trailing action(s) — one bordered surface so the
            send button sits flush against the right edge of the input with
            no visual gap. Input is borderless/transparent inside; the outer
            Box owns the border, radius, and focus state. */}
        <Box className="flex-1 min-w-0 flex items-stretch rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] focus-within:border-[var(--color-primary)] overflow-hidden">
          {/* Textarea (not Input) — the Input atom wraps its <input> in a
              `<div class="relative">`, which collapses to the input's
              intrinsic `size=20` width when placed in a flex row. Textarea
              renders the <textarea> directly, so flex-1 actually grows it.
              Single-row default with `rows={1}` + `resize-none`. */}
          <Textarea
            value={inputValue}
            placeholder={placeholder ?? t('chatBar.askTheAgentAnything')}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="flex-1 min-w-0 min-h-0 text-sm border-0 rounded-none shadow-none bg-transparent resize-none focus:ring-0"
          />
          {trailingAction}
        </Box>

        {/* Right: Active gate + JEPA badge. Only rendered when at least one
            is present so an empty flex slot can't claim layout width and
            squeeze the input on the left. */}
        {(activeGate || jepaValidity !== undefined) && (
          <HStack gap="xs" className="items-center flex-shrink-0">
            {activeGate && (
              <Typography variant="caption" color="muted" className="whitespace-nowrap">
                {activeGate}
              </Typography>
            )}
            {jepaValidity !== undefined && (
              <Badge variant={getJepaBadgeVariant(jepaValidity)} size="sm">
                <Typography variant="caption" className="text-inherit">
                  {(jepaValidity * 100).toFixed(1)}%
                </Typography>
              </Badge>
            )}
          </HStack>
        )}
      </HStack>
    </Box>
  );
}

ChatBar.displayName = 'ChatBar';
