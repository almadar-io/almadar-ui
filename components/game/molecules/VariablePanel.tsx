/**
 * VariablePanel Component
 *
 * Shows a machine's variables and their current values during State Architect
 * playback. Dumb molecule: takes a plain typed list of { name, value } — the
 * .lolo organism owns the entity data and passes it already flattened.
 *
 * @packageDocumentation
 */

import React from 'react';
import { VStack, HStack, Typography } from '../../core/atoms/index';
import { cn } from '../../../lib/cn';
import { useTranslate } from '../../../hooks/useTranslate';

/** A single variable row (already flattened by the .lolo — plain strings). */
export interface VariablePanelVariable {
    name: string;
    value: string;
}

export interface VariablePanelProps {
    /** Entity name shown in the header */
    entityName: string;
    /** Variable rows to display */
    variables: VariablePanelVariable[];
    /** Additional CSS classes */
    className?: string;
}

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
            {(variables ?? []).map(v => (
                <HStack key={v.name} className="items-center justify-between">
                    <Typography variant="caption" className="text-foreground font-medium">
                        {v.name}
                    </Typography>
                    <Typography variant="caption" className="text-accent font-mono">
                        {v.value}
                    </Typography>
                </HStack>
            ))}
        </VStack>
    );
}

VariablePanel.displayName = 'VariablePanel';

export default VariablePanel;
