'use client';
/**
 * useAgentTrace — pure state-accumulation reducer for the agent-trace UI.
 *
 * Holds the view-model the trace components read — activities, subagents,
 * coordinator conversation, and a coarse run status — and exposes a way to
 * apply already-mapped view-model updates. It owns NO transport: the
 * SSE→view-model mapping happens upstream in the runner, which feeds this hook
 * pre-mapped `TraceUpdate`s. There is deliberately no fetch / SSE / Firestore /
 * threadId / interrupt concern here; this is the accumulation half of
 * apps/builder's `useAgentChat`, extracted so `@almadar/ui` can drive
 * `SubagentTracePanel` and `ChatBar` without those dependencies.
 */

import { useCallback, useReducer } from 'react';
import type {
  TraceActivity,
  TraceSubagent,
  TraceSubagentMessage,
  TraceChatMessage,
} from '@almadar/core';

/** Coarse run status surfaced by the trace UI (drives ChatBar's action button). */
export type TraceStatus = 'idle' | 'running' | 'paused' | 'complete' | 'error';

/** The accumulated view-model the trace components render. */
export interface AgentTraceState {
  activities: TraceActivity[];
  subagents: TraceSubagent[];
  coordinatorMessages: TraceChatMessage[];
  status: TraceStatus;
}

/**
 * A pre-mapped update the runner feeds in. Each variant is a view-model delta —
 * no raw SSE/transport shapes. Subagents upsert by `id`; coordinator messages
 * upsert by index (the runner owns ordering); activities append.
 */
export type TraceUpdate =
  /** Append one already-mapped activity to the page-level stream. */
  | { kind: 'activity'; activity: TraceActivity }
  /**
   * Upsert a subagent by `id`. A partial patch merges into the existing record
   * (status/duration/task changes); a full record inserts when `id` is new.
   */
  | { kind: 'subagent-upsert'; id: string; subagent: SubagentUpsert }
  /** Append a progress message to a known subagent's running log. */
  | { kind: 'subagent-message'; id: string; message: TraceSubagentMessage }
  /**
   * Set a coordinator message at `index`. The runner emits messages in order;
   * a known index replaces (e.g. streaming content grew), a new index appends.
   */
  | { kind: 'coordinator-message'; index: number; message: TraceChatMessage }
  /** Set the coarse run status. */
  | { kind: 'status'; status: TraceStatus }
  /** Reset the whole view-model (new turn). */
  | { kind: 'reset' };

/**
 * A subagent upsert payload: every field optional except `name`/`role`/`task`
 * are required only when the id is new. Partial patches merge into the existing
 * record; that's why the fields are all optional here and the reducer fills
 * defaults on first insert.
 */
export interface SubagentUpsert {
  name?: string;
  role?: string;
  orbitalName?: string;
  parentId?: string;
  status?: TraceSubagent['status'];
  task?: string;
  durationMs?: number;
}

/** What the hook returns: the state plus an `apply` to feed it updates. */
export interface UseAgentTraceResult extends AgentTraceState {
  /** Apply one pre-mapped view-model update (from the runner). */
  apply: (update: TraceUpdate) => void;
  /** Apply a batch of updates in order (single render). */
  applyAll: (updates: readonly TraceUpdate[]) => void;
  /** Reset to the empty view-model. */
  reset: () => void;
}

const EMPTY_STATE: AgentTraceState = {
  activities: [],
  subagents: [],
  coordinatorMessages: [],
  status: 'idle',
};

function upsertSubagent(
  subagents: TraceSubagent[],
  id: string,
  patch: SubagentUpsert,
): TraceSubagent[] {
  const idx = subagents.findIndex((s) => s.id === id);
  if (idx === -1) {
    const next: TraceSubagent = {
      id,
      name: patch.name ?? id,
      role: patch.role ?? '',
      status: patch.status ?? 'running',
      task: patch.task ?? '',
      messages: [],
    };
    if (patch.orbitalName !== undefined) next.orbitalName = patch.orbitalName;
    if (patch.parentId !== undefined) next.parentId = patch.parentId;
    if (patch.durationMs !== undefined) next.durationMs = patch.durationMs;
    return [...subagents, next];
  }
  const merged: TraceSubagent = { ...subagents[idx] };
  if (patch.name !== undefined) merged.name = patch.name;
  if (patch.role !== undefined) merged.role = patch.role;
  if (patch.orbitalName !== undefined) merged.orbitalName = patch.orbitalName;
  if (patch.parentId !== undefined) merged.parentId = patch.parentId;
  if (patch.status !== undefined) merged.status = patch.status;
  if (patch.task !== undefined) merged.task = patch.task;
  if (patch.durationMs !== undefined) merged.durationMs = patch.durationMs;
  const out = subagents.slice();
  out[idx] = merged;
  return out;
}

function appendSubagentMessage(
  subagents: TraceSubagent[],
  id: string,
  message: TraceSubagentMessage,
): TraceSubagent[] {
  const idx = subagents.findIndex((s) => s.id === id);
  if (idx === -1) return subagents;
  const out = subagents.slice();
  out[idx] = { ...out[idx], messages: [...out[idx].messages, message] };
  return out;
}

function setCoordinatorMessage(
  messages: TraceChatMessage[],
  index: number,
  message: TraceChatMessage,
): TraceChatMessage[] {
  if (index < messages.length) {
    const out = messages.slice();
    out[index] = message;
    return out;
  }
  return [...messages, message];
}

function reduce(state: AgentTraceState, update: TraceUpdate): AgentTraceState {
  switch (update.kind) {
    case 'activity':
      return { ...state, activities: [...state.activities, update.activity] };
    case 'subagent-upsert':
      return { ...state, subagents: upsertSubagent(state.subagents, update.id, update.subagent) };
    case 'subagent-message':
      return { ...state, subagents: appendSubagentMessage(state.subagents, update.id, update.message) };
    case 'coordinator-message':
      return {
        ...state,
        coordinatorMessages: setCoordinatorMessage(state.coordinatorMessages, update.index, update.message),
      };
    case 'status':
      return { ...state, status: update.status };
    case 'reset':
      return EMPTY_STATE;
  }
}

type TraceAction = { type: 'apply'; update: TraceUpdate } | { type: 'applyAll'; updates: readonly TraceUpdate[] };

function traceReducer(state: AgentTraceState, action: TraceAction): AgentTraceState {
  if (action.type === 'apply') return reduce(state, action.update);
  return action.updates.reduce(reduce, state);
}

/**
 * Accumulate agent-trace view-model from pre-mapped updates.
 *
 * The consumer maps SSE/runner events to `TraceUpdate`s upstream and calls
 * `apply`/`applyAll`; this hook holds nothing but the accumulated render state.
 */
export function useAgentTrace(): UseAgentTraceResult {
  const [state, dispatch] = useReducer(traceReducer, EMPTY_STATE);

  const apply = useCallback((update: TraceUpdate) => {
    dispatch({ type: 'apply', update });
  }, []);

  const applyAll = useCallback((updates: readonly TraceUpdate[]) => {
    dispatch({ type: 'applyAll', updates });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'apply', update: { kind: 'reset' } });
  }, []);

  return {
    activities: state.activities,
    subagents: state.subagents,
    coordinatorMessages: state.coordinatorMessages,
    status: state.status,
    apply,
    applyAll,
    reset,
  };
}
