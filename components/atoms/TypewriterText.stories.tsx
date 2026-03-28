import type { Meta, StoryObj } from "@storybook/react-vite";
import { TypewriterText } from "./TypewriterText";

const meta: Meta<typeof TypewriterText> = {
  title: "Core/Atoms/TypewriterText",
  component: TypewriterText,
  parameters: {
    layout: "centered",
    backgrounds: { default: "wireframe" },
  },
  tags: ["autodocs"],
  argTypes: {
    text: { control: "text" },
    speed: { control: { type: "number", min: 10, max: 200, step: 10 } },
    startDelay: { control: { type: "number", min: 0, max: 5000, step: 250 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: "Hello, world!",
  },
};

export const Long: Story = {
  args: {
    text: "This is a longer piece of text that demonstrates the typewriter effect over multiple words and punctuation marks.",
  },
};

export const Fast: Story = {
  args: {
    text: "Speed typing demonstration at 20ms per character.",
    speed: 20,
  },
};

export const WithDelay: Story = {
  args: {
    text: "This text starts after a 1-second delay.",
    startDelay: 1000,
  },
};

export const InContext: Story = {
  render: () => (
    <div className="p-6 rounded-lg bg-surface border border-border w-96">
      <div className="text-xs text-muted-foreground mb-2">AI Response</div>
      <TypewriterText
        text="Based on the analysis, your revenue grew 23% this quarter, driven primarily by the expansion into three new markets."
        speed={30}
      />
    </div>
  ),
};
