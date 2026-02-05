import type { Meta, StoryObj } from '@storybook/react';
import { HeroAvatar } from './HeroAvatar';
import { Box, HStack, VStack, Typography } from '@almadar/ui';

const meta: Meta<typeof HeroAvatar> = {
    title: 'Trait Wars/Atoms/HeroAvatar',
    component: HeroAvatar,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
    },
    argTypes: {
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg', 'xl'],
        },
        archetype: {
            control: 'select',
            options: ['innocent', 'orphan', 'caregiver', 'hero', 'explorer', 'rebel', 'lover', 'creator', 'jester', 'sage', 'magician', 'ruler'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof HeroAvatar>;

export const Default: Story = {
    args: {
        heroId: 'emperor',
        name: 'The Emperor',
        level: 5,
        archetype: 'ruler',
        size: 'lg',
    },
};

export const AllHeroes: Story = {
    render: () => (
        <VStack gap={6}>
            <Typography variant="h4" className="text-white">Iram Empire Heroes</Typography>
            <HStack gap={4} wrap="wrap">
                <HeroAvatar heroId="emperor" name="The Emperor" level={10} archetype="ruler" size="lg" />
                <HeroAvatar heroId="vane" name="Commander Vane" level={8} archetype="hero" size="lg" />
                <HeroAvatar heroId="tyrant" name="Unit 000" level={7} archetype="rebel" size="lg" />
                <HeroAvatar heroId="destroyer" name="Unit 666" level={6} archetype="hero" size="lg" />
                <HeroAvatar heroId="deceiver" name="Unit 999" level={5} archetype="magician" size="lg" />
            </HStack>

            <Typography variant="h4" className="text-white">Arch Heroes</Typography>
            <HStack gap={4} wrap="wrap">
                <HeroAvatar heroId="zahra" name="Zahra" level={6} archetype="sage" size="lg" />
                <HeroAvatar heroId="kael" name="Kael" level={4} archetype="orphan" size="lg" />
                <HeroAvatar heroId="hareth" name="Hareth" level={5} archetype="hero" size="lg" />
                <HeroAvatar heroId="samira" name="Samira" level={3} archetype="creator" size="lg" />
            </HStack>
        </VStack>
    ),
};

export const AllSizes: Story = {
    render: () => (
        <HStack gap={4} align="end">
            <VStack align="center">
                <HeroAvatar heroId="emperor" level={5} archetype="ruler" size="sm" />
                <Typography variant="caption" className="text-gray-400">Small</Typography>
            </VStack>
            <VStack align="center">
                <HeroAvatar heroId="emperor" level={5} archetype="ruler" size="md" />
                <Typography variant="caption" className="text-gray-400">Medium</Typography>
            </VStack>
            <VStack align="center">
                <HeroAvatar heroId="emperor" level={5} archetype="ruler" size="lg" />
                <Typography variant="caption" className="text-gray-400">Large</Typography>
            </VStack>
            <VStack align="center">
                <HeroAvatar heroId="emperor" level={5} archetype="ruler" size="xl" />
                <Typography variant="caption" className="text-gray-400">XL</Typography>
            </VStack>
        </HStack>
    ),
};

export const SelectedState: Story = {
    render: () => (
        <HStack gap={4}>
            <HeroAvatar heroId="zahra" level={6} archetype="sage" size="lg" />
            <HeroAvatar heroId="zahra" level={6} archetype="sage" size="lg" selected />
            <HeroAvatar heroId="zahra" level={6} archetype="sage" size="lg" disabled />
        </HStack>
    ),
};

export const ArchetypeColors: Story = {
    render: () => (
        <Box className="grid grid-cols-4 gap-4">
            {['innocent', 'orphan', 'caregiver', 'hero', 'explorer', 'rebel', 'lover', 'creator', 'jester', 'sage', 'magician', 'ruler'].map((type) => (
                <VStack key={type} align="center" gap={2}>
                    <HeroAvatar heroId="emperor" level={1} archetype={type as any} size="md" />
                    <Typography variant="caption" className="text-gray-400 capitalize">{type}</Typography>
                </VStack>
            ))}
        </Box>
    ),
};
