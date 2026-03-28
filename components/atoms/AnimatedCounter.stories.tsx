'use client';

import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnimatedCounter } from "./AnimatedCounter";

const meta: Meta<typeof AnimatedCounter> = {
  title: "Marketing/Atoms/AnimatedCounter",
  component: AnimatedCounter,
  parameters: {
    layout: "centered",
    backgrounds: { default: "wireframe" },
  },
  tags: ["autodocs"],
  argTypes: {
    value: { control: { type: "number" } },
    duration: { control: { type: "number", min: 100, max: 3000, step: 100 } },
    prefix: { control: "text" },
    suffix: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 1234,
  },
};

export const WithPrefix: Story = {
  args: {
    prefix: "$",
    value: 99.99,
  },
};

export const WithSuffix: Story = {
  args: {
    suffix: "%",
    value: 75,
  },
};

function CountingDemo() {
  const [count, setCount] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatedCounter value={count} duration={800} />
      <button
        type="button"
        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
        onClick={() => setCount((prev) => prev + 1000)}
      >
        Add 1000
      </button>
      <span className="text-xs text-muted-foreground">
        Current target: {count}
      </span>
    </div>
  );
}

export const Counting: Story = {
  render: () => <CountingDemo />,
};

export const InContext: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border w-64">
        <div className="text-xs text-muted-foreground">Revenue</div>
        <AnimatedCounter prefix="$" value={12450} />
      </div>
      <div className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border w-64">
        <div className="text-xs text-muted-foreground">Completion</div>
        <AnimatedCounter value={87.5} suffix="%" />
      </div>
    </div>
  ),
};
