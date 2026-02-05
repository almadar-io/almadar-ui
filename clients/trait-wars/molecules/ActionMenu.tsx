/**
 * ActionMenu Molecule
 *
 * Contextual action menu for available unit actions.
 * Uses Box, Button, and Icon components.
 */

import React from 'react';
import { cn } from '@almadar/ui';
import { Box } from '@almadar/ui';
import { Button } from '@almadar/ui';
import { Icon } from '@almadar/ui';
import { Card } from '@almadar/ui';
import { Typography } from '@almadar/ui';
import { Sword, Shield, Heart, Move, X, Target, LucideIcon } from 'lucide-react';

export interface GameAction {
    id: string;
    label: string;
    icon?: LucideIcon;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    disabled?: boolean;
    description?: string;
}

export interface ActionMenuProps {
    /** Available actions */
    actions: GameAction[];
    /** Menu position (for positioning on screen) */
    position?: { x: number; y: number };
    /** Handler for action selection */
    onAction: (actionId: string) => void;
    /** Handler for cancel/close */
    onCancel: () => void;
    /** Layout orientation */
    orientation?: 'vertical' | 'horizontal' | 'radial';
    /** Additional CSS classes */
    className?: string;
    /** Title for the menu */
    title?: string;
}

// Default action icons
const defaultIcons: Record<string, LucideIcon> = {
    attack: Sword,
    defend: Shield,
    heal: Heart,
    move: Move,
    cancel: X,
    target: Target,
};

export function ActionMenu({
    actions,
    position,
    onAction,
    onCancel,
    orientation = 'vertical',
    className,
    title,
}: ActionMenuProps): JSX.Element {
    const positionStyle = position
        ? {
            position: 'absolute' as const,
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -50%)',
        }
        : {};

    return (
        <Card
            variant="elevated"
            className={cn(
                'shadow-lg z-50',
                orientation === 'horizontal' && 'flex-row',
                className
            )}
            style={positionStyle}
        >
            <Box padding="sm">
                {/* Title */}
                {title && (
                    <Box display="flex" className="items-center justify-between mb-2">
                        <Typography variant="body2" className="font-bold">
                            {title}
                        </Typography>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onCancel}
                            leftIcon={<X className="h-4 w-4" />}
                        />
                    </Box>
                )}

                {/* Actions */}
                <Box
                    display="flex"
                    className={cn(
                        'gap-1',
                        orientation === 'vertical' && 'flex-col',
                        orientation === 'horizontal' && 'flex-row',
                        orientation === 'radial' && 'flex-wrap justify-center'
                    )}
                >
                    {actions.map((action) => {
                        const ActionIcon = action.icon || defaultIcons[action.id.toLowerCase()];

                        return (
                            <Button
                                key={action.id}
                                variant={action.variant || 'secondary'}
                                size="sm"
                                onClick={() => onAction(action.id)}
                                disabled={action.disabled}
                                leftIcon={ActionIcon && <ActionIcon className="h-4 w-4" />}
                                className={cn(
                                    orientation === 'vertical' && 'w-full justify-start',
                                    orientation === 'radial' && 'flex-1 min-w-[80px]'
                                )}
                            >
                                {action.label}
                            </Button>
                        );
                    })}
                </Box>
            </Box>
        </Card>
    );
}

ActionMenu.displayName = 'ActionMenu';

export default ActionMenu;
