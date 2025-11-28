const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Monorepo: packages 폴더 인식
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// @repo/* 패키지 모듈 해석 (추가)
config.resolver.extraNodeModules = {
  '@repo/ui': path.resolve(workspaceRoot, 'packages/ui/src'),
  '@repo/types': path.resolve(workspaceRoot, 'packages/types/src'),
};

module.exports = config;
