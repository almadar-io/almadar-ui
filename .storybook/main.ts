import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";

const config: StorybookConfig = {
  stories: [
    "../components/**/*.stories.@(js|jsx|ts|tsx)",
    "../clients/**/*.stories.@(js|jsx|ts|tsx)",
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
  staticDirs: ["../themes", "../clients/trait-wars/assets"],
  typescript: {
    reactDocgen: false,
  },
  viteFinal: async (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@orbital/shared': path.resolve(__dirname, '../../dist'),
        },
      },
      server: {
        ...config.server,
        fs: {
          strict: false,
          allow: [
            path.resolve(__dirname, '..'),
            path.resolve(__dirname, '../..'),
            path.resolve(__dirname, '../../..'),
          ],
        },
      },
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
