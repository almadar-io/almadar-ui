import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusDot } from "./StatusDot";

const meta: Meta<typeof StatusDot> = {
  title: "Atoms/StatusDot",
  component: StatusDot,
  parameters: {
    layout: "centered",
    backgrounds: { default: "wireframe" },
  },
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["online", "offline", "away", "busy", "warning", "critical"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    pulse: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: "online",
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {(["online", "offline", "away", "busy", "warning", "critical"] as const).map(
        (s) => (
          <div key={s} className="flex items-center gap-2">
            <StatusDot status={s} />
            <span className="text-sm text-[var(--color-foreground)]">{s}</span>
          </div>
        ),
      )}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex items-center gap-2">
          <StatusDot status="online" size={size} />
          <span className="text-sm text-[var(--color-foreground)]">{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const WithPulse: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <StatusDot status="online" pulse />
        <span className="text-sm text-[var(--color-foreground)]">Online (pulse)</span>
      </div>
      <div className="flex items-center gap-2">
        <StatusDot status="critical" pulse />
        <span className="text-sm text-[var(--color-foreground)]">Critical (pulse)</span>
      </div>
      <div className="flex items-center gap-2">
        <StatusDot status="warning" pulse />
        <span className="text-sm text-[var(--color-foreground)]">Warning (pulse)</span>
      </div>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
        <StatusDot status="online" />
        <span className="text-sm font-medium text-[var(--color-foreground)]">Production Server</span>
        <span className="text-xs text-[var(--color-muted-foreground)] ml-auto">Healthy</span>
      </div>
      <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
        <StatusDot status="critical" pulse />
        <span className="text-sm font-medium text-[var(--color-foreground)]">Staging Server</span>
        <span className="text-xs text-[var(--color-muted-foreground)] ml-auto">Down</span>
      </div>
      <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
        <StatusDot status="away" />
        <span className="text-sm font-medium text-[var(--color-foreground)]">Dev Server</span>
        <span className="text-xs text-[var(--color-muted-foreground)] ml-auto">Idle</span>
      </div>
    </div>
  ),
};
