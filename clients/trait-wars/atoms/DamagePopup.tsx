/**
 * DamagePopup Component
 * 
 * Floating damage numbers that animate upward and fade out.
 */

import React, { useEffect, useState } from 'react';
import { Box } from '../../../components/atoms/Box';
import { cn } from '../../../lib/cn';

export interface DamagePopupProps {
    /** Damage amount to display */
    amount: number;
    /** Position on screen */
    x: number;
    y: number;
    /** Damage type for styling */
    type?: 'physical' | 'magic' | 'heal' | 'critical';
    /** Callback when animation completes */
    onComplete?: () => void;
    /** Additional CSS classes */
    className?: string;
}

const typeStyles = {
    physical: 'text-red-400',
    magic: 'text-purple-400',
    heal: 'text-green-400',
    critical: 'text-yellow-400 text-2xl font-black',
};

export function DamagePopup({
    amount,
    x,
    y,
    type = 'physical',
    onComplete,
    className,
}: DamagePopupProps): JSX.Element | null {
    const [visible, setVisible] = useState(true);
    const [offset, setOffset] = useState(0);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        // Animate upward
        const animationInterval = setInterval(() => {
            setOffset(prev => prev + 2);
            setOpacity(prev => Math.max(0, prev - 0.05));
        }, 50);

        // Remove after animation
        const timeout = setTimeout(() => {
            setVisible(false);
            onComplete?.();
        }, 1000);

        return () => {
            clearInterval(animationInterval);
            clearTimeout(timeout);
        };
    }, [onComplete]);

    if (!visible) return null;

    const displayText = type === 'heal' ? `+${amount}` : `-${amount}`;
    const isCritical = type === 'critical';

    return (
        <Box
            className={cn(
                'fixed pointer-events-none font-bold text-lg z-50',
                'drop-shadow-lg',
                typeStyles[type],
                isCritical && 'animate-bounce',
                className
            )}
            style={{
                left: x,
                top: y - offset,
                opacity,
                transform: 'translateX(-50%)',
            }}
        >
            {isCritical && '💥 '}
            {displayText}
            {isCritical && ' 💥'}
        </Box>
    );
}

export default DamagePopup;
