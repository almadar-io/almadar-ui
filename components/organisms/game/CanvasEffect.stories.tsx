import type { Meta, StoryObj } from '@storybook/react-vite';
import { CanvasEffect } from './CanvasEffect';
import type { CombatActionType } from './CanvasEffect';

const meta: Meta<typeof CanvasEffect> = {
    title: 'Organisms/Game/CanvasEffect',
    component: CanvasEffect,
    parameters: {
        layout: 'fullscreen',
    },
    decorators: [
        (Story) => (
            <div style={{
                width: '100%',
                height: '400px',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <span style={{ color: '#334155', fontSize: '0.875rem', position: 'absolute', top: 16, left: 16 }}>
                    Canvas backdrop (effect plays at center)
                </span>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// Individual action stories
// =============================================================================

export const Melee: Story = {
    args: { actionType: 'melee', x: 400, y: 200, duration: 1200 },
};

export const Ranged: Story = {
    args: { actionType: 'ranged', x: 400, y: 200, duration: 1000 },
};

export const Magic: Story = {
    args: { actionType: 'magic', x: 400, y: 200, duration: 1400 },
};

export const Heal: Story = {
    args: { actionType: 'heal', x: 400, y: 200, duration: 1000 },
};

export const Critical: Story = {
    args: { actionType: 'critical', x: 400, y: 200, intensity: 1.8, duration: 1500 },
};

export const AreaOfEffect: Story = {
    args: { actionType: 'aoe', x: 400, y: 200, intensity: 2, duration: 1600 },
};

export const Shield: Story = {
    args: { actionType: 'shield', x: 400, y: 200, duration: 1200 },
};

export const Buff: Story = {
    args: { actionType: 'buff', x: 400, y: 200, duration: 1000 },
};

export const Debuff: Story = {
    args: { actionType: 'debuff', x: 400, y: 200, duration: 1000 },
};

// =============================================================================
// Combination stories
// =============================================================================

/** All 9 effect types displayed at once */
export const AllEffects: Story = {
    render: () => {
        const types: CombatActionType[] = [
            'melee', 'ranged', 'magic', 'heal', 'buff', 'debuff', 'shield', 'aoe', 'critical',
        ];
        return (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {types.map((type, i) => {
                    const col = i % 3;
                    const row = Math.floor(i / 3);
                    return (
                        <div key={type} style={{ position: 'absolute', left: 100 + col * 250, top: 60 + row * 120 }}>
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem', position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)' }}>
                                {type}
                            </span>
                            <CanvasEffect
                                actionType={type}
                                x={0}
                                y={0}
                                duration={60000}
                                intensity={1.2}
                            />
                        </div>
                    );
                })}
            </div>
        );
    },
};

/** High-intensity critical hit */
export const HighIntensity: Story = {
    args: { actionType: 'critical', x: 400, y: 200, intensity: 3, duration: 2000 },
};

/** Demonstrates remote sprite-based effect rendering.
 *  When effectSpriteUrl is provided, a sprite image replaces the emoji. */
export const RemoteSprite: Story = {
    args: {
        actionType: 'melee',
        x: 400,
        y: 200,
        duration: 60000,
        intensity: 2,
        effectSpriteUrl: '/effects/particles/slash_01.png',
        assetBaseUrl: 'https://trait-wars-assets.web.app',
    },
};

/** All 9 effects with remote sprites from Firebase CDN */
export const AllRemoteSprites: Story = {
    render: () => {
        const BASE = 'https://trait-wars-assets.web.app';
        const spriteMap: Record<CombatActionType, string> = {
            melee: '/effects/particles/slash_01.png',
            ranged: '/effects/particles/muzzle_01.png',
            magic: '/effects/particles/magic_01.png',
            heal: '/effects/particles/light_01.png',
            buff: '/effects/particles/twirl_01.png',
            debuff: '/effects/particles/scorch_01.png',
            shield: '/effects/particles/star_01.png',
            aoe: '/effects/flash/flash00.png',
            critical: '/effects/particles/flame_01.png',
        };
        const types = Object.keys(spriteMap) as CombatActionType[];
        return (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {types.map((type, i) => {
                    const col = i % 3;
                    const row = Math.floor(i / 3);
                    return (
                        <div key={type} style={{ position: 'absolute', left: 100 + col * 250, top: 60 + row * 120 }}>
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem', position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)' }}>
                                {type}
                            </span>
                            <CanvasEffect
                                actionType={type}
                                x={0}
                                y={0}
                                duration={60000}
                                intensity={1.2}
                                effectSpriteUrl={spriteMap[type]}
                                assetBaseUrl={BASE}
                            />
                        </div>
                    );
                })}
            </div>
        );
    },
};
