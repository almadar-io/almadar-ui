/**
 * HeroAvatar Component
 *
 * Hero portrait with level badge - similar to Heroes of Might and Magic style.
 * Displays hero portrait in ornate frame with level indicator.
 */

import React from 'react';
import { Box, Badge, cn } from '@almadar/ui';

// Hero avatar images - referenced from projects/trait-wars/assets/heroes/
// These are copied to the project during build via the export tool
const HERO_AVATARS: Record<string, string> = {
    emperor: '/projects/trait-wars/assets/heroes/emperor.png',
    vane: '/projects/trait-wars/assets/heroes/vane.png',
    tyrant: '/projects/trait-wars/assets/heroes/tyrant.png',
    destroyer: '/projects/trait-wars/assets/heroes/destroyer.png',
    deceiver: '/projects/trait-wars/assets/heroes/deceiver.png',
    zahra: '/projects/trait-wars/assets/heroes/zahra.png',
    kael: '/projects/trait-wars/assets/heroes/kael.png',
    hareth: '/projects/trait-wars/assets/heroes/hareth.png',
    samira: '/projects/trait-wars/assets/heroes/samira.png',
};

// Archetype colors for frame accents
const ARCHETYPE_COLORS: Record<string, { border: string; glow: string }> = {
    innocent: { border: '#f8fafc', glow: 'rgba(248,250,252,0.4)' },
    orphan: { border: '#64748b', glow: 'rgba(100,116,139,0.4)' },
    caregiver: { border: '#22c55e', glow: 'rgba(34,197,94,0.4)' },
    hero: { border: '#ef4444', glow: 'rgba(239,68,68,0.4)' },
    explorer: { border: '#06b6d4', glow: 'rgba(6,182,212,0.4)' },
    rebel: { border: '#f97316', glow: 'rgba(249,115,22,0.4)' },
    lover: { border: '#ec4899', glow: 'rgba(236,72,153,0.4)' },
    creator: { border: '#8b5cf6', glow: 'rgba(139,92,246,0.4)' },
    jester: { border: '#facc15', glow: 'rgba(250,204,21,0.4)' },
    sage: { border: '#3b82f6', glow: 'rgba(59,130,246,0.4)' },
    magician: { border: '#a855f7', glow: 'rgba(168,85,247,0.4)' },
    ruler: { border: '#eab308', glow: 'rgba(234,179,8,0.4)' },
};

export interface HeroAvatarProps {
    /** Hero ID to display avatar for */
    heroId: string;
    /** Hero name for alt text */
    name?: string;
    /** Hero level (displayed as badge) */
    level?: number;
    /** Hero archetype for frame styling */
    archetype?: keyof typeof ARCHETYPE_COLORS;
    /** Size of the avatar ('sm' | 'md' | 'lg' | 'xl') */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Whether hero is selected */
    selected?: boolean;
    /** Whether hero is disabled */
    disabled?: boolean;
    /** Optional custom portrait URL */
    portraitUrl?: string;
    /** Additional CSS classes */
    className?: string;
    /** Click handler */
    onClick?: () => void;
}

const SIZE_CONFIG = {
    sm: { frame: 48, portrait: 40, badge: 'xs' as const },
    md: { frame: 80, portrait: 68, badge: 'sm' as const },
    lg: { frame: 120, portrait: 104, badge: 'md' as const },
    xl: { frame: 160, portrait: 140, badge: 'lg' as const },
};

/**
 * HeroAvatar renders a hero portrait in an ornate frame with level badge.
 * Inspired by Heroes of Might and Magic hero selection UI.
 */
export function HeroAvatar({
    heroId,
    name,
    level,
    archetype = 'hero',
    size = 'md',
    selected = false,
    disabled = false,
    portraitUrl,
    className,
    onClick,
}: HeroAvatarProps): JSX.Element {
    const config = SIZE_CONFIG[size];
    const colors = ARCHETYPE_COLORS[archetype] || ARCHETYPE_COLORS.hero;
    const avatarSrc = portraitUrl || HERO_AVATARS[heroId.toLowerCase()] || HERO_AVATARS.emperor;

    return (
        <Box
            display="inline-block"
            position="relative"
            className={cn(
                'cursor-pointer transition-all duration-200',
                selected && 'ring-2 ring-offset-2 ring-yellow-400 scale-105',
                disabled && 'opacity-50 cursor-not-allowed grayscale',
                onClick && !disabled && 'hover:scale-105',
                className
            )}
            onClick={disabled ? undefined : onClick}
            style={{
                width: config.frame,
                height: config.frame,
            }}
        >
            {/* Ornate Frame */}
            <Box
                position="absolute"
                className="inset-0 rounded-lg"
                style={{
                    border: `3px solid ${colors.border}`,
                    boxShadow: `0 0 12px ${colors.glow}, inset 0 0 8px rgba(0,0,0,0.5)`,
                    background: 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95))',
                }}
            />

            {/* Portrait Image */}
            <Box
                position="absolute"
                className="rounded overflow-hidden"
                style={{
                    top: (config.frame - config.portrait) / 2,
                    left: (config.frame - config.portrait) / 2,
                    width: config.portrait,
                    height: config.portrait,
                }}
            >
                <img
                    src={avatarSrc}
                    alt={name || heroId}
                    className="w-full h-full object-cover"
                    style={{
                        imageRendering: 'auto',
                    }}
                />
            </Box>

            {/* Level Badge */}
            {level !== undefined && level > 0 && (
                <Box
                    position="absolute"
                    className="-bottom-1 -right-1"
                >
                    <Badge
                        variant="solid"
                        colorScheme="yellow"
                        size={config.badge}
                    >
                        {level}
                    </Badge>
                </Box>
            )}

            {/* Corner Decorations (for larger sizes) */}
            {size !== 'sm' && (
                <>
                    <Box
                        position="absolute"
                        className="top-0 left-0 w-2 h-2"
                        style={{
                            background: colors.border,
                            clipPath: 'polygon(0 0, 100% 0, 0 100%)',
                        }}
                    />
                    <Box
                        position="absolute"
                        className="top-0 right-0 w-2 h-2"
                        style={{
                            background: colors.border,
                            clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
                        }}
                    />
                    <Box
                        position="absolute"
                        className="bottom-0 left-0 w-2 h-2"
                        style={{
                            background: colors.border,
                            clipPath: 'polygon(0 0, 0 100%, 100% 100%)',
                        }}
                    />
                    <Box
                        position="absolute"
                        className="bottom-0 right-0 w-2 h-2"
                        style={{
                            background: colors.border,
                            clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                        }}
                    />
                </>
            )}
        </Box>
    );
}

export default HeroAvatar;
