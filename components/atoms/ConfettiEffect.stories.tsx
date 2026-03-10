'use client';

import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConfettiEffect } from "./ConfettiEffect";

const meta: Meta<typeof ConfettiEffect> = {
  title: "Atoms/ConfettiEffect",
  component: ConfettiEffect,
  parameters: {
    layout: "centered",
    backgrounds: { default: "wireframe" },
  },
  tags: ["autodocs"],
  argTypes: {
    trigger: { control: "boolean" },
    duration: { control: { type: "number", min: 500, max: 5000, step: 250 } },
    particleCount: { control: { type: "number", min: 5, max: 100, step: 5 } },
  },
  decorators: [
    (Story) => (
      <div className="relative w-80 h-48 flex items-center justify-center border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: true,
    particleCount: 30,
    duration: 2000,
  },
};

function InteractiveConfetti() {
  const [trigger, setTrigger] = useState(false);

  const handleClick = () => {
    setTrigger(false);
    // Need a tick so the effect detects the false-to-true transition
    requestAnimationFrame(() => {
      setTrigger(true);
    });
  };

  return (
    <div className="relative w-80 h-48 flex items-center justify-center">
      <ConfettiEffect trigger={trigger} />
      <button
        type="button"
        className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-sm font-medium"
        onClick={handleClick}
      >
        Celebrate!
      </button>
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveConfetti />,
  decorators: [],
};
