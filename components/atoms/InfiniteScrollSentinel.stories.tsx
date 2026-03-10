import type { Meta, StoryObj } from "@storybook/react-vite";
import { InfiniteScrollSentinel } from "./InfiniteScrollSentinel";

const meta: Meta<typeof InfiniteScrollSentinel> = {
  title: "Atoms/InfiniteScrollSentinel",
  component: InfiniteScrollSentinel,
  parameters: {
    layout: "centered",
    backgrounds: { default: "wireframe" },
  },
  tags: ["autodocs"],
  argTypes: {
    loadMoreEvent: { control: "text" },
    isLoading: { control: "boolean" },
    hasMore: { control: "boolean" },
    threshold: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    loadMoreEvent: "LOAD_MORE",
  },
};

export const Loading: Story = {
  args: {
    loadMoreEvent: "LOAD_MORE",
    isLoading: true,
  },
};

export const NoMore: Story = {
  args: {
    loadMoreEvent: "LOAD_MORE",
    hasMore: false,
  },
};

export const InContext: Story = {
  render: () => (
    <div className="w-64 max-h-48 overflow-auto border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="p-3 border-b border-[var(--color-border)] text-sm text-[var(--color-foreground)]"
        >
          Item {i + 1}
        </div>
      ))}
      <InfiniteScrollSentinel loadMoreEvent="LOAD_MORE_ITEMS" isLoading />
    </div>
  ),
};
