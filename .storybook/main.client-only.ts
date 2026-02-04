import type { StorybookConfig } from '@storybook/react-vite';

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
