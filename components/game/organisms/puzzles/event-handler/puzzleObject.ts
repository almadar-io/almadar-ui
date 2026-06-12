/**
 * puzzleObject — field accessors for reading Event-Handler puzzle-object data
 * off an `EntityRow`.
 *
 * The puzzle objects the kid configures arrive as `entity.objects` (an array of
 * `EntityRow`). These helpers narrow the weakly-typed fields the panel reads.
 * `RuleDefinition` / `RuleOption` remain plain UI value DTOs (see `RuleEditor`).
 *
 * @packageDocumentation
 */

import type { EntityRow } from '@almadar/core';
import type { RuleDefinition, RuleOption } from './RuleEditor';

export function objId(o: EntityRow): string {
    return o.id == null ? '' : String(o.id);
}

export function objName(o: EntityRow): string {
    return o.name == null ? '' : String(o.name);
}

export function objIcon(o: EntityRow): string {
    return o.icon == null ? '' : String(o.icon);
}

export function objStates(o: EntityRow): string[] {
    return Array.isArray(o.states) ? (o.states as string[]) : [];
}

export function objCurrentState(o: EntityRow): string {
    return o.currentState == null ? '' : String(o.currentState);
}

export function objAvailableEvents(o: EntityRow): RuleOption[] {
    return Array.isArray(o.availableEvents) ? (o.availableEvents as unknown as RuleOption[]) : [];
}

export function objAvailableActions(o: EntityRow): RuleOption[] {
    return Array.isArray(o.availableActions) ? (o.availableActions as unknown as RuleOption[]) : [];
}

export function objRules(o: EntityRow): RuleDefinition[] {
    return Array.isArray(o.rules) ? (o.rules as unknown as RuleDefinition[]) : [];
}

export function objMaxRules(o: EntityRow): number {
    const n = Number(o.maxRules);
    return Number.isFinite(n) && n > 0 ? n : 3;
}
