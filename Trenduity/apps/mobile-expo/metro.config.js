const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Monorepo 지원: packages 폴더 감시
config.watchFolders = [workspaceRoot];

// node_modules 해석 경로
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// @repo/* 패키지를 소스 경로로 직접 매핑
config.resolver.extraNodeModules = {
  '@repo/ui': path.resolve(workspaceRoot, 'packages/ui/src'),
  '@repo/types': path.resolve(workspaceRoot, 'packages/types/src'),
};

// 소스 확장자 명시 (.tsx 우선)
config.resolver.sourceExts = ['tsx', 'ts', 'jsx', 'js', 'json'];

module.exports = config;
