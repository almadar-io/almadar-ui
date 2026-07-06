/**
 * ObjectRulePanel Component
 *
 * Shows the rules panel for a selected world object in the Event Handler tier.
 * Displays object info, its current state (via TraitStateViewer), and
 * a list of WHEN/THEN rules the kid has set.
 *
 * @packageDocumentation
 */

import React, { useCallback } from 'react';
import type { EntityRow, EventEmit } from '@almadar/core';
import { VStack, HStack, Typography, Button } from '../../core/atoms/index';
import { cn } from '../../../lib/cn';
import { useTranslate } from '../../../hooks/useTranslate';
import { useEventBus } from '../../../hooks/useEventBus';
import { TraitStateViewer } from './TraitStateViewer';
import type { TraitStateMachineDefinition } from './TraitStateViewer';
import { RuleEditor, type RuleDefinition, type RuleOption } from './RuleEditor';
import {
    objId,
    objName,
    objIcon,
    objStates,
    objCurrentState,
    objAvailableEvents,
    objAvailableActions,
    objRules,
    objMaxRules,
} from '../../../lib/puzzleObject';

export interface ObjectRulePanelProps {
    /** The selected puzzle-object row (`EntityRow` carrying the editable object data) */
    object: EntityRow;
    /** Called when rules change (callback path) */
    onRulesChange?: (objectId: string, rules: RuleDefinition[]) => void;
    /** Emits UI:{rulesChangeEvent} with { objectId, rules } when rules change (declarative path) */
    rulesChangeEvent?: EventEmit<{ objectId: string; rules: RuleDefinition[] }>;
    /** Whether editing is disabled */
    disabled?: boolean;
    /** Additional CSS classes */
    className?: string;
}

let nextRuleId = 1;

export function ObjectRulePanel({
    object,
    onRulesChange,
    rulesChangeEvent,
    disabled = false,
    className,
}: ObjectRulePanelProps): React.JSX.Element {
    const { t } = useTranslate();
    const { emit } = useEventBus();
    const id = objId(object);
    const name = objName(object);
    const icon = objIcon(object);
    const states = objStates(object);
    const currentState = objCurrentState(object);
    const availableEvents: RuleOption[] = objAvailableEvents(object);
    const availableActions: RuleOption[] = objAvailableActions(object);
    const rules = objRules(object);
    const maxRules = objMaxRules(object);
    const canAdd = rules.length < maxRules;

    const emitRules = useCallback((newRules: RuleDefinition[]) => {
        if (rulesChangeEvent) emit(`UI:${rulesChangeEvent}`, { objectId: id, rules: newRules });
        else onRulesChange?.(id, newRules);
    }, [rulesChangeEvent, emit, id, onRulesChange]);

    const handleRuleChange = useCallback((index: number, updatedRule: RuleDefinition) => {
        const newRules = [...rules];
        newRules[index] = updatedRule;
        emitRules(newRules);
    }, [rules, emitRules]);

    const handleRuleRemove = useCallback((index: number) => {
        const newRules = rules.filter((_, i) => i !== index);
        emitRules(newRules);
    }, [rules, emitRules]);

    const handleAddRule = useCallback(() => {
        if (!canAdd || disabled) return;
        const firstEvent = availableEvents[0]?.value || '';
        const firstAction = availableActions[0]?.value || '';
        const newRule: RuleDefinition = {
            id: `rule-${nextRuleId++}`,
            whenEvent: firstEvent,
            thenAction: firstAction,
        };
        emitRules([...rules, newRule]);
    }, [canAdd, disabled, rules, availableEvents, availableActions, emitRules]);

    // Build a simple state machine for the viewer
    const machine: TraitStateMachineDefinition = {
        name,
        states,
        currentState,
        transitions: rules.map(r => ({
            from: currentState,
            to: states.find(s => s !== currentState) || currentState,
            event: r.whenEvent,
        })),
    };

    return (
        <VStack className={cn('p-4 rounded-lg bg-card border border-border', className)} gap="sm">
            {/* Object header */}
            <HStack className="items-center" gap="sm">
                <Typography variant="h5">{icon}</Typography>
                <VStack gap="none">
                    <Typography variant="body1" className="text-foreground font-bold">
                        {name}
                    </Typography>
                    <Typography variant="caption" className="text-muted-foreground">
                        {t('eventHandler.state') + ': ' + currentState}
                    </Typography>
                </VStack>
            </HStack>

            {/* State viewer */}
            <TraitStateViewer trait={machine} variant="compact" size="sm" />

            {/* Rules */}
            <VStack gap="xs">
                <Typography variant="body2" className="text-muted-foreground font-medium">
                    {t('eventHandler.rules', { count: rules.length, max: maxRules }) + ':'}
                </Typography>
                {rules.map((rule, i) => (
                    <RuleEditor
                        key={rule.id}
                        rule={rule}
                        availableEvents={availableEvents}
                        availableActions={availableActions}
                        onChange={(r) => handleRuleChange(i, r)}
                        onRemove={() => handleRuleRemove(i)}
                        disabled={disabled}
                    />
                ))}
                {canAdd && !disabled && (
                    <Button variant="ghost" onClick={handleAddRule} className="self-start">
                        {t('eventHandler.addRule')}
                    </Button>
                )}
            </VStack>
        </VStack>
    );
}

ObjectRulePanel.displayName = 'ObjectRulePanel';

export default ObjectRulePanel;
