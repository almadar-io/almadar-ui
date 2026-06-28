import React, { useState } from 'react';
import { VStack, HStack, Box, Typography, Button } from '../../../core/atoms/index';
import { JsonObject } from '@almadar/core';
import { cn } from '../../../../lib/cn';
import { useTranslate } from '../../../../hooks/useTranslate';

export interface StateJsonViewProps {
    /** JSON data to display */
    data: JsonObject;
    /** Label */
    label?: string;
    /** Whether the code is expanded by default */
    defaultExpanded?: boolean;
    /** Additional CSS classes */
    className?: string;
}

export function StateJsonView({
    data,
    label,
    defaultExpanded = false,
    className,
}: StateJsonViewProps): React.JSX.Element {
    const { t } = useTranslate();
    const [expanded, setExpanded] = useState(defaultExpanded);
    const jsonString = JSON.stringify(data, null, 2);

    return (
        <VStack className={cn('rounded-lg border border-border overflow-hidden', className)} gap="none">
            <HStack className="items-center justify-between p-2 bg-muted" gap="sm">
                <Typography variant="caption" className="text-muted-foreground font-medium">
                    {label ?? t('stateArchitect.viewCode')}
                </Typography>
                <Button variant="ghost" onClick={() => setExpanded(!expanded)} className="text-xs">
                    {expanded ? t('stateArchitect.hideJson') : t('stateArchitect.showJson')}
                </Button>
            </HStack>
            {expanded && (
                <Box className="p-3 bg-background overflow-x-auto">
                    <Typography
                        variant="caption"
                        className="text-foreground font-mono whitespace-pre text-xs leading-relaxed block"
                    >
                        {jsonString}
                    </Typography>
                </Box>
            )}
        </VStack>
    );
}

StateJsonView.displayName = 'StateJsonView';

export default StateJsonView;
