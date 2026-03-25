'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Carousel } from './Carousel';
import { Box } from '../atoms/Box';
import { Typography } from '../atoms/Typography';

interface ColorSlide {
  color: string;
  label: string;
}

const colorSlides: ColorSlide[] = [
  { color: '#3b82f6', label: 'Slide 1' },
  { color: '#10b981', label: 'Slide 2' },
  { color: '#f59e0b', label: 'Slide 3' },
  { color: '#ef4444', label: 'Slide 4' },
];

function renderColorSlide(item: ColorSlide, index: number): React.ReactNode {
  return (
    <Box
      display="flex"
      className="items-center justify-center h-64 w-full rounded-md"
      style={{ backgroundColor: item.color }}
    >
      <Typography variant="h3" className="text-white font-bold">
        {item.label} (#{index + 1})
      </Typography>
    </Box>
  );
}

const meta: Meta<typeof Carousel<ColorSlide>> = {
  title: 'Molecules/Carousel',
  component: Carousel,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  argTypes: {
    autoPlay: { control: 'boolean' },
    autoPlayInterval: { control: { type: 'number', min: 1000, max: 10000, step: 500 } },
    showDots: { control: 'boolean' },
    showArrows: { control: 'boolean' },
    loop: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: colorSlides,
    renderItem: renderColorSlide,
    showDots: true,
    showArrows: true,
  },
};

export const WithArrows: Story = {
  args: {
    items: colorSlides,
    renderItem: renderColorSlide,
    showArrows: true,
    showDots: true,
  },
};

export const AutoPlay: Story = {
  args: {
    items: colorSlides,
    renderItem: renderColorSlide,
    autoPlay: true,
    autoPlayInterval: 3000,
    showDots: true,
    showArrows: true,
  },
};

export const Loop: Story = {
  args: {
    items: colorSlides,
    renderItem: renderColorSlide,
    loop: true,
    showDots: true,
    showArrows: true,
  },
};
