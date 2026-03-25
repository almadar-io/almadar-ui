import type { Meta, StoryObj } from "@storybook/react-vite";
import { TrendIndicator } from "./TrendIndicator";

const meta: Meta<typeof TrendIndicator> = {
  title: "Atoms/TrendIndicator",
  component: TrendIndicator,
  parameters: {
    layout: "centered",
    backgrounds: { default: "wireframe" },
  },
  tags: ["autodocs"],
  argTypes: {
    value: { control: { type: "number", min: -100, max: 100, step: 0.5 } },
    direction: {
      control: "select",
      options: ["up", "down", "flat", undefined],
    },
    size: { control: "select", options: ["sm", "md", "lg"] },
    showValue: { control: "boolean" },
    invert: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 12.5,
  },
};

export const Positive: Story = {
  args: {
    value: 8.3,
  },
};

export const Negative: Story = {
  args: {
    value: -4.2,
  },
};

export const Flat: Story = {
  args: {
    value: 0,
  },
};

export const Inverted: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-foreground w-24">Error rate:</span>
        <TrendIndicator value={-15.2} invert label="Error rate down 15.2%" />
        <span className="text-xs text-muted-foreground">(down is good)</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-foreground w-24">Bounce rate:</span>
        <TrendIndicator value={3.1} invert label="Bounce rate up 3.1%" />
        <span className="text-xs text-muted-foreground">(up is bad)</span>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex items-center gap-2">
          <TrendIndicator value={12.5} size={size} />
          <span className="text-xs text-muted-foreground">{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const IconOnly: Story = {
  args: {
    value: 5,
    showValue: false,
  },
};

export const InContext: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border w-64">
        <div>
          <div className="text-xs text-muted-foreground">Revenue</div>
          <div className="text-2xl font-bold text-foreground">$12,450</div>
        </div>
        <TrendIndicator value={8.3} />
      </div>
      <div className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border w-64">
        <div>
          <div className="text-xs text-muted-foreground">Users</div>
          <div className="text-2xl font-bold text-foreground">3,241</div>
        </div>
        <TrendIndicator value={-2.1} />
      </div>
      <div className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border w-64">
        <div>
          <div className="text-xs text-muted-foreground">Conversion</div>
          <div className="text-2xl font-bold text-foreground">4.2%</div>
        </div>
        <TrendIndicator value={0} />
      </div>
    </div>
  ),
};
