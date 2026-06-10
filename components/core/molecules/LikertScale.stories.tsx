'use client';

import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { LikertScale, DEFAULT_LIKERT_OPTIONS, type LikertOption } from "./LikertScale";

const meta: Meta<typeof LikertScale> = {
  title: "Core/Molecules/LikertScale",
  component: LikertScale,
  parameters: {
    layout: "centered",
    backgrounds: { default: "wireframe" },
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["radios", "buttons"] },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    question: "I find Almadar easy to use.",
    value: 4,
  },
};

export const ButtonsVariant: Story = {
  args: {
    question: "How strongly do you agree?",
    variant: "buttons",
    value: 3,
  },
};

const THREE_POINT_SCALE: LikertOption[] = [
  { value: "disagree", label: "Disagree" },
  { value: "neutral", label: "Neutral" },
  { value: "agree", label: "Agree" },
];

export const CustomScale: Story = {
  args: {
    question: "Rate this 3-point scale:",
    options: THREE_POINT_SCALE,
    value: "agree",
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8 w-[480px]">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">{size}</span>
          <LikertScale
            question="The documentation is clear."
            value={3}
            size={size}
          />
        </div>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    question: "This scale is disabled.",
    value: 2,
    disabled: true,
  },
};

function InteractiveLikert() {
  const [val, setVal] = useState<number | string | null>(null);
  return (
    <div className="flex flex-col gap-4 w-[520px]">
      <LikertScale
        question="I would recommend this product to a friend."
        options={DEFAULT_LIKERT_OPTIONS}
        value={val}
        onChange={setVal}
      />
      <div className="text-sm text-muted-foreground">
        Selected: <span className="font-medium text-foreground">{val ?? "(none)"}</span>
      </div>
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveLikert />,
};
