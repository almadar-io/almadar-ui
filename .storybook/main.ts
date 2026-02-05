// This file has been automatically migrated to valid ESM format by Storybook.
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: [
    "../components/**/*.stories.@(js|jsx|ts|tsx)",
    "../clients/**/*.stories.@(js|jsx|ts|tsx)",
  ],

  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-themes"),
    getAbsolutePath("@storybook/addon-docs")
  ],

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },

  staticDirs: ["../themes", "../clients/trait-wars/assets"],

  typescript: {
    reactDocgen: false,
  },

  viteFinal: async (config) => {
    return {
      ...config,
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
  }
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
