/**
 * CityBuilderTemplate
 *
 * Thin template wrapper: titled header + CityBuilderBoard.
 * All game state is driven by the entity prop (passed through from the orbital trait).
 */

import React from 'react';
import type { EntityRow, EventEmit } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { Box } from '../../core/atoms/Box';
import { HStack } from '../../core/atoms/Stack';
import { Typography } from '../../core/atoms/Typography';
import type { TemplateProps } from '../../core/templates/types';
import { CityBuilderBoard } from './CityBuilderBoard';
import type {
    CityBuilderBoardProps,
    CityBuilderTile,
    CityBuilderBuilding,
    CityBuilderBuildType,
} from './CityBuilderBoard';

/** Narrow a template entity union to a single EntityRow without a cast. */
function isEntityRow(value: CityBuilderTemplateProps['entity']): value is EntityRow {
    return value != null && typeof value === 'object' && !Array.isArray(value);
}

export interface CityBuilderTemplateProps extends TemplateProps {
    title?: string;
    tiles?: CityBuilderTile[];
    buildings?: CityBuilderBuilding[];
    buildTypes?: CityBuilderBuildType[];
    pendingBuildType?: string;
    assetManifest?: CityBuilderBoardProps['assetManifest'];
    gold?: number;
    wood?: number;
    population?: number;
    result?: 'none' | 'won' | 'lost';
    scale?: number;
    unitScale?: number;
    selectBuildTypeEvent?: EventEmit<{ buildType: string }>;
    placeBuildingEvent?: EventEmit<{ x: number; y: number }>;
    gameEndEvent?: EventEmit<{ result: 'won' | 'lost' }>;
    className?: string;
}

export function CityBuilderTemplate({
    entity,
    title = 'City Builder',
    tiles,
    buildings,
    buildTypes,
    pendingBuildType,
    assetManifest,
    gold,
    wood,
    population,
    result,
    scale,
    unitScale,
    selectBuildTypeEvent,
    placeBuildingEvent,
    gameEndEvent,
    className,
}: CityBuilderTemplateProps): React.JSX.Element {
    const resolved = isEntityRow(entity) ? entity : undefined;

    return (
        <Box
            display="flex"
            fullHeight
            className={cn('city-builder-template flex-col', className)}
        >
            {/* Header */}
            <HStack
                gap="sm"
                align="center"
                className="px-4 py-3 border-b-2 border-border bg-surface shrink-0"
            >
                <Typography variant="h4">{title}</Typography>
            </HStack>

            {/* Board fills remaining space */}
            <Box className="flex-1 relative overflow-hidden">
                <CityBuilderBoard
                    entity={resolved}
                    tiles={tiles}
                    buildings={buildings}
                    buildTypes={buildTypes}
                    pendingBuildType={pendingBuildType}
                    assetManifest={assetManifest}
                    gold={gold}
                    wood={wood}
                    population={population}
                    result={result}
                    scale={scale}
                    unitScale={unitScale}
                    selectBuildTypeEvent={selectBuildTypeEvent}
                    placeBuildingEvent={placeBuildingEvent}
                    gameEndEvent={gameEndEvent}
                    className="h-full"
                />
            </Box>
        </Box>
    );
}

CityBuilderTemplate.displayName = 'CityBuilderTemplate';

export default CityBuilderTemplate;
