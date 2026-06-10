import type { Meta, StoryObj } from '@storybook/react-vite';
import { PatternTile, getTileDimensions } from './PatternTile';
import type { PatternVariant } from './PatternTile';
import React from 'react';

/** Helper: renders a PatternTile inside a tiling SVG so the pattern is visible */
function TilePreview({
    variant = 'star8',
    size = 60,
    color = 'var(--color-primary)',
    strokeWidth = 0.5,
}: {
    variant?: PatternVariant;
    size?: number;
    color?: string;
    strokeWidth?: number;
}) {
    const dims = getTileDimensions(variant, size);
    const id = `preview-${variant}`;
    return (
        <svg width={400} height={400} style={{ border: '1px solid var(--color-border)' }}>
            <defs>
                <pattern
                    id={id}
                    width={dims.width}
                    height={dims.height}
                    patternUnits="userSpaceOnUse"
                >
                    <PatternTile
                        variant={variant}
                        size={size}
                        color={color}
                        strokeWidth={strokeWidth}
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${id})`} />
        </svg>
    );
}

const meta: Meta<typeof TilePreview> = {
    title: 'Marketing/Atoms/PatternTile',
    component: TilePreview,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['star8', 'star6', 'khatam'],
        },
        size: { control: { type: 'range', min: 30, max: 120, step: 10 } },
        strokeWidth: { control: { type: 'range', min: 0.25, max: 3, step: 0.25 } },
        color: { control: 'color' },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Star8: Story = {
    args: { variant: 'star8', size: 60, strokeWidth: 0.5 },
};

export const Star6: Story = {
    args: { variant: 'star6', size: 60, strokeWidth: 0.5 },
};

export const Khatam: Story = {
    args: { variant: 'khatam', size: 60, strokeWidth: 0.5 },
};

export const LargeScale: Story = {
    args: { variant: 'star8', size: 100, strokeWidth: 1 },
};

export const SmallScale: Story = {
    args: { variant: 'star8', size: 30, strokeWidth: 0.3 },
};
