'use client';

import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { NumberStepper } from "./NumberStepper";

const meta: Meta<typeof NumberStepper> = {
  title: "Molecules/NumberStepper",
  component: NumberStepper,
  parameters: {
    layout: "centered",
    backgrounds: { default: "wireframe" },
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    min: { control: { type: "number" } },
    max: { control: { type: "number" } },
    step: { control: { type: "number" } },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 1,
    min: 0,
    max: 10,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <NumberStepper value={3} min={0} max={10} size={size} />
          <span className="text-xs text-muted-foreground">{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const AtBounds: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <NumberStepper value={0} min={0} max={10} />
        <span className="text-xs text-muted-foreground">At min (0)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <NumberStepper value={10} min={0} max={10} />
        <span className="text-xs text-muted-foreground">At max (10)</span>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    value: 5,
    disabled: true,
  },
};

export const CustomStep: Story = {
  args: {
    value: 10,
    min: 0,
    max: 100,
    step: 5,
  },
};

function InteractiveStepper() {
  const [val, setVal] = useState(1);
  return (
    <div className="flex items-center gap-4">
      <NumberStepper value={val} onChange={setVal} min={1} max={99} />
      <span className="text-sm text-foreground">Qty: {val}</span>
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveStepper />,
};

export const CartContext: Story = {
  render: () => {
    function CartItem() {
      const [qty, setQty] = useState(2);
      return (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-surface border border-border w-96">
          <div className="w-12 h-12 rounded bg-muted flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate">
              Wireless Headphones
            </div>
            <div className="text-sm text-muted-foreground">$79.99</div>
          </div>
          <NumberStepper value={qty} onChange={setQty} min={1} max={10} size="sm" />
        </div>
      );
    }
    return <CartItem />;
  },
};
