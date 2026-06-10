'use client';

import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack, HStack, VStack } from "./Stack";
import { Box } from "./Box";
import { Typography } from "./Typography";

const meta: Meta<typeof Stack> = {
  title: "Core/Atoms/Stack",
  component: Stack,
  parameters: {
    layout: "padded",
    backgrounds: { default: "wireframe" },
  },
  tags: ["autodocs"],
  argTypes: {
    direction: { control: "select", options: ["horizontal", "vertical"] },
    gap: { control: "select", options: ["none", "xs", "sm", "md", "lg", "xl", "2xl"] },
    align: { control: "select", options: ["start", "center", "end", "stretch", "baseline"] },
    justify: { control: "select", options: ["start", "center", "end", "between", "around", "evenly"] },
    responsive: { control: "boolean" },
    wrap: { control: "boolean" },
    reverse: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const ColorBox: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <Box
    padding="md"
    rounded="md"
    className={`${color} min-w-[100px] text-center`}
  >
    <Typography variant="body" className="font-semibold text-white">{label}</Typography>
  </Box>
);

export const HorizontalDefault: Story = {
  args: {
    direction: "horizontal",
    gap: "md",
  },
  render: (args) => (
    <Stack {...args}>
      <ColorBox color="bg-blue-500" label="Item 1" />
      <ColorBox color="bg-green-500" label="Item 2" />
      <ColorBox color="bg-purple-500" label="Item 3" />
    </Stack>
  ),
};

export const VerticalDefault: Story = {
  args: {
    direction: "vertical",
    gap: "md",
  },
  render: (args) => (
    <Stack {...args}>
      <ColorBox color="bg-blue-500" label="Item 1" />
      <ColorBox color="bg-green-500" label="Item 2" />
      <ColorBox color="bg-purple-500" label="Item 3" />
    </Stack>
  ),
};

export const ResponsiveHStack: Story = {
  name: "HStack responsive (resize to test)",
  render: () => (
    <VStack gap="lg">
      <Typography variant="h4">Responsive HStack: horizontal on desktop, vertical below 768px</Typography>
      <Typography variant="caption" color="secondary">
        Resize the viewport below 768px to see it flip to vertical.
      </Typography>
      <HStack gap="md" responsive>
        <Box padding="lg" rounded="md" className="bg-blue-500 flex-1">
          <Typography variant="body" className="text-white font-semibold">Left Panel</Typography>
          <Typography variant="caption" className="text-blue-100">This stays on the left on desktop</Typography>
        </Box>
        <Box padding="lg" rounded="md" className="bg-green-500 flex-1">
          <Typography variant="body" className="text-white font-semibold">Right Panel</Typography>
          <Typography variant="caption" className="text-green-100">Stacks below on mobile</Typography>
        </Box>
      </HStack>
    </VStack>
  ),
};

export const ResponsiveThreeColumn: Story = {
  name: "Responsive 3-column layout",
  render: () => (
    <HStack gap="md" responsive>
      <Box padding="lg" rounded="md" className="bg-indigo-500 flex-1">
        <Typography variant="body" className="text-white font-semibold">Column 1</Typography>
      </Box>
      <Box padding="lg" rounded="md" className="bg-pink-500 flex-1">
        <Typography variant="body" className="text-white font-semibold">Column 2</Typography>
      </Box>
      <Box padding="lg" rounded="md" className="bg-amber-500 flex-1">
        <Typography variant="body" className="text-white font-semibold">Column 3</Typography>
      </Box>
    </HStack>
  ),
};

export const SpaceBetween: Story = {
  args: {
    direction: "horizontal",
    justify: "between",
    align: "center",
    gap: "md",
  },
  render: (args) => (
    <Box className="w-full border border-dashed border-gray-400 p-2">
      <Stack {...args}>
        <ColorBox color="bg-blue-500" label="Start" />
        <ColorBox color="bg-green-500" label="Middle" />
        <ColorBox color="bg-purple-500" label="End" />
      </Stack>
    </Box>
  ),
};

export const WrappingStack: Story = {
  args: {
    direction: "horizontal",
    gap: "sm",
    wrap: true,
  },
  render: (args) => (
    <Box className="max-w-[400px] border border-dashed border-gray-400 p-2">
      <Stack {...args}>
        {Array.from({ length: 8 }, (_, i) => (
          <ColorBox key={i} color="bg-slate-500" label={`Tag ${i + 1}`} />
        ))}
      </Stack>
    </Box>
  ),
};
