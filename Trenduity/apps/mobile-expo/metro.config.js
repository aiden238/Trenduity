const path = require('path');

const projectRoot = __dirname;

// mobile-expo가 독립 프로젝트이므로 루트 node_modules 참조 제거
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(projectRoot);

// mobile-expo의 node_modules만 사용 (모노레포 workspaces에서 분리됨)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// 워크스페이스 루트 참조 제거
config.watchFolders = [];

module.exports = config;
