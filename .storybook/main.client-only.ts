import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: ['../clients/winning-11/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['../themes'],
  viteFinal: async (config) => {
    const projectRoot = path.resolve(__dirname, '..');

    return {
      ...config,
      // === HMR OPTIMIZATIONS ===
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          'react/jsx-dev-runtime',
          '@storybook/react',
          '@storybook/addon-docs',
          '@storybook/addon-themes',
          '@storybook/addon-links',
          'clsx',
          'class-variance-authority',
        ],
        force: false,
      },
      esbuild: {
        target: 'esnext',
        jsx: 'automatic',
      },
      server: {
        ...config.server,
        watch: {
          ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
          usePolling: false,
        },
        hmr: { overlay: true },
        warmup: {
          clientFiles: ['../clients/**/*.tsx'],
        },
      },
      css: {
        preprocessorOptions: {
          css: { charset: false },
        },
      },
      cacheDir: path.resolve(projectRoot, 'node_modules/.vite-storybook'),
    };
  },
};

export default config;
