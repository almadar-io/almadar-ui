/**
 * TraitSlot Component
 *
 * Equippable trait slot with visual feedback for equipped/empty states.
 * Shows TraitStateViewer tooltip on hover for equipped traits.
 */

import React, { useState, useRef } from 'react';
import { Box, Typography, cn } from '@almadar/ui';
import { TraitIcon } from './TraitIcon';
import { TraitStateViewer, TraitStateMachineDefinition } from './TraitStateViewer';
import { useAssetsOptional, DEFAULT_ASSET_MANIFEST, getGameUIPanelUrl } from '../assets';

export interface TraitData {
    id: string;
    name: string;
    category: 'combat' | 'support' | 'utility' | 'passive';
    description?: string;
    iconType?: string;
    /** Optional state machine for tooltip display */
    stateMachine?: TraitStateMachineDefinition;
}

export interface TraitSlotProps {
    /** Slot index (1-based) */
    slotNumber: number;
    /** Currently equipped trait, if any */
    equippedTrait?: TraitData;
    /** Whether slot is locked (requires hero level) */
    locked?: boolean;
    /** Required level to unlock this slot */
    unlockLevel?: number;
    /** Whether slot is selected */
    selected?: boolean;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Show tooltip on hover */
    showTooltip?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Click handler */
    onClick?: () => void;
    /** Handler when trait is dropped on slot */
    onTraitDrop?: (trait: TraitData) => void;
    /** Handler to remove trait from slot */
    onRemove?: () => void;
}

const SIZE_CONFIG = {
    sm: { box: 40, icon: 24, font: 'text-xs' as const },
    md: { box: 56, icon: 32, font: 'text-sm' as const },
    lg: { box: 72, icon: 44, font: 'text-base' as const },
};

const CATEGORY_COLORS = {
    combat: { bg: 'rgba(239,68,68,0.2)', border: '#ef4444' },
    support: { bg: 'rgba(34,197,94,0.2)', border: '#22c55e' },
    utility: { bg: 'rgba(59,130,246,0.2)', border: '#3b82f6' },
    passive: { bg: 'rgba(168,85,247,0.2)', border: '#a855f7' },
};

/**
 * TraitSlot renders an equippable slot for hero traits.
 * Shows trait state machine tooltip on hover.
 */
export function TraitSlot({
    slotNumber,
    equippedTrait,
    locked = false,
    unlockLevel,
    selected = false,
    size = 'md',
    showTooltip = true,
    className,
    onClick,
    onRemove,
}: TraitSlotProps): JSX.Element {
    const [isHovered, setIsHovered] = useState(false);
    const slotRef = useRef<HTMLDivElement>(null);
    const manifest = useAssetsOptional() || DEFAULT_ASSET_MANIFEST;
    const tooltipFrameUrl = getGameUIPanelUrl(manifest, 'tooltipFrame');
    const config = SIZE_CONFIG[size];
    const isEmpty = !equippedTrait;
    const categoryColors = equippedTrait ? CATEGORY_COLORS[equippedTrait.category] : null;

    // Generate a default state machine for tooltip if none provided
    const traitMachine: TraitStateMachineDefinition | null = equippedTrait?.stateMachine || (equippedTrait ? {
        name: equippedTrait.name,
        states: ['idle', 'active', 'cooldown'],
        currentState: 'idle',
        transitions: [
            { from: 'idle', to: 'active', event: 'ACTIVATE' },
            { from: 'active', to: 'cooldown', event: 'USE' },
            { from: 'cooldown', to: 'idle', event: 'RECOVER' },
        ],
        description: equippedTrait.description,
    } : null);

    // Calculate fixed tooltip position from slot's bounding rect
    const getTooltipStyle = (): React.CSSProperties => {
        if (!slotRef.current) return {};
        const rect = slotRef.current.getBoundingClientRect();
        return {
            position: 'fixed' as const,
            left: rect.left + rect.width / 2,
            top: rect.top - 8,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999,
        };
    };

    return (
        <Box
            ref={slotRef}
            display="flex"
            position="relative"
            className={cn(
                'items-center justify-center rounded-lg cursor-pointer transition-all duration-200',
                isEmpty && !locked && 'border-2 border-dashed border-border hover:border-muted-foreground',
                isEmpty && locked && 'border-2 border-dashed border-border opacity-50 cursor-not-allowed',
                !isEmpty && 'border-2',
                selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                onClick && !locked && 'hover:scale-105',
                className
            )}
            style={{
                width: config.box,
                height: config.box,
                backgroundColor: categoryColors?.bg || 'rgba(30,41,59,0.5)',
                borderColor: categoryColors?.border || undefined,
            }}
            onClick={locked ? undefined : onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {locked ? (
                <Box className="text-center">
                    <Typography variant="caption" className="text-muted-foreground">
                        🔒
                    </Typography>
                    {unlockLevel && (
                        <Typography variant="caption" className="text-muted-foreground block text-xs">
                            Lv.{unlockLevel}
                        </Typography>
                    )}
                </Box>
            ) : isEmpty ? (
                <Typography variant="caption" className="text-muted-foreground">
                    +
                </Typography>
            ) : (
                <>
                    <TraitIcon
                        traitId={equippedTrait.iconType || equippedTrait.category}
                        size={config.icon}
                        className="transition-transform hover:scale-110"
                    />

                    {/* Remove button */}
                    {onRemove && (
                        <Box
                            position="absolute"
                            className="-top-1.5 -right-1.5 w-4 h-4 bg-error rounded-full flex items-center justify-center cursor-pointer hover:bg-error/80 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                        >
                            <Typography variant="caption" className="text-foreground text-xs leading-none">
                                ×
                            </Typography>
                        </Box>
                    )}
                </>
            )}

            {/* Slot number indicator */}
            <Box
                position="absolute"
                className="-bottom-1 -left-1 w-4 h-4 bg-card rounded-full flex items-center justify-center border border-border"
            >
                <Typography variant="caption" className="text-muted-foreground text-xs">
                    {slotNumber}
                </Typography>
            </Box>

            {/* Trait State Tooltip (fixed positioning to escape overflow containers) */}
            {showTooltip && isHovered && traitMachine && !isEmpty && (
                <Box
                    className="p-3 bg-background border border-border rounded-lg shadow-xl"
                    style={{
                        ...getTooltipStyle(),
                        minWidth: 200,
                        ...(tooltipFrameUrl ? {
                            borderImage: `url(${tooltipFrameUrl}) 60 fill / 15px / 0 stretch`,
                            border: 'none',
                        } : {}),
                    }}
                >
                    <Typography variant="h6" className="text-foreground mb-2 text-center">
                        {equippedTrait.name}
                    </Typography>
                    {equippedTrait.description && (
                        <Typography variant="caption" className="text-muted-foreground block mb-2 text-center">
                            {equippedTrait.description}
                        </Typography>
                    )}
                    <TraitStateViewer trait={traitMachine} size="sm" />
                    {/* Tooltip arrow */}
                    <Box
                        position="absolute"
                        className="-bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-border"
                    />
                </Box>
            )}
        </Box>
    );
}

export default TraitSlot;

