'use client';

import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { StarRating } from "./StarRating";

const meta: Meta<typeof StarRating> = {
  title: "Molecules/StarRating",
  component: StarRating,
  parameters: {
    layout: "centered",
    backgrounds: { default: "wireframe" },
  },
  tags: ["autodocs"],
  argTypes: {
    value: { control: { type: "number", min: 0, max: 5, step: 0.5 } },
    max: { control: { type: "number", min: 1, max: 10 } },
    size: { control: "select", options: ["sm", "md", "lg"] },
    precision: { control: "select", options: ["full", "half"] },
    readOnly: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 3,
  },
};

export const ReadOnly: Story = {
  args: {
    value: 4.5,
    readOnly: true,
    precision: "half",
  },
};

export const HalfStars: Story = {
  args: {
    value: 3.5,
    precision: "half",
    readOnly: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex items-center gap-3">
          <StarRating value={4} readOnly size={size} />
          <span className="text-xs text-[var(--color-muted-foreground)]">{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const Empty: Story = {
  args: {
    value: 0,
    readOnly: true,
  },
};

export const Full: Story = {
  args: {
    value: 5,
    readOnly: true,
  },
};

function InteractiveRating() {
  const [rating, setRating] = useState(0);
  return (
    <div className="space-y-2">
      <StarRating value={rating} onChange={setRating} />
      <div className="text-sm text-[var(--color-foreground)]">
        {rating > 0 ? `You rated: ${rating}/5` : "Click to rate"}
      </div>
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveRating />,
};

function HalfStarInteractive() {
  const [rating, setRating] = useState(0);
  return (
    <div className="space-y-2">
      <StarRating value={rating} onChange={setRating} precision="half" size="lg" />
      <div className="text-sm text-[var(--color-foreground)]">
        {rating > 0 ? `You rated: ${rating}/5` : "Click to rate (half-star precision)"}
      </div>
    </div>
  );
}

export const InteractiveHalfStar: Story = {
  render: () => <HalfStarInteractive />,
};

export const ReviewContext: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex items-center gap-2 mb-2">
          <StarRating value={5} readOnly size="sm" />
          <span className="text-sm font-medium text-[var(--color-foreground)]">5.0</span>
        </div>
        <div className="text-sm text-[var(--color-foreground)]">
          Excellent product! Exceeded my expectations.
        </div>
        <div className="text-xs text-[var(--color-muted-foreground)] mt-2">John D. - 2 days ago</div>
      </div>
      <div className="p-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex items-center gap-2 mb-2">
          <StarRating value={3.5} readOnly size="sm" precision="half" />
          <span className="text-sm font-medium text-[var(--color-foreground)]">3.5</span>
        </div>
        <div className="text-sm text-[var(--color-foreground)]">
          Good quality but shipping took too long.
        </div>
        <div className="text-xs text-[var(--color-muted-foreground)] mt-2">Sarah M. - 1 week ago</div>
      </div>
    </div>
  ),
};
