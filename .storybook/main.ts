import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";
import { fileURLToPath } from "node:url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: [
    "../components/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-themes",
    // addon-docs removed for faster builds - re-enable if needed
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  // CRITICAL: Disable reactDocgen to prevent slow TypeScript parsing
  // This is the #1 cause of slow Storybook builds in monorepos
  typescript: {
    reactDocgen: false,
  },
  staticDirs: [
    "../themes",
  ],
  async viteFinal(config) {
    const { mergeConfig, searchForWorkspaceRoot } = await import("vite");

    const projectRoot = path.resolve(__dirname, "..");
    const workspaceRoot = searchForWorkspaceRoot(projectRoot);

    return mergeConfig(config, {
      resolve: {
        // Important for pnpm monorepos with symlinks
        preserveSymlinks: true,
        // Dedupe these packages to fix version conflicts
        dedupe: [
          "react",
          "react-dom",
        ],
      },
      // Allow access to monorepo workspace files (critical for pnpm)
      server: {
        fs: {
          allow: [
            searchForWorkspaceRoot(projectRoot),
            path.resolve(workspaceRoot, "packages"),
            path.resolve(workspaceRoot, "node_modules"),
          ],
        },
        // Reduce file watcher overhead
        watch: {
          ignored: ["**/node_modules/**", "**/dist/**", "**/.git/**"],
          usePolling: false,
        },
        hmr: {
          overlay: true,
        },
        warmup: {
          clientFiles: [
            "../components/**/*.tsx",
          ],
        },
      },
      // Pre-bundle dependencies for faster startup
      optimizeDeps: {
        include: [
          "react",
          "react-dom",
          "react/jsx-runtime",
          "react/jsx-dev-runtime",
          "clsx",
          "class-variance-authority",
        ],
        force: false,
      },
      esbuild: {
        target: "esnext",
        jsx: "automatic",
      },
      cacheDir: path.resolve(projectRoot, "node_modules/.vite-storybook"),
    });
  },
};

export default config;
