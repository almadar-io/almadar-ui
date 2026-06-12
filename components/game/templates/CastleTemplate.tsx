/**
 * CastleTemplate
 *
 * Thin declarative wrapper around CastleBoard organism.
 * All game logic (hover state, feature selection, etc.) lives in CastleBoard.
 *
 * Compliant with Almadar_Templates.md: no hooks, no callbacks, entity-only data flow.
 *
 * @packageDocumentation
 */

import React from 'react';
import type { EntityRow } from '@almadar/core';
import type { TemplateProps } from '../../core/templates/types';
import { CastleBoard } from '../organisms/CastleBoard';

// Re-export the surviving UI value type (entity type was collapsed to EntityRow).
export type { CastleSlotContext } from '../organisms/CastleBoard';

// =============================================================================
// Template Props
// =============================================================================

export interface CastleTemplateProps extends TemplateProps {
    /** Canvas render scale */
    scale?: number;
}

// =============================================================================
// Template
// =============================================================================

export function CastleTemplate({
    entity,
    scale = 0.45,
    className,
}: CastleTemplateProps): React.JSX.Element | null {
    const resolved = (entity && typeof entity === 'object' && !Array.isArray(entity)) ? entity as EntityRow : undefined;
    if (!resolved) return null;
    return (
        <CastleBoard
            entity={resolved}
            scale={scale}
            featureClickEvent="FEATURE_CLICK"
            unitClickEvent="UNIT_CLICK"
            tileClickEvent="TILE_CLICK"
            className={className}
        />
    );
}

CastleTemplate.displayName = 'CastleTemplate';

export default CastleTemplate;
