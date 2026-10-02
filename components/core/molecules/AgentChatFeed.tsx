/**
 * AgentChatFeed — a chat region's view of an agent turn: the activities the
 * host's audience selected, rendered by `AgentActivityFeed`, with raw LLM
 * responses behind a "Raw LLM" switch (off by default, so the conversation
 * stays readable until they're wanted). The switch is remembered per host.
 */
import React, { useCallback, useMemo, useState } from 'react';
import type { TraceActivity } from '@almadar/core';
import { Box } from '../atoms/Box';
import { Switch } from '../atoms/Switch';
import { VStack } from '../atoms/Stack';
import { useTranslate } from '../../../hooks/useTranslate';
import { AgentActivityFeed } from './AgentActivityFeed';

export interface AgentChatFeedProps {
  /** Activities already selected by the host's manifest audience. */
  activities: readonly TraceActivity[];
  emptyTitle: string;
  /** localStorage key remembering the Raw LLM switch for this host. */
  rawLlmPreferenceKey: string;
  /** Prefix for the toolbar test id and the switch's element id. */
  idPrefix: string;
  /** The agent is running — the feed shows it is thinking. */
  working?: boolean;
  className?: string;
}

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

export function AgentChatFeed({ activities, emptyTitle, rawLlmPreferenceKey, idPrefix, working = false, className }: AgentChatFeedProps): React.ReactElement {
  const { t } = useTranslate();
  const [showRawLlm, setShowRawLlm] = useState(() => readFlag(rawLlmPreferenceKey));

  const handleToggle = useCallback((checked: boolean) => {
    setShowRawLlm(checked);
    try {
      localStorage.setItem(rawLlmPreferenceKey, String(checked));
    } catch {
      // Storage unavailable (private window) — the switch still works for this session.
    }
  }, [rawLlmPreferenceKey]);

  const visible = useMemo(
    () => (showRawLlm ? activities : activities.filter((a) => a.type !== 'llm_response')),
    [activities, showRawLlm],
  );

  return (
    <VStack gap="none" className={`min-h-0 ${className ?? ''}`}>
      <Box className="flex items-center justify-end px-3 py-1.5 border-b border-[var(--color-border)]" data-testid={`${idPrefix}-toolbar`}>
        <Switch
          checked={showRawLlm}
          onChange={handleToggle}
          label={t('agentActivity.showRawLlm')}
          id={`${idPrefix}-show-raw-llm`}
        />
      </Box>
      <VStack gap="sm" className="flex-1 min-h-0 overflow-y-auto p-3">
        <AgentActivityFeed activities={visible} working={working} emptyTitle={emptyTitle} />
      </VStack>
    </VStack>
  );
}

AgentChatFeed.displayName = 'AgentChatFeed';
