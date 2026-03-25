import type { Meta, StoryObj } from '@storybook/react-vite';
import { GeometricPattern } from './GeometricPattern';
import { Typography } from '../atoms/Typography';
import { VStack } from '../atoms/Stack';
import { Box } from '../atoms/Box';
import React from 'react';

const meta: Meta<typeof GeometricPattern> = {
    title: 'Molecules/GeometricPattern',
    component: GeometricPattern,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['star8', 'star6', 'khatam'],
        },
        mode: {
            control: 'select',
            options: ['background', 'left', 'right', 'frame'],
        },
        opacity: { control: { type: 'range', min: 0.01, max: 0.5, step: 0.01 } },
        scale: { control: { type: 'range', min: 0.5, max: 3, step: 0.1 } },
        strokeWidth: { control: { type: 'range', min: 0.25, max: 2, step: 0.25 } },
        color: { control: 'color' },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Background: Story = {
    args: {
        variant: 'star8',
        mode: 'background',
        opacity: 0.08,
        scale: 1,
    },
    render: (args) => (
        <Box className="relative w-full" style={{ minHeight: 400, background: 'var(--color-background)' }}>
            <GeometricPattern {...args} />
            <VStack gap="md" align="center" className="relative z-10 p-12">
                <Typography variant="h2">Background Mode</Typography>
                <Typography variant="body1" color="muted">
                    Pattern tiles behind content as a full background fill.
                </Typography>
            </VStack>
        </Box>
    ),
};

export const FadeLeft: Story = {
    args: {
        variant: 'star8',
        mode: 'left',
        opacity: 0.1,
        scale: 1,
    },
    render: (args) => (
        <Box className="relative w-full" style={{ minHeight: 400, background: 'var(--color-background)' }}>
            <GeometricPattern {...args} />
            <VStack gap="md" align="center" className="relative z-10 p-12">
                <Typography variant="h2">Left Fade Mode</Typography>
                <Typography variant="body1" color="muted">
                    Pattern visible on the left, fading toward the right.
                </Typography>
            </VStack>
        </Box>
    ),
};

export const FadeRight: Story = {
    args: {
        variant: 'khatam',
        mode: 'right',
        opacity: 0.1,
        scale: 1,
    },
    render: (args) => (
        <Box className="relative w-full" style={{ minHeight: 400, background: 'var(--color-background)' }}>
            <GeometricPattern {...args} />
            <VStack gap="md" align="center" className="relative z-10 p-12">
                <Typography variant="h2">Right Fade Mode</Typography>
                <Typography variant="body1" color="muted">
                    Pattern visible on the right, fading toward the left.
                </Typography>
            </VStack>
        </Box>
    ),
};

export const Frame: Story = {
    args: {
        variant: 'star8',
        mode: 'frame',
        opacity: 0.1,
        scale: 1,
    },
    render: (args) => (
        <Box style={{ background: 'var(--color-background)', padding: '2rem' }}>
            <GeometricPattern {...args}>
                <VStack gap="md" align="center" className="p-12">
                    <Typography variant="h2">Frame Mode</Typography>
                    <Typography variant="body1" color="muted">
                        Decorative pattern strips above and below content.
                    </Typography>
                </VStack>
            </GeometricPattern>
        </Box>
    ),
};

export const AllVariants: Story = {
    render: () => (
        <VStack gap="xl" className="p-8" style={{ background: 'var(--color-background)' }}>
            {(['star8', 'star6', 'khatam'] as const).map((v) => (
                <Box key={v} className="relative w-full" style={{ minHeight: 200 }}>
                    <GeometricPattern variant={v} mode="background" opacity={0.1} />
                    <VStack gap="sm" align="center" className="relative z-10 p-8">
                        <Typography variant="h3">{v}</Typography>
                    </VStack>
                </Box>
            ))}
        </VStack>
    ),
};

export const DarkBackground: Story = {
    args: {
        variant: 'star8',
        mode: 'background',
        opacity: 0.06,
    },
    render: (args) => (
        <Box
            className="relative w-full"
            style={{ minHeight: 400, background: '#0f172a', color: '#f1f5f9' }}
        >
            <GeometricPattern {...args} color="#14b8a6" />
            <VStack gap="md" align="center" className="relative z-10 p-12">
                <Typography variant="h2">Dark Background</Typography>
                <Typography variant="body1">
                    Teal pattern on midnight blue, matching the Almadar brand.
                </Typography>
            </VStack>
        </Box>
    ),
};

export const GoldAccent: Story = {
    args: {
        variant: 'khatam',
        mode: 'left',
        opacity: 0.08,
    },
    render: (args) => (
        <Box
            className="relative w-full"
            style={{ minHeight: 400, background: '#0f172a', color: '#f1f5f9' }}
        >
            <GeometricPattern {...args} color="#c9a227" />
            <VStack gap="md" align="center" className="relative z-10 p-12">
                <Typography variant="h2">Gold Accent</Typography>
                <Typography variant="body1">
                    Sand gold pattern for special emphasis sections.
                </Typography>
            </VStack>
        </Box>
    ),
};
