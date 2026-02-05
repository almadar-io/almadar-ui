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

  staticDirs: ["../themes", "../../../projects/trait-wars/assets"],

  typescript: {
    reactDocgen: false,
  },

  viteFinal: async (config) => {
    const projectRoot = path.resolve(__dirname, "..");

    return {
      ...config,
      // === HMR OPTIMIZATIONS ===
      optimizeDeps: {
        // Pre-bundle these heavy dependencies (only done once)
        include: [
          "react",
          "react-dom",
          "react/jsx-runtime",
          "react/jsx-dev-runtime",
          "@storybook/react",
          "@storybook/addon-docs",
          "@storybook/addon-themes",
          "@storybook/addon-links",
          // Pre-bundle common libraries used in components
          "clsx",
          "class-variance-authority",
        ],
        // Force pre-bundling on first run
        force: false,
      },
      // === BUILD OPTIMIZATIONS ===
      esbuild: {
        // Use esbuild for faster transpilation
        target: "esnext",
        // Reduce JSX transform overhead
        jsx: "automatic",
      },
      // === SERVER OPTIMIZATIONS ===
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
        // Reduce file watcher overhead
        watch: {
          // Ignore node_modules (they're pre-bundled)
          ignored: ["**/node_modules/**", "**/dist/**", "**/.git/**"],
          // Use polling only if needed (slower but more compatible)
          usePolling: false,
        },
        // Enable faster HMR
        hmr: {
          overlay: true,
        },
        // Warm up frequently accessed files
        warmup: {
          clientFiles: [
            "../components/**/*.tsx",
            "../clients/**/*.tsx",
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
      // === CACHING ===
      cacheDir: path.resolve(projectRoot, "node_modules/.vite-storybook"),
    };
  }
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
