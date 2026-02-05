import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";

// Get client name from environment variable
const clientName = process.env.STORYBOOK_CLIENT || "kflow";

const config: StorybookConfig = {
  stories: [
    // Only include stories from the specified client
    `../clients/${clientName}/**/*.stories.@(js|jsx|ts|tsx)`,
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-themes",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  staticDirs: ["../themes"],
  viteFinal: async (config) => {
    return {
      ...config,
      css: {
        preprocessorOptions: {
          css: {
            charset: false,
          },
        },
      },
    };
  },
};

export default config;
