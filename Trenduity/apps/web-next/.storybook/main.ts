import type { StorybookConfig } from '@storybook/nextjs';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    '../components/**/*.stories.@(js|jsx|ts|tsx)',
    '../app/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y', // 접근성 애드온
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['../public'],
  
  // Webpack 설정
  webpackFinal: async (config) => {
    // 경로 별칭 추가
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, '..'),
        '@/components': path.resolve(__dirname, '../components'),
        '@/app': path.resolve(__dirname, '../app'),
        '@/utils': path.resolve(__dirname, '../utils'),
        '@/hooks': path.resolve(__dirname, '../hooks'),
      };
    }
    
    return config;
  },
};

export default config;
