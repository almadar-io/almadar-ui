// ⛔ SLATED-FOR-DELETION-67 — orphaned by the .lolo board decomposition. Delete after runtime-verify confirms the ui-*-board.lolo compositions render. See docs/Almadar_Std_Game_Board_Deletion_Manifest.md
/**
 * VariablePanel Component
 *
 * Shows entity variables and their current values during State Architect playback.
 *
 * @packageDocumentation
 */

import React from 'react';
import type { EntityRow, FieldValue } from '@almadar/core';
import { VStack, HStack, Typography, ProgressBar } from '../../../core/atoms/index';
import { cn } from '../../../../lib/cn';
import { useTranslate } from '../../../../hooks/useTranslate';

export interface VariablePanelProps {
    /** Entity name */
    entityName: string;
    /** Variable rows to display (`EntityRow` carrying name/value/min/max/unit) */
    variables: readonly EntityRow[];
    /** Additional CSS classes */
    className?: string;
}

const numField = (v: FieldValue | undefined, fallback = 0): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
};

export function VariablePanel({
    entityName,
    variables,
    className,
}: VariablePanelProps): React.JSX.Element {
    const { t } = useTranslate();
    return (
        <VStack className={cn('p-3 rounded-lg bg-card border border-border', className)} gap="sm">
            <Typography variant="body2" className="text-muted-foreground font-medium">
                {t('stateArchitect.variables', { name: entityName })}
            </Typography>
            {variables.map(v => {
                const name = v.name == null ? '' : String(v.name);
                const value = numField(v.value);
                const max = numField(v.max, 100);
                const min = numField(v.min, 0);
                const unit = v.unit == null ? '' : String(v.unit);
                const pct = Math.round(((value - min) / (max - min)) * 100);
                const isHigh = pct > 80;
                const isLow = pct < 20;

                return (
                    <VStack key={name} gap="none">
                        <HStack className="items-center justify-between">
                            <Typography variant="caption" className="text-foreground font-medium">
                                {name}
                            </Typography>
                            <Typography variant="caption" className={cn(
                                isHigh ? 'text-error' : isLow ? 'text-warning' : 'text-foreground',
                            )}>
                                {value}{unit} / {max}{unit}
                            </Typography>
                        </HStack>
                        <ProgressBar
                            value={pct}
                            color={isHigh ? 'danger' : isLow ? 'warning' : 'primary'}
                            size="sm"
                        />
                    </VStack>
                );
            })}
        </VStack>
    );
}

VariablePanel.displayName = 'VariablePanel';

export default VariablePanel;
