'use client';

import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RangeSlider } from "./RangeSlider";

const meta: Meta<typeof RangeSlider> = {
  title: "Core/Atoms/RangeSlider",
  component: RangeSlider,
  parameters: {
    layout: "centered",
    backgrounds: { default: "wireframe" },
  },
  tags: ["autodocs"],
  argTypes: {
    min: { control: { type: "number" } },
    max: { control: { type: "number" } },
    value: { control: { type: "number" } },
    step: { control: { type: "number" } },
    size: { control: "select", options: ["sm", "md", "lg"] },
    showTooltip: { control: "boolean" },
    showTicks: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50,
    min: 0,
    max: 100,
  },
};

export const WithTooltip: Story = {
  args: {
    value: 30,
    showTooltip: true,
  },
};

export const WithTicks: Story = {
  args: {
    value: 40,
    step: 10,
    showTicks: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="w-80 space-y-6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size}>
          <span className="text-xs text-muted-foreground mb-1 block">{size}</span>
          <RangeSlider value={60} size={size} />
        </div>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    value: 40,
    disabled: true,
  },
};

function InteractiveSlider() {
  const [val, setVal] = useState(50);
  return (
    <div className="w-80 space-y-2">
      <RangeSlider value={val} onChange={setVal} showTooltip />
      <div className="text-sm text-foreground">Value: {val}</div>
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveSlider />,
};

function BufferedSlider() {
  const [val, setVal] = useState(30);
  return (
    <div className="w-80 space-y-2">
      <div className="text-xs text-muted-foreground">Media seek bar (buffered at 70%)</div>
      <RangeSlider
        value={val}
        onChange={setVal}
        buffered={70}
        showTooltip
        formatValue={(v) => {
          const mins = Math.floor(v / 60);
          const secs = v % 60;
          return `${mins}:${String(secs).padStart(2, "0")}`;
        }}
        max={240}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0:00</span>
        <span>4:00</span>
      </div>
    </div>
  );
}

export const MediaSeekBar: Story = {
  render: () => <BufferedSlider />,
};

function PriceFilter() {
  const [val, setVal] = useState(75);
  return (
    <div className="w-80 space-y-2">
      <div className="text-sm font-medium text-foreground">Max Price</div>
      <RangeSlider
        value={val}
        onChange={setVal}
        min={0}
        max={200}
        step={5}
        showTooltip
        showTicks
        formatValue={(v) => `$${v}`}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>$0</span>
        <span>$200</span>
      </div>
    </div>
  );
}

export const PriceFilterExample: Story = {
  render: () => <PriceFilter />,
};
